import {ProductItem} from './global'

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

/** 商品详情: 包含详情属性 + 详情图片 */
export type Details = {
  /** 商品规格集合[ 展示类规格 ] */
  properties: DetailsPropertyItem[]
  /** 详情图片 */
  pictures: string[]
  /** 商品详情 */
  detail: string
}

/** 属性信息 (WX-API.md 2.2) */
export type DetailsPropertyItem = {
  /** 值ID */
  valueId: string
  /** 规格值显示名 */
  valueName: string
  /** 规格ID */
  specId: string
  /** 规格名称 */
  specName: string
  /** 兼容旧字段 */
  name?: string
  value?: string
}

/** sku信息 */
export type SkuItem = {
  /** sku id */
  id: string
  /** sku 虚拟库存 */
  virtualInventory: number
  /** sku 原价 */
  oldPrice: number
  /** sku 图片 */
  picture: string
  /** sku 当前价 */
  price: number
  /** 规格集合[ 规格信息 ] */
  specs: SkuSpecItem[]
}

/** 规格信息 (WX-API.md 2.2) */
export type SkuSpecItem = {
  /** 规格名称 */
  specName: string
  /** 可选值名称 */
  valueName: string
  /** 规格ID */
  specId: string
  /** 值ID */
  valueId: string
  /** 兼容旧字段 */
  name?: string
}

/** 可选规格信息 (WX-API.md 2.2) */
export type SpecItem = {
  /** 规格名称 */
  specName: string
  /** 规格ID */
  specId: string
  /** 排序 */
  sort: number
  /** 输入类型 */
  inputType: string
  /** 可选值集合[ 可选值信息 ] */
  values: SpecValueItem[]
  /** 兼容旧字段 */
  name?: string
}

/** 可选值信息 (WX-API.md 2.2) */
export type SpecValueItem = {
  /** 是否可售 */
  available: boolean
  /** 可选值名称 */
  valueName: string
  /** 值ID */
  valueId: string
  /** 可选值图片链接 */
  picture: string
  /** 兼容旧字段 */
  name?: string
}