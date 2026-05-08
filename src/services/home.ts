import type { BannerItem, HotItem, HotListParams } from '@/types/home'
import type { PageResult } from '@/types/global'
import { http } from '@/utils/http'

/**
 * 首页-广告区域-小程序
 * @param distributionSite 广告区域展示位置（1为首页，2为分类商品页）默认1
 */
export const getHomeBannerAPI = async (distributionSite = 1) => {
  return http<BannerItem[]>({
    url: '/frontend/home/banner',
    method: 'GET',
    data: { distributionSite },
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
