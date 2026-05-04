# Sandvik Forecast Tool API 文档

## 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: Bearer Token (JWT)
- **所有请求需要 Authorization header**: `Authorization: Bearer <token>`

---

## 目录

1. [认证 Auth](#1-认证-auth)
2. [预测填报 Forecast](#2-预测填报-forecast)
3. [预测周期 ForecastPeriod](#3-预测周期-forecastperiod)
4. [基础数据 BaseData](#4-基础数据-basedata)
5. [审批流 ApprovalFlow](#5-审批流-approvalflow)
6. [邮件队列 EmailQueue](#6-邮件队列-emailqueue)
7. [仪表盘 Dashboard](#7-仪表盘-dashboard)
8. [权限管理 Permissions](#8-权限管理-permissions)
9. [消息模板 MessageTemplate](#9-消息模板-messagetemplate)
10. [系统管理 System](#10-系统管理-system)

---

## 1. 认证 Auth

### 1.1 登录

- **URL**: `POST /api/auth/login`
- **描述**: 用户登录，获取JWT令牌
- **认证**: 不需要
- **请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "string",
    "displayName": "string",
    "role": "string",
    "expiresAt": "2026-01-01T00:00:00Z"
  }
}
```

### 1.2 获取当前用户

- **URL**: `GET /api/auth/me`
- **描述**: 获取当前登录用户信息
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userName": "string",
    "displayName": "string",
    "email": "string",
    "role": "string",
    "isActive": true
  }
}
```

### 1.3 发起Microsoft SSO登录

- **URL**: `GET /api/auth/microsoft`
- **描述**: 发起Microsoft Azure AD SSO登录，重定向到Microsoft登录页面
- **认证**: 不需要
- **查询参数**:
  - `returnUrl` (可选): 登录后重定向URL
- **响应**: 重定向到Microsoft登录页面

### 1.4 Microsoft SSO回调

- **URL**: `POST /api/auth/microsoft/callback`
- **描述**: 前端获取授权码后调用此接口完成SSO登录
- **认证**: 不需要
- **请求体**:
```json
{
  "code": "string",
  "state": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "SSO登录成功",
  "data": {
    "token": "string",
    "displayName": "string",
    "role": "string",
    "expiresAt": "2026-01-01T00:00:00Z"
  },
  "returnUrl": "/dashboard"
}
```

---

## 2. 预测填报 Forecast

### 2.1 获取预测周期列表

- **URL**: `GET /api/forecast/periods`
- **描述**: 获取所有预测周期
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "fcName": "string",
      "fillTimeStart": "2026-01-01T00:00:00Z",
      "fillTimeEnd": "2026-01-31T00:00:00Z",
      "periodStartYearMonth": "2026-01",
      "periodEndYearMonth": "2026-12",
      "extensionStart": "2026-02-01T00:00:00Z",
      "extensionEnd": "2026-02-15T00:00:00Z",
      "extensionUsers": "[]",
      "status": "string",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 2.2 获取单个预测周期

- **URL**: `GET /api/forecast/periods/{id}`
- **描述**: 获取指定预测周期详情
- **认证**: 需要
- **路径参数**: `id` - 预测周期ID
- **响应**: 同上，单个对象

### 2.3 创建预测周期

- **URL**: `POST /api/forecast/periods`
- **描述**: 创建新的预测周期
- **认证**: 需要
- **请求体**:
```json
{
  "fcName": "string",
  "fillTimeStart": "2026-01-01T00:00:00Z",
  "fillTimeEnd": "2026-01-31T00:00:00Z",
  "periodStartYearMonth": "2026-01",
  "periodEndYearMonth": "2026-12",
  "extensionStart": "2026-02-01T00:00:00Z",
  "extensionEnd": "2026-02-15T00:00:00Z",
  "extensionUsers": "[]",
  "status": "Draft"
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* ForecastPeriod对象 */ }
}
```

### 2.4 获取预测记录列表

- **URL**: `GET /api/forecast/records`
- **描述**: 获取预测记录列表（根据用户角色过滤）
- **认证**: 需要
- **查询参数**:
  - `periodId` (可选): 预测周期ID
  - `year` (可选): 年份
  - `month` (可选): 月份
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "forecastPeriodId": "string",
      "customerId": "string",
      "invoiceCompanyId": "string",
      "productId": "string",
      "year": 2026,
      "month": 1,
      "orderQty": 100,
      "orderAmount": 50000.00,
      "invoiceQty": 50,
      "invoiceAmount": 25000.00,
      "status": "Draft",
      "notes": "string"
    }
  ]
}
```

### 2.5 获取我的预测记录

- **URL**: `GET /api/forecast/my`
- **描述**: 获取当前用户的预测记录
- **认证**: 需要
- **查询参数**: 同上
- **响应**: 同上

### 2.6 获取预测记录详情

- **URL**: `GET /api/forecast/detail/{id}`
- **描述**: 获取指定预测记录详情
- **认证**: 需要
- **路径参数**: `id` - 记录ID
- **响应**: 单个记录对象

### 2.7 创建预测记录

- **URL**: `POST /api/forecast/records`
- **描述**: 创建新的预测记录（四度量字段：OrderQty/OrderAmount/InvoiceQty/InvoiceAmount）
- **认证**: 需要
- **请求体**:
```json
{
  "forecastPeriodId": "string",
  "customerId": "string",
  "invoiceCompanyId": "string",
  "productId": "string",
  "year": 2026,
  "month": 1,
  "orderQty": 100,
  "orderAmount": 50000.00,
  "invoiceQty": 50,
  "invoiceAmount": 25000.00
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* ForecastRecord对象 */ }
}
```

### 2.8 更新预测记录

- **URL**: `PUT /api/forecast/records/{id}`
- **描述**: 更新指定预测记录
- **认证**: 需要
- **路径参数**: `id` - 记录ID
- **请求体**:
```json
{
  "orderQty": 100,
  "orderAmount": 50000.00,
  "invoiceQty": 50,
  "invoiceAmount": 25000.00,
  "notes": "string",
  "status": "Draft"
}
```
- **响应**: 更新后的记录对象

### 2.9 删除预测记录

- **URL**: `DELETE /api/forecast/records/{id}`
- **描述**: 删除指定预测记录（软删除）
- **认证**: 需要
- **路径参数**: `id` - 记录ID
- **响应**:
```json
{
  "success": true,
  "message": "Deleted"
}
```

### 2.10 下载导入模板

- **URL**: `GET /api/forecast/template`
- **描述**: 下载Excel导入模板
- **认证**: 需要
- **响应**: Excel文件 (.xlsx)

### 2.11 导出预测数据

- **URL**: `POST /api/forecast/export`
- **描述**: 导出预测数据为Excel
- **认证**: 需要
- **查询参数**:
  - `forecastPeriodId` (可选)
  - `year` (可选)
  - `customerId` (可选)
- **响应**: Excel文件 (.xlsx)

### 2.12 导入预测数据

- **URL**: `POST /api/forecast/import`
- **描述**: 从Excel文件导入预测数据
- **认证**: 需要
- **请求**: multipart/form-data，字段名 `file`
- **响应**:
```json
{
  "success": true,
  "created": 10,
  "updated": 5,
  "errors": []
}
```

### 2.13 批量保存草稿

- **URL**: `POST /api/forecast/save-draft`
- **描述**: 批量保存预测记录草稿
- **认证**: 需要
- **请求体**:
```json
{
  "periodId": "string",
  "records": [
    {
      "customerId": "string",
      "invoiceCompanyId": "string",
      "productId": "string",
      "year": 2026,
      "month": 1,
      "orderQty": 100,
      "orderAmount": 50000.00,
      "invoiceQty": 50,
      "invoiceAmount": 25000.00
    }
  ]
}
```
- **响应**:
```json
{
  "success": true,
  "savedCount": 10
}
```

### 2.14 提交预测

- **URL**: `POST /api/forecast/submit`
- **描述**: 提交预测记录进行审批
- **认证**: 需要
- **请求体**:
```json
{
  "periodId": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "submittedCount": 10
}
```

### 2.15 导出CSV

- **URL**: `GET /api/forecast/export`
- **描述**: 导出预测数据为CSV
- **认证**: 需要
- **查询参数**: `periodId` (可选)
- **响应**: CSV文件

### 2.16 JSON导入

- **URL**: `POST /api/forecast/import-json`
- **描述**: 通过JSON导入预测记录
- **认证**: 需要
- **请求体**:
```json
[
  {
    "forecastPeriodId": "string",
    "customerId": "string",
    "invoiceCompanyId": "string",
    "productId": "string",
    "year": 2026,
    "month": 1,
    "orderQty": 100,
    "orderAmount": 50000.00,
    "invoiceQty": 50,
    "invoiceAmount": 25000.00,
    "notes": "string"
  }
]
```
- **响应**:
```json
{
  "success": true,
  "importedCount": 10
}
```

---

## 3. 预测周期 ForecastPeriod

### 3.1 获取所有周期

- **URL**: `GET /api/forecast-periods`
- **描述**: 获取所有预测周期列表
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "fcName": "string",
      "fillTimeStart": "2026-01-01T00:00:00Z",
      "fillTimeEnd": "2026-01-31T00:00:00Z",
      "periodStartYearMonth": "2026-01",
      "periodEndYearMonth": "2026-12",
      "extensionStart": "2026-02-01T00:00:00Z",
      "extensionEnd": "2026-02-15T00:00:00Z",
      "extensionUsers": "[]",
      "status": "string",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 3.2 获取单个周期

- **URL**: `GET /api/forecast-periods/{id}`
- **描述**: 获取指定周期详情
- **认证**: 需要
- **路径参数**: `id` - 周期ID
- **响应**: 单个周期对象

### 3.3 创建周期

- **URL**: `POST /api/forecast-periods`
- **描述**: 创建新预测周期
- **认证**: 需要
- **请求体**:
```json
{
  "fcName": "string",
  "fillTimeStart": "2026-01-01T00:00:00Z",
  "fillTimeEnd": "2026-01-31T00:00:00Z",
  "periodStartYearMonth": "2026-01",
  "periodEndYearMonth": "2026-12",
  "extensionStart": "2026-02-01T00:00:00Z",
  "extensionEnd": "2026-02-15T00:00:00Z",
  "extensionUsers": "[]",
  "status": "Draft"
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* ForecastPeriod对象 */ }
}
```

### 3.4 更新周期

- **URL**: `PUT /api/forecast-periods/{id}`
- **描述**: 更新指定周期
- **认证**: 需要
- **路径参数**: `id` - 周期ID
- **请求体**: 同创建
- **响应**: 更新后的对象

### 3.5 删除周期

- **URL**: `DELETE /api/forecast-periods/{id}`
- **描述**: 删除指定周期（软删除）
- **认证**: 需要
- **路径参数**: `id` - 周期ID
- **响应**:
```json
{
  "success": true,
  "message": "Period deleted"
}
```

---

## 4. 基础数据 BaseData

### 4.1 客户管理 Customers

#### 4.1.1 获取客户列表

- **URL**: `GET /api/basedata/customers`
- **描述**: 获取客户列表（按品牌过滤）
- **认证**: 需要
- **查询参数**:
  - `status` (可选): `active` 或 `inactive`
  - `keyword` (可选): 搜索关键词
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "customerCode": "string",
      "customerName": "string",
      "region": "string",
      "brand": "Sandvik",
      "isActive": true
    }
  ]
}
```

#### 4.1.2 获取客户详情

- **URL**: `GET /api/basedata/customers/{id}`
- **描述**: 获取指定客户详情
- **认证**: 需要
- **路径参数**: `id` - 客户ID
- **响应**: 单个客户对象

#### 4.1.3 创建客户

- **URL**: `POST /api/basedata/customers`
- **描述**: 创建新客户
- **认证**: 需要
- **请求体**:
```json
{
  "code": "string",
  "name": "string",
  "region": "string",
  "brand": "Sandvik",
  "isActive": true
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* Customer对象 */ },
  "message": "Customer created"
}
```

#### 4.1.4 更新客户

- **URL**: `PUT /api/basedata/customers/{id}`
- **描述**: 更新指定客户
- **认证**: 需要
- **路径参数**: `id` - 客户ID
- **请求体**:
```json
{
  "name": "string",
  "code": "string",
  "region": "string",
  "brand": "string",
  "isActive": true
}
```
- **响应**: 更新后的对象

#### 4.1.5 删除客户

- **URL**: `DELETE /api/basedata/customers/{id}`
- **描述**: 删除指定客户
- **认证**: 需要
- **路径参数**: `id` - 客户ID
- **响应**:
```json
{
  "success": true,
  "message": "Customer deleted"
}
```

### 4.2 开票公司 Invoice Companies

#### 4.2.1 获取开票公司列表

- **URL**: `GET /api/basedata/invoicecompanies`
- **描述**: 获取开票公司列表
- **认证**: 需要
- **查询参数**:
  - `status` (可选): `active` 或 `inactive`
  - `keyword` (可选): 搜索关键词
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "companyCode": "string",
      "companyName": "string",
      "taxNumber": "string",
      "bankAccount": "string",
      "address": "string",
      "phone": "string",
      "isActive": true
    }
  ]
}
```

#### 4.2.2 获取开票公司详情

- **URL**: `GET /api/basedata/invoicecompanies/{id}`
- **描述**: 获取指定开票公司详情
- **认证**: 需要
- **路径参数**: `id` - 开票公司ID
- **响应**: 单个对象

#### 4.2.3 创建开票公司

- **URL**: `POST /api/basedata/invoicecompanies`
- **描述**: 创建新开票公司
- **认证**: 需要
- **请求体**:
```json
{
  "code": "string",
  "name": "string",
  "taxNumber": "string",
  "bankAccount": "string",
  "address": "string",
  "phone": "string",
  "isActive": true
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* InvoiceCompany对象 */ },
  "message": "Invoice company created"
}
```

#### 4.2.4 更新开票公司

- **URL**: `PUT /api/basedata/invoicecompanies/{id}`
- **描述**: 更新指定开票公司
- **认证**: 需要
- **路径参数**: `id` - 开票公司ID
- **请求体**: 同创建
- **响应**: 更新后的对象

#### 4.2.5 删除开票公司

- **URL**: `DELETE /api/basedata/invoicecompanies/{id}`
- **描述**: 删除指定开票公司
- **认证**: 需要
- **路径参数**: `id` - 开票公司ID
- **响应**:
```json
{
  "success": true,
  "message": "Invoice company deleted"
}
```

### 4.3 产品层级 Product Hierarchy (5级联动)

#### 4.3.1 获取L1产品（根级别）

- **URL**: `GET /api/products/levels/1`
- **描述**: 获取产品层级1（根级别）产品列表
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "productCode": "string",
      "productName": "string",
      "productLevel": 1,
      "parentId": null
    }
  ]
}
```

#### 4.3.2 获取子级产品

- **URL**: `GET /api/products/levels/{parentId}`
- **描述**: 获取指定父产品的子产品（用于L2-L5级联选择）
- **认证**: 需要
- **路径参数**: `parentId` - 父产品ID
- **响应**: 同上，子产品列表

### 4.4 产品管理 Products (BaseData)

#### 4.4.1 获取产品列表

- **URL**: `GET /api/basedata/products`
- **描述**: 获取产品列表
- **认证**: 需要
- **查询参数**:
  - `status` (可选): `active` 或 `inactive`
  - `pa` (可选): PA级别筛选
  - `keyword` (可选): 搜索关键词
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "productLevel": 1,
      "parentId": "string",
      "productCode": "string",
      "productName": "string",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

#### 4.4.2 获取产品详情

- **URL**: `GET /api/basedata/products/{id}`
- **描述**: 获取指定产品详情
- **认证**: 需要
- **路径参数**: `id` - 产品ID
- **响应**: 单个产品对象

#### 4.4.3 创建产品

- **URL**: `POST /api/basedata/products`
- **描述**: 创建新产品
- **认证**: 需要
- **请求体**:
```json
{
  "code": "string",
  "name": "string",
  "productLevel": 1,
  "parentId": "string",
  "sortOrder": 1,
  "isActive": true
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* ProductHierarchy对象 */ },
  "message": "Product created"
}
```

#### 4.4.4 更新产品

- **URL**: `PUT /api/basedata/products/{id}`
- **描述**: 更新指定产品
- **认证**: 需要
- **路径参数**: `id` - 产品ID
- **请求体**: 同创建
- **响应**: 更新后的对象

#### 4.4.5 删除产品

- **URL**: `DELETE /api/basedata/products/{id}`
- **描述**: 删除指定产品
- **认证**: 需要
- **路径参数**: `id` - 产品ID
- **响应**:
```json
{
  "success": true,
  "message": "Product deleted"
}
```

### 4.5 客户快捷接口 Customers (精简版)

#### 4.5.1 获取客户列表

- **URL**: `GET /api/customers`
- **描述**: 获取客户列表（精简版）
- **认证**: 需要
- **查询参数**:
  - `status` (可选)
  - `keyword` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [ /* Customer对象数组 */ ]
}
```

#### 4.5.2 获取客户详情

- **URL**: `GET /api/customers/{id}`
- **描述**: 获取指定客户详情
- **认证**: 需要
- **路径参数**: `id` - 客户ID
- **响应**: 单个客户对象

### 4.6 销售员 Salespersons

- **URL**: `GET /api/salespersons`
- **描述**: 获取销售员列表（角色为SALES的用户）
- **认证**: 需要
- **查询参数**:
  - `region` (可选)
  - `status` (可选)
  - `keyword` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "displayName": "string",
      "email": "string",
      "role": "SALES",
      "isActive": true,
      "region": null
    }
  ]
}
```

### 4.7 区域 Regions

- **URL**: `GET /api/regions`
- **描述**: 获取区域列表（从客户数据提取）
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "name": "string"
    }
  ]
}
```

### 4.8 组织节点 OrgNodes

#### 4.8.1 获取组织节点列表

- **URL**: `GET /api/org-nodes`
- **描述**: 获取组织节点列表
- **认证**: 需要
- **查询参数**:
  - `region` (可选)
  - `keyword` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "region": "string",
      "company": "string",
      "parentId": "string",
      "status": "active"
    }
  ]
}
```

#### 4.8.2 获取组织节点详情

- **URL**: `GET /api/org-nodes/{id}`
- **描述**: 获取指定组织节点详情
- **认证**: 需要
- **路径参数**: `id` - 节点ID
- **响应**: 单个节点对象

---

## 5. 审批流 ApprovalFlow

### 5.1 发起审批

- **URL**: `POST /api/approval-flow/start`
- **描述**: 发起预测数据审批流程
- **认证**: 需要
- **请求体**:
```json
{
  "forecastPeriodId": "string",
  "regionId": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "approvalId": 1
}
```

### 5.2 获取我的审批列表

- **URL**: `GET /api/approval-flow/my`
- **描述**: 获取当前用户发起的审批列表
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "forecastPeriodId": "string",
      "regionId": "string",
      "status": "Pending",
      "comments": "string"
    }
  ]
}
```

### 5.3 获取审批详情

- **URL**: `GET /api/approval-flow/{id}`
- **描述**: 获取指定审批详情（含历史记录）
- **认证**: 需要
- **路径参数**: `id` - 审批ID
- **响应**:
```json
{
  "success": true,
  "data": {
    "approval": { /* ApprovalRequest对象 */ },
    "histories": [ /* ApprovalHistory数组 */ ]
  }
}
```

### 5.4 获取审批历史

- **URL**: `GET /api/approval-flow/history/{id}`
- **描述**: 获取指定审批的历史记录
- **认证**: 需要
- **路径参数**: `id` - 审批ID
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "approvalRequestId": 1,
      "action": "SUBMIT",
      "operatorUserId": "string",
      "operatorName": "string",
      "operatedAt": "2026-01-01 12:00:00",
      "comments": "string",
      "adjustOrderAmount": null,
      "adjustInvoiceAmount": null,
      "adjustOrderQty": null,
      "adjustInvoiceQty": null
    }
  ]
}
```

### 5.5 提交审批

- **URL**: `POST /api/approval-flow/submit`
- **描述**: 提交审批
- **认证**: 需要
- **请求体**:
```json
{
  "approvalRequestId": 1,
  "comments": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "Submitted for approval"
}
```

### 5.6 审批通过

- **URL**: `POST /api/approval-flow/approve`
- **描述**: 审批通过
- **认证**: 需要
- **请求体**:
```json
{
  "approvalRequestId": 1,
  "comments": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "Approved"
}
```

### 5.7 审批驳回

- **URL**: `POST /api/approval-flow/reject`
- **描述**: 审批驳回
- **认证**: 需要
- **请求体**:
```json
{
  "approvalRequestId": 1,
  "comments": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "Rejected"
}
```

### 5.8 数据调整

- **URL**: `POST /api/approval-flow/adjust`
- **描述**: 审批过程中调整数据
- **认证**: 需要
- **请求体**:
```json
{
  "approvalRequestId": 1,
  "comments": "string",
  "adjustOrderAmount": 1000.00,
  "adjustInvoiceAmount": 500.00,
  "adjustOrderQty": 10,
  "adjustInvoiceQty": 5
}
```
- **响应**:
```json
{
  "success": true,
  "message": "Adjusted"
}
```

---

## 6. 邮件队列 EmailQueue

### 6.1 获取邮件队列列表

- **URL**: `GET /api/email-queue`
- **描述**: 获取邮件队列列表（分页）
- **认证**: 需要 (Admin/SYS_ADMIN角色)
- **查询参数**:
  - `page` (可选，默认1)
  - `pageSize` (可选，默认20)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "toEmail": "string",
      "ccEmail": "string",
      "subject": "string",
      "body": "string",
      "status": "Pending",
      "retryCount": 0,
      "createdAt": "2026-01-01 12:00:00",
      "sentAt": null,
      "errorMessage": null
    }
  ],
  "total": 100
}
```

### 6.2 重发邮件

- **URL**: `POST /api/email-queue/{id}/resend`
- **描述**: 重发指定邮件
- **认证**: 需要 (Admin/SYS_ADMIN角色)
- **路径参数**: `id` - 邮件队列项ID
- **响应**:
```json
{
  "success": true,
  "message": "Email queued for resend"
}
```

### 6.3 发送邮件（直接）

- **URL**: `POST /api/email/send`
- **描述**: 直接发送邮件
- **认证**: 不需要
- **请求体**:
```json
{
  "to": "string",
  "subject": "string",
  "body": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "Email sent"
}
```

---

## 7. 仪表盘 Dashboard

### 7.1 获取仪表盘摘要

- **URL**: `GET /api/dashboard/summary`
- **描述**: 获取仪表盘数据摘要
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": {
    "currentPeriodName": "2026年1月",
    "currentPeriodTime": "2026-01-01 ~ 2026-01-31",
    "monthly": [
      {
        "periodId": "string",
        "periodName": "string",
        "amount": 100000.00
      }
    ],
    "regions": [
      {
        "name": "string",
        "amount": 50000.00
      }
    ],
    "productLines": [
      {
        "name": "string",
        "amount": 30000.00
      }
    ],
    "industries": [
      {
        "name": "string",
        "amount": 20000.00
      }
    ],
    "customers": [
      {
        "id": "string",
        "name": "string",
        "amount": 15000.00
      }
    ],
    "invoiceCompanies": [
      {
        "id": "string",
        "name": "string",
        "amount": 10000.00
      }
    ],
    "totalAmount": 100000.00,
    "recordCount": 50,
    "pendingTotal": 10,
    "pendingDirector": 5,
    "pendingFinance": 3
  }
}
```

---

## 8. 权限管理 Permissions

### 8.1 获取我的开票公司权限

- **URL**: `GET /api/permissions/invoice-companies`
- **描述**: 获取当前用户的开票公司权限列表
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "companyCode": "string",
      "companyName": "string",
      "permissionType": "ALL"
    }
  ]
}
```

### 8.2 获取指定用户的开票公司权限

- **URL**: `GET /api/permissions/invoice-companies/{userId}`
- **描述**: 获取指定用户的开票公司权限
- **认证**: 需要
- **路径参数**: `userId` - 用户ID
- **响应**: 同上

### 8.3 获取开票公司的预测记录

- **URL**: `GET /api/permissions/invoice-companies/{companyId}/forecast-records`
- **描述**: 获取指定开票公司的预测记录
- **认证**: 需要
- **路径参数**: `companyId` - 开票公司ID
- **查询参数**:
  - `periodId` (可选)
  - `year` (可选)
  - `month` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [ /* ForecastRecord数组 */ ]
}
```

### 8.4 获取开票公司汇总

- **URL**: `GET /api/permissions/invoice-companies/{companyId}/summary`
- **描述**: 获取指定开票公司的数据汇总
- **认证**: 需要
- **路径参数**: `companyId` - 开票公司ID
- **响应**:
```json
{
  "success": true,
  "data": {
    "invoiceCompanyId": "string",
    "invoiceCompanyName": "string",
    "totalOrderAmount": 100000.00,
    "totalInvoiceAmount": 50000.00,
    "totalOrderQty": 100,
    "totalInvoiceQty": 50,
    "recordCount": 20,
    "pendingCount": 5,
    "byStatus": [
      {
        "status": "Draft",
        "count": 10,
        "amount": 50000.00
      }
    ]
  }
}
```

### 8.5 获取所有权限记录

- **URL**: `GET /api/admin/permissions/invoice-company`
- **描述**: 获取所有开票公司权限记录（管理员）
- **认证**: 需要 (SYS_ADMIN/ADMIN)
- **查询参数**:
  - `userId` (可选)
  - `companyId` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": "string",
      "userName": "string",
      "userEmail": "string",
      "invoiceCompanyId": "string",
      "invoiceCompanyName": "string",
      "permissionType": "VIEW_SUBMIT",
      "effectiveFrom": "2026-01-01T00:00:00Z",
      "effectiveTo": null,
      "grantedBy": "string",
      "createdAt": "2026-01-01T00:00:00Z",
      "revokedAt": null
    }
  ]
}
```

### 8.6 授予权限

- **URL**: `POST /api/admin/permissions/invoice-company`
- **描述**: 授予用户开票公司权限
- **认证**: 需要 (SYS_ADMIN/ADMIN)
- **请求体**:
```json
{
  "userId": "string",
  "invoiceCompanyId": "string",
  "permissionType": "VIEW_SUBMIT",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Permission granted"
  }
}
```

### 8.7 撤销权限

- **URL**: `DELETE /api/admin/permissions/invoice-company/{id}`
- **描述**: 撤销指定权限
- **认证**: 需要 (SYS_ADMIN/ADMIN)
- **路径参数**: `id` - 权限记录ID
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Permission revoked"
  }
}
```

### 8.8 更新权限

- **URL**: `PUT /api/admin/permissions/invoice-company/{id}`
- **描述**: 更新指定权限
- **认证**: 需要 (SYS_ADMIN/ADMIN)
- **路径参数**: `id` - 权限记录ID
- **请求体**:
```json
{
  "permissionType": "VIEW_APPROVE",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": "2026-12-31T00:00:00Z"
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Permission updated"
  }
}
```

---

## 9. 消息模板 MessageTemplate

### 9.1 获取模板列表

- **URL**: `GET /api/message-templates`
- **描述**: 获取消息模板列表
- **认证**: 需要 (SYS_ADMIN角色)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "string",
      "subject": "string",
      "body": "string",
      "placeholders": "string",
      "isActive": true,
      "createdAt": "2026-01-01 12:00:00"
    }
  ]
}
```

### 9.2 获取模板详情

- **URL**: `GET /api/message-templates/{id}`
- **描述**: 获取指定模板详情
- **认证**: 需要 (SYS_ADMIN角色)
- **路径参数**: `id` - 模板ID
- **响应**: 单个模板对象

### 9.3 创建模板

- **URL**: `POST /api/message-templates`
- **描述**: 创建新消息模板
- **认证**: 需要 (SYS_ADMIN角色)
- **请求体**:
```json
{
  "name": "string",
  "subject": "string",
  "body": "string",
  "placeholders": "string",
  "isActive": false
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* MessageTemplate对象 */ }
}
```

### 9.4 更新模板

- **URL**: `PUT /api/message-templates/{id}`
- **描述**: 更新指定模板
- **认证**: 需要 (SYS_ADMIN角色)
- **路径参数**: `id` - 模板ID
- **请求体**: 同创建
- **响应**: 更新后的对象

### 9.5 删除模板

- **URL**: `DELETE /api/message-templates/{id}`
- **描述**: 删除指定模板
- **认证**: 需要 (SYS_ADMIN角色)
- **路径参数**: `id` - 模板ID
- **响应**:
```json
{
  "success": true,
  "message": "Template deleted"
}
```

### 9.6 激活模板

- **URL**: `PUT /api/message-templates/{id}/activate`
- **描述**: 激活指定模板（同时停用其他模板）
- **认证**: 需要 (SYS_ADMIN角色)
- **路径参数**: `id` - 模板ID
- **响应**:
```json
{
  "success": true,
  "message": "Template activated"
}
```

---

## 10. 系统管理 System

### 10.1 用户管理 UsersController

#### 10.1.1 获取用户列表

- **URL**: `GET /api/users`
- **描述**: 获取用户列表
- **认证**: 需要
- **查询参数**:
  - `role` (可选)
  - `status` (可选): `enabled` 或 `disabled`
  - `keyword` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userName": "string",
      "displayName": "string",
      "email": "string",
      "role": "string",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### 10.1.2 获取用户详情

- **URL**: `GET /api/users/{id}`
- **描述**: 获取指定用户详情
- **认证**: 需要
- **路径参数**: `id` - 用户ID
- **响应**: 单个用户对象

#### 10.1.3 创建用户

- **URL**: `POST /api/users`
- **描述**: 创建新用户
- **认证**: 需要
- **请求体**:
```json
{
  "account": "string",
  "name": "string",
  "email": "string",
  "role": "SALES",
  "password": "string",
  "region": "string",
  "status": "enabled"
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* User对象 */ },
  "message": "User created"
}
```

#### 10.1.4 更新用户

- **URL**: `PUT /api/users/{id}`
- **描述**: 更新指定用户
- **认证**: 需要
- **路径参数**: `id` - 用户ID
- **请求体**: 同创建
- **响应**: 更新后的对象

#### 10.1.5 删除用户

- **URL**: `DELETE /api/users/{id}`
- **描述**: 删除指定用户（软删除-停用）
- **认证**: 需要
- **路径参数**: `id` - 用户ID
- **响应**:
```json
{
  "success": true,
  "message": "User deactivated"
}
```

#### 10.1.6 切换用户状态

- **URL**: `POST /api/users/{id}/toggle-status`
- **描述**: 启用/禁用用户
- **认证**: 需要
- **路径参数**: `id` - 用户ID
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "isActive": true
  },
  "message": "User enabled"
}
```

### 10.2 组织管理 OrgController

#### 10.2.1 获取组织结构图

- **URL**: `GET /api/org/chart`
- **描述**: 获取组织结构图数据
- **认证**: 需要
- **查询参数**:
  - `region` (可选)
  - `keyword` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "type": "sales",
      "region": "",
      "company": "",
      "parentId": null,
      "status": "active",
      "children": []
    }
  ]
}
```

#### 10.2.2 获取组织成员

- **URL**: `GET /api/org/members`
- **描述**: 获取组织成员列表
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "managerId": null,
      "managerName": null
    }
  ]
}
```

#### 10.2.3 获取组织树

- **URL**: `GET /api/org/tree`
- **描述**: 获取组织树结构
- **认证**: 需要
- **查询参数**:
  - `region` (可选)
  - `keyword` (可选)
- **响应**: 同chart接口

#### 10.2.4 创建组织节点

- **URL**: `POST /api/org/nodes`
- **描述**: 创建新组织节点（用户）
- **认证**: 需要
- **请求体**:
```json
{
  "name": "string",
  "email": "string",
  "type": "sales",
  "region": "string",
  "company": "string",
  "parentId": "string",
  "status": "active"
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* Node对象 */ },
  "message": "Node created"
}
```

#### 10.2.5 更新组织节点

- **URL**: `PUT /api/org/nodes/{id}`
- **描述**: 更新指定组织节点
- **认证**: 需要
- **路径参数**: `id` - 节点ID
- **请求体**:
```json
{
  "name": "string",
  "email": "string",
  "type": "sales",
  "region": "string",
  "status": "active"
}
```
- **响应**: 更新后的对象

#### 10.2.6 删除组织节点

- **URL**: `DELETE /api/org/nodes/{id}`
- **描述**: 删除指定组织节点（软删除）
- **认证**: 需要
- **路径参数**: `id` - 节点ID
- **响应**:
```json
{
  "success": true,
  "message": "Node deleted"
}
```

### 10.3 日志管理 LogsController

#### 10.3.1 获取系统日志

- **URL**: `GET /api/logs/system`
- **描述**: 获取系统操作日志
- **认证**: 需要
- **查询参数**:
  - `page` (可选，默认1)
  - `pageSize` (可选，默认20)
  - `keyword` (可选)
  - `startDate` (可选)
  - `endDate` (可选)
  - `type` (可选)
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "action": "string",
      "type": "string",
      "module": "string",
      "details": "string",
      "ipAddress": "string",
      "createdAt": "2026-01-01 12:00:00",
      "success": true
    }
  ],
  "total": 100
}
```

#### 10.3.2 获取登录日志

- **URL**: `GET /api/logs/login`
- **描述**: 获取用户登录日志
- **认证**: 需要
- **查询参数**:
  - `page` (可选)
  - `pageSize` (可选)
  - `keyword` (可选)
  - `startDate` (可选)
  - `endDate` (可选)
  - `success` (可选): true/false
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "account": "string",
      "email": "string",
      "loginTime": "2026-01-01 12:00:00",
      "ip": "string",
      "status": "success",
      "success": true,
      "browser": "string",
      "failReason": null,
      "createdAt": "2026-01-01 12:00:00"
    }
  ],
  "total": 100,
  "successCount": 90,
  "failCount": 10
}
```

#### 10.3.3 删除系统日志

- **URL**: `DELETE /api/logs/system/{id}`
- **描述**: 删除指定系统日志
- **认证**: 需要
- **路径参数**: `id` - 日志ID
- **响应**:
```json
{
  "success": true,
  "message": "System log deleted"
}
```

#### 10.3.4 删除登录日志

- **URL**: `DELETE /api/logs/login/{id}`
- **描述**: 删除指定登录日志
- **认证**: 需要
- **路径参数**: `id` - 日志ID
- **响应**:
```json
{
  "success": true,
  "message": "Login log deleted"
}
```

### 10.4 数据初始化 SeedController

#### 10.4.1 重置用户

- **URL**: `POST /api/seed/reset-users`
- **描述**: 重置所有用户密码为Password123，并创建种子数据
- **认证**: 不需要
- **响应**:
```json
{
  "success": true,
  "message": "已创建/更新 11 个用户，密码均为 Password123"
}
```

### 10.5 版本管理 VersionsController

#### 10.5.1 获取版本列表

- **URL**: `GET /api/versions`
- **描述**: 获取预测版本列表（内存存储）
- **认证**: 需要
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "v1",
      "versionNumber": "2026FC3",
      "versionName": "2026年第三季度预测",
      "description": "2026 Q3 Forecast",
      "status": "open",
      "createdBy": "admin",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### 10.5.2 获取版本详情

- **URL**: `GET /api/versions/{id}`
- **描述**: 获取指定版本详情
- **认证**: 需要
- **路径参数**: `id` - 版本ID
- **响应**: 单个版本对象

#### 10.5.3 创建版本

- **URL**: `POST /api/versions`
- **描述**: 创建新预测版本
- **认证**: 需要
- **请求体**:
```json
{
  "versionNumber": "string",
  "versionName": "string",
  "description": "string",
  "status": "open"
}
```
- **响应**:
```json
{
  "success": true,
  "data": { /* Version对象 */ },
  "message": "Version created"
}
```

#### 10.5.4 更新版本

- **URL**: `PUT /api/versions/{id}`
- **描述**: 更新指定版本
- **认证**: 需要
- **路径参数**: `id` - 版本ID
- **请求体**: 同创建
- **响应**: 更新后的对象

#### 10.5.5 删除版本

- **URL**: `DELETE /api/versions/{id}`
- **描述**: 删除指定版本
- **认证**: 需要
- **路径参数**: `id` - 版本ID
- **响应**:
```json
{
  "success": true,
  "message": "Version deleted"
}
```

---

## 附录：角色说明

| 角色代码 | 说明 |
|---------|------|
| SYS_ADMIN | 系统管理员 |
| CEO | 首席执行官 |
| FINANCE_MANAGER | 财务经理 |
| VP_SALES | 销售副总裁 |
| REGION_DIRECTOR | 区域总监 |
| DIRECTOR | 总监 |
| MANAGER | 经理 |
| SALES | 销售 |

## 附录：预测记录状态

| 状态 | 说明 |
|------|------|
| Draft | 草稿 |
| Submitted | 已提交 |
| Approved | 已审批 |
| Rejected | 已驳回 |
| Adjusted | 已调整 |

---

*文档生成时间: 2026-05-04*
