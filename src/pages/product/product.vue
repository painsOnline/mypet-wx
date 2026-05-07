<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PetSkuPopup from '@/components/PetSkuPopup.vue'
import { getProductByIdAPI } from '@/services/product'
import type { ProductDetail } from '@/types/product'
import { SkuMode} from '@/enums/product'

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
          <text class="symbol">¥</text>
          <text class="number">{{ product?.price }}</text>
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
          <view class="item" v-for="item in product?.details.properties" :key="item.name">
            <text class="label">{{ item.name }}</text>
            <text class="value">{{ item.value }}</text>
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
      </view>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <view v-if="product" class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <button class="icons-button"><text class="icon-heart"></text>收藏</button>
      <view class="icons-button" @click="toggleCartVisible">
        <text class="icon-cart">
        </text>购物车
      </view>
    </view>
    <view class="buttons">
      <view @tap="onOpenSkuPopup(product, SkuMode.Cart)" class="addcart"> 加入购物车 </view>
      <view @tap="onOpenSkuPopup(product, SkuMode.Buy)" class="payment"> 立即购买 </view>
    </view>
  </view>
  <PetShopCart ref="shopCartRef" hideOnMask />
</template>

<style lang="scss">
@use './styles/product.scss';
</style>
