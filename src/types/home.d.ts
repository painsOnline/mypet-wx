import type { ProductDetail } from './product'
import type { PageParams } from './global'

/** 首页-广告区域数据类型 */
export type BannerItem = {
  /** 跳转链接 */
  hrefUrl: string
  /** id */
  id?: string
  /** 图片链接 */
  imgUrl: string
  /** 跳转类型 */
  type: number
  /** 排序 */
  sort?: number
}

/** 首页-热门推荐数据类型 */
export type HotItem = ProductDetail

/** 首页-热门推荐请求参数 */
export type HotListParams = PageParams

/** 店铺详情 */
export type ShopDetail = {
  id: string
  name: string
  logo: string
  detail?: string
  contact?: string
  freeShippingAmount: number
  banners: BannerItem[]
}
