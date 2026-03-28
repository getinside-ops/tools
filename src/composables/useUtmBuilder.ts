export interface UtmParams {
  url: string
  source: string
  medium: string
  campaign: string
  content?: string
  term?: string
}

export function buildUtmUrl(params: UtmParams): string {
  const url = new URL(params.url)
  url.searchParams.set('utm_source', params.source)
  url.searchParams.set('utm_medium', params.medium)
  url.searchParams.set('utm_campaign', params.campaign)
  if (params.content) url.searchParams.set('utm_content', params.content)
  if (params.term) url.searchParams.set('utm_term', params.term)
  return url.toString()
}
