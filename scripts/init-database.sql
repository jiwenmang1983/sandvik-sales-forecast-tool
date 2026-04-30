-- ================================================
-- Sandvik Forecast Tool - 数据库初始化脚本
-- ================================================

USE sandvik_forecast;

-- ================================================
-- 1. 创建测试用户 (密码: Password123)
-- SHA256("Password123") -> Base64
-- ================================================

INSERT INTO Users (Id, UserName, PasswordHash, DisplayName, Email, Role, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES
('00000001-0000-0000-0000-000000000001', 'admin', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', '系统管理员', 'admin@sandvik.com', 'SYS_ADMIN', 1, NOW(), NOW(), 0),
('00000002-0000-0000-0000-000000000002', 'sales_dir', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', '张总监', 'director@sandvik.com', 'SALES_DIRECTOR', 1, NOW(), NOW(), 0),
('00000003-0000-0000-0000-000000000003', 'region_dir', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', '李区域总监', 'region@sandvik.com', 'REGION_DIRECTOR', 1, NOW(), NOW(), 0),
('00000004-0000-0000-0000-000000000004', 'finance', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', '王财务', 'finance@sandvik.com', 'FINANCE_MANAGER', 1, NOW(), NOW(), 0),
('00000005-0000-0000-0000-000000000005', 'sales_wang', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', '王销售', 'wang@sandvik.com', 'SALES', 1, NOW(), NOW(), 0),
('00000006-0000-0000-0000-000000000006', 'sales_li', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', '李销售', 'li@sandvik.com', 'SALES', 1, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE DisplayName=VALUES(DisplayName);

-- ================================================
-- 2. 创建客户
-- ================================================

INSERT INTO Customers (Id, CustomerCode, CustomerName, CustomerNameEn, Region, SalesPersonId, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES
('C0000001-0000-0000-0000-000000000001', 'CUST001', '三一重工', 'SANY Heavy Industry', '华东', '00000005-0000-0000-0000-000000000005', 1, NOW(), NOW(), 0),
('C0000002-0000-0000-0000-000000000002', 'CUST002', '中联重科', 'Zoomlion', '华东', '00000005-0000-0000-0000-000000000005', 1, NOW(), NOW(), 0),
('C0000003-0000-0000-0000-000000000003', 'CUST003', '徐工集团', 'XCMG', '华北', '00000006-0000-0000-0000-000000000006', 1, NOW(), NOW(), 0),
('C0000004-0000-0000-0000-000000000004', 'CUST004', '广西柳工', 'Guangxi Liugong', '华南', '00000006-0000-0000-0000-000000000006', 1, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE CustomerName=VALUES(CustomerName);

-- ================================================
-- 3. 创建开票公司
-- ================================================

INSERT INTO InvoiceCompanies (Id, CompanyCode, CompanyName, TaxNumber, BankAccount, Address, Phone, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES
('I0000001-0000-0000-0000-000000000001', 'INV001', '山特维克（中国）投资有限公司', '91310000X0725008XK', '123456789012345678', '上海市浦东新区', '021-12345678', 1, NOW(), NOW(), 0),
('I0000002-0000-0000-0000-000000000002', 'INV002', '山特维克矿山与建筑技术（中国）有限公司', '9131000078955627XK', '987654321098765432', '北京市朝阳区', '010-87654321', 1, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE CompanyName=VALUES(CompanyName);

-- ================================================
-- 4. 创建产品层级 (PA -> Sub PA-1 -> Sub PA-2 -> SKU)
-- ================================================

INSERT INTO ProductHierarchy (Id, ProductLevel, ParentId, ProductCode, ProductName, SortOrder, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES
-- Level 1: PA
('P0000001-0000-0000-0000-000000000001', 1, NULL, 'PA-MINING', '采矿设备', 1, 1, NOW(), NOW(), 0),
('P0000002-0000-0000-0000-000000000002', 1, NULL, 'PA-CONST', '建筑设备', 2, 1, NOW(), NOW(), 0),
-- Level 2: Sub PA-1
('P0000003-0000-0000-0000-000000000003', 2, 'P0000001-0000-0000-0000-000000000001', 'SPA1-DRILL', '钻探设备', 1, 1, NOW(), NOW(), 0),
('P0000004-0000-0000-0000-000000000004', 2, 'P0000001-0000-0000-0000-000000000001', 'SPA1-LOAD', '装载设备', 2, 1, NOW(), NOW(), 0),
('P0000005-0000-0000-0000-000000000005', 2, 'P0000002-0000-0000-0000-000000000002', 'SPA1-CRUSH', '破碎设备', 1, 1, NOW(), NOW(), 0),
-- Level 3: Sub PA-2
('P0000006-0000-0000-0000-000000000006', 3, 'P0000003-0000-0000-0000-000000000003', 'SPA2-HYD', '液压钻机', 1, 1, NOW(), NOW(), 0),
('P0000007-0000-0000-0000-000000000007', 3, 'P0000003-0000-0000-0000-000000000003', 'SPA2-PNEU', '气动钻机', 2, 1, NOW(), NOW(), 0),
('P0000008-0000-0000-0000-000000000008', 3, 'P0000004-0000-0000-0000-000000000004', 'SPA2-LD-LG', '大型装载机', 1, 1, NOW(), NOW(), 0),
-- Level 4: SKU
('P0000009-0000-0000-0000-000000000009', 4, 'P0000006-0000-0000-0000-000000000006', 'SKU-HD100', 'HD100液压钻机', 1, 1, NOW(), NOW(), 0),
('P0000010-0000-0000-0000-000000000010', 4, 'P0000006-0000-0000-0000-000000000006', 'SKU-HD200', 'HD200液压钻机', 2, 1, NOW(), NOW(), 0),
('P0000011-0000-0000-0000-000000000011', 4, 'P0000008-0000-0000-0000-000000000008', 'SKU-LD500', 'LD500装载机', 1, 1, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE ProductName=VALUES(ProductName);

-- ================================================
-- 5. 创建预测周期
-- ================================================

INSERT INTO ForecastPeriods (Id, PeriodYear, PeriodMonth, PeriodType, StartDate, EndDate, Status, CreatedAt, UpdatedAt, IsDeleted)
VALUES
('F0000001-0000-0000-0000-000000000001', 2025, 5, 'Monthly', '2025-05-01', '2025-05-31', 'Draft', NOW(), NOW(), 0),
('F0000002-0000-0000-0000-000000000002', 2025, 6, 'Monthly', '2025-06-01', '2025-06-30', 'Draft', NOW(), NOW(), 0),
('F0000003-0000-0000-0000-000000000003', 2025, 7, 'Monthly', '2025-07-01', '2025-07-31', 'Draft', NOW(), NOW(), 0),
('F0000004-0000-0000-0000-000000000004', 2025, 4, 'Quarterly', '2025-04-01', '2025-06-30', 'Approved', NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE Status=VALUES(Status);

-- ================================================
-- 6. 创建预测数据（示例）
-- ================================================

INSERT INTO ForecastRecords (Id, ForecastPeriodId, CustomerId, InvoiceCompanyId, ProductId, CreatedByUserId, Year, Month, Amount, Currency, Status, CreatedAt, UpdatedAt, IsDeleted)
VALUES
('R0000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000001', 'C0000001-0000-0000-0000-000000000001', 'I0000001-0000-0000-0000-000000000001', 'P0000009-0000-0000-0000-000000000009', '00000005-0000-0000-0000-000000000005', 2025, 5, 1500000.00, 'CNY', 'Draft', NOW(), NOW(), 0),
('R0000002-0000-0000-0000-000000000002', 'F0000001-0000-0000-0000-000000000001', 'C0000002-0000-0000-0000-000000000002', 'I0000001-0000-0000-0000-000000000001', 'P0000010-0000-0000-0000-000000000010', '00000005-0000-0000-0000-000000000005', 2025, 5, 2300000.00, 'CNY', 'Draft', NOW(), NOW(), 0),
('R0000003-0000-0000-0000-000000000003', 'F0000001-0000-0000-0000-000000000001', 'C0000003-0000-0000-0000-000000000003', 'I0000002-0000-0000-0000-000000000002', 'P0000011-0000-0000-0000-000000000011', '00000006-0000-0000-0000-000000000006', 2025, 5, 3500000.00, 'CNY', 'Draft', NOW(), NOW(), 0),
('R0000004-0000-0000-0000-000000000004', 'F0000002-0000-0000-0000-000000000002', 'C0000001-0000-0000-0000-000000000001', 'I0000001-0000-0000-0000-000000000001', 'P0000009-0000-0000-0000-000000000009', '00000005-0000-0000-0000-000000000005', 2025, 6, 1800000.00, 'CNY', 'Draft', NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE Amount=VALUES(Amount);

-- ================================================
-- 验证查询
-- ================================================

SELECT 'Users' AS tbl, COUNT(*) AS cnt FROM Users
UNION ALL SELECT 'Customers', COUNT(*) FROM Customers
UNION ALL SELECT 'InvoiceCompanies', COUNT(*) FROM InvoiceCompanies
UNION ALL SELECT 'ProductHierarchy', COUNT(*) FROM ProductHierarchy
UNION ALL SELECT 'ForecastPeriods', COUNT(*) FROM ForecastPeriods
UNION ALL SELECT 'ForecastRecords', COUNT(*) FROM ForecastRecords;
