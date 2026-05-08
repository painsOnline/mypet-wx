import type { PageResult } from '@/types/global'
import type { OrderDetail, OrderItem, OrderListParams, OrderPreResult, OrderCreateParams } from '@/types/order'
import { http } from '@/utils/http'

/**
 * 订单列表（分页）
 */
export const getMemberOrderAPI = async (params: OrderListParams) => {
  return http<PageResult<OrderItem>>({
    url: '/frontend/member/order',
    method: 'GET',
    data: params,
  })
}

/**
 * 订单详情
 */
export const getMemberOrderByIdAPI = async (id: string) => {
  return http<OrderDetail>({
    url: `/frontend/member/order/${id}`,
    method: 'GET',
  })
}

/**
 * 确认收货
 */
export const putMemberOrderReceiptByIdAPI = async (id: string) => {
  return http<OrderDetail>({
    url: `/frontend/member/order/${id}/receipt`,
    method: 'PUT',
  })
}

/**
 * 取消订单
 */
export const getMemberOrderCancelByIdAPI = async (id: string, data: { cancelReason: string }) => {
  return http<OrderDetail>({
    url: `/frontend/member/order/${id}/cancel`,
    method: 'PUT',
    data,
  })
}

/**
 * 删除订单
 */
export const deleteMemberOrderAPI = async (id: string) => {
  return http<boolean>({
    url: `/frontend/member/order/${id}`,
    method: 'DELETE',
  })
}

/**
 * 预付订单（购物车结算）
 */
export const getMemberOrderPreAPI = async () => {
  return http<OrderPreResult>({
    url: '/frontend/member/order/pre',
    method: 'GET',
  })
}

/**
 * 预付订单（立即购买）
 */
export const getMemberOrderPreNowAPI = async (data: { skuId: string; count: string; addressId?: string }) => {
  return http<OrderPreResult>({
    url: '/frontend/member/order/pre/now',
    method: 'GET',
    data,
  })
}

/**
 * 预付订单（再次购买）
 */
export const getMemberOrderRepurchaseByIdAPI = async (id: string) => {
  return http<OrderPreResult>({
    url: `/frontend/member/order/repurchase/${id}`,
    method: 'GET',
  })
}

/**
 * 提交订单
 */
export const postMemberOrderAPI = async (data: OrderCreateParams) => {
  return http<{ id: string }>({
    url: '/frontend/member/order',
    method: 'POST',
    data,
  })
}
