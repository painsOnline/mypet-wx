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
import { appendShopParam } from '@/utils/shop'

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
  console.log('[PetSkuPopup] openSkuPopup, mode=', btnMode)
  console.log('[PetSkuPopup] selectedPrduct:', JSON.stringify(selectedPrduct))
  const memberStore = useMemberStore()
  if (!memberStore.profile?.token) {
    uni.navigateTo({ url: appendShopParam('/pages/login/login') })
    return
  }
  currentProduct.value = selectedPrduct
  const skus = selectedPrduct.skus ?? []
  const inStockSkus = skus.filter((v) => v.virtualInventory > 0)
  console.log('[PetSkuPopup] skus count:', skus.length, 'inStockSkus:', inStockSkus.length)

  // 所有SKU都无库存
  if (inStockSkus.length === 0) {
    uni.showToast({ icon: 'none', title: '该商品已售罄' })
    return
  }

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
        stock: onlySku.virtualInventory, selected: true, attrsText: specNames, isEffective: true,
        specs: onlySku.specs,
      }
      emit('add-to-cart', cartItem)
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

  console.log('[PetSkuPopup] inStockValues:', JSON.stringify(Object.fromEntries(Object.entries(inStockValues).map(([k,v]) => [k, [...v]]))))
  // SKU组件所需格式
  // 关键: spec_list 和 sku_name_arr 的 spec 顺序必须一致，通过 specId 对齐
  const specList = (selectedPrduct.specs ?? []).map((specGroup) => ({
    name: specGroup.specName || specGroup.name,
    list: (specGroup.values ?? []).map((val: any) => ({ name: val.valueName || val.name })),
  }))
  const specOrder: Record<string, number> = {}
  specList.forEach((spec, i) => { specOrder[spec.name] = i })

  selectedProduct.value = {
    _id: selectedPrduct.id,
    name: selectedPrduct.name,
    product_thumb: selectedPrduct.mainPictures?.[0] ?? selectedPrduct.picture,
    spec_list: specList,
    sku_list: inStockSkus.map((v) => {
      // 按 spec_list 顺序构建 sku_name_arr，通过 specId 匹配
      const specValueMap: Record<string, string> = {}
      v.specs.forEach((sp: any) => {
        const key = sp.specId || ''
        if (key) specValueMap[key] = sp.valueName
      })
      // spec_list 的 spec 对应 selectedPrduct.specs 同位置元素，取其 specId 做匹配
      const skuNameArr = (selectedPrduct.specs ?? []).map((specGroup: any) => {
        const sid = specGroup.specId || ''
        return specValueMap[sid] || ''
      })
      return {
        _id: v.id,
        goods_id: selectedPrduct.id,
        goods_name: selectedPrduct.name,
        image: v.picture,
        price: v.price * 100,
        stock: v.virtualInventory,
        sku_name_arr: skuNameArr,
      }
    }),
  }
  console.log('[PetSkuPopup] selectedProduct:', JSON.stringify(selectedProduct.value))
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
  console.log('[PetSkuPopup] onAddCart selectShop:', JSON.stringify(selectShop))
  const sku = currentProduct.value?.skus?.find((s: any) => s.id === selectShop._id)
  console.log('[PetSkuPopup] onAddCart found sku:', sku ? sku.id : 'NOT FOUND')

  // 检查库存
  const stock = sku?.virtualInventory ?? 0
  if (stock <= 0) {
    uni.showToast({ icon: 'none', title: '该商品已售罄' })
    isShowSku.value = false
    return
  }

  const oldPrice = sku?.oldPrice ?? selectShop.price / 100 * 1.1

  const cartItem: CartItem = {
    id: selectShop.goods_id,
    skuId: selectShop._id,
    name: selectShop.goods_name,
    picture: selectShop.image,
    count: selectShop.buy_num || 1,
    price: +oldPrice.toFixed(2),
    nowPrice: +(selectShop.price / 100).toFixed(2),
    stock,
    selected: true,
    attrsText: selectShop.sku_name_arr?.join(' ') || '',
    isEffective: true,
    specs: sku?.specs || [],
  }

  emit('add-to-cart', cartItem)
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
    uni.navigateTo({ url: appendShopParam(`/pagesOrder/create/create?skuId=${sku.id}&count=1`) })
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
  uni.navigateTo({ url: appendShopParam(`/pagesOrder/create/create?skuId=${selectShop._id}&count=${selectShop.buy_num}`) })
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
