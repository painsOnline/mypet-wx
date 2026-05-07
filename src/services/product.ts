import type { ProductDetail } from '@/types/product'
import { mockDataResult } from '@/utils/http'

const productImages = ['/static/images/product-s1.png', '/static/images/product-s2.png', '/static/images/product-s3.png']
const productDetailImages = [
  '/static/images/product_detail1.png',
  '/static/images/product_detail2.png',
  '/static/images/product_detail3.png',
  '/static/images/product_detail4.png',
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const rand = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(2)
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const names = [
  '尼可露豆腐猫砂6L/袋原味膨润土除臭猫砂',
  '好命天生木薯混合猫砂除臭强2.5Kg/袋',
  '鲜朗低温烘培幼猫猫粮1.5Kg',
  '好命天生经典膨润土猫砂10Kg',
  '网易严选全价猫粮高营养富蛋白5Kg',
  '小佩智能猫砂盆卡通漂亮适合犬猫',
  'pidan猫咪冻干零食鸡肉味50g',
  '里兜混合猫砂超级吸水除臭抑菌6L',
  '皇家贵宾犬粮小型犬专用3Kg',
  '麦富迪狗狗磨牙棒牛肉味200g',
]
const descs = ['品质优选，宠物最爱', '限时特惠，性价比高', '进口原料，安全健康', '销量领先，口碑之选', '新品上市，值得一试']
const brands = ['好命天生', '尼可露', '鲜朗', '网易严选', '小佩', 'pidan', '麦富迪', '皇家']

const delay = () => new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

let idCounter = 1
const nextId = () => String(idCounter++)

/**
 * 商品详情
 * @param id 商品id
 */
export const getProductByIdAPI = async (id: string) => {
  await delay()

  const name = pick(names)
  const price = rand(15, 300)
  const oldPrice = +(price + rand(5, 80)).toFixed(2)
  // 主图随机
  const mainPicture = pick(productImages)
  // 轮播图：第一张与主图一致，后面补全
  const carouselPictures = [
    mainPicture,
    ...productImages.filter((v) => v !== mainPicture),
  ]

  // 生成 SKU 规格
  const specTypes = [
    { name: '规格', values: ['1.5Kg/袋', '2.5Kg/袋', '5Kg/袋', '6L/袋', '10Kg/袋', '50g', '200g', '500g'] },
    { name: '口味', values: ['原味', '鸡肉味', '牛肉味', '海鲜味'] },
    { name: '尺寸', values: ['小号', '中号', '大号', '特大号'] },
  ]

  const specCount = randInt(1, 2)
  const selectedSpecs = specTypes.slice(0, specCount).map((st) => {
    const valCount = randInt(1, Math.min(3, st.values.length))
    return {
      name: st.name,
      values: st.values.slice(0, valCount).map((v) => ({
        name: v,
        available: Math.random() > 0.2,
        desc: v,
        picture: '',
      })),
    }
  })

  // 生成 SKU 列表
  const skuCount = randInt(1, 3)
  const skus = Array.from({ length: skuCount }, () => {
    const skuPrice = rand(15, 300)
    const skuSpecs = selectedSpecs.map((s) => ({
      name: s.name,
      valueName: pick(s.values).name,
    }))
    return {
      id: nextId(),
      inventory: randInt(20, 500),
      oldPrice: +(skuPrice + rand(5, 40)).toFixed(2),
      picture: pick(productImages),
      price: skuPrice,
      skuCode: `S${randInt(10000, 99999)}`,
      specs: skuSpecs,
    }
  })

  // 详情属性
  const properties = [
    { name: '品牌', value: pick(brands) },
    { name: '适用对象', value: pick(['猫', '狗', '猫狗通用']) },
    { name: '产地', value: pick(['国产', '进口']) },
    { name: '保质期', value: `${randInt(6, 24)}个月` },
    { name: '储存方式', value: pick(['常温', '冷藏', '避光保存']) },
  ]

  const result: ProductDetail = {
    id,
    name,
    desc: pick(descs),
    price,
    oldPrice,
    picture: mainPicture,
    mainPictures: carouselPictures,
    details: {
      properties,
      pictures: productDetailImages,
    },
    skus,
    specs: selectedSpecs,
  }
  return mockDataResult('200', 'success', result)
}
