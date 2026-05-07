<template>
  <!-- SKU弹窗组件 -->
  <vk-data-goods-sku-popup
    v-model="isShowSku"
    :mode="mode"
    :localdata="selectedProduct"
    add-cart-background-color="#353638"
    buy-now-background-color="#FEE53F"
    ref="skuPopupRef"
    :actived-style="{
      color: '#27BA9B',
      borderColor: '#27BA9B',
      backgroundColor: '#E9F8F5',
    }"
    @add-cart="onAddCart"
    @buy-now="onBuyNow"
    @open="openSkuPopup"
    @close="onCloseSkuPopup"
  />
</template>

<script setup lang="ts">    
import { computed, ref } from 'vue'
import { SkuMode} from '@/enums/product'
import type { ProductDetail } from '@/types/product'
import type { CartItem } from '@/types/cart'
import { useMemberStore } from '@/stores'

// SKU组件实例
const skuPopupRef = ref()

// SKU弹窗使用的格式化数据
const selectedProduct = ref()

// 当前选中的原始商品
const currentProduct = ref<ProductDetail>()

// 是否显示SKU组件
const isShowSku = ref(false)

const mode = ref<SkuMode>(SkuMode.Cart)


// 打开SKU弹窗修改按钮模式
const openSkuPopup = (selectedPrduct: ProductDetail, btnMode: SkuMode = SkuMode.Both) => {
  const memberStore = useMemberStore()
  if (!memberStore.profile?.token) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  currentProduct.value = selectedPrduct
  // SKU组件所需格式
  selectedProduct.value = {
    _id: selectedPrduct.id,
    name: selectedPrduct.name,
    product_thumb: selectedPrduct.mainPictures?.[0] ?? selectedPrduct.picture,
    spec_list: (selectedPrduct.specs ?? []).map((v) => {
      return {
        name: v.name,
        list: v.values,
      }
    }),
    sku_list: (selectedPrduct.skus ?? []).map((v) => {
      return {
        _id: v.id,
        goods_id: selectedPrduct.id,
        goods_name: selectedPrduct.name,
        image: v.picture,
        price: v.price * 100, // 注意：需要乘以 100
        stock: v.inventory,
        sku_name_arr: v.specs.map((vv) => vv.valueName),
      }
    }),
  }
  // 修改按钮模式
  mode.value = btnMode
  // 显示SKU弹窗
  isShowSku.value = true
}

//关闭SKU弹窗
const onCloseSkuPopup = () =>{

}

const emit = defineEmits<{
  'add-to-cart': [item: CartItem]
}>()

// 加入购物车事件
const onAddCart = (selectShop: any) => {
  // 从当前商品中找到选中 SKU 的原价
  const sku = currentProduct.value?.skus?.find((s: any) => s.id === selectShop._id)
  const oldPrice = sku?.oldPrice ?? selectShop.price / 100 * 1.1

  const cartItem: CartItem = {
    id: selectShop.goods_id,
    skuId: selectShop._id,
    name: selectShop.goods_name,
    picture: selectShop.image,
    count: selectShop.buy_num || 1,
    price: +oldPrice.toFixed(2),
    nowPrice: +(selectShop.price / 100).toFixed(2),
    stock: selectShop.stock || 100,
    selected: true,
    attrsText: selectShop.sku_name_arr?.join(' ') || '',
    isEffective: true,
  }

  emit('add-to-cart', cartItem)
  uni.showToast({ title: '已加入购物车' })
  isShowSku.value = false
}

// 立即购买
const onBuyNow = (selectShop: any) => {
  uni.navigateTo({ url: `/pagesOrder/create/create?skuId=${selectShop._id}&count=${selectShop.buy_num}` })
  isShowSku.value = false
}

//获取被选中的值
const selectArr = computed(() => skuPopupRef.value?.selectArr || [])

defineExpose({
  openSkuPopup,
  selectArr
})
</script>
