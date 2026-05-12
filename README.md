# BCI 自媒体矩阵获客系统原型

这是 BCI 自媒体矩阵获客管理系统的静态原型，用于团队讨论页面结构、字段和工作流。

## 本地预览

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4175/
```

## 云端部署

当前版本可以作为静态站点部署到：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

推荐先用 Vercel：

1. 新建 GitHub 仓库
2. 上传当前项目
3. 登录 Vercel
4. Import Git Repository
5. 选择该仓库
6. Framework Preset 选择 Other
7. Build Command 留空
8. Output Directory 留空或使用根目录
9. Deploy

## 当前限制

这是静态原型：

- 不保存真实数据
- 不支持真实登录
- 不支持多人同时编辑
- 上传图片/视频只是表单展示，不会真正存储

真实多人协作版本建议使用：

```text
Vercel + Supabase PostgreSQL + Supabase Auth + Supabase Storage
```

