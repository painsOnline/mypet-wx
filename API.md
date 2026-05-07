# 后端 API 接口清单

基础路径：`https://{host}/`

鉴权：除登录接口外，请求头需携带 `Authorization: {token}`（登录接口返回），小程序端附加 `source-client: miniapp`

统一响应格式：

```json
{
  "code": "200",
  "msg": "success",
  "result": { }
}
```

- `code`: string — 状态码，`200` 成功，`401` 未授权
- `msg`: string — 提示信息
- `result`: any — 业务数据，类型见各接口

---

## 1. 登录

### 1.1 小程序登录

| 项目 | 内容 |
|------|------|
| 名称 | 小程序微信授权登录 |
| 地址 | `POST /member/login/wxMin` |
| 说明 | 前端调用 `wx.login()` 获取 code，调用此接口换取 token |

**请求参数：**

```json
{
  "code": "081x4r000x...",
  "encryptedData": "xxx...",
  "iv": "xxx..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信 `wx.login()` 返回的临时凭证 |
| encryptedData | string | 否 | 微信 `getPhoneNumber` 返回的加密数据 |
| iv | string | 否 | 加密算法的初始向量 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": {
    "id": 1001,
    "avatar": "https://xxx.com/avatar.png",
    "account": "13812345678",
    "mobile": "13812345678",
    "nickname": "用户5678",
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 用户ID |
| avatar | string | 头像URL |
| account | string | 账号（手机号） |
| mobile | string | 手机号 |
| nickname | string | 用户昵称 |
| token | string | JWT 登录凭证 |

**逻辑：** 用 code 换取微信 openid/unionid，解密 `encryptedData` 获取手机号，查询或创建用户，生成 JWT token

---

### 1.2 模拟手机号快捷登录

| 项目 | 内容 |
|------|------|
| 名称 | 内测版快捷登录 |
| 地址 | `POST /member/login/wxMin/simple` |
| 说明 | 开发阶段绕过微信授权，直接用手机号登录 |

**请求参数：**

```json
{
  "phoneNumber": "13812345678"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phoneNumber | string | 是 | 手机号码 |

**返回结果：** 同 1.1

**逻辑：** 根据手机号查询或创建用户，直接返回 token

---

### 1.3 账号密码登录

| 项目 | 内容 |
|------|------|
| 名称 | 传统账号密码登录（H5端） |
| 地址 | `POST /member/login` |

**请求参数：**

```json
{
  "account": "13812345678",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 是 | 手机号 |
| password | string | 是 | 密码 |

**返回结果：** 成功同 1.1；密码错误时 `code: "401", msg: "密码错误"`

**逻辑：** 根据 account 查用户，bcrypt 校验密码

---

## 2. 首页

### 2.1 首页广告区域

| 项目 | 内容 |
|------|------|
| 名称 | 获取 Banner 轮播图 |
| 地址 | `GET /home/banner` |

**请求参数：**

`?distributionSite=1`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| distributionSite | number | 否 | 展示位置：1=首页，2=分类页，默认 1 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": [
    {
      "id": "banner-1",
      "imgUrl": "https://xxx.com/banner1.png",
      "hrefUrl": "/pages/product/product?id=xxx",
      "type": 1
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | Banner ID |
| imgUrl | string | 图片URL |
| hrefUrl | string | 点击跳转链接 |
| type | number | 展示位置（同请求参数） |

**逻辑：** 前端首页 onLoad 调用，根据 distributionSite 返回生效的 Banner

---

### 2.2 首页热门推荐（分页）

| 项目 | 内容 |
|------|------|
| 名称 | 热门推荐商品列表 |
| 地址 | `GET /home/hot` |

**请求参数：**

`?page=1&pageSize=6`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 6 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": {
    "items": [
      {
        "id": "201",
        "name": "尼可露豆腐猫砂6L/袋",
        "desc": "品质优选，宠物最爱",
        "price": 99.00,
        "oldPrice": 128.00,
        "picture": "https://xxx.com/product-s1.png",
        "mainPictures": [
          "https://xxx.com/product-s1.png",
          "https://xxx.com/product-s2.png"
        ],
        "details": {
          "properties": [
            { "name": "品牌", "value": "好命天生" },
            { "name": "适用对象", "value": "猫" },
            { "name": "产地", "value": "国产" }
          ],
          "pictures": [
            "https://xxx.com/detail1.png",
            "https://xxx.com/detail2.png"
          ]
        },
        "skus": [
          {
            "id": "202",
            "inventory": 200,
            "oldPrice": 128.00,
            "picture": "https://xxx.com/product-s1.png",
            "price": 99.00,
            "skuCode": "S12345",
            "specs": [
              { "name": "规格", "valueName": "2.5Kg/袋" }
            ]
          }
        ],
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "name": "2.5Kg/袋",
                "available": true,
                "desc": "2.5Kg/袋",
                "picture": ""
              }
            ]
          }
        ]
      }
    ],
    "counts": 25,
    "page": 1,
    "pages": 4,
    "pageSize": 6
  }
}
```

**result 分页结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| items | array | 当前页商品列表 |
| counts | number | 总条数 |
| page | number | 当前页码 |
| pages | number | 总页数 |
| pageSize | number | 每页条数 |

**商品 (items[]) 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 商品ID |
| name | string | 商品名称 |
| desc | string | 简介 |
| price | number | 当前售价 |
| oldPrice | number | 原价 |
| picture | string | 主图 |
| mainPictures | string[] | 轮播图 |
| details.properties | {name,value}[] | 详情属性 |
| details.pictures | string[] | 详情图 |
| skus[].id | string | SKU ID |
| skus[].inventory | number | 库存 |
| skus[].oldPrice | number | SKU原价 |
| skus[].price | number | SKU现价 |
| skus[].picture | string | SKU图片 |
| skus[].skuCode | string | SKU编码 |
| skus[].specs | array | 规格值 [{name, valueName}] |
| specs[].name | string | 规格名（如"规格""颜色"） |
| specs[].values | array | 可选项 [{name, available, desc, picture}] |

**逻辑：** 前端滚动到底加载下一页，维护 page 累加。后端按推荐算法排序分页返回

---

## 3. 分类

### 3.1 分类列表

| 项目 | 内容 |
|------|------|
| 名称 | 获取一级分类 |
| 地址 | `GET /category/list` |
| 参数 | 无 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": [
    { "id": "1", "name": "品质猫砂", "picture": "https://xxx.com/cat1.png" },
    { "id": "2", "name": "品牌猫粮", "picture": "https://xxx.com/cat2.png" }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 分类ID |
| name | string | 分类名称 |
| picture | string | 分类图片 |

**逻辑：** 前端左侧一级分类栏

---

### 3.2 按分类获取商品（分页）

| 项目 | 内容 |
|------|------|
| 名称 | 分类商品列表 |
| 地址 | `GET /category/product/list` |

**请求参数：**

`?id=1&page=1&pageSize=6`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 分类ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |

**返回结果：** 同 2.2 的分页结构，items 为商品列表

**逻辑：** 切换分类重置 page=1，滚动到底加载更多

---

## 4. 商品

### 4.1 商品详情

| 项目 | 内容 |
|------|------|
| 名称 | 获取商品详情 |
| 地址 | `GET /goods` |

**请求参数：**

`?id=201`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 商品ID |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": {
    "id": "201",
    "name": "尼可露豆腐猫砂6L/袋",
    "desc": "品质优选，宠物最爱",
    "price": 99.00,
    "oldPrice": 128.00,
    "picture": "https://xxx.com/product-s1.png",
    "mainPictures": [
      "https://xxx.com/product-s1.png",
      "https://xxx.com/product-s2.png"
    ],
    "details": {
      "properties": [
        { "name": "品牌", "value": "好命天生" },
        { "name": "适用对象", "value": "猫" },
        { "name": "产地", "value": "国产" }
      ],
      "pictures": [
        "https://xxx.com/detail1.png",
        "https://xxx.com/detail2.png"
      ]
    },
    "skus": [
      {
        "id": "202",
        "inventory": 200,
        "oldPrice": 128.00,
        "picture": "https://xxx.com/product-s1.png",
        "price": 99.00,
        "skuCode": "S12345",
        "specs": [
          { "name": "规格", "valueName": "2.5Kg/袋" }
        ]
      }
    ],
    "specs": [
      {
        "name": "规格",
        "values": [
          { "name": "2.5Kg/袋", "available": true, "desc": "2.5Kg/袋", "picture": "" }
        ]
      }
    ]
  }
}
```

字段说明同 2.2 商品字段

**逻辑：** 商品详情页加载时调用。前端根据 specs 渲染 SKU 选择弹窗，根据选中的 skuId 联动价格。mainPictures 支持大图预览

---

## 5. 购物车

### 5.1 获取购物车

| 项目 | 内容 |
|------|------|
| 名称 | 获取用户购物车 |
| 地址 | `GET /member/cart` |
| 参数 | 无（token 识别用户） |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": [
    {
      "id": "201",
      "skuId": "202",
      "name": "尼可露豆腐猫砂6L/袋",
      "picture": "https://xxx.com/product-s1.png",
      "count": 2,
      "price": 128.00,
      "nowPrice": 99.00,
      "stock": 200,
      "selected": true,
      "attrsText": "规格：2.5Kg/袋",
      "isEffective": true
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 商品ID |
| skuId | string | SKU ID |
| name | string | 商品名称 |
| picture | string | 图片 |
| count | number | 数量 |
| price | number | 加入时原价 |
| nowPrice | number | 加入时现价 |
| stock | number | 当前库存 |
| selected | boolean | 是否选中（结算时使用） |
| attrsText | string | 规格文字 |
| isEffective | boolean | 是否有效（下架则 false） |

**逻辑：** 前端采用"本地优先 + 后端同步"策略：初始化时合并本地和后端数据（以本地为准），每 10s 定时同步本地到后端，去结算前强制同步

---

### 5.2 同步购物车

| 项目 | 内容 |
|------|------|
| 名称 | 全量覆盖购物车 |
| 地址 | `PUT /member/cart` |

**请求参数：**

```json
[
  {
    "id": "201",
    "skuId": "202",
    "name": "尼可露豆腐猫砂6L/袋",
    "picture": "https://xxx.com/product-s1.png",
    "count": 2,
    "price": 128.00,
    "nowPrice": 99.00,
    "stock": 200,
    "selected": true,
    "attrsText": "规格：2.5Kg/袋",
    "isEffective": true
  }
]
```

请求体为购物车商品数组，字段同 5.1

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": true
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| result | boolean | true 表示同步成功 |

**逻辑：** 后端用请求体全量替换该用户购物车数据

---

## 6. 地址

### 6.1 获取地址列表

| 项目 | 内容 |
|------|------|
| 名称 | 获取用户所有地址 |
| 地址 | `GET /member/address` |
| 参数 | 无 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": [
    {
      "id": "1",
      "receiver": "曹某人",
      "contact": "15921769899",
      "provinceCode": "440000",
      "cityCode": "441300",
      "countyCode": "惠阳区",
      "address": "星河丹堤花园F区2栋3023",
      "isDefault": 1,
      "fullLocation": "广东省 惠州市 惠阳区"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 地址ID |
| receiver | string | 收货人 |
| contact | string | 联系电话 |
| provinceCode | string | 省编码 |
| cityCode | string | 市编码 |
| countyCode | string | 区县编码 |
| address | string | 详细地址 |
| isDefault | number | 是否默认，1=是 0=否 |
| fullLocation | string | 省市区中文拼接 |

**逻辑：** 前端地址管理页 onShow 调用，左滑可删除

---

### 6.2 获取地址详情

| 项目 | 内容 |
|------|------|
| 名称 | 获取单个地址 |
| 地址 | `GET /member/address/:id` |
| 参数 | `id` — 路径参数，地址ID |

**返回结果：** 单个地址对象，字段同 6.1

**逻辑：** 编辑地址页根据路由参数 id 调用，回填表单

---

### 6.3 新增地址

| 项目 | 内容 |
|------|------|
| 名称 | 添加收货地址 |
| 地址 | `POST /member/address` |

**请求参数：**

```json
{
  "receiver": "曹某人",
  "contact": "15921769899",
  "provinceCode": "440000",
  "cityCode": "441300",
  "countyCode": "惠阳区",
  "address": "星河丹堤花园F区2栋3023",
  "isDefault": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| receiver | string | 是 | 收货人姓名 |
| contact | string | 是 | 手机号 |
| provinceCode | string | 是 | 省编码 |
| cityCode | string | 是 | 市编码 |
| countyCode | string | 是 | 区编码 |
| address | string | 是 | 详细地址 |
| isDefault | number | 否 | 默认地址，1=是 0=否 |

**返回结果：** 新创建的地址对象（含 id、fullLocation），字段同 6.1

**逻辑：** 前端新建地址表单提交后调用，后端生成 ID 并拼接 fullLocation

---

### 6.4 修改地址

| 项目 | 内容 |
|------|------|
| 名称 | 修改收货地址 |
| 地址 | `PUT /member/address/:id` |
| 参数 | `id` — 路径参数；请求体同 6.3 |

**返回结果：** 更新后的地址对象

**逻辑：** 前端编辑页提交，有 id 参数时调用此接口

---

### 6.5 删除地址

| 项目 | 内容 |
|------|------|
| 名称 | 删除收货地址 |
| 地址 | `DELETE /member/address/:id` |
| 参数 | `id` — 路径参数 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": "1"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| result | string | 被删除的地址ID |

**逻辑：** 前端二次确认后调用，成功后刷新地址列表

---

## 7. 订单

### 7.1 订单列表（分页）

| 项目 | 内容 |
|------|------|
| 名称 | 获取订单列表 |
| 地址 | `GET /member/order` |

**请求参数：**

`?page=1&pageSize=5&orderState=0`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| orderState | number | 否 | 0=全部，1=待配送，2=配送中，3=已收货，4=已完成，5=已取消 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": {
    "items": [
      {
        "id": "10001",
        "orderState": 1,
        "skus": [
          {
            "id": "sku1",
            "productId": "201",
            "name": "尼可露豆腐猫砂6L/袋",
            "attrsText": "2.5Kg/袋",
            "quantity": 2,
            "price": 99.00,
            "oldPrice": 128.00,
            "picture": "https://xxx.com/product-s1.png"
          }
        ],
        "receiverContact": "曹某人",
        "receiverMobile": "15921769899",
        "receiverAddress": "广东省惠州市惠阳区星河丹堤花园F区2栋3023",
        "createTime": "2026-05-03 12:30:00",
        "totalMoney": 256.00,
        "payMoney": 198.00,
        "actualPayMoney": 178.20,
        "totalNum": 2
      }
    ],
    "counts": 13,
    "page": 1,
    "pages": 3,
    "pageSize": 5
  }
}
```

**订单项字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 订单ID |
| orderState | number | 订单状态（见枚举） |
| skus[] | array | 商品清单 |
| skus[].id | string | SKU ID |
| skus[].productId | string | 商品ID |
| skus[].name | string | 商品名称 |
| skus[].attrsText | string | 规格文字 |
| skus[].quantity | number | 购买数量 |
| skus[].price | number | 购买时单价 |
| skus[].oldPrice | number | 购买时原价 |
| skus[].picture | string | 商品图片 |
| receiverContact | string | 收货人 |
| receiverMobile | string | 收货电话 |
| receiverAddress | string | 收货地址 |
| createTime | string | 下单时间 yyyy-MM-dd HH:mm:ss |
| totalMoney | number | 商品总价（原价×数量之和） |
| payMoney | number | 应付金额（现价×数量之和） |
| actualPayMoney | number | 实付金额（应付×折扣） |
| totalNum | number | 总件数 |

**订单状态枚举：**

| 值 | 含义 |
|----|------|
| 1 | 待配送 |
| 2 | 配送中 |
| 3 | 已收货 |
| 4 | 已完成 |
| 5 | 已取消 |

**逻辑：** 前端用 tabs 切换 orderState 筛选，切换 tab 时重置分页。支持下拉刷新和滚动加载更多。按订单 ID 倒序排列

---

### 7.2 订单详情

| 项目 | 内容 |
|------|------|
| 名称 | 获取订单详情 |
| 地址 | `GET /member/order/:id` |
| 参数 | `id` — 路径参数 |

**返回结果：** 单个订单对象，字段同 7.1（不含 totalNum）

**逻辑：** 订单列表点击商品→跳转详情页

---

### 7.3 确认收货

| 项目 | 内容 |
|------|------|
| 名称 | 确认收货 |
| 地址 | `PUT /member/order/:id/receipt` |
| 参数 | `id` — 路径参数，无请求体 |

**返回结果：** 更新后的订单对象（orderState 变为 3）

**逻辑：** 配送中（orderState=2）订单展示按钮，二次确认后调用

---

### 7.4 取消订单

| 项目 | 内容 |
|------|------|
| 名称 | 取消订单 |
| 地址 | `PUT /member/order/:id/cancel` |

**请求参数：**

```json
{
  "cancelReason": "不想要了"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cancelReason | string | 是 | 取消原因 |

**返回结果：** 更新后的订单对象（orderState 变为 5）

**逻辑：** 待配送（orderState=1）订单展示按钮，二次确认后调用

---

### 7.5 删除订单

| 项目 | 内容 |
|------|------|
| 名称 | 删除订单 |
| 地址 | `DELETE /member/order/:id` |
| 参数 | `id` — 路径参数 |

**返回结果：** `{ "result": true }`

**逻辑：** 已取消/已完成订单可删除

---

### 7.6 预付订单（购物车结算）

| 项目 | 内容 |
|------|------|
| 名称 | 购物车结算预付单 |
| 地址 | `GET /member/order/pre` |
| 参数 | 无（后端读取用户购物车中 selected=true 的商品） |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": {
    "products": [
      {
        "id": "201",
        "skuId": "202",
        "name": "尼可露豆腐猫砂6L/袋",
        "attrsText": "规格：2.5Kg/袋",
        "count": 2,
        "price": "128.00",
        "payPrice": "99.00",
        "picture": "https://xxx.com/product-s1.png",
        "totalPrice": "256.00",
        "totalPayPrice": "198.00"
      }
    ],
    "summary": {
      "totalPrice": 256.00,
      "postFee": 0,
      "totalPayPrice": 198.00
    },
    "userAddresses": [
      {
        "id": "1",
        "receiver": "曹某人",
        "contact": "15921769899",
        "provinceCode": "440000",
        "cityCode": "441300",
        "countyCode": "惠阳区",
        "address": "星河丹堤花园F区2栋3023",
        "isDefault": 1,
        "fullLocation": "广东省 惠州市 惠阳区"
      }
    ]
  }
}
```

**products[] 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 商品ID |
| skuId | string | SKU ID |
| name | string | 商品名称 |
| attrsText | string | 规格文字 |
| count | number | 数量 |
| price | string | 原单价 |
| payPrice | string | 实付单价 |
| picture | string | 商品图片 |
| totalPrice | string | 小计（原价×数量） |
| totalPayPrice | string | 实付小计（现价×数量） |

**summary 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| totalPrice | number | 商品总价 |
| postFee | number | 运费 |
| totalPayPrice | number | 应付金额 |

**逻辑：** 点击"去结算"后同步购物车→跳转创建订单页→调用此接口。后端读取购物车中 selected=true 的商品，计算价格

---

### 7.7 预付订单（立即购买）

| 项目 | 内容 |
|------|------|
| 名称 | 单商品立即购买预付单 |
| 地址 | `GET /member/order/pre/now` |

**请求参数：**

`?skuId=202&count=1&addressId=1`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skuId | string | 是 | SKU ID |
| count | string | 是 | 数量 |
| addressId | string | 否 | 默认地址ID |

**返回结果：** 同 7.6，products 仅一条

**逻辑：** 商品详情 SKU 弹窗中点击"立即购买"，携带 skuId 和数量跳转

---

### 7.8 预付订单（再次购买）

| 项目 | 内容 |
|------|------|
| 名称 | 再次购买预付单 |
| 地址 | `GET /member/order/repurchase/:id` |
| 参数 | `id` — 历史订单ID（路径参数） |

**返回结果：** 同 7.6

**逻辑：** 已完成订单展示"再次购买"，携带 orderId 跳转。后端读取该订单商品重新生成预付单（价格取最新）

---

### 7.9 提交订单

| 项目 | 内容 |
|------|------|
| 名称 | 提交订单 |
| 地址 | `POST /member/order` |

**请求参数：**

```json
{
  "addressId": "1",
  "deliveryTimeType": 1,
  "buyerMessage": "请放门口",
  "products": [
    { "skuId": "202", "count": 2 }
  ],
  "payChannel": 1,
  "payType": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| addressId | string | 是 | 收货地址ID |
| deliveryTimeType | number | 是 | 配送时间：1=不限，2=工作日，3=周末 |
| buyerMessage | string | 否 | 订单备注 |
| products | array | 是 | 商品列表 [{skuId, count}] |
| payChannel | number | 是 | 支付渠道，固定传 1 |
| payType | number | 是 | 支付方式，固定传 1 |

**返回结果：**

```json
{
  "code": "200",
  "msg": "success",
  "result": { "id": "10014" }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| result.id | string | 新生成的订单ID |

**逻辑：** 前端校验无地址时禁止提交。提交成功后清空购物车→redirectTo 订单详情。后端需：校验库存、生成订单号、扣减库存、清空购物车中已购商品
