# Cupid Match Admin

Cupid Match Admin 是 Cupid Match 的后台运营端，基于 RuoYi-Vue3 / Vue 3 / TypeScript / Element Plus 改造，用于平台管理、用户服务、审核、会员、支付、活动、通知、配置和运营协作。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus
- Axios
- RuoYi-Vue3 后台基础能力

## 目录概览

```text
src/api        后台接口封装
src/views      后台页面
src/router     路由与动态菜单
src/store      全局状态
src/utils      通用工具
src/directive  权限与通用指令
vite           Vite 插件配置
public         静态资源
```

Cupid Match 业务页面主要位于：

```text
src/views/cupid
src/api/cupid
```

## 本地启动

先启动后端：

```text
cupid-match-server / com.ruoyi.RuoYiApplication
```

后端默认地址：

```text
http://127.0.0.1:8080
```

启动后台：

```bash
npm install
npm run dev
```

后台默认地址：

```text
http://127.0.0.1:8081
```

开发环境通过 `/dev-api` 代理到后端 `http://localhost:8080`。

## 常用账号

账号来自后端 `sql/cm_required_seed.sql`，完整说明见：

```text
cupid-match-server/doc/cm-seed-accounts.md
```

| 用户名 | 密码 | 用途 |
| --- | --- | --- |
| `admin` | `admin123` | 超级管理员 |
| `cupid_admin` | `admin123` | Cupid 运营管理员 |
| `cupid_reviewer` | `admin123` | 审核专员 |
| `cupid_event` | `admin123` | 活动运营 |
| `cupid_payment` | `admin123` | 支付财务 |
| `cupid_support` | `admin123` | 用户支持 |

## 常用脚本

```bash
npm run dev
npm run build:stage
npm run build:prod
npm run preview
```

## 主要业务模块

- App 用户管理
- 会员管理
- 支付订阅与 Stripe 回调日志
- 通知发布与通知模板
- 资料库与资料运营
- 认证材料审核
- 照片审核
- 活动运营
- 联系咨询
- 跟进事项
- 业务审计与安全事件
- 通用选项、条款、模板等配置

## 依赖后端文档

- `cupid-match-server/doc/cm-local-debugging.md`
- `cupid-match-server/doc/cm-seed-accounts.md`
- `cupid-match-server/doc/cm-database-initialization.md`
- `cupid-match-server/doc/cm-payment-stripe-configuration.md`
