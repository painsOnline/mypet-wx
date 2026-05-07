<script setup lang="ts">
import { ref } from 'vue'
import { SkuMode} from '@/enums/product'
import type { ProductDetail } from '@/types/product'

const skuPopRef = ref()

const emit = defineEmits<{
  'add-to-cart': [item: any]
}>()

const onOpenSkuPopup = (product: ProductDetail, popMod: SkuMode = SkuMode.Both) => {
  skuPopRef.value.openSkuPopup(product, popMod)
}

const onAddToCart = (cartItem: any) => {
  emit('add-to-cart', cartItem)
}

defineProps<{
  list: ProductDetail[]
  isFinish?: boolean
  isLoading?: boolean
}>()
</script>

<template>
  <!-- SKU弹窗组件 -->
  <PetSkuPopup ref="skuPopRef" @add-to-cart="onAddToCart" />
  <view class="panel">
    <view class="title">
      <text class="hot-name">热门推荐</text>
    </view>
    <view class="section">
      <navigator
        v-for="product in list"
        :key="product.id"
        class="product"
        open-type="navigate"
        hover-class="none"
        :url="`/pages/product/product?id=${product.id}`"
      >
        <image class="image" :src="product.picture"></image>
        <view class="name ellipsis">{{ product.name }}</view>
        <view class="price">
          优惠价
          <text class="symbol">¥</text>
          <text class="number">{{ product.price }}</text>
        </view>
        <view class="price-and-cart">
          <view class="odPrice">
            <text class="symbol">¥</text>
            <text class="number">{{ product.oldPrice }}</text>
          </view>
          <view class="opCart"  @click.stop="onOpenSkuPopup(product)">
              <view class="product-control">
                <view class="cont">
                  <image src="/static/tabs/add-now.png" />
                </view>
              </view>
          </view>
        </view>
      </navigator>
    </view>
    <view class="loading-text" v-if="isFinish || isLoading">
      {{ isFinish ? '没有更多数据哟...' : '数据正在加载中...' }}
    </view>
  </view>
</template>

<style lang="scss">
@use './styles/hot.scss';
</style>
