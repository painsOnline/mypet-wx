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

/**
 * Switch to a different shop. Clears all local caches (login, cart, shop data)
 * if the new shop differs from the current one.
 * Returns true if caches were cleared (shop changed), false if same shop.
 */
export function switchToShop(newShopCode: string): boolean {
  const oldShopCode = uni.getStorageSync('shopCode') || ''
  if (newShopCode === oldShopCode) return false

  // Clear all shop-related local caches
  const keys = uni.getStorageInfoSync().keys
  for (const key of keys) {
    // Clear Pinia-persisted stores (member, cart)
    if (key === 'member' || key === 'cart') {
      uni.removeStorageSync(key)
    }
    // Clear shop detail caches for any shop
    if (key.startsWith('shop_detail_cache_')) {
      uni.removeStorageSync(key)
    }
  }

  // Set new shop code
  uni.setStorageSync('shopCode', newShopCode)
  return true
}
