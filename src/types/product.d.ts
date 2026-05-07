/** 商品信息 */
export type ProductDetail = {
  /** id */
  id: string
  /** 商品名称 */
  name: string
  /** 商品描述 */
  desc: string
  /** 当前价格 */
  price: number
  /** 原价 */
  oldPrice: number
  /** 商品详情: 包含详情属性 + 详情图片 */
  details: Details
  /** 商品图片 */
  picture: string
  /** 主图图片集合[ 主图图片链接 ] */
  mainPictures: string[]
  /** sku集合[ sku信息 ] */
  skus: SkuItem[]
  /** 可选规格集合备注[ 可选规格信息 ] */
  specs: SpecItem[]
}

/** sku信息 */
export type SkuItem = {
  /** sku id */
  id: string
  /** sku 库存 */
  inventory: number
  /** sku 原价 */
  oldPrice: number
  /** sku 图片 */
  picture: string
  /** sku 当前价 */
  price: number
  /** sku 编码 */
  skuCode: string
  /** 规格集合[ 规格信息 ] */
  specs: SkuSpecItem[]
}

/** 规格信息 */
export type SkuSpecItem = {
  /** 规格名称 */
  name: string
  /** 可选值名称 */
  valueName: string
}

/** 可选规格信息 */
export type SpecItem = {
  /** 规格名称 */
  name: string
  /** 可选值集合[ 可选值信息 ] */
  values: SpecValueItem[]
}

/** 可选值信息 */
export type SpecValueItem = {
  /** 是否可售 */
  available: boolean
  /** 可选值备注 */
  desc: string
  /** 可选值名称 */
  name: string
  /** 可选值图片链接 */
  picture: string
}