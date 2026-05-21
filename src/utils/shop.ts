/**
 * Append shop={shopCode} query parameter to page URLs.
 * Reads the current shop code from local storage.
 */
export function appendShopParam(url: string): string {
  const shopCode = uni.getStorageSync('shopCode') || ''
  if (!shopCode) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}shop=${encodeURIComponent(shopCode)}`
}

/**
 * Get current shop code from local storage.
 */
export function getShopCode(): string {
  return uni.getStorageSync('shopCode') || ''
}
