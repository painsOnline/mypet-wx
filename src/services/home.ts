import type { BannerItem, HotItem, HotListParams } from '@/types/home'
import type { PageResult } from '@/types/global'
import { mockDataResult } from '@/utils/http'

const bannerImages = ['/static/images/banner-1.png', '/static/images/banner-2.png', '/static/images/banner-3.png']
const productImages = ['/static/images/product-s1.png', '/static/images/product-s2.png', '/static/images/product-s3.png']

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
  '疯狂小狗狗狗零食鸡肉干500g',
]
const descs = ['品质优选，宠物最爱', '限时特惠，性价比高', '进口原料，安全健康', '销量领先，口碑之选', '新品上市，值得一试']
const specNames = ['规格', '口味', '尺寸']
const specValues: Record<string, string[]> = {
  '规格': ['1.5Kg/袋', '2.5Kg/袋', '5Kg/袋', '6L/袋', '10Kg/袋', '50g', '200g', '500g'],
  '口味': ['原味', '鸡肉味', '牛肉味', '海鲜味'],
  '尺寸': ['小号', '中号', '大号'],
}

let idCounter = 1
const nextId = () => String(idCounter++)

const delay = () => new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

const createMockProduct = (): HotItem => {
  const name = pick(names)
  const price = rand(15, 300)
  const oldPrice = +(price + rand(5, 80)).toFixed(2)
  const picture = pick(productImages)

  const specName = pick(specNames)
  const vals = specValues[specName]
  const valueCount = randInt(1, 3)
  const selectedSpec = {
    name: specName,
    values: vals.slice(0, valueCount).map((v) => ({
      name: v,
      available: true,
      desc: v,
      picture: '',
    })),
  }

  const chosenValue = pick(selectedSpec.values).name
  const skus = [{
    id: nextId(),
    inventory: randInt(20, 500),
    oldPrice,
    picture,
    price,
    skuCode: `S${randInt(10000, 99999)}`,
    specs: [{ name: specName, valueName: chosenValue }],
  }]

  return {
    id: nextId(),
    name,
    desc: pick(descs),
    price,
    oldPrice,
    picture,
    mainPictures: [picture, pick(productImages)],
    details: {
      properties: [
        { name: '品牌', value: pick(['好命天生', '尼可露', '鲜朗', '网易严选', '小佩', 'pidan']) },
        { name: '适用对象', value: pick(['猫', '狗', '猫狗通用']) },
        { name: '产地', value: pick(['国产', '进口']) },
      ],
      pictures: [pick(productImages), pick(productImages)],
    },
    skus,
    specs: [selectedSpec],
  }
}

/**
 * 首页-广告区域-小程序
 * @param distributionSite 广告区域展示位置（1为首页，2为分类商品页）默认1
 */
export const getHomeBannerAPI = async (distributionSite = 1) => {
  await delay()
  const result: BannerItem[] = bannerImages.map((img, i) => ({
    id: `banner-${i + 1}`,
    imgUrl: img,
    hrefUrl: '/pages/product/product',
    type: distributionSite,
  }))
  return mockDataResult('000000', 'success', result)
}

/**
 * 首页-热门推荐-小程序（分页）
 * @param data 分页参数
 */
export const getHomeHotAPI = async (data: HotListParams = {}) => {
  await delay()
  const page = data.page ?? 1
  const pageSize = data.pageSize ?? 6

  // 随机 2~4 页，每页实际条数随机波动
  const totalPages = randInt(2, 4)
  // 为每一页随机生成本页条数
  const pageSizes = Array.from({ length: totalPages }, () => randInt(pageSize - 2, pageSize))
  const totalCount = pageSizes.reduce((sum, s) => sum + s, 0)

  const actualSize = pageSizes[page - 1] ?? randInt(pageSize - 2, pageSize)

  const items = Array.from({ length: Math.max(actualSize, 0) }, () => createMockProduct())

  const result: PageResult<HotItem> = {
    items,
    counts: totalCount,
    page,
    pages: totalPages,
    pageSize,
  }
  return mockDataResult('000000', 'success', result)
}
