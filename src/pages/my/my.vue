<template>
  <!-- 自定义导航栏 -->
  <pet-nav-bar />
  <view class="myNavCategory">
    <view class="myNavTitle">我的订单</view>
    <view class="myNavItem">
      <navigator
        url="/pagesOrder/list/list?type=0"
        open-type="navigate"
        hover-class="none"
        class="myOrderNavItem"
      >
        <image
          src="/static/tabs/order_all.png"
          mode="scaleToFill"
        />
        <text>全部订单</text>
      </navigator>
      <navigator
        url="/pagesOrder/list/list?type=2"
        open-type="navigate"
        hover-class="none"
        class="myOrderNavItem"
      >
        <image
          src="/static/tabs/order_delivery.png"
          mode="scaleToFill"
        />
        <text>配送中</text>
      </navigator>
      <navigator
        url="/pagesOrder/list/list?type=4"
        open-type="navigate"
        hover-class="none"
        class="myOrderNavItem"
      >
        <image
          src="/static/tabs/order_done.png"
          mode="scaleToFill"
        />
        <text>已完成</text>
      </navigator>
      <navigator
        url="/pagesOrder/list/list?type=5"
        open-type="navigate"
        hover-class="none"
        class="myOrderNavItem"
      >
        <image
          src="/static/tabs/order_refound.png"
          mode="scaleToFill"
        />
        <text>退款/退货</text>
      </navigator>
    </view>
  </view>
  <view class="myNavCategory">
    <view class="myNavTitle">更多功能</view>
    <view class="myNavItem">
      <navigator
        url="/pages/order?type=all"
        open-type="navigate"
        hover-class="none"
        class="myOrderNavItem"
      >
        <image
          src="/static/tabs/favorites.png"
          mode="scaleToFill"
        />
        <text>收藏</text>
      </navigator>
      <navigator
        url="/pagesMember/address/address"
        open-type="navigate"
        hover-class="none"
        class="myOrderNavItem"
      >
        <image
          src="/static/tabs/address.png"
          mode="scaleToFill"
        />
        <text>收货地址</text>
      </navigator>
      <view class="myOrderNavItem" @click="onLogout">
        <image
          src="/static/tabs/logout.png"
          mode="scaleToFill"
        />
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import PetNavBar from '@/components/PetNavBar.vue';
import { useMemberStore } from '@/stores'

onShow(() => {
  const memberStore = useMemberStore()
  if (!memberStore.profile?.token) {
    uni.navigateTo({ url: '/pages/login/login' })
  }
})

const onLogout = () => {
  uni.showModal({
    title: '提示',
    content: '小主，您真的要退出么?',
    success: (res) => {
      if (res.confirm) {
        const memberStore = useMemberStore()
        memberStore.clearProfile()
        uni.showToast({ icon: 'success', title: '退出成功' })
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },
  })
}
</script>

<style lang="scss">
@use './styles/my.scss';
</style>
