# Redirect Checker — Full Chain Tracing

**Date:** 2026-03-30
**Status:** Approved

---

## Context

The current redirect checker (`useRedirectChecker.ts`) uses the `allorigins.win` CORS proxy, which follows all redirects silently and only returns the final URL. Users cannot see intermediate hops or their HTTP status codes (301, 302, 307, 308), which limits the tool's diagnostic value.

This spec upgrades the tool to show the full redirect chain — every hop with its URL, status code, and a per-row copy button — using a Cloudflare Worker as a lightweight hop-tracing backend.

---

## Architecture

Three components:

1. **Cloudflare Worker** (`workers/redirect-checker/index.js`)
2. **Updated composable** (`src/composables/useRedirectChecker.ts`)
3. **Updated view** (`src/views/RedirectCheckerView.vue`) + tests + i18n

---

## Cloudflare Worker

**Endpoint:** `GET /?url=https://example.com/link`

**Behaviour:**
- Fetch `url` with `redirect: 'manual'` to capture each hop without auto-following
- On a 3xx response: record `{ url, status }`, read `Location` header, repeat
- On a non-3xx response: record final hop, stop
- Cap at 15 hops to prevent infinite redirect loops
- Return `{ hops: [{ url, status }, ...] }`

**CORS:** Allow `https://getinside-ops.github.io` and `http://localhost:5173` only.

**Error responses:**
- `400` — missing or invalid `url` param
- `500` — fetch failure on first hop

**Deployment:** Cloudflare Workers free tier (no credit card, 100k req/day). One-time setup: create Cloudflare account → `wrangler deploy`. Worker URL stored as `VITE_REDIRECT_API_URL` env var.

---

## Data Structures

```ts
// composable types
interface RedirectHop {
  url: string
  status: number
}

interface RedirectResult {
  inputUrl: string      // normalized input (https:// prepended if missing)
  finalUrl: string      // last hop's url
  hops: RedirectHop[]  // full chain including final destination
  redirected: boolean  // hops.length > 1
}
```

Worker JSON response:
```json
{
  "hops": [
    { "url": "https://short.ly/abc", "status": 301 },
    { "url": "https://example.com/redirect", "status": 302 },
    { "url": "https://www.example.com/final", "status": 200 }
  ]
}
```

---

## Composable (`useRedirectChecker.ts`)

Replaces the allorigins.win call with a call to `import.meta.env.VITE_REDIRECT_API_URL`.

```ts
export async function checkRedirect(inputUrl: string): Promise<RedirectResult> {
  const normalized = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`
  const apiUrl = import.meta.env.VITE_REDIRECT_API_URL
  const res = await fetch(`${apiUrl}?url=${encodeURIComponent(normalized)}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const { hops } = await res.json() as { hops: RedirectHop[] }
  return {
    inputUrl: normalized,
    finalUrl: hops.at(-1)!.url,
    hops,
    redirected: hops.length > 1,
  }
}
```

---

## View UX

Each hop rendered as a chain row:

```
[301]  https://short.ly/abc              [copy]
  ↓
[302]  https://example.com/redirect      [copy]
  ↓
[200]  https://www.example.com/final     [copy]
```

**Status badge colours:**
- 301, 308 (permanent redirect) → brand teal (`--gi-brand`)
- 302, 307 (temporary redirect) → yellow (`--gi-tint-yellow-text`)
- 200–299 → green (`--gi-status-ok` / `--gi-tint-green-text`)
- 4xx, 5xx → red (`--gi-tint-red-text`)

**Copy button:** one per row. On click: copies the hop URL to clipboard, shows "Copied!" for 1.5s, then resets. Uses `navigator.clipboard.writeText`.

**Special cases:**
- 1 hop (no redirect): show "No redirect — this URL points directly to its destination."
- 15 hops hit: show a warning banner "Redirect loop or chain too long (15 hops max)."
- Error: show existing curl fallback panel.

---

## i18n Keys

New keys to add to `fr.ts` and `en.ts` under `redirectChecker`:

| Key | FR | EN |
|-----|----|----|
| `copy` | `Copier` | `Copy` |
| `copied` | `Copié !` | `Copied!` |
| `hopsCount` | `{n} redirection(s)` | `{n} redirect(s)` |
| `tooManyRedirects` | `Boucle de redirection ou chaîne trop longue (15 sauts max).` | `Redirect loop or chain too long (15 hops max).` |

Remove: `from`, `to` (replaced by the chain display).

---

## Tests (`src/composables/__tests__/useRedirectChecker.test.ts`)

Mock global `fetch` with `vi.fn()`. Cover:

1. **Multi-hop chain** — mock returns `{ hops: [{url, status: 301}, {url, status: 200}] }` → `redirected: true`, correct `finalUrl`, 2 hops
2. **No redirect** — mock returns `{ hops: [{url, status: 200}] }` → `redirected: false`, `finalUrl === inputUrl`
3. **URL normalization** — input `example.com` → normalized to `https://example.com`
4. **API error** — mock returns `ok: false, status: 500` → throws
5. **15-hop cap** — mock returns 15 hops → `hops.length === 15`

---

## Environment Variables

| Var | Local dev | Production |
|-----|-----------|------------|
| `VITE_REDIRECT_API_URL` | `http://localhost:8787` (wrangler dev) | Worker URL (GitHub Actions secret) |

Add to `.env.local` (gitignored) for local dev. Add as GitHub Actions secret for CI build.

---

## Files Changed

| File | Change |
|------|--------|
| `workers/redirect-checker/index.js` | **New** — Cloudflare Worker |
| `workers/redirect-checker/wrangler.toml` | **New** — Wrangler config |
| `src/composables/useRedirectChecker.ts` | **Update** — new interface + Worker call |
| `src/composables/__tests__/useRedirectChecker.test.ts` | **New** — 5 test cases |
| `src/views/RedirectCheckerView.vue` | **Update** — chain display + copy buttons |
| `src/i18n/fr.ts` | **Update** — new/removed keys |
| `src/i18n/en.ts` | **Update** — new/removed keys |

---

## Verification

1. `wrangler dev` in `workers/redirect-checker/` → `curl "http://localhost:8787/?url=https://short.ly/abc"` returns hop array
2. `npm run dev` with `VITE_REDIRECT_API_URL=http://localhost:8787` in `.env.local` → UI shows full chain
3. `npm test` → all 5 new tests pass, total test count increases from 42
4. Deploy worker → update env var → `npm run build` → verify on GitHub Pages
