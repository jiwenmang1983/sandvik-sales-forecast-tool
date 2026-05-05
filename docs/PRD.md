# Sandvik Forecast Tool — 产品需求文档 (PRD)

**版本：** v0.4
**日期：** 2026-05-05
**状态：** 🟡 编写中

> **重要说明：** 本文档从 `docs/BRS.md` 更名而来，任务追踪已迁移至 `docs/WBS.md`。
> **文档结构调整（v0.4）：** 上半部分（§1~~§7）为业务功能，面向客户和业务团队；下半部分（§8~~§13）为技术实现，面向开发人员。

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

- **上线范围：** 销售预测填报、审批流程、Dashboard 汇总、基础数据为何和系统管理
- **暂不在范围内：** ERP系统对接，HR系统对接

---

## 2. 组织架构

### 2.1 组织层级

```
山特维克中国事业部
├── Frank Tao (CEO / 最终审批人)
│   └── 杨依柱 (大区负责人)
│       └── 李长春 (直线经理)
│           └── 韩学健、李清、李思梦、孙迎春、武健、赵强强、郑鸿鹏 (销售)
└── 其他大区...


### 2.3 区域划分（已知）

- 北部销售大区（下属：北京区域等）
- 其他大区（待确认）

---

## 3. 业务流程





# 销售预测业务流程 — Forecast Flow Diagram

Sandvik Forecast Tool · PRD §3 业务流程 · v0.4

```
  <!-- ===== LEGEND ===== -->
  <text x="860" y="28" fill="white" font-size="10" font-weight="700">图例</text>
  <rect x="860" y="38" width="14" height="9" rx="2" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.2"/>
  <text x="880" y="46" fill="#94a3b8" font-size="8">操作节点</text>
  <rect x="860" y="54" width="14" height="9" rx="2" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.2"/>
  <text x="880" y="62" fill="#94a3b8" font-size="8">审批节点</text>
  <rect x="860" y="70" width="14" height="9" rx="2" fill="rgba(120,53,15,0.5)" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="880" y="78" fill="#94a3b8" font-size="8">延期窗口</text>
  <rect x="860" y="86" width="14" height="9" rx="2" fill="rgba(76,29,149,0.6)" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="880" y="94" fill="#94a3b8" font-size="8">终态</text>
  <rect x="860" y="102" width="14" height="9" rx="2" fill="rgba(136,19,55,0.5)" stroke="#fb7185" stroke-width="1.2"/>
  <text x="880" y="110" fill="#94a3b8" font-size="8">驳回路径</text>
  <line x1="860" y1="122" x2="876" y2="122" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="880" y="125" fill="#94a3b8" font-size="8">正常流转</text>
  <line x1="860" y1="138" x2="876" y2="138" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-rose)"/>
  <text x="880" y="141" fill="#94a3b8" font-size="8">驳回/退回</text>

  <!-- ===== 填报窗口约束（顶部金条） ===== -->
  <rect x="40" y="30" width="1020" height="32" rx="6" fill="rgba(120,53,15,0.35)" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="6,3"/>
  <text x="60" y="50" fill="#fbbf24" font-size="10" font-weight="600">📅 填报窗口（FillTimeStart ~ FillTimeEnd）</text>
  <text x="360" y="50" fill="#94a3b8" font-size="9">所有销售可提交草稿 / 提交新预测</text>
  <text x="580" y="50" fill="#94a3b8" font-size="9">FillTimeEnd 截止 → 新提交锁定</text>
  <text x="780" y="50" fill="#fbbf24" font-size="9">延期窗口（ExtensionStart~End）→ 仅白名单用户可补提交</text>

  <!-- ===== 销售节点 ===== -->
  <rect x="60" y="110" width="130" height="50" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="125" y="130" fill="white" font-size="11" font-weight="600" text-anchor="middle">👤 销售</text>
  <text x="125" y="146" fill="#94a3b8" font-size="9" text-anchor="middle">han@ahno-tool.com</text>

  <!-- Arrow: 销售 → 草稿 -->
  <line x1="190" y1="135" x2="235" y2="135" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="212" y="128" fill="#94a3b8" font-size="8" text-anchor="middle">保存草稿</text>

  <!-- 草稿节点 -->
  <rect x="238" y="110" width="110" height="50" rx="6" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="293" y="130" fill="white" font-size="11" font-weight="600" text-anchor="middle">📝 草稿</text>
  <text x="293" y="146" fill="#94a3b8" font-size="9" text-anchor="middle">DRAFT · 可编辑</text>

  <!-- Arrow: 草稿 → 提交 -->
  <line x1="348" y1="135" x2="393" y2="135" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="370" y="128" fill="#22d3ee" font-size="8" text-anchor="middle">提交审批</text>

  <!-- ===== 直线经理节点 ===== -->
  <rect x="396" y="80" width="140" height="58" rx="6" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="466" y="100" fill="white" font-size="11" font-weight="600" text-anchor="middle">👔 直线经理</text>
  <text x="466" y="116" fill="#94a3b8" font-size="9" text-anchor="middle">李长春 · li@ahno</text>
  <text x="466" y="130" fill="#34d399" font-size="8" text-anchor="middle">approve / reject / adjust</text>

  <!-- ===== 区域总监节点 ===== -->
  <rect x="396" y="175" width="140" height="58" rx="6" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="466" y="195" fill="white" font-size="11" font-weight="600" text-anchor="middle">📊 区域总监</text>
  <text x="466" y="211" fill="#94a3b8" font-size="9" text-anchor="middle">杨依柱（暂缺账号）</text>
  <text x="466" y="225" fill="#34d399" font-size="8" text-anchor="middle">approve / reject / adjust</text>

  <!-- Arrow: 直线经理 → 区域总监 -->
  <line x1="536" y1="135" x2="578" y2="135" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-green)"/>
  <text x="557" y="128" fill="#34d399" font-size="8" text-anchor="middle">通过</text>
  <!-- Arrow: 区域总监 → CEO -->
  <line x1="536" y1="204" x2="578" y2="204" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-green)"/>
  <text x="557" y="197" fill="#34d399" font-size="8" text-anchor="middle">通过</text>

  <!-- ===== CEO / 最终审批人 ===== -->
  <rect x="581" y="115" width="140" height="72" rx="6" fill="rgba(136,19,55,0.6)" stroke="#fb7185" stroke-width="1.5"/>
  <text x="651" y="137" fill="white" font-size="11" font-weight="600" text-anchor="middle">🏢 CEO 最终审批</text>
  <text x="651" y="154" fill="#94a3b8" font-size="9" text-anchor="middle">Frank Tao · frank.tao@sandvik</text>
  <text x="651" y="170" fill="#fb7185" font-size="8" text-anchor="middle">仅 approve/reject/adjust</text>
  <text x="651" y="182" fill="#fb7185" font-size="8" text-anchor="middle">不可修改明细</text>

  <!-- Arrow: CEO → 已完成 -->
  <line x1="721" y1="151" x2="768" y2="151" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="744" y="144" fill="#a78b8a" font-size="8" text-anchor="middle">完成</text>

  <!-- ===== 已完成终态 ===== -->
  <rect x="771" y="115" width="130" height="72" rx="8" fill="rgba(76,29,149,0.6)" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="836" y="137" fill="white" font-size="11" font-weight="600" text-anchor="middle">✅ 审批完成</text>
  <text x="836" y="154" fill="#94a3b8" font-size="9" text-anchor="middle">FORECAST_APPROVED</text>
  <text x="836" y="168" fill="#a78bfa" font-size="8" text-anchor="middle">邮件通知已触发</text>
  <text x="836" y="180" fill="#a78bfa" font-size="8" text-anchor="middle">写入EmailQueue</text>

  <!-- ===== 驳回路径 ===== -->
  <!-- 直线经理驳回 → 销售 -->
  <path d="M 466 138 L 466 250 Q 466 270 125 270 Q 105 270 105 155 Q 105 145 125 145" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrow-rose)"/>
  <text x="310" y="265" fill="#fb7185" font-size="8" text-anchor="middle">驳回（退回至销售，可编辑重新提交）</text>

  <!-- 区域总监驳回 → 直线经理 -->
  <path d="M 466 207 L 466 260 Q 466 280 466 280 L 300 280 Q 250 280 250 165 Q 250 150 280 150" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="280" y1="150" x2="250" y2="150" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrow-rose)"/>
  <text x="350" y="278" fill="#fb7185" font-size="8" text-anchor="middle">驳回退回</text>

  <!-- CEO驳回 → 直线经理 -->
  <path d="M 651 187 L 651 300 Q 651 320 466 320 Q 400 320 400 138" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="400" y1="138" x2="466" y2="138" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrow-rose)"/>
  <text x="530" y="318" fill="#fb7185" font-size="8" text-anchor="middle">驳回退回</text>

  <!-- ===== 调整动作 ===== -->
  <rect x="396" y="300" width="160" height="44" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,3"/>
  <text x="476" y="316" fill="#fbbf24" font-size="9" font-weight="600" text-anchor="middle">⚡ 调整动作（Adjust）</text>
  <text x="476" y="332" fill="#94a3b8" font-size="8" text-anchor="middle">退回 + 填写4个总量值 + 备注</text>

  <!-- Arrow: 调整 → 直线经理（再次审批） -->
  <line x1="396" y1="322" x2="396" y2="138" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="396" y1="138" x2="396" y2="115" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow-amber)"/>
  <text x="340" y="230" fill="#fbbf24" font-size="8" text-anchor="middle">调整后退回</text>

  <!-- ===== 延期窗口说明 ===== -->
  <rect x="40" y="390" width="1020" height="70" rx="8" fill="rgba(120,53,15,0.2)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="60" y="412" fill="#fbbf24" font-size="10" font-weight="600">🕐 延期窗口 — 白名单机制（Extension Window）</text>
  <text x="60" y="430" fill="#94a3b8" font-size="9">FillTimeEnd 截止后，普通销售无法提交新预测。但 Admin 可在「预测周期管理」中设置 Extension 人员白名单。</text>
  <text x="60" y="448" fill="#94a3b8" font-size="9">白名单用户在 ExtensionEnd 之前仍可提交新预测；白名单外用户则完全锁定，无法提交也无法看到提交按钮。</text>

  <!-- ===== 邮件通知触发点 ===== -->
  <rect x="40" y="480" width="1020" height="100" rx="8" fill="rgba(6,78,59,0.15)" stroke="#34d399" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="60" y="502" fill="#34d399" font-size="10" font-weight="600">📧 邮件通知触发点（EmailQueue 异步队列）</text>
  <!-- Trigger points -->
  <rect x="80" y="515" width="130" height="50" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="145" y="535" fill="white" font-size="9" text-anchor="middle">销售提交</text>
  <text x="145" y="550" fill="#94a3b8" font-size="8" text-anchor="middle">SUBMIT</text>

  <line x1="210" y1="540" x2="240" y2="540" stroke="#34d399" stroke-width="1.2" marker-end="url(#arrow-green)"/>

  <rect x="243" y="515" width="130" height="50" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="308" y="535" fill="white" font-size="9" text-anchor="middle">直线经理审批</text>
  <text x="308" y="550" fill="#94a3b8" font-size="8" text-anchor="middle">APPROVE / REJECT</text>

  <line x1="373" y1="540" x2="403" y2="540" stroke="#34d399" stroke-width="1.2" marker-end="url(#arrow-green)"/>

  <rect x="406" y="515" width="130" height="50" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="471" y="535" fill="white" font-size="9" text-anchor="middle">区域总监审批</text>
  <text x="471" y="550" fill="#94a3b8" font-size="8" text-anchor="middle">APPROVE / REJECT</text>

  <line x1="536" y1="540" x2="566" y2="540" stroke="#34d399" stroke-width="1.2" marker-end="url(#arrow-green)"/>

  <rect x="569" y="515" width="130" height="50" rx="5" fill="rgba(136,19,55,0.4)" stroke="#fb7185" stroke-width="1.2"/>
  <text x="634" y="535" fill="white" font-size="9" text-anchor="middle">CEO 最终审批</text>
  <text x="634" y="550" fill="#94a3b8" font-size="8" text-anchor="middle">APPROVE → 完成</text>

  <line x1="699" y1="540" x2="729" y2="540" stroke="#a78bfa" stroke-width="1.2" marker-end="url(#arrow)"/>

  <rect x="732" y="515" width="160" height="50" rx="5" fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="812" y="535" fill="white" font-size="9" text-anchor="middle">EmailQueue 队列表</text>
  <text x="812" y="550" fill="#94a3b8" font-size="8" text-anchor="middle">异步写入 · 定时服务推送</text>

  <line x1="892" y1="540" x2="922" y2="540" stroke="#a78bfa" stroke-width="1.2" marker-end="url(#arrow)"/>

  <rect x="925" y="515" width="130" height="50" rx="5" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="990" y="535" fill="white" font-size="9" text-anchor="middle">邮件发送</text>
  <text x="990" y="550" fill="#94a3b8" font-size="8" text-anchor="middle">SMTP / SendGrid</text>

  <!-- ===== 自动推进说明 ===== -->
  <rect x="40" y="610" width="1020" height="50" rx="6" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="60" y="632" fill="#fbbf24" font-size="9" font-weight="600">⚡ 自动推进规则</text>
  <text x="60" y="650" fill="#94a3b8" font-size="8.5">直线经理审批通过 → 自动推至区域总监 → 继续向上流转。若某级审批人在OrgNode中不存在（人员离职），自动跳过该级继续推进。</text>

</svg>
```

Sandvik Forecast Tool · PRD §3 业务流程 · 预测流图 · v0.4



### 3.1 销售预测周期

- 预测周期：FC（Forecast Cycle），如 2026FC1、2026FC2
- 每个 FC 的月份数量不固定（3个月/6个月/9个月/跨年），由**预测起始/结束年月**控制
- 填报窗口由**填报起始/截止时间**控制
- 截止后：未提交的新预测不能再提交；已在审批流程中的数据不受影响
- **当前周期确定规则：** 同一时间点只有一个周期在有效填报期内（FillTimeStart ≤ now ≤ FillTimeEnd 或 Extension窗口）。公司层面强制周期时间不重叠，系统按当前时间自动取落在窗口内的周期，**无需IsActive字段**。
- **时间校验：** 统一使用**服务器时间**（UTC），前端展示时显示服务器时间并标注时区。
- **填报数据不做自动保存**，依赖模板上传/下载。

### 3.2 预测周期管理（系统管理→预测周期管理）

**7+1个字段：**

|| 字段 | 说明 |
|------|------|
| 周期名称 | 如"2026 FC1"、"2026 FC2" |
| 填报起始时间 | 销售可开始提交的时间点（**服务器时间**，统一用 `DateTime.UtcNow`，不用浏览器本地时间） |
| 填报截止时间（FillTimeEnd） | 只阻止新提交，不影响已在审批流程中的数据。**FillTimeEnd 过期后锁定，不可修改。** |
| 预测起始年月 | 控制填报表头的月份范围起点（如2026-07） |
| 预测结束年月 | 控制填报表头的月份范围终点（如2027-03） |
| 延期起始时间（ExtensionStart） | 延迟提交的窗口开始。**可等于FillTimeEnd之后的任意时间点**，由公司根据反馈时间灵活设定。 |
| 延期截止时间（ExtensionEnd） | 延迟提交的窗口结束。**Extension窗口可独立设定，= ExtensionStart + N天。** |
| 延期人员名单 | 可多选，**按名称搜索筛选**勾选，允许哪些销售在延期窗口内补提交 |

**当前周期确定规则（Q1）：** 按时间窗口自动锁定。FillTimeStart/FillTimeEnd 时间窗口不重叠，同一时间只有唯一周期有效。系统按当前服务器时间自动取落在窗口内的周期，无需 IsActive 字段。

**周期修改规则：**

- Admin 可修改任意字段（名称、时间、延期窗口等）
- **底线：已有填报数据的周期禁止删除**（字段可改，删除是禁区）
- FillTimeEnd 过期后锁定；Extension 窗口可随时调整（即使已过期也可继续延）

### 3.3 预测填报流程

**审批状态机（Q32，可配置）：**
空白 → 草稿（已保存）→ 提交至直线经理审批 → 提交至区域总监审批 → 提交至总经理审批 → 审批已完成。草稿提交后原记录状态直接变更，**不新建记录**。

1. 直线经理可以看到所管辖销售提交的预测，进行审核（approve/reject）
2. 大区负责人审批
3. CEO/最终审批人做最终审批

---

## 4. 功能模块

> 本章节以**功能菜单树**为主线，描述每个功能模块的职责、入口页面和关联子页面。
> 详细交互规格（每个页面的按钮、列、状态、空态、分页）见 **§6 功能细化规格**对应章节。





# 功能架构图 — Functional Architecture

Sandvik Forecast Tool · PRD §4 功能模块 · v0.4 · 位于功能模块总览之前

```
  <!-- ===== 角色纵列 ===== -->
  <!-- 销售 -->
  <rect x="40" y="60" width="80" height="44" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="80" y="79" fill="white" font-size="10" font-weight="600" text-anchor="middle">👤 销售</text>
  <text x="80" y="94" fill="#94a3b8" font-size="8" text-anchor="middle">韩/李/孙/武</text>
  <!-- 直线经理 -->
  <rect x="40" y="175" width="80" height="44" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="80" y="194" fill="white" font-size="10" font-weight="600" text-anchor="middle">👔 直线经理</text>
  <text x="80" y="209" fill="#94a3b8" font-size="8" text-anchor="middle">李长春</text>
  <!-- 区域总监 -->
  <rect x="40" y="290" width="80" height="44" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="80" y="309" fill="white" font-size="10" font-weight="600" text-anchor="middle">📊 区域总监</text>
  <text x="80" y="324" fill="#94a3b8" font-size="8" text-anchor="middle">杨依柱(暂缺)</text>
  <!-- CEO -->
  <rect x="40" y="405" width="80" height="44" rx="6" fill="rgba(136,19,55,0.6)" stroke="#fb7185" stroke-width="1.5"/>
  <text x="80" y="424" fill="white" font-size="10" font-weight="600" text-anchor="middle">🏢 CEO</text>
  <text x="80" y="439" fill="#94a3b8" font-size="8" text-anchor="middle">Frank Tao</text>
  <!-- Admin -->
  <rect x="40" y="520" width="80" height="44" rx="6" fill="rgba(251,191,36,0.3)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="80" y="539" fill="white" font-size="10" font-weight="600" text-anchor="middle">⚙️ 系统管理</text>
  <text x="80" y="554" fill="#94a3b8" font-size="8" text-anchor="middle">SYS_ADMIN</text>

  <!-- ===== 功能模块区域 ===== -->
  <!-- 区域边框: 预测管理 -->
  <rect x="160" y="40" width="440" height="220" rx="10" fill="rgba(6,78,59,0.08)" stroke="#34d399" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="172" y="58" fill="#34d399" font-size="9" font-weight="600">§4.2 预测管理</text>

  <!-- Dashboard -->
  <rect x="172" y="70" width="120" height="50" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="232" y="90" fill="white" font-size="10" font-weight="600" text-anchor="middle">📊 Dashboard</text>
  <text x="232" y="106" fill="#94a3b8" font-size="8" text-anchor="middle">F-01 · §4.1</text>
  <text x="232" y="116" fill="#22d3ee" font-size="7" text-anchor="middle">汇总卡片+图表</text>

  <!-- 预测周期管理 -->
  <rect x="305" y="70" width="130" height="50" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="370" y="90" fill="white" font-size="10" font-weight="600" text-anchor="middle">📅 周期管理</text>
  <text x="370" y="106" fill="#94a3b8" font-size="8" text-anchor="middle">F-02 · §4.2.1</text>
  <text x="370" y="116" fill="#22d3ee" font-size="7" text-anchor="middle">Admin创建周期</text>

  <!-- 预测填报 -->
  <rect x="448" y="70" width="140" height="50" rx="6" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="518" y="90" fill="white" font-size="10" font-weight="600" text-anchor="middle">📝 预测填报</text>
  <text x="518" y="106" fill="#94a3b8" font-size="8" text-anchor="middle">F-03 · §4.2.2</text>
  <text x="518" y="116" fill="#34d399" font-size="7" text-anchor="middle">列表+表单+复制</text>

  <!-- 预测审批 -->
  <rect x="305" y="135" width="130" height="50" rx="6" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="370" y="155" fill="white" font-size="10" font-weight="600" text-anchor="middle">✅ 预测审批</text>
  <text x="370" y="171" fill="#94a3b8" font-size="8" text-anchor="middle">F-04 · §4.2.3</text>
  <text x="370" y="181" fill="#34d399" font-size="7" text-anchor="middle">approve/reject/adjust</text>

  <!-- 延期窗口说明 -->
  <rect x="172" y="135" width="120" height="50" rx="6" fill="rgba(120,53,15,0.35)" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="232" y="155" fill="#fbbf24" font-size="9" font-weight="600" text-anchor="middle">⏰ 延期窗口</text>
  <text x="232" y="170" fill="#94a3b8" font-size="7.5" text-anchor="middle">FillTimeEnd后</text>
  <text x="232" y="181" fill="#fbbf24" font-size="7.5" text-anchor="middle">仅白名单可提交</text>

  <!-- 数据权限标注 -->
  <rect x="448" y="135" width="140" height="50" rx="6" fill="rgba(76,29,149,0.35)" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="518" y="155" fill="#a78bfa" font-size="9" font-weight="600" text-anchor="middle">🔒 数据权限</text>
  <text x="518" y="170" fill="#94a3b8" font-size="7.5" text-anchor="middle">品牌过滤 · 团队隔离</text>
  <text x="518" y="181" fill="#a78bfa" font-size="7.5" text-anchor="middle">CEO全量 · 销售仅己</text>

  <!-- 导入导出 -->
  <rect x="172" y="200" width="120" height="44" rx="6" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="232" y="217" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="middle">📥 导入/导出</text>
  <text x="232" y="232" fill="#64748b" font-size="7.5" text-anchor="middle">Excel批量</text>

  <!-- 邮件通知 -->
  <rect x="305" y="200" width="130" height="44" rx="6" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="370" y="217" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="middle">📧 邮件通知</text>
  <text x="370" y="232" fill="#64748b" font-size="7.5" text-anchor="middle">EmailQueue异步</text>

  <!-- 审批历史 -->
  <rect x="448" y="200" width="140" height="44" rx="6" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="518" y="217" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="middle">📜 审批历史</text>
  <text x="518" y="232" fill="#64748b" font-size="7.5" text-anchor="middle">Timeline+4总量值</text>

  <!-- 区域边框: 基础数据 -->
  <rect x="620" y="40" width="440" height="160" rx="10" fill="rgba(8,51,68,0.08)" stroke="#22d3ee" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="632" y="58" fill="#22d3ee" font-size="9" font-weight="600">§4.3 基础数据管理</text>

  <!-- 客户管理 -->
  <rect x="640" y="72" width="130" height="54" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="705" y="93" fill="white" font-size="10" font-weight="600" text-anchor="middle">🏢 客户管理</text>
  <text x="705" y="109" fill="#94a3b8" font-size="8" text-anchor="middle">F-05 · §4.3.1</text>
  <text x="705" y="121" fill="#22d3ee" font-size="7" text-anchor="middle">Brand字段·品牌过滤</text>

  <!-- 产品管理 -->
  <rect x="783" y="72" width="130" height="54" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="848" y="93" fill="white" font-size="10" font-weight="600" text-anchor="middle">📦 产品管理</text>
  <text x="848" y="109" fill="#94a3b8" font-size="8" text-anchor="middle">F-06 · §4.3.2</text>
  <text x="848" y="121" fill="#22d3ee" font-size="7" text-anchor="middle">5级联动·PA→SubPA4</text>

  <!-- 组织架构 -->
  <rect x="926" y="72" width="120" height="54" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="986" y="93" fill="white" font-size="10" font-weight="600" text-anchor="middle">🏛️ 组织架构</text>
  <text x="986" y="109" fill="#94a3b8" font-size="8" text-anchor="middle">F-07 · §4.3.3</text>
  <text x="986" y="121" fill="#22d3ee" font-size="7" text-anchor="middle">OrgNode树形</text>

  <!-- 开票公司 -->
  <rect x="640" y="140" width="130" height="44" rx="6" fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="705" y="158" fill="#a78bfa" font-size="9" font-weight="600" text-anchor="middle">🏦 开票公司</text>
  <text x="705" y="173" fill="#94a3b8" font-size="8" text-anchor="middle">F-10 · §5 开票权限</text>

  <!-- 开票公司-用户权限 -->
  <rect x="783" y="140" width="263" height="44" rx="6" fill="rgba(76,29,149,0.25)" stroke="#a78bfa" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="915" y="158" fill="#a78bfa" font-size="9" font-weight="600" text-anchor="middle">用户-开票公司权限表（跨部门特别权限）</text>
  <text x="915" y="173" fill="#64748b" font-size="7.5" text-anchor="middle">财务可配置 · 无品牌/区域限制</text>

  <!-- ===== 系统管理区域 ===== -->
  <rect x="160" y="275" width="900" height="130" rx="10" fill="rgba(251,191,36,0.06)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="172" y="293" fill="#fbbf24" font-size="9" font-weight="600">§4.4 系统管理</text>

  <!-- 用户管理 -->
  <rect x="180" y="305" width="130" height="50" rx="6" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="245" y="325" fill="white" font-size="10" font-weight="600" text-anchor="middle">👥 用户账号</text>
  <text x="245" y="341" fill="#94a3b8" font-size="8" text-anchor="middle">F-08 · §4.4.1</text>
  <text x="245" y="353" fill="#fbbf24" font-size="7" text-anchor="middle">Brand字段·品牌归属</text>

  <!-- 审批流程配置 -->
  <rect x="323" y="305" width="140" height="50" rx="6" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="393" y="325" fill="white" font-size="10" font-weight="600" text-anchor="middle">🔀 审批流程配置</text>
  <text x="393" y="341" fill="#94a3b8" font-size="8" text-anchor="middle">canModify per node</text>
  <text x="393" y="353" fill="#fbbf24" font-size="7" text-anchor="middle">节点级独立配置</text>

  <!-- 消息模板 -->
  <rect x="476" y="305" width="130" height="50" rx="6" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="541" y="325" fill="white" font-size="10" font-weight="600" text-anchor="middle">📋 消息模板</text>
  <text x="541" y="341" fill="#94a3b8" font-size="8" text-anchor="middle">F-09 · §4.4.3</text>
  <text x="541" y="353" fill="#fbbf24" font-size="7" text-anchor="middle">变量替换·占位符</text>

  <!-- 操作日志 -->
  <rect x="619" y="305" width="130" height="50" rx="6" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="684" y="325" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">📋 操作日志</text>
  <text x="684" y="341" fill="#64748b" font-size="8" text-anchor="middle">LoginHistory</text>
  <text x="684" y="353" fill="#64748b" font-size="7" text-anchor="middle">LoginHistory 实体</text>

  <!-- 开票公司管理 -->
  <rect x="762" y="305" width="130" height="50" rx="6" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="827" y="325" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">🏦 开票公司</text>
  <text x="827" y="341" fill="#64748b" font-size="8" text-anchor="middle">F-10 · §4.4.4</text>
  <text x="827" y="353" fill="#64748b" font-size="7" text-anchor="middle">Admin维护</text>

  <!-- 邮件队列表 -->
  <rect x="905" y="305" width="140" height="50" rx="6" fill="rgba(6,78,59,0.3)" stroke="#34d399" stroke-width="1.2"/>
  <text x="975" y="325" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">📧 EmailQueue</text>
  <text x="975" y="341" fill="#64748b" font-size="7.5" text-anchor="middle">队列表·定时服务</text>
  <text x="975" y="353" fill="#64748b" font-size="7.5" text-anchor="middle">SUBMIT/APPROVE/REJECT</text>

  <!-- ===== 技术支撑层 ===== -->
  <rect x="160" y="420" width="900" height="130" rx="10" fill="rgba(76,29,149,0.08)" stroke="#a78bfa" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="172" y="438" fill="#a78bfa" font-size="9" font-weight="600">技术支撑层 §8~§13</text>

  <!-- 认证 -->
  <rect x="180" y="450" width="130" height="56" rx="6" fill="rgba(136,19,55,0.5)" stroke="#fb7185" stroke-width="1.5"/>
  <text x="245" y="471" fill="white" font-size="10" font-weight="600" text-anchor="middle">🔐 认证与授权</text>
  <text x="245" y="487" fill="#94a3b8" font-size="8" text-anchor="middle">F-11 · §11</text>
  <text x="245" y="500" fill="#fb7185" font-size="7" text-anchor="middle">JWT·M365 SSO·多设备互斥</text>

  <!-- 数据模型 -->
  <rect x="323" y="450" width="130" height="56" rx="6" fill="rgba(76,29,149,0.5)" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="388" y="471" fill="white" font-size="10" font-weight="600" text-anchor="middle">🗄️ 数据模型</text>
  <text x="388" y="487" fill="#94a3b8" font-size="8" text-anchor="middle">§9</text>
  <text x="388" y="500" fill="#a78bfa" font-size="7" text-anchor="middle">EF Core·MySQL·Migration</text>

  <!-- API层 -->
  <rect x="466" y="450" width="130" height="56" rx="6" fill="rgba(6,78,59,0.5)" stroke="#34d399" stroke-width="1.5"/>
  <text x="531" y="471" fill="white" font-size="10" font-weight="600" text-anchor="middle">🔌 API 端点</text>
  <text x="531" y="487" fill="#94a3b8" font-size="8" text-anchor="middle">§10</text>
  <text x="531" y="500" fill="#34d399" font-size="7" text-anchor="middle">REST·统一错误码</text>

  <!-- 前端技术 -->
  <rect x="609" y="450" width="130" height="56" rx="6" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="674" y="471" fill="white" font-size="10" font-weight="600" text-anchor="middle">🖥️ 前端技术</text>
  <text x="674" y="487" fill="#94a3b8" font-size="8" text-anchor="middle">§12</text>
  <text x="674" y="500" fill="#22d3ee" font-size="7" text-anchor="middle">Vue3·Ant Design·Vite</text>

  <!-- 部署 -->
  <rect x="752" y="450" width="130" height="56" rx="6" fill="rgba(120,53,15,0.4)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="817" y="471" fill="white" font-size="10" font-weight="600" text-anchor="middle">☁️ 部署运维</text>
  <text x="817" y="487" fill="#94a3b8" font-size="8" text-anchor="middle">§8.1</text>
  <text x="817" y="500" fill="#fbbf24" font-size="7" text-anchor="middle">Azure Container App</text>

  <!-- 数据隔离 -->
  <rect x="895" y="450" width="150" height="56" rx="6" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="970" y="471" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="middle">🔒 Global Query Filter</text>
  <text x="970" y="487" fill="#64748b" font-size="7.5" text-anchor="middle">EF Core软删除统一拦截</text>
  <text x="970" y="500" fill="#64748b" font-size="7.5" text-anchor="middle">品牌过滤·团队过滤·CEO全量</text>

  <!-- ===== 连接线: 角色 → 功能 ===== -->
  <!-- 销售 → 预测填报 -->
  <line x1="120" y1="95" x2="448" y2="95" stroke="#22d3ee" stroke-width="1.2" marker-end="url(#a-cyan)"/>
  <text x="284" y="89" fill="#22d3ee" font-size="7.5">填报+草稿</text>
  <!-- 销售 → Dashboard -->
  <line x1="120" y1="82" x2="172" y2="82" stroke="#22d3ee" stroke-width="1" marker-end="url(#a-cyan)"/>
  <text x="146" y="76" fill="#22d3ee" font-size="7.5">看自己</text>

  <!-- 直线经理 → 审批 -->
  <line x1="120" y1="197" x2="305" y2="160" stroke="#34d399" stroke-width="1.2" marker-end="url(#a-green)"/>
  <text x="175" y="175" fill="#34d399" font-size="7.5">审批+看团队</text>
  <!-- 直线经理 → Dashboard -->
  <line x1="120" y1="197" x2="172" y2="105" stroke="#34d399" stroke-width="1" marker-end="url(#a-green)"/>

  <!-- CEO → 审批 -->
  <line x1="120" y1="427" x2="305" y2="175" stroke="#fb7185" stroke-width="1.2" marker-end="url(#a-cyan)"/>
  <text x="195" y="310" fill="#fb7185" font-size="7.5">最终审批</text>
  <!-- CEO → Dashboard -->
  <line x1="120" y1="427" x2="172" y2="105" stroke="#fb7185" stroke-width="1" marker-end="url(#a-cyan)"/>

  <!-- Admin → 周期管理 -->
  <line x1="120" y1="542" x2="305" y2="95" stroke="#fbbf24" stroke-width="1.2" marker-end="url(#a-amber)"/>
  <text x="195" y="525" fill="#fbbf24" font-size="7.5">创建周期</text>
  <!-- Admin → 用户管理 -->
  <line x1="120" y1="542" x2="180" y2="330" stroke="#fbbf24" stroke-width="1" marker-end="url(#a-amber)"/>
  <!-- Admin → 消息模板 -->
  <line x1="120" y1="560" x2="476" y2="330" stroke="#fbbf24" stroke-width="1" marker-end="url(#a-amber)"/>
  <!-- Admin → 开票公司 -->
  <line x1="120" y1="560" x2="640" y2="162" stroke="#fbbf24" stroke-width="1" marker-end="url(#a-amber)"/>

  <!-- ===== LEGEND ===== -->
  <text x="40" y="610" fill="white" font-size="10" font-weight="700">图例</text>
  <rect x="40" y="620" width="14" height="9" rx="2" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.2"/>
  <text x="60" y="628" fill="#94a3b8" font-size="8">前端/用户视角模块</text>
  <rect x="190" y="620" width="14" height="9" rx="2" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.2"/>
  <text x="210" y="628" fill="#94a3b8" font-size="8">业务核心模块（预测/审批）</text>
  <rect x="390" y="620" width="14" height="9" rx="2" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="410" y="628" fill="#94a3b8" font-size="8">系统管理模块</text>
  <rect x="570" y="620" width="14" height="9" rx="2" fill="rgba(76,29,149,0.5)" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="590" y="628" fill="#94a3b8" font-size="8">数据/技术支撑层</text>
  <rect x="730" y="620" width="14" height="9" rx="2" fill="rgba(136,19,55,0.5)" stroke="#fb7185" stroke-width="1.2"/>
  <text x="750" y="628" fill="#94a3b8" font-size="8">认证安全</text>
  <rect x="860" y="620" width="14" height="9" rx="2" fill="rgba(120,53,15,0.35)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="880" y="628" fill="#94a3b8" font-size="8">延期/约束机制</text>

</svg>
```

Sandvik Forecast Tool · 功能架构图 · PRD §4 功能模块 · v0.4



### 4.1 Dashboard（数据看板）

**职责：** 展示预测汇总数据，永远显示最新有效数据。

**主页面：** `/`（首页）

**功能描述：** 按权限展示当前周期（或最近有数据的周期）的汇总卡片、月度趋势图、区域/产品线分布图。数据口径仅含已审批通过数据。详见 §6 F-01。

**权限：** CEO/SYS_ADMIN 全量；VP_SALES 本大区；MANAGER 本团队；SALES 仅自己。

---

### 4.2 预测管理

#### 4.2.1 预测周期管理（Admin）

**职责：** 管理员配置预测周期（FC），定义填报窗口、延期窗口和预测月份范围。

**主页面：** `/admin/forecast-periods`

**功能描述：** 新建/编辑/删除预测周期。周期含7+1个字段：周期名称、填报起始/截止时间、预测起止年月、延期起始/截止时间、延期人员名单。删除仅当该周期无任何填报数据时允许。详见 §6 F-02。

**权限：** 仅 SYS_ADMIN。

---

#### 4.2.2 预测填报（销售）

**职责：** 销售填报和提交预测数据。

**主页面：** `/forecast`

**子页面：** `/forecast/form`（新建）、`/forecast/form/:id`（编辑/查看）

**功能描述：** 销售在填报有效期内，按"客户+产品+月份"填写订单/开票数量和金额。客户受品牌过滤（Customer.Brand = Salesperson.Brand）。支持单个添加、批量月份添加、模板下载/上传、导出。提交后进入审批流，不可自行撤回。详见 §6 F-03。

**关键交互：** 业绩归属区域和销售大区自动带出（来自OrgNode，只读）；开票公司自由选择；单价由系统自动计算（订单金额÷订单数量）；复制上期数据生成草稿；批量上传时相同（销售+周期+客户+产品+月份）覆盖更新。

**权限：** SALES 角色，仅操作自己的数据。

---

#### 4.2.3 预测审批（审批人）

**职责：** 审批人对下级提交的预测进行审批。

**主页面：** `/approval`

**子页面：** `/approval/:id`（审批详情页）

**功能描述：** 三个审批动作——通过（自动推进上一层）、退回（逐层退，附评语）、调整（退回+4个汇总指导值+评语）。审批历史记录操作人、时间、动作类型和调整值。邮件通知由队列异步发送，不阻塞主流程。详见 §6 F-04。

**权限：** MANAGER/VP_SALES/CEO，按OrgNode层级自动确定审批节点。

---

### 4.3 基础数据管理

#### 4.3.1 客户管理

**职责：** 管理员维护客户主数据。

**主页面：** `/admin/customers`

**子页面：** 新建/编辑客户表单（弹窗）

**功能描述：** 增删改查客户，含品牌字段（品牌过滤依据）。每个客户归属一个品牌，销售只能填报自己品牌下的客户。列表支持品牌过滤和关键词模糊搜索。详见 §6 F-05。

**权限：** 仅 SYS_ADMIN 可新建/编辑；所有用户按品牌过滤看列表。

---

#### 4.3.2 产品管理

**职责：** 管理员维护产品层级主数据。

**主页面：** `/admin/products`

**子页面：** 新建/编辑产品表单（弹窗）

**功能描述：** 产品5级联动（PA→SubPA-1→SubPA-2→SubPA-3→SubPA-4），SubPA-4支持模糊搜索。部分级别之间联动断开（SubPA-1变化时SubPA-2不变）。SubPA-4由系统自动分配3位流水号。详见 §6 F-06。

**权限：** 仅 SYS_ADMIN 可新建/编辑；所有用户按联动规则选择产品。

---

#### 4.3.3 组织架构管理

**职责：** 管理员维护组织架构树（OrgNode）。

**主页面：** `/admin/org`

**功能描述：** 树形展示4层固定层级（CEO→大区负责人→直线经理→销售），含品牌、销售大区、业绩归属区域等业务属性。销售填报时区域字段从OrgNode自动带出。详见 §6 F-07。

**权限：** 仅 SYS_ADMIN。

---

### 4.4 系统管理

#### 4.4.1 用户账号管理

**职责：** 管理员维护用户账号。

**主页面：** `/admin/users`

**子页面：** 新建/编辑用户表单（弹窗）

**功能描述：** 管理员手工建用户账号，关联OrgNode和角色。首次SSO登录前账号必须先建好；人员离职时管理员停用账号。详见 §6 F-08。

**权限：** 仅 SYS_ADMIN。

---

#### 4.4.2 审批流程配置

**职责：** 管理员配置各审批节点的邮件通知规则和消息模板。

**主页面：** 嵌入在审批流相关管理页面

**功能描述：** 每个审批节点单独配置是否触发邮件+使用哪个模板。消息模板支持占位变量（周期名称、提交人、动作类型、4个总量值、评语、时间戳）。详见 §6 F-09。

**权限：** 仅 SYS_ADMIN。

---

#### 4.4.3 邮件通知管理

**职责：** 管理员配置邮件消息模板。

**主页面：** `/admin/message-templates`

**子页面：** 模板编辑（弹窗）

**功能描述：** 查看/编辑/预览消息模板。触发后邮件内容预渲染存入队列表，队列服务异步推送。详见 §6 F-09。

**权限：** 仅 SYS_ADMIN。

---

#### 4.4.4 开票公司管理

**职责：** 管理员维护开票公司及用户-开票公司权限配置。

**主页面：** `/admin/invoice-companies`（开票公司列表）

**关联页面：** `/admin/user-invoice-permissions`（用户-开票公司权限配置）

**功能描述：** 增删改查开票公司；配置财务等跨部门用户可查看哪些开票公司的数据（多对多）。销售填报时开票公司无品牌/区域限制，自由选择。详见 §6 F-10。

**权限：** 仅 SYS_ADMIN。

---

#### 4.4.5 操作日志

**职责：** 记录所有用户操作日志，供管理员审计。

**主页面：** `/admin/audit-logs`

**功能描述：** 记录登录、增、删、改、查操作，按操作类型/用户/时间筛选。仅SYS_ADMIN可查看。

**权限：** 仅 SYS_ADMIN。

---

## 5. 数据权限规则

### 5.1 权限矩阵


| 角色               | 自己数据 | 团队数据 | 本大区数据 | 全量数据 |
| ---------------- | ---- | ---- | ----- | ---- |
| 销售（SALES）        | ✅ 读写 | ❌    | ❌     | ❌    |
| 直线经理（MANAGER）    | ✅ 读写 | ✅ 读写 | ❌     | ❌    |
| 大区负责人（VP_SALES）  | ✅ 读写 | ✅ 读写 | ✅ 读写  | ❌    |
| CEO              | ✅ 读写 | ✅ 读写 | ✅ 读写  | ✅ 读写 |
| 系统管理员（SYS_ADMIN） | ✅ 读写 | ✅ 读写 | ✅ 读写  | ✅ 读写 |


### 5.2 数据权限规则

**两类权限体系：**

**A. 审批链权限（基于OrgNode层级）**
适用于：销售、直线经理、区域总监、CEO


| 角色             | 可看到的数据范围             |
| -------------- | -------------------- |
| 销售（SALES）      | 仅自己填报的数据             |
| 直线经理（MANAGER）  | 自己 + 所管辖所有销售的数据      |
| 区域总监（VP_SALES） | 自己 + 手下所有销售的数据（递归向上） |
| CEO（Frank Tao） | 全量数据                 |


**B. 跨部门特别权限（基于开票公司配置）**
适用于：财务等不在审批体系中的部门人员

一张 `用户-开票公司权限表`（user_invoice_company_permissions）：

|| 字段 | 说明 |
|------|------|
| id | 主键 |
| user_id | 用户ID |
| invoice_company_id | 开票公司ID（一对多） |

配置后，该用户可看到所分配开票公司下的全部预测数据。

**SYS_ADMIN（管理员）：** 拥有全部数据权限，不受上述两类限制。

**数据过滤逻辑优先级（Q41）：**

1. 如果用户在"跨部门特别权限表"中有配置 → 按开票公司权限过滤
2. 如果用户是审批链中的角色 → 按OrgNode层级递归过滤
3. SYS_ADMIN → 全量

**品牌过滤（Q37，数据安全关键）：** 山工多品牌，每个销售只归属一个品牌，每个客户也只归属一个品牌。过滤逻辑：`Salesperson.Brand = Customer.Brand`，确保销售只能填报自己品牌下的客户。**品牌过滤在后端查询层强制执行，不可绕过。**

**上级可见范围（Q38）：** 组织架构四层（销售→直线经理→区域总监→总经理）。上级可见自己+所有下级数据，无递归深度限制。

**OrgNode数据结构（Q40）：** `parent_id` 自引用结构，递归深度固定4层。递归CTE查询性能无问题。

**数据只读规则（Q14）：**

- 销售提交后进入审批流，提交人不可编辑
- 当前审批节点操作人（直线经理→区域经理→最终审批人）可修改数据后再提交
- 只有被退回后，退回节点的人才可编辑
- 最终审批人（Frank Tao）只审批不修改，有问题直接退回

### 5.3 填报时的自动/手动字段


| 字段     | 来源               | 填报时          |
| ------ | ---------------- | ------------ |
| 客户     | 列表选择             | 手动（受Brand过滤） |
| 业绩归属区域 | OrgNode          | **自动填入，只读**  |
| 销售大区   | OrgNode          | **自动填入，只读**  |
| 开票公司   | 列表选择             | **自由选择，无限制** |
| 产品线    | ProductHierarchy | 手动（5级联动）     |


---

## 6. 功能细化规格

> 本章节将 **PRD_DETAILED_SPEC.md** 的全部内容整合进来，作为 PRD 的详细交互规格补充。
> **使用方式：** PRD §1~§5 定义"做什么"，本章节定义"怎么做"——每个页面/模块的按钮、列、状态、空态、分页均已精确描述。

## 模块编号对照

| 模块编号 | 模块名称 | 对应 PRD 章节 |
| F-01 | Dashboard（数据看板） | §4.1 |
| F-02 | 预测周期管理 | §4.2.1 |
| F-03 | 预测填报（列表+表单） | §4.2.2 |
| F-04 | 预测审批（审批人视图） | §4.2.3 |
| F-05 | 客户管理 | §4.3.1 |
| F-06 | 产品管理 | §4.3.2 |
| F-07 | 组织架构 | §4.3.3 |
| F-08 | 用户账号 | §4.4.1 |
| F-09 | 邮件通知管理 | §4.4.3（模板配置）+ §11.1（触发机制） |
| F-10 | 开票公司管理 | §4.4.4 |
| F-11 | 登录/认证 | §4.4.5（前端入口）+ §11.1（技术实现） |

---

## F-01 Dashboard（数据看板）

### F-01.1 页面组成

```
┌─────────────────────────────────────────────────────────┐
│ 顶部导航栏                                              │
├─────────────────────────────────────────────────────────┤
│ 周期选择器： [2026 FC1 ▼] [2026 FC2]  ← 仅SYS_ADMIN显示│
├──────────────┬──────────────┬──────────────┬────────────┤
│ 汇总卡片1    │ 汇总卡片2    │ 汇总卡片3    │ 汇总卡片4  │
│ 本周期总金额  │ 已填报客户数  │ 待审批数     │ 已完成审批数│
│ ¥12,345,678  │ 45家         │ 12条         │ 33条       │
└──────────────┴──────────────┴──────────────┴────────────┘
┌─────────────────────────────────────────────────────────┐
│ 图表Tab切换：[订单金额] [开票金额]                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  月度趋势折线图（12个月）                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ 区域/产品线分布                                          │
├───────────────────────────┬─────────────────────────────┤
│ 按区域汇总（柱状图）       │ 按产品线汇总（饼图）         │
└───────────────────────────┴─────────────────────────────┘
```

### F-01.2 数据口径规则

- **只含已审批通过数据**：草稿+审批中数据不计入任何汇总
- **当前周期判断**：系统按服务器时间自动取落在 FillTimeStart~FillTimeEnd 窗口内的周期
- **无有效周期时**：显示最近一个有数据的周期，周期选择器切换
- **Dashboard 永远有数据**：不能空着

### F-01.3 角色数据可见范围


| 角色              | 可见数据范围        |
| --------------- | ------------- |
| CEO / SYS_ADMIN | 全量            |
| 区域总监（VP_SALES）  | 本大区所有销售       |
| 直线经理（MANAGER）   | 本团队（自己+所管辖销售） |
| 销售（SALES）       | 仅自己           |


### F-01.4 卡片字段说明


| 卡片       | 计算口径                             |
| -------- | -------------------------------- |
| 本周期总预测金额 | sum(order_amount)，仅已审批通过         |
| 已填报客户数   | distinct count(customer_id)，含审批中 |
| 待我审批数    | 当前用户是审批人的审批请求数（status != 已完成）    |
| 本周期已完成审批 | status = 已完成 的记录数                |


### F-01.5 图表交互

- **Tab切换**：订单金额/开票金额，切换后折线图+柱状图同步更新
- **悬停提示**：显示该月具体金额，格式 ¥999,999,999
- **点击柱状/折线点**：不跳转，查看明细入口在列表页

---

## F-02 预测周期管理（Admin）

### F-02.1 周期列表页

**路由**：`/admin/forecast-periods`

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ [新增周期] 按钮（右上角）                                │
├─────────────────────────────────────────────────────────┤
│ 列表（表格）                                            │
│ 周期名称 | 填报窗口 | 延期窗口 | 状态 | 操作            │
└─────────────────────────────────────────────────────────┘
```

**表格列定义**：


| 列    | 宽度    | 排序   | 说明                                    |
| ---- | ----- | ---- | ------------------------------------- |
| 周期名称 | 150px | 默认升序 | 如"2026 FC1"                           |
| 填报窗口 | 200px | 否    | FillTimeStart ~ FillTimeEnd           |
| 延期窗口 | 200px | 否    | ExtensionStart ~ ExtensionEnd，无则显示"-" |
| 状态   | 100px | 否    | 即将开始/填报中/已截止/已结束                      |
| 操作   | 150px | 否    | [编辑] [删除*]                            |


*删除仅当该周期无任何填报数据时显示

**按钮逻辑**：

- [新增周期] → 弹窗表单
- [编辑] → 弹窗表单，数据预填充
- [删除] → 弹出确认框，「该周期无填报数据，确认删除？」

### F-02.2 周期表单（新建/编辑）

**字段**：


| 字段     | 类型                | 必填  | 校验/说明                 |
| ------ | ----------------- | --- | --------------------- |
| 周期名称   | text              | ✅   | 如"2026 FC1"，不能与已有名称重复 |
| 填报起始时间 | datetime          | ✅   | 服务器时间，不能晚于截止时间        |
| 填报截止时间 | datetime          | ✅   | 不能早于起始时间              |
| 预测起始年月 | month             | ✅   | 如2026-07，控制填报页面月份范围起点 |
| 预测结束年月 | month             | ✅   | 不能早于起始年月              |
| 延期起始时间 | datetime          | ❌   | 默认=FillTimeEnd+1天     |
| 延期截止时间 | datetime          | ❌   | 不能早于延期起始时间            |
| 延期人员名单 | multi-select user | ❌   | 选择哪些销售可在延期窗口内补提交      |


**底部按钮**：[取消] [保存]

**保存后行为**：关闭弹窗，列表刷新，toast提示"保存成功"

---

## F-03 预测填报

### F-03.1 填报列表页

**路由**：`/forecast`

**进入逻辑**：

1. 进入时实时查 OrgNode，取当前用户的周期+客户+业绩归属区域
2. 初始显示**空白列表**（展示已填报条目数量+金额汇总）
3. 无数据时：全空白，显示"暂无填报数据"

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ 周期选择器：[2026 FC1 ▼]  ← 系统自动取当前有效周期      │
├─────────────────────────────────────────────────────────┤
│ 顶部汇总：本周期已填报 ¥12,345,678 / 45条记录           │
├─────────────────────────────────────────────────────────┤
│ 筛选栏：                                                │
│ [客户 ▼] [产品线 ▼] [状态 ▼] [重置]                   │
├─────────────────────────────────────────────────────────┤
│ 操作按钮区：                                            │
│ [填报] [模板下载] [模板上传] [导出]                    │
├─────────────────────────────────────────────────────────┤
│ 数据表格（列表）                                        │
└─────────────────────────────────────────────────────────┘
```

**筛选栏规则**：

- **客户**：下拉列表，仅显示品牌匹配的客户（`Customer.Brand = Salesperson.Brand`）
- **产品线**：5级联动选择器（PA→Sub PA-4）
- **状态**：全部 / 草稿 / 审批中 / 已通过 / 已驳回
- **重置**：清空所有筛选条件

**表格列定义**：


| 列      | 宽度    | 排序  | 说明               |
| ------ | ----- | --- | ---------------- |
| 序号     | 50px  | 否   | 自然序号             |
| 客户名称   | 180px | ✅升序 |                  |
| 产品     | 200px | ✅升序 | 显示L1+L2+L3名称     |
| 销售大区   | 100px | 否   | 自动带出，不可改         |
| 订单金额   | 130px | ✅降序 | 格式¥999,999，红色<=0 |
| 开票金额   | 130px | ✅降序 | 格式¥999,999，红色<=0 |
| 状态     | 90px  | 否   | 颜色标签（见下）         |
| 最后操作时间 | 140px | ✅降序 | YYYY-MM-DD HH:mm |
| 操作     | 180px | 否   | 操作按钮组（见下）        |


**状态颜色标签**：


| 状态  | 颜色  | 说明       |
| --- | --- | -------- |
| 草稿  | 灰色  | draft    |
| 审批中 | 蓝色  | pending  |
| 已通过 | 绿色  | approved |
| 已驳回 | 红色  | rejected |


**操作按钮组（按状态显示）**：


| 按钮  | 草稿  | 审批中 | 已通过 | 已驳回       |
| --- | --- | --- | --- | --------- |
| 查看  | ✅   | ✅   | ✅   | ✅         |
| 编辑  | ✅   | ❌   | ❌   | ✅（驳回后可编辑） |
| 删除  | ✅   | ❌   | ❌   | ❌         |
| 提交  | ✅   | ❌   | ❌   | ❌         |
| 撤回  | ❌   | ✅   | ❌   | ❌         |


**提交按钮逻辑**：点击 → 弹出确认框「提交后将进入审批流程，是否确认？」

**撤回按钮逻辑**：点击 → 弹出确认框「撤回后数据将退回草稿，是否确认？」

**删除按钮逻辑**：点击 → 弹出确认框「删除后数据不可恢复，是否确认？」

### F-03.2 填报表单页

**路由**：`/forecast/form`（新建） 或 `/forecast/form/:id`（编辑/查看）

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ [← 返回列表]                                            │
├─────────────────────────────────────────────────────────┤
│ 头部信息（固定）                                        │
│ 周期：[2026 FC1]  销售：[当前用户]  业绩归属区域：[自动] │
├─────────────────────────────────────────────────────────┤
│ 填报主体                                                │
│ 客户* [下拉▼]          ← 必填，受品牌过滤              │
│ 产品线* [5级联动选择▼] ← 必填，SubPA-4支持模糊搜索     │
│ 开票公司 [下拉▼]       ← 必填，无品牌限制               │
├─────────────────────────────────────────────────────────┤
│ 月度数据（12个月，每行一个月）                          │
│ ┌────────┬────────┬────────┬────────┐                  │
│ │ 月份   │ 订单数量│ 订单金额│ 开票数量│ 开票金额     │
│ ├────────┼────────┼────────┼────────┤                  │
│ │ 2026-07│ [输入] │ [输入] │ [输入] │ [输入]        │
│ │ 2026-08│ [输入] │ [输入] │ [输入] │ [输入]        │
│ │ ...    │  ...   │  ...   │  ...   │  ...          │
│ └────────┴────────┴────────┴────────┘                  │
│ ※ 单价自动计算显示（订单金额÷订单数量）                  │
├─────────────────────────────────────────────────────────┤
│ [复制上期] [保存草稿] [提交审批]                        │
└─────────────────────────────────────────────────────────┘
```

**月度字段校验规则（Q13）**：

- 订单数量/开票数量：整数，可为0，**不可为负**
- 订单金额/开票金额：整数（精确到元），可为0，**不可为负**
- 开票金额与订单金额**无关联**，各自分别独立，无上限/比例限制
- 月度数据与年度汇总**无校验关系**

**复制上期按钮逻辑**：

1. 点击 → 弹出窗口「选择来源周期」，下拉选择历史周期
2. 选择后，系统自动填入该历史周期中同客户+同产品+同月份的数据
3. 复制后数据为**草稿状态**，需手动提交

**提交审批按钮逻辑**：

1. 必填字段校验：客户/产品/开票公司未选 → 红色高亮+提示"请完整填写"
2. 金额校验：有负数 → 提示"金额和数量不可为负"
3. 校验通过 → 弹出确认框「提交后将进入审批流程，是否确认？」
4. 确认 → 保存数据+创建ApprovalRequest → 跳转列表页 → toast提示"提交成功"

**查看模式（已通过/审批中）**：所有字段只读，无操作按钮

**编辑模式（草稿/已驳回）**：所有字段可编辑，操作按钮[保存草稿] [提交审批]

### F-03.3 模板上传

**入口**：`/forecast` 页面 → [模板上传] 按钮

**流程**：

1. 点击 → 弹窗，点击下载空白模板（Excel）
2. 用户填写Excel
3. 弹窗内上传Excel → 系统解析
4. 解析结果预览：成功行数 / 失败行数 / 失败原因
5. 确认导入 → 批量写入DB（相同销售+周期+客户+产品+月份覆盖更新）→ 返回列表

**模板格式**：


| 列     | 字段名                 | 说明      |
| ----- | ------------------- | ------- |
| A     | 客户名称                | 必填      |
| B     | 产品L1                | 必填      |
| C     | 产品L2                | 可空      |
| D     | 产品L3                | 可空      |
| E     | 产品L4                | 可空      |
| F     | 产品L5(SubPA4)        | 可空，模糊匹配 |
| G     | 开票公司                | 必填      |
| H~S   | 2026-07~2027-03订单数量 | 整数      |
| T~AE  | 2026-07~2027-03订单金额 | 整数（元）   |
| AF~AO | 2026-07~2027-03开票数量 | 整数      |
| AP~AY | 2026-07~2027-03开票金额 | 整数（元）   |


---

## F-04 预测审批（审批人视图）

### F-04.1 审批列表页

**路由**：`/approval`

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ Tab切换：[待我审批(12)] [我已审批] [全部]               │
├─────────────────────────────────────────────────────────┤
│ 筛选栏：[周期 ▼] [提交人 ▼] [区域 ▼] [重置]           │
├─────────────────────────────────────────────────────────┤
│ 审批卡片列表                                            │
└─────────────────────────────────────────────────────────┘
```

**Tab说明**：

- **待我审批**：当前用户是审批节点且status=审批中的记录
- **我已审批**：当前用户操作过的记录（含历史）
- **全部**：所有可查看的审批记录（按权限过滤）

**审批卡片内容**：

```
┌─────────────────────────────────────────────────────┐
│ [客户名] — 2026 FC1  状态：[审批中 蓝色标签]        │
│ 销售：韩学健 | 直线经理：王五                        │
│ 订单金额：¥1,234,567  开票金额：¥1,100,000          │
│ 提交时间：2026-04-01 14:30                          │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│ │  查看详情   │  │   通过 ✓    │  │   驳回 ✗   │ │
│ └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

**卡片字段**：


| 字段     | 说明                               |
| ------ | -------------------------------- |
| 客户名称   |                                  |
| 周期名称   |                                  |
| 状态标签   | 颜色：审批中=蓝 / 已通过=绿 / 已驳回=红 / 调整中=橙 |
| 提交人    | 提交这条数据的销售姓名                      |
| 直属上级   | 直线经理姓名                           |
| 订单金额合计 |                                  |
| 开票金额合计 |                                  |
| 提交时间   | YYYY-MM-DD HH:mm                 |


**操作按钮**：

- [查看详情] — 任何状态均显示，点击进入审批详情页
- [通过] — 仅待我审批且当前用户是审批节点时显示
- [驳回] — 仅待我审批且当前用户是审批节点时显示
- [调整] — 仅待我审批且当前用户是审批节点时显示

### F-04.2 审批详情页

**路由**：`/approval/:id`

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ [← 返回列表]                                            │
├─────────────────────────────────────────────────────────┤
│ 审批信息头                                              │
│ 客户：XXX  |  周期：2026 FC1  |  状态：审批中          │
│ 提交人：韩学健  |  提交时间：2026-04-01 14:30          │
├─────────────────────────────────────────────────────────┤
│ 当前审批节点                                            │
│ 节点3/4：区域总监审批  |  当前审批人：杨依柱            │
├─────────────────────────────────────────────────────────┤
│ 审批历史时间线                                          │
│ ● 2026-04-01 14:30 韩学健 提交                         │
│ ● 2026-04-02 09:00 李长春 通过（无调整）               │
│ ● 2026-04-02 10:00 杨依柱 [当前节点]                   │
├─────────────────────────────────────────────────────────┤
│ 预测数据明细                                            │
│ [表格：客户/产品/2026-07金额/.../合计]                  │
├─────────────────────────────────────────────────────────┤
│ 审批操作区                                              │
│ 评语：[输入框]                                          │
│ [驳回] [调整+提交指导值] [通过]                         │
└─────────────────────────────────────────────────────────┘
```

**审批操作按钮逻辑**：

**[通过]**：

1. 点击 → 弹出确认框「确认通过？」
2. 系统自动找下一个审批人（从OrgNode查），创建新的ApprovalRequest记录
3. 若无更高级审批人 → status变为"已完成"
4. 返回列表 → toast"审批通过"

**[驳回]**：

1. 点击 → 弹出评语输入框（必填）「请输入驳回原因」
2. 提交后，数据退回到**上一层**（当前是区域总监→退到直线经理）
3. 直线经理可编辑，重新提交
4. 返回列表 → toast"已驳回"

**[调整]**：

1. 点击 → 弹出调整表单（见下）
2. 提交后，退回+附指导值

**调整表单字段**：


| 字段       | 说明          |
| -------- | ----------- |
| 调整的订单总金额 | 指导值，下级参考    |
| 调整的开票总金额 | 指导值，下级参考    |
| 调整的订单总数量 | 指导值，下级参考    |
| 调整的开票总数量 | 指导值，下级参考    |
| 调整说明     | 必填，详细说明调整原因 |


### F-04.3 审批链节点权限（Q20）


| 审批节点          | 可修改数据  | 可审批操作        |
| ------------- | ------ | ------------ |
| 直线经理          | ✅ 可修改  | 通过/驳回/调整     |
| 区域总监          | ✅ 可修改  | 通过/驳回/调整     |
| 总经理/Frank Tao | ❌ 不可修改 | 仅通过/驳回（后端控制） |


---

## F-05 客户管理

### F-05.1 客户列表页

**路由**：`/admin/customers`

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ [新增客户] [导入] [导出]                                │
├─────────────────────────────────────────────────────────┤
│ 筛选：[品牌 ▼] [关键词搜索🔍] [重置]                   │
├─────────────────────────────────────────────────────────┤
│ 客户表格                                                │
└─────────────────────────────────────────────────────────┘
```

**表格列定义**：


| 列    | 说明           |
| ---- | ------------ |
| 客户名称 | 可点击进入详情      |
| 品牌   | 颜色标签         |
| 联系人  |              |
| 联系电话 |              |
| 状态   | 启用/停用        |
| 创建时间 |              |
| 操作   | [编辑] [停用/启用] |


**关键词搜索（Q52）**：左右模糊匹配，可按俗称搜到规范名称

### F-05.2 新增/编辑客户表单

**字段**：


| 字段   | 必填  | 校验    |
| ---- | --- | ----- |
| 客户名称 | ✅   | 不能重名  |
| 品牌   | ✅   | 下拉选择  |
| 联系人  | ❌   |       |
| 联系电话 | ❌   |       |
| 状态   | ✅   | 启用/停用 |


---

## F-06 产品管理

### F-06.1 产品列表页

**路由**：`/admin/products`

**页面组成**：

```
┌─────────────────────────────────────────────────────────┐
│ [新增产品] [L1导入] [导出]                              │
├─────────────────────────────────────────────────────────┤
│ 5级联动筛选器：                                         │
│ [PA ▼] → [SubPA1 ▼] → [SubPA2 ▼] → [SubPA3 ▼]        │
├─────────────────────────────────────────────────────────┤
│ 产品表格                                                │
└─────────────────────────────────────────────────────────┘
```

**表格列定义**：


| 列      | 说明                                 |
| ------ | ---------------------------------- |
| 产品编码   | 14位，PA+SubPA1+SubPA2+SubPA3+SubPA4 |
| PA     | L1名称                               |
| SubPA1 | L2名称                               |
| SubPA2 | L3名称                               |
| SubPA3 | L4名称                               |
| SubPA4 | L5名称                               |
| 状态     | 启用/停用                              |
| 操作     | [编辑] [停用/启用]                       |


### F-06.2 产品5级联动行为（Q51）

**联动规则矩阵**：


| 选择变化    | PA变 | SubPA1变 | SubPA2变 | SubPA3变 | SubPA4变 |
| ------- | --- | ------- | ------- | ------- | ------- |
| 选PA后    | —   | ✅清空重选   | ✅清空重选   | ✅清空重选   | ✅清空重选   |
| 选SubPA1 | —   | —       | ❌保持不变   | ❌保持不变   | ❌保持不变   |
| 选SubPA2 | —   | —       | —       | ✅清空重选   | ✅清空重选   |
| 选SubPA3 | —   | —       | —       | —       | ✅清空重选   |
| 选SubPA4 | —   | —       | —       | —       | —       |


**SubPA4特殊处理**：型号数量大，采用**输入框+模糊搜索下拉**：

- 用户输入 → 下拉列表实时显示匹配项（左右模糊）
- 支持按俗称搜索（如输入"Tungsten"匹配"钨钢刀片"）
- 选择后填入输入框

### F-06.3 新增产品表单

**字段**：


| 字段     | 必填  | 说明                      |
| ------ | --- | ----------------------- |
| PA     | ✅   | 下拉选择                    |
| SubPA1 | ✅   | 下拉选择（联动）                |
| SubPA2 | ✅   | 下拉选择（联动）                |
| SubPA3 | ✅   | 下拉选择（联动）                |
| SubPA4 | ✅   | 输入+模糊搜索（末级，系统自动分配3位流水号） |
| 状态     | ✅   | 启用/停用                   |


---

## F-07 组织架构管理

### F-07.1 OrgNode列表（树形）

**路由**：`/admin/org`

**展示形式**：树形结构，4层固定层级

```
├── Frank Tao（CEO）
│   └── 杨依柱（VP_SALES/区域总监）
│       └── 李长春（直线经理/MANAGER）
│           ├── 韩学健（销售/SALES）
│           ├── 李清（销售/SALES）
│           └── 李思梦（销售/SALES）
```

**节点字段**（每个OrgNode）：


| 字段     | 说明                               |
| ------ | -------------------------------- |
| 姓名     |                                  |
| 角色     | CEO / VP_SALES / MANAGER / SALES |
| 上级     | parent_id                        |
| 品牌     | 销售归属的品牌                          |
| 所属公司   |                                  |
| 业绩归属区域 | 销售填报时自动填入                        |
| 销售大区   | 销售填报时自动填入                        |
| 状态     | 在职/离职                            |


**操作按钮**（每节点）：

- [查看下级] — 若有子节点
- [编辑]
- [新增下级] — 新增销售时
- [停用/启用]

---

## F-08 用户账号管理

### F-08.1 用户列表

**路由**：`/admin/users`

**表格列**：


| 列         | 说明                                           |
| --------- | -------------------------------------------- |
| 姓名        |                                              |
| 邮箱        | 即登录账号                                        |
| 角色        | SYS_ADMIN / CEO / VP_SALES / MANAGER / SALES |
| 关联OrgNode |                                              |
| 品牌        |                                              |
| 状态        | 启用/停用                                        |
| 操作        | [编辑] [停用/启用]                                 |


### F-08.2 用户新建/编辑

**字段**：


| 字段        | 必填  | 说明            |
| --------- | --- | ------------- |
| 姓名        | ✅   |               |
| 邮箱        | ✅   | M365账号，登录唯一标识 |
| 角色        | ✅   | 下拉选择          |
| 关联OrgNode | ✅   | 下拉选择          |
| 品牌        | ❌   | 仅销售角色时必填      |
| 状态        | ✅   | 启用/停用         |


**重要提示**：首次SSO登录前，用户必须先在系统中建好账号（Q47）

---

## F-09 邮件通知管理

### F-09.1 消息模板列表

**路由**：`/admin/message-templates`

**表格列**：


| 列      | 说明                |
| ------ | ----------------- |
| 模板名称   |                   |
| 关联审批节点 |                   |
| 状态     | 启用/停用             |
| 操作     | [编辑] [预览] [启用/停用] |


### F-09.2 模板编辑

**可用占位变量**（Q56）：

- `{PeriodName}` — 周期名称
- `{SubmitterName}` — 提交人姓名
- `{ActionType}` — 动作类型（提交/通过/驳回/调整）
- `{AdjustOrderAmount}` — 调整订单总金额（调整时有值）
- `{AdjustInvoiceAmount}` — 调整开票总金额
- `{AdjustOrderQty}` — 调整订单总数量
- `{AdjustInvoiceQty}` — 调整开票总数量
- `{Comments}` — 评语
- `{OperatedAt}` — 操作时间

### F-09.3 邮件触发规则（Q55）

- 触发时机：审批动作发生时（提交/通过/驳回/调整）
- 触发后立即写入 `email_queue_items` 表（预渲染内容）
- 邮件服务实时轮询推送，不阻塞主流程

---

## F-10 开票公司管理

### F-10.1 开票公司列表

**路由**：`/admin/invoice-companies`

**表格列**：


| 列    | 说明    |
| ---- | ----- |
| 公司名称 |       |
| 税号   |       |
| 状态   | 启用/停用 |
| 操作   | [编辑]  |


### F-10.2 用户-开票公司权限配置

**路由**：`/admin/user-invoice-permissions`

**表格列**：


| 列      | 说明          |
| ------ | ----------- |
| 用户姓名   |             |
| 可视开票公司 | 多对多，显示为标签列表 |
| 操作     | [配置]        |


**配置弹窗**：多选下拉，选择该用户可查看哪些开票公司的数据

---

## F-11 登录/认证

### F-11.1 登录页

**开发环境（Q50）**：`ASPNETCORE_ENVIRONMENT=Development`

- 显示用户名+密码输入框
- 使用JWT登录
- 登录成功 → 重定向到 Dashboard

**生产环境**：

- 跳转 M365 OAuth SSO
- SSO成功 → 回调 → 验证账号存在 → 登录成功
- **账号不存在** → 错误提示「该账号未授权，请联系管理员」

### F-11.2 多设备互斥（Q49）

**机制**：用户Login时：

1. 将该用户其他活跃会话（`IsActive=true`）全部标记为`IsActive=false`（踢出）
2. 创建新的`UserLoginSession`记录
3. 返回新的RefreshToken

**RefreshToken刷新**：

- 调用`POST /api/auth/refresh` → 更新`LastActiveAt`，不创建新会话
- 若设备会话已被踢出（`IsActive=false`）→ 返回401，`DeviceSessionExpired`

### F-11.3 登出

**调用**：`POST /api/auth/logout`

- 删除当前设备的`UserLoginSession`记录
- 其他设备会话不受影响

---

## 附录：通用交互规范

### 全局按钮样式


| 按钮类型 | 样式    | 使用场景          |
| ---- | ----- | ------------- |
| 主按钮  | 蓝色实心  | 主要操作：提交、保存、登录 |
| 次按钮  | 白色边框  | 次要操作：取消、重置    |
| 危险按钮 | 红色    | 删除、停用等危险操作    |
| 文字按钮 | 蓝色下划线 | 查看、详情         |


### 全局Toast提示


| 场景   | 提示内容               | 时长  |
| ---- | ------------------ | --- |
| 保存成功 | 操作成功               | 3秒  |
| 提交成功 | 提交成功，数据已进入审批流程     | 3秒  |
| 删除确认 | 删除成功               | 3秒  |
| 操作失败 | 错误原因（后端返回的message） | 5秒  |


### 确认弹窗规范

所有危险操作（删除/停用/提交/驳回）必须弹出确认框：

- 标题：操作名称（如"确认删除"）
- 内容：操作后果说明
- 按钮：[取消] [确认]

### 空状态规范


| 页面   | 空状态内容                       |
| ---- | --------------------------- |
| 填报列表 | 空状态插图 + "暂无填报数据" + [开始填报]按钮 |
| 审批列表 | 空状态插图 + "暂无待审批项"            |
| 客户列表 | 空状态插图 + "暂无客户数据" + [新增客户]按钮 |
| 产品列表 | 空状态插图 + "暂无产品数据"            |


### 加载状态规范

- **列表加载**：显示骨架屏（Skeleton），不显示spinner
- **表单提交中**：按钮显示loading状态+文字变为"提交中..."，禁止重复点击
- **详情加载**：整页骨架屏

### 分页规范

- 默认每页20条
- 支持10/20/50/100条每页切换
- 显示：共XXX条，第X-Y条，当前页

---

*本文档由 Hermes 小P 维护，PRD_DETAILED_SPEC.md — 功能细化规格说明*

## 7. Issue Log

> 本章节仅作索引指引。完整的 Issue 追踪记录（含开发前逻辑缺口、运行时 Bug、API 路由问题）统一收录在 **[ISSUE_LOG.md](./ISSUE_LOG.md)** 中。

---

---

# ===== 下半部分：技术实现 =====

---

## 8. 技术架构





# 技术架构图 — Technical Architecture

Sandvik Forecast Tool · PRD §8 技术架构 · v0.4

```
  <!-- ===== 浏览器/客户端 ===== -->
  <rect x="380" y="38" width="200" height="54" rx="8" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="480" y="60" fill="white" font-size="11" font-weight="600" text-anchor="middle">🌐 浏览器 / Azure AD</text>
  <text x="480" y="76" fill="#94a3b8" font-size="9" text-anchor="middle">Chrome · localhost:3002</text>

  <!-- Arrow: 浏览器 → Vue3 -->
  <line x1="480" y1="92" x2="480" y2="118" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arr-cyan)"/>
  <text x="495" y="106" fill="#22d3ee" font-size="8">HTTP/HTTPS</text>

  <!-- ===== 前端 Vue3 ===== -->
  <rect x="320" y="120" width="320" height="170" rx="10" fill="rgba(8,51,68,0.15)" stroke="#22d3ee" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="334" y="138" fill="#22d3ee" font-size="9" font-weight="600">Vue 3 前端 · §12</text>

  <!-- Vue3 Core -->
  <rect x="340" y="148" width="110" height="42" rx="5" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="395" y="166" fill="white" font-size="10" font-weight="600" text-anchor="middle">Vue 3 + Composition API</text>
  <text x="395" y="181" fill="#94a3b8" font-size="8" text-anchor="middle">TypeScript</text>

  <!-- Vite -->
  <rect x="465" y="148" width="110" height="42" rx="5" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="520" y="166" fill="white" font-size="10" font-weight="600" text-anchor="middle">⚡ Vite</text>
  <text x="520" y="181" fill="#94a3b8" font-size="8" text-anchor="middle">开发服务器 · 热更新</text>

  <!-- Ant Design Vue -->
  <rect x="340" y="205" width="110" height="42" rx="5" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="395" y="223" fill="white" font-size="10" font-weight="600" text-anchor="middle">🎨 Ant Design Vue</text>
  <text x="395" y="238" fill="#94a3b8" font-size="8" text-anchor="middle">企业级 UI 组件库</text>

  <!-- Vue Router -->
  <rect x="465" y="205" width="110" height="42" rx="5" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="520" y="223" fill="white" font-size="10" font-weight="600" text-anchor="middle">🔀 Vue Router</text>
  <text x="520" y="238" fill="#94a3b8" font-size="8" text-anchor="middle">路由守卫·JWT验证</text>

  <!-- Pinia -->
  <rect x="340" y="262" width="235" height="22" rx="4" fill="rgba(30,41,59,0.6)" stroke="#94a3b8" stroke-width="1"/>
  <text x="457" y="277" fill="#94a3b8" font-size="9" text-anchor="middle">Pinia · 全局状态管理</text>

  <!-- Arrow: Vue3 → .NET API -->
  <line x1="480" y1="290" x2="480" y2="316" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arr-cyan)"/>
  <text x="496" y="305" fill="#22d3ee" font-size="8">HTTP/REST (JSON)</text>

  <!-- ===== .NET 后端 ===== -->
  <rect x="240" y="318" width="480" height="220" rx="10" fill="rgba(6,78,59,0.12)" stroke="#34d399" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="254" y="336" fill="#34d399" font-size="9" font-weight="600">.NET 8 Web API · §8.1 / §10 · PRD v0.4</text>

  <!-- Controllers -->
  <rect x="260" y="348" width="100" height="40" rx="5" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="310" y="365" fill="white" font-size="9" font-weight="600" text-anchor="middle">Controllers</text>
  <text x="310" y="380" fill="#94a3b8" font-size="7.5" text-anchor="middle">API Routes</text>

  <!-- Services -->
  <rect x="375" y="348" width="100" height="40" rx="5" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="425" y="365" fill="white" font-size="9" font-weight="600" text-anchor="middle">Services</text>
  <text x="425" y="380" fill="#94a3b8" font-size="7.5" text-anchor="middle">业务逻辑</text>

  <!-- Data Access -->
  <rect x="490" y="348" width="100" height="40" rx="5" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.5"/>
  <text x="540" y="365" fill="white" font-size="9" font-weight="600" text-anchor="middle">Data Access</text>
  <text x="540" y="380" fill="#94a3b8" font-size="7.5" text-anchor="middle">EF Core ORM</text>

  <!-- Middleware -->
  <rect x="260" y="402" width="330" height="40" rx="5" fill="rgba(136,19,55,0.35)" stroke="#fb7185" stroke-width="1.2"/>
  <text x="425" y="419" fill="#fb7185" font-size="9" font-weight="600" text-anchor="middle">⚠️ 全局异常中间件 · 统一错误码体系（ErrorCode + AppException）</text>
  <text x="425" y="435" fill="#94a3b8" font-size="7.5" text-anchor="middle">§11 · 401/403/404/500 标准化响应</text>

  <!-- Auth -->
  <rect x="260" y="456" width="110" height="40" rx="5" fill="rgba(136,19,55,0.6)" stroke="#fb7185" stroke-width="1.5"/>
  <text x="315" y="473" fill="white" font-size="9" font-weight="600" text-anchor="middle">🔐 Auth</text>
  <text x="315" y="488" fill="#94a3b8" font-size="7.5" text-anchor="middle">JWT · MSAL</text>

  <!-- M365 SSO -->
  <rect x="385" y="456" width="110" height="40" rx="5" fill="rgba(136,19,55,0.6)" stroke="#fb7185" stroke-width="1.5"/>
  <text x="440" y="473" fill="white" font-size="9" font-weight="600" text-anchor="middle">🔵 M365 SSO</text>
  <text x="440" y="488" fill="#94a3b8" font-size="7.5" text-anchor="middle">Azure AD · OAuth 2.0</text>

  <!-- Email Queue -->
  <rect x="510" y="456" width="110" height="40" rx="5" fill="rgba(6,78,59,0.5)" stroke="#34d399" stroke-width="1.2"/>
  <text x="565" y="473" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">📧 EmailQueue</text>
  <text x="565" y="488" fill="#94a3b8" font-size="7.5" text-anchor="middle">队列表 · 异步触发</text>

  <!-- DB arrow -->
  <line x1="425" y1="388" x2="425" y2="510" stroke="#34d399" stroke-width="1.5" marker-end="url(#arr-green)"/>
  <text x="438" y="450" fill="#34d399" font-size="8">EF Core</text>

  <!-- ===== MySQL ===== -->
  <rect x="280" y="512" width="290" height="80" rx="8" fill="rgba(76,29,149,0.2)" stroke="#a78bfa" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="296" y="530" fill="#a78bfa" font-size="9" font-weight="600">🗄️ MySQL · §9 数据模型</text>
  <text x="296" y="547" fill="#94a3b8" font-size="8">ForecastPeriod · ForecastRecord · ApprovalRequest · ApprovalHistory</text>
  <text x="296" y="561" fill="#94a3b8" font-size="8">Customer · Product · OrgNode · User · InvoiceCompany · EmailQueue</text>
  <text x="296" y="575" fill="#a78bfa" font-size="7.5">Global Query Filter（软删除）· EF Core Migration</text>

  <!-- ===== Azure AD ===== -->
  <rect x="750" y="318" width="170" height="54" rx="8" fill="rgba(120,53,15,0.4)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="835" y="340" fill="white" font-size="10" font-weight="600" text-anchor="middle">☁️ Azure AD</text>
  <text x="835" y="356" fill="#94a3b8" font-size="8.5" text-anchor="middle">Microsoft Identity Platform</text>
  <text x="835" y="368" fill="#fbbf24" font-size="7.5" text-anchor="middle">M365 SSO · 生产环境</text>

  <!-- Arrow: .NET → Azure AD -->
  <line x1="720" y1="350" x2="750" y2="350" stroke="#fbbf24" stroke-width="1.2" marker-end="url(#arr-amber)"/>
  <text x="735" y="343" fill="#fbbf24" font-size="8">OAuth</text>

  <!-- ===== Azure Container App ===== -->
  <rect x="750" y="420" width="170" height="90" rx="8" fill="rgba(120,53,15,0.4)" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="835" y="442" fill="white" font-size="10" font-weight="600" text-anchor="middle">☁️ Azure Container App</text>
  <text x="835" y="460" fill="#94a3b8" font-size="8" text-anchor="middle">§8.1 部署</text>
  <text x="835" y="475" fill="#94a3b8" font-size="7.5" text-anchor="middle">前端: 静态资源/CDN</text>
  <text x="835" y="489" fill="#94a3b8" font-size="7.5" text-anchor="middle">后端: .NET Web API</text>
  <text x="835" y="503" fill="#fbbf24" font-size="7.5" text-anchor="middle">Kestrel · 端口5000</text>

  <!-- Arrow: .NET → Azure -->
  <line x1="720" y1="450" x2="750" y2="450" stroke="#fbbf24" stroke-width="1.2" marker-end="url(#arr-amber)"/>
  <text x="735" y="443" fill="#fbbf24" font-size="8">部署</text>

  <!-- ===== Email Service ===== -->
  <rect x="750" y="540" width="170" height="70" rx="8" fill="rgba(6,78,59,0.35)" stroke="#34d399" stroke-width="1.2"/>
  <text x="835" y="560" fill="#34d399" font-size="10" font-weight="600" text-anchor="middle">📧 邮件发送服务</text>
  <text x="835" y="577" fill="#94a3b8" font-size="8" text-anchor="middle">SMTP / SendGrid / Graph API</text>
  <text x="835" y="592" fill="#94a3b8" font-size="7.5" text-anchor="middle">定时任务轮询 EmailQueue</text>

  <!-- Arrow: EmailQueue → Email Service -->
  <line x1="620" y1="540" x2="750" y2="575" stroke="#34d399" stroke-width="1.2" marker-end="url(#arr-green)"/>
  <text x="670" y="555" fill="#34d399" font-size="8">轮询推送</text>

  <!-- ===== 定时服务 ===== -->
  <rect x="40" y="540" width="200" height="70" rx="8" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,3"/>
  <text x="140" y="560" fill="#fbbf24" font-size="10" font-weight="600" text-anchor="middle">⏰ 定时服务</text>
  <text x="140" y="577" fill="#94a3b8" font-size="8" text-anchor="middle">BackgroundService (.NET Hosted)</text>
  <text x="140" y="592" fill="#94a3b8" font-size="7.5" text-anchor="middle">EmailQueue 轮询推送（30s间隔）</text>
  <text x="140" y="605" fill="#fbbf24" font-size="7" text-anchor="middle">IHostedService 实现</text>

  <!-- Arrow: Timer → EmailQueue -->
  <line x1="240" y1="575" x2="280" y2="575" stroke="#fbbf24" stroke-width="1.2" marker-end="url(#arr-amber)"/>

  <!-- ===== 直线箭头: API层 → MySQL ===== -->
  <line x1="425" y1="496" x2="425" y2="512" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arr-violet)"/>
  <text x="440" y="505" fill="#a78bfa" font-size="8">Entity Framework Core</text>

  <!-- ===== 数据隔离层 ===== -->
  <rect x="40" y="318" width="180" height="200" rx="8" fill="rgba(30,41,59,0.4)" stroke="#94a3b8" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="54" y="336" fill="#94a3b8" font-size="9" font-weight="600">🔒 数据权限隔离层</text>
  <text x="54" y="353" fill="#94a3b8" font-size="8">§5 数据权限规则</text>
  <rect x="54" y="362" width="152" height="22" rx="4" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1"/>
  <text x="130" y="377" fill="#22d3ee" font-size="8" text-anchor="middle">品牌过滤（Brand字段）</text>
  <rect x="54" y="390" width="152" height="22" rx="4" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1"/>
  <text x="130" y="405" fill="#22d3ee" font-size="8" text-anchor="middle">团队过滤（OrgNode）</text>
  <rect x="54" y="418" width="152" height="22" rx="4" fill="rgba(136,19,55,0.35)" stroke="#fb7185" stroke-width="1"/>
  <text x="130" y="433" fill="#fb7185" font-size="8" text-anchor="middle">CEO: 全量无过滤</text>
  <rect x="54" y="446" width="152" height="22" rx="4" fill="rgba(76,29,149,0.35)" stroke="#a78bfa" stroke-width="1"/>
  <text x="130" y="461" fill="#a78bfa" font-size="8" text-anchor="middle">开票公司: 自由选择</text>
  <rect x="54" y="474" width="152" height="22" rx="4" fill="rgba(30,41,59,0.6)" stroke="#64748b" stroke-width="1"/>
  <text x="130" y="489" fill="#64748b" font-size="8" text-anchor="middle">软删除: IsDeleted过滤</text>

  <!-- Arrow: 权限层 → .NET -->
  <line x1="220" y1="418" x2="240" y2="418" stroke="#94a3b8" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="230" y="411" fill="#94a3b8" font-size="8">注入</text>

  <!-- ===== API Endpoints Section ===== -->
  <rect x="40" y="640" width="1020" height="120" rx="8" fill="rgba(6,78,59,0.08)" stroke="#34d399" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="54" y="658" fill="#34d399" font-size="9" font-weight="600">🔌 主要 API 端点 · §10</text>

  <!-- Auth -->
  <rect x="54" y="668" width="130" height="38" rx="5" fill="rgba(136,19,55,0.4)" stroke="#fb7185" stroke-width="1.2"/>
  <text x="119" y="685" fill="#fb7185" font-size="9" font-weight="600" text-anchor="middle">🔐 /api/auth</text>
  <text x="119" y="699" fill="#94a3b8" font-size="7.5" text-anchor="middle">login · logout · refresh</text>

  <!-- Forecast Periods -->
  <rect x="196" y="668" width="150" height="38" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="271" y="685" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">📅 /api/forecast-periods</text>
  <text x="271" y="699" fill="#94a3b8" font-size="7.5" text-anchor="middle">GET/POST/PUT/DELETE · CRUD</text>

  <!-- Forecast Records -->
  <rect x="358" y="668" width="150" height="38" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="433" y="685" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">📝 /api/forecast/records</text>
  <text x="433" y="699" fill="#94a3b8" font-size="7.5" text-anchor="middle">GET/POST/PUT · 草稿+提交</text>

  <!-- Approval Flow -->
  <rect x="520" y="668" width="150" height="38" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="595" y="685" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">✅ /api/approval-flow</text>
  <text x="595" y="699" fill="#94a3b8" font-size="7.5" text-anchor="middle">my · approve · reject · adjust</text>

  <!-- Basedata -->
  <rect x="682" y="668" width="150" height="38" rx="5" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1.2"/>
  <text x="757" y="685" fill="#22d3ee" font-size="9" font-weight="600" text-anchor="middle">🏢 /api/basedata/*</text>
  <text x="757" y="699" fill="#94a3b8" font-size="7.5" text-anchor="middle">customers · products · org-nodes</text>

  <!-- Email Queue -->
  <rect x="844" y="668" width="150" height="38" rx="5" fill="rgba(6,78,59,0.4)" stroke="#34d399" stroke-width="1.2"/>
  <text x="919" y="685" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">📧 /api/email-queue</text>
  <text x="919" y="699" fill="#94a3b8" font-size="7.5" text-anchor="middle">GET · Admin查看队列表</text>

  <!-- Import/Export -->
  <rect x="54" y="718" width="220" height="30" rx="5" fill="rgba(30,41,59,0.5)" stroke="#94a3b8" stroke-width="1"/>
  <text x="164" y="738" fill="#94a3b8" font-size="9" text-anchor="middle">📥 /api/forecast/template · /export · /import（Excel导入导出）</text>

  <!-- Dashboard -->
  <rect x="286" y="718" width="200" height="30" rx="5" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1"/>
  <text x="386" y="738" fill="#22d3ee" font-size="9" text-anchor="middle">📊 /api/dashboard · Auth header: Bearer JWT</text>

  <!-- ===== LEGEND ===== -->
  <text x="40" y="30" fill="white" font-size="10" font-weight="700">图例</text>
  <rect x="40" y="40" width="14" height="9" rx="2" fill="rgba(8,51,68,0.6)" stroke="#22d3ee" stroke-width="1.2"/>
  <text x="60" y="48" fill="#94a3b8" font-size="8">Frontend</text>
  <rect x="130" y="40" width="14" height="9" rx="2" fill="rgba(6,78,59,0.6)" stroke="#34d399" stroke-width="1.2"/>
  <text x="150" y="48" fill="#94a3b8" font-size="8">Backend / API</text>
  <rect x="230" y="40" width="14" height="9" rx="2" fill="rgba(76,29,149,0.5)" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="250" y="48" fill="#94a3b8" font-size="8">Database</text>
  <rect x="330" y="40" width="14" height="9" rx="2" fill="rgba(120,53,15,0.4)" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="350" y="48" fill="#94a3b8" font-size="8">Cloud / Azure</text>
  <rect x="440" y="40" width="14" height="9" rx="2" fill="rgba(136,19,55,0.5)" stroke="#fb7185" stroke-width="1.2"/>
  <text x="460" y="48" fill="#94a3b8" font-size="8">Security / Auth</text>
  <rect x="540" y="40" width="14" height="9" rx="2" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="560" y="48" fill="#94a3b8" font-size="8">Background Service</text>

</svg>
```

Sandvik Forecast Tool · 技术架构图 · PRD §8 技术架构 · v0.4



### 8.1 技术栈

- **前端：** Vue 3 + Ant Design Vue + Vite
- **后端：** .NET API
- **数据库：** MySQL
- **部署：** Azure Container App

### 8.2 系统 URL

- 前端：[http://localhost:3002](http://localhost:3002)
- 后端：[http://localhost:5000](http://localhost:5000)
- **健康检查端点：** `/health` — 前后端分离，单体API部署，实现此端点即可（Q62）

### 8.3 系统级规则

**邮件队列架构（Q55/Q56）：**

- 触发后**立即写入**待发送表（`email_queue_items`），邮件服务实时轮询推送
- **预渲染策略：** 提交时渲染好模板内容存入队列表，发送时直接发送已渲染内容，不再动态渲染
- 暂不考虑站内通知，仅邮件通知（Q57）

**统一错误码体系（Q59）：**

- 所有 API 错误统一使用 `AppException` 抛出，经 `AppExceptionMiddleware` 全局拦截
- 错误码分类：1xxx 通用错误 / 2xxx 业务错误 / 3xxx 数据错误 / 4xxx 认证错误
- 响应格式统一：`{ code, message, details }`，HTTP 状态码与错误码对应（4xx/5xx）
- 前端友好提示，技术实现统一处理

**审计日志（Q58）：**

- 记录所有操作（登录/增/删/改/查），按IT合规标准执行
- 仅管理员可查看操作日志

---

## 9. 数据模型

### 9.1 核心业务实体


| 实体                           | 说明                            |
| ---------------------------- | ----------------------------- |
| ForecastRecord               | 预测记录（金额、数量、月份）                |
| ForecastPeriod               | 预测周期（FC名称、填报时间窗口、预测月份范围、延期窗口） |
| ApprovalRequest              | 审批请求（含退回/调整历史）                |
| ApprovalHistory              | 审批历史记录（动作类型、4个总量值、comments）   |
| OrgNode                      | 组织架构节点（含销售业务属性）               |
| User                         | 用户账号（含Brand字段）                |
| Customer                     | 客户信息（含Brand字段）                |
| Product                      | 产品信息                          |
| InvoiceCompany               | 开票公司                          |
| UserInvoiceCompanyPermission | 用户-开票公司特别权限（跨部门配置）            |


### 9.2 数据库表（已知）

```sql
-- 预测记录（含4个度量字段，单价由系统自动计算）
forecast_records (id, forecast_period_id, customer_id, invoice_company_id,
                  product_id, year, month,
                  order_amount, invoice_amount,   -- 金额（圆）
                  order_qty, invoice_qty,       -- 数量
                  status,
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

**实体通用规则（Q42/Q43/Q44/Q45）：**

- **软删除（Q42）：** 所有基础数据（客户/产品/周期）均采用软删除（`is_deleted`），历史记录保留展示，物理删除仅限系统管理员在极端情况下操作
- **统一软删除拦截（Q45）：** EF Core `BaseEntity` 统一配置 `HasQueryFilter(is_deleted = 0)`，所有查询自动拦截软删除记录，无需每个查询点自写
- **审批历史关系（Q43）：** 一个 `ApprovalRequest` 对应多条 `ApprovalHistory`（多轮审批/退回每次都记录）
- **ApprovalHistory记录范围（Q44）：** 仅记录审批时间点、状态、操作人、评语，**不记录具体数据值**，无法做数据追溯或回滚

---

## 10. API 端点

> **与实现对账：** 当前仓库中实际路由与下表存在差异（例如基础数据多为 `api/basedata`、`api/org`，审批流仅部分实现）。详见 **§13**「实现与 PRD 差距清单」；迭代中建议以 OpenAPI/代码为准更新下表或增加「实际路由附录」。

### 7.1 认证


| 方法   | 路径               | 说明  |
| ---- | ---------------- | --- |
| POST | /api/auth/login  | 登录  |
| POST | /api/auth/logout | 登出  |


### 7.2 Dashboard


| 方法  | 路径                     | 说明       |
| --- | ---------------------- | -------- |
| GET | /api/dashboard/summary | 获取看板汇总数据 |


### 7.3 预测


| 方法   | 路径                       | 说明       |
| ---- | ------------------------ | -------- |
| GET  | /api/forecast/periods    | 获取预测周期列表 |
| GET  | /api/forecast/records    | 获取预测记录列表 |
| POST | /api/forecast/save-draft | 保存草稿     |
| POST | /api/forecast/submit     | 提交审批     |
| POST | /api/forecast/import     | 导入数据     |
| GET  | /api/forecast/export     | 导出数据     |


### 7.4 审批流程


| 方法   | 路径                                     | 说明                      |
| ---- | -------------------------------------- | ----------------------- |
| POST | /api/approval-flow/start               | 启动审批流程                  |
| GET  | /api/approval-flow/my                  | 获取我的待审批列表               |
| PUT  | /api/approval-flow/approve             | 审批通过                    |
| PUT  | /api/approval-flow/reject              | 审批驳回（附comments）         |
| PUT  | /api/approval-flow/adjust              | 审批调整（退回+4个总量值+comments） |
| GET  | /api/approval-flow/history/{requestId} | 获取审批历史记录                |


### 7.5 基础数据


| 方法  | 路径                     | 说明   |
| --- | ---------------------- | ---- |
| GET | /api/customers         | 客户列表 |
| GET | /api/products          | 产品列表 |
| GET | /api/org-nodes         | 组织架构 |
| GET | /api/invoice-companies | 开票公司 |


---

## 11. 认证与权限技术实现

> 本章节描述认证和权限的技术实现细节。业务功能描述（登录入口、用户账号管理、角色权限）见 §4.4.1 和 §5 数据权限规则。

### 11.1 登录方式

**生产环境（M365 SSO）：**

- Microsoft 365 企业账号 OAuth 2.0 / OpenID Connect
- 邮箱作为唯一身份标识，关联角色和区域
- 无独立密码，全部依赖 M365 认证
- **首次SSO登录：** M365账号必须在系统中提前建好账号才能登录，不自动创建

**开发环境（JWT）：**

- `ASPNETCORE_ENVIRONMENT=Development` 使用 JWT 本地登录
- 账号：[admin@sandvik.com](mailto:admin@sandvik.com) / Password123

**多设备互斥：**

- 用户Login时，将该用户其他活跃会话（`IsActive=true`）全部标记为`IsActive=false`
- 创建新的 `UserLoginSession` 记录，返回新 RefreshToken
- `POST /api/auth/refresh` 刷新会话，不创建新会话

### 11.2 用户账号技术字段

```sql
users (
  id,
  email,
  display_name,
  org_node_id,
  role,
  brand,
  password_hash,
  is_active,
  created_at, updated_at
)
```

### 11.3 审批链技术配置

```sql
approval_flow_node_configs (
  id,
  forecast_period_id,
  node_level,
  role,
  can_modify_data,
  send_email,
  email_template_id,
  created_at, updated_at
)
```

---

## 12. 产品数据管理技术

> 本章节描述产品数据的存储结构和技术实现。功能描述见 §4.3.2 和 §6 F-06。

### 12.1 产品数据库结构

```sql
ProductHierarchy (
  Id, ParentId, ProductLevel, ProductCode, ProductName,
  SortOrder, IsActive, IsDeleted, CreatedAt, UpdatedAt
)
```

### 12.2 8大产品线


| 编号  | 名称         |
| --- | ---------- |
| 1   | AH INSERT  |
| 2   | Kelite     |
| 3   | ROUND      |
| 4   | Regrinding |
| 5   | PCD        |
| 6   | Coating    |
| 7   | Medical    |
| 8   | Multiple   |


### 12.3 导入初始化

- 批量导入脚本：`docs/scripts/import_product_hierarchy.py`
- 策略：全量覆盖，流水号不变

---

## 13. 客户数据管理技术

> 本章节描述客户数据的存储结构和技术实现。功能描述见 §4.3.1 和 §6 F-05。

### 13.1 客户数据库结构

```sql
customers (
  id, name, brand, contact, phone,
  is_active, is_deleted, created_at, updated_at
)
```

### 13.2 品牌过滤技术

- 销售归属单一品牌（`users.brand`）
- 客户归属单一品牌（`customers.brand`）
- 过滤逻辑：`users.brand = customers.brand`
- **品牌过滤在后端查询层强制执行**，不可绕过

---

