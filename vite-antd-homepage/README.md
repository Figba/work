# Vite + React + Ant Design 首页还原模板

这是一个可直接运行的前端项目，按你提供的 Figma 首页结构进行实现，包含：

- 顶部导航栏（Navbar）
- 左侧菜单栏（Sidebar）
- 页面头（Page Header）
- 搜索/筛选 + 服务端分页模拟表格
- 新增/编辑弹窗表单（含基础校验）
- Design Tokens（颜色/字体）统一主题配置

---

## 1) 安装与运行

```bash
cd vite-antd-homepage
npm install
npm run dev
```

本地访问：

```text
http://localhost:5173
```

生产构建与预览：

```bash
npm run build
npm run preview
```

---

## 2) 项目结构（新手友好）

```text
vite-antd-homepage/
├─ src/
│  ├─ components/
│  │  └─ TransactionFormModal.tsx   # 新增/编辑弹窗表单
│  ├─ services/
│  │  └─ transactionApi.ts          # 模拟 API（后续替换真实接口）
│  ├─ theme/
│  │  └─ tokens.ts                  # Figma 提取的设计 token
│  ├─ types/
│  │  └─ transaction.ts             # TS 类型定义
│  ├─ App.tsx                       # 页面主体（布局 + 表格 + 筛选）
│  ├─ main.tsx                      # 入口（挂载 Antd 主题）
│  └─ index.css                     # 全局样式
├─ package.json
└─ README.md
```

---

## 3) Design Tokens（来自 Figma 高频值）

在 `src/theme/tokens.ts` 中集中管理：

- 主色：`#1677FF`
- 主文字：`#111928`
- 次文字：`#526F8F`
- 边框：`#E9EAEB`
- 布局背景：`#F3F3F3`
- 容器背景：`#FFFFFF`
- 主字体：`SF Pro Text`（含系统字体回退）

> 如果后续你在 Figma 调整了视觉规范，只需要改这里即可全局生效。

---

## 4) 哪里替换真实 API（非常重要）

你只需要改 1 个文件：`src/services/transactionApi.ts`。

里面已经标记了 TODO：

- `fetchTransactions` → 替换成真实列表接口（GET）
- `createTransaction` → 替换成真实新增接口（POST）
- `updateTransaction` → 替换成真实编辑接口（PUT/PATCH）
- `fetchOverview` → 替换成首页统计接口（GET）

当前是“前端内存模拟”，目的是让你先把页面流程跑通。

---

## 5) 功能点说明

1. **响应式布局**：侧栏可折叠，小屏自动收起。  
2. **筛选 + 搜索**：关键词、银行、币种、方向、金额区间、日期区间。  
3. **服务端分页模拟**：翻页/改 pageSize 会重新请求模拟 API。  
4. **表单校验**：必填项、金额 > 0 等规则。  
5. **新增/编辑复用同一个 modal**：提升维护性。

---

## 6) 部署建议

### 方案 A：Vercel（最省心）
1. 把这个目录作为项目根目录接入 Vercel。  
2. Build Command：`npm run build`  
3. Output Directory：`dist`

### 方案 B：Netlify
1. Build Command：`npm run build`  
2. Publish Directory：`dist`

### 方案 C：Nginx 静态托管
1. 本地执行 `npm run build`  
2. 将 `dist/` 上传到服务器静态目录  
3. 配置 Nginx 指向 `dist/index.html`

---

## 7) Cloud Agent 环境说明（已配置）

仓库根目录已新增：

- `/.cursor/environment.json`
- `/.cursor/Dockerfile`

作用是：

1. 统一使用 Node 22（满足 Node 18+ 要求）  
2. agent 启动时自动执行：`cd vite-antd-homepage && npm ci`  
3. 直接可运行 `npm run dev` / `npm run build`

---

## 8) 下一步建议（你最可能会用到）

- 把 `transactionApi.ts` 改成你们后端地址（我可以继续帮你改）
- 加登录态/权限（例如不同角色看到不同菜单）
- 把“Edit columns”做成真的列配置弹窗
- 根据你最终 Figma 再做像素级微调（间距、字号、圆角、阴影）
