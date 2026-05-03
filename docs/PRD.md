# Sandvik Forecast Tool — 产品需求文档 (PRD)
**版本：** v0.2
**日期：** 2026-05-03
**状态：** 🟡 编写中

> **重要说明：** 本文档从 `docs/BRS.md` 更名而来（BRS → PRD），任务追踪已迁移至 `docs/WBS.md`。

---

## 1. 项目概述

### 1.1 项目背景
山特维克中国事业部（Sandvik China Division）需要一个销售预测管理系统，用于收集、管理和审批各区域销售团队的预测数据，支持自下而上的预测提交流程，以及自上而下的审批管理。

### 1.2 项目目标
- 实现销售预测的在线填报、审批和汇总
- 支持多层级组织架构（销售 → 直线经理 → 大区负责人 → CEO）
- 按区域/产品线/客户维度进行数据隔离和权限控制
- 为管理层提供可视化的预测分析和决策支持

### 1.3 系统边界
- **上线范围：** 销售预测填报、审批流程、Dashboard 汇总
- **暂不在范围内：** 财务模块、采购模块、CRM 集成

---

## 2. 组织架构

### 2.1 组织层级

```
山特维克中国事业部
├── Frank Tao (CEO / 最终审批人)
│   └── 杨依柱 (大区负责人 / 暂缺系统账号)
│       └── 李长春 (直线经理)
│           └── 韩学健、李清、李思梦、孙迎春、武健、赵强强、郑鸿鹏 (销售)
└── 其他大区...
```

### 2.2 已知账号

| 角色 | 姓名 | 邮箱 | OrgNode | 备注 |
|------|------|------|---------|------|
| CEO | Frank Tao | frank.tao@sandvik.com | Id=1 | 最终审批人 |
| 大区负责人 | 杨依柱 | (待补充) | — | 无系统账号 |
| 直线经理 | 李长春 | changchun.li@ahno-tool.com | — | 待录入系统 |
| 销售 | 韩学健 | xuejian.han@ahno-tool.com | — | 待录入系统 |
| 销售 | 李清 | qing.li@ahno-tool.com | — | 待录入系统 |
| 销售 | 李思梦 | simeng.li@ahno-tool.com | — | 待录入系统 |
| 销售 | 孙迎春 | yingchun.sun@ahno-tool.com | — | 待录入系统 |
| 销售 | 武健 | jian.wu@ahno-tool.com | — | 待录入系统 |
| 销售 | 赵强强 | qiangqiang.zhao@ahno-tool.com | — | 待录入系统 |
| 销售 | 郑鸿鹏 | hongpeng.zheng@ahno-tool.com | — | 待录入系统 |

### 2.3 区域划分（已知）
- 北部销售大区（下属：北京区域等）
- 其他大区（待确认）

---

## 3. 业务流程

### 3.1 销售预测周期
- 预测周期：FC（Forecast Cycle），如 2026FC1、2026FC2
- 每个 FC 的月份数量不固定（3个月/6个月/9个月/跨年），由**预测起始/结束年月**控制
- 填报窗口由**填报起始/截止时间**控制
- 截止后：未提交的新预测不能再提交；已在审批流程中的数据不受影响

### 3.2 预测周期管理（系统管理→预测周期管理）

**7+1个字段：**

| 字段 | 说明 |
|------|------|
| 周期名称 | 如"2026 FC1"、"2026 FC2" |
| 填报起始时间 | 销售可开始提交的时间点 |
| 填报截止时间 | 只阻止新提交，不影响已在审批流程中的数据 |
| 预测起始年月 | 控制填报表头的月份范围起点（如2026-07） |
| 预测结束年月 | 控制填报表头的月份范围终点（如2027-03） |
| 延期起始时间 | 延迟提交的窗口开始（可选） |
| 延期截止时间 | 延迟提交的窗口结束（可选） |
| 延期人员名单 | 可多选，允许哪些销售在延期窗口内补提交 |

### 3.3 预测填报流程

```
销售填报 → 直线经理审核 → 大区负责人审批 → CEO/最终审批人审批
    ↓            ↓                ↓               ↓
 草稿/Submitted   待审批         待审批          已审批/已驳回
```

**说明：**
1. 销售填写预测数据，保存为草稿或直接提交
2. 直线经理可以看到所管辖销售提交的预测，进行审核（approve/reject）
3. 大区负责人审批
4. CEO/最终审批人做最终审批

---

## 4. 功能模块

### 4.1 Dashboard（数据看板）
**功能：** 展示预测汇总数据
**数据维度：**
- 当前周期名称
- 月度预测趋势（折线图）
- 各区域预测（柱状图）
- 产品线汇总
- 客户维度汇总

**权限：**
- CEO/SYS_ADMIN：看全量数据
- 大区负责人：看本大区数据
- 直线经理：看本团队数据
- 销售：只看自己的数据

### 4.2 销售预测填报（Forecast）
**功能：** 销售填报预测数据

**填写维度：**
- 客户（通过品牌字段过滤：Customer.Brand = Salesperson.Brand，详见§11）
- 业绩归属区域（**自动带出**，来自销售OrgNode，不可改）
- 销售大区（**自动带出**，来自销售OrgNode，不可改）
- 开票公司（**手动选择**，无品牌/区域控制，所有销售人员均可选任意开票公司）
- 产品线（PA / Sub PA-1 / Sub PA-2 / Sub PA-3 / Sub PA-4，5级联动）
- 月度数据：订单数量、订单金额、开票数量、开票金额

**金额单位：**
- 金额：圆（元）
- 数量：个/件（单位对系统无实质影响）

**操作：**
- 填报（进入填报表单）
- 保存草稿
- 提交审批
- 复制上期数据
- 导入（Excel/CSV）
- 导出

**权限：** 销售只能填写和查看自己的数据

### 4.3 销售预测审批（Approval）
**功能：** 审批人审批下级提交的预测

**审批链（逐层上升）：** 销售 → 直线经理 → 区域总监 → CEO/Frank Tao

**三个审批动作：**
| 动作 | 说明 |
|------|------|
| **通过** | 继续往上一级提交 |
| **退回** | 直接退回下一级，附comments说明原因 |
| **调整** | 退回的增强版：退回的同时输入4个结构性预期总量值 + comments |

**调整（退回增强版）输入字段：**
| 字段 | 说明 |
|------|------|
| 预期销售总量（Total Order Amount） | 指导值，下级参考调整，不强制 |
| 预期开票总量（Total Invoice Amount） | 指导值 |
| 预期销售数量（Total Order Qty） | 指导值 |
| 预期开票数量（Total Invoice Qty） | 指导值 |
| 调整说明（Comments） | 说明明细维度的调整期望 |

**关键规则：**
- 调整输入的总量值是**指导值**，不是锁定值；下级参考但可自行决定如何调整
- 审批者可反复退回和调整，直到达成一致
- **Frank Tao（最终审批人）只能通过/驳回/调整，不能修改明细数据**
- 其他级别审批者收到退回后可以修改数据后再提交

**邮件通知（第一期）：**
- 每种动作（提交/通过/退回/调整）实时触发邮件通知
- 邮件内容由**消息模板**定义（用户可自定义，占位变量为汇总级别字段）
- 消息模板在**系统管理→审批流程配置**中管理
- 占位变量包括：周期名称、提交人、动作类型、4个总量值（调整时）、comments、时间戳
- 不涉及产品明细级别数据

**驳回逻辑（逐层退回）：**
- 驳回是**逐层往下退**，不是重新发起审批流
- 退到哪一级，**该级别可以修改数据**，改完后继续往上一级提交

**审批历史记录字段：**
- 时间戳、操作人、动作类型（提交/通过/退回/调整）
- 退回原因（comments）
- 调整时的4个总量值（调整动作时有值）
- 调整时的明细调整说明（Comments）

### 4.4 基础数据管理

**功能：** 管理系统主数据

**子模块：**
- 组织架构管理（OrgNode）
- 客户信息（Customer）
- 产品库（Product）
- 数据字典

### 4.5 系统管理

**功能：** 系统配置和用户管理

**子模块：**
- 用户账号管理
- 角色和权限管理
- 预测周期管理
- 审批流程配置
- 登录日志
- 操作日志

---

## 5. 数据权限规则

### 5.1 权限矩阵

| 角色 | 自己数据 | 团队数据 | 本大区数据 | 全量数据 |
|------|---------|---------|-----------|---------|
| 销售（SALES） | ✅ 读写 | ❌ | ❌ | ❌ |
| 直线经理（MANAGER） | ✅ 读写 | ✅ 读写 | ❌ | ❌ |
| 大区负责人（VP_SALES） | ✅ 读写 | ✅ 读写 | ✅ 读写 | ❌ |
| CEO | ✅ 读写 | ✅ 读写 | ✅ 读写 | ✅ 读写 |
| 系统管理员（SYS_ADMIN） | ✅ 读写 | ✅ 读写 | ✅ 读写 | ✅ 读写 |

### 5.2 数据权限规则

**两类权限体系：**

**A. 审批链权限（基于OrgNode层级）**
适用于：销售、直线经理、区域总监、CEO

| 角色 | 可看到的数据范围 |
|------|----------------|
| 销售（SALES） | 仅自己填报的数据 |
| 直线经理（MANAGER） | 自己 + 所管辖所有销售的数据 |
| 区域总监（VP_SALES） | 自己 + 手下所有销售的数据（递归向上） |
| CEO（Frank Tao） | 全量数据 |

**B. 跨部门特别权限（基于开票公司配置）**
适用于：财务等不在审批体系中的部门人员

一张 `用户-开票公司权限表`（user_invoice_company_permissions）：

| 字段 | 说明 |
|------|------|
| id | 主键 |
| user_id | 用户ID |
| invoice_company_id | 开票公司ID（一对多） |

配置后，该用户可看到所分配开票公司下的全部预测数据。

**SYS_ADMIN（管理员）：** 拥有全部数据权限，不受上述两类限制。

**数据过滤逻辑优先级：**
1. 如果用户在"跨部门特别权限表"中有配置 → 按开票公司权限过滤
2. 如果用户是审批链中的角色 → 按OrgNode层级递归过滤
3. SYS_ADMIN → 全量
- **品牌过滤**：`Customer.Brand = Salesperson.Brand` 时，该客户对该销售可见
- **OrgNode 销售人员属性（只读，自动填入）**：所属公司、业绩归属区域、销售大区
- **开票公司**：自由选择，无任何品牌或区域限制

### 5.3 填报时的自动/手动字段

| 字段 | 来源 | 填报时 |
|------|------|--------|
| 客户 | 列表选择 | 手动（受Brand过滤） |
| 业绩归属区域 | OrgNode | **自动填入，只读** |
| 销售大区 | OrgNode | **自动填入，只读** |
| 开票公司 | 列表选择 | **自由选择，无限制** |
| 产品线 | ProductHierarchy | 手动（5级联动） |

---

## 6. 已知实体

### 6.1 核心业务实体

| 实体 | 说明 |
|------|------|
| ForecastRecord | 预测记录（金额、数量、月份） |
| ForecastPeriod | 预测周期（FC名称、填报时间窗口、预测月份范围、延期窗口） |
| ApprovalRequest | 审批请求（含退回/调整历史） |
| ApprovalHistory | 审批历史记录（动作类型、4个总量值、comments） |
| OrgNode | 组织架构节点（含销售业务属性） |
| User | 用户账号（含Brand字段） |
| Customer | 客户信息（含Brand字段） |
| Product | 产品信息 |
| InvoiceCompany | 开票公司 |
| UserInvoiceCompanyPermission | 用户-开票公司特别权限（跨部门配置） |

### 6.2 数据库表（已知）

```sql
-- 预测记录
forecast_records (id, forecast_period_id, customer_id, invoice_company_id,
                  product_id, year, month, order_amount, invoice_amount,
                  order_qty, invoice_qty, status,
                  created_by_user_id, is_deleted, created_at, updated_at)

-- 预测周期（含延期窗口）
forecast_periods (id, fc_name,
                  fill_time_start,       -- 填报起始时间
                  fill_time_end,         -- 填报截止时间（只阻止新提交）
                  period_start_year_month,  -- 预测起始年月（YYYY-MM）
                  period_end_year_month,    -- 预测结束年月（YYYY-MM）
                  extension_start,       -- 延期起始时间（可空）
                  extension_end,         -- 延期截止时间（可空）
                  extension_users,       -- 延期人员名单（JSON数组，可空）
                  status, created_at, updated_at)

-- 审批请求
approval_requests (id, forecast_period_id, user_id, region_id,
                   status, comments,
                   adjust_order_amount,  -- 调整：预期销售总量（可空）
                   adjust_invoice_amount,-- 调整：预期开票总量（可空）
                   adjust_order_qty,     -- 调整：预期销售数量（可空）
                   adjust_invoice_qty,   -- 调整：预期开票数量（可空）
                   created_at, updated_at)

-- 审批历史记录
approval_history (id, approval_request_id, action,    -- SUBMIT/APPROVE/REJECT/ADJUST
                  operator_user_id, operated_at,
                  comments,
                  adjust_order_amount, adjust_invoice_amount,
                  adjust_order_qty, adjust_invoice_qty,
                  created_at)

-- 组织架构（含销售人员业务属性）
org_nodes (id, name, parent_id, role, region, brand,   -- brand: 销售归属的品牌
           company,           -- 所属公司
           sales_region,      -- 业绩归属区域（自动填入填报页面）
           sales_district,    -- 销售大区（自动填入填报页面）
           is_active, created_at, updated_at)

-- 用户（含品牌）
users (id, email, display_name, org_node_id, role, brand,   -- brand: 销售归属的品牌
       password_hash, is_active, created_at, updated_at)

-- 客户（含品牌）
customers (id, name, brand, contact, phone, is_active, created_at, updated_at)

-- 用户-开票公司特别权限（跨部门配置表）
user_invoice_company_permissions (id, user_id, invoice_company_id, created_at)
```

---

## 7. API 端点（已知）

> **与实现对账：** 当前仓库中实际路由与下表存在差异（例如基础数据多为 `api/basedata`、`api/org`，审批流仅部分实现）。详见 **§13**「实现与 PRD 差距清单」；迭代中建议以 OpenAPI/代码为准更新下表或增加「实际路由附录」。

### 7.1 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/logout | 登出 |

### 7.2 Dashboard
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dashboard/summary | 获取看板汇总数据 |

### 7.3 预测
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/forecast/periods | 获取预测周期列表 |
| GET | /api/forecast/records | 获取预测记录列表 |
| POST | /api/forecast/save-draft | 保存草稿 |
| POST | /api/forecast/submit | 提交审批 |
| POST | /api/forecast/import | 导入数据 |
| GET | /api/forecast/export | 导出数据 |

### 7.4 审批流程
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/approval-flow/start | 启动审批流程 |
| GET | /api/approval-flow/my | 获取我的待审批列表 |
| PUT | /api/approval-flow/approve | 审批通过 |
| PUT | /api/approval-flow/reject | 审批驳回（附comments） |
| PUT | /api/approval-flow/adjust | 审批调整（退回+4个总量值+comments） |
| GET | /api/approval-flow/history/{requestId} | 获取审批历史记录 |

### 7.5 基础数据
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/customers | 客户列表 |
| GET | /api/products | 产品列表 |
| GET | /api/org-nodes | 组织架构 |
| GET | /api/invoice-companies | 开票公司 |

---

## 8. 技术架构

### 8.1 技术栈
- **前端：** Vue 3 + Ant Design Vue + Vite
- **后端：** .NET API
- **数据库：** MySQL
- **部署：** Azure Container App

### 8.2 系统 URL
- 前端：http://localhost:3002
- 后端：http://localhost:5000

---

## 9. 用户与权限管理

### 9.1 登录方式
- **M365 SSO**：用户通过 Microsoft 365 企业账号登录（OAuth 2.0 / OpenID Connect）
- 邮箱地址作为用户唯一身份标识，同时关联角色和区域
- **无独立密码**：系统不管理密码，全部依赖 M365 认证

### 9.2 用户账号维护
- **管理员手工维护**：由 SYS_ADMIN 在系统中创建和维护用户账号
- 用户字段：姓名、邮箱、状态（启用/停用）、角色
- **人员变动**：员工离职时，管理员在系统中停用其账号；M365 账号回收后，SSO 登录失败，用户无法再访问系统

### 9.3 角色清单
| 角色 | 说明 |
|------|------|
| SYS_ADMIN | 系统管理员，全部权限 |
| CEO | 最终审批人，可看全量数据 |
| VP_SALES | 大区负责人，可看本大区数据 |
| MANAGER | 直线经理，可看本团队数据 |
| SALES | 销售，只能操作自己的数据 |
| VP_SALES（阿诺北京） | 杨依柱 |

### 9.4 审批链（阿诺北京）
```
销售（韩学健/李清/李思梦/孙迎春/武健/赵强强/郑鸿鹏）
  → 直线经理（李长春，MANAGER）
    → 大区负责人（杨依柱，VP_SALES）
      → CEO（Frank Tao，最终审批人）
```

---

## 10. 产品管理

### 10.1 产品层级（5级）
| 层级 | 名称 | 说明 |
|------|------|------|
| L1 | PA（产品线） | 8大产品线，如 AH INSERT、Kelite、ROUND 等 |
| L2 | Sub PA-1（子产品线） | L1 的子类 |
| L3 | Sub PA-2（产品分类） | 如"车Turning"、"钻Drill" |
| L4 | Sub PA-3（产品名称） | 具体产品名称，如"负角刀片Negative turning" |
| L5 | Sub PA-4（规格型号） | 无独立代码；系统自动生成3位流水号 |

### 10.2 产品编号规则
- **格式**：PA(1) + Sub PA-1(2) + Sub PA-2(3) + Sub PA-3(5) + Sub PA-4(3) = **14位数字字符串**
- 示例：`11110110101` → PA=1, Sub PA-1=11, Sub PA-2=101, Sub PA-3=10101, Sub PA-4=001
- Sub PA-4 由系统在同一 Sub PA-3 下自动分配3位流水号

### 10.3 产品级联规则
| 级联对 | 是否联动 | 说明 |
|--------|---------|------|
| PA ↔ Sub PA-1 | ✅ 联动 | 选择 PA 后，Sub PA-1 筛选显示该 PA 下的子类 |
| PA ↔ Sub PA-2 | ✅ 联动 | 选择 PA 后，Sub PA-2 直接过滤显示该 PA 下的分类 |
| Sub PA-1 ↔ Sub PA-2 | ❌ 断开 | Sub PA-1 变化时 Sub PA-2 不变 |
| Sub PA-2 ↔ Sub PA-3 | ✅ 联动 | 选择 Sub PA-2 后，Sub PA-3 筛选显示该分类下的产品 |
| Sub PA-3 ↔ Sub PA-4 | ✅ 联动 | 选择 Sub PA-3 后，Sub PA-4 筛选显示对应规格型号 |

**联动行为：**
- 选 PA → Sub PA-1变 + Sub PA-2变（清空Sub PA-3/4）
- 选 Sub PA-1 → Sub PA-2不变（不清空）
- 选 Sub PA-2 → Sub PA-3变（清空Sub PA-4）
- 选 Sub PA-3 → Sub PA-4变
- Sub PA-4 为末级，选后cascade结束

### 10.4 8大产品线
| 编号 | 名称 |
|------|------|
| 1 | AH INSERT |
| 2 | Kelite |
| 3 | ROUND |
| 4 | Regrinding |
| 5 | PCD |
| 6 | Coating |
| 7 | Medical |
| 8 | Multiple |

### 10.5 产品录入方式
- **Admin 统一维护**：由 SYS_ADMIN 负责产品数据的录入和更新
- 录入方式：Excel 批量导入（`docs/scripts/import_product_hierarchy.py`）
- 销售从产品列表中选择，不可自行添加

### 10.6 产品数据库结构
```sql
ProductHierarchy (
  Id               -- GUID（层级特定格式，如 p00001-0000-0000-0000-000000000001）
  ParentId         -- 父级 GUID（L1 无父级）
  ProductLevel     -- 层级（1/2/3/4）
  ProductCode      -- 11位产品编号
  ProductName      -- 产品名称（中文+英文）
  SortOrder        -- 排序
  IsActive         -- 是否启用
  CreatedAt        -- 创建时间
  UpdatedAt        -- 更新时间
  IsDeleted        -- 软删除
)
```

---

## 11. 客户管理

### 11.1 录入方式
- **Admin 统一维护**：由 SYS_ADMIN 负责客户数据的录入和更新
- 销售从客户列表中选择，不可自行添加

### 11.2 品牌字段与数据过滤
- **Customer（客户）** 有一个 `品牌（Brand）` 字段
- **Salesperson（销售）** 也有一个 `品牌（Brand）` 字段
- 销售只能看到/填报其**品牌与自己一致**的客户
- 即：`Customer.Brand = Salesperson.Brand` 时，该客户对该销售可见

### 11.3 客户字段（待确认完整清单）
- 客户名称
- 联系人
- 联系方式
- 品牌（Brand）
- 其他字段待补全

---

## 12. 待确认问题

- [x] ~~预测金额的单位是什么？（元？万元？）~~ → **圆（元)，数量单位对系统无实质影响**
- [x] ~~每个销售可以填多个客户的预测~~ → **可以，通过品牌字段过滤（Customer.Brand = Salesperson.Brand）**
- [x] ~~驳回后销售如何重新提交？~~ → **逐层退，不重新发起；退到哪级该级可改，Frank Tao只能批/驳**
- [x] ~~截标/填报截止设定~~ → **只阻止新提交，不影响已在流程中的数据；延期窗口给漏填人员补提交**
- [x] ~~变更记录（Audit Log）~~ → **暂不做；审批历史只记录动作和调整值，记录最近修改人和时间**
- [x] ~~业绩归属（事业部）和开票公司是两个独立维度还是关联的？~~ → **业绩归属区域和销售大区来自OrgNode（自动带出）；开票公司自由选择，无控制；品牌控制客户过滤**
- [x] ~~Dashboard 数据边界~~ → **全系统统一规则：销售看自己，直线经理看团队，CEO看全量；适用于Dashboard+历史+报表所有视图**
- [x] ~~审批通过后是否有通知？（邮件/系统通知？）~~ → **第一期只做邮件通知；消息模板用户可自定义（系统管理→审批流程配置中管理）；占位变量包括：周期名/提交人/动作/4个总量值/comments/时间戳；实时触发**

---

## 13. 实现与 PRD 差距清单（对照代码库 v0.1）

> 以下条目按 **P0/P1/P2** 粗略分级：P0 阻断业务流程或合规；P1 核心功能不完整；P2 体验/扩展。状态为截止文档更新日期的静态审计结论，实施需在迭代中复核。

### 13.1 数据模型与持久化

| 编号 | PRD 依据 | 当前实现概况 | 差距说明 | 建议 |
|------|-----------|---------------|-----------|------|
| M-01 | §6.2 `forecast_records` 四度量字段 | `ForecastRecord` 仅 `Amount`，无订单/开票拆分及数量 | 无法实现「订单数量、订单金额、开票数量、开票金额」月度填报与汇总 | 扩展实体与迁移，API/DTO 同步 |
| M-02 | §6.2 `forecast_periods`（FC 名、填报窗、预测起止年月、延期与人员名单） | `ForecastPeriod` 为 PeriodYear/Month、PeriodType、StartDate/EndDate 等，字段语义不一致 | 无法用 PRD「7+1」字段驱动填报截止/延期白名单 | 按 PRD 表结构演进或补映射层 |
| M-03 | §6.2 `approval_history`、调整四总量 | 无 `ApprovalHistory`；`ApprovalRequest` 无 adjust_* | 无法审计「通过/退回/调整」及指导值 | 新增表与写入链路 |
| M-04 | §5.2 `user_invoice_company_permissions` | 无对应实体/表 | 财务跨部门按开票公司看数无法实现 | 建表 + 过滤逻辑接 Forecast/Dashboard |
| M-05 | §11.2 `Customer.Brand` / `User.Brand` | `Customer`、`User` 均无 Brand 字段 | 无法实现品牌过滤客户 | 扩展字段 + 列表/填报筛选 |
| M-06 | §10 `ProductHierarchy`（L1–L5，14 位编码） | 后端 `ProductsController`/实体需单独核对；前端 Forecast 多为演示级 PA/SubPA | 五级联动与编码规则可能未落地 | 对齐 §10.2–10.3 规则与导入脚本 |
| M-07 | §6.2 `org_nodes`（brand、sales_region、sales_district 等） | `OrgNode` 现有 Name/Email/Role/Region/Company 等，与 PRD 字段名与语义未一一对应 | 业绩归属/大区**自动带出**规则依赖数据模型清晰映射 | 对照 §5.3 补字段或文档化映射 |

### 13.2 业务规则与权限

| 编号 | PRD 依据 | 当前实现概况 | 差距说明 |
|------|-----------|---------------|-----------|
| R-01 | §5.1 MANAGER 可看团队 | `ForecastController` 中 `MANAGER` 与 `SALES` 同为仅本人记录 | 直线经理权限不符 |
| R-02 | §5.2 区域总监递归下属 | 存在 `DIRECTOR`/`REGION_DIRECTOR` 等与 PRD 角色命名不一致 | 需统一角色枚举并与 OrgNode 树遍历对齐 |
| R-03 | §3.3 截止后仅阻止新提交 | `SubmitForecast` 等需核对是否校验 `fill_time_end`/状态 | 防呆逻辑待补全 |
| R-04 | §4.3 Frank Tao 仅审批不得改明细 | 前端/接口层需显式约束 | 待产品与后端双重校验 |

### 13.3 API 与前端集成

| 编号 | PRD 依据 | 当前实现概况 | 差距说明 |
|------|-----------|---------------|-----------|
| A-01 | §7.2 `GET /api/dashboard/summary` | 已实现 `DashboardController/summary` | 前端需确保走真实 API 而非 Mock |
| A-02 | §7.3 `POST .../save-draft`、`submit`、`import`、`export` | 后端 `ForecastController` 已有近似路径；前端 `forecast.js` 大量路径仍为 `/forecast/{id}`、失败回落 Mock | **路径不一致 + Mock 回退**导致联调形同虚设 |
| A-03 | §7.4 `approve`/`reject`/`adjust`、`history` | `ApprovalFlowController` 仅 `start`、`my` | 缺审批动作与历史 API |
| A-04 | §7.5 `GET /api/customers` 等 | 实际多为 `api/basedata`、`api/org` 等 | **PRD §7 路径与实现不一致**，需在 PRD 更正或增加「实际路由附录」 |
| A-05 | §4.3 邮件与模板 | 需核对 `EmailController` 是否在审批节点触发；`ApprovalFlow.vue` 偏流程配置 UI | 模板占位变量与实时触发待闭环 |

### 13.4 功能覆盖（界面/流程）

| 编号 | PRD 依据 | 说明 |
|------|-----------|------|
| F-01 | §4.1 Dashboard 客户维度汇总 | 需在 Dashboard 数据中确认「客户维度」与权限裁剪同时存在 |
| F-02 | §4.2 复制上期、导入/导出 | 前端有部分导入导出演示；与后端多字段、周期规则对齐未完成 |
| F-03 | §4.3「调整」四总量 + comments | 原型/prototype 有对话框；**主 Vue 应用 + API** 需对齐 PRD |
| F-04 | §4.3 邮件模板在审批流程配置 | 审批流程配置页需增加「消息模板」管理能力（或与独立模块合并） |
| F-05 | §9 M365 SSO、无本地密码 | Login 仍有开发测试本地登录；生产需仅 SSO 并下线密码存储（若存在） |

### 13.5 文档本身勘误

| 项 | 说明 |
|------|------|
| 章节编号 | 「产品管理」原为 §10，「Issue Log」与 §10. 产品管理冲突，**Issue Log 已顺延为 §14**。 |
| §6.1 表格 | 已修正 Markdown 表头多余竖线（`||` → `|`）。 |
| §10.6 与 §10.1 | `ProductLevel` 写法为 1–4，与正文 L1–L5 五项层级需统一叙述（L5/Sub PA-4 是否单独存储级别）。 |

### 13.6 建议迭代顺序（供规划参考）

1. **统一 Forecast/Approval API 契约**（路径、字段名、去 Mock）并与 PRD §7 互链。
2. **扩展 `ForecastRecord` + 周期实体**，满足填报与截止规则。
3. **补全审批流 API + ApprovalHistory + 调整动作**。
4. **权限矩阵**：MANAGER/VP_SALES/开票公司特别权限。
5. **Brand 与客户过滤**、产品五级与导入脚本。
6. **Dashboard** 多维度与权限一致。

---

## 14. 已发现 Bug（Issue Log）

> 注：原「## 10. Issue Log」为避免与「## 10. 产品管理」章节号冲突，已顺延为 **§14**。

| # | 问题 | 优先级 | 状态 |
|---|------|--------|------|
| #1-#13 | Dashboard 页面空白（Mock 数据） | P2 | 待修复 |
| #4 | Forecast 填报按钮无反应 | P1 | ✅ 已修复 |
| #6 | Forecast 填报按钮无功能 | P1 | ✅ 已修复 |
| #14 | 路由空白页 | P0 | ✅ 已修复 |
| #15 | 登录无反应 | P1 | ✅ 已修复 |
| #16 | Approval 页面崩溃 | P1 | ✅ 已修复 |
| #17 | Forecast 周期列表使用 Mock 数据 | P2 | 待修复 |
| #18 | 字段名不匹配（orderAmount vs Amount） | P1 | 待确认 |

---

*文档持续更新中，待 Mark 补充更多业务细节。*
