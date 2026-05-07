import type { AddressItem, AddressParams } from '@/types/address'
import type { DataResult } from '@/types/global'

// 随机 Mock 数据池
const receivers = ['曹某人', '张先生', '李女士', '王同学', '赵老师', '钱阿姨']
const provinces = [{ code: '440000', name: '广东省' }]
const cities: Record<string, { code: string; name: string }[]> = {
  '440000': [{ code: '441300', name: '惠州市' }],
}
const districts: Record<string, string[]> = {
  '441300': ['惠阳区', '大亚湾区'],
}
const streets = [
  '星河丹堤花园F区2栋3023',
  '科技园路88号创新大厦1201',
  '中山路168号阳光花园6栋501',
  '人民路999号幸福小区3栋102',
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const idCounter = { value: 1 }
const nextId = () => String(idCounter.value++)

const randomPhone = () => {
  const prefix = ['159', '138', '186', '177', '136'][Math.floor(Math.random() * 5)]
  const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  return prefix + suffix
}

// 共享地址池，确保 CRUD 操作同一数据源
let pool: AddressItem[] = []

const rebuildPool = () => {
  pool = Array.from({ length: 8 }, () => {
    const province = pick(provinces)
    const city = pick(cities[province.code])
    const district = pick(districts[city.code])
    const fullLocation = `${province.name} ${city.name} ${district}`
    return {
      id: nextId(),
      receiver: pick(receivers),
      contact: randomPhone(),
      provinceCode: province.code,
      cityCode: city.code,
      countyCode: district,
      address: pick(streets),
      isDefault: Math.random() > 0.6 ? 1 : 0,
      fullLocation,
    }
  })
  // 确保至少有一个默认地址
  if (!pool.find((v) => v.isDefault === 1) && pool.length > 0) {
    pool[0].isDefault = 1
  }
}

// 初始化数据
rebuildPool()

const delay = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200))

const ok = <T>(result: T): DataResult<T> => ({
  code: '000000',
  msg: 'success',
  result,
})

const buildFullLocation = (provinceCode: string, cityCode: string, countyCode: string) => {
  const p = provinces.find((v) => v.code === provinceCode)
  const c = p ? cities[p.code]?.find((v) => v.code === cityCode) : undefined
  const d = c ? districts[c.code]?.find((v) => v === countyCode) : undefined
  return `${p?.name ?? provinceCode} ${c?.name ?? cityCode} ${d ?? countyCode}`
}

/**
 * 添加收货地址
 */
export const postMemberAddressAPI = async (data: AddressParams) => {
  await delay()
  const fullLocation = buildFullLocation(data.provinceCode, data.cityCode, data.countyCode)
  const newItem: AddressItem = { id: nextId(), fullLocation, ...data }
  pool.unshift(newItem)
  return ok(newItem)
}

/**
 * 获取收货地址列表
 */
export const getMemberAddressAPI = async () => {
  await delay()
  return ok([...pool])
}

/**
 * 获取收货地址详情
 * @param id 地址id
 */
export const getMemberAddressByIdAPI = async (id: string) => {
  await delay()
  const item = pool.find((v) => v.id === id)
  if (!item) return { code: '000001', msg: '地址不存在', result: null as unknown as AddressItem }
  return ok({ ...item })
}

/**
 * 修改收货地址
 * @param id 地址id
 * @param data 表单数据
 */
export const putMemberAddressByIdAPI = async (id: string, data: AddressParams) => {
  await delay()
  const index = pool.findIndex((v) => v.id === id)
  if (index === -1) return { code: '000001', msg: '地址不存在', result: null as unknown as AddressItem }
  pool[index] = { ...pool[index], ...data }
  return ok({ ...pool[index] })
}

/**
 * 删除收货地址
 * @param id 地址id
 */
export const deleteMemberAddressByIdAPI = async (id: string) => {
  await delay()
  const index = pool.findIndex((v) => v.id === id)
  if (index === -1) return { code: '000001', msg: '地址不存在', result: id }
  pool.splice(index, 1)
  return ok(id)
}
