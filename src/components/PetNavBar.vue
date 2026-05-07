<script setup lang="ts">
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

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
      <image class="logo-image" src="@/static/images/logo.png"></image>
      <text class="logo-text">联系电话：15921680355</text>
    </view>
    <!-- 搜索条 -->
    <view class="search">
      <text class="icon-search">搜索商品</text>
      <text class="icon-scan"></text>
    </view>
    <!-- 导航栏 -->
    <view class="pageNav">
      <navigator
        v-for="(item, index) in navItems"
        :key="index"
        :class="['icon-page-nav', { 'page-active': currentPage === item.url }]"
        :url="'/'+ (item.url || undefined)"
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
  // background-image: url(@/static/images/navigator_bg.png);
  background-color: #FFE810;
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
      background-color: #FEE53F;
    }
  }
}
</style>