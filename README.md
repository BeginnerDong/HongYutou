# 红芋头项目开发文档

### 目录

- 功能概述
- 数据对照表


---

**1\. 功能概述**

&emsp;&emsp;项目主要功能包括：
包含用户管理、菜单管理、文章管理、商品管理、优惠券管理等基本模块；
支持微信支付、小程序模板消息等微信功能；

---
**2\. 数据对照表**

### 通用字段说明

| 字段 | 类型 | 说明 |
| ------    | ------  | ------ | 
| id | int(11)| 主键：该数据ID |
| listorder | int(11) | 自定义排序 |
| img_array | varchar(100) | 图片组 |
| create_time | int(11) | 创建时间 |
| update_time | int(11) | 更新时间 |
| delete_time | bigint(13) | 删除时间 |
| thirdapp_id | int(11) | 关联thirdapp |
| user_no | varchar(255) | 关联user |
| user_type | tinyint(2) | 用户类型0.前端2.cms |
| status | tinyint(2) | 状态:1正常；-1删除 |



### user表

| 字段 | 类型 | 说明 |
| ------    | ------  | ------ | 
| nickname | varchar(255) | 微信昵称 |
| openid | varchar(255) | 微信openid |
| headImgUrl | varchar(9999) | 微信头像 |
| primary_scope | int(255) | 权限级别：90平台管理员;60合伙人;30门店;10用户 |
| user_type | itinyint(10) | 0,小程序用户;1,注册门店/合伙人;2,cms管理员; |
| user_no | varchar(255) | 用户编号 |
| order_limit | varchar(10) | 下单限制星期（逗号隔开） |
| mainImg | text | 头像（店铺/合伙人） |



### user_info表

| 字段 | 类型 | 说明 |
| ------  | ------  | ------ | 
| name | varchar(255) | 店主姓名 |
| address | varchar(255) | 地址 |
| phone | varchar(255) | 电话 |
| mainImg | text | 主图 |
| bannerImg | text | banner图 |
| enc_bank_no | varchar(100) | 银行卡号 |
| enc_true_name | varchar(100) | 银行卡用户名 |
| bank_code | varchar(100) | 开户行编号 |



### label表

| 字段 | 类型 | 说明 |
| ------  | ------  | ------  | 
| title | varchar(40) | 菜单名称 |
| description| varchar(255) | 描述 |
| parentid| int(11) | 父级菜单ID |
| type | tinyint(2) |  1,menu;2,menu_item; |



### article表

| 字段 | 类型 | 说明 |
| ------  |  :------:  | ------  | 
| title | varchar(100) | 文章标题 |
| menu_id | int(11) | 关联label表 |
| description | varchar((255) | 描述 |
| content | text | 文章内容 |
| mainImg | varchar(9999) | 文章主图，一般在列表渲染 |



### message表-留言(type=1)

| 字段 | 类型 | 说明 |
| ------  |  :------:  | ------  | 
| title | varchar(255) | 标题 |
| description | varchar(255) | 描述 |
| content | text | 内容 |
| mainImg | varchar(999) | 主图，一般在列表渲染 |



### log表

| 字段 | 类型 | 说明 |
| ------  |  :------:  | ------  | 
| type | int(11) | 类别:4.点赞;5.关注; |
| order_no | varchar(100) | 关联message |
| pay_no | varchar(255) | 关联user |



### flow_log表

| 字段 | 类型 | 说明 |
| ------  |  :------:  | ------  | 
| type | int(11) | 类别:1.微信2.余额（门店、合伙人）3.薯币（用户）/货款（合伙人）; |
| relation_user | varchar(255) | 关联上级user_no（门店/合伙人） |
| withdraw | tinyint(2) | 0.非提现1.提现 |



### pay_log表

| 字段 | 类型 | 说明 |
| ------  |  :------:  | ------  | 
| title | varchar(255) | 标题 |
| result | varchar(255) | 结果描述 |
| content | text | 详情 |
| type | int(11) | 类别:1.微信支付 |
| order_no | varchar(100) | 关联order |
| pay_no | varchar(255) | 关联flowLog |
| transaction_id | varchar(255) | 微信流水 |
| behavior | int(11) | 预留 |
| pay_info | varchar(999) | 支付信息 |
| prepay_id | varchar(255) | 订单微信支付的预订单id(用于发送模板消息) |
| wx_prepay_info | varchar(999) | 储存微信预支付信息，再次调起支付使用 |



### product表

| 字段 | 类型 | 说明 |
| ------  | ------  | ------ | 
| price | decimal(10,2) | 商品价格 |
| group_price | decimal(10,2) | 团购价格 |
| type | tinyint(2) | 1.平台商品;2.店铺商品;3.线上商品;4.团购商品 |
| shop_ratio | int(11) | 店铺分佣比例 |
| partner_ratio | int(11) | 合伙人分佣比例 |



### order表

| 字段 | 类型 | 说明 |
| ------  | ------  | ------ | 
| type | tinyint(2) | 1.平台商品;2.店铺商品;3.线上商品;4.团购商品 |
| shop_no | varchar(255) | 店铺user_no，可以是平台的 |



### coupon表

| 字段 | 类型 | 说明 |
| ------  | ------  | ------ | 
| coupon_no | varchar(255) | 优惠券编号 |
| title | varchar(255) | 标题 |
| description | varchar(255) | 描述 |
| content | text | 详情 |
| mainImg | text | 主图 |
| bannerImg | text | 轮播图 |
| price | decimal(10,2) | 价格 |
| score | int(11) | 最高可使用积分 |
| value | int(11) | 价值，可抵扣金额 |
| discount | int(11) | 折扣百分比，默认100，即无折扣 |
| condition | int(11) | 使用条件，满减要求 |
| stock | int(11) | 库存 |
| sale_count | int(11) | 销量 |
| type | int(11) | 1.抵扣券2.折扣券 |
| behavior | tinyint(2) | 1.店铺领取2.消费获得 |



### user_coupon表

| 字段 | 类型 | 说明 |
| ------    | ------  | ------ | 
| type | tinyint(2) | 1.抵扣券2.折扣券 |
| use_step | tinyint(2) | 1.未使用2.已使用-1.已过期 |
| behavior | tinyint(2) | 1.店铺领取（现金支付）2.消费获得（线上购买） |



### rank表

| ------ | ------  | ------ |  
| period | varchar(255) | 时期 |
| money | decimal(10,2) | 消费金额 |
| reward | decimal(10,2) | 奖励金额 |
| type | tinyint(2) | 1. |
| behavior | tinyint(2) | 1.未结算2.已结算 |



### third_app表

| ------ | ------  | ------ |  
| balanceDiscount | 余额支付折扣 |
| shubi | 薯币获取比例 |
| tax | 进账分润比例 |
| rankRewardRatio | 排行奖励比例 |
| rankPeopleRatio | 排行人数比例 |
| withdrawLimit | 提现限制日期 |

---