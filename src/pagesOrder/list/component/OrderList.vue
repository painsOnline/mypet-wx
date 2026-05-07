<script setup lang="ts">
import { ref, watch } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import type { OrderItem, OrderListParams } from '@/types/order'
import { OrderState } from '@/enums/order'
import { orderStateList } from '@/constants/order'
import {getMemberOrderAPI, putMemberOrderReceiptByIdAPI, deleteMemberOrderAPI} from '@/services/order'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 定义 porps
const props = defineProps<{
  orderState: number
}>()

// 请求参数
const queryParams: Required<OrderListParams> = {
  page: 1,
  pageSize: 5,
  orderState: props.orderState,
}

// 获取订单列表
const orderList = ref<OrderItem[]>([])

// 是否加载中标记，用于防止滚动触底触发多次请求
const isLoading = ref(false)

// 是否分页结束
const isFinish = ref(false)

// 是否触发下拉刷新
const isTriggered = ref(false)


const getMemberOrderData = async () => {
  // 如果数据出于加载中，退出函数
  if (isLoading.value) return
  // 退出分页判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  // 发送请求前，标记为加载中
  isLoading.value = true
  // 发送请求
  const res = await getMemberOrderAPI(queryParams)
  // 发送请求后，重置标记
  isLoading.value = false
  // 数组追加
  orderList.value.push(...res.result.items)
  // 分页条件
  if (queryParams.page < res.result.pages) {
    // 页码累加
    queryParams.page++
  } else {
    // 分页已结束
    isFinish.value = true
  }
}

// 确认收货
const onOrderConfirm = (id: string) => {
  uni.showModal({
    content: '为保障您的权益，请收到货并确认无误后，再确认收货',
    confirmColor: '#27BA9B',
    success: async (res) => {
      if (res.confirm) {
        await putMemberOrderReceiptByIdAPI(id)
        uni.showToast({ icon: 'success', title: '确认收货成功' })
        // 确认成功，更新为已收货
        const order = orderList.value.find((v) => v.id === id)
        if (order) order.orderState = OrderState.Received
      }
    },
  })
}

// 取消订单
const onOrderCannel = (id: string) => {
  uni.showModal({
    content: '你确定要取消该订单？',
    confirmColor: '#27BA9B',
    success: async (res) => {
      if (res.confirm) {
        await deleteMemberOrderAPI(id)
        // 取消成功，界面中修改订单状态
        const order = orderList.value.find((v) => v.id === id)
        if (order) order.orderState = OrderState.Cancelled
      }
    },
  })
}

onReady(() => {
  getMemberOrderData()
})

// 监听 orderState 变化，重置数据并重新请求
watch(
  () => props.orderState,
  () => {
    queryParams.page = 1
    queryParams.orderState = props.orderState
    orderList.value = []
    isFinish.value = false
    getMemberOrderData()
  },
)

// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  // 开始动画
  isTriggered.value = true
  // 重置数据
  queryParams.page = 1
  orderList.value = []
  isFinish.value = false
  // 加载数据
  await getMemberOrderData()
  // 关闭动画
  isTriggered.value = false
}
</script>

<template>
  <scroll-view
    enable-back-to-top
    scroll-y
    class="orders"
    refresher-enabled
    :refresher-triggered="isTriggered"
    @refresherrefresh="onRefresherrefresh"
    @scrolltolower="getMemberOrderData"
  >
    <view class="card" v-for="order in orderList" :key="order.id">
      <!-- 订单信息 -->
      <view class="status">
        <text class="date">创建时间: {{ order.createTime }}</text>
        <!-- 订单状态文字 -->
        <text>{{ orderStateList[order.orderState].text }}</text>
      </view>
      <!-- 商品信息，点击商品跳转到订单详情，不是商品详情 -->
      <navigator
        v-for="item in order.skus"
        :key="item.id"
        class="goods"
        :url="`/pagesOrder/detail/detail?id=${order.id}`"
        open-type="navigate"
        hover-class="none"
      >
        <view class="cover">
          <image class="image" mode="aspectFit" :src="item.picture"></image>
        </view>
        <view class="meta">
          <view class="name ellipsis">{{ item.name }}</view>
          <view class="type">{{ item.attrsText }}</view>
          <view class="price">￥{{ item.price }}元</view>
        </view>
      </navigator>
      <!-- 支付信息 -->
      <view class="payment">
        <text class="quantity">共{{ order.totalNum }}件商品</text>
        <text>实付</text>
        <text class="amount"> <text class="symbol">¥</text>{{ order.actualPayMoney }}</text>
      </view>
      <!-- 订单操作按钮 -->
      <view class="action">
        <!-- 待配送可以取消 -->
        <template v-if="order.orderState === OrderState.ToDeliver">
          <view class="button primary" @tap="onOrderCannel(order.id)">取消订单</view>
        </template>
        <!-- 配送中: 展示确认收货 -->
        <template v-if="order.orderState === OrderState.Delivering">
          <view class="button primary" @tap="onOrderConfirm(order.id)">确认收货</view>
        </template>
        <!-- 已完成可以再次购买 -->
        <template v-if="order.orderState === OrderState.Completed">
          <navigator
            class="button secondary"
            :url="`/pagesOrder/create/create?orderId=${order.id}`"
            hover-class="none"
          >
            再次购买
          </navigator>
        </template>
      </view>
    </view>
    <!-- 底部提示文字 -->
    <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
      {{ isFinish ? '没有更多数据~' : '正在加载...' }}
    </view>
  </scroll-view>
</template>

<style lang="scss">
@use '../styles/orderList.scss';
</style>
