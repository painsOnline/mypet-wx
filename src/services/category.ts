import type { CategoryItem } from '@/types/category'
import type { ProductDetail } from '@/types/product'
import type { PageResult } from '@/types/global'
import { mockDataResult } from '@/utils/http'

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

const categoryNames = ['品质猫砂', '品牌猫粮', '品牌狗粮', '猫咪零食', '狗狗零食', '猫咪玩具', '狗狗玩具']

let idCounter = 1
const nextId = () => String(idCounter++)

const delay = () => new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

// 随机生成商品详情
const createMockProduct = (): ProductDetail => {
  const name = pick(names)
  const price = rand(15, 200)
  const oldPrice = +(price + rand(5, 60)).toFixed(2)
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
 * 分类列表-小程序
 */
export const getCategoryListAPI = async () => {
  await delay()
  const result: CategoryItem[] = categoryNames.map((name, i) => ({
    id: String(i + 1),
    name,
    picture: pick(productImages),
  }))
  return mockDataResult('000000', 'success', result)
}

/**
 * 根据分类ID获取分页商品列表
 * @param data categoryId + 分页参数
 */
export const getProductsByCategoryIdAPI = async (data: { id: string; page?: number; pageSize?: number }) => {
  await delay()
  const page = data.page ?? 1
  const pageSize = data.pageSize ?? 6

  // 总共最多 3 页，每页数据量略随机
  const totalPages = randInt(2, 3)
  // 当前页的实际条数（最后一页可能少于 pageSize）
  const isLastPage = page >= totalPages
  const actualSize = isLastPage ? randInt(pageSize - 3, pageSize) : pageSize

  // 总条数 = 前 (totalPages-1) 页满 + 最后一页随机
  const fullPageSize = pageSize
  const lastPageSize = randInt(pageSize - 3, pageSize)
  const totalCount = (totalPages - 1) * fullPageSize + lastPageSize

  const result: PageResult<ProductDetail> = {
    items: Array.from({ length: actualSize }, () => createMockProduct()),
    counts: totalCount,
    page,
    pages: totalPages,
    pageSize,
  }
  return mockDataResult('000000', 'success', result)
}
