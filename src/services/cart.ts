import type { CartItem } from '@/types/cart'
import { mockDataResult } from '@/utils/http'

const productImages = ['/static/images/product-s1.png', '/static/images/product-s2.png', '/static/images/product-s3.png']

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const names = [
  '尼可露豆腐猫砂6L/袋原味膨润土除臭猫砂',
  '好命天生木薯混合猫砂除臭强2.5Kg/袋',
  '鲜朗低温烘培幼猫猫粮1.5Kg',
  '好命天生经典膨润土猫砂10Kg',
  '网易严选全价猫粮高营养富蛋白5Kg',
  'pidan猫咪冻干零食鸡肉味50g',
  '里兜混合猫砂超级吸水除臭抑菌6L',
]
const attrsList = ['2.5Kg/袋', '1.5Kg/袋', '5Kg/袋', '6L/袋', '鸡肉味 50g', '白色 标准款']

let idCounter = 200
const nextId = () => String(idCounter++)

const delay = () => new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

// 生成随机商品
const createRandomItem = (): CartItem => {
  const price = randInt(15, 200)
  const nowPrice = +(price * (0.7 + Math.random() * 0.25)).toFixed(2)
  return {
    id: nextId(),
    skuId: nextId(),
    name: pick(names),
    picture: pick(productImages),
    count: randInt(1, 5),
    price,
    nowPrice,
    stock: randInt(20, 200),
    selected: Math.random() > 0.3,
    attrsText: pick(attrsList),
    isEffective: true,
  }
}

// 共享购物车池（模拟数据库）
let cartPool: CartItem[] = Array.from({ length: 4 }, () => createRandomItem())

// 上次变化时间戳
let lastMutationTime = Date.now()

/**
 * 获取购物车列表
 */
export const getMemberCartAPI = async () => {
  await delay()

  // 间隔超过 15s 时，有小概率发生数据变化
  const now = Date.now()
  if (now - lastMutationTime > 7200000 && Math.random() > 0.5) {
    lastMutationTime = now
    // 随机增删改
    const r = Math.random()
    if (r < 0.33 && cartPool.length > 1) {
      // 随机移除一个
      cartPool.splice(randInt(0, cartPool.length - 1), 1)
    } else if (r < 0.66) {
      // 随机增加一个
      cartPool.push(createRandomItem())
    } else if (cartPool.length > 0) {
      // 随机修改一个商品的数量
      const item = cartPool[randInt(0, cartPool.length - 1)]
      item.count = randInt(1, 8)
    }
  }

  return mockDataResult('200', 'success', cartPool.map((v) => ({ ...v })))
}

/**
 * 重置购物车（同步本地数据到数据库）
 */
export const resetMemberCartAPI = async (data: CartItem[]) => {
  await delay()
  cartPool = data.map((v) => ({ ...v }))
  lastMutationTime = Date.now()
  return mockDataResult('200', 'success', true)
}
