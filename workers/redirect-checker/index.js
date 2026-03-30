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

    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: corsHeaders })
    }

    const rawUrl = new URL(request.url).searchParams.get('url')
    if (!rawUrl) {
      return Response.json({ error: 'Missing url parameter' }, { status: 400, headers: corsHeaders })
    }

    let parsedUrl
    try {
      parsedUrl = new URL(rawUrl)
    } catch {
      return Response.json({ error: 'Invalid url parameter' }, { status: 400, headers: corsHeaders })
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return Response.json({ error: 'Only http and https URLs are supported' }, { status: 400, headers: corsHeaders })
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
