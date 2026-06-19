export function validateApiKey(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  return provided.trim() === expected.trim()
}
