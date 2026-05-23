<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { appendShopParam } from '@/utils/shop'

interface ShopValidateResult {
  valid: boolean
  code: string
  name: string
  isDisable?: number
  isBussinessOpen?: number
}

/**
 * Validate a shop code and return full result including shop name.
 */
async function validateShopCode(code: string): Promise<ShopValidateResult> {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    const res = await uni.request({
      url: baseURL + '/frontend/shop/validate?code=' + encodeURIComponent(code),
      header: { 'source-client': 'miniapp' },
    })
    const data = res.data as any
    if (!data || data.code !== '200') {
      return { valid: false, code, name: '' }
    }
    const result = data.result
    const isDisable = result?.isDisable ?? 0
    const isBussinessOpen = result?.isBussinessOpen ?? 1

    if (isDisable === 1 || isBussinessOpen === 0) {
      uni.showToast({ title: '该店铺暂停营业请稍后再来', icon: 'none', duration: 2000 })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/shop/shop' })
      }, 2000)
      return { valid: false, code, name: result?.name || '' }
    }

    return { valid: true, code, name: result?.name || code, isDisable, isBussinessOpen }
  } catch {
    return { valid: false, code, name: '' }
  }
}

/**
 * Get shop name for display in confirmation dialog.
 */
async function getShopName(code: string): Promise<string> {
  const result = await validateShopCode(code)
  return result.name || code
}

onLaunch(async () => {
  console.log("App Launch");

  const storedShopCode = uni.getStorageSync('shopCode') as string
  const launchOptions = uni.getLaunchOptionsSync ? uni.getLaunchOptionsSync() : null
  const shopParam = launchOptions?.query?.shop as string | undefined

  // Case 1: Have stored shop AND QR has different shop → ask user to confirm
  if (storedShopCode && shopParam && shopParam !== storedShopCode) {
    // Validate the new shop first
    const newShopResult = await validateShopCode(shopParam)
    if (!newShopResult.valid) {
      // New shop invalid, stay with current
      return
    }

    // Get old shop name for display
    const oldShopName = await getShopName(storedShopCode)
    const newShopName = newShopResult.name || shopParam

    // Show confirmation modal
    const res = await new Promise<{ confirm: boolean }>((resolve) => {
      uni.showModal({
        title: '切换店铺',
        content: `您之前访问的是${oldShopName}店铺，现在需要切换到${newShopName}店铺么？`,
        confirmText: '切换',
        cancelText: `继续留在${oldShopName}`,
        success: (modalRes) => {
          resolve({ confirm: modalRes.confirm })
        },
        fail: () => resolve({ confirm: false }),
      })
    })

    if (res.confirm) {
      // User chose to switch
      uni.setStorageSync('shopCode', shopParam)
      console.log("Switched shop to:", shopParam)
    }
    // If user chose to stay, keep stored shop code
    return
  }

  // Case 2: Already have stored shop → proceed normally
  if (storedShopCode) {
    console.log("Shop code from storage:", storedShopCode)
    return
  }

  // Case 3: No stored shop code — try QR parameter
  if (shopParam) {
    const valid = await validateShopCode(shopParam)
    if (valid.valid) {
      uni.setStorageSync('shopCode', shopParam)
      console.log("Shop code from QR:", shopParam)
      return
    }
    console.warn("Invalid shop code from QR:", shopParam)
  }

  // Case 4: No valid shop — navigate to shop selection page
  uni.reLaunch({ url: appendShopParam('/pages/shop/shop') })
})

onShow(() => {
  console.log("App Show");
})
onHide(() => {
  console.log("App Hide");
})
</script>
<style lang="scss">
@use '@/styles/base.scss';
@use '@/styles/fonts.scss';
</style>
