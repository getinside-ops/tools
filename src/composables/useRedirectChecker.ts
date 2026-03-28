export interface RedirectResult {
  inputUrl: string
  finalUrl: string
  redirected: boolean
}

export async function checkRedirect(inputUrl: string): Promise<RedirectResult> {
  const normalized = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalized)}`

  const response = await fetch(proxyUrl)
  if (!response.ok) throw new Error(`Proxy error: ${response.status}`)

  const data = await response.json() as { status: { url: string } }
  const finalUrl = data.status?.url ?? normalized

  return {
    inputUrl: normalized,
    finalUrl,
    redirected: finalUrl !== normalized,
  }
}
