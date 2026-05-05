# Sandvik Forecast Tool — 测试用例文档
**版本：** v2.0（按WBS v0.8重建）
**日期：** 2026-05-06
**状态：** 🔄 第1轮执行中

> 本文档是 SFT 系统的唯一测试执行标准。
> 小P维护本文档，小Q执行测试后更新状态，Mark最终审批。
> **重要：** 每次 PRD 更新后，必须同步检查本文档对应的测试用例是否需要更新。

---

## 一、测试分层规范

### 1.1 测试类型定义

| 类型 | 说明 | 执行工具 |
|------|------|---------|
| **API 测试** | 验证后端接口的请求/响应契约 | curl / Playwright API |
| **UI 测试** | 验证页面元素、状态、交互行为 | Playwright Browser |
| **E2E 测试** | 完整业务流程（登录→操作→结果） | Playwright Browser |
| **架构验证** | 验证数据写入逻辑（字段、状态） | API + DB Query |

### 1.2 测试用例结构

```
用例ID      ：TC-XXXX
测试类型    ：API / UI / E2E / 架构验证
WBS任务     ：H-XXX（对应的Hermes任务）
PRD章节引用 ：§F-XX (§6)
数据前提    ：谁、以什么身份、什么数据状态才能执行
API端点     ：Method + URL + Header + Body（JSON示例）
UI验收标准  ：页面元素、字段值、颜色标签
预期结果    ：HTTP状态码 + Response Body字段断言
错误条件    ：边界值、异常输入、权限违规
执行状态    ：🔄待执行 / 🔄执行中 / ✅PASS / ❌FAIL / ⏭️待代码
```

### 1.3 角色测试账号

| 角色 | 姓名 | 邮箱 | 密码 | 备注 |
|------|------|------|------|------|
| SYS_ADMIN | — | admin@sandvik.com | Password123 | 系统管理员 |
| CEO | Frank Tao | frank.tao@sandvik.com | Password123 | 最终审批人 |
| VP_SALES | 杨依柱 | (待补充) | Password123 | 大区负责人 |
| MANAGER | 李长春 | changchun.li@ahno-tool.com | Password123 | 直线经理 |
| SALES | 韩学健 | xuejian.han@ahno-tool.com | Password123 | 销售 |
| SALES | 李清 | qing.li@ahno-tool.com | Password123 | 销售 |
| SALES | 张伟 | zhang.wei@sandvik.com | Password123 | 销售 |
| DIRECTOR | 李娜 | li.na@sandvik.com | Password123 | 区域总监 |

> **数据前提：** 执行 `POST /api/seed/reset-users` 可重置所有账号密码为 `Password123`

---

## 二、测试用例清单

> **WBS 4轮模块顺序：**
> - **第1轮：** F-07 组织架构 + F-02 周期管理
> - **第2轮：** F-05 客户管理 + F-06 产品管理 + F-10 开票公司
> - **第3轮：** F-03 预测填报 + F-04 预测审批
> - **第4轮：** F-01 Dashboard + F-09 EmailQueue + F-08 用户/认证

---

### S-FW 框架层（各轮通用，先行验证）

> 框架层验证系统基础设施，不依赖特定功能模块，可随时执行。

#### TC-FW01 登录成功
- **测试类型：** E2E
- **WBS任务：** —（框架）
- **PRD章节：** §11 / §F- (§6)11
- **数据前提：** 用户账号存在于系统，密码正确
- **API端点：** `POST /api/auth/login` Body: `{ "email": "admin@sandvik.com", "password": "Password123" }`
- **UI验收标准：** 输入正确凭证 → 跳转 /dashboard，显示用户名
- **预期结果：** HTTP 200，返回 JWT token，响应包含 `{ success: true, data: { token, user: {...} } }`
- **执行状态：** ✅ PASS（旧版TC-0101已通过）

---

#### TC-FW02 登录失败（密码错误）
- **测试类型：** API
- **WBS任务：** —（框架）
- **PRD章节：** §11 / §F- (§6)11
- **数据前提：** 账号存在，密码错误
- **API端点：** `POST /api/auth/login` Body: `{ "email": "admin@sandvik.com", "password": "WrongPassword" }`
- **预期结果：** HTTP 401，`{ success: false, message: "Invalid credentials" }`
- **执行状态：** ✅ PASS（旧版TC-0102已通过）

---

#### TC-FW03 未登录访问受保护路由
- **测试类型：** API
- **WBS任务：** —（框架）
- **PRD章节：** §11 / §F- (§6)11
- **数据前提：** 无token
- **API端点：** `GET /api/forecast/periods`（无 Authorization header）
- **预期结果：** HTTP 401，`{ success: false, message: "Unauthorized" }`
- **执行状态：** ✅ PASS（旧版TC-0103已通过）

---

#### TC-FW04 Token过期
- **测试类型：** API
- **WBS任务：** —（框架）
- **PRD章节：** §11 / §F- (§6)11
- **数据前提：** 使用过期/无效token
- **API端点：** `GET /api/forecast/periods` Header: `Authorization: Bearer invalid_token`
- **预期结果：** HTTP 401
- **执行状态：** ✅ PASS（旧版TC-0104已通过）

---

#### TC-FW05 统一错误码：所有API异常返回标准结构
- **测试类型：** API
- **WBS任务：** H-035（已完成）
- **PRD章节：** §4.4.3 / §F- (§6)
- **数据前提：** 有效JWT登录
- **测试步骤：** 对以下端点发送异常请求，验证响应格式一致：
  1. `GET /api/forecast/periods/99999` → 404 Not Found
  2. `POST /api/forecast/records` body: `{}` → 400 Bad Request（缺少必填字段）
  3. `GET /api/nonexistent-endpoint` → 404
- **预期结果：** 所有异常响应格式：`{ success: false, message: "...", code: "ERROR_CODE" }`
- **执行状态：** ✅ PASS（旧版TC-0108，H-035已完成统一错误码）

---

#### TC-FW06 多设备登录互斥
- **测试类型：** API
- **WBS任务：** H-034（已完成）
- **PRD章节：** §11.2 / §F- (§6)11.2
- **数据前提：** 用户A在设备1登录，在设备2登录同一账号
- **测试步骤：**
  1. 设备1：`POST /api/auth/login` → 获取 token_A
  2. 设备2：`POST /api/auth/login` → 获取 token_B
  3. 设备1：用 token_A 访问 `GET /api/auth/me`
- **预期结果：** 设备1的token_A被吊销，HTTP 401；设备2的token_B正常工作
- **执行状态：** ✅ PASS（H-034已完成）

---

### S-01 登录与认证

#### TC-0101 用户登录成功
> *见 TC-FW01，已迁移至框架层*

#### TC-0102 用户登录失败
> *见 TC-FW02，已迁移至框架层*

---

### S-02 预测周期管理（F-02，第1轮）

#### TC-0201 创建预测周期（完整字段）
- **测试类型：** API + UI
- **WBS任务：** H-038（已有基础功能）
- **PRD章节：** §4.2.1 / §F- (§6)02
- **数据前提：** SYS_ADMIN账号登录
- **API端点：**
  ```
  POST /api/forecast-periods
  Body: {
    "fcName": "2026 FC2",
    "fillTimeStart": "2026-04-01T00:00:00",
    "fillTimeEnd": "2026-04-30T23:59:59",
    "periodStartYearMonth": "2026-07",
    "periodEndYearMonth": "2027-03",
    "extensionStart": null,
    "extensionEnd": null,
    "extensionUsers": "[]"
  }
  ```
- **UI验收标准（F-02.2）：**
  - 表单字段：周期名称 / 填报起始时间 / 填报截止时间 / 预测起始年月 / 预测结束年月 / 延期起始时间 / 延期截止时间 / 延期人员名单
  - 延期字段为非必填；人员名单支持按名称搜索多选
- **预期结果：** HTTP 201，返回周期ID，列表刷新显示新周期
- **执行状态：** 🔄待执行

---

#### TC-0202 预测周期列表查询
- **测试类型：** API
- **WBS任务：** H-038（已有基础功能）
- **PRD章节：** §F- (§6)02.1
- **数据前提：** 系统存在多个预测周期
- **API端点：**
  ```
  GET /api/forecast/periods
  GET /api/forecast/periods?page=1&pageSize=20
  ```
- **UI验收标准（F-02.1）：**
  - 表格列：周期名称 | 填报窗口 | 延期窗口 | 状态 | 操作
  - 状态标签：即将开始/填报中/已截止/已结束（颜色区分）
  - 操作列：有数据时[编辑]显示，[删除]仅在无数据时显示
- **预期结果：** HTTP 200，分页正确，状态字段正确
- **执行状态：** 🔄待执行

---

#### TC-0203 预测周期编辑
- **测试类型：** API + UI
- **WBS任务：** H-038（已有基础功能）
- **PRD章节：** §4.2.1 / §F- (§6)02.2
- **数据前提：** 存在一个空预测周期
- **API端点：**
  ```
  PUT /api/forecast-periods/{id}
  Body: { "fcName": "2026 FC2 Updated", ... }
  ```
- **UI验收标准：** 编辑弹窗中所有字段预填充，保存后列表刷新
- **预期结果：** HTTP 200，周期名称已更新
- **执行状态：** 🔄待执行

---

#### TC-0204 预测周期删除（有数据时禁止）
- **测试类型：** API + UI
- **WBS任务：** H-050（已完成✅，commit dbf85d7）
- **PRD章节：** §4.2.1 / §F- (§6)02.1
- **数据前提A：** 存在一个**无**任何填报数据的空周期 → 可删除
- **数据前提B：** 存在一个**有**填报数据的周期 → 禁止删除
- **API端点（空周期）：**
  ```
  DELETE /api/forecast-periods/{id}
  ```
- **API端点（有数据周期）：**
  ```
  DELETE /api/forecast-periods/{id_with_data}
  ```
- **UI验收标准（F-02.1）：**
  - 有数据时[删除]按钮**不显示**（前端保护）
  - 无数据时点击删除 → 弹出「该周期无填报数据，确认删除？」→ 确认后HTTP 200
- **预期结果：**
  - 空周期：HTTP 200，周期从列表消失
  - 有数据周期：HTTP 400，`{ success: false, message: "PERIOD_HAS_RECORDS", code: "PERIOD_HAS_RECORDS" }`
- **错误条件：** 有数据的周期删除时，后端返回 `PERIOD_HAS_RECORDS` 错误码
- **执行状态：** 🔄待执行（H-050已完成后端校验，E2E待小Q执行）

---

#### TC-0205 延期窗口：白名单用户在截止后提交
- **测试类型：** API + E2E
- **WBS任务：** H-062（🔴待代码，第3轮）
- **PRD章节：** §4.2.1 / PRD v0.4 §4.2.1
- **数据前提：**
  - 预测周期：FillTimeEnd已过，但ExtensionEnd未过
  - 用户A在extensionUsers名单内
  - 用户B不在extensionUsers名单内
- **操作步骤：**
  1. 用户A提交预测 → 应成功
  2. 用户B提交预测 → 应被拒绝
- **API端点：**
  ```
  POST /api/forecast/submit
  Body: { ... }
  ```
- **预期结果：**
  - 用户A：HTTP 201（延期白名单生效）
  - 用户B：HTTP 400（"不在延期提交名单内"或"提交已截止"）
- **执行状态：** ⏭️待H-062代码完成

---

#### TC-0206 延期窗口：按名称搜索筛选人员
- **测试类型：** UI
- **WBS任务：** H-062（🔴待代码，第3轮）
- **PRD章节：** §F- (§6)02.2
- **数据前提：** SYS_ADMIN打开周期编辑弹窗
- **UI验收标准：** 延期人员名单字段支持输入名称实时搜索，点击选中后显示为标签；支持多选
- **操作步骤：** 在延期人员输入框输入"韩" → 下拉显示所有名字含"韩"的用户 → 点击选中
- **预期结果：** 选中人员显示为可移除标签，保存后extensionUsers正确保存
- **执行状态：** ⏭️待H-062代码完成

---

#### TC-0207 周期列表状态标签颜色
- **测试类型：** UI
- **WBS任务：** H-038（已有基础功能）
- **PRD章节：** §F- (§6)02.1
- **数据前提：** 系统中存在不同时期的周期
- **UI验收标准：**
  - 即将开始 → 蓝色标签
  - 填报中 → 绿色标签
  - 已截止 → 灰色标签
  - 已结束 → 红色标签
- **预期结果：** 状态颜色与PRD §F-02插图一致
- **执行状态：** 🔄待执行

---

### S-07 组织架构管理（F-07，第1轮）

> **代码现状（2026-05-06）：**
> - H-047 ✅ Migration完成（sales_region + sales_district列已加）
> - H-048 ✅ OrgNodesController POST/PUT/DELETE完成（commit ac703ed）
> - H-049 ⏳ 前端管理页面修复中（API端点+salesRegion/salesDistrict字段）

#### TC-0701 GET /api/org-nodes 列表查询
- **测试类型：** API
- **WBS任务：** H-048（已完成✅）
- **PRD章节：** §F- (§6)07
- **数据前提：** 数据库中已存在多条OrgNode记录（含Active和Inactive）
- **API端点：**
  ```
  GET /api/org-nodes
  GET /api/org-nodes?region=华东大区
  GET /api/org-nodes?keyword=张三
  ```
- **预期结果：**
  - HTTP 200，`{ success: true, data: [...] }`
  - 返回所有 Status="Active" 的节点（Global Query Filter自动过滤Inactive）
  - data数组每项包含：id, name, email, role, region, company, parentId, status, salesRegion, salesDistrict
  - GET /api/org-nodes?region=X 只返回region=X的节点
  - GET /api/org-nodes?keyword=X 模糊匹配name或email（不区分大小写）
- **错误条件：** 无效的region值 → 返回空数组（不报错）
- **执行状态：** 🔄待小Q执行

---

#### TC-0702 GET /api/org-nodes/{id} 单条查询
- **测试类型：** API
- **WBS任务：** H-048（已完成✅）
- **PRD章节：** §F- (§6)07
- **数据前提：** 存在已知ID的OrgNode记录
- **API端点：**
  ```
  GET /api/org-nodes/1
  ```
- **预期结果：**
  - HTTP 200，`{ success: true, data: { id, name, email, role, region, company, parentId, status, salesRegion, salesDistrict } }`
  - 不存在的ID → HTTP 404，`{ success: false, message: "Org node not found" }`
- **执行状态：** 🔄待小Q执行

---

#### TC-0703 POST /api/org-nodes 创建节点
- **测试类型：** API
- **WBS任务：** H-048（已完成✅）
- **PRD章节：** §F- (§6)07
- **数据前提：** SYS_ADMIN登录，数据库无冲突邮箱
- **API端点：**
  ```
  POST /api/org-nodes
  Content-Type: application/json
  Body: {
    "name": "测试销售",
    "email": "test.user@sandvik.com",
    "role": "SALES",
    "region": "华东大区",
    "salesRegion": "华东大区",
    "salesDistrict": "上海区",
    "company": "Ahno-tool",
    "parentId": 1
  }
  ```
- **预期结果：** HTTP 201，`{ success: true, data: { id: 新ID, name: "测试销售", ..., status: "Active" } }`
- **错误条件：**
  - 缺少必填字段name/email → HTTP 400
  - 无效role值 → HTTP 400
  - parentId不存在 → HTTP 400
  - parentId == id（自循环）→ HTTP 400
  - 重复邮箱 → HTTP 400（由数据库唯一约束）
- **执行状态：** 🔄待小Q执行

---

#### TC-0704 PUT /api/org-nodes/{id} 更新节点
- **测试类型：** API
- **WBS任务：** H-048（已完成✅）
- **PRD章节：** §F- (§6)07
- **数据前提：** 存在已知ID的OrgNode记录
- **API端点：**
  ```
  PUT /api/org-nodes/5
  Content-Type: application/json
  Body: {
    "name": "测试销售_已改名",
    "region": "华南大区",
    "salesRegion": "华南大区",
    "salesDistrict": "广州区"
  }
  ```
- **预期结果：** HTTP 200，`{ success: true, data: { ... updated fields ... } }`，数据库中对应记录已更新
- **错误条件：**
  - parentId == id（自循环）→ HTTP 400
  - 不存在的节点ID → HTTP 404
- **执行状态：** 🔄待小Q执行

---

#### TC-0705 DELETE /api/org-nodes/{id} 软删除（无子节点）
- **测试类型：** API
- **WBS任务：** H-048（已完成✅）
- **PRD章节：** §F- (§6)07
- **数据前提：** 存在一个**无子节点**的OrgNode（ParentId不为该节点ID的节点）
- **API端点：**
  ```
  DELETE /api/org-nodes/{leaf_node_id}
  ```
- **预期结果：** HTTP 200，`{ success: true, message: "Org node deactivated" }`，数据库中该记录 Status="Inactive"（非物理删除）
- **执行状态：** 🔄待小Q执行

---

#### TC-0706 DELETE /api/org-nodes/{id} 软删除（有子节点，级联）
- **测试类型：** API
- **WBS任务：** H-048（已完成✅）
- **PRD章节：** §F- (§6)07
- **数据前提：** 存在**有子节点**的OrgNode（如区域总监节点，其下有销售节点）
- **API端点：**
  ```
  DELETE /api/org-nodes/{parent_node_id}
  ```
- **预期结果：** HTTP 200，该节点 Status="Inactive"，**且所有子节点（ParentId指向该节点）同样被级联软删除为Status="Inactive"**
- **验证步骤：** 查询数据库 `SELECT Status FROM OrgNodes WHERE ParentId = {parent_node_id}` → 应全部为 Inactive
- **执行状态：** 🔄待小Q执行

---

#### TC-0707 E2E 组织节点CRUD（前端页面）
- **测试类型：** E2E
- **WBS任务：** H-052（🔴待H-049前端完成）
- **PRD章节：** §F- (§6)07
- **数据前提：** H-049前端完成；SYS_ADMIN登录
- **测试步骤：**
  1. 进入"组织架构"页面 → 左侧树形正常显示
  2. 点击[➕新增节点] → 弹窗填写name/email/role/region/salesRegion/salesDistrict/company/parentId → 保存 → HTTP 201 → 树刷新
  3. 点击某节点[✏️编辑] → 弹窗预填充 → 修改name → 保存 → HTTP 200 → 树刷新
  4. 点击某叶子节点[🗑️删除] → HTTP 200 → 节点从树消失（状态变为Inactive）
  5. 点击有子节点的节点[🗑️删除] → 弹窗提示"删除后下属节点也会停用" → 确认 → 父+子全部停用
- **UI验收标准：** PRD §F-07.3 组织架构管理页面布局与操作一致
- **执行状态：** ⏭️待H-049前端完成

---

### S-05 客户管理（F-05，第2轮）

> **代码现状：** 当前 customers 表为硬删除，CRUD API只有GET。H-054需改为软删除，H-055需加POST/PUT/DELETE。

#### TC-0501 GET /api/customers 客户列表查询
- **测试类型：** API
- **WBS任务：** H-038（基础已有）
- **PRD章节：** §F- (§6)05
- **数据前提：** 数据库中已存在客户记录
- **API端点：** `GET /api/customers`
- **预期结果：** HTTP 200，`{ success: true, data: [...] }`，返回所有未删除客户（软删除自动过滤）
- **执行状态：** 🔄待执行（基础已有，需验证过滤）

---

#### TC-0502 POST /api/customers 创建客户
- **测试类型：** API
- **WBS任务：** H-055（🔴待H-054软删迁移完成后）
- **PRD章节：** §F- (§6)05
- **数据前提：** SYS_ADMIN登录，无重复客户名称
- **API端点：**
  ```
  POST /api/customers
  Body: { "customerName": "测试客户A", "customerCode": "CA001", ... }
  ```
- **预期结果：** HTTP 201，`{ success: true, data: { id, customerName, ... } }`，isDeleted=false
- **错误条件：** 缺少必填字段 → HTTP 400
- **执行状态：** ⏭️待H-054+H-055代码完成

---

#### TC-0503 PUT /api/customers/{id} 编辑客户
- **测试类型：** API
- **WBS任务：** H-055（🔴待代码）
- **PRD章节：** §F- (§6)05
- **数据前提：** 存在已知ID的客户记录
- **预期结果：** HTTP 200，记录更新，isDeleted保持false
- **执行状态：** ⏭️待代码完成

---

#### TC-0504 DELETE /api/customers/{id} 软删除
- **测试类型：** API
- **WBS任务：** H-055（🔴待代码）
- **PRD章节：** §F- (§6)05
- **数据前提：** 存在客户记录，且该客户**无**关联预测记录
- **API端点：** `DELETE /api/customers/{id}`
- **预期结果：** HTTP 200，数据库isDeleted=true（物理不删除）
- **错误条件：** 客户有关联预测记录 → HTTP 400
- **执行状态：** ⏭️待代码完成

---

#### TC-0505 E2E 客户管理页面（新建/编辑/软删除）
- **测试类型：** E2E
- **WBS任务：** H-056（🔴待代码）
- **PRD章节：** §F- (§6)05
- **数据前提：** H-055 API完成；SYS_ADMIN登录
- **执行状态：** ⏭️待代码完成

---

### S-06 产品管理（F-06，第2轮）

> **代码现状：** 产品SubPA4模糊搜索缺失，POST /api/products新增缺失。

#### TC-0601 SubPA4 模糊搜索（输入即搜，左右模糊）
- **测试类型：** API
- **WBS任务：** H-057（🔴待代码）
- **PRD章节：** §4.3.2 / §F- (§6)06
- **数据前提：** 数据库中已存在多级产品数据（PA→SubPA-1→SubPA-2→SubPA-3→SubPA-4）
- **API端点：**
  ```
  GET /api/products?subPa4=截齿
  GET /api/products?subPa4=abc（部分匹配）
  ```
- **预期结果：** HTTP 200，返回所有SubPA-4名称**包含**搜索关键词的产品（左右模糊，即%keyword%）
- **执行状态：** ⏭️待H-057代码完成

---

#### TC-0602 POST /api/products 新增产品（自动流水号）
- **测试类型：** API
- **WBS任务：** H-058（🔴待代码）
- **PRD章节：** §F- (§6)06
- **数据前提：** SYS_ADMIN登录
- **API端点：**
  ```
  POST /api/products
  Body: { "productName": "新挖掘机", "category": "大型设备", "pa1": "重工", "pa2": "挖掘", "pa3": "大型", "pa4": "新挖掘" }
  ```
- **预期结果：** HTTP 201，系统自动生成产品编码（如PA001-xxxxx-xxxxx-xxxxx-YYYY01），其中YYYY为年份末两位，01为流水号
- **执行状态：** ⏭️待H-058代码完成

---

#### TC-0603 产品5级联动（PA→SubPA-4）
- **测试类型：** UI + API
- **WBS任务：** H-038（基础已有）
- **PRD章节：** §4.3.2 / §F- (§6)06
- **数据前提：** 销售账号登录，进入预测填报页
- **UI操作：** 选择PA1"截齿" → PA2自动筛选出截齿类 → ... → PA4(SubPA4)显示所有截齿型号
- **预期结果：** 每级选择后下一级选项自动筛选，支持回退重选
- **执行状态：** 🔄待执行

---

### S-10 开票公司（F-10，第2轮）

> **代码现状：** InvoiceCompany只有GET，POST/PUT缺失，user-invoice-permissions完全缺失。

#### TC-1001 GET /api/invoice-companies 开票公司列表
- **测试类型：** API
- **WBS任务：** H-038（基础已有）
- **PRD章节：** §F- (§6)10
- **预期结果：** HTTP 200，返回所有isDeleted=false的开票公司
- **执行状态：** 🔄待执行

---

#### TC-1002 POST /api/invoice-companies 新增开票公司
- **测试类型：** API
- **WBS任务：** H-059（🔴待代码）
- **PRD章节：** §F- (§6)10
- **数据前提：** SYS_ADMIN登录
- **API端点：**
  ```
  POST /api/invoice-companies
  Body: { "companyName": "测试开票公司", "taxNumber": "91310000XXXXXXXX", "address": "上海市...", "bankName": "招商银行", "bankAccount": "621483..." }
  ```
- **预期结果：** HTTP 201，`{ success: true, data: { id, companyName, ... } }`
- **执行状态：** ⏭️待H-059代码完成

---

#### TC-1003 PUT /api/invoice-companies/{id} 编辑开票公司
- **测试类型：** API
- **WBS任务：** H-059（🔴待代码）
- **预期结果：** HTTP 200，开票公司信息更新
- **执行状态：** ⏭️待代码完成

---

#### TC-1004 GET /api/user-invoice-permissions 用户开票权限查询
- **测试类型：** API
- **WBS任务：** H-060（🔴待代码）
- **PRD章节：** §F- (§6)10
- **数据前提：** 用户登录
- **API端点：** `GET /api/user-invoice-permissions?userId=xxx`
- **预期结果：** HTTP 200，返回该用户授权的开票公司列表（含公司名称+权限类型）
- **执行状态：** ⏭️待H-060代码完成

---

#### TC-1005 POST /api/user-invoice-permissions 分配开票权限
- **测试类型：** API
- **WBS任务：** H-060（🔴待代码）
- **数据前提：** SYS_ADMIN登录
- **API端点：**
  ```
  POST /api/user-invoice-permissions
  Body: { "userId": 1, "invoiceCompanyId": 5, "permissionType": "CAN_INVOICE" }
  ```
- **预期结果：** HTTP 201，权限记录创建成功
- **执行状态：** ⏭️待代码完成

---

#### TC-1006 PUT /api/user-invoice-permissions/{id} 修改权限
- **测试类型：** API
- **WBS任务：** H-060（🔴待代码）
- **预期结果：** HTTP 200，权限类型或关联公司更新
- **执行状态：** ⏭️待代码完成

---

#### TC-1007 E2E 用户-开票公司权限配置页面
- **测试类型：** E2E
- **WBS任务：** H-061（🔴待代码）
- **PRD章节：** §F- (§6)10
- **执行状态：** ⏭️待H-060代码完成

---

### S-03 预测记录填报（F-03，第3轮）

> **代码现状：** submit未创建ApprovalRequest，save-draft语义不清，复制功能缺失，时间窗口无校验。

#### TC-0301 创建预测记录（4度量字段）
- **测试类型：** API + UI
- **WBS任务：** H-038（基础已有）
- **PRD章节：** §4.2.2 / §F- (§6)03.2
- **数据前提：** 销售账号登录，有效预测周期（状态=填报中），当前在填报窗口内
- **API端点：**
  ```
  POST /api/forecast/records
  Body: {
    "forecastPeriodId": "周期ID",
    "customerId": "客户ID",
    "invoiceCompanyId": "开票公司ID",
    "productId": "PA001-xxx",
    "year": 2026,
    "data": {
      "orderQty": { "2026-07": 100, "2026-08": 120 },
      "orderAmount": { "2026-07": 50000, "2026-08": 60000 },
      "invoiceQty": { "2026-07": 80, "2026-08": 100 },
      "invoiceAmount": { "2026-07": 40000, "2026-08": 50000 }
    }
  }
  ```
- **预期结果：** HTTP 201，返回记录ID，4个度量独立填写不合并
- **执行状态：** 🔄待执行（基础已有，需验证4度量独立）

---

#### TC-0302 订单金额/开票金额独立填写
- **测试类型：** API
- **WBS任务：** H-038（基础已有）
- **PRD章节：** §4.2.2 / §F- (§6)03.2
- **数据前提：** 同TC-0301
- **测试步骤：** 在同一月份，订单金额=50000，开票金额=40000（不相等）
- **预期结果：** HTTP 201，数据库中两条记录独立存储，不自动关联
- **执行状态：** 🔄待执行

---

#### TC-0303 单价自动计算（amount/qty）
- **测试类型：** API + UI
- **WBS任务：** H-038（基础已有）
- **PRD章节：** §4.2.2 / §F- (§6)03.2
- **预期结果：** 前端根据输入的amount和qty自动计算并显示单价（amount÷qty）
- **执行状态：** 🔄待执行

---

#### TC-0304 保存草稿（不触发审批流）
- **测试类型：** API
- **WBS任务：** H-064（🔴待代码）
- **PRD章节：** §4.2.2 / §F- (§6)03.4
- **数据前提：** 销售账号登录，有效周期
- **API端点：**
  ```
  POST /api/forecast/save-draft
  Body: { ... 同TC-0301 ... }
  ```
- **预期结果：** HTTP 201，返回记录ID，状态为DRAFT，**不创建ApprovalRequest记录**
- **验证：** `GET /api/approvals?forecastRecordId=X` → 返回空（无审批请求）
- **执行状态：** ⏭️待H-064代码完成

---

#### TC-0305 提交审批（状态变更+触发审批流）
- **测试类型：** API
- **WBS任务：** H-063（🔴待代码）
- **PRD章节：** §4.2.2 / §F- (§6)03.5
- **数据前提：** 销售账号登录，有草稿记录或直接提交
- **API端点：**
  ```
  POST /api/forecast/submit
  Body: { "forecastRecordId": 123 }
  ```
- **预期结果：** HTTP 201，预测记录状态变为SUBMITTED，**同时创建ApprovalRequest记录**（currentLevel=1）
- **验证：** `GET /api/approvals?forecastRecordId=123` → 返回审批请求，currentLevel=1
- **错误条件：** 已Submitted的记录再次submit → HTTP 400
- **执行状态：** ⏭️待H-063代码完成

---

#### TC-0306 复制上期数据功能
- **测试类型：** API + UI
- **WBS任务：** H-065（🔴待代码）
- **PRD章节：** §F- (§6)03.10
- **数据前提：** 销售A有上期（2026-Q1）填报记录，本期（2026-Q2）尚未填报
- **API端点：**
  ```
  POST /api/forecast/copy-from-previous
  Body: { "forecastPeriodId": "本期周期ID", "customerId": "客户ID", "productId": "产品ID" }
  ```
- **预期结果：** HTTP 201，将上期同客户+同产品+同月份数据复制为草稿（DRAFT），amount/qty不变
- **执行状态：** ⏭️待H-065代码完成

---

#### TC-0307 填报时间窗口校验（FillTimeEnd后禁止提交）
- **测试类型：** API
- **WBS任务：** H-062（🔴待代码）
- **PRD章节：** §4.2.2 / §F- (§6)03.5
- **数据前提：** 预测周期已过FillTimeEnd，当前时间 > FillTimeEnd
- **API端点：** `POST /api/forecast/submit`
- **预期结果：**
  - 普通用户：HTTP 400，`{ success: false, message: "提交已截止" }`
  - 延期白名单用户（在extensionUsers中）：HTTP 201
- **执行状态：** ⏭️待H-062代码完成

---

#### TC-0308 填报表单：开票公司选择字段
- **测试类型：** UI
- **WBS任务：** H-066（🔴待H-059开票公司API）
- **PRD章节：** §F- (§6)03.2
- **数据前提：** 销售账号登录，进入填报页
- **UI验收标准：** 填报表单包含「开票公司」下拉字段，只显示当前用户有权限（CAN_INVOICE）的开票公司
- **执行状态：** ⏭️待H-059+H-066代码完成

---

### S-04 预测审批（F-04，第3轮）

#### TC-0401 提交审批：创建ApprovalRequest
- **测试类型：** API
- **WBS任务：** H-063（🔴待代码）
- **PRD章节：** §4.2.3 / §F- (§6)04
- **数据前提：** 销售提交预测（TC-0305）
- **验证步骤：** 查询 `SELECT * FROM ApprovalRequests WHERE ForecastRecordId = X`
- **预期结果：** 存在一条记录，Status=PENDING，CurrentLevel=1，CreatedAt=提交时间
- **执行状态：** ⏭️待H-063代码完成

---

#### TC-0402 待审批列表：直线经理看到团队待审批
- **测试类型：** API + UI
- **WBS任务：** H-067（🔴待代码）
- **PRD章节：** §4.2.3 / §F- (§6)04.1
- **数据前提：** 直线经理账号登录，其下有销售提交了预测
- **API端点：** `GET /api/approvals/pending`
- **预期结果：** HTTP 200，返回该经理**团队**的待审批记录（不包含其他团队）
- **UI验收标准：** 列表页显示卡片+Tab切换（全部/待我审批/我已审批），可按状态筛选
- **执行状态：** ⏭️待H-067代码完成

---

#### TC-0403 审批通过（自动推进到上级）
- **测试类型：** API
- **WBS任务：** H-063（🔴待代码）
- **PRD章节：** §4.2.3 / §F- (§6)04.2
- **数据前提：** 存在待审批记录（CurrentLevel=1，直线经理审批）
- **API端点：**
  ```
  POST /api/approvals/approve
  Body: { "approvalRequestId": 123, "comments": "同意" }
  ```
- **预期结果：** HTTP 200，审批记录CurrentLevel推进到2，Status仍为PENDING（区域总监审批中）
- **执行状态：** ⏭️待H-063代码完成

---

#### TC-0404 审批驳回（逐层退回）
- **测试类型：** API
- **WBS任务：** H-063（🔴待代码）
- **PRD章节：** §4.2.3 / §F- (§6)04.3
- **数据前提：** 直线经理驳回销售提交
- **API端点：**
  ```
  POST /api/approvals/reject
  Body: { "approvalRequestId": 123, "comments": "数据需修正" }
  ```
- **预期结果：** HTTP 200，审批记录Status=REJECTED，ForecastRecord状态变回DRAFT，销售可修改后重新提交
- **执行状态：** ⏭️待H-063代码完成

---

#### TC-0405 审批调整（退回+4个总量值+comments）
- **测试类型：** API
- **WBS任务：** H-063（🔴待代码）
- **PRD章节：** §4.2.3 / §F- (§6)04.4
- **数据前提：** 直线经理查看详情后发现数量偏差，直接调整后同意
- **API端点：**
  ```
  POST /api/approvals/adjust
  Body: {
    "approvalRequestId": 123,
    "comments": "已调整订单数量",
    "adjustedData": {
      "orderQty": { "2026-07": 110 },
      "orderAmount": { "2026-07": 55000 }
    }
  }
  ```
- **预期结果：** HTTP 200，ForecastRecord数据更新，审批推进到下一级
- **执行状态：** ⏭️待H-063代码完成

---

#### TC-0406 审批历史记录完整（时间戳+操作人+动作+4总量值+comments）
- **测试类型：** API
- **WBS任务：** H-063（🔴待代码）
- **PRD章节：** §4.2.3 / §F- (§6)04.5
- **数据前提：** 完成一个完整审批流程（提交→直线经理→区域总监→大区负责人→CEO）
- **API端点：** `GET /api/approvals/{id}/history`
- **预期结果：** 返回ApprovalHistory记录列表，每条包含：
  - timestamp（操作时间）
  - approverEmail（操作人邮箱）
  - action（PENDING/APPROVED/REJECTED/ADJUSTED）
  - comments（批注）
  - adjustedData（如有调整，显示4个总量值）
- **执行状态：** ⏭️待H-063代码完成

---

#### TC-0407 审批详情页（时间线+操作区）
- **测试类型：** E2E
- **WBS任务：** H-068（🔴待代码）
- **PRD章节：** §F- (§6)04.11
- **数据前提：** 直线经理登录，有待审批记录
- **UI验收标准：** ApprovalFlow.vue（已有但不完整）需包含：
  - 左侧：时间线显示所有审批节点（已通过✅/当前⏳/待审批⬜）
  - 右侧：操作区（通过/驳回/调整三个按钮）+批注输入框
- **执行状态：** ⏭️待H-068代码完成

---

### S-09 EmailQueue（F-09，第4轮）

#### TC-0901 邮件队列表格显示
- **测试类型：** UI
- **WBS任务：** H-071（🔴待代码）
- **PRD章节：** §F- (§6)09
- **UI验收标准：** 邮件队列管理页面包含：发件人 | 收件人 | 主题 | 状态（Pending/Sent/Failed）| 重试次数 | 创建时间 | 操作
- **执行状态：** ⏭️待H-071代码完成

---

#### TC-0902 邮件发送失败自动重试
- **测试类型：** API + 架构验证
- **WBS任务：** H-071（🔴待代码）
- **PRD章节：** §4.4.3 / §F- (§6)09
- **数据前提：** EmailQueue表中有一条Status=Failed，RetryCount < 3的记录
- **测试步骤：** 触发重试逻辑（后台Job或手动）
- **预期结果：** RetryCount+1，若发送成功Status=Sent，否则保持Failed

---

### S-08 用户与认证（F-08，第4轮）

#### TC-0801 users表brand字段存在且可过滤
- **测试类型：** 架构验证
- **WBS任务：** H-072（🔴待Migration完成）
- **PRD章节：** §F- (§6)08.1
- **验证步骤：** `DESCRIBE users;` 或 EF Core 查询 `User.Brand` 属性
- **预期结果：** users表有brand列，Entity有Brand属性，可按brand过滤销售数据
- **执行状态：** ⏭️待H-072代码完成

---

#### TC-0802 首次SSO登录不存在则拒绝
- **测试类型：** E2E
- **WBS任务：** H-073（🔴待代码）
- **PRD章节：** §11.1 / §F- (§6)08.3
- **数据前提：** M365账号（在Azure AD中）但不在users表（从未登录过）
- **操作步骤：** 该用户点击M365登录
- **预期结果：** 拒绝登录，显示「该账号未授权，请联系管理员」，**不自动创建用户记录**
- **验证：** `SELECT * FROM Users WHERE Email = 'new.user@sandvik.com'` → 应为空
- **执行状态：** ⏭️待H-073代码完成

---

#### TC-0803 Dashboard只含Approved数据
- **测试类型：** API
- **WBS任务：** H-070（已完成✅，commit dbf85d7）
- **PRD章节：** §F- (§6)01
- **数据前提：** DashboardController已加APPROVED过滤
- **API端点：** `GET /api/dashboard/summary`
- **预期结果：** 返回数据只包含Status=APPROVED的预测记录，不含DRAFT或SUBMITTED
- **验证：** 直接查询DB确认无Draft/Submitted记录
- **执行状态：** 🔄待小Q执行

---

## 三、测试执行记录

| 日期 | 执行人 | 测试套件 | 通过/总数 | 备注 |
|------|--------|---------|---------|------|
| 2026-05-06 | 小Q | TC-FW01~06（框架层） | 6/6 | H-035/H-034已完成，框架验证通过 |
| — | — | — | 0/N | 第1轮测试重启，2026-05-06 |

---

## 四、测试状态说明

| 状态 | 含义 |
|------|------|
| 🔄 待执行 | 等待开发完成后由小Q执行 |
| 🔄 执行中 | 小Q正在执行 |
| ✅ PASS | 测试通过，证据已记录 |
| ❌ FAIL | 测试失败，缺陷已记录到ISSUE_LOG.md |
| ⏭️ 待代码 | 对应功能代码未完成，测试用例存在但无法执行 |
| ⏭️ 待H-XXX | 等待指定Hermes任务完成后方可执行 |

---

## 五、Q-XXX测试任务对照表

| 测试任务 | 对应TC | 测试内容 | WBS H-XXX | 状态 |
|---------|--------|---------|---------|------|
| Q-FW | TC-FW01~06 | 框架层：登录+认证+错误码+互斥 | H-034/035 ✅ | ✅ |
| Q-070 | TC-0701~0706 | F-07 OrgNodes API CRUD | H-047✅ H-048✅ | 🔄待执行 |
| Q-071 | TC-0707 | F-07 E2E 组织节点CRUD | H-052 ⏭️待H-049 | ⏭️待H-049 |
| Q-020 | TC-0204 | F-02 周期删除校验 | H-050 ✅ | 🔄待执行 |
| Q-021 | TC-0201~0203/0207 | F-02 周期CRUD+状态标签 | H-038 | 🔄待执行 |
| Q-051 | TC-0501~0504 | F-05 客户CRUD+软删 | H-054/055 ⏭️ | ⏭️待代码 |
| Q-061 | TC-0601~0603 | F-06 产品搜索+新增 | H-057/058 ⏭️ | ⏭️待代码 |
| Q-101 | TC-1001~1003 | F-10 开票公司CRUD | H-059 ⏭️ | ⏭️待代码 |
| Q-102 | TC-1004~1007 | F-10 用户开票权限 | H-060/061 ⏭️ | ⏭️待代码 |
| Q-031 | TC-0301~0303 | F-03 预测4度量 | H-038 | 🔄待执行 |
| Q-032 | TC-0304~0305 | F-03 save-draft+submit+审批触发 | H-063/064 ⏭️ | ⏭️待代码 |
| Q-033 | TC-0306~0308 | F-03 复制+时间窗口+开票公司 | H-062/065/066 ⏭️ | ⏭️待代码 |
| Q-041 | TC-0401~0406 | F-04 审批流API | H-063 ⏭️ | ⏭️待代码 |
| Q-042 | TC-0407 | F-04 审批详情页 | H-068 ⏭️ | ⏭️待代码 |
| Q-091 | TC-0901~0902 | F-09 EmailQueue页面 | H-071 ⏭️ | ⏭️待代码 |
| Q-081 | TC-0801 | F-08 users.brand字段 | H-072 ⏭️ | ⏭️待代码 |
| Q-082 | TC-0802 | F-08 SSO不存在则拒绝 | H-073 ⏭️ | ⏭️待代码 |
| Q-083 | TC-0803 | F-01 Dashboard APPROVED过滤 | H-070 ✅ | 🔄待执行 |

---

## 六、PRD→TESTCASE联动规则

> **重要：每次PRD更新后，必须检查本文档是否需要同步更新。**

| PRD变更内容 | 必须检查的测试用例 |
|------------|-----------------|
| 新增/修改API端点 | 对应S-0x套件所有TC |
| 新增/修改页面交互（§F- (§6)XX） | 对应TC的UI验收标准 |
| 新增字段/实体 | 新增/补充对应TC的数据前提+预期结果 |
| 角色权限变更 | S-05权限隔离所有TC |
| 业务流程变更（如驳回规则） | S-04审批流所有TC |

---

*本文档由 Hermes 小P 维护，按WBS v0.8重建于2026-05-06。*
*版本变更：v1.1 → v2.0（按4轮模块顺序重建，区分✅已完成/🔄待执行/⏭️待代码状态）*
