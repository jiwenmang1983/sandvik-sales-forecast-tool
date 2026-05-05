# SFT Playbook — Hermes 小P 运营手册

> 本文档记录 SFT 项目的工作流规范、任务调度规则、CC/xiaoQ 协作标准。
> 由 Hermes 小P 维护，持续迭代。

---

## 一、问题总结：任务调度暴露的三大缺陷

### 缺陷1：Migration Apply 缺失（最严重）

**问题描述：**
- CC 完成代码 + Migration 生成 → commit → **Migration 从未 apply 到 DB**
- 小Q 在旧 Schema 上测试 → FAIL → 结果毫无意义
- 我们以为"Build 通过 = 功能可用"，实际 DB schema 落后代码几个月

**根本原因：**
CC 工作流停在 commit，没有"数据库实际变更 + 服务重启 + 验证"这个环节。

**经验教训：**
Migration apply 是开发的标配步骤，不是额外步骤。CC 任务完成标准 = 代码写完 + migration apply + 服务重启 + 验证通过。

---

### 缺陷2：任务上下文不完整（一次性会话陷阱）

**问题描述：**
- 一次性会话 = CC/xiaoQ 每次拿到任务都是"孤岛"，没有项目背景、PRD决策、技术约束
- 我只说"做什么"，CC 就按自己的理解补全"为什么"，结果偏了
- T-026 建好了 ErrorCode 基础设施，但 Controller 还是原生 throw Exception
- T-024 没交代 skip 逻辑，CC 按"逐层推进"理解

**根本原因：**
我默认"上下文在 PRD 里，CC 自己会看"，但 CC 是单次调用，不会主动读取 PRD。

**经验教训：**
一次性会话 = 任务描述必须100%自包含。CC/xiaoQ 不知道项目上下文，只知道任务指令。

---

### 缺陷3：测试环境与认证信息缺失

**问题描述：**
- Q-010 没给 bearer token，curl 请求没有认证 header
- API 端口给了 localhost:5147，实际是 5000
- 没告诉小Q"先 apply migration 再测"
- 测完之后才发现 DB schema 对不上

**根本原因：**
我假设"环境信息大家都知道"，但小Q是独立 agent，没有直觉判断。

**经验教训：**
每次测试任务必须包含：API 端口、认证方式、Migration apply 状态。

---

## 二、CC/xiaoQ 任务调度标准（强制规范）

### 任务描述五段式（不可省略）

每次给 CC/xiaoQ 委派任务，任务描述必须包含以下五个部分：

#### 1. 背景（从哪里来）
```
来源：PRD §4.3 审批流程 / Q49多设备登录互斥
目标：修复 T-026 统一错误码体系在 Controller 层未落地的问题
```

#### 2. 约束（什么不能改）
```
约束：
- 已确定的技术决策：使用 ErrorCode 枚举（SandvikForecast.Core/Enums/ErrorCode.cs）
- 不得修改：Entity 结构、数据库 schema
- 开发环境：ASPNETCORE_ENVIRONMENT=Development 使用 JWT，生产环境强制 SSO
```

#### 3. 目标（具体交付什么）
```
目标：
- 在所有 Controller 的业务逻辑中，将原生 throw Exception 替换为 throw new AppException(ErrorCode.XXX)
- 确保每个 HTTP 4xx/5xx 响应都经过 AppExceptionMiddleware 统一处理
```

#### 4. 验收条件（什么叫完成）
```
验收条件：
- [ ] dotnet build 通过，0 errors
- [ ] 所有 Controller 的 catch 块使用 AppException，不使用原生 Exception
- [ ] 验证：POST /api/xxx 触发业务异常时，响应格式为 {code, message, details}
- [ ] Migration 已 apply 到开发 DB（dotnet ef database update）
- [ ] API 服务已重启，新接口可访问
```

#### 5. 环境信息（上下文）
```
环境信息：
- 工作目录：/mnt/d/Git/SandvikForecastTool/backend/src/SandvikForecast.Api
- API 端口：5000（Development）
- DB 连接：appsettings.Development.json 中的 DefaultConnection
- 认证方式：Bearer Token（开发环境），JWT
- Migration 状态：已 apply（3个 pending migrations 已于 2026-05-05 apply）
- 前置依赖：T-026 ErrorCode 基础设施已就绪（ErrorCode.cs / AppException.cs / AppExceptionMiddleware.cs）
```

### 任务完成后强制步骤

CC 完成任务后，必须执行以下步骤才算闭环：

1. **Migration apply**：`dotnet ef database update`
2. **Build 验证**：`dotnet build`，0 errors
3. **服务重启**：Kestrel 重启（Ctrl+C → dotnet run）
4. **API 验证**：curl 测试关键接口返回正常
5. **结果记录**：写入 /tmp/cc_result_<taskid>.json

---

## 三、开发任务完成标准

### 代码层面
- [ ] Entity / Migration 生成
- [ ] dotnet build 通过，0 errors
- [ ] dotnet test（相关单元测试）PASS

### 数据库层面
- [ ] `dotnet ef migrations list` 确认无 pending migrations
- [ ] `dotnet ef database update` 成功
- [ ] DB schema 与代码一致（关键字段存在）

### 服务层面
- [ ] API 服务可启动（dotnet run）
- [ ] dotnet ef database update 成功
- [ ] 关键接口 curl 测试通过

### 交付层面
- [ ] 代码 commit + push
- [ ] 结果写入 /tmp/cc_result_<taskid>.json
- [ ] 更新 HERMES_TASKS.md（状态 → ✅）

---

## 四、测试任务调度标准

### 小Q任务委派标准

```
【背景】
来源：TEST_SUITE.md TC-0301~TC-0306 / Q-010 E2E验收

【前置条件】（按顺序执行）
1. 确认 API 服务运行中：curl http://localhost:5000/health
2. 确认 DB Migration 已 apply：`dotnet ef migrations list` 无 pending
3. 获取认证 Token：POST /api/auth/login（用户名/密码在测试数据中）

【环境信息】
- API Base URL：http://localhost:5000
- 认证：Bearer Token（在 login 响应中获取）
- 测试数据：测试用户在 DB 中已存在（联系管理员初始化）

【验收条件】
- [ ] 所有 TC 用例 PASS
- [ ] 响应格式符合 API_DOCUMENTATION.md 定义
- [ ] 关键字段（四度量/延期窗口）读写正常
```

---

## 五、PRD 更新规范

每次完成一个开发任务，Hermes 必须同步更新 PRD：

1. **逻辑确认**：PRD_LOGIC_GAPS.md 中该任务相关的 Q 条目标注 ✅
2. **主文档同步**：将确认的逻辑同步写入 PRD.md 相关章节
3. **主动更新**：不等待 Mark 提醒，每完成一个模块立即更新

---

## 六、调度器（Scheduler）行为规范

- **定位**：闹钟，不是副官。Mark 是指挥官，scheduler 只在空闲时唤醒 Mark
- **判读逻辑**：
  1. HERMES_TASKS.md 有 🔬/⏳ 任务？→ 有则不唤醒，等结果
  2. 无进行中任务？→ 发飞书 DM 唤醒 Mark
- **主动检查**：检测到 ⏳ 任务有结果文件时，自动更新状态为 ✅ 或 🚫

---

## 七、Git 协作规范

- **Push 规则**：无特殊情况只用 `git push`（不用 force-push）
- **Force-push**：必须 Mark 审批
- **Commit 标准**：每完成一个任务 commit 一次，描述格式：`feat/fix/docs: 简短描述`
- **Network 问题**：GitHub 连接超时时，等待VPN重连后重试，不放弃

---

## 八、问题升级路径

当 CC/xiaoQ 任务失败时，按以下顺序排查：

1. **Migration apply 了没有？** → 最常见问题，优先检查
2. **API 服务启动了没有？** → curl http://localhost:5000/health
3. **DB schema 对不对？** → `dotnet ef migrations list` + 表结构查询
4. **认证 token 有效吗？** → 重新 login 获取
5. **代码和 DB 是否同步？** → commit 是否有对应 migration

---

*本文档由 Hermes 小P 维护，最后更新：2026-05-05*
