# Cloudflare Pages 部署

Cupid Match 管理后台作为静态 Vue 3 应用部署到 Cloudflare Pages，API 由 Render 上的 `cupid-match-server` 提供。

## Pages 配置

| 配置项 | 值 |
| --- | --- |
| Project name | `cupid-match-admin` |
| Repository | `waltonR1/cupid-match-admin` |
| Production branch | `master` |
| Framework preset | `Vue` 或 `Vite` |
| Build command | `npm run build:prod` |
| Build output directory | `dist` |
| Root directory | 留空 |

Node.js 建议使用当前 LTS 版本。`public/_redirects` 会被复制到构建产物，使 Vue Router history 路由刷新时回退到 `index.html`。

## 生产环境变量

在 Cloudflare Pages 的 Settings > Variables and Secrets 中设置：

```env
VITE_APP_BASE_API=https://<render-service>.onrender.com
VITE_APP_ENV=production
VITE_APP_TITLE=Cupid Match 后台
VITE_BUILD_COMPRESS=gzip
```

`VITE_APP_BASE_API` 不要使用 `/prod-api`，除非另外配置了 Cloudflare 反向代理。当前部署直接访问 Render API，因此必须填完整 HTTPS 域名。

Vite 变量在构建时写入前端产物，修改后需要重新部署。这些变量不得包含后端密钥、数据库密码或 R2 Secret Key。

## 后端 CORS

Render 上的后端需包含本站来源：

```env
CUPID_CORS_ALLOWED_ORIGIN_PATTERNS=https://cupid-match-admin.pages.dev,https://cupid-match.pages.dev
```

绑定正式域名后，也要把新的 HTTPS origin 追加进该变量。

## 发布验证

本地构建：

```bash
npm ci
npm run build:prod
```

上线后至少验证：

1. 首页和任意内页直接刷新均不返回 404。
2. 后台账号可登录，菜单和权限正常。
3. Network 中的 API 请求指向 Render HTTPS 域名，不是 Pages 域名下的 `/prod-api`。
4. 头像和公开图片可读取；认证材料只能在已授权的审核界面中读取。
5. 浏览器控制台无 CORS、mixed content 或 API 404 错误。
