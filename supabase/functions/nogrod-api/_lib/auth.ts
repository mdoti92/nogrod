export function validateApiKey(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  return provided.trim() === expected.trim()
}

export function extractApiKey(headers: Headers, searchParams: URLSearchParams): string | null {
  return headers.get('X-Api-Key') ?? searchParams.get('api_key')
}
