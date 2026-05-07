import { OrderState } from "./../enums/order"
import { PageParams, PageResult } from "./global"

/** 订单列表 */
export type OrderList = {
  /** 数据集合    [ 订单信息 ] */
  items: OrderItem[]
}


/** 订单详情 返回信息 */
export type OrderDetail = {
  /** 订单编号 */
  id: string
  /** 订单状态，1待配送、2配送中、3已收货、4已完成、5已取消 */
  orderState: OrderState
  /** 商品集合 [ 商品信息 ] */
  skus: OrderSkuItem[]
  /** 收货人 */
  receiverContact: string
  /** 收货人手机 */
  receiverMobile: string
  /** 收货人地址 */
  receiverAddress: string
  /** 下单时间 */
  createTime: string
  /** 商品总价 */
  totalMoney: number
  /** 应付金额 */
  payMoney: number
  /** 实付金额 */
  actualPayMoney: number
}

/** 商品信息 */
export type OrderSkuItem = {
  /** sku id */
  id: string
  /** 商品 id */
  productId: string
  /** 商品名称 */
  name: string
  /** 商品属性文字 */
  attrsText: string
  /** 数量 */
  quantity: number
  /** 购买时单价 */
  price: number
  /** 原价 */
  oldPrice: number
  /** 图片地址 */
  picture: string
}


/** 订单列表参数 */
export type OrderListParams = PageParams & { orderState: number }

/** 订单列表 */
export type OrderListResult = PageResult<OrderItem>

/** 订单列表项 */
export type OrderItem = OrderDetail & {
  /** 总件数 */
  totalNum: number
}


/** 获取预付订单 返回信息 */
export type OrderPreResult = {
  /** 商品集合 [ 商品信息 ] */
  products: OrderPreProduct[]
  /** 结算信息 */
  summary: {
    /** 商品总价 */
    totalPrice: number
    /** 邮费 */
    postFee: number
    /** 应付金额 */
    totalPayPrice: number
  }
  /** 用户地址列表 [ 地址信息 ] */
  userAddresses: AddressItem[]
}

/** 商品信息 */
export type OrderPreProduct = {
  /** 属性文字，例如“颜色:瓷白色 尺寸：8寸” */
  attrsText: string
  /** 数量 */
  count: number
  /** id */
  id: string
  /** 商品名称 */
  name: string
  /** 实付单价 */
  payPrice: string
  /** 图片 */
  picture: string
  /** 原单价 */
  price: string
  /** SKUID */
  skuId: string
  /** 实付价格小计 */
  totalPayPrice: string
  /** 小计总价 */
  totalPrice: string
}

/** 提交订单 请求参数 */
export type OrderCreateParams = {
  /** 所选地址Id */
  addressId: string
  /** 配送时间类型，1为不限，2为工作日，3为双休或假日 */
  deliveryTimeType: number
  /** 订单备注 */
  buyerMessage: string
  /** 商品集合[ 商品信息 ] */
  products: {
    /** 数量 */
    count: number
    /** skuId */
    skuId: string
  }[]
  /** 支付渠道：支付渠道，1为货到付款 */
  payChannel: 1
  /** 支付方式，1为货到付款 */
  payType: 1
}

/** 提交订单 返回信息 */
export type OrderCreateResult = {
  /** 订单Id */
  id: string
}