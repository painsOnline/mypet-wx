<script setup lang="ts">
import { useShopStore } from '@/stores/modules/shop'
import { getShopCode } from '@/utils/shop'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const { shopData, fetchShop } = useShopStore()
fetchShop()

// 导航项配置
const navItems = [
  { label: '首页', url: 'pages/index/index' },
  { label: '全部商品', url: 'pages/category/category' },
  { label: '我的', url: 'pages/my/my' },
]

// 获取当前页面路径
const currentPage = getCurrentPages().pop()?.route || ''
console.log('currentPage:', currentPage)
</script>
<template>
  <view class="navbar" :style="{ paddingTop: safeAreaInsets!.top + 10 + 'px' }">
    <!-- logo文字 -->
    <view class="logo">
      <image v-if="shopData?.logo" class="logo-image" :src="shopData!.logo"></image>
      <text class="logo-text">正品保证 小时达</text>
    </view>
    <!-- 搜索条 -->
    <navigator :url="`/pages/search/search?shop=${getShopCode()}`" open-type="navigate" animation-type="none" animation-duration="0" hover-class="none" class="search">
      <text class="icon-search">搜索商品</text>
      <text class="icon-scan"></text>
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
</template>

<style lang="scss">
/* 自定义导航条 */
.navbar {
  background:
    radial-gradient(ellipse 18rpx 22rpx at 12% 72%, rgba(255,255,255,0.22), transparent),
    radial-gradient(ellipse 7rpx 9rpx at 7% 62%, rgba(255,255,255,0.2), transparent),
      radial-gradient(ellipse 7rpx 9rpx at 12% 57%, rgba(255,255,255,0.2), transparent),
      radial-gradient(ellipse 7rpx 9rpx at 17% 60%, rgba(255,255,255,0.18), transparent),
      /* 猫爪2 */
      radial-gradient(ellipse 16rpx 20rpx at 82% 55%, rgba(255,255,255,0.22), transparent),
      radial-gradient(ellipse 6rpx 8rpx at 77% 46%, rgba(255,255,255,0.2), transparent),
      radial-gradient(ellipse 6rpx 8rpx at 82% 42%, rgba(255,255,255,0.2), transparent),
      radial-gradient(ellipse 6rpx 8rpx at 87% 44%, rgba(255,255,255,0.18), transparent),
      /* 猫爪3 */
      radial-gradient(ellipse 14rpx 18rpx at 65% 18%, rgba(255,255,255,0.2), transparent),
      radial-gradient(ellipse 6rpx 7rpx at 59% 12%, rgba(255,255,255,0.18), transparent),
      radial-gradient(ellipse 6rpx 7rpx at 65% 8%, rgba(255,255,255,0.18), transparent),
      radial-gradient(ellipse 6rpx 7rpx at 71% 11%, rgba(255,255,255,0.16), transparent),
      /* 猫爪4 */
      radial-gradient(ellipse 20rpx 24rpx at 28% 42%, rgba(255,255,255,0.2), transparent),
      radial-gradient(ellipse 7rpx 9rpx at 24% 33%, rgba(255,255,255,0.18), transparent),
      radial-gradient(ellipse 7rpx 9rpx at 30% 28%, rgba(255,255,255,0.18), transparent),
      radial-gradient(ellipse 7rpx 9rpx at 35% 31%, rgba(255,255,255,0.16), transparent),
      radial-gradient(circle at 8% 20%, rgba(255,255,255,0.25) 7rpx, transparent 7rpx),
    radial-gradient(circle at 15% 16%, rgba(255,255,255,0.25) 7rpx, transparent 7rpx),
    radial-gradient(circle at 20% 22%, rgba(255,255,255,0.2) 6rpx, transparent 6rpx),
    radial-gradient(ellipse 60rpx 35rpx at 30% 75%, rgba(255,255,255,0.05), transparent),
    radial-gradient(circle at 72% 54%, rgba(255,255,255,0.04), transparent),
    radial-gradient(circle at 79% 50%, rgba(255,255,255,0.04), transparent),
    radial-gradient(circle at 84% 56%, rgba(255,255,255,0.18) 5rpx, transparent 5rpx),
    radial-gradient(circle at 88% 28%, rgba(255,255,255,0.28) 12rpx, transparent 12rpx),
    radial-gradient(circle at 83% 20%, rgba(255,255,255,0.2) 5rpx, transparent 5rpx),
    radial-gradient(circle at 89% 16%, rgba(255,255,255,0.2) 5rpx, transparent 5rpx),
    radial-gradient(circle at 35% 82%, rgba(255,255,255,0.26) 12rpx, transparent 12rpx),
    radial-gradient(circle at 30% 74%, rgba(255,255,255,0.18) 5rpx, transparent 5rpx),
    radial-gradient(circle at 36% 72%, rgba(255,255,255,0.18) 5rpx, transparent 5rpx),
    radial-gradient(circle at 60% 18%, rgba(255,255,255,0.2) 9rpx, transparent 9rpx),
    radial-gradient(circle at 48% 48%, rgba(255,255,255,0.18) 11rpx, transparent 11rpx),
    radial-gradient(circle at 75% 60%, rgba(255,255,255,0.22) 6rpx, transparent 12rpx),
    radial-gradient(circle at 85% 20%, rgba(255,255,255,0.25) 9rpx, transparent 6rpx),
    radial-gradient(circle at 30% 80%, rgba(255,255,255,0.22) 14rpx, transparent 10rpx),
    radial-gradient(circle at 55% 40%, rgba(255,255,255,0.25) 12rpx, transparent 7rpx),
    radial-gradient(circle at 10% 55%, rgba(255,255,255,0.16) 9rpx, transparent 9rpx),
    radial-gradient(circle at 65% 75%, rgba(255,255,255,0.11) 5rpx, transparent 5rpx),
    radial-gradient(circle at 90% 45%, rgba(255,255,255,0.13) 11rpx, transparent 11rpx),
    radial-gradient(circle at 45% 15%, rgba(255,255,255,0.17) 6rpx, transparent 6rpx),
    radial-gradient(ellipse 40rpx 28rpx at 20% 70%, rgba(255,255,255,0.08), transparent),
    radial-gradient(ellipse 32rpx 22rpx at 80% 35%, rgba(255,255,255,0.07), transparent),
    radial-gradient(ellipse 36rpx 26rpx at 50% 90%, rgba(255,255,255,0.06), transparent),
    linear-gradient(135deg, #FF8833 0%, #FFB84D 100%);
  background-size: cover;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  .logo {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding-left: 30rpx;
    .logo-image {
      width: 166rpx;
      height: 39rpx;
    }
    .logo-text {
      flex: 1;
      line-height: 28rpx;
      color: #fff;
      margin: 2rpx 0 0 20rpx;
      padding-left: 20rpx;
      border-left: 1rpx solid #fff;
      font-size: 26rpx;
    }
  }
  .search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10rpx 0 26rpx;
    height: 64rpx;
    margin: 16rpx 20rpx;
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
    background-color: rgba(255, 255, 255, 0.5);
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
    background-color: #fff;
    height: 80rpx;
    padding:10rpx;
    display: flex;
  }
 
  .icon-page-nav{
     font-size:32rpx;
     margin-right: 20rpx;
     color: #C8C8C8;
     margin: 0rpx 50rpx 0rpx 0rpx;
  }
  .pageNav .page-active {
    font-weight: 400;
    color: black;
    text-decoration: none;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 6rpx;
      width: 100%;
      height: 8rpx;
      border-radius: 3rpx;
      background-color: #FF8833;
    }
  }
}
</style>