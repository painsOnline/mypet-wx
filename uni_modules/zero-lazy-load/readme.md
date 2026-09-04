# zero-lazy-load

## 使用方法

导入 `uni_modules` 后直接使用即可

```html
<view class="img_list">
  <zero-lazy-load
    class="lazy-img"
    v-for="(item, index) in list"
    borderRadius="30"
    :key="index"
    :image="item.url"
    :imgMode="imgMode"
  ></zero-lazy-load>
</view>
```

## 参数说明

| 参数         | 类型           | 默认值   | 描述                                                 |
| ------------ | -------------- | -------- | ---------------------------------------------------- |
| image        | String         | ''       | 图片地址                                             |
| imgMode      | String         | widthFix | 图片裁剪模式                                         |
| loadingImg   | String         |          | 占位图片路径                                         |
| errorImg     | String         |          | 加载失败的错误占位图                                 |
| threshold    | Number, String | 100      | 图片进入可见区域前多少像素时，单位 rpx，开始加载图片 |
| borderRadius | Number         | 0        | 圆角值                                               |

插件预览:
![code](https://cdn.zerojs.cn/image/common/code-z_1722414660881_1.jpg?imageMogr2/thumbnail/200x)

> 小程序搜索: 零技术

> 预览的小程序不一定能及时更新当前插件
