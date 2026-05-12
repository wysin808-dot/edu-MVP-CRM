# BCI 自媒体矩阵系统云端部署方案

## 1. 当前状态

当前项目是一个本地静态原型：

- 页面：`index.html`
- 样式：`crm-prototype.css`
- 交互：`crm-prototype.js`
- 访问方式：`http://127.0.0.1:4175/`

它只能在本机或局域网临时访问。电脑关机、服务停止、网络变化后，其他人就打不开。

## 2. 两种部署目标

### 2.1 只部署原型给团队看

适合：内部讨论页面结构、字段、流程。

推荐方案：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

特点：

- 部署快
- 成本低
- 只能展示页面
- 不能真正多人共建数据库
- 上传图片视频不会真正保存
- 没有登录权限和数据隔离

### 2.2 部署成真正可用系统

适合：团队每天上传内容、归档小红书图文、共建资料库、管理 CRM。

推荐架构：

```text
前端：Next.js / React
部署：Vercel
数据库：Supabase PostgreSQL
登录权限：Supabase Auth
图片视频：Supabase Storage
文件备份：云存储定期备份
```

也可以用：

- 前端：Vercel / Cloudflare Pages
- 后端：Supabase / Railway / Render
- 数据库：PostgreSQL
- 文件：S3 / Cloudflare R2 / Supabase Storage

## 3. 推荐第一版云端架构

建议使用：

```text
Vercel + Supabase
```

原因：

- 上线速度快
- PostgreSQL 适合这套结构化数据库
- Supabase 自带登录、权限、文件存储
- 图片、视频、截图可以统一放 Storage
- 后续可以继续接 AI 生成、搜索、权限和报表

## 4. 数据存储分层

### 4.1 数据库 PostgreSQL

保存结构化数据：

- 用户和角色
- 真实资料库
- AI Prompt 模板库
- 内容资产库
- IP 矩阵
- 账号矩阵
- 每日发布归档
- 内容数据表现
- 招生 CRM
- 跟进记录

对应草案文件：

```text
docs/bci-media-crm-schema.sql
```

### 4.2 文件存储 Storage

保存文件类资产：

- 小红书封面图
- 小红书正文图片 1-9 张
- 视频号 / 抖音视频
- 发布成功截图
- 数据截图
- PDF 资料
- Offer 图片
- 校园活动照片

建议建立 Storage bucket：

```text
media-assets
post-screenshots
knowledge-files
lead-files
```

数据库只保存文件 URL 和 metadata，不直接保存大文件。

## 5. 部署步骤

### 阶段 1：部署静态原型

1. 创建 GitHub 仓库
2. 上传当前项目文件
3. 用 Vercel 导入 GitHub 仓库
4. 设置构建方式为静态站点
5. 获得一个线上访问地址

结果：

```text
团队可以通过 https://xxx.vercel.app 访问原型
```

### 阶段 2：接入 Supabase

1. 创建 Supabase 项目
2. 在 SQL Editor 执行 `docs/bci-media-crm-schema.sql`
3. 创建 Storage buckets
4. 配置登录用户和角色
5. 添加 Row Level Security 权限规则
6. 前端连接 Supabase API

结果：

```text
团队可以登录、录入资料、上传图片、保存内容、管理线索
```

### 阶段 3：改造成真实 Web App

当前原型需要升级成真正应用：

- 将静态数据改成数据库读取
- 新建、编辑、删除写入数据库
- 上传文件写入 Storage
- 搜索从数据库查询
- 登录后按角色显示不同权限
- 发布归档和 CRM 自动关联

建议技术栈：

```text
Next.js
Supabase JS SDK
PostgreSQL
Supabase Storage
Vercel
```

## 6. 权限上线要求

云端上线前必须有登录和权限，不建议公开裸奔。

角色：

- 超级管理员
- 部门负责人
- 运营人员
- AI 内容编辑
- 招生顾问

权限重点：

- 运营只能管理自己负责的账号
- 部门负责人可以审核内容
- 招生顾问只能看分配给自己的线索
- 图片视频上传必须绑定账号、内容或发布记录
- 账号后台链接等敏感信息不公开展示

## 7. 域名建议

内部系统域名可以用：

```text
media.bci.edu.sg
crm.bci.edu.sg
growth.bci.edu.sg
```

如果只是测试：

```text
bci-media-crm.vercel.app
```

## 8. 最小可上线版本

第一版云端系统建议只做：

1. 登录
2. 用户角色
3. 账号矩阵
4. IP 矩阵
5. 真实资料库
6. AI Prompt 模板库
7. 内容资产库
8. 今日发布任务
9. 发布归档上传图片 / 视频 / 截图
10. 基础 CRM
11. 搜索

暂缓：

- 自动抓取小红书数据
- 自动发布内容
- 复杂 AI Agent
- 高级 BI 报表

