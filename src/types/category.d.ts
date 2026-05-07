import {ProductItem} from './global'
import {ProductDetail} from './product'

export type CategoryItem = {
  /** 一级分类id */
  id: string
  /** 一级分类名称 */
  name: string
  /** 一级分类图片 */
  picture: string
}

export type CategoryProducts = {
    /** 一级分类id */
    id: string
    /** 一级分类名称 */
    name: string
    /** 一级分类图片 */
    picture: string
    /** 一级分类商品 */
    products: ProductDetail[]
}

/** 分类商品列表 */
export type CategoryProductListParams = PageParams & { categoryId: string }