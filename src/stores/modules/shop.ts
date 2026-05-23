import { ref } from 'vue'
import type { ShopDetail } from '@/types/home'
import { getShopDetailAPI } from '@/services/home'

const SHOP_CACHE_EXPIRY = 24 * 60 * 60 * 1000

const shopData = ref<ShopDetail | null>(null)
let lastShopCode = ''

function cacheKey(): string {
  const code = uni.getStorageSync('shopCode') || 'default'
  return 'shop_detail_cache_' + code
}

function getCached(): ShopDetail | null {
  try {
    const cached = uni.getStorageSync(cacheKey())
    if (cached?.data && (Date.now() - cached.time < SHOP_CACHE_EXPIRY)) {
      const data = cached.data
      if (data.freeShippingAmount == null && data.free_shipping_amount != null) {
        data.freeShippingAmount = data.free_shipping_amount
      }
      return data as ShopDetail
    }
  } catch { /* ignore */ }
  return null
}

function setCache(data: ShopDetail) {
  uni.setStorageSync(cacheKey(), { data, time: Date.now() })
}

async function fetchShop() {
  const currentCode = uni.getStorageSync('shopCode') || ''
  // No shop selected yet — don't fetch
  if (!currentCode) return null
  // Shop changed → reset and re-fetch
  if (currentCode !== lastShopCode) {
    shopData.value = null
    lastShopCode = currentCode
  }
  // Already loaded for this shop
  if (shopData.value) return shopData.value
  // Try cache
  const cached = getCached()
  if (cached) {
    shopData.value = cached
    return cached
  }
  // Fetch from API
  try {
    const res = await getShopDetailAPI()
    if (res.result) {
      const data = res.result as any
      if (data.freeShippingAmount == null && data.free_shipping_amount != null) {
        data.freeShippingAmount = data.free_shipping_amount
      }
      shopData.value = data
      setCache(data)
    }
  } catch { /* ignore */ }
  return shopData.value
}

export const useShopStore = () => {
  return { shopData, fetchShop }
}
