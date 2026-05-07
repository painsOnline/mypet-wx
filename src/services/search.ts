import type { PageResult } from '@/types/global'
import type { ProductDetail } from '@/types/product'
import { http } from '@/utils/http'

/**
 * 商品搜索
 */
export const getSearchAPI = (data: { keyword: string; page?: number; pageSize?: number }) => {
  return http<PageResult<ProductDetail>>({
    url: '/search',
    method: 'GET',
    data,
  })
}
