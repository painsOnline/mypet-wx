import type { CartItem } from '@/types/cart'
import { http } from '@/utils/http'

/**
 * 获取购物车列表
 */
export const getMemberCartAPI = async () => {
  return http<CartItem[]>({
    url: '/frontend/member/cart',
    method: 'GET',
  })
}

/**
 * 全量覆盖购物车（同步本地数据到后端）
 */
export const resetMemberCartAPI = async (data: CartItem[]) => {
  return http<boolean>({
    url: '/frontend/member/cart',
    method: 'PUT',
    data,
  })
}
