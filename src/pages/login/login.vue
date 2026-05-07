<script setup lang="ts">
import { postLoginAPI, postLoginWxMinAPI, postLoginWxMinSimpleAPI } from '@/services/login'
import { useMemberStore } from '@/stores'
import type { LoginResult } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// #ifdef MP-WEIXIN
// 获取 code 登录凭证
let code = ''
onLoad(async () => {
  const res = await wx.login()
  code = res.code
})

// 获取用户手机号码
const onGetphonenumber: UniHelper.ButtonOnGetphonenumber = async (ev) => {
  const { encryptedData, iv } = ev.detail
  const res = await postLoginWxMinAPI({ code, encryptedData, iv })
  loginSuccess(res.result)
}
// #endif

// 模拟手机号码快捷登录（开发练习）
const onGetphonenumberSimple = async () => {
  const res = await postLoginWxMinSimpleAPI('13123456789')
  loginSuccess(res.result)
}

const loginSuccess = (profile: LoginResult) => {
  // 保存会员信息
  const memberStore = useMemberStore()
  memberStore.setProfile(profile)
  // 成功提示
  uni.showToast({ icon: 'success', title: '登录成功' })
  setTimeout(() => {
    // 页面跳转
    // uni.switchTab({ url: '/pages/my/my' })
    uni.navigateBack()
  }, 500)
}

// #ifdef H5
// 传统表单登录，测试账号：13123456789 密码：123456，测试账号仅开发学习使用。
const form = ref({
  account: '13123456789',
  password: '',
})

// 表单提交
const onSubmit = async () => {
  const res = await postLoginAPI(form.value)
  loginSuccess(res.result)
}
// #endif
</script>

<template>
  <view class="viewport">
    <!-- <view class="logo">
      <image
        src="https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/logo_icon.png"
      ></image>
    </view> -->
    <view class="login">
      <!-- 网页端表单登录 -->
      <!-- #ifdef H5 -->
      <input v-model="form.account" class="input" type="text" placeholder="请输入用户名/手机号码" />
      <input v-model="form.password" class="input" type="text" password placeholder="请输入密码" />
      <button @tap="onSubmit" class="button phone">登录</button>
      <!-- #endif -->

      <!-- 小程序端授权登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="button-privacy-wrap">
        <button
          :hidden="isAgreePrivacy"
          class="button-opacity button phone"
          @tap="checkedAgreePrivacy"
        >
          请先阅读并勾选协议
        </button>
        <button class="button phone" open-type="getPhoneNumber" @getphonenumber="onGetphonenumber">
          <text class="icon icon-phone"></text>
          手机号快捷登录
        </button>
      </view>
      <!-- #endif -->
      <view class="extra">
        <view class="caption">
          <text>其他登录方式</text>
        </view>
        <view class="options">
          <!-- 通用模拟登录 -->
          <button @tap="onGetphonenumberSimple">
            <text class="icon icon-phone">模拟快捷登录</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './styles/login.scss';
</style>
