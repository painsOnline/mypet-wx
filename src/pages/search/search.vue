<template>
  <!-- SKU弹窗组件 -->
  <PetSkuPopup ref="skuPopRef" @add-to-cart="onAddToCart" />
  <view v-if="mounted" class="viewport">
    <!-- 自定义头部 -->
    <view class="nav-header" :style="{ paddingTop: topSafe + 'px' }">
      <view class="nav-bar">
        <view class="nav-back" @tap="goBack">
          <text class="back-arrow">‹</text>
          <text>返回</text>
        </view>
        <text class="nav-title">商品搜索</text>
      </view>
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input-wrap">
          <text class="search-icon"></text>
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜索商品"
            confirm-type="search"
            @confirm="doSearch"
          />
          <text v-if="keyword" class="clear-btn" @tap="keyword=''">✕</text>
        </view>
        <text class="cancel-btn" @tap="goBack">取消</text>
      </view>
    </view>

    <!-- 历史搜索 -->
    <view v-if="!keyword && !hasSearched" class="history">
      <view class="history-header">
        <text class="title">历史搜索</text>
        <text class="clear" @tap="clearHistory">清除</text>
      </view>
      <view class="history-tags">
        <text
          v-for="(h, i) in historyList"
          :key="i"
          class="tag"
          @tap="keyword=h;doSearch()"
        >{{ h }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-else class="results">
      <scroll-view
        enable-back-to-top
        scroll-y
        class="result-scroll"
        @scrolltolower="loadMore"
      >
        <view class="product-list">
          <navigator
            v-for="product in productList"
            :key="product.id"
            class="product-item"
            hover-class="none"
            :url="`/pages/product/product?id=${product.id}&shop=${getShopCode()}`"
          >
            <image class="product-img" :src="product.picture" />
            <view class="product-info">
              <view class="product-name">{{ product.name }}</view>
              <view class="product-desc">{{ product.desc }}</view>
              <view class="product-price-row">
                <view class="product-price">
                  <text class="now-price">优惠价￥{{ product.price }}</text>
                  <text class="old-price">￥{{ product.oldPrice }}</text>
                </view>
                <view class="add-btn" @click.stop="onOpenSkuPopup(product)">
                  <image src="/static/tabs/add-now.png" />
                </view>
              </view>
            </view>
          </navigator>
        </view>
        <view class="loading-text" v-if="loading || isFinish">
          {{ isFinish ? '没有更多了哟...' : '搜索中...' }}
        </view>
      </scroll-view>
    </view>
  </view>
  <PetShopCart ref="shopCartRef" />
</template>

<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { shareAppMsg, shareTimeline } from '@/utils/useGlobalShare'
import { ref, computed, onMounted } from 'vue'
import { SkuMode } from '@/enums/product'
import { getSearchAPI } from '@/services/search'
import type { ProductDetail } from '@/types/product'
import { getShopCode } from '@/utils/shop'

onShareAppMessage(() => shareAppMsg())
onShareTimeline(() => shareTimeline())


const mounted = ref(false)
const { safeAreaInsets, statusBarHeight } = uni.getSystemInfoSync()
const topSafe = Math.max(safeAreaInsets?.top || 0, statusBarHeight || 0)
onMounted(() => { mounted.value = true })

const keyword = ref('')
const productList = ref<ProductDetail[]>([])
const loading = ref(false)
const page = ref(1)
const hasSearched = ref(false)
const isFinish = ref(false)

// --- 历史搜索 ---
const HISTORY_KEY = 'search_history'
let historyList = ref<string[]>(uni.getStorageSync(HISTORY_KEY) || [])

function saveKeyword(kw: string) {
  if (!kw.trim()) return
  let list = [...historyList.value]
  list = list.filter(h => h !== kw)
  list.unshift(kw)
  if (list.length > 10) list = list.slice(0, 10)
  historyList.value = list
  uni.setStorageSync(HISTORY_KEY, list)
}
function clearHistory() {
  historyList.value = []
  uni.removeStorageSync(HISTORY_KEY)
}

// --- 搜索 ---
async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  saveKeyword(kw)
  page.value = 1
  hasSearched.value = true
  loading.value = true
  isFinish.value = false
  try {
    const res = await getSearchAPI({ keyword: kw, page: 1, pageSize: 10 })
    productList.value = res.result?.items || []
    isFinish.value = productList.value.length >= (res.result?.counts || 0)
  } catch { productList.value = [] }
  finally { loading.value = false }
}

async function loadMore() {
  if (loading.value || isFinish.value) return
  page.value++
  loading.value = true
  try {
    const res = await getSearchAPI({ keyword: keyword.value.trim(), page: page.value, pageSize: 10 })
    const items = res.result?.items || []
    productList.value.push(...items)
    isFinish.value = productList.value.length >= (res.result?.counts || 0)
  } catch {}
  finally { loading.value = false }
}

// --- 加入购物车 ---
const shopCartRef = ref()
const skuPopRef = ref()
function onOpenSkuPopup(product: ProductDetail) {
  skuPopRef.value?.openSkuPopup(product, SkuMode.Cart)
}
function onAddToCart(cartItem: any) {
  shopCartRef.value?.addCart(cartItem)
}

// --- 返回 ---
function goBack() { uni.navigateBack() }
</script>

<style lang="scss">
.viewport {
  height: 100vh;
  background: #f4f4f4;
}
.nav-header {
  background: #FF8833;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  position: relative;
}
.nav-back {
  position: absolute;
  left: 20rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #fff;
}
.back-arrow {
  font-size: 40rpx;
  line-height: 1;
  margin-right: 4rpx;
  color: #fff;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}
.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx 20rpx;
  background: #fff;
  gap: 16rpx;
}
.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 24rpx;
}
.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 14rpx;
  border: 3rpx solid #999;
  border-radius: 50%;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    right: -5rpx;
    bottom: -5rpx;
    width: 8rpx;
    height: 3rpx;
    background: #999;
    border-radius: 2rpx;
    transform: rotate(45deg);
  }
}
.search-input { flex: 1; font-size: 30rpx; }
.clear-btn { font-size: 30rpx; color: rgba(255,255,255,0.7); padding: 0 12rpx; }
.cancel-btn { font-size: 30rpx; color: #fff; }
.history {
  padding: 30rpx;
}
.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  .title { font-size: 30rpx; font-weight: 600; }
  .clear { font-size: 24rpx; color: #999; }
}
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.tag {
  padding: 10rpx 24rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
}
.results {
  flex: 1;
  overflow: hidden;
}
.result-scroll {
  height: calc(100vh - 100rpx);
}
.product-list {
  padding: 10rpx 20rpx;
}
.product-item {
  display: flex;
  flex-direction: row;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.product-img {
  width: 180rpx;
  height: 180rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.product-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #000;
  word-break: break-all;
  margin-bottom: 8rpx;
}
.product-desc {
  font-size: 24rpx;
  color: #C8C8C8;
  margin-bottom: 12rpx;
}
.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.product-price {
  flex: 1;
  min-width: 0;
}
.now-price { font-size: 28rpx; color: #FE3D2D; }
.old-price { font-size: 24rpx; color: #6a7076; text-decoration: line-through; margin-left: 8rpx; }
.add-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  image {
    width: 36rpx;
    height: 36rpx;
  }
}
.loading-text {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
