import type { LoginResult } from '@/types/member'
import { mockDataResult } from '@/utils/http'

type LoginWxMinParams = {
  code: string
  encryptedData?: string
  iv?: string
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

let idCounter = 1000
const nextId = () => idCounter++

const createLoginResult = (phone: string): LoginResult => ({
  id: nextId(),
  avatar: '/static/images/head.png',
  account: phone,
  mobile: phone,
  nickname: `用户${phone.slice(-4)}`,
  token: `mock_token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
})

/**
 * 小程序登录
 * @param data 请求参数
 */
export const postLoginWxMinAPI = async (_data: LoginWxMinParams) => {
  await delay()
  // 模拟根据微信返回的手机号（随机生成）
  const prefixes = ['159', '138', '186', '177', '136']
  const phone = prefixes[Math.floor(Math.random() * prefixes.length)] + String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  return mockDataResult('200', 'success', createLoginResult(phone))
}

/**
 * 小程序登录_内测版
 * @param phoneNumber 模拟手机号码
 */
export const postLoginWxMinSimpleAPI = async (phoneNumber: string) => {
  await delay()
  return mockDataResult('200', 'success', createLoginResult(phoneNumber))
}

type LoginParams = {
  account: string
  password: string
}
/**
 * 传统登录-用户名+密码
 * @param data 请求参数
 */
export const postLoginAPI = async (data: LoginParams) => {
  await delay()
  // 开发阶段：密码验证 123456
  if (data.password !== '123456') {
    return mockDataResult('401', '密码错误', {} as LoginResult)
  }
  return mockDataResult('200', 'success', createLoginResult(data.account))
}
