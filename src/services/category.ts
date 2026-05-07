import type { CategoryItem } from '@/types/category'
import type { ProductDetail } from '@/types/product'
import type { PageResult } from '@/types/global'
import { http } from '@/utils/http'

/**
 * 分类列表-小程序
 */
export const getCategoryListAPI = async () => {
  return http<CategoryItem[]>({
    url: '/category/list',
    method: 'GET',
  })
}

/**
 * 根据分类ID获取分页商品列表
 * @param data categoryId + 分页参数
 */
export const getProductsByCategoryIdAPI = async (data: { id: string; page?: number; pageSize?: number }) => {
  return http<PageResult<ProductDetail>>({
    url: '/category/product/list',
    method: 'GET',
    data,
  })
}
