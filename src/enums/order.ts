/** 订单状态枚举 */
export enum OrderState {
  /** 待配送 */
  ToDeliver = 1,
  /** 配送中 */
  Delivering = 2,
  /** 已收货 */
  Received = 3,
  /** 已完成 */
  Completed = 4,
  /** 已取消 */
  Cancelled = 5,
}