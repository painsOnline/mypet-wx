
<template>
  <view class="viewport">
    <!-- 自定义导航栏 -->
    <pet-nav-bar />
    <!-- 滚动容器 -->
    <scroll-view
      class="scroll-view"
      scroll-y
      @scrolltolower="onScrollToLower"
    >
        <template>
          <MySwiper :list="bannerList"/>
          <HotPannel :list="hotList" :is-loading="isLoadingMore" :is-finish="isFinish" @add-to-cart="onAddToCart" />
        </template>
    </scroll-view>
    <PetShopCart ref="shopCartRef" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import MySwiper from './components/MySwiper.vue';
import type { BannerItem, HotItem } from '@/types/home';
import HotPannel from './components/HotPannel.vue';
import PetNavBar from '@/components/PetNavBar.vue';
import PetShopCart from '@/components/PetShopCart.vue';
import { getHomeBannerAPI, getHomeHotAPI } from '@/services/home'

// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
const getHomeBannerData = async () => {
  const res = await getHomeBannerAPI()
  bannerList.value = res.result
}

// 获取热门推荐数据（分页）
const hotList = ref<HotItem[]>([])
const hotPage = ref(1)
const isLoadingMore = ref(false)
const isFinish = ref(false)
const pageSize = 6

const getHomeHotData = async () => {
  if (isLoadingMore.value || isFinish.value) return
  isLoadingMore.value = true
  const res = await getHomeHotAPI({ page: hotPage.value, pageSize })
  isLoadingMore.value = false
  hotList.value = [...hotList.value, ...res.result.items]
  if (hotPage.value < res.result.pages) {
    hotPage.value++
  } else {
    isFinish.value = true
  }
}

const onScrollToLower = () => {
  getHomeHotData()
}

// 页面加载
const isLoading = ref(false)
onLoad(async () => {
  isLoading.value = true
  await Promise.all([getHomeBannerData(), getHomeHotData()])
  isLoading.value = false
})

// PetShopCart ref
const shopCartRef = ref()

const onAddToCart = (cartItem: any) => {
  shopCartRef.value?.addCart(cartItem)
}

// 当前下拉刷新状态
const isTriggered = ref(false)

// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  isTriggered.value = true
  hotPage.value = 1
  hotList.value = []
  isFinish.value = false
  await Promise.all([
    getHomeBannerData(),
    getHomeHotData(),
  ])
  isTriggered.value = false
}

</script>

<style lang="scss">
page {
  background-color: #f7f7f7;
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scroll-view {
  flex: 1;
  overflow: hidden;
}
</style>
