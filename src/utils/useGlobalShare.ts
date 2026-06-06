/**
 * 全局分享配置函数。uni-app 编译器要求 onShareAppMessage / onShareTimeline
 * 必须直接在页面 <script setup> 中调用，无法通过 mixin 注入。
 *
 * 每个页面加 3 行即可:
 *   import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
 *   import { shareAppMsg, shareTimeline } from '@/utils/useGlobalShare'
 *   onShareAppMessage(() => shareAppMsg())
 *   onShareTimeline(() => shareTimeline())
 */
const SHARE_TITLE = '鑫钱猫宠物用品-主粮|零食|日用|药品-货到付款-免配送费'

export function shareAppMsg() {
  const shopCode = uni.getStorageSync('shopCode') || ''
  return {
    title: SHARE_TITLE,
    path: shopCode ? `/pages/index/index?shop=${encodeURIComponent(shopCode)}` : '/pages/index/index',
    imageUrl: '/static/images/page_index.png',
  }
}

export function shareTimeline() {
  return { title: SHARE_TITLE, imageUrl: '/static/images/page_index.png' }
}
