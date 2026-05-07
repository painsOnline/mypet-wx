# 项目介绍
本项目使用uni-app和vue3技术，实现一个类似美团的社区宠物用品团购系统，主要为微信小程序前端。该项目包含首页，全部商品，我的，商品详情页面，我的订单管理，购物车，订单生成，地址管理等页面。
## 项目根目录和文件介绍
### 根目录
+ /dist
+ node_modules
+ src
+ package.json
+ tsconfig.json
+ vite.config.ts
+ .gitignore

其中 /dist 目录是编译后的微信小程序文件目录
/node_modules 是node的模块目录
/src 是项目的源代码目录

### /src 源代码目录
+ /components
+ /constants
+ /enums
+ /pages
+ /pagesOrder
+ /services
+ /static
+ /styles
+ /types
+ /utils
+ /stores
+ App.vue
+ env.d.ts
+ pages.json
+ main.ts

其中
+ /components 是系统全局组件目录，全局组件代表多个或者跨页面都使用的组件，该目录下有 /styles 目录，该目录的作用是scss静态样式文件，该目录中组件以 "Pet"开头的是自动加载的组件，如 PetNavBar.vue 就是全局头部导航文件
+ /constants 目录是系统常量目录，为ts 文件
+ /enums 目录是系统枚举类型目录，为ts文件
+ /pages 是分页目录，其目录中每个目录是一个分页，如 /index 目录是首页; /index 目录下有 /components 是该页面的组件目录, 该目录下有vue文件和 /styles目录， /styles目录是页面组件的静态样式文件目录; /index 目录下的 /styles 目录是该页面的静态样式文件目录；其他页面依次类推
+ /pagesOrder 目录是订单的分包目录，其目录结构和/pages目录类似;对于大型模块使用分包模式，如全局页面 pages , 订单分包 pagesOrder, 会员分包 pagesMember 等，后续所有分包页面使用 "pages分包英文名称" 的驼峰写法
+ /services 目录是请求后端的服务目录，一个模块服务写在一个ts文件中，如order.ts, 当前开发阶段使用随机模拟数据，类似order.ts 文件中的做法
+ /static 目录是项目静态文件目录，如图片，按钮图片，字体等；其中images目录存放示例图片, /tabs 目录存放页面组件原始icon
+ /styles 是全局样式目录
+ /types 是类型文件声明目录，以 "模块英文名.d.ts" 规则命名，如"cart.d.ts"是购物车模块类型声明
+ /utils 是系统公用类库，如http请求等
+ /stores 是系统本地存储程序，基于pinia 进行存储， 存储模块位于 /stores/modules 目录下
+ pages.json 该文件是页和分包的配置文件，在新建页面和分包时需要根据uni-app规则对应添加配置

# 项目要求
使用vue3 语法写法

# 编译为小程序命令
pnpm dev:mp-weixin


