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
          @tap="onCategoryTap(item.id)"
        >
          <text class="name">
            {{ item.name }}
          </text>
        </view>
      </scroll-view>
      <!-- 右侧：分类商品 -->
      <scroll-view enable-back-to-top class="productList" scroll-y @scrolltolower="loadMore">
        <view class="productListContent">
          <view class="panel">
            <navigator
              v-for="product in productList"
              :key="product.id"
              class="productItem"
              hover-class="none"
              :url="`/pages/product/product?id=${product.id}&shop=${getShopCode()}`"
            >
              <image class="productImg" :src="product.picture" />
              <view class="productInfo">
                <view class="productName">{{product.name}}</view>
                <view class="productAttr">{{ product.desc }}</view>
                <view class="productImportBox">
                  <view class="productPrice">
                    <text class="nowPrice">优惠价￥{{product.price}}</text>
                    <text class="oldPrice">￥{{product.oldPrice}}</text>
                  </view>
                  <view class="opCart" @click.stop="onOpenSkuPopup(product)">
                    <image src="/static/tabs/add-now.png" style="width:36rpx;height:36rpx" />
                  </view>
                </view>
              </view>
            </navigator>
          </view>
          <view class="loading-text" v-if="isLoading || (isFinish && productList.length)">
            {{ isFinish ? '没有更多了哟...' : '数据正在加载中...' }}
          </view>
        </view>
      </scroll-view>
    </view>
  <PetShopCart ref="shopCartRef" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow, onHide, onReady, onUnload , onShareAppMessage, onShareTimeline} from '@dcloudio/uni-app'
import { shareAppMsg, shareTimeline } from '@/utils/useGlobalShare'
import type { CategoryItem } from '@/types/category'
import type { ProductDetail } from '@/types/product'
import PetNavBar from '@/components/PetNavBar.vue';
import { SkuMode} from '@/enums/product'
import { getCategoryListAPI, getProductsByCategoryIdAPI } from '@/services/category'
import { getShopCode } from '@/utils/shop'

onShareAppMessage(() => shareAppMsg())
onShareTimeline(() => shareTimeline())


const categoryList = ref<CategoryItem[]>([])
const activeCategory = ref('')
const productList = ref<ProductDetail[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const pageSize = 6

// 下滚游标
const catId = ref('')
const page = ref(1)

const skuPopRef = ref()
const shopCartRef = ref()

const onOpenSkuPopup = (product: ProductDetail, popMod: SkuMode = SkuMode.Cart) => {
  skuPopRef.value.openSkuPopup(product, popMod)
}
const onAddToCart = (cartItem: any) => {
  shopCartRef.value?.addCart(cartItem)
}

// 手动点击左侧分类
const onCategoryTap = (catIdTapped: string) => {
  activeCategory.value = catIdTapped
  catId.value = catIdTapped
  page.value = 1
  productList.value = []
  isFinish.value = false
  loadMore()
}

const loadMore = async () => {
  if (isLoading.value) return
  if (isFinish.value) {
    uni.showToast({ icon: 'none', title: '没有更多数据~' })
    return
  }
  isLoading.value = true
  const res = await getProductsByCategoryIdAPI({
    id: catId.value,
    page: page.value,
    pageSize,
  })
  isLoading.value = false
  productList.value = [...productList.value, ...res.result.items]

  if (page.value < res.result.pages) {
    page.value++
    return
  }
  await advanceDown()
}

const advanceDown = async () => {
  const idx = categoryList.value.findIndex(c => c.id === catId.value)
  if (idx < 0 || idx >= categoryList.value.length - 1) {
    isFinish.value = true
    return
  }
  activeCategory.value = categoryList.value[idx + 1].id
  catId.value = activeCategory.value
  page.value = 1

  isLoading.value = true
  const res = await getProductsByCategoryIdAPI({
    id: catId.value,
    page: 1,
    pageSize,
  })
  isLoading.value = false
  productList.value = [...productList.value, ...res.result.items]

  if (page.value < res.result.pages) {
    page.value = 2
  } else {
    await advanceDown()
  }
}

const getCategoryList = async () => {
  const res = await getCategoryListAPI()
  categoryList.value = res.result
  if (res.result.length > 0) {
    const firstId = res.result[0].id
    activeCategory.value = firstId
    catId.value = firstId
  }
}

onReady(async () => {
  await getCategoryList()
  if (activeCategory.value) loadMore()
})

onLoad(() => {})
onShow(() => {})
onHide(() => {})
onUnload(() => {})
</script>

<style lang="scss">
@use './styles/category.scss';
</style>
