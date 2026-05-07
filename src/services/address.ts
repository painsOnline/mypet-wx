import type { AddressItem, AddressParams } from '@/types/address'
import { http } from '@/utils/http'

/**
 * 获取收货地址列表
 */
export const getMemberAddressAPI = async () => {
  return http<AddressItem[]>({
    url: '/member/address',
    method: 'GET',
  })
}

/**
 * 获取收货地址详情
 */
export const getMemberAddressByIdAPI = async (id: string) => {
  return http<AddressItem>({
    url: `/member/address/${id}`,
    method: 'GET',
  })
}

/**
 * 添加收货地址
 */
export const postMemberAddressAPI = async (data: AddressParams) => {
  return http<AddressItem>({
    url: '/member/address',
    method: 'POST',
    data,
  })
}

/**
 * 修改收货地址
 */
export const putMemberAddressByIdAPI = async (id: string, data: AddressParams) => {
  return http<AddressItem>({
    url: `/member/address/${id}`,
    method: 'PUT',
    data,
  })
}

/**
 * 删除收货地址
 */
export const deleteMemberAddressByIdAPI = async (id: string) => {
  return http<string>({
    url: `/member/address/${id}`,
    method: 'DELETE',
  })
}
