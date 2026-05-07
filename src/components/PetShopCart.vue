<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { CartItem } from '@/types/cart'
import { getMemberCartAPI, resetMemberCartAPI } from '@/services/cart'
import { useMemberStore, useCartStore } from '@/stores'

const props = defineProps<{
  buyType?: string
  buyDis?: boolean
  hideOnMask?: boolean
}>()

const memberStore = useMemberStore()
const cartStore = useCartStore()

// 是否已登录
const isLoggedIn = computed(() => !!memberStore.profile?.token)

// 购物车展示
const isShowList = ref(false)
const isVisible = ref(true)

const toggleVisible = () => {
  isVisible.value = !isVisible.value
  if (isVisible.value) {
    isShowList.value = true
  } else {
    isShowList.value = false
  }
}

const onMaskClick = () => {
  if (props.hideOnMask) {
    isVisible.value = false
    isShowList.value = false
  } else {
    isShowList.value = false
  }
}

// 浮点数运算
const accMul = (arg1: number, arg2: number): number => {
  let m = 0
  try { m += arg1.toString().split('.')[1].length } catch (e) { /* empty */ }
  try { m += arg2.toString().split('.')[1].length } catch (e) { /* empty */ }
  return (Number(arg1.toString().replace('.', '')) * Number(arg2.toString().replace('.', ''))) / Math.pow(10, m)
}

// 从本地存储获取列表（手动管理，确保增删实时同步到视图）
const productList = ref<CartItem[]>([])

const refreshList = () => {
  if (!isLoggedIn.value) {
    productList.value = []
    return
  }
  productList.value = [...cartStore.getMemberLocalCart().values()]
}

// 根据 skuId 移除
const removeFromList = (skuId: string) => {
  productList.value = productList.value.filter((v) => v.skuId !== skuId)
}

const getSelection = computed(() => {
  return productList.value.filter((item) => item.selected)
})

const getAllCount = computed(() => {
  return getSelection.value.reduce((sum, item) => sum + item.count, 0)
})

const getAllNowPrice = computed(() => {
  return getSelection.value.reduce((sum, product) => sum + accMul(product.count, product.nowPrice), 0).toFixed(2)
})

const getAllPrice = computed(() => {
  return getSelection.value.reduce((sum, product) => sum + accMul(product.count, product.price), 0).toFixed(2)
})

const getAllDiscount = computed(() => {
  return (+getAllPrice.value - +getAllNowPrice.value).toFixed(2)
})

// 初始化购物车：合并本地与后端数据，以本地为准
const initCart = async () => {
  const res = await getMemberCartAPI()
  const memberDbCart = new Map<string, CartItem>()
  res.result?.forEach((item) => {
    memberDbCart.set(item.skuId, item)
  })
  const localCart = cartStore.getMemberLocalCart()

  console.log("memberDbCart")
  console.log(memberDbCart)

  console.log("localCart")
  console.log(localCart)



  // 后端有本地没有的，补充到本地
  for (const [skuId, item] of memberDbCart.entries()) {
    if (!localCart.has(skuId)) {
      localCart.set(skuId, item)
    }
  }

  // 以本地为准更新后端
  await resetMemberCartAPI([...localCart.values()])
  // 更新本地存储
  cartStore.resetMemberLocalCart(localCart)
  refreshList()
}

// 定时同步（仅登录态下生效）
let syncTimer: ReturnType<typeof setInterval> | null = null

watch(isLoggedIn, (val) => {
  if (val) {
    if (!syncTimer) {
      syncTimer = setInterval(() => {
        resetMemberCartAPI([...cartStore.getMemberLocalCart().values()])
      }, 10000)
      initCart()
    }
  } else {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
    }
  }
}, { immediate: true })

onUnmounted(() => {
  if (syncTimer) clearInterval(syncTimer)
})

// 交互方法
const toggleList = () => {
  if (!isLoggedIn.value) return
  if (productList.value.length) {
    isShowList.value = !isShowList.value
  }
  if (isShowList.value) {
    isVisible.value = true
  }
}

const buyList = async () => {
  if (!isLoggedIn.value) return
  if (!getSelection.value.length) {
    uni.showToast({ icon: 'none', title: '请选择商品' })
    return
  }
  await resetMemberCartAPI([...cartStore.getMemberLocalCart().values()])
  uni.navigateTo({ url: '/pagesOrder/create/create' })
}

const addCart = (item: CartItem) => {
  const existing = cartStore.getMemberLocalCart().get(item.skuId)
  if (existing) {
    const newCount = existing.count + 1
    if (newCount > existing.stock) {
      uni.showToast({ title: '该宝贝不能购买超过库存数量奥~' })
      return
    }
    existing.count = newCount
    cartStore.modifyMemberLocalCart(existing)
  } else {
    item.count = 1
    cartStore.modifyMemberLocalCart(item)
  }
  refreshList()
}

const decreaseCart = (item: CartItem) => {
  const newCount = item.count - 1
  if (newCount < 1) {
    cartStore.rememoveFromMemberLocalCart(item)
    removeFromList(item.skuId)
    return
  }
  item.count = newCount
  cartStore.modifyMemberLocalCart(item)
  refreshList()
}

const inputCart = (item: CartItem) => {
  if (item.count >= item.stock) {
    uni.showToast({ title: '该宝贝不能购买超过库存数量奥~' })
    item.count = item.stock
  }
  if (item.count < 1) {
    cartStore.rememoveFromMemberLocalCart(item)
    removeFromList(item.skuId)
    return
  }
  cartStore.modifyMemberLocalCart(item)
  refreshList()
}

const clearCart = () => {
  cartStore.clearMemberLocalCart()
  refreshList()
}

defineExpose({ addCart, toggleVisible })
</script>

<template>
  <view class="shopcart" v-show="isVisible">
    <view class="cartBottom" :class="{ disabled: !isLoggedIn }">
      <view class="carIcon" :class="{ disabled: !isLoggedIn }" @click="toggleList">
        <view class="iconBox" :class="{ active: getAllCount, disabled: !isLoggedIn }">
          <text class="allcount" v-if="getAllCount">{{ getAllCount }}</text>
          <image src="/static/tabs/cart.png" class="img" />
        </view>
      </view>
      <view class="middle" @click="toggleList">
        <view class="priceBox">
          <text class="price" :class="{ active: getAllCount }">￥{{ getAllPrice }}</text>
          <text class="discount">共减￥{{ getAllDiscount }}</text>
        </view>
        <text class="deliveryPrice">满20免配送费</text>
      </view>
      <view class="BtnRight">
        <button class="goToBuy" :type="buyType" :disabled="buyDis || !isLoggedIn" @click="buyList">去结算</button>
      </view>
    </view>

    <!-- 选择的商品 -->
    <view class="cartList" v-show="isLoggedIn && isShowList && productList.length">
      <view class="title">
        <text>购物车</text>
        <view class="clear" @click="clearCart">清空购物车</view>
      </view>
      <scroll-view scroll-y style="max-height: 1100rpx;">
        <view class="productList">
          <view class="productItem" v-for="item in productList" :key="item.skuId">
            <image class="productImg" :src="item.picture" />
            <view class="productInfo">
              <view class="productName">{{ item.name }}</view>
              <view class="productAttr">{{ item.attrsText }}</view>
              <view class="productImportBox">
                <view class="productPrice">
                  <text class="nowPrice">优惠价￥{{ item.nowPrice }}</text>
                  <text class="oldPrice">￥{{ item.price }}</text>
                </view>
                <view class="opCart">
                  <view class="product-control">
                    <view class="cont" v-if="item.count > 0" @click="decreaseCart(item)">
                      <image src="/static/tabs/des-now.png" />
                    </view>
                    <input
                      v-if="item.count > 0"
                      class="buyNum"
                      type="number"
                      v-model="item.count"
                      @input="inputCart(item)"
                    />
                    <view class="cont" @click="addCart(item)">
                      <image src="/static/tabs/add-now.png" />
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="listMask" v-show="isLoggedIn && isShowList && productList.length" @click="onMaskClick" />
  </view>
</template>

<style scoped lang="scss">
@use './styles/PetShopCart.scss';
</style>
