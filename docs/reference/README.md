# Sandvik Forecast Tool

销售预测工具 - 用于管理 Sandvik 产品销售预测、审批流程和数据分析。

## 项目简介

Sandvik Forecast Tool 是一个企业级销售预测管理系统，支持多用户协作、预测数据录入、审批流程和可视化分析。

## 技术栈

### 后端
- **.NET 8 SDK** - 主要开发框架
- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core 8** - ORM
- **Pomelo.EntityFrameworkCore.MySql** - MySQL 数据库支持
- **Redis (StackExchange.Redis)** - 缓存层
- **Serilog** - 日志记录
- **JWT Bearer** - 身份认证

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 构建工具
- **Ant Design Vue 4** - UI 组件库
- **Axios** - HTTP 客户端
- **ECharts 5** - 数据可视化
- **Vue Router 4** - 路由管理

### 数据存储
- **MySQL 8.0** - 主数据库
- **Redis** - 缓存和会话存储

## 本地开发环境要求

- .NET 8 SDK
- Node.js 18+
- npm 9+
- MySQL 8.0
- Redis Server

## 快速开始

### 1. 安装依赖

```bash
# .NET 后端
cd backend
dotnet restore

# Vue 前端
cd frontend
npm install
```

### 2. 配置数据库

确保 MySQL 服务运行中，并创建数据库：

```sql
CREATE DATABASE sandvik_forecast CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 启动服务

```bash
# 启动后端 API (端口 5000)
cd backend/src/SandvikForecast.Api
dotnet run

# 启动前端开发服务器 (端口 3000)
cd frontend
npm run dev
```

### 4. 访问应用

- 前端: http://localhost:3000
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

## 项目结构

```
SandvikForecastTool/
├── backend/                 # .NET 后端
│   ├── src/
│   │   ├── SandvikForecast.Api/        # Web API 项目
│   │   ├── SandvikForecast.Core/       # 核心业务逻辑
│   │   └── SandvikForecast.Infrastructure/  # 数据访问/基础设施
│   └── tests/
│       └── SandvikForecast.Tests/      # 单元测试
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   ├── api/            # API 调用
│   │   └── router/          # 路由配置
│   └── package.json
├── docs/                   # 开发文档
└── scripts/                # 辅助脚本
```