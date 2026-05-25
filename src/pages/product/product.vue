<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import PetSkuPopup from '@/components/PetSkuPopup.vue'
import { getProductByIdAPI } from '@/services/product'
import type { ProductDetail } from '@/types/product'
import { SkuMode} from '@/enums/product'
import { useShopStore } from '@/stores/modules/shop'
import { useCartStore } from '@/stores'
import { getShopCode } from '@/utils/shop'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 接收页面参数
const query = defineProps<{
  id: string
}>()

// 获取商品详情信息
const product = ref<ProductDetail>()

// 分享图临时路径
const shareImagePath = ref('')

// 生成分享图
const generateShareImage = (): Promise<string> => {
  return new Promise((resolve) => {
    const prod = product.value
    if (!prod) { resolve(''); return }
    const W = 500
    const H = 400
    const query = uni.createSelectorQuery()
    query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]?.node) { resolve(''); return }
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      canvas.width = W
      canvas.height = H
      // 白色背景
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)
      // 上半部分渐变色背景
      const topGrad = ctx.createLinearGradient(0, 0, 0, 100)
      topGrad.addColorStop(0, '#FFF8F0')
      topGrad.addColorStop(1, '#FFFFFF')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, W, 140)
      // 价格
      ctx.fillStyle = '#E03131'
      ctx.font = 'bold 42px sans-serif'
      const priceText = `¥${prod.price}`
      const priceW = ctx.measureText(priceText).width
      ctx.fillText(priceText, 24, 72)
      // 分隔线
      ctx.fillStyle = '#ddd'
      ctx.fillRect(24 + priceW + 16, 42, 2, 40)
      // 标题
      ctx.fillStyle = '#333'
      ctx.font = '26px sans-serif'
      const title = prod.name || '宠物用品'
      const maxTitleW = W - 24 - priceW - 48 - 24
      const chars = title.split('')
      let line1 = ''
      let line2 = ''
      for (const ch of chars) {
        if (ctx.measureText(line1 + ch).width < maxTitleW && line2 === '') {
          line1 += ch
        } else {
          line2 += ch
          if (ctx.measureText(line2 + '…').width >= maxTitleW) {
            line2 = line2.slice(0, -1) + '…'
            break
          }
        }
      }
      const titleX = 24 + priceW + 36
      ctx.fillText(line1, titleX, 58)
      if (line2) ctx.fillText(line2, titleX, 90)
      // 卡片边框
      const cardX = 16
      const cardY = 120
      const cardW = W - 32
      const cardH = H - 136
      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = '#f0e8dc'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardW, cardH, 12)
      ctx.fill()
      ctx.stroke()
      // 阴影
      ctx.shadowColor = 'rgba(0,0,0,0.06)'
      ctx.shadowBlur = 16
      ctx.shadowOffsetY = 4
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      // 横幅：邻居们都在抢
      const bannerH = 48
      const bannerGrad = ctx.createLinearGradient(0, cardY, 0, cardY + bannerH)
      bannerGrad.addColorStop(0, '#FF8833')
      bannerGrad.addColorStop(1, '#FFB366')
      ctx.fillStyle = bannerGrad
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardW, bannerH, [12, 12, 0, 0])
      ctx.fill()
      // 横幅文字
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('邻居们都在抢', W / 2, cardY + 30)
      ctx.textAlign = 'left'
      // 加载并绘制商品主图
      const imgX = cardX + 10
      const imgY = cardY + bannerH + 8
      const imgW = cardW - 20
      const imgH = cardH - bannerH - 16
      const firstPic = prod.mainPictures?.[0]
      if (firstPic) {
        const img = canvas.createImage()
        img.onload = () => {
          const scale = Math.min(imgW / img.width, imgH / img.height)
          const dw = img.width * scale
          const dh = img.height * scale
          const dx = imgX + (imgW - dw) / 2
          const dy = imgY + (imgH - dh) / 2
          ctx.fillStyle = '#fafafa'
          ctx.fillRect(imgX, imgY, imgW, imgH)
          ctx.drawImage(img, dx, dy, dw, dh)
          canvas.toTempFilePath({
            x: 0, y: 0, width: W, height: H,
            destWidth: W * 2, destHeight: H * 2,
            fileType: 'jpg', quality: 0.9,
            success: (file) => resolve(file.tempFilePath),
            fail: () => resolve(''),
          })
        }
        img.onerror = () => resolve('')
        img.src = firstPic
      } else {
        canvas.toTempFilePath({
          x: 0, y: 0, width: W, height: H,
          destWidth: W * 2, destHeight: H * 2,
          fileType: 'jpg', quality: 0.9,
          success: (file) => resolve(file.tempFilePath),
          fail: () => resolve(''),
        })
      }
    })
  })
}

const getProductByIdData = async () => {
  const res = await getProductByIdAPI(query.id)
  product.value = res.result
  // 数据加载后生成分享图
  await nextTick()
  generateShareImage().then((path) => {
    shareImagePath.value = path
  })
}

// 页面加载
onLoad(async () => {
  await getProductByIdData()
  await nextTick()
  shopCartRef.value?.toggleVisible()
})

// 轮播图变化时
const currentIndex = ref(0)
const onChange: UniHelper.SwiperOnChange = (ev) => {
  currentIndex.value = ev.detail.current
}

// 点击图片时预览大图
const onTapImage = () => {
  const urls = product.value?.mainPictures
  if (!urls || urls.length === 0) return
  uni.previewImage({
    current: urls[currentIndex.value],
    urls,
  })
}

const skuPopRef = ref()
const shopCartRef = ref()

const onOpenSkuPopup = (product: ProductDetail, popMod: SkuMode = SkuMode.Both) => {
  skuPopRef.value.openSkuPopup(product, popMod)
}

const cartStore = useCartStore()
const cartCount = computed(() => {
  let total = 0
  for (const item of cartStore.getMemberLocalCart().values()) {
    total += item.count || 0
  }
  return total
})

const onAddToCart = (cartItem: any) => {
  shopCartRef.value?.addCart(cartItem)
}

const toggleCartVisible = () => {
  shopCartRef.value?.toggleVisible()
}

const selectArrText = computed(() => {
  return skuPopRef.value?.selectArr?.join(' ').trim() || '请选择商品规格'
})

// 店铺免配门槛
const { shopData, fetchShop } = useShopStore()
fetchShop()
const freeShippingAmount = computed(() => shopData.value?.freeShippingAmount ?? 0)
const meetFreeShipping = computed(() => {
  return product.value ? Number(product.value.price) >= freeShippingAmount.value : false
})
const buyNowText = computed(() => meetFreeShipping.value ? '立即购买' : `满${freeShippingAmount.value}元起配`)

// 处理商品详情HTML，使图片和文本适配小程序宽度
const detailHtml = computed(() => {
  let html = product.value?.details?.detail || ''
  if (!html) return ''
  // 移除 img 标签固定的宽高属性，添加自适应样式
  html = html.replace(/<img[^>]*>/g, (match) => {
    return match
      .replace(/width="[^"]*"/g, '')
      .replace(/height="[^"]*"/g, '')
      .replace(/style="[^"]*"/g, '')
      .replace('<img ', '<img style="max-width:100%;height:auto;display:block" ')
  })
  return `<div style="width:100%;overflow:hidden;word-break:break-all">${html}</div>`
})

// 微信分享
onShareAppMessage(() => {
  const price = product.value?.price
  const name = product.value?.name || '宠物用品'
  return {
    title: price ? `¥${price}|${name}` : name,
    path: `/pages/product/product?id=${query.id}&shop=${getShopCode()}`,
    imageUrl: shareImagePath.value || product.value?.mainPictures?.[0] || '',
  }
})

</script>

<template>
  <!-- 分享图生成画布（隐藏） -->
  <canvas type="2d" id="shareCanvas" style="position:fixed;left:200vw;top:0;width:500px;height:400px" />
  <!-- SKU弹窗组件 -->
  <PetSkuPopup ref="skuPopRef" @add-to-cart="onAddToCart" />
  <scroll-view enable-back-to-top scroll-y class="viewport">
    <!-- 基本信息 -->
    <view class="goods">
      <!-- 商品主图 -->
      <view class="preview">
        <swiper @change="onChange" circular>
          <swiper-item v-for="item in product?.mainPictures" :key="item">
            <image class="image" @tap="onTapImage" mode="aspectFill" :src="item" />
          </swiper-item>
        </swiper>
        <view class="indicator">
          <text class="current">{{ currentIndex + 1 }}</text>
          <text class="split">/</text>
          <text class="total">{{ product?.mainPictures.length }}</text>
        </view>
      </view>

      <!-- 商品简介 -->
      <view class="meta">
        <view class="price">
          <view class="now_price">
            <text class="symbol">到手价¥</text>
            <text class="number">{{ product?.price }}</text>
          </view>
          <view class="old_price">
            <text>原价¥</text>
            <text class="old_price_number">{{ product?.oldPrice }}</text>
          </view>
        </view>
        <view class="name ellipsis">{{ product?.name }}</view>
        <view class="desc"> {{ product?.desc }} </view>
      </view>

      <!-- 操作面板 -->
      <view class="action">
        <view @tap="onOpenSkuPopup(product!)" class="item arrow">
          <text class="label">选择</text>
          <text class="text ellipsis"> {{ selectArrText }} </text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail panel">
      <view class="title">
        <text>详情</text>
      </view>
      <view class="content">
        <view class="properties">
          <!-- 属性详情 -->
          <view class="item" v-for="item in product?.details.properties" :key="item.specId">
            <text class="label">{{ item.specName }}</text>
            <text class="value">{{ item.valueName }}</text>
          </view>
        </view>
        <!-- 图片详情 -->
        <image
          class="image"
          v-for="item in product?.details.pictures"
          :key="item"
          mode="widthFix"
          :src="item"
        ></image>
        <!-- 商品详情HTML -->
        <rich-text
          v-if="detailHtml"
          :nodes="detailHtml"
          class="detail-html"
        />
      </view>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <view v-if="product" class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <button class="icons-button" open-type="share">
        <image class="btn-icon" src="/static/images/share.png" mode="aspectFit" />
        <text>分享</text>
      </button>
      <view class="icons-button cart-btn" @click="toggleCartVisible">
        <view class="cart-icon-wrap">
          <image class="btn-icon" src="/static/images/cart.png" mode="aspectFit" />
          <text v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</text>
        </view>
        <text>购物车</text>
      </view>
    </view>
    <view class="buttons">
      <view @tap="onOpenSkuPopup(product, SkuMode.Cart)" class="addcart"> 加入购物车 </view>
      <view @tap="meetFreeShipping ? onOpenSkuPopup(product, SkuMode.Buy) : undefined" class="payment" :class="{ 'payment--disabled': !meetFreeShipping }">
        <text v-if="meetFreeShipping" class="payment-text">立即购买</text>
        <text v-else class="payment-text--small">满{{ freeShippingAmount }}元起配</text>
      </view>
    </view>
  </view>
  <PetShopCart ref="shopCartRef" hideOnMask />
</template>

<style lang="scss">
@use './styles/product.scss';
</style>
