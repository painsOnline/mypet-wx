<template>
  <!-- SKU弹窗组件 -->
  <vk-data-goods-sku-popup
    v-model="isShowSku"
    :mode="mode"
    :localdata="selectedProduct"
    add-cart-background-color="#353638"
    add-cart-color="#fff"
    buy-now-background-color="#FEE53F"
    buy-now-color="#333"
    buy-now-text-color="#333"
    ref="skuPopupRef"
    :actived-style="{
      color: '#FF8833',
      borderColor: '#FF8833',
      backgroundColor: '#FFF0E5',
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
import { useShopStore } from '@/stores/modules/shop'

// SKU组件实例
const skuPopupRef = ref()
const { shopData, fetchShop } = useShopStore()
fetchShop()

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
  const skus = selectedPrduct.skus ?? []
  const inStockSkus = skus.filter((v) => v.inventory > 0)

  // 只有一个SKU → 根据模式决定是否弹窗（Both模式始终弹窗供详情页选择）
  if (inStockSkus.length === 1 && skus.length === 1 && btnMode !== SkuMode.Both) {
    const onlySku = inStockSkus[0]
    if (btnMode === SkuMode.Buy) {
      checkAndBuy(onlySku)
    } else {
      const specNames = onlySku.specs.map((s) => s.valueName).join(' ')
      const cartItem: CartItem = {
        id: selectedPrduct.id, skuId: onlySku.id, name: selectedPrduct.name,
        picture: onlySku.picture || selectedPrduct.mainPictures?.[0] || selectedPrduct.picture,
        count: 1, price: onlySku.oldPrice, nowPrice: onlySku.price,
        stock: onlySku.inventory, selected: true, attrsText: specNames, isEffective: true,
      }
      emit('add-to-cart', cartItem)
      uni.showToast({ title: '已加入购物车' })
    }
    return
  }

  // 收集所有有库存SKU的规格值，用于过滤可选项
  const inStockValues: Record<string, Set<string>> = {}
  inStockSkus.forEach((sku) => {
    sku.specs.forEach((sp) => {
      const specKey = sp.specName || sp.name
      if (!inStockValues[specKey]) inStockValues[specKey] = new Set()
      inStockValues[specKey].add(sp.valueName)
    })
  })

  // SKU组件所需格式（只显示有库存可选的规格值）
  selectedProduct.value = {
    _id: selectedPrduct.id,
    name: selectedPrduct.name,
    product_thumb: selectedPrduct.mainPictures?.[0] ?? selectedPrduct.picture,
    spec_list: (selectedPrduct.specs ?? []).map((v) => {
      const specKey = v.specName || v.name
      const selectableValues = inStockValues[specKey] || new Set()
      return {
        name: specKey,
        list: v.values.filter((val: any) => selectableValues.has(val.valueName || val.name)),
      }
    }),
    sku_list: inStockSkus.map((v) => {
      return {
        _id: v.id,
        goods_id: selectedPrduct.id,
        goods_name: selectedPrduct.name,
        image: v.picture,
        price: v.price * 100,
        stock: v.inventory,
        sku_name_arr: v.specs.map((vv) => vv.valueName),
      }
    }),
  }
  mode.value = btnMode
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

// 免配金额
const freeShippingAmount = computed(() => shopData.value?.freeShippingAmount ?? 0)

// 检查SKU价格是否满足起配
function checkAndBuy(onlySku?: any) {
  const sku = onlySku || null
  if (sku) {
    // 单SKU直接购买
    if (Number(sku.price) < freeShippingAmount.value) {
      uni.showToast({ icon: 'none', title: `订单金额需满${freeShippingAmount.value}元起配` })
      return
    }
    uni.navigateTo({ url: `/pagesOrder/create/create?skuId=${sku.id}&count=1` })
    return
  }
}

// 立即购买（弹窗中选择SKU后触发）
const onBuyNow = (selectShop: any) => {
  // 选中SKU的价格 = selectShop.price / 100 (vk组件内部price单位为分)
  const selectedPrice = selectShop.price / 100
  if (Number(selectedPrice) < freeShippingAmount.value) {
    uni.showToast({ icon: 'none', title: `订单金额需满${freeShippingAmount.value}元起配` })
    return
  }
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

<style lang="scss" scoped>
:deep(.sure) {
  color: #333 !important;
}
</style>
