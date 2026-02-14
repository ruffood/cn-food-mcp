# CN-Food-MCP 项目方案

## 概述

构建一个中国食物营养成分表 MCP Server，部署为远程服务供他人使用。用户通过落地页申请 API Key，即可在 Claude Desktop / Cursor 等客户端连接使用，查询中国食物的营养成分数据。

## 技术栈

- **Next.js (TypeScript)** — 应用框架，部署到 Vercel
- **Supabase (PostgreSQL)** — 数据库，存储食物数据 + API Keys
- **Brevo** — 发送 API Key 邮件
- **MCP SDK (`@modelcontextprotocol/sdk`)** — MCP 协议实现

## 架构

```
用户 Claude Desktop / Cursor
        ↓ (Streamable HTTP + Authorization header)
  Vercel (Next.js)
  ├── POST /mcp          ← MCP Server 端点
  └── GET  /             ← 落地页（申请 API Key）
        ↓
  Supabase (PostgreSQL)
  ├── foods 表            ← 食物营养数据
  └── api_keys 表         ← 用户 API Key
        ↓
  Brevo API              ← 发送 API Key 邮件
```

## 项目结构

```
CN-Food-MCP/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 落地页（申请 API Key）
│   │   ├── layout.tsx            # 布局
│   │   ├── mcp/
│   │   │   └── route.ts          # MCP HTTP 端点
│   │   └── api/
│   │       └── apply-key/
│   │           └── route.ts      # 申请 API Key 接口
│   ├── lib/
│   │   ├── mcp-server.ts         # MCP server 实例 + tool 注册
│   │   ├── tools.ts              # Tool 定义（参数、描述、处理逻辑）
│   │   ├── db.ts                 # Supabase 客户端 + 查询函数
│   │   ├── auth.ts               # API Key 验证逻辑
│   │   └── email.ts              # Brevo 邮件发送
├── scripts/
│   └── import.ts                 # Excel → Supabase 数据导入脚本
├── data/
│   └── raw.xlsx                  # 原始 Excel 数据
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.local                    # 环境变量
└── .gitignore
```

## 数据库设计

### foods 表

```sql
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  energy REAL,              -- 能量 (kcal)
  protein REAL,             -- 蛋白质 (g)
  fat REAL,                 -- 脂肪 (g)
  carbohydrate REAL,        -- 碳水化合物 (g)
  dietary_fiber REAL,       -- 膳食纤维 (g)
  cholesterol REAL,         -- 胆固醇 (mg)
  sodium REAL,              -- 钠 (mg)
  calcium REAL,             -- 钙 (mg)
  iron REAL,                -- 铁 (mg)
  vitamin_a REAL,           -- 维生素A (μg)
  vitamin_c REAL,           -- 维生素C (mg)
  vitamin_e REAL,           -- 维生素E (mg)
  -- ... 其他字段根据 Excel 实际列确定
);
```

> 注：字段最终以 Excel 实际列为准，导入脚本会自动映射。

### api_keys 表

```sql
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
```

## MCP Tools 定义

| Tool | 参数 | 描述 |
|---|---|---|
| `search_food` | `query: string` | 按名称模糊搜索食物 |
| `get_nutrition` | `food_id: number` | 获取某食物完整营养成分 |
| `compare_foods` | `food_ids: number[]` | 对比多个食物的营养成分 |
| `filter_by_nutrient` | `nutrient: string, min?: number, max?: number` | 按营养素范围筛选食物 |

## API Key 申请流程

1. 用户访问落地页 `/`
2. 填写邮箱，点击申请
3. 后端 `POST /api/apply-key`：
   - 检查邮箱是否已申请过（已有则重新发送）
   - 生成 API Key（`crypto.randomUUID()`）
   - 存入 Supabase `api_keys` 表
   - 通过 Brevo 发送邮件，包含 API Key 和使用说明
4. 页面提示"已发送到邮箱"

## 认证流程

1. 用户请求 `POST /mcp`，携带 `Authorization: Bearer <API_KEY>`
2. `route.ts` 提取 API Key，查询 `api_keys` 表验证
3. 验证通过 → 进入 MCP 处理逻辑
4. 验证失败 → 返回 401

## 环境变量

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
BREVO_API_KEY=
```

## 实施步骤

1. 初始化 Next.js 项目，安装依赖
2. 配置 Supabase，创建 `foods` 和 `api_keys` 表
3. 编写 Excel → Supabase 导入脚本
4. 实现 MCP server 端点 (`/mcp`) + 4 个 tools
5. 实现 API Key 认证中间件
6. 实现落地页 + 申请 API Key 接口 + Brevo 邮件
7. 部署到 Vercel，配置环境变量
8. 测试：用 Claude Desktop 连接远程 MCP server

## 验证方式

- 导入脚本：运行后检查 Supabase 中数据条数和字段是否正确
- MCP server：用 `curl` 发送 JSON-RPC 请求测试各 tool
- API Key：测试无 Key / 错误 Key / 正确 Key 三种情况
- 邮件：申请后检查邮箱是否收到
- 端到端：在 Claude Desktop 中配置远程 MCP server URL + API Key，实际查询测试
