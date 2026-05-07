import type { ProductDetail } from '@/types/product'
import { http } from '@/utils/http'

/**
 * 商品详情
 * @param id 商品id
 */
export const getProductByIdAPI = async (id: string) => {
  return http<ProductDetail>({
    url: '/goods',
    method: 'GET',
    data: { id },
  })
}
