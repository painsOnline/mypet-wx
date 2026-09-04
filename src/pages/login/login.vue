<script setup lang="ts">
import { postLoginWxMinQuickAPI } from '@/services/login'
import { useMemberStore } from '@/stores'
import type { LoginResult } from '@/types/member'
import { onLoad , onShareAppMessage, onShareTimeline} from '@dcloudio/uni-app'
import { shareAppMsg, shareTimeline } from '@/utils/useGlobalShare'
import { ref } from 'vue'

onShareAppMessage(() => shareAppMsg())
onShareTimeline(() => shareTimeline())


const loading = ref(false)

// 快速登录：wx.login() → code → 后端换 openid
const quickLogin = async () => {
  loading.value = true
  try {
    const loginRes = await wx.login()
    if (!loginRes.code) {
      uni.showToast({ icon: 'none', title: '获取登录凭证失败' })
      return
    }
    const res = await postLoginWxMinQuickAPI({ code: loginRes.code })
    loginSuccess(res.result)
  } catch (e) {
    uni.showToast({ icon: 'none', title: '登录失败，请重试' })
  } finally {
    loading.value = false
  }
}

const loginSuccess = (profile: LoginResult) => {
  const memberStore = useMemberStore()
  memberStore.setProfile(profile)
  uni.showToast({ icon: 'success', title: '登录成功' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}
</script>

<template>
  <view class="viewport">
    <image class="login-bg" src="/static/images/shop_bg.jpg" mode="aspectFill" />
    <view class="login">
      <view class="button-privacy-wrap">
        <button
          class="button phone"
          :disabled="loading"
          @click="quickLogin"
        >
          <text class="icon icon-phone"></text>
          {{ loading ? '登录中...' : '快速登录' }}
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './styles/login.scss';
</style>
