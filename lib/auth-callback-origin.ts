const canonicalOrigin = "https://kopikarawang.my.id"
const localHosts = new Set(["localhost", "127.0.0.1", "::1"])

export function authCallbackOrigin(requestUrl: URL) {
  return localHosts.has(requestUrl.hostname) ? requestUrl.origin : canonicalOrigin
}
