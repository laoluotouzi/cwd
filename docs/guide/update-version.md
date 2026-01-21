# 更新部署

重新拉取 GitHub 项目代码

## 后端更新

接口逻辑相关的更新，需要重新部署到 Cloudflare Workers.

```
cd cwd-api
npm install
npm run deploy
```

重新部署到 Cloudflare Workers.

## 前端更新

### 管理后台

如果使用官方后台不需要更新。

```
cd cwd-admin
npm install
npm run build
```

将打包后的代码更新到你托管的地方（例如 Cloudflare Pages、GitHub Pages、Netlify 等）。  

### 评论端

如果使用官方评论端 js `https://cwd.zishu.me/cwd.js`，不需要更新。

如果你想自己托管，请下载仓库 `/cwd-admin/public` 中最新的 `cwd.js` 文件。
