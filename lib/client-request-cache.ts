export function createTimedRequestCache<T>(load: () => Promise<T>, ttlMs = 15000) {
  let inFlightRequest: Promise<T> | null = null
  let cachedValue: { data: T; expiresAt: number } | null = null

  return function getCachedValue() {
    if (cachedValue && cachedValue.expiresAt > Date.now()) return Promise.resolve(cachedValue.data)
    if (!inFlightRequest) {
      inFlightRequest = load().then((data) => {
        cachedValue = { data, expiresAt: Date.now() + ttlMs }
        return data
      }).finally(() => { inFlightRequest = null })
    }
    return inFlightRequest
  }
}
