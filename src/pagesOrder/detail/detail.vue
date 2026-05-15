<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <scroll-view
    enable-back-to-top
    scroll-y
    class="viewport"
    id="scroller"
  >
    <template v-if="order">
      
      <!-- 订单和配送状态 -->
      <view class="shipment">
        <!-- 订单状态 -->
        <view class="status"> {{ orderStateList[order.orderState].text }} </view>
        <!-- 用户收货地址 -->
        <view class="locate">
          <view class="user"> {{ order.receiverContact }} {{ order.receiverMobile }} </view>
          <view class="address"> {{ order.receiverAddress }} </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods">
        <view class="item">
          <navigator
            class="navigator"
            v-for="item in order.skus"
            :key="item.id"
            :url="`/pages/goods/goods?id=${item.productId}`"
            hover-class="none"
          >
            <image class="cover" :src="item.picture"></image>
            <view class="meta">
              <view class="name ellipsis">{{ item.name }}</view>
              <view class="type">{{ item.attrsText }}</view>
              <view class="price">
                <view class="actual">
                  <text class="symbol">¥</text>
                  <text>{{ item.price }}</text>
                </view>
              </view>
              <view class="quantity">x{{ item.quantity }}</view>
            </view>
          </navigator>
        </view>
        <!-- 合计 -->
        <view class="total">
          <view class="row">
            <view class="text">应付金额: </view>
            <view class="symbol primary">{{ order.actualPayMoney }}</view>
          </view>
          <view v-if="order.totalMoney > order.actualPayMoney" class="row">
            <view class="text">商品总价: </view>
            <view class="symbol old">{{ order.totalMoney }}</view>
          </view>
          <view v-if="order.totalMoney > order.actualPayMoney" class="row">
            <view class="text">优惠金额: </view>
            <view class="discount">-¥{{ (order.totalMoney - order.actualPayMoney).toFixed(2) }}</view>
          </view>
          <view class="row">
            <view class="text">运费: </view>
            <view>免配送费</view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="detail">
        <view class="title">订单信息</view>
        <view class="row">
          <view class="item">
            订单编号: {{ order.orderNo }} <text class="copy" @tap="onCopy(order.orderNo)">复制</text>
          </view>
          <view class="item">下单时间: {{ order.createTime }}</view>
          <view v-if="order.orderState >= 2 && order.orderState < 5 && order.deliveryTime" class="item">配送时间: {{ order.deliveryTime }}</view>
          <view v-if="order.orderState >= 3 && order.orderState < 5 && order.receiveTime" class="item">收货时间: {{ order.receiveTime }}</view>
          <view v-if="order.orderState === 4 && order.finishTime" class="item">完成时间: {{ order.finishTime }}</view>
          <view v-if="order.orderState === 5 && order.cancelTime" class="item">取消时间: {{ order.cancelTime }}</view>
          <view v-if="order.buyerMessage" class="item">订单备注: {{ order.buyerMessage }}</view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="toolbar-height" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"></view>
      <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
        <!-- 待配送:展示取消订单按钮 -->
        <template v-if="order.orderState === OrderState.ToDeliver">
          <view
            class="button delete"
            @tap="onOrderCancel"
          >
            取消订单
          </view>
        </template>
        <!-- 其他订单状态:按需展示按钮 -->
        <template v-else>
          <!-- 配送中状态: 展示确认收货 -->
          <view
            class="button primary"
            v-if="order.orderState === OrderState.Delivering"
            @tap="onOrderConfirm"
          >
          确认收货
          </view>
        </template>
      </view>
    </template>
  </scroll-view>
  <!-- 取消订单弹窗 -->
  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <view class="popup-root">
      <view class="title">订单取消</view>
      <view class="description">
        <view class="tips">请选择取消订单的原因：</view>
        <view class="cell" v-for="item in reasonList" :key="item" @tap="reason = item">
          <text class="text">{{ item }}</text>
          <text class="icon" :class="{ checked: item === reason }"></text>
        </view>
      </view>
      <view class="footer">
        <view class="button" @tap="popup?.close?.()">取消</view>
        <view class="button primary" @tap="onOrderCancel">确认</view>
      </view>
    </view>
  </uni-popup>
</template>


<script setup lang="ts">
import { OrderState } from '@/enums/order'
import {orderStateList} from '@/constants/order'
import {
  getMemberOrderByNoAPI,
  cancelMemberOrderByNoAPI,
  putMemberOrderReceiptByNoAPI,
} from '@/services/order'
import type { OrderDetail } from '@/types/order'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 弹出层组件
const popup = ref<UniHelper.UniPopupInstance>()
// 取消原因列表
const reasonList = ref([
  '商品无货',
  '不想要了',
  '商品信息填错了',
  '地址信息填写错误',
  '商品降价',
  '其它',
])
// 订单取消原因
const reason = ref('')
// 复制内容
const onCopy = (id: string) => {
  // 设置系统剪贴板的内容
  uni.setClipboardData({ data: id })
}
// 获取页面参数
const query = defineProps<{
  orderNo: string
}>()

// 获取页面栈
const pages = getCurrentPages()

// 基于小程序的 Page 类型扩展 uni-app 的 Page
type PageInstance = Page.PageInstance & WechatMiniprogram.Page.InstanceMethods<any>

// #ifdef MP-WEIXIN
// 获取当前页面实例，数组最后一项
const pageInstance = pages.at(-1) as PageInstance

// 页面渲染完毕，绑定动画效果
onReady(() => {
})
// #endif

// 获取订单详情
const order = ref<OrderDetail>()
const getMemberOrderByIdData = async () => {
  const res = await getMemberOrderByNoAPI(query.orderNo)
  order.value = res.result
}


onLoad(() => {
  getMemberOrderByIdData()
})

// 是否为开发环境
const isDev = import.meta.env.DEV
// 确认收货
const onOrderConfirm = () => {
  // 二次确认弹窗
  uni.showModal({
    content: '为保障您的权益，请收到货并确认无误后，再确认收货',
    confirmColor: '#FF8833',
    success: async (success) => {
      if (success.confirm) {
        const res = await putMemberOrderReceiptByNoAPI(query.orderNo)
        // 更新订单状态
        order.value = res.result
      }
    },
  })
}

// 取消订单
const onOrderCancel = async () => {
  // 发送请求
  const res = await cancelMemberOrderByNoAPI(query.orderNo, { cancelReason: reason.value })
  // 更新订单信息
  order.value = res.result
  // 关闭弹窗
  popup.value?.close!()
  // 轻提示
  uni.showToast({ icon: 'none', title: '订单取消成功' })
}
</script>

<style lang="scss">
@use "./styles/detail.scss"
</style>
