<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import PetSkuPopup from '@/components/PetSkuPopup.vue'
import { getProductByIdAPI } from '@/services/product'
import type { ProductDetail } from '@/types/product'
import { SkuMode} from '@/enums/product'
import { useShopStore } from '@/stores/modules/shop'
import { getShopCode } from '@/utils/shop'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 接收页面参数
const query = defineProps<{
  id: string
}>()

// 获取商品详情信息
const product = ref<ProductDetail>()
const getProductByIdData = async () => {
  const res = await getProductByIdAPI(query.id)
  product.value = res.result
}

// 页面加载
onLoad(async () => {
  getProductByIdData()
  await nextTick()
  shopCartRef.value?.toggleVisible()
})

// 轮播图变化时
const currentIndex = ref(0)
const onChange: UniHelper.SwiperOnChange = (ev) => {
  currentIndex.value = ev.detail.current
}

// 点击图片时预览大图
const onTapImage = () => {
  const urls = product.value?.mainPictures
  if (!urls || urls.length === 0) return
  uni.previewImage({
    current: urls[currentIndex.value],
    urls,
  })
}

const skuPopRef = ref()
const shopCartRef = ref()

const onOpenSkuPopup = (product: ProductDetail, popMod: SkuMode = SkuMode.Both) => {
  skuPopRef.value.openSkuPopup(product, popMod)
}

const onAddToCart = (cartItem: any) => {
  shopCartRef.value?.addCart(cartItem)
}

const toggleCartVisible = () => {
  shopCartRef.value?.toggleVisible()
}

const selectArrText = computed(() => {
  return skuPopRef.value?.selectArr?.join(' ').trim() || '请选择商品规格'
})

// 店铺免配门槛
const { shopData, fetchShop } = useShopStore()
fetchShop()
const freeShippingAmount = computed(() => shopData.value?.freeShippingAmount ?? 0)
const meetFreeShipping = computed(() => {
  return product.value ? Number(product.value.price) >= freeShippingAmount.value : false
})
const buyNowText = computed(() => meetFreeShipping.value ? '立即购买' : `满${freeShippingAmount.value}元起配`)

// 处理商品详情HTML，使图片和文本适配小程序宽度
const detailHtml = computed(() => {
  let html = product.value?.details?.detail || ''
  if (!html) return ''
  // 移除 img 标签固定的宽高属性，添加自适应样式
  html = html.replace(/<img[^>]*>/g, (match) => {
    return match
      .replace(/width="[^"]*"/g, '')
      .replace(/height="[^"]*"/g, '')
      .replace(/style="[^"]*"/g, '')
      .replace('<img ', '<img style="max-width:100%;height:auto;display:block" ')
  })
  return `<div style="width:100%;overflow:hidden;word-break:break-all">${html}</div>`
})

// 微信分享
onShareAppMessage(() => {
  return {
    title: product.value?.name || '宠物用品',
    path: `/pages/product/product?id=${query.id}&shop=${getShopCode()}`,
    imageUrl: product.value?.mainPictures?.[0] || '',
  }
})

</script>

<template>
  <!-- SKU弹窗组件 -->
  <PetSkuPopup ref="skuPopRef" @add-to-cart="onAddToCart" />
  <scroll-view enable-back-to-top scroll-y class="viewport">
    <!-- 基本信息 -->
    <view class="goods">
      <!-- 商品主图 -->
      <view class="preview">
        <swiper @change="onChange" circular>
          <swiper-item v-for="item in product?.mainPictures" :key="item">
            <image class="image" @tap="onTapImage" mode="aspectFill" :src="item" />
          </swiper-item>
        </swiper>
        <view class="indicator">
          <text class="current">{{ currentIndex + 1 }}</text>
          <text class="split">/</text>
          <text class="total">{{ product?.mainPictures.length }}</text>
        </view>
      </view>

      <!-- 商品简介 -->
      <view class="meta">
        <view class="price">
          <view class="now_price">
            <text class="symbol">到手价¥</text>
            <text class="number">{{ product?.price }}</text>
          </view>
          <view class="old_price">
            <text>原价¥</text>
            <text class="old_price_number">{{ product?.oldPrice }}</text>
          </view>
        </view>
        <view class="name ellipsis">{{ product?.name }}</view>
        <view class="desc"> {{ product?.desc }} </view>
      </view>

      <!-- 操作面板 -->
      <view class="action">
        <view @tap="onOpenSkuPopup(product!)" class="item arrow">
          <text class="label">选择</text>
          <text class="text ellipsis"> {{ selectArrText }} </text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail panel">
      <view class="title">
        <text>详情</text>
      </view>
      <view class="content">
        <view class="properties">
          <!-- 属性详情 -->
          <view class="item" v-for="item in product?.details.properties" :key="item.specId">
            <text class="label">{{ item.specName }}</text>
            <text class="value">{{ item.valueName }}</text>
          </view>
        </view>
        <!-- 图片详情 -->
        <image
          class="image"
          v-for="item in product?.details.pictures"
          :key="item"
          mode="widthFix"
          :src="item"
        ></image>
        <!-- 商品详情HTML -->
        <rich-text
          v-if="detailHtml"
          :nodes="detailHtml"
          class="detail-html"
        />
      </view>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <view v-if="product" class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <button class="icons-button" open-type="share">
        <image class="btn-icon" src="/static/images/share.png" mode="aspectFit" />
        <text>分享</text>
      </button>
      <view class="icons-button" @click="toggleCartVisible">
        <image class="btn-icon" src="/static/images/cart.png" mode="aspectFit" />
        <text>购物车</text>
      </view>
    </view>
    <view class="buttons">
      <view @tap="onOpenSkuPopup(product, SkuMode.Cart)" class="addcart"> 加入购物车 </view>
      <view @tap="meetFreeShipping ? onOpenSkuPopup(product, SkuMode.Buy) : undefined" class="payment" :class="{ 'payment--disabled': !meetFreeShipping }">
        <text v-if="meetFreeShipping" class="payment-text">立即购买</text>
        <text v-else class="payment-text--small">满{{ freeShippingAmount }}元起配</text>
      </view>
    </view>
  </view>
  <PetShopCart ref="shopCartRef" hideOnMask />
</template>

<style lang="scss">
@use './styles/product.scss';
</style>
