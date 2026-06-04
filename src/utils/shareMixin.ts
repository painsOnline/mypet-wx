import { getShopCode } from './shop'

function getShopName(): string {
  const shopCode = getShopCode()
  if (!shopCode) return '鑫钱猫宠物用品'
  try {
    const cacheKey = 'shop_detail_cache_' + shopCode
    const cached = uni.getStorageSync(cacheKey)
    if (cached?.data?.name) return cached.data.name
  } catch { /* ignore */ }
  return shopCode
}

/**
 * 全局分享 mixin — 所有页面统一分享当前店铺首页。
 * 页面可通过定义自己的 onShareAppMessage / onShareTimeline 覆盖。
 */
export const shareMixin = {
  onShareAppMessage() {
    const shopCode = getShopCode()
    const path = shopCode
      ? `/pages/index/index?shop=${encodeURIComponent(shopCode)}`
      : '/pages/index/index'
    return {
      title: `鑫钱猫宠物用品-${getShopName()}`,
      path,
    }
  },
  onShareTimeline() {
    return {
      title: `鑫钱猫宠物用品-${getShopName()}`,
    }
  },
}
