import { http } from '@/utils/http'

/**
 * Shop list response item
 */
export interface ShopItem {
  code: string
  name: string
  logo: string
  isOpen: boolean
  isDisable?: number
  isBussinessOpen?: number
}

/**
 * Get list of all open shops/tenants for shop selection page.
 * Public endpoint — no auth required.
 */
export function getShopList() {
  return http<ShopItem[]>({
    url: '/frontend/shop/list',
    method: 'GET',
  })
}
