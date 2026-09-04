<template>
  <view class="shop-page">
    <view class="shop-header">
      <text class="shop-title">选择店铺</text>
      <text class="shop-subtitle">请选择您要进入的店铺</text>
    </view>
    <view class="shop-list">
      <image class="shop-bg" src="/static/images/shop_bg.jpg" imgMode="widthFix" />
      <view class="shop-list-inner">
        <view
          v-for="shop in shops"
          :key="shop.code"
          class="shop-item"
          @tap="selectShop(shop)"
        >
          <image class="shop-logo" :src="shop.logo || '/static/images/shop_icon.png'" mode="aspectFill" />
          <view class="shop-info">
            <text class="shop-name">{{ shop.name }}</text>
          </view>
          <text class="shop-arrow"></text>
        </view>
        <view v-if="shops.length === 0 && !loading" class="shop-empty">
          <text>暂无可用的店铺</text>
        </view>
        <view v-if="loading" class="shop-loading">
          <text>加载中...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow , onShareAppMessage, onShareTimeline} from '@dcloudio/uni-app'
import { shareAppMsg, shareTimeline } from '@/utils/useGlobalShare'
import { getShopList } from '@/services/shop'
import type { ShopItem } from '@/services/shop'
import { appendShopParam, switchToShop } from '@/utils/shop'

onShareAppMessage(() => shareAppMsg())
onShareTimeline(() => shareTimeline())


const shops = ref<ShopItem[]>([])
const loading = ref(false)

async function loadShops() {
  loading.value = true
  try {
    const res = await getShopList()
    shops.value = res.result || []
  } catch {
    uni.showToast({ title: '加载店铺失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function selectShop(shop: ShopItem) {
  switchToShop(shop.code)
  uni.reLaunch({ url: appendShopParam('/pages/index/index') })
}

onShow(() => {
  loadShops()
})
</script>

<style lang="scss" scoped>
.shop-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.shop-header {
  background: linear-gradient(135deg, #FF8833, #FFB366);
  padding: 60rpx 30rpx 40rpx;
  text-align: center;
}
.shop-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}
.shop-subtitle {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 12rpx;
  display: block;
}
.shop-list {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.shop-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}
.shop-list-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20rpx;
}
.shop-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.shop-logo {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}
.shop-info {
  flex: 1;
  margin-left: 20rpx;
}
.shop-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}
.shop-arrow {
  flex-shrink: 0;
  &::after {
    content: '>';
    font-size: 32rpx;
    color: #ccc;
  }
}
.shop-empty, .shop-loading {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
