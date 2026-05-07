import type { PageResult } from '../types/global'
import type { OrderDetail, OrderItem, OrderListParams, OrderPreResult, OrderCreateParams } from '../types/order'
import type { AddressItem } from '../types/address'
import { OrderState } from '../enums/order'
import { mockDataResult } from '../utils/http'
import { useCartStore } from '../stores/modules/cart'

const productImages = ['/static/images/product-s1.png', '/static/images/product-s2.png', '/static/images/product-s3.png']

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const names = [
  '尼可露混合膨润土猫砂除臭抑菌2.5Kg/袋',
  '好命天生原味木薯除臭猫砂1.5Kg/袋',
  '鲜朗低温烘培猫粮幼猫专用2.5Kg/袋',
  '小佩智能猫砂盆卡通漂亮适合犬猫',
  '网易严选全价猫粮高营养富蛋白5Kg',
  'pidan猫咪冻干零食鸡肉味50g',
  '里兜混合猫砂超级吸水除臭抑菌6L/袋',
]
const attrsList = ['2.5Kg/袋', '1.5Kg/袋', '5Kg/袋', '6L/袋', '白色 标准款', '鸡肉味 50g', '豆腐砂']

const receivers = ['曹某人', '张先生', '李女士']
const phones = ['15921769899', '13812345678', '18612345678']

const delay = () => new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

let idCounter = 100
const nextId = () => String(idCounter++)

// ---- 共享地址池 ----
const createMockAddress = (): AddressItem => ({
  id: nextId(),
  receiver: pick(receivers),
  contact: pick(phones),
  provinceCode: '440000',
  cityCode: '441300',
  countyCode: pick(['惠阳区', '大亚湾区']),
  address: pick(['星河丹堤花园F区2栋3023', '科技园路88号创新大厦1201', '中山路168号阳光花园6栋501']),
  isDefault: Math.random() > 0.5 ? 1 : 0,
  fullLocation: `广东省 惠州市 ${pick(['惠阳区', '大亚湾区'])}`,
})

const addresses = Array.from({ length: 3 }, () => createMockAddress())
if (!addresses.find((v) => v.isDefault)) addresses[0].isDefault = 1

// ---- 预订单临时缓存：skuId → 完整商品信息 ----
const preProductCache = new Map<string, {
  id: string
  name: string
  attrsText: string
  price: number
  oldPrice: number
  picture: string
}>()

// 生成预订单商品，并存入缓存以便后续提交时使用
const createMockPreProducts = () => {
  const itemCount = randInt(1, 3)
  const products: OrderPreResult['products'] = []
  let totalPrice = 0
  let totalPayPrice = 0

  for (let i = 0; i < itemCount; i++) {
    const oldPrice = randInt(20, 200)
    const payPrice = +(oldPrice * (0.75 + Math.random() * 0.2)).toFixed(2)
    const qty = randInt(1, 3)
    const itemTotalPrice = +(oldPrice * qty).toFixed(2)
    const itemTotalPayPrice = +(payPrice * qty).toFixed(2)
    const skuId = nextId()

    // 存入缓存
    preProductCache.set(skuId, {
      id: nextId(),
      name: pick(names),
      attrsText: pick(attrsList),
      price: payPrice,
      oldPrice,
      picture: pick(productImages),
    })

    totalPrice += itemTotalPrice
    totalPayPrice += itemTotalPayPrice

    products.push({
      id: preProductCache.get(skuId)!.id,
      skuId,
      name: preProductCache.get(skuId)!.name,
      attrsText: preProductCache.get(skuId)!.attrsText,
      count: qty,
      price: String(oldPrice),
      payPrice: String(payPrice),
      picture: preProductCache.get(skuId)!.picture,
      totalPrice: String(itemTotalPrice),
      totalPayPrice: String(itemTotalPayPrice),
    })
  }

  return {
    products,
    summary: {
      totalPrice: +totalPrice.toFixed(2),
      postFee: 0,
      totalPayPrice: +totalPayPrice.toFixed(2),
    },
  }
}

// ---- 共享订单池 ----
const pool: OrderItem[] = Array.from({ length: 8 }, (_, i) => {
  const skuCount = randInt(1, 3)
  let totalMoney = 0
  let payMoney = 0

  const skus: OrderDetail['skus'] = Array.from({ length: skuCount }, () => {
    const oldPrice = randInt(30, 300)
    const price = +(oldPrice * (0.75 + Math.random() * 0.2)).toFixed(2)
    const qty = randInt(1, 3)
    totalMoney += oldPrice * qty
    payMoney += price * qty
    return {
      id: nextId(),
      productId: nextId(),
      name: pick(names),
      attrsText: pick(attrsList),
      quantity: qty,
      price,
      oldPrice,
      picture: pick(productImages),
    }
  })

  return {
    id: String(10001 + i),
    orderState: OrderState.ToDeliver,
    skus,
    receiverContact: pick(receivers),
    receiverMobile: pick(phones),
    receiverAddress: '广东省惠州市惠阳区星河丹堤花园F区2栋3023',
    createTime: `2026-0${(i % 9) + 1}-${String(10 + i).padStart(2, '0')} 12:30:00`,
    totalMoney: +totalMoney.toFixed(2),
    payMoney: +payMoney.toFixed(2),
    actualPayMoney: +(payMoney * 0.9).toFixed(2),
    totalNum: skus.reduce((sum, s) => sum + s.quantity, 0),
  }
})

const formatDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// ===================== 订单列表 =====================

export const getMemberOrderAPI = async (params: OrderListParams) => {
  await delay()
  const { page = 1, pageSize = 5, orderState } = params

  const filtered = orderState === 0
    ? [...pool]
    : pool.filter((v) => v.orderState === orderState)

  const sorted = filtered.sort((a, b) => Number(b.id) - Number(a.id))
  const counts = sorted.length
  const pages = Math.ceil(counts / pageSize)
  const start = (page - 1) * pageSize
  const items = sorted.slice(start, start + pageSize)

  return mockDataResult<PageResult<OrderItem>>('200', 'success', {
    items,
    counts,
    page,
    pages,
    pageSize,
  })
}

// ===================== 订单详情 =====================

export const getMemberOrderByIdAPI = async (id: string) => {
  await delay()
  const order = pool.find((v) => v.id === id)
  if (!order) return mockDataResult<OrderDetail>('200', 'success', {} as OrderDetail)
  const detail: OrderDetail = {
    id: order.id,
    orderState: order.orderState,
    skus: order.skus,
    receiverContact: order.receiverContact,
    receiverMobile: order.receiverMobile,
    receiverAddress: order.receiverAddress,
    createTime: order.createTime,
    totalMoney: order.totalMoney,
    payMoney: order.payMoney,
    actualPayMoney: order.actualPayMoney,
  }
  return mockDataResult<OrderDetail>('200', 'success', detail)
}

// ===================== 确认收货 =====================

export const putMemberOrderReceiptByIdAPI = async (id: string) => {
  await delay()
  const order = pool.find((v) => v.id === id)
  if (order) order.orderState = OrderState.Received
  const detail: OrderDetail = order ? {
    id: order.id,
    orderState: order.orderState,
    skus: order.skus,
    receiverContact: order.receiverContact,
    receiverMobile: order.receiverMobile,
    receiverAddress: order.receiverAddress,
    createTime: order.createTime,
    totalMoney: order.totalMoney,
    payMoney: order.payMoney,
    actualPayMoney: order.actualPayMoney,
  } : {} as OrderDetail
  return mockDataResult<OrderDetail>('200', 'success', detail)
}

// ===================== 取消订单 =====================

export const getMemberOrderCancelByIdAPI = async (id: string, data: { cancelReason: string }) => {
  await delay()
  const order = pool.find((v) => v.id === id)
  if (order) order.orderState = OrderState.Cancelled
  const detail: OrderDetail = order ? {
    id: order.id,
    orderState: order.orderState,
    skus: order.skus,
    receiverContact: order.receiverContact,
    receiverMobile: order.receiverMobile,
    receiverAddress: order.receiverAddress,
    createTime: order.createTime,
    totalMoney: order.totalMoney,
    payMoney: order.payMoney,
    actualPayMoney: order.actualPayMoney,
  } : {} as OrderDetail
  return mockDataResult<OrderDetail>('200', 'success', detail)
}

// ===================== 删除订单 =====================

export const deleteMemberOrderAPI = async (id: string) => {
  await delay()
  const idx = pool.findIndex((v) => v.id === id)
  if (idx >= 0) pool.splice(idx, 1)
  return mockDataResult<boolean>('200', 'success', true)
}

// ===================== 预付订单（购物车结算） =====================

export const getMemberOrderPreAPI = async () => {
  await delay()
  // 从本地购物车中读取已选中的商品作为预订单数据源
  const cartStore = useCartStore()
  const cartItems = [...cartStore.getMemberLocalCart().values()].filter((v) => v.selected)

  let products: OrderPreResult['products']
  let summary: { totalPrice: number; postFee: number; totalPayPrice: number }

  if (cartItems.length > 0) {
    products = cartItems.map((item) => {
      const totalPrice = +(item.price * item.count).toFixed(2)
      const totalPayPrice = +(item.nowPrice * item.count).toFixed(2)
      return {
        id: item.id,
        skuId: item.skuId,
        name: item.name,
        attrsText: item.attrsText,
        count: item.count,
        price: String(item.price),
        payPrice: String(item.nowPrice),
        picture: item.picture,
        totalPrice: String(totalPrice),
        totalPayPrice: String(totalPayPrice),
      }
    })
    summary = {
      totalPrice: +products.reduce((sum, p) => sum + Number(p.totalPrice), 0).toFixed(2),
      postFee: 0,
      totalPayPrice: +products.reduce((sum, p) => sum + Number(p.totalPayPrice), 0).toFixed(2),
    }
  } else {
    const mock = createMockPreProducts()
    products = mock.products
    summary = mock.summary
  }

  return mockDataResult<OrderPreResult>('200', 'success', {
    products,
    summary,
    userAddresses: [...addresses],
  })
}

// ===================== 预付订单（立即购买） =====================

export const getMemberOrderPreNowAPI = async (data: { skuId: string; count: string; addressId?: string }) => {
  await delay()
  const qty = parseInt(data.count) || 1
  const oldPrice = randInt(20, 200)
  const payPrice = +(oldPrice * (0.75 + Math.random() * 0.2)).toFixed(2)
  const totalPrice = +(oldPrice * qty).toFixed(2)
  const totalPayPrice = +(payPrice * qty).toFixed(2)
  const skuId = nextId()

  preProductCache.set(skuId, {
    id: nextId(),
    name: pick(names),
    attrsText: pick(attrsList),
    price: payPrice,
    oldPrice,
    picture: pick(productImages),
  })

  return mockDataResult<OrderPreResult>('200', 'success', {
    products: [{
      id: preProductCache.get(skuId)!.id,
      skuId,
      name: preProductCache.get(skuId)!.name,
      attrsText: preProductCache.get(skuId)!.attrsText,
      count: qty,
      price: String(oldPrice),
      payPrice: String(payPrice),
      picture: preProductCache.get(skuId)!.picture,
      totalPrice: String(totalPrice),
      totalPayPrice: String(totalPayPrice),
    }],
    summary: {
      totalPrice,
      postFee: 0,
      totalPayPrice,
    },
    userAddresses: [...addresses],
  })
}

// ===================== 预付订单（再次购买） =====================

export const getMemberOrderRepurchaseByIdAPI = async (id: string) => {
  await delay()
  const order = pool.find((v) => v.id === id)

  if (!order) {
    const { products, summary } = createMockPreProducts()
    return mockDataResult<OrderPreResult>('200', 'success', { products, summary, userAddresses: [...addresses] })
  }

  // 基于已有订单的 sku 生成预订单，保持数据连续性
  const products: OrderPreResult['products'] = order.skus.map((sku) => {
    const payPrice = sku.price
    const totalPrice = +(sku.oldPrice * sku.quantity).toFixed(2)
    const totalPayPrice = +(sku.price * sku.quantity).toFixed(2)
    const newSkuId = nextId()

    preProductCache.set(newSkuId, {
      id: sku.productId,
      name: sku.name,
      attrsText: sku.attrsText,
      price: payPrice,
      oldPrice: sku.oldPrice,
      picture: sku.picture,
    })

    return {
      id: sku.productId,
      skuId: newSkuId,
      name: sku.name,
      attrsText: sku.attrsText,
      count: sku.quantity,
      price: String(sku.oldPrice),
      payPrice: String(payPrice),
      picture: sku.picture,
      totalPrice: String(totalPrice),
      totalPayPrice: String(totalPayPrice),
    }
  })

  const totalPrice = +products.reduce((sum, p) => sum + Number(p.totalPrice), 0).toFixed(2)
  const totalPayPrice = +products.reduce((sum, p) => sum + Number(p.totalPayPrice), 0).toFixed(2)

  return mockDataResult<OrderPreResult>('200', 'success', {
    products,
    summary: { totalPrice, postFee: 0, totalPayPrice },
    userAddresses: [...addresses],
  })
}

// ===================== 提交订单 =====================

export const postMemberOrderAPI = async (data: OrderCreateParams) => {
  await delay()
  const orderId = nextId()

  // 从缓存中查找预订单商品信息，构建完整订单
  const skus: OrderDetail['skus'] = data.products.map((p) => {
    const cached = preProductCache.get(p.skuId)
    if (cached) {
      return {
        id: p.skuId,
        productId: cached.id,
        name: cached.name,
        attrsText: cached.attrsText,
        quantity: p.count,
        price: cached.price,
        oldPrice: cached.oldPrice,
        picture: cached.picture,
      }
    }
    // 缓存未命中时随机生成
    const oldPrice = randInt(20, 200)
    const price = +(oldPrice * (0.75 + Math.random() * 0.2)).toFixed(2)
    return {
      id: p.skuId,
      productId: nextId(),
      name: pick(names),
      attrsText: pick(attrsList),
      quantity: p.count,
      price,
      oldPrice,
      picture: pick(productImages),
    }
  })

  // 清理已使用的缓存
  data.products.forEach((p) => preProductCache.delete(p.skuId))

  const totalNum = skus.reduce((sum, s) => sum + s.quantity, 0)
  const payMoney = +skus.reduce((sum, s) => sum + s.price * s.quantity, 0).toFixed(2)
  const totalMoney = +skus.reduce((sum, s) => sum + s.oldPrice * s.quantity, 0).toFixed(2)

  // 查找地址
  const addr = addresses.find((v) => v.id === data.addressId)

  const order: OrderItem = {
    id: orderId,
    orderState: OrderState.ToDeliver,
    skus,
    receiverContact: addr?.receiver ?? pick(receivers),
    receiverMobile: addr?.contact ?? pick(phones),
    receiverAddress: addr ? `${addr.fullLocation} ${addr.address}` : '广东省惠州市惠阳区星河丹堤花园F区2栋3023',
    createTime: formatDate(),
    totalMoney,
    payMoney,
    actualPayMoney: +(payMoney * 0.9).toFixed(2),
    totalNum,
  }

  pool.unshift(order)
  return mockDataResult<{ id: string }>('200', 'success', { id: orderId })
}
