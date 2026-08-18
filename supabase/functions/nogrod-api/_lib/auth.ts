// Manual constant-time comparison: Deno's runtime has no crypto.timingSafeEqual,
// so we compare every byte via XOR-accumulation to avoid leaking the match
// position through a `===` short-circuit (timing side-channel).
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  if (aBytes.length !== bBytes.length) return false

  let mismatch = 0
  for (let i = 0; i < aBytes.length; i++) {
    mismatch |= aBytes[i] ^ bBytes[i]
  }
  return mismatch === 0
}

export function validateApiKey(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  return timingSafeEqual(provided.trim(), expected.trim())
}

export function extractApiKey(headers: Headers, searchParams: URLSearchParams): string | null {
  return headers.get('X-Api-Key') ?? searchParams.get('api_key')
}
