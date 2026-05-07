/**
 * 添加拦截器:
 *   拦截 request 请求
 *   拦截 uploadFile 文件上传
 *
 * 1. 非 http 开头需拼接地址（开发环境拼接本地后端，生产环境使用配置地址）
 * 2. 请求超时 60s
 * 3. 添加小程序端请求头标识 source-client: miniapp
 * 4. 添加 JWT token 请求头标识
 * 5. 租户信息通过 header Tenant 传递
 */

import { useMemberStore } from '@/stores'
import type { DataResult } from '@/types/global'

// Vite 环境变量：开发环境 localhost:8080，生产环境 api.mypet.com
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 1. 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2. 请求超时, 默认 60s
    options.timeout = 60000
    // 3. 添加小程序端请求头标识 + 租户信息
    const memberStore = useMemberStore()
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
      Tenant: 'xlong',
    }
    // 4. 添加 token 请求头标识
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = 'Bearer ' + token
    }
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

/**
 * 请求函数
 * @param  UniApp.RequestOptions
 * @returns Promise
 *  1. 返回 Promise 对象
 *  2. 获取数据成功 → 提取核心数据 res.data
 *  3. 获取数据失败 → 401 清理 token 跳登录 / 其他错误轻提示 / 网络错误提示
 */
export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<DataResult<T>>((resolve, reject) => {
    uni.request({
      ...options,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as DataResult<T>)
        } else if (res.statusCode === 401) {
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          uni.showToast({
            icon: 'none',
            title: (res.data as DataResult<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

/*
模拟DataResult 结果（保留用于未实现接口的降级）
*/
export const mockDataResult = <T>(code: string, msg: string, result: T): DataResult<T> => {
  return { code, msg, result }
}
