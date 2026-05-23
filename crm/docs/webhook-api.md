# BCI CRM Webhook API (预留接口)

> 用于企业微信 / 第三方平台自动推送线索到 BCI CRM 系统  
> 状态：接口设计阶段，尚未实现后端

---

## POST `/api/webhook/lead`

接收新线索推送，自动创建 CRM 记录。

### Headers

| Header | 值 | 说明 |
|--------|---|------|
| `Content-Type` | `application/json` | 必填 |
| `X-Webhook-Secret` | `{secret}` | 鉴权 token，在 Supabase 环境变量中配置 |

### Request Body

```json
{
  "name": "学生/家长姓名",
  "channel": "企业微信",
  "wechatId": "wxid_xxxxx",
  "grade": "G9",
  "parentName": "家长姓名",
  "course": "WACE",
  "source": "来自企业微信：好友添加",
  "sourceLink": "",
  "notes": "家长主动添加，咨询 WACE 课程",
  "assignee": "招生顾问"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 线索名称（学生或家长） |
| `channel` | string | 是 | 来源渠道：`企业微信` / `小红书私信` / `抖音私信` / `线下` / `老客推荐` 等 |
| `wechatId` | string | 否 | 企业微信 ID 或备注名 |
| `grade` | string | 否 | 当前年级 |
| `parentName` | string | 否 | 家长姓名 |
| `course` | string | 否 | 意向课程 |
| `source` | string | 否 | 来源描述 |
| `sourceLink` | string | 否 | 来源内容链接 |
| `notes` | string | 否 | 备注 |
| `assignee` | string | 否 | 分配顾问姓名（为空则进入未分配队列） |

### Response

```json
{
  "success": true,
  "leadId": "uuid-xxxx",
  "stage": "私信咨询",
  "message": "线索已创建"
}
```

### 错误码

| HTTP 状态 | 说明 |
|-----------|------|
| 200 | 成功 |
| 400 | 参数缺失（name 为空） |
| 401 | X-Webhook-Secret 不匹配 |
| 500 | 服务器错误 |

---

## POST `/api/webhook/lead/update`

更新已有线索状态（如企微自动标记已加好友）。

### Request Body

```json
{
  "wechatId": "wxid_xxxxx",
  "stage": "加企微",
  "wechatAddTime": "2026-05-21T10:30:00Z",
  "notes": "企微已通过好友验证"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `wechatId` | string | 是 | 用于匹配已有线索 |
| `stage` | string | 否 | 更新阶段（如 `加企微`） |
| `wechatAddTime` | string | 否 | 企微添加时间（ISO 格式） |
| `notes` | string | 否 | 追加备注 |

---

## 企业微信集成方式

### 方式一：企业微信自建应用 + Webhook

1. 在企业微信管理后台创建自建应用
2. 配置「客户联系」回调地址为 `https://your-domain.vercel.app/api/webhook/lead`
3. 当新客户添加企业微信时，自动触发 webhook 推送线索

### 方式二：第三方 SCRM 对接

通过第三方 SCRM 工具（如微盛、尘锋、探马等）中转：
1. SCRM 工具接收企业微信事件
2. SCRM 通过 HTTP webhook 推送到本系统
3. 本系统自动创建/更新线索

### 环境变量配置

```bash
# Vercel 环境变量
WEBHOOK_SECRET=your-random-secret-here
```

---

## 后续实现计划

- [ ] 实现 `/api/webhook/lead.js` Vercel Serverless Function
- [ ] 添加 webhook secret 验证中间件
- [ ] 支持批量推送（数组格式）
- [ ] 添加重复线索检测（基于 wechatId 去重）
- [ ] 支持线索自动分配（轮询分配顾问）
