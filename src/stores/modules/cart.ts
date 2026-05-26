import { ref } from 'vue'
import type { CartItem } from '@/types/cart'
import { defineStore } from 'pinia'
import { getMemberCartAPI, resetMemberCartAPI } from '@/services/cart'

export const useCartStore = defineStore(
  "cart",
  () => {
    const cartMap = ref<Map<string, CartItem>>(new Map())

    // Global init/sync state (shared across all component instances)
    let _initDone = false
    let _initPromise: Promise<void> | null = null
    let _syncTimer: ReturnType<typeof setInterval> | null = null
    // Monotonically increasing version to detect concurrent writes
    let _version = 0

    const triggerReactivity = () => {
      _version++
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
      _version++
      return true
    }

    /**
     * Idempotent init: merge DB cart into local, sync back. Runs only once.
     */
    const syncInit = (): Promise<void> => {
      if (_initDone) return Promise.resolve()
      if (_initPromise) return _initPromise
      _initPromise = _doInit()
      return _initPromise
    }

    const _doInit = async () => {
      try {
        const versionBefore = _version
        const res = await getMemberCartAPI()
        const dbItems = res.result || []
        let changed = false
        for (const item of dbItems) {
          if (!cartMap.value.has(item.skuId)) {
            cartMap.value.set(item.skuId, item)
            changed = true
          }
        }
        if (changed) triggerReactivity()
        // Sync local state to backend
        await resetMemberCartAPI([...cartMap.value.values()])
      } catch (e) {
        console.warn('[CartStore] initCart failed', e)
      } finally {
        _initDone = true
        _initPromise = null
      }
    }

    const startSync = () => {
      if (_syncTimer) return
      _syncTimer = setInterval(() => {
        resetMemberCartAPI([...cartMap.value.values()]).catch(() => {})
      }, 10000)
    }

    const stopSync = () => {
      if (_syncTimer) {
        clearInterval(_syncTimer)
        _syncTimer = null
      }
      _initDone = false
    }

    const syncNow = () => {
      return resetMemberCartAPI([...cartMap.value.values()]).catch(() => {})
    }

    return {
      getMemberLocalCart,
      addToMemberLocalCart,
      rememoveFromMemberLocalCart,
      clearMemberLocalCart,
      modifyMemberLocalCart,
      resetMemberLocalCart,
      syncInit,
      startSync,
      stopSync,
      syncNow,
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
