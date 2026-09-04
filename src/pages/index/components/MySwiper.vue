<script setup lang="ts">
import type { BannerItem } from '@/types/home'
import { ref } from 'vue'
import { appendShopParam } from '@/utils/shop'

const activeIndex = ref(0)

// 当 swiper 下标发生变化时触发
const onChange: UniHelper.SwiperOnChange = (ev) => {
  activeIndex.value = ev.detail.current
}
// 定义 props 接收
defineProps<{
  list: BannerItem[]
}>()
</script>

<template>
  <view class="carousel">
    <swiper :circular="true" :autoplay="false" :interval="3000" @change="onChange">
      <swiper-item v-for="item in list" :key="item.id">
        <navigator :url="appendShopParam(item.hrefUrl || '/pages/index/index')" hover-class="none" class="navigator">
          <image class="image" :src="item.imgUrl" mode="aspectFill" />
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 指示点 -->
    <view class="indicator">
      <text
        v-for="(item, index) in list"
        :key="item.id"
        class="dot"
        :class="{ active: index === activeIndex }"
      ></text>
    </view>
  </view>
</template>

<style lang="scss">
@use './styles/Swiper.scss';
</style>