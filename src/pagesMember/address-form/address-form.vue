<script setup lang="ts">
import {
  getMemberAddressByIdAPI,
  postMemberAddressAPI,
  putMemberAddressByIdAPI,
} from '@/services/address'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 表单数据
const form = ref({
  receiver: '', // 收货人
  contact: '', // 联系方式
  fullLocation: '', // 省市区(前端展示)
  provinceCode: '', // 省份编码(后端参数)
  cityCode: '', // 城市编码(后端参数)
  countyCode: '', // 区/县编码(后端参数)
  address: '', // 详细地址
  isDefault: 0, // 默认地址，1为是，0为否
})

// 获取页面参数
const query = defineProps<{
  id?: string
}>()

// 获取收货地址详情数据
const getMemberAddressByIdData = async () => {
  if (query.id) {
    const res = await getMemberAddressByIdAPI(query.id)
    if (res.result) {
      Object.assign(form.value, res.result)
    }
  }
}

// 页面加载
onLoad(() => {
  getMemberAddressByIdData()
  uni.setNavigationBarTitle({ title: query.id ? '修改地址' : '新建地址' })
})

// 省市区数据：省→广东省，市→惠州市，区→惠阳区/大亚湾区
const regionData = [
  { name: '广东省', code: '440000', cities: [
    { name: '惠州市', code: '441300', districts: [
      { name: '惠阳区' },
      { name: '大亚湾区' },
    ]},
  ]},
]

// 多列选择器数据源
const multiArray = ref<string[][]>([[], [], []])
// 当前选中下标
const multiIndex = ref([0, 0, 0])

// 根据当前省下标更新市、区列
const updateMultiArray = (provinceIdx = 0) => {
  const p = regionData[provinceIdx]
  multiArray.value[0] = regionData.map((v) => v.name)
  multiArray.value[1] = p.cities.map((v) => v.name)
  multiArray.value[2] = p.cities[0]?.districts.map((v) => v.name) ?? []
}

// 初始化时根据已有数据设置默认选中项
if (form.value.countyCode) {
  const ci = regionData[0].cities[0].districts.findIndex((v) => v.name === form.value.countyCode)
  if (ci >= 0) multiIndex.value = [0, 0, ci]
}

updateMultiArray()

// 列滑动时联动更新
const onColumnChange = (ev: any) => {
  const { column, value } = ev.detail
  multiIndex.value[column] = value
  if (column === 0) {
    // 切换省时重置市、区列
    multiIndex.value[1] = 0
    multiIndex.value[2] = 0
    updateMultiArray(value)
  } else if (column === 1) {
    // 切换市时重置区列
    multiIndex.value[2] = 0
    const p = regionData[multiIndex.value[0]]
    multiArray.value[2] = p.cities[value].districts.map((v) => v.name)
  }
}

// 确认选择
const onRegionChange = (ev: any) => {
  const [pi, ci, di] = ev.detail.value as number[]
  const p = regionData[pi]
  const c = p.cities[ci]
  const d = c.districts[di]
  form.value.fullLocation = `${p.name} ${c.name} ${d.name}`
  form.value.provinceCode = p.code
  form.value.cityCode = c.code
  form.value.countyCode = d.name
}

// 收集是否默认收货地址
const onSwitchChange = (ev: any) => {
  form.value.isDefault = ev.detail.value ? 1 : 0
}

// 校验规则类型
interface FormRules {
  [key: string]: {
    rules: Array<{
      required?: boolean
      errorMessage?: string
      pattern?: RegExp
    }>
  }
}

// 表单 ref 类型
interface FormInstance {
  validate: () => Promise<any>
}

// 定义校验规则
const rules: FormRules = {
  receiver: {
    rules: [{ required: true, errorMessage: '请输入收货人姓名' }],
  },
  contact: {
    rules: [
      { required: true, errorMessage: '请输入联系方式' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  countyCode: {
    rules: [{ required: true, errorMessage: '请选择所在地区' }],
  },
  address: {
    rules: [{ required: true, errorMessage: '请选择详细地址' }],
  },
}

// 表单组件实例
const formRef = ref<FormInstance>()

// 提交表单
const onSubmit = async () => {
  try {
    // 表单校验
    await formRef.value?.validate?.()
    // 校验通过后再发送请求
    if (query.id) {
      // 修改地址请求
      await putMemberAddressByIdAPI(query.id, form.value)
    } else {
      // 新建地址请求
      await postMemberAddressAPI(form.value)
    }
    // 成功提示
    uni.showToast({ icon: 'success', title: query.id ? '修改成功' : '添加成功' })
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 400)
  } catch (error) {
    uni.showToast({ icon: 'error', title: '请填写完整信息' })
  }
}

// #ifdef H5 || APP-PLUS
const onCityChange = (ev: any) => {
  // 省市区
  const [province, city, county] = ev.detail.value
  // 收集后端所需的 code 数据
  Object.assign(form.value, {
    provinceCode: province.value,
    cityCode: city.value,
    countyCode: county.value,
  })
}
// #endif
</script>

<template>
  <view class="content">
    <view class="form-item">
      <text class="label">收货人</text>
      <input class="input" placeholder="请填写收货人姓名" v-model="form.receiver" />
    </view>
    <view class="form-item">
      <text class="label">手机号码</text>
      <input
        class="input"
        placeholder="请填写收货人手机号码"
        :maxlength="11"
        v-model="form.contact"
      />
    </view>
    <view class="form-item">
      <text class="label">所在地区</text>
      <!-- #ifdef MP-WEIXIN -->
      <picker
        mode="multiSelector"
        :range="multiArray"
        :value="multiIndex"
        @change="onRegionChange"
        @columnchange="onColumnChange"
        class="picker"
      >
        <view v-if="form.fullLocation">{{ form.fullLocation }}</view>
        <view v-else class="placeholder">请选择省/市/区(县)</view>
      </picker>
      <!-- #endif -->

      <!-- #ifdef H5 || APP-PLUS -->
      <uni-data-picker
        placeholder="请选择地址"
        popup-title="请选择城市"
        collection="opendb-city-china"
        field="code as value, name as text"
        orderby="value asc"
        :step-searh="true"
        self-field="code"
        parent-field="parent_code"
        @change="onCityChange"
        :clear-icon="false"
        v-model="form.countyCode"
      />
      <!-- #endif -->
    </view>
    <view class="form-item">
      <text class="label">详细地址</text>
      <input class="input" placeholder="街道、楼牌号等信息" v-model="form.address" />
    </view>
    <view class="form-item">
      <label class="label">设为默认地址</label>
      <switch
        @change="onSwitchChange"
        class="switch"
        color="#27ba9b"
        :checked="form.isDefault === 1"
      />
    </view>
  </view>
  <!-- 提交按钮 -->
  <button @tap="onSubmit" class="button">保存并使用</button>
</template>

<style lang="scss">
@use './styles/address-form.scss';
</style>
