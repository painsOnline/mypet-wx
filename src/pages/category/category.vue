<template>
  <!-- SKU弹窗组件 -->
  <PetSkuPopup ref="skuPopRef" @add-to-cart="onAddToCart" />
  <!-- 分类及商品列表 -->
  <view class="viewport">
    <!-- 自定义导航栏 -->
    <pet-nav-bar />
    <!-- 分类 -->
    <view class="categories">
      <!-- 左侧：一级分类 -->
      <scroll-view class="primary" scroll-y>
        <view
          v-for="item in categoryList"
          :key="item.id"
          class="item"
          :class="{ active: item.id === activeCategory }"
          @tap="activeCategory = item.id"
        >
          <text class="name">
            {{ item.name }}
          </text>
        </view>
      </scroll-view>
      <!-- 右侧：分类商品 -->
      <scroll-view enable-back-to-top class="productList" scroll-y @scrolltolower="getCategoryProductsData">
        <view class="productListContent">
          <!-- 分类商品列表区域 -->
          <view class="panel" :key="activeCategory">
            <navigator
              v-for="product in productList"
              :key="product.id"
              class="productItem"
              hover-class="none"
              :url="`/pages/product/product?id=${product.id}`"
            >
              <image class="productImg" :src="product.picture"></image>
              <view class="productInfo">
                <view class="productName">{{product.name}}</view>
                <view class="productAttr">{{ product.desc }}</view>
                <view class="productImportBox">
                  <view class="productPrice">
                    <text class="nowPrice">优惠价￥{{product.price}}</text>
                  </view>
                  <view>
                    <text class="oldPrice">￥{{product.oldPrice}}</text>
                    <view class="opCart" @click.stop="onOpenSkuPopup(product)">
                      <view class="product-control">
                        <view class="cont">
                          <image src="/static/tabs/add-now.png" />
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </navigator>
          </view>
          <view class="loading-text" v-if="isFinish || isLoading">
            {{ isFinish ? '没有更多了哟...' : '数据正在加载中...' }}
          </view>
        </view>
      </scroll-view>
    </view>
  <PetShopCart ref="shopCartRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onLoad, onShow, onHide, onReady, onUnload } from '@dcloudio/uni-app'
import type { CategoryItem } from '@/types/category'
import type { ProductDetail } from '@/types/product'
import PetNavBar from '@/components/PetNavBar.vue';
import { SkuMode} from '@/enums/product'
import { getCategoryListAPI, getProductsByCategoryIdAPI } from '@/services/category'

// 获取分类列表数据
const categoryList = ref<CategoryItem[]>([])
const activeCategory = ref('')

const getCategoryList = async () => {
  const res = await getCategoryListAPI()
  categoryList.value = res.result
  if (!activeCategory.value && res.result.length > 0) {
    activeCategory.value = res.result[0].id
  }
}

// 获取商品列表
const productList = ref<ProductDetail[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const isTriggered = ref(false)

// 分页参数
const page = ref(1)
const pageSize = 5

//sku弹窗
const skuPopRef = ref()
const shopCartRef = ref()

const onOpenSkuPopup = (product: ProductDetail, popMod: SkuMode = SkuMode.Both) => {
  skuPopRef.value.openSkuPopup(product, popMod)
}

const onAddToCart = (cartItem: any) => {
  shopCartRef.value?.addCart(cartItem)
}

const getCategoryProductsData = async () => {
  if (isLoading.value) return
  if (isFinish.value) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  isLoading.value = true
  const res = await getProductsByCategoryIdAPI({
    id: activeCategory.value,
    page: page.value,
    pageSize,
  })
  isLoading.value = false
  productList.value = [...productList.value, ...res.result.items]
  if (page.value < res.result.pages) {
    page.value++
  } else {
    isFinish.value = true
  }
}

// 监听分类切换，重置并重新请求
watch(
  () => activeCategory.value,
  () => {
    page.value = 1
    productList.value = []
    isFinish.value = false
    getCategoryProductsData()
  },
)

// 页面加载
onReady(async () => {
  await getCategoryList()
  // getCategoryList 中会设置 activeCategory，watch 自动触发 getCategoryProductsData
})

// 自定义下拉刷新
const onRefresherrefresh = async () => {
  isTriggered.value = true
  page.value = 1
  productList.value = []
  isFinish.value = false
  await getCategoryProductsData()
  isTriggered.value = false
}

onLoad(() => {})
onShow(() => {})
onHide(() => {})
onUnload(() => {})
</script>

<style lang="scss">
@use './styles/category.scss';
</style>
