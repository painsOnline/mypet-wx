import type { LoginResult } from '@/types/member'
import { http } from '@/utils/http'

type LoginWxMinParams = {
  code: string
  encryptedData?: string
  iv?: string
}

/**
 * 小程序登录
 */
export const postLoginWxMinAPI = async (data: LoginWxMinParams) => {
  return http<LoginResult>({
    url: '/frontend/member/login/wxMin',
    method: 'POST',
    data,
  })
}

/**
 * 小程序登录_内测版
 */
export const postLoginWxMinSimpleAPI = async (phoneNumber: string) => {
  return http<LoginResult>({
    url: '/frontend/member/login/wxMin/simple',
    method: 'POST',
    data: { phoneNumber },
  })
}

type LoginParams = { account: string; password: string }

/**
 * 传统登录-用户名+密码
 */
export const postLoginAPI = async (data: LoginParams) => {
  return http<LoginResult>({
    url: '/frontend/member/login',
    method: 'POST',
    data,
  })
}
