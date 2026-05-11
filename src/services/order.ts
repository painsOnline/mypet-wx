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
 * 订单详情（orderNo）
 */
export const getMemberOrderByNoAPI = async (orderNo: string) => {
  return http<OrderDetail>({
    url: `/frontend/member/order/${orderNo}`,
    method: 'GET',
  })
}

/**
 * 确认收货（orderNo）
 */
export const putMemberOrderReceiptByNoAPI = async (orderNo: string) => {
  return http<OrderDetail>({
    url: `/frontend/member/order/${orderNo}/receipt`,
    method: 'PUT',
  })
}

/**
 * 取消订单（orderNo）
 */
export const cancelMemberOrderByNoAPI = async (orderNo: string, data: { cancelReason: string }) => {
  return http<OrderDetail>({
    url: `/frontend/member/order/${orderNo}/cancel`,
    method: 'PUT',
    data,
  })
}

/**
 * 删除订单（orderNo）
 */
export const deleteMemberOrderByNoAPI = async (orderNo: string) => {
  return http<boolean>({
    url: `/frontend/member/order/${orderNo}`,
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
 * 预付订单（再次购买）（orderNo）
 */
export const getMemberOrderRepurchaseByNoAPI = async (orderNo: string) => {
  return http<OrderPreResult>({
    url: `/frontend/member/order/repurchase/${orderNo}`,
    method: 'GET',
  })
}

/**
 * 提交订单
 */
export const postMemberOrderAPI = async (data: OrderCreateParams) => {
  return http<{ id: string; orderNo: string }>({
    url: '/frontend/member/order',
    method: 'POST',
    data,
  })
}
