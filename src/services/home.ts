import type { BannerItem, HotItem, HotListParams, ShopDetail } from '@/types/home'
import type { PageResult } from '@/types/global'
import { http } from '@/utils/http'

/**
 * 首页-广告区域-小程序（废弃，请用 getShopDetailAPI）
 */
export const getHomeBannerAPI = async (distributionSite = 1) => {
  return http<BannerItem[]>({
    url: '/frontend/home/banner',
    method: 'GET',
    data: { distributionSite },
  })
}

/**
 * 获取店铺详情（含banner、logo、免运费门槛）
 */
export const getShopDetailAPI = async () => {
  return http<ShopDetail>({
    url: '/frontend/shop/detail',
    method: 'GET',
  })
}

/**
 * 首页-热门推荐-小程序（分页）
 * @param data 分页参数
 */
export const getHomeHotAPI = async (data: HotListParams = {}) => {
  return http<PageResult<HotItem>>({
    url: '/frontend/home/hot',
    method: 'GET',
    data,
  })
}
