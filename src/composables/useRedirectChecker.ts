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
