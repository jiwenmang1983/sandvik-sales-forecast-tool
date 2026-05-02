-- =============================================================================
-- SFT Project Test Data Seed Script
-- Database: sandvik_forecast
-- =============================================================================

USE sandvik_forecast;

-- =============================================================================
-- 1. CUSTOMERS (at least 5)
-- =============================================================================
INSERT INTO Customers (Id, CustomerCode, CustomerName, CustomerNameEn, Region, SalesPersonId, IsActive, CreatedAt, UpdatedAt, IsDeleted) VALUES
('c00001-0000-0000-0000-000000000001', 'CUST001', '上海机械设备有限公司', 'Shanghai Machinery Co., Ltd', '华东大区', '0000000a-0000-0000-0000-00000000000a', 1, NOW(), NOW(), 0),
('c00002-0000-0000-0000-000000000002', 'CUST002', '北京工业科技有限公司', 'Beijing Industrial Tech Co., Ltd', '华北区域', '0000000a-0000-0000-0000-00000000000a', 1, NOW(), NOW(), 0),
('c00003-0000-0000-0000-000000000003', 'CUST003', '广州精密制造有限公司', 'Guangzhou Precision Manufacturing', '华南大区', '00000009-0000-0000-0000-000000000009', 1, NOW(), NOW(), 0),
('c00004-0000-0000-0000-000000000004', 'CUST004', '深圳智能装备有限公司', 'Shenzhen Smart Equipment Co., Ltd', '华南大区', '00000009-0000-0000-0000-000000000009', 1, NOW(), NOW(), 0),
('c00005-0000-0000-0000-000000000005', 'CUST005', '成都机械进出口公司', 'Chengdu Machinery Import/Export', '西部区域', '0000000a-0000-0000-0000-00000000000a', 1, NOW(), NOW(), 0),
('c00006-0000-0000-0000-000000000006', 'CUST006', '武汉重型机械集团', 'Wuhan Heavy Machinery Group', '华中区域', '0000000b-0000-0000-0000-00000000000b', 1, NOW(), NOW(), 0),
('c00007-0000-0000-0000-000000000007', 'CUST007', '天津港机重工有限公司', 'Tianjin Port Machinery Co., Ltd', '华北区域', '0000000b-0000-0000-0000-00000000000b', 1, NOW(), NOW(), 0);

-- =============================================================================
-- 2. INVOICE COMPANIES (at least 3)
-- =============================================================================
INSERT INTO InvoiceCompanies (Id, CompanyCode, CompanyName, TaxNumber, BankAccount, Address, Phone, IsActive, CreatedAt, UpdatedAt, IsDeleted) VALUES
('i00001-0000-0000-0000-000000000001', 'INV001', '山特维克国际贸易（上海）有限公司', '91310000MA1F5XXXX', '6222021234567890', '上海市浦东新区张江高科技园区', '021-12345678', 1, NOW(), NOW(), 0),
('i00002-0000-0000-0000-000000000002', 'INV002', '山特维克刀具（廊坊）有限公司', '91131000MA09XXXX', '6222029876543210', '河北省廊坊市经济技术开发区', '0316-8765432', 1, NOW(), NOW(), 0),
('i00003-0000-0000-0000-000000000003', 'INV003', '山特维克矿山工程机械（中国）有限公司', '91310000MA1G7YYYY', '6222025555666677', '江苏省昆山市经济技术开发区', '0512-5555666', 1, NOW(), NOW(), 0);

-- =============================================================================
-- 3. PRODUCT HIERARCHY - PA Products (at least 5 PA level)
-- =============================================================================
INSERT INTO ProductHierarchy (Id, ProductLevel, ParentId, ProductCode, ProductName, SortOrder, IsActive, CreatedAt, UpdatedAt, IsDeleted) VALUES
-- Level 1: PA products
('p00001-0000-0000-0000-000000000001', 1, NULL, 'PA01', '刀具产品线 (Machining Solutions)', 1, 1, NOW(), NOW(), 0),
('p00002-0000-0000-0000-000000000002', 1, NULL, 'PA02', '矿山产品线 (Mining)', 2, 1, NOW(), NOW(), 0),
('p00003-0000-0000-0000-000000000003', 1, NULL, 'PA03', '建筑产品线 (Construction)', 3, 1, NOW(), NOW(), 0),
('p00004-0000-0000-0000-000000000004', 1, NULL, 'PA04', '工程材料 (Tooling)', 4, 1, NOW(), NOW(), 0),
('p00005-0000-0000-0000-000000000005', 1, NULL, 'PA05', '数字制造 (Digital Manufacturing)', 5, 1, NOW(), NOW(), 0);

-- Level 2: SubPA products under PA01
INSERT INTO ProductHierarchy (Id, ProductLevel, ParentId, ProductCode, ProductName, SortOrder, IsActive, CreatedAt, UpdatedAt, IsDeleted) VALUES
('p00011-0000-0000-0000-000000000001', 2, 'p00001-0000-0000-0000-000000000001', 'PA01-01', '铣削刀具 (Milling)', 1, 1, NOW(), NOW(), 0),
('p00012-0000-0000-0000-000000000002', 2, 'p00001-0000-0000-0000-000000000001', 'PA01-02', '车削刀具 (Turning)', 2, 1, NOW(), NOW(), 0),
('p00013-0000-0000-0000-000000000003', 2, 'p00001-0000-0000-0000-000000000001', 'PA01-03', '钻孔刀具 (Drilling)', 3, 1, NOW(), NOW(), 0);

-- =============================================================================
-- 4. FORECAST PERIODS (at least 2, status "进行中"/Active)
-- =============================================================================
INSERT INTO ForecastPeriods (Id, PeriodYear, PeriodMonth, PeriodType, StartDate, EndDate, Status, SubmitDeadline, ApproveDeadline, CreatedAt, UpdatedAt, IsDeleted) VALUES
('fp00001-0000-0000-0000-000000000001', 2026, 5, 'Monthly', '2026-05-01', '2026-05-31', 'Active', '2026-05-25', '2026-05-28', NOW(), NOW(), 0),
('fp00002-0000-0000-0000-000000000002', 2026, 6, 'Monthly', '2026-06-01', '2026-06-30', 'Active', '2026-06-25', '2026-06-28', NOW(), NOW(), 0),
('fp00003-0000-0000-0000-000000000003', 2026, 7, 'Monthly', '2026-07-01', '2026-07-31', 'Draft', '2026-07-25', '2026-07-28', NOW(), NOW(), 0),
('fp00004-0000-0000-0000-000000000004', 2026, 3, 'Quarterly', '2026-03-01', '2026-03-31', 'Closed', '2026-03-25', '2026-03-28', NOW(), NOW(), 0);

-- =============================================================================
-- 5. FORECAST RECORDS (multiple per period with different statuses)
-- Period 1 (May 2026) - Active status
-- =============================================================================
INSERT INTO ForecastRecords (Id, ForecastPeriodId, CustomerId, InvoiceCompanyId, ProductId, CreatedByUserId, Year, Month, Amount, Currency, Status, Notes, CreatedAt, UpdatedAt, IsDeleted) VALUES
('fr00001-0000-0000-0000-000000000001', 'fp00001-0000-0000-0000-000000000001', 'c00001-0000-0000-0000-000000000001', 'i00001-0000-0000-0000-000000000001', 'p00001-0000-0000-0000-000000000001', '0000000a-0000-0000-0000-00000000000a', 2026, 5, 1500000.00, 'CNY', 'Draft', '上海机械5月预测', NOW(), NOW(), 0),
('fr00002-0000-0000-0000-000000000002', 'fp00001-0000-0000-0000-000000000001', 'c00002-0000-0000-0000-000000000002', 'i00001-0000-0000-0000-000000000001', 'p00001-0000-0000-0000-000000000001', '0000000a-0000-0000-0000-00000000000a', 2026, 5, 850000.00, 'CNY', 'Submitted', '北京工业5月预测', NOW(), NOW(), 0),
('fr00003-0000-0000-0000-000000000003', 'fp00001-0000-0000-0000-000000000001', 'c00003-0000-0000-0000-000000000003', 'i00002-0000-0000-0000-000000000002', 'p00002-0000-0000-0000-000000000002', '00000009-0000-0000-0000-000000000009', 2026, 5, 2200000.00, 'CNY', 'Submitted', '广州精密5月预测', NOW(), NOW(), 0),
('fr00004-0000-0000-0000-000000000004', 'fp00001-0000-0000-0000-000000000001', 'c00004-0000-0000-0000-000000000004', 'i00002-0000-0000-0000-000000000002', 'p00003-0000-0000-0000-000000000003', '00000009-0000-0000-0000-000000000009', 2026, 5, 1200000.00, 'CNY', 'Approved', '深圳智能5月预测', NOW(), NOW(), 0),
('fr00005-0000-0000-0000-000000000005', 'fp00001-0000-0000-0000-000000000001', 'c00005-0000-0000-0000-000000000005', 'i00003-0000-0000-0000-000000000003', 'p00004-0000-0000-0000-000000000004', '0000000a-0000-0000-0000-00000000000a', 2026, 5, 650000.00, 'CNY', 'Draft', '成都机械5月预测', NOW(), NOW(), 0);

-- Period 2 (June 2026) - Active status
INSERT INTO ForecastRecords (Id, ForecastPeriodId, CustomerId, InvoiceCompanyId, ProductId, CreatedByUserId, Year, Month, Amount, Currency, Status, Notes, CreatedAt, UpdatedAt, IsDeleted) VALUES
('fr00006-0000-0000-0000-000000000001', 'fp00002-0000-0000-0000-000000000002', 'c00001-0000-0000-0000-000000000001', 'i00001-0000-0000-0000-000000000001', 'p00001-0000-0000-0000-000000000001', '0000000a-0000-0000-0000-00000000000a', 2026, 6, 1800000.00, 'CNY', 'Draft', '上海机械6月预测', NOW(), NOW(), 0),
('fr00007-0000-0000-0000-000000000002', 'fp00002-0000-0000-0000-000000000002', 'c00002-0000-0000-0000-000000000002', 'i00001-0000-0000-0000-000000000001', 'p00005-0000-0000-0000-000000000005', '0000000a-0000-0000-0000-00000000000a', 2026, 6, 950000.00, 'CNY', 'Draft', '北京工业6月预测', NOW(), NOW(), 0),
('fr00008-0000-0000-0000-000000000003', 'fp00002-0000-0000-0000-000000000002', 'c00006-0000-0000-0000-000000000006', 'i00003-0000-0000-0000-000000000003', 'p00002-0000-0000-0000-000000000002', '0000000b-0000-0000-0000-00000000000b', 2026, 6, 2800000.00, 'CNY', 'Submitted', '武汉重工6月预测', NOW(), NOW(), 0),
('fr00009-0000-0000-0000-000000000004', 'fp00002-0000-0000-0000-000000000002', 'c00007-0000-0000-0000-000000000007', 'i00002-0000-0000-0000-000000000002', 'p00003-0000-0000-0000-000000000003', '0000000b-0000-0000-0000-00000000000b', 2026, 6, 1100000.00, 'CNY', 'Approved', '天津港机6月预测', NOW(), NOW(), 0);

-- Period 3 (July 2026) - Draft status
INSERT INTO ForecastRecords (Id, ForecastPeriodId, CustomerId, InvoiceCompanyId, ProductId, CreatedByUserId, Year, Month, Amount, Currency, Status, Notes, CreatedAt, UpdatedAt, IsDeleted) VALUES
('fr00010-0000-0000-0000-000000000001', 'fp00003-0000-0000-0000-000000000003', 'c00001-0000-0000-0000-000000000001', 'i00001-0000-0000-0000-000000000001', 'p00001-0000-0000-0000-000000000001', '0000000a-0000-0000-0000-00000000000a', 2026, 7, 2000000.00, 'CNY', 'Draft', '上海机械7月预测', NOW(), NOW(), 0),
('fr00011-0000-0000-0000-000000000002', 'fp00003-0000-0000-0000-000000000003', 'c00003-0000-0000-0000-000000000003', 'i00002-0000-0000-0000-000000000002', 'p00002-0000-0000-0000-000000000002', '00000009-0000-0000-0000-000000000009', 2026, 7, 2500000.00, 'CNY', 'Draft', '广州精密7月预测', NOW(), NOW(), 0);

-- =============================================================================
-- 6. APPROVALS (pending and partial approvals)
-- =============================================================================
-- Record fr00002 (北京工业, May) - 1/3 approved
INSERT INTO Approvals (Id, ForecastRecordId, ApproverUserId, Level, Result, Comment, ApprovedAt, CreatedAt, UpdatedAt, IsDeleted) VALUES
('ap00001-0000-0000-0000-000000000001', 'fr00002-0000-0000-0000-000000000002', '0000000b-0000-0000-0000-00000000000b', 'L1', 'Approved', '数据核实无误', NOW(), NOW(), NOW(), 0),
('ap00002-0000-0000-0000-000000000002', 'fr00002-0000-0000-0000-000000000002', '00000004-0000-0000-0000-000000000004', 'L2', 'Pending', NULL, NULL, NOW(), NOW(), 0);

-- Record fr00003 (广州精密, May) - 2/3 approved
INSERT INTO Approvals (Id, ForecastRecordId, ApproverUserId, Level, Result, Comment, ApprovedAt, CreatedAt, UpdatedAt, IsDeleted) VALUES
('ap00003-0000-0000-0000-000000000001', 'fr00003-0000-0000-0000-000000000003', '0000000b-0000-0000-0000-00000000000b', 'L1', 'Approved', '区域总监审核通过', NOW(), NOW(), NOW(), 0),
('ap00004-0000-0000-0000-000000000002', 'fr00003-0000-0000-0000-000000000003', '00000004-0000-0000-0000-000000000004', 'L2', 'Approved', '财务审核通过', NOW(), NOW(), NOW(), 0);

-- Record fr00008 (武汉重工, June) - 0/3 pending
INSERT INTO Approvals (Id, ForecastRecordId, ApproverUserId, Level, Result, Comment, ApprovedAt, CreatedAt, UpdatedAt, IsDeleted) VALUES
('ap00005-0000-0000-0000-000000000001', 'fr00008-0000-0000-0000-000000000003', '0000000b-0000-0000-0000-00000000000b', 'L1', 'Pending', NULL, NULL, NOW(), NOW(), 0);

-- Record fr00004 (深圳智能, May) - fully approved (3/3)
INSERT INTO Approvals (Id, ForecastRecordId, ApproverUserId, Level, Result, Comment, ApprovedAt, CreatedAt, UpdatedAt, IsDeleted) VALUES
('ap00006-0000-0000-0000-000000000001', 'fr00004-0000-0000-0000-000000000004', '0000000b-0000-0000-0000-00000000000b', 'L1', 'Approved', '区域审核通过', NOW(), NOW(), NOW(), 0),
('ap00007-0000-0000-0000-000000000002', 'fr00004-0000-0000-0000-000000000004', '00000004-0000-0000-0000-000000000004', 'L2', 'Approved', '财务审核通过', NOW(), NOW(), NOW(), 0);

-- Record fr00009 (天津港机, June) - fully approved
INSERT INTO Approvals (Id, ForecastRecordId, ApproverUserId, Level, Result, Comment, ApprovedAt, CreatedAt, UpdatedAt, IsDeleted) VALUES
('ap00008-0000-0000-0000-000000000001', 'fr00009-0000-0000-0000-000000000004', '0000000b-0000-0000-0000-00000000000b', 'L1', 'Approved', '区域审核通过', NOW(), NOW(), NOW(), 0),
('ap00009-0000-0000-0000-000000000002', 'fr00009-0000-0000-0000-000000000004', '00000004-0000-0000-0000-000000000004', 'L2', 'Approved', '财务审核通过', NOW(), NOW(), NOW(), 0);

-- =============================================================================
-- Verification queries
-- =============================================================================
SELECT 'Customers:' as '', COUNT(*) as Count FROM Customers;
SELECT 'InvoiceCompanies:' as '', COUNT(*) as Count FROM InvoiceCompanies;
SELECT 'Products (PA Level):' as '', COUNT(*) as Count FROM ProductHierarchy WHERE ProductLevel = 1;
SELECT 'ForecastPeriods:' as '', COUNT(*) as Count FROM ForecastPeriods;
SELECT 'ForecastRecords:' as '', COUNT(*) as Count FROM ForecastRecords;
SELECT 'Approvals:' as '', COUNT(*) as Count FROM Approvals;
