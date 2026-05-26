<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CartItem } from '@/types/cart'
import { useMemberStore, useCartStore } from '@/stores'
import { useShopStore } from '@/stores/modules/shop'
import { appendShopParam } from '@/utils/shop'

const props = defineProps<{
  buyType?: string
  buyDis?: boolean
  hideOnMask?: boolean
}>()

const memberStore = useMemberStore()
const cartStore = useCartStore()
const { shopData, fetchShop } = useShopStore()

// 初始化shop数据
fetchShop()

// 是否已登录
const isLoggedIn = computed(() => !!memberStore.profile?.token)

// 免费配送门槛
const freeShippingAmount = computed(() => shopData.value?.freeShippingAmount ?? 0)
const freeShippingText = computed(() => `满${freeShippingAmount.value}元免配送费`)

// 是否满足免配送门槛
const meetFreeShipping = computed(() => {
  return Number(getAllPrice.value) >= freeShippingAmount.value
})

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

// 直接派生自 store，任何页面修改都会实时反映
const productList = computed(() => {
  if (!isLoggedIn.value) return []
  return [...cartStore.getMemberLocalCart().values()]
})


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

// Use store-level init/sync (only runs once globally, no per-instance race)
watch(isLoggedIn, (val) => {
  if (val) {
    cartStore.syncInit()
    cartStore.startSync()
  } else {
    cartStore.stopSync()
  }
}, { immediate: true })

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
  await cartStore.syncNow()
  uni.navigateTo({ url: appendShopParam('/pagesOrder/create/create') })
}

const addCart = (item: CartItem) => {
  const existing = cartStore.getMemberLocalCart().get(item.skuId)
  if (existing) {
    const newCount = existing.count + 1
    if (newCount > existing.stock) {
      uni.showToast({ icon: 'none', title: '该宝贝不能购买超过库存数量奥~' })
      return
    }
    existing.count = newCount
    cartStore.modifyMemberLocalCart(existing)
  } else {
    if ((item.stock || 0) <= 0) {
      uni.showToast({ icon: 'none', title: '该商品已售罄' })
      return
    }
    item.count = 1
    cartStore.modifyMemberLocalCart(item)
  }
  uni.showToast({ title: '已加入购物车' })
}

const decreaseCart = (item: CartItem) => {
  const newCount = item.count - 1
  if (newCount < 1) {
    cartStore.rememoveFromMemberLocalCart(item)
    return
  }
  item.count = newCount
  cartStore.modifyMemberLocalCart(item)
}

const inputCart = (item: CartItem) => {
  if (item.count >= item.stock) {
    uni.showToast({ title: '该宝贝不能购买超过库存数量奥~' })
    item.count = item.stock
  }
  if (item.count < 1) {
    cartStore.rememoveFromMemberLocalCart(item)
    return
  }
  cartStore.modifyMemberLocalCart(item)
}

const clearCart = () => {
  cartStore.clearMemberLocalCart()
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
          <text class="price" :class="{ active: getAllCount }">￥{{ getAllNowPrice }}</text>
          <text class="discount">共减￥{{ getAllDiscount }}</text>
        </view>
        <text class="deliveryPrice">{{ freeShippingText }}</text>
      </view>
      <view class="BtnRight">
        <button class="goToBuy" :class="{ 'goToBuy--disabled': !meetFreeShipping }" :disabled="buyDis || !isLoggedIn || !meetFreeShipping" @click="buyList">
          <text v-if="meetFreeShipping" class="goToBuy-text">去结算</text>
          <text v-else class="goToBuy-text--small">满{{ freeShippingAmount }}元起配</text>
        </button>
      </view>
    </view>

    <!-- 选择的商品 -->
    <Transition name="cart-slide">
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
    <view class="listMask" v-show="isLoggedIn && isShowList" @click="onMaskClick" />
    </Transition>
  </view>
</template>

<style scoped lang="scss">
@use './styles/PetShopCart.scss';
</style>
