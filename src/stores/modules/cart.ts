import { ref } from 'vue'
import type { CartItem } from '@/types/cart'
import { defineStore } from 'pinia'

export const useCartStore = defineStore(
  "cart",
  () => {
    const cartMap = ref<Map<string, CartItem>>(new Map())

    const triggerReactivity = () => {
      cartMap.value = new Map(cartMap.value)
    }

    const getMemberLocalCart = (): Map<string, CartItem> => {
      return cartMap.value
    }

    const addToMemberLocalCart = (item: CartItem): boolean => {
      const existing = cartMap.value.get(item.skuId)
      if (existing) {
        existing.count += item.count
      } else {
        cartMap.value.set(item.skuId, { ...item })
      }
      triggerReactivity()
      return true
    }

    const rememoveFromMemberLocalCart = (item: CartItem): boolean => {
      cartMap.value.delete(item.skuId)
      triggerReactivity()
      return true
    }

    const clearMemberLocalCart = (): boolean => {
      cartMap.value = new Map()
      triggerReactivity()
      return true
    }

    const modifyMemberLocalCart = (item: CartItem): boolean => {
      cartMap.value.set(item.skuId, { ...item })
      triggerReactivity()
      return true
    }

    const resetMemberLocalCart = (cart: Map<string, CartItem>): boolean => {
      cartMap.value = new Map(cart)
      triggerReactivity()
      return true
    }

    return {
      getMemberLocalCart,
      addToMemberLocalCart,
      rememoveFromMemberLocalCart,
      clearMemberLocalCart,
      modifyMemberLocalCart,
      resetMemberLocalCart,
    }
  },
  {
    persist: {
      storage: {
        getItem(key) { return uni.getStorageSync(key) },
        setItem(key, value) { uni.setStorageSync(key, value) },
      },
      serializer: {
        serialize: (state: any) => {
          const map = state?.cartMap
          const entries = map instanceof Map ? Array.from(map.entries()) : []
          return JSON.stringify({ cartMap: entries })
        },
        deserialize: (raw: string) => {
          const data = JSON.parse(raw)
          const entries: any[] = data.cartMap || []
          return { cartMap: new Map(entries) }
        },
      },
    },
  }
)
