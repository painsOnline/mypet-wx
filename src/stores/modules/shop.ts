import { ref } from 'vue'
import type { ShopDetail } from '@/types/home'
import { getShopDetailAPI } from '@/services/home'

const SHOP_CACHE_KEY = 'shop_detail_cache'
const SHOP_CACHE_EXPIRY = 24 * 60 * 60 * 1000

const shopData = ref<ShopDetail | null>(null)
const loaded = ref(false)

function getCached(): ShopDetail | null {
  try {
    const cached = uni.getStorageSync(SHOP_CACHE_KEY)
    if (cached?.data && (Date.now() - cached.time < SHOP_CACHE_EXPIRY)) {
      const data = cached.data
      // Normalize: support both snake_case (old) and camelCase (new)
      if (data.freeShippingAmount == null && data.free_shipping_amount != null) {
        data.freeShippingAmount = data.free_shipping_amount
      }
      return data as ShopDetail
    }
  } catch { /* ignore */ }
  return null
}

function setCache(data: ShopDetail) {
  uni.setStorageSync(SHOP_CACHE_KEY, { data, time: Date.now() })
}

async function fetchShop() {
  if (loaded.value) return shopData.value
  // Try cache first
  const cached = getCached()
  if (cached) {
    shopData.value = cached
    loaded.value = true
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
  loaded.value = true
  return shopData.value
}

export const useShopStore = () => {
  return { shopData, fetchShop, loaded }
}
