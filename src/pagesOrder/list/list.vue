<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './component/OrderList.vue'

// 获取页面参数
const query = defineProps<{
  type: string
}>()

// tabs 数据
const orderTabs = ref([
  { orderState: 0, title: '全部订单', isRender: false },
  { orderState: 1, title: '待配送', isRender: false },
  { orderState: 2, title: '配送中', isRender: false },
  { orderState: 3, title: '已收货', isRender: false },
  { orderState: 4, title: '已完成', isRender: false },
  { orderState: 5, title: '退款/退货', isRender: false },
])

console.log("query type:" + query.type)

// 高亮下标
const activeIndex = ref(orderTabs.value.findIndex((v) => v.orderState === Number(query.type)))
// 默认渲染容器
orderTabs.value[activeIndex.value].isRender = true
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs-wrapper">
      <scroll-view
        class="tabs"
        :scroll-x="true"
        :enable-flex="true"
        :scroll-into-view="'tab-' + activeIndex"
        :scroll-with-animation="true"
      >
        <text
          :id="'tab-' + index"
          class="item"
          :class="{ active: index === activeIndex }"
          v-for="(item, index) in orderTabs"
          :key="item.title"
          @tap="
            () => {
              activeIndex = index
              item.isRender = true
            }
          "
        >
          {{ item.title }}
        </text>
        <!-- 游标 -->
        <!-- <view class="cursor" :style="{ left: activeIndex * 16.67 + '%' }"></view> -->
      </scroll-view>
    </view>
    <!-- 滑动容器 -->
    <swiper class="swiper" :current="activeIndex" @change="activeIndex = $event.detail.current">
      <!-- 滑动项 -->
      <swiper-item v-for="item in orderTabs" :key="item.title">
        <!-- 订单列表 -->
        <OrderList v-if="item.isRender" :order-state="item.orderState" />
      </swiper-item>
    </swiper>
  </view>
</template>

<style lang="scss">
@use './styles/list.scss';
</style>
