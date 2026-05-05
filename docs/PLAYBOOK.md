# SFT Playbook — Hermes 小P 运营手册

> 本文件是 SFT 项目的核心协作规则，所有参与者（Mark / 小P / CC / 小Q）共享。
> 维护：小P主动更新，Mark 最终审批。
> 每次规则变更需 Mark 口头确认。

---

## 一、文档体系

### 1.1 文档列表

| 文档 | 用途 | 维护人 | 更新时机 |
|------|------|--------|---------|
| PRD.md | 产品需求唯一真相源（§1~§15） | 小P | 需求变更时 |
| WBS.md | 开发任务分解 + 状态追踪 | 小P | 每任务完成时 |
| TESTCASE.md | 测试用例库 + Q-XXX 状态表 | 小P | 每测试完成时 |
| ISSUE_LOG.md | Bug / 逻辑缺口 / API 问题追踪 | 小P | 发现时立即 |
| PLAYBOOK.md | 本文件，协作规则 | 小P | 规则变更时 |

**优先级原则：PRD.md 是所有开发任务的唯一规格来源。其他文档不得与 PRD.md 冲突，冲突时以 PRD.md 为准。**

### 1.2 文档更新触发规则

```
【强制】每完成一个开发/测试任务，小P 主动更新以下文档，不等 Mark 提醒。

开发任务完成（CC）
  → WBS.md  T-XXX  🔄→✅
  → PRD.md  同步确认的逻辑（如有）
  → ISSUE_LOG.md  新增Bug记录（如有）

测试任务完成（小Q）
  → TESTCASE.md  Q-XXX  🔄→✅/❌
  → WBS.md       测试列更新
  → ISSUE_LOG.md  新增Bug记录（如有）
```

### 1.3 联动修改范围

发现某文档需要修改时，同步检查以下文档是否也要调整：

| 本次修改 | 需同步检查 |
|---------|-----------|
| PRD.md §X | TESTCASE.md / WBS.md / ISSUE_LOG.md |
| WBS.md T-XXX | PRD.md 相关章节 / TESTCASE.md Q-XXX |
| TESTCASE.md TC-XXXX | WBS.md 测试关联 |
| 任何文档 | 发现前面章节有冲突也一并修正 |

---

## 二、角色与分工

### 2.1 角色定义

```
Mark（吉文）  → 指挥官，最终审批人，所有重大决策
小P（Hermes） → 产品经理 + 调度员，修文档 / 拆需求 / 派任务 / 验收
CC              → 编码开发，小P委派后执行
小Q（slh-bot） → 测试工程师，小P委派后执行
```

### 2.2 分工边界（强制，不跨域）

```
小P 不做                         CC/小Q 不做
────────────────────────         ────────────────────────
写代码                           修文档（PRD/WBS/PLAYBOOK）
直接操作 DB                      自行决定需求逻辑
代替 CC/小Q 做决策               跨域协作（找 Mark 直接要答案）
跳过文档直接开发                  在 PRD 未确认前开始开发

核心原则：小P 修文档派任务，CC/小Q 执行，不交叉混乱。
```

---

## 三、CC 协作规范

### 3.1 调用方式

```bash
cd /mnt/d/Git/SandvikForecastTool
ANTHROPIC_API_KEY="sk-cp-nCk4W2tbBkgThnsZczkVOVcg4O5x4JCFjI2dv0GC1oBpIoTu534dja9_i3dC-cfHv8PfUHtEfua2IsEyJsP1RBpN_RioiKElZzYJK6t1FkI7Esk3VrGIYSg" \
  ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic" \
  claude --dangerously-skip-permissions --print \
  -p "任务描述（必须含五段式，见3.2）" \
  --max-turns 15
```

| 参数 | 作用 |
|------|------|
| `--dangerously-skip-permissions` | 跳过每次确认提示，自动化必需 |
| `--print` | 结果输出到 stdout（非交互TTY），小P可捕获 |
| `-p "..."` | 内联任务描述，不依赖文件 |
| `--max-turns N` | 防止无限循环 |
| `ANTHROPIC_BASE_URL` | 必须 = `https://api.minimaxi.com/anthropic`（不是 /v1） |

### 3.2 任务委派五段式（每次必须完整）

```markdown
【背景】
来源：PRD §X.X / T-XXX
问题：当前状态/已知的Bug
目标：交付什么

【约束】
- 已确定的技术决策：...
- 不得修改：Entity结构 / 数据库schema
- 开发环境：ASPNETCORE_ENVIRONMENT=Development（JWT认证）

【目标】
1. ...
2. ...

【验收条件】
- [ ] dotnet build 通过，0 errors
- [ ] 所有 Migration 已 apply（dotnet ef migrations list 确认无 pending）
- [ ] API curl 验证通过
- [ ] 结果写入 /tmp/cc_result_<taskid>.json

【环境信息】
工作目录：/mnt/d/Git/SandvikForecastTool/backend/src/SandvikForecast.Api
API 端口：5000（dotnet run --urls=http://0.0.0.0:5000）
DB：appsettings.Development.json
认证：Bearer Token（开发环境）
```

### 3.3 工作流（探索期：CC 直接写 master）

```
1. 小P 执行 claude --print 命令
2. CC 在 WSL foreground 执行（--print 模式，无法交互）
3. CC 输出结果到小P的 terminal stdout
4. 小P 解析输出判断成功/失败
5. CC 完成后（自动或小P执行）：
   a. dotnet ef database update（apply migration）
   b. Ctrl+C → dotnet run（服务重启）
   c. curl 验证关键接口
   d. git add + commit + push（探索期：直接 push master，不走 PR）
6. 结果写入 /tmp/cc_result_<taskid>.json
7. 小P 验证，更新文档
```

### 3.4 结果文件格式

CC 完成任务后必须写入：

```json
{
  "task_id": "cc_<taskid>",
  "status": "success | failure",
  "build": "pass | fail",
  "migration_applied": true,
  "api_verification": "pass | fail",
  "files_changed": ["file1.cs", "file2.cs"],
  "commit_sha": "abc1234",
  "notes": "..."
}
```

路径：`/tmp/cc_result_<taskid>.json`

### 3.5 完成标准（ Checklist）

```
[ ] dotnet build 通过，0 errors
[ ] dotnet ef migrations add（，如有 schema 变更）
[ ] dotnet ef database update
[ ] API 服务重启
[ ] curl 验证关键接口
[ ] git commit + push
[ ] 结果写入 /tmp/cc_result_<taskid>.json
```

### 3.6 当前配置

```
Provider：MiniMax CN
Base URL：https://api.minimaxi.com/anthropic（⚠️ 不是 /v1）
Model：MiniMax-M2.7
Key：sk-cp-nCk4W2tbBkgThnsZczkVOVcg4O5x4JCFjI2dv0GC1oBpIoTu534dja9_i3dC-cfHv8PfUHtEfua2IsEyJsP1RBpN_RioiKElZzYJK6t1FkI7Esk3VrGIYSg
Token Plan 限额：4500/4500（刷新时间：每5h，当前15:00刷新）
Rate Limit 处理：429 → 等到下一个整点再试
```

---

## 四、小Q 协作规范

### 4.1 调用方式

```bash
hermes -p slh-bot chat -q "执行测试脚本 /tmp/qNNN_test.py，只回复Python输出。"
```

| 参数 | 作用 |
|------|------|
| `-p slh-bot` | 指定小Q的 Hermes Profile |
| `chat` | 聊天模式（非任务模式） |
| `-q "..."` | 内联任务描述 |

> ⚠️ 警告：`-q` 参数内容会被当前 shell 先展开，脚本内容必须写到文件里，不能直接写进 -q 参数。

### 4.2 工作流（方案A）

```
1. 小P 写测试脚本 → /tmp/qNNN_test.py
   - 脚本内部 urllib 登录拿 token（不依赖外部 token 文件）
   - 所有请求复用同一个 token

2. 小P 执行命令：
   hermes -p slh-bot chat -q "执行测试脚本 /tmp/qNNN_test.py"

3. 小Q 的 slh-bot session 初始化（新 session，无历史上下文）

4. 小Q 执行：python /tmp/qNNN_test.py
   - 输出在小Q的 slh-bot session 回显
   - 小P 从自己 terminal 读 tail -20
   - 小P 无法程序化解析中间结果，只能看 tail

5. 小P 解析 tail 输出判断 PASS/FAIL

6. 小P 更新文档
```

**方案A关键点：脚本自己管 token 获取，不需要外部文件。**

### 4.3 标准脚本模板

```python
import urllib.request, json

BASE = 'http://localhost:5000'
EMAIL = 'admin@sandvik.com'
PASSWORD = 'Password123'

def api(method, path, token=None, data=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(url,
        data=json.dumps(data).encode() if data else None,
        headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        body = resp.read()
        return json.loads(body) if body else {'_empty': True}
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return {'_http_error': e.code, '_body': json.loads(body)}
        except:
            return {'_http_error': e.code, '_body_raw': body.decode()[:200]}

# === 登录（脚本内部获取token）===
login_req = urllib.request.Request(BASE + '/api/auth/login',
    data=json.dumps({'email': EMAIL, 'password': PASSWORD}).encode(),
    headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(login_req).read())['data']['token']
print('LOGIN: OK')

# === 测试用例 ===
# TC-XXXX: ...
print('TC-XXXX: PASS|FAIL ...')

print('Q-NNN COMPLETE')
```

### 4.4 小Q 完成标准

```
[ ] 所有 TC PASS
[ ] 响应格式符合 API 规范
[ ] 关键字段读写正常
[ ] 小P 更新 TESTCASE.md Q-XXX 状态
```

### 4.5 当前小Q配置

```
Profile：slh-bot
工具集：35 tools，82 skills，1 MCP server
状态：⚠️ 815 commits behind（可忽略，不影响功能）
```

---

## 五、代码提交规范

### 5.1 分支策略

**当前阶段（探索期）：**
> CC 探索式开发，代码直接写入 master 分支，不走 PR 流程。

**远期阶段（规范期）：**
> CC 流程稳定、代码质量有保证后，切换标准 PR 流程。所有开发走 feature branch，Mark 审阅后 approve → 合并到 master。切换时机由 Mark 决定。

### 5.2 当前 Git 规范

```
【探索期 — CC 直接写 master】
CC 开发的代码 → 直接 commit 到 master → 普通 git push
Mark 说"推送 master"时 → 直接 push master，不走 PR 流程

【规范期 — 标准 PR 流程】
feat/<功能简述> 分支开发 → commit → push → 创建 PR → Mark Review → 合并到 master
每日 23:00 自动创建 PR（小A组/小P组分别创建）
Force-push 仍须 Mark 审批
```

### 5.3 Push 规则

```
默认：普通 git push（不用 force-push）
Force-push（如清理垃圾 commit）：必须先发飞书 DM 给 Mark 审批，拿到确认后才能执行
Push 失败（远程有新 commit）：发飞书通知 Mark，不自动 merge
每日 23:00 cron：检查 master 有未 push 的 commit → 自动 push；Build 失败则通知 Mark，不 push
```

### 5.4 Commit 规范

```
格式：<type>: <简短描述>
type：feat | fix | docs | refactor | test | chore
示例：
  feat: add InvoiceCompanyController route
  fix: resolve PUT /forecast-periods partial update
  docs: update TESTCASE.md with verified API routes
禁止：空 commit / 无意义的 WIP commit
```

### 5.5 Review 分组

| 代码分组 | 开发负责人 | Review 责任人 |
|---------|---------|-------------|
| 小A组 | 小A | 吉文（Mark） |
| 小P组 | 小P | 吉文（Mark） |

> 各组完成开发与内部 Review 后提交 PR，通知 Mark 进行最终 Approve 并合并。
> 合并规则：至少 1 人 approve 方可合并。

### 5.6 Sandbox 自动提交

```
路径：/mnt/d/Git/Sandvik Sales Forecast Tool
触发：每天 18:30 检查未提交改动，有则自动 commit
格式：feat/fix/docs: 简短描述
实现：cronjob 定时任务
```

> ⚠️ 注意：每日 23:00 的 master push 检查是项目主仓库（jiwenmang1983/sandvik-sales-forecast-tool），不是 Sandbox。

---

## 六、测试文档体系

### 6.1 TESTCASE.md 结构

```
§1  测试分层规范（API / UI / E2E / 架构验证）
§2  角色测试账号（密码统一：Password123）
§3  TC-XXXX 测试用例（每个含：API端点/UI验收/预期结果/执行状态）
§4  UI 验收标准（F-01~F-11 页面截图标注）
§5  Q-XXX 测试任务对照表（执行状态追踪）
§6  PRD→TESTCASE 联动规则
```

### 6.2 Q-XXX 命名规则

```
Q-001~Q-010  核心功能测试
Q-011~Q-020  扩展功能测试
Q-021~       回归测试 / Bug 验证
```

### 6.3 测试状态流转

```
🔄待执行 → 🔄执行中 → ✅PASS | ❌FAIL | ⏭️跳过
```

---

## 七、Bug 追踪规范

### 7.1 ISSUE_LOG.md 结构

```
【运行时 Bug】      测试/E2E 中发现的 Bug
【API 路由问题】    端点不存在 / 返回格式不对
【逻辑缺口】        PRD 未覆盖需 Mark 确认
【Bug 修复记录】    已修复的 Bug + 修复方式
```

### 7.2 Issue 状态

| 状态 | 触发条件 | 更新人 |
|------|---------|-------|
| 🔴 blocking | Mark 尚未回答的逻辑问题 | 小P |
| ✅ 已解决 | Mark Q&A 确认后 | 小P |
| ⏳ 待修复 | 确认的 Bug 尚未修复 | 小P |
| ✅ 已修复 | 开发完成 + 测试通过 | 小P |

---

## 八、已知问题 → 统一归口 ISSUE_LOG.md

> **已知问题不在 PLAYBOOK 中管理，统一收录在 `docs/ISSUE_LOG.md`。**
> PLAYBOOK 是团队协作公约规范，已知问题是运营追踪文档。

**当前待修 Bug（截至 2026-05-05）：**

| Bug ID | 问题 | 状态 | 查看位置 |
|--------|------|------|---------|
| BUG-019 | `GET /api/invoice-companies` 返回 404 | ⏳ 待修复 | ISSUE_LOG.md |
| BUG-020 | `PUT /api/forecast-periods/{id}` 全字段必填 | ⏳ 待修复 | ISSUE_LOG.md |
| BUG-021 | `GET /api/forecast/records` 不过滤软删除 | ⏳ 待修复 | ISSUE_LOG.md |

> 完整 Bug 列表和详情见 `docs/ISSUE_LOG.md`

### 已验证的 API 路由（供参考）

| 方法 | 路径 | 状态 | 备注 |
|------|------|------|------|
| POST | /api/auth/login | ✅ 200 | 返回 JWT token |
| GET | /api/forecast-periods | ✅ 200 | |
| POST | /api/forecast-periods | ✅ 201 | |
| PUT | /api/forecast-periods/{id} | ✅ 200 | 全字段更新 |
| DELETE | /api/forecast-periods/{id} | ✅ 200 | |
| GET | /api/forecast/records | ✅ 200 | ⚠️ 不过滤软删除 |
| POST | /api/forecast/records | ✅ 201 | 必填字段：forecastPeriodId / customerId / invoiceCompanyId / productId / year / month / orderQty / orderAmount / invoiceQty / invoiceAmount / status |
| PUT | /api/forecast/records/{id} | ✅ 200 | 全字段更新 |
| DELETE | /api/forecast/records/{id} | ✅ 200 | |
| PATCH | /api/forecast/records/{id} | ⚠️ 存在 | status→Submitted 可触发审批流 |
| GET | /api/basedata/customers | ✅ 200 | |
| GET | /api/invoice-companies | ❌ 404 | Bug BUG-019 |
| GET | /api/approval-flow/my | ✅ 200 | |

> 完整 API 路由验证记录见 `docs/ISSUE_LOG.md`

---

## 九、PRD 协作规范

### 9.1 引用 + 提取原则

给小P/CC/小Q 委派任务时：

```
1. 引用：明确告知 PRD §章节号
2. 提取：将关键规格直接写入任务描述，不依赖执行者自己查找
3. PRD 中已有结论（✅标注）的规则，不得要求重新讨论
```

### 9.2 PRD 未覆盖时的处理

```
1. 在 ISSUE_LOG.md 记录为 Issue（🔴 blocking）
2. 向 Mark 确认逻辑（飞书DM / 语音）
3. 确认后同步更新 PRD.md 相关章节
4. 再向 CC/小Q 委派任务
```

---

## 十、问题升级路径

> 按顺序排查，优先 Migration。

```
1. Migration apply 了没有？
   → dotnet ef migrations list（无 pending 才算 apply 过）
2. API 服务启动了没有？
   → curl http://localhost:5000/health
3. DB schema 对不对？
   → dotnet ef migrations list + 表结构查询
4. 认证 token 有效吗？
   → 重新 POST /api/auth/login
5. 代码和 DB 是否同步？
   → commit 是否有对应 migration
6. CC rate limit？
   → MiniMax 429 → 等下一个整点刷新
```

---

*本文档由 Hermes 小P 维护，Mark 最终审批。*
*最后更新：2026-05-05*
