# Redirect Checker — Full Chain Tracing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-hop allorigins.win proxy with a Cloudflare Worker that traces every redirect hop, returning the full chain with status codes; update the composable, tests, and view accordingly.

**Architecture:** A Cloudflare Worker (`workers/redirect-checker/`) follows redirects manually using `fetch` with `redirect: 'manual'`, recording each hop's URL and status code. The composable calls this worker via `VITE_REDIRECT_API_URL`. The view renders a chain with per-row copy buttons and color-coded status badges.

**Tech Stack:** Cloudflare Workers (ES modules), Wrangler CLI, Vue 3 + vue-i18n v9, Vitest, TypeScript.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `workers/redirect-checker/index.js` | Create | Cloudflare Worker: hop-by-hop redirect tracing |
| `workers/redirect-checker/wrangler.toml` | Create | Wrangler deployment config |
| `src/composables/__tests__/useRedirectChecker.test.ts` | Create | 5 unit tests (TDD first) |
| `src/composables/useRedirectChecker.ts` | Update | New interface + Worker call |
| `src/i18n/fr.ts` | Update | Add copy/copied/hopsCount/tooManyRedirects, remove from/to |
| `src/i18n/en.ts` | Update | Same as fr.ts |
| `src/views/RedirectCheckerView.vue` | Update | Chain display + copy buttons + status badges |

---

## Task 1: Cloudflare Worker

**Files:**
- Create: `workers/redirect-checker/index.js`
- Create: `workers/redirect-checker/wrangler.toml`

- [ ] **Step 1: Create the worker directory and wrangler config**

Create `workers/redirect-checker/wrangler.toml`:
```toml
name = "gi-redirect-checker"
main = "index.js"
compatibility_date = "2025-01-01"
```

- [ ] **Step 2: Write the worker**

Create `workers/redirect-checker/index.js`:
```js
const ALLOWED_ORIGINS = [
  'https://getinside-ops.github.io',
  'http://localhost:5173',
]
const MAX_HOPS = 15

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || ''
    const corsHeaders = ALLOWED_ORIGINS.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Vary': 'Origin',
        }
      : {}

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const rawUrl = new URL(request.url).searchParams.get('url')
    if (!rawUrl) {
      return Response.json({ error: 'Missing url parameter' }, { status: 400, headers: corsHeaders })
    }

    const hops = []
    let currentUrl = rawUrl

    try {
      for (let i = 0; i < MAX_HOPS; i++) {
        const res = await fetch(currentUrl, { redirect: 'manual' })
        hops.push({ url: currentUrl, status: res.status })

        if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get('Location')
          if (!location) break
          currentUrl = new URL(location, currentUrl).href
        } else {
          break
        }
      }
    } catch {
      if (hops.length === 0) {
        return Response.json({ error: 'Failed to fetch URL' }, { status: 500, headers: corsHeaders })
      }
    }

    return Response.json({ hops }, { headers: corsHeaders })
  },
}
```

- [ ] **Step 3: Install Wrangler globally (if not already installed) and test the worker locally**

```bash
npm install -g wrangler
cd "workers/redirect-checker"
wrangler dev
```

In a second terminal, verify the worker responds:
```bash
curl "http://localhost:8787/?url=https://httpbin.org/redirect/2"
```

Expected: JSON with `hops` array showing 3 entries (2 redirects + final 200). Example:
```json
{
  "hops": [
    { "url": "https://httpbin.org/redirect/2", "status": 302 },
    { "url": "https://httpbin.org/redirect/1", "status": 302 },
    { "url": "https://httpbin.org/get", "status": 200 }
  ]
}
```

- [ ] **Step 4: Test no-redirect case**

```bash
curl "http://localhost:8787/?url=https://httpbin.org/get"
```

Expected:
```json
{ "hops": [{ "url": "https://httpbin.org/get", "status": 200 }] }
```

- [ ] **Step 5: Test missing url param**

```bash
curl "http://localhost:8787/"
```

Expected: `{"error":"Missing url parameter"}` with status 400.

- [ ] **Step 6: Commit the worker**

```bash
cd ../..
git add workers/
git commit -m "feat: add Cloudflare Worker for redirect chain tracing"
```

---

## Task 2: Composable Tests (TDD — write failing tests first)

**Files:**
- Create: `src/composables/__tests__/useRedirectChecker.test.ts`

- [ ] **Step 1: Write the test file**

Create `src/composables/__tests__/useRedirectChecker.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRedirect } from '../useRedirectChecker'

vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')

describe('checkRedirect', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns full hop chain when redirects occur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hops: [
          { url: 'https://short.ly/abc', status: 301 },
          { url: 'https://example.com/', status: 200 },
        ],
      }),
    }))

    const result = await checkRedirect('https://short.ly/abc')

    expect(result.redirected).toBe(true)
    expect(result.hops).toHaveLength(2)
    expect(result.hops[0]).toEqual({ url: 'https://short.ly/abc', status: 301 })
    expect(result.hops[1]).toEqual({ url: 'https://example.com/', status: 200 })
    expect(result.finalUrl).toBe('https://example.com/')
    expect(result.inputUrl).toBe('https://short.ly/abc')
  })

  it('returns redirected: false when no redirect', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hops: [{ url: 'https://example.com/', status: 200 }],
      }),
    }))

    const result = await checkRedirect('https://example.com/')

    expect(result.redirected).toBe(false)
    expect(result.hops).toHaveLength(1)
    expect(result.finalUrl).toBe('https://example.com/')
  })

  it('normalizes URL without protocol', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops: [{ url: 'https://example.com', status: 200 }] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await checkRedirect('example.com')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://example.com')),
    )
  })

  it('throws on API error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(checkRedirect('https://example.com')).rejects.toThrow('API error: 500')
  })

  it('handles 15-hop chain', async () => {
    const hops = Array.from({ length: 15 }, (_, i) => ({
      url: `https://example.com/hop-${i}`,
      status: i < 14 ? 301 : 200,
    }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops }),
    }))

    const result = await checkRedirect('https://example.com/hop-0')

    expect(result.hops).toHaveLength(15)
    expect(result.redirected).toBe(true)
    expect(result.finalUrl).toBe('https://example.com/hop-14')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- useRedirectChecker
```

Expected output: 5 test failures. The errors will say things like "Property 'hops' does not exist on type 'RedirectResult'" — that's correct, the composable hasn't been updated yet.

---

## Task 3: Update Composable

**Files:**
- Modify: `src/composables/useRedirectChecker.ts`

- [ ] **Step 1: Replace the composable with the new implementation**

Overwrite `src/composables/useRedirectChecker.ts` entirely:
```ts
export interface RedirectHop {
  url: string
  status: number
}

export interface RedirectResult {
  inputUrl: string
  finalUrl: string
  hops: RedirectHop[]
  redirected: boolean
}

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

- [ ] **Step 2: Run tests to verify all 5 pass**

```bash
npm test -- useRedirectChecker
```

Expected output:
```
✓ returns full hop chain when redirects occur
✓ returns redirected: false when no redirect
✓ normalizes URL without protocol
✓ throws on API error response
✓ handles 15-hop chain

Test Files  1 passed (1)
Tests       5 passed (5)
```

- [ ] **Step 3: Run full test suite to check nothing is broken**

```bash
npm test
```

Expected: all previously passing tests still pass (≥42 tests total, now 47).

- [ ] **Step 4: Commit**

```bash
git add src/composables/useRedirectChecker.ts src/composables/__tests__/useRedirectChecker.test.ts
git commit -m "feat: update redirect checker composable to use Cloudflare Worker with hop chain"
```

---

## Task 4: Update i18n

**Files:**
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: Update `src/i18n/fr.ts`**

In the `redirectChecker` section, remove `from` and `to`, add four new keys. The section should look like:
```ts
redirectChecker: {
  title: 'Redirect Checker',
  desc: 'Découvrez vers quelle URL finale pointe une adresse après ses redirections.',
  label: 'URL à vérifier',
  check: 'Vérifier',
  checking: 'Vérification…',
  noRedirect: 'Aucune redirection — cette URL pointe directement vers sa destination.',
  fallbackTitle: 'Impossible de vérifier via le navigateur',
  fallbackDesc: 'Utilisez cette commande dans votre terminal :',
  copy: 'Copier',
  copied: 'Copié !',
  hopsCount: '{n} redirection(s)',
  tooManyRedirects: 'Boucle de redirection ou chaîne trop longue (15 sauts max).',
},
```

- [ ] **Step 2: Update `src/i18n/en.ts`**

Same structure — `en.ts` imports `type Messages` from `fr.ts` for type safety, so TypeScript will flag any mismatch. The section should look like:
```ts
redirectChecker: {
  title: 'Redirect Checker',
  desc: 'Find out which final URL a link points to after its redirects.',
  label: 'URL to check',
  check: 'Check',
  checking: 'Checking…',
  noRedirect: 'No redirect — this URL points directly to its destination.',
  fallbackTitle: 'Cannot check via browser',
  fallbackDesc: 'Use this command in your terminal:',
  copy: 'Copy',
  copied: 'Copied!',
  hopsCount: '{n} redirect(s)',
  tooManyRedirects: 'Redirect loop or chain too long (15 hops max).',
},
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npm run build
```

Expected: build completes with no type errors. If TypeScript complains about missing keys in `en.ts`, it means `from`/`to` removal or new keys don't match between files — fix any mismatch.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: update redirect checker i18n keys for chain display"
```

---

## Task 5: Update the View

**Files:**
- Modify: `src/views/RedirectCheckerView.vue`

- [ ] **Step 1: Replace the view with the chain display**

Overwrite `src/views/RedirectCheckerView.vue` entirely:
```vue
<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    <div class="gi-tool-header">
      <h1>{{ t('redirectChecker.title') }}</h1>
      <p>{{ t('redirectChecker.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('redirectChecker.label') }}</label>
      <input
        v-model="inputUrl"
        type="text"
        placeholder="https://example.com/link"
        class="gi-input"
        @keydown.enter="check"
      />
    </div>
    <button class="gi-btn" :disabled="loading || !inputUrl" @click="check">
      {{ loading ? t('redirectChecker.checking') : t('redirectChecker.check') }}
    </button>

    <div v-if="result" class="gi-result" style="margin-top:1.5rem">
      <p v-if="!result.redirected" class="gi-no-redirect">{{ t('redirectChecker.noRedirect') }}</p>
      <div v-else class="gi-hops-meta">
        {{ t('redirectChecker.hopsCount', { n: result.hops.length - 1 }) }}
        <span v-if="result.hops.length >= 15" class="gi-too-many">
          {{ t('redirectChecker.tooManyRedirects') }}
        </span>
      </div>
      <div class="gi-chain">
        <div v-for="(hop, i) in result.hops" :key="i" class="gi-chain-item">
          <div class="gi-chain-row">
            <span class="gi-status-badge" :class="statusClass(hop.status)">{{ hop.status }}</span>
            <span class="gi-code gi-chain-url">{{ hop.url }}</span>
            <button class="gi-btn-ghost gi-copy-btn" @click="copyUrl(hop.url, i)">
              {{ copiedIndex === i ? t('redirectChecker.copied') : t('redirectChecker.copy') }}
            </button>
          </div>
          <div v-if="i < result.hops.length - 1" class="gi-arrow">↓</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="gi-result" style="border-color: var(--gi-tint-red-border); margin-top:1.5rem">
      <div class="gi-result-label" style="color:var(--gi-tint-red-text)">{{ t('redirectChecker.fallbackTitle') }}</div>
      <p style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--gi-text-muted)">{{ t('redirectChecker.fallbackDesc') }}</p>
      <code class="gi-code">curl -IL {{ inputUrl }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { checkRedirect, type RedirectResult } from '../composables/useRedirectChecker'

const { t } = useI18n()
const inputUrl = ref('')
const loading = ref(false)
const result = ref<RedirectResult | null>(null)
const error = ref(false)
const copiedIndex = ref<number | null>(null)

async function check() {
  if (!inputUrl.value) return
  loading.value = true
  result.value = null
  error.value = false
  copiedIndex.value = null
  try {
    result.value = await checkRedirect(inputUrl.value)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'gi-status-2xx'
  if (status === 301 || status === 308) return 'gi-status-3xx-perm'
  if (status === 302 || status === 307) return 'gi-status-3xx-temp'
  if (status >= 400) return 'gi-status-err'
  return ''
}

async function copyUrl(url: string, index: number) {
  await navigator.clipboard.writeText(url)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = null }, 1500)
}
</script>

<style scoped>
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }

.gi-hops-meta {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.gi-too-many {
  color: var(--gi-tint-yellow-text);
  font-weight: 600;
}
.gi-no-redirect {
  color: var(--gi-text-muted);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.gi-chain { display: flex; flex-direction: column; }
.gi-chain-item { display: flex; flex-direction: column; }
.gi-chain-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
}
.gi-chain-url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
}
.gi-arrow { font-size: 1.1rem; color: var(--gi-brand); padding: 0.1rem 0; }

/* Status badges */
.gi-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.gi-status-2xx   { background: var(--gi-tint-green-bg);  color: var(--gi-tint-green-text); }
.gi-status-3xx-perm { background: color-mix(in srgb, var(--gi-brand) 15%, transparent); color: var(--gi-brand); }
.gi-status-3xx-temp { background: var(--gi-tint-yellow-bg); color: var(--gi-tint-yellow-text); }
.gi-status-err   { background: var(--gi-tint-red-bg);    color: var(--gi-tint-red-text); }

/* Copy button */
.gi-copy-btn {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 2: Start the dev server and manually test**

In `.env.local` (create if it doesn't exist), add:
```
VITE_REDIRECT_API_URL=http://localhost:8787
```

Make sure `wrangler dev` is still running in `workers/redirect-checker/`, then:
```bash
npm run dev
```

Open `http://localhost:5173/tools/#/redirect-checker`. Test:
1. Enter `https://httpbin.org/redirect/2` → should show 3 hops with status codes 302, 302, 200
2. Enter `https://httpbin.org/get` → should show "No redirect" message with 1 hop (200)
3. Click each copy button → URL should copy to clipboard, button should flash "Copied!"
4. Switch language (FR/EN) → labels should switch

- [ ] **Step 3: Run full test suite one more time**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/views/RedirectCheckerView.vue
git commit -m "feat: update redirect checker view with chain display and per-row copy buttons"
```

---

## Task 6: Deploy Worker + Wire Up Production Env Var

- [ ] **Step 1: Deploy the worker to Cloudflare**

From `workers/redirect-checker/`:
```bash
wrangler login    # opens browser for Cloudflare account auth (free account, no credit card)
wrangler deploy
```

Expected output includes the worker URL, e.g.:
```
Published gi-redirect-checker (0.00 sec)
  https://gi-redirect-checker.<your-account>.workers.dev
```

Copy that URL.

- [ ] **Step 2: Add the worker URL as a GitHub Actions secret**

Go to `https://github.com/getinside-ops/tools/settings/secrets/actions` and add:
- Name: `VITE_REDIRECT_API_URL`
- Value: `https://gi-redirect-checker.<your-account>.workers.dev`

- [ ] **Step 3: Add the secret to the build step in `.github/workflows/deploy.yml`**

Find the `npm run build` step and add the env var. It should look like:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_REDIRECT_API_URL: ${{ secrets.VITE_REDIRECT_API_URL }}
```

- [ ] **Step 4: Push to main and verify deployment**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: inject VITE_REDIRECT_API_URL secret into build"
git push
```

Watch the Actions tab on GitHub. Once deployed, open `https://getinside-ops.github.io/tools/#/redirect-checker` and test with a real redirecting URL.

---

## Verification Checklist

- [ ] `curl "http://localhost:8787/?url=https://httpbin.org/redirect/3"` returns 4 hops
- [ ] `npm test` passes with 47+ tests (5 new for redirect checker)
- [ ] Dev server shows full chain with status badges and copy buttons
- [ ] FR/EN language toggle updates all labels in the chain view
- [ ] GitHub Actions build succeeds with `VITE_REDIRECT_API_URL` injected
- [ ] Production URL shows full chain
