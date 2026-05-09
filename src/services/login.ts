import type { LoginResult } from '@/types/member'
import { http } from '@/utils/http'

type LoginParams = { code: string }

/**
 * 小程序快速登录：wx.login() code → 后端换 openid 登录
 */
export const postLoginWxMinQuickAPI = async (data: LoginParams) => {
  return http<LoginResult>({
    url: '/frontend/member/login/wxMin/quick',
    method: 'POST',
    data,
  })
}
