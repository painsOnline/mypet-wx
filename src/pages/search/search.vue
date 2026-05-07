<template>
  <!-- SKU弹窗组件 -->
  <PetSkuPopup ref="skuPopRef" @add-to-cart="onAddToCart" />
  <view v-if="mounted" class="viewport">
    <!-- 自定义头部 -->
    <view class="nav-header" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
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
          <text class="search-icon">🔍</text>
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
            :url="`/pages/product/product?id=${product.id}`"
          >
            <image class="product-img" :src="product.picture" />
            <view class="product-info">
              <view class="product-name">{{ product.name }}</view>
              <view class="product-desc">{{ product.desc }}</view>
              <view class="product-price-row">
                <text class="now-price">¥{{ product.price }}</text>
                <text class="old-price">¥{{ product.oldPrice }}</text>
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
import { ref, computed, onMounted } from 'vue'
import { SkuMode } from '@/enums/product'
import { getSearchAPI } from '@/services/search'
import type { ProductDetail } from '@/types/product'

const mounted = ref(false)
const { safeAreaInsets } = uni.getSystemInfoSync()
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
  background: #fff;
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
  color: #333;
}
.back-arrow {
  font-size: 40rpx;
  line-height: 1;
  margin-right: 4rpx;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
.search-bar {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx 16rpx;
  background: #fff;
  gap: 16rpx;
}
.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 0 20rpx;
}
.search-icon { font-size: 28rpx; margin-right: 10rpx; }
.search-input { flex: 1; font-size: 28rpx; }
.clear-btn { font-size: 28rpx; color: #999; padding: 0 10rpx; }
.cancel-btn { font-size: 28rpx; color: #333; }
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
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx;
}
.product-item {
  width: calc(50% - 20rpx);
  margin: 10rpx;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}
.product-img {
  width: 100%;
  height: 340rpx;
}
.product-info {
  padding: 16rpx;
}
.product-name {
  font-size: 28rpx;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
.product-price-row {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}
.now-price { font-size: 28rpx; color: #cf4444; font-weight: 600; }
.old-price { font-size: 22rpx; color: #999; text-decoration: line-through; margin-left: 10rpx; flex: 1; }
.add-btn image {
  width: 44rpx;
  height: 44rpx;
}
.loading-text {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
