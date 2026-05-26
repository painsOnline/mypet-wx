<script setup lang="ts">
import { ref } from 'vue'
import { useShopStore } from '@/stores/modules/shop'
import { getShopCode } from '@/utils/shop'

const { safeAreaInsets, statusBarHeight } = uni.getSystemInfoSync()
const topSafe = Math.max(safeAreaInsets?.top || 0, statusBarHeight || 0)
const { shopData, fetchShop } = useShopStore()
fetchShop()

const navItems = [
  { label: '首页', url: 'pages/index/index' },
  { label: '全部商品', url: 'pages/category/category' },
  { label: '我的', url: 'pages/my/my' },
]

const currentPage = getCurrentPages().pop()?.route || ''

// page-container visibility
const showDetail = ref(false)
function openDetail() { showDetail.value = true }
function closeDetail() { showDetail.value = false }
function switchShop() {
  uni.navigateTo({ url: '/pages/shop/shop' })
}
function callContact() {
  if (shopData.value?.contact) {
    uni.makePhoneCall({ phoneNumber: shopData.value.contact })
  }
}
</script>

<template>
  <view class="navbar" :style="{ paddingTop: topSafe + 'px' }">
    <!-- Header: logo + info, click to open shop detail -->
    <view class="shop-header" @tap="openDetail">
      <view class="logo-wrap">
        <image v-if="shopData?.logo" class="shop-logo" :src="shopData!.logo" mode="aspectFill" />
        <image v-else class="shop-logo" src="/static/images/shop_icon.png" mode="aspectFill" />
      </view>
      <view class="shop-info">
        <text class="shop-name">{{ shopData?.name || '宠物用品' }}</text>
        <view class="shop-tags">
          <text class="tag tag-delivery">小区业主急送</text>
          <text class="tag tag-quality">正品保障</text>
          <text class="switch-shop" @tap.stop="switchShop">切换店铺</text>
        </view>
      </view>
    </view>

    <!-- 搜索条 -->
    <navigator :url="`/pages/search/search?shop=${getShopCode()}`" open-type="navigate" animation-type="none" animation-duration="0" hover-class="none" class="search">
      <text class="icon-search">搜索商品</text>
    </navigator>

    <!-- 导航栏 -->
    <view class="pageNav">
      <navigator
        v-for="(item, index) in navItems"
        :key="index"
        :class="['icon-page-nav', { 'page-active': currentPage === item.url }]"
        :url="`/${item.url}?shop=${getShopCode()}`"
        open-type="redirect"
        hover-class="none"
      >
        {{ item.label }}
      </navigator>
    </view>
  </view>

  <!-- 店铺详情弹窗 -->
  <page-container :show="showDetail" :overlay="true" position="bottom" :round="true" @beforeleave="closeDetail">
    <view class="detail-popup">
      <view class="detail-header">
        <text class="detail-title">店铺详情</text>
        <text class="detail-close" @tap="closeDetail">✕</text>
      </view>
      <scroll-view scroll-y class="detail-body" v-if="shopData?.detail">
        <rich-text :nodes="shopData.detail" />
      </scroll-view>
      <view v-else class="detail-empty">
        <text>暂无店铺详情</text>
      </view>
      <view v-if="shopData?.contact" class="detail-footer">
        <view class="call-btn" @tap="callContact">
          <text class="icon-phone call-icon"></text>
          <text class="call-text">电话联系店主</text>
        </view>
      </view>
    </view>
  </page-container>
</template>

<style lang="scss">
.navbar {
  background:
    radial-gradient(ellipse 60rpx 80rpx at 15% 30%, rgba(255,255,255,0.18), transparent),
    radial-gradient(ellipse 40rpx 55rpx at 78% 25%, rgba(255,255,255,0.14), transparent),
    radial-gradient(ellipse 50rpx 65rpx at 50% 70%, rgba(255,255,255,0.10), transparent),
    linear-gradient(150deg, #FF7A2E 0%, #FF9B45 40%, #FFB84D 100%);
  position: relative;
  display: flex;
  flex-direction: column;

  .shop-header {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
  }

  .logo-wrap {
    flex-shrink: 0;
    border-radius: 24rpx;
    padding: 8rpx;
    background: #FFF;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
  }

  .shop-logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 20rpx;
    display: block;
  }

  .shop-info {
    flex: 1;
    margin-left: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .shop-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #333;
    line-height: 1.3;
    letter-spacing: 2rpx;
  }

  .shop-tags {
    display: flex;
    gap: 12rpx;
    margin-top: 12rpx;
    .tag {
      font-size: 20rpx;
      font-weight: 600;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      letter-spacing: 1rpx;
      &.tag-delivery {
        color: #FFF;
        background: rgba(255,255,255,0.25);
      }
      &.tag-quality {
        color: #FF7A2E;
        background: rgba(255,255,255,0.9);
        box-shadow: 0 2rpx 8rpx rgba(255,122,46,0.15);
      }
    }
    .switch-shop {
      margin-left: auto;
      font-size: 20rpx;
      font-weight: 600;
      color: #FFF;
      padding: 6rpx 0;
      text-decoration: underline;
      text-underline-offset: 4rpx;
      white-space: nowrap;
      &::after {
        content: '>';
        margin-left: 2rpx;
      }
    }
  }

  .search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12rpx 0 30rpx;
    height: 68rpx;
    margin: 8rpx 24rpx 20rpx;
    color: #999;
    font-size: 28rpx;
    border-radius: 36rpx;
    background: rgba(255,255,255,0.85);
    box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  }

  .icon-search {
    &::before {
      margin-right: 10rpx;
    }
  }

  .icon-scan {
    font-size: 30rpx;
    padding: 15rpx;
  }

  .pageNav {
    background: #FFF;
    height: 80rpx;
    padding: 6rpx 10rpx;
    display: flex;
    border-radius: 24rpx 24rpx 0 0;
    box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.04);
  }

  .icon-page-nav {
    font-size: 30rpx;
    color: #B0B0B0;
    margin: 0 40rpx 0 10rpx;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    position: relative;
    transition: color 0.2s;
  }

  .pageNav .page-active {
    font-weight: 600;
    color: #FF7A2E;
    text-decoration: none;
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -2rpx;
      transform: translateX(-50%);
      width: 48rpx;
      height: 8rpx;
      border-radius: 4rpx;
      background: linear-gradient(90deg, #FF9B45, #FFB84D);
    }
  }
}

// page-container popup styles
.detail-popup {
  display: flex;
  flex-direction: column;
  height: 75vh;
  background: #FFF;
  border-radius: 32rpx 32rpx 0 0;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  .detail-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }
  .detail-close {
    font-size: 36rpx;
    color: #999;
    padding: 10rpx;
  }
}
.detail-body {
  flex: 1;
  padding: 24rpx 30rpx;
  overflow-y: auto;
}
.detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}
.detail-footer {
  padding: 16rpx 30rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}
.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, #FF8833, #FFA751);
  border-radius: 44rpx;
  .call-icon {
    font-size: 36rpx;
    color: #FFF;
    margin-right: 12rpx;
  }
  .call-text {
    font-size: 30rpx;
    color: #FFF;
    font-weight: 600;
  }
}
</style>
