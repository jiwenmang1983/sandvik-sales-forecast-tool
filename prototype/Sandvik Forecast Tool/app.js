const moduleData = {
  "组织架构": "维护销售组织、区域与汇报关系，支持后续预测聚合统计。",
  "客户信息": "管理客户主数据、行业标签与信用信息，支持预测维度分析。",
  "产品库": "维护 SKU 主数据和可售状态，支撑销售预测引用。",
  "数据字典": "维护大区、开票公司、业绩归属等字典项，保证业务口径一致。",
  销售填报预测填报: "销售人员按月展开填报视图提交预测，同一维度下每个月份一行，支持按年月筛选。",
  "销售预测审核": "区域负责人对下级预测进行审核、驳回与调整。",
  Dashboard: "自动汇总各层级预测数据，并通过看板展示趋势与差异。",
  "分析报表": "按业务口径输出预测报表，支持 Excel/PDF 导出。",
  "预测周期管理": "维护预测周期名称、销售预测周期、填报与延期填报时间、延期人员范围。",
  "用户账号管理": "管理员维护用户档案、组织映射和启停状态。",
  "角色和权限管理": "按角色配置菜单权限、数据权限和操作权限。",
  "系统登录日志": "记录登录来源、认证结果与设备信息，满足审计要求。",
  "系统操作日志": "记录关键操作明细，支持检索和追踪。",
  "审批流程配置": "配置分级审批链路与代理规则。",
  "多AD登录": "支持多个 Active Directory 域登录与账号映射。",
  "审核节点邮件通知": "审批节点自动邮件提醒，支持超时催办。",
  "AD账号同步": "定期同步 AD 组织和账号，减少人工维护。",
  "缓存刷新": "按模块刷新缓存，保证配置与数据实时生效。",
  "数据备份和清理": "执行定期备份与历史数据清理策略。"
};

const menuGroups = [
  {
    group: "销售预测管理",
    items: ["Dashboard", "销售填报预测填报", "销售预测审核", "分析报表"]
  },
  {
    group: "基础数据管理",
    items: ["组织架构", "客户信息", "产品库", "数据字典"]
  },
  {
    group: "系统管理",
    items: ["用户账号管理", "角色和权限管理", "预测周期管理", "系统登录日志", "系统操作日志", "审批流程配置"]
  }
];

const state = {
  domain: "",
  userId: "",
  userAccount: "",
  userRoleId: "SALES",
  activeModule: "欢迎页",
  role: "Sales",
  dashboardMetricMode: "order",
  dashboardPaDrillParent: "",
  dashboardMonthStart: "",
  dashboardMonthEnd: "",
  forecastViewMode: "compact",
  approvalSummaryMode: "customer",
  selectedApprovalId: "",
  pendingApprovalAction: "",
  editingFcVersionId: "",
  editingBaseRowId: "",
  forecast: {
    period: "2026FC1",
    months: ["Jan", "Feb", "Mar", "Apr"],
    approval: "draft",
    readOnly: false
  }
};

const FORECAST_MONTHLY_MODULE = "销售填报预测填报";
const FORECAST_MODULE_LEGACY = "销售预测填报";
const FORECAST_MONTHLY_MODULE_LEGACY = "销售预测填报（按月）";

let currentUserName = "Mark Ji";

const roleDefs = [
  { id: "SALES", name: "销售人员", level: 1 },
  { id: "REGION_DIRECTOR", name: "区域总监", level: 2 },
  { id: "SALES_DIRECTOR", name: "销售总监", level: 3 },
  { id: "GM", name: "总经理", level: 4 },
  { id: "FINANCE_MANAGER", name: "财务主管", level: 5 },
  { id: "SYS_ADMIN", name: "系统管理员", level: 99 }
];
const roleNameById = Object.fromEntries(roleDefs.map((r) => [r.id, r.name]));

const customerMaster = [
  "昆山智造装备有限公司",
  "苏州精工模具科技",
  "无锡锐虎机械制造",
  "常州高精汽车零部件",
  "宁波海越航空部件",
  "嘉兴联成精密工业",
  "上海博远自动化",
  "重庆川虎机电",
  "武汉华创数控",
  "天津北辰重工",
  "青岛远航船舶部件",
  "东莞智鼎医疗器械",
  "合肥新锐能源设备",
  "深圳高维电子制造",
  "成都天府轨道装备"
];

const invoiceMaster = [
  { invoice: "苏州阿诺医疗器械有限公司", performance: "苏州销售部", region: "苏州销售部" },
  { invoice: "苏州阿诺医疗科技有限公司", performance: "东部销售大区-苏州", region: "东部销售大区" },
  { invoice: "苏州百锐纳米科技有限公司", performance: "东部销售大区-杭州", region: "南部销售大区" },
  { invoice: "常熟阿诺切削工具有限公司", performance: "南部销售大区-业务一组", region: "常熟阿诺" },
  { invoice: "天津吉恒纳米科技有限公司", performance: "北部销售大区-北京", region: "苏州迈拓" },
  { invoice: "广东吉恒纳米科技有限公司", performance: "西部销售大区-重庆", region: "新加坡阿诺" },
  { invoice: "武汉阿诺精密工具有限公司", performance: "科而诺", region: "科而诺" },
  { invoice: "合肥阿诺精密工具有限公司", performance: "苏州北部", region: "常熟万克" },
  { invoice: "重庆阿诺威尔刀具有限公司", performance: "西部销售大区-重庆", region: "常熟刀克" }
];

const directorSalesMap = {
  "李华东": ["张伟", "李娜", "王强", "赵敏"],
  "陈志远": ["孙磊", "周婷", "吴昊", "郑楠"],
  "刘晓峰": ["钱坤", "冯宇", "蒋宁", "邓琳"]
};

const salesToDirector = {};
Object.entries(directorSalesMap).forEach(([director, salesList]) => {
  salesList.forEach((sales) => {
    salesToDirector[sales] = director;
  });
});

/** 演示用：业绩归属、销售大区下拉全集（可与开票公司默认映射联动，用户可改选） */
const performanceOptions = [
  "苏州销售部",
  "东部销售大区-苏州",
  "东部销售大区-杭州",
  "东部销售大区-合肥",
  "东部销售大区-宁波",
  "南部销售大区-业务一组",
  "南部销售大区-业务二组",
  "南部销售大区-武汉",
  "西部销售大区-重庆",
  "北部销售大区-济南",
  "北部销售大区-北京",
  "苏州市市场部",
  "科而诺",
  "常熟万克",
  "吉恒",
  "常熟阿诺",
  "医疗",
  "苏州亚狮",
  "新加坡阿诺",
  "苏州北部"
];

const regionOptions = [
  "苏州销售部",
  "东部销售大区",
  "南部销售大区",
  "西部销售大区",
  "北部销售大区",
  "常熟阿诺",
  "苏州亚狮",
  "苏州市市场部",
  "新加坡阿诺",
  "常熟万克",
  "苏州迈拓",
  "科而诺",
  "常熟刀克"
];

const productHierarchy = {
  Holemaking: {
    "整体硬质合金钻头": {
      "3xD": {
        "通用钢件": ["PVD-A", "PVD-B", ...Array.from({ length: 120 }, (_, idx) => `PVD-${String(idx + 1).padStart(3, "0")}`)],
        "不锈钢": ["PVD-S", "PVD-HS"]
      },
      "5xD": {
        "通用钢件": ["PVD-A", "PVD-B"],
        "铸铁": ["CVD-CI", "CVD-CI Plus"]
      }
    },
    "可转位钻头": {
      "U钻系列": {
        "浅孔加工": ["双刃片", "四刃片"],
        "深孔加工": ["中心刃加强", "外刃加强"]
      },
      "冠钻系列": {
        "高精度孔": ["冠部A", "冠部B"],
        "高进给孔": ["冠部HF", "冠部HF+"]
      }
    },
    "铰刀": {
      "整体铰刀": {
        "H7公差": ["直槽", "螺旋槽"],
        "高硬材料": ["微刃口", "纳米涂层"]
      }
    }
  },
  Milling: {
    "立铣刀": {
      "方肩铣": {
        "通用加工": ["4刃", "6刃"],
        "高速加工": ["高螺旋", "可变螺旋"]
      },
      "高进给铣": {
        "粗加工": ["大前角", "抗冲击"],
        "半精加工": ["小切深", "高齿密"]
      }
    },
    "面铣刀盘": {
      "45度主偏角": {
        "粗加工": ["双面刀片", "重切削"],
        "精加工": ["修光刃", "低振动"]
      }
    },
    "槽铣刀": {
      "T型槽刀": {
        "标准槽": ["窄槽", "宽槽"],
        "深槽": ["加长颈", "高刚性"]
      }
    }
  },
  Turning: {
    "外圆车刀": {
      "负前角刀杆": {
        "钢件精车": ["CNMG", "WNMG"],
        "铸铁粗车": ["SNMG", "TNMG"]
      },
      "正前角刀杆": {
        "不锈钢": ["VCGT", "DCGT"],
        "有色金属": ["抛光刃", "镜面刃"]
      }
    },
    "切槽切断刀": {
      "外圆切槽": {
        "2mm槽宽": ["PVD槽刀片", "CVD槽刀片"],
        "3mm槽宽": ["PVD槽刀片", "耐热槽刀片"]
      },
      "切断刀": {
        "棒料切断": ["抗震刀杆", "高压冷却"],
        "薄壁件": ["小刃口", "低进给"]
      }
    }
  },
  Threading: {
    "丝锥": {
      "机用螺旋丝锥": {
        "M3-M8": ["HSS-E", "粉末冶金"],
        "M10-M16": ["高韧性", "高耐磨"]
      },
      "挤压丝锥": {
        "铝合金": ["无屑成形", "镜面槽"],
        "不锈钢": ["强化圆弧", "高润滑槽"]
      }
    },
    "车削螺纹刀": {
      "外螺纹": {
        "60度公制": ["单牙型", "全牙型"],
        "55度英制": ["Whitworth", "UN"]
      },
      "内螺纹": {
        "小孔径": ["微型杆", "抗振杆"],
        "深孔径": ["加长杆", "减振杆"]
      }
    }
  },
  ToolingSystem: {
    "刀柄系统": {
      "液压刀柄": {
        "标准夹持": ["HSK-A63", "BT40"],
        "高跳动精度": ["2.5D", "5D"]
      },
      "热缩刀柄": {
        "高速主轴": ["HSK-E40", "HSK-E32"],
        "通用主轴": ["BT30", "BT40"]
      }
    },
    "镗刀系统": {
      "粗镗刀": {
        "孔径20-60": ["模块式", "一体式"],
        "孔径60-120": ["重载型", "高刚型"]
      },
      "精镗刀": {
        "微调结构": ["2微米级", "5微米级"],
        "自动补偿": ["机械补偿", "数字补偿"]
      }
    }
  }
};

const productMaster = Object.fromEntries(
  Object.entries(productHierarchy).map(([pa, sub1Map]) => [pa, Object.keys(sub1Map)])
);

const basicDataModules = new Set(["组织架构", "客户信息", "产品库", "数据字典"]);
const systemModules = new Set(["用户账号管理", "角色和权限管理", "系统登录日志", "系统操作日志"]);
let baseRowSeed = 1;
const baseDataStores = {};

const forecastRows = [];

const STORAGE_KEYS = {
  users: "sft.users",
  rolePermissions: "sft.rolePermissions",
  loginLogs: "sft.loginLogs",
  opLogs: "sft.opLogs"
};

let userRecords = [];
let rolePermissions = {};
let loginLogRecords = [];
let opLogRecords = [];

const loginView = document.getElementById("login-view");
const mainView = document.getElementById("main-view");
const currentDomainTag = document.getElementById("current-domain-tag");
const activeModule = document.getElementById("active-module");
const moduleTitle = document.getElementById("module-title");
const moduleDesc = document.getElementById("module-desc");
const roleValue = document.getElementById("role-value");
const flowValue = document.getElementById("flow-value");
const periodValue = document.getElementById("period-value");
const periodWindowLabel = document.getElementById("period-window-label");
const menuTree = document.getElementById("menu-tree");
const infoDialog = document.getElementById("info-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogContent = document.getElementById("dialog-content");
const overviewHero = document.getElementById("overview-hero");
const overviewDashboard = document.getElementById("overview-dashboard");
const systemWorkbench = document.getElementById("system-workbench");
const systemTitle = document.getElementById("system-title");
const systemDesc = document.getElementById("system-desc");
const userMgmtPage = document.getElementById("user-mgmt-page");
const rolePermissionPage = document.getElementById("role-permission-page");
const loginLogPage = document.getElementById("login-log-page");
const opLogPage = document.getElementById("op-log-page");
const userKeywordInput = document.getElementById("user-keyword");
const userRoleFilter = document.getElementById("user-role-filter");
const userStatusFilter = document.getElementById("user-status-filter");
const userAddBtn = document.getElementById("user-add-btn");
const userRefreshBtn = document.getElementById("user-refresh-btn");
const userTableHead = document.getElementById("user-table-head");
const userTableBody = document.getElementById("user-table-body");
const permissionRoleSelect = document.getElementById("permission-role-select");
const permissionSaveBtn = document.getElementById("permission-save-btn");
const permissionResetBtn = document.getElementById("permission-reset-btn");
const permissionTableHead = document.getElementById("permission-table-head");
const permissionTableBody = document.getElementById("permission-table-body");
const loginLogUserInput = document.getElementById("login-log-user");
const loginLogResultSelect = document.getElementById("login-log-result");
const loginLogDateStart = document.getElementById("login-log-date-start");
const loginLogDateEnd = document.getElementById("login-log-date-end");
const loginLogExportBtn = document.getElementById("login-log-export-btn");
const loginLogClearBtn = document.getElementById("login-log-clear-btn");
const loginLogHead = document.getElementById("login-log-head");
const loginLogBody = document.getElementById("login-log-body");
const opLogModuleSelect = document.getElementById("op-log-module");
const opLogUserInput = document.getElementById("op-log-user");
const opLogActionInput = document.getElementById("op-log-action");
const opLogDateStart = document.getElementById("op-log-date-start");
const opLogDateEnd = document.getElementById("op-log-date-end");
const opLogExportBtn = document.getElementById("op-log-export-btn");
const opLogClearBtn = document.getElementById("op-log-clear-btn");
const opLogHead = document.getElementById("op-log-head");
const opLogBody = document.getElementById("op-log-body");
const forecastWorkbench = document.getElementById("forecast-workbench");
const forecastPeriods = document.getElementById("forecast-periods");
const periodsBody = document.getElementById("periods-body");
const periodStatusFilter = document.getElementById("period-status-filter");
const periodKeyword = document.getElementById("period-keyword");
const periodResetBtn = document.getElementById("period-reset-btn");
const backToPeriods = document.getElementById("back-to-periods");
const downloadTemplateBtn = document.getElementById("download-template-btn");
const downloadDataBtn = document.getElementById("download-data-btn");
const uploadBtn = document.getElementById("upload-btn");
const uploadInput = document.getElementById("upload-input");
const queryBtn = document.getElementById("query-btn");
const resetQueryBtn = document.getElementById("reset-query-btn");
const addRowBtn = document.getElementById("add-row-btn");
const copyLastPeriodBtn = document.getElementById("copy-last-period-btn");
const customerFilter = document.getElementById("customer-filter");
const invoiceFilter = document.getElementById("invoice-filter");
const performanceFilter = document.getElementById("performance-filter");
const regionFilter = document.getElementById("region-filter");
const paFilter = document.getElementById("pa-filter");
const subPa1Filter = document.getElementById("subpa1-filter");
const subPa2Filter = document.getElementById("subpa2-filter");
const subPa3Filter = document.getElementById("subpa3-filter");
const subPa4Filter = document.getElementById("subpa4-filter");
const forecastBody = document.getElementById("forecast-body");
const forecastMessage = document.getElementById("forecast-message");
const forecastHead = document.getElementById("forecast-head");
const forecastTable = document.getElementById("forecast-table");
const forecastColgroup = document.getElementById("forecast-colgroup");
const forecastPeriods2 = document.getElementById("forecast-periods-2");
const forecastWorkbench2 = document.getElementById("forecast-workbench-2");
const periodsBody2 = document.getElementById("periods-body-2");
const periodStatusFilter2 = document.getElementById("period-status-filter-2");
const periodKeyword2 = document.getElementById("period-keyword-2");
const periodResetBtn2 = document.getElementById("period-reset-btn-2");
const backToPeriods2 = document.getElementById("back-to-periods-2");
const downloadTemplateBtn2 = document.getElementById("download-template-btn-2");
const downloadDataBtn2 = document.getElementById("download-data-btn-2");
const uploadBtn2 = document.getElementById("upload-btn-2");
const uploadInput2 = document.getElementById("upload-input-2");
const queryBtn2 = document.getElementById("query-btn-2");
const resetQueryBtn2 = document.getElementById("reset-query-btn-2");
const addRowBtn2 = document.getElementById("add-row-btn-2");
const copyLastPeriodBtn2 = document.getElementById("copy-last-period-btn-2");
const saveDraftBtn2 = document.getElementById("save-draft-btn-2");
const submitBtn2 = document.getElementById("submit-btn-2");
const customerFilter2 = document.getElementById("customer-filter-2");
const invoiceFilter2 = document.getElementById("invoice-filter-2");
const performanceFilter2 = document.getElementById("performance-filter-2");
const regionFilter2 = document.getElementById("region-filter-2");
const paFilter2 = document.getElementById("pa-filter-2");
const subPa1Filter2 = document.getElementById("subpa1-filter-2");
const subPa2Filter2 = document.getElementById("subpa2-filter-2");
const subPa3Filter2 = document.getElementById("subpa3-filter-2");
const subPa4Filter2 = document.getElementById("subpa4-filter-2");
const forecastFilterYm2 = document.getElementById("forecast-filter-ym-2");
const forecastBody2 = document.getElementById("forecast-body-2");
const forecastMessage2 = document.getElementById("forecast-message-2");
const forecastHead2 = document.getElementById("forecast-head-2");
const forecastTable2 = document.getElementById("forecast-table-2");
const forecastColgroup2 = document.getElementById("forecast-colgroup-2");
const approvalWorkbench = document.getElementById("approval-workbench");
const approvalPeriodFilter = document.getElementById("approval-period-filter");
const approvalDirectorFilter = document.getElementById("approval-director-filter");
const approvalSalesFilter = document.getElementById("approval-sales-filter");
const approvalStatusFilter = document.getElementById("approval-status-filter");
const approvalQueryBtn = document.getElementById("approval-query-btn");
const approvalResetBtn = document.getElementById("approval-reset-btn");
const approvalListBody = document.getElementById("approval-list-body");
const approvalListPage = document.getElementById("approval-list-page");
const approvalDetailPage = document.getElementById("approval-detail-page");
const approvalFilters = document.querySelector("#approval-workbench .approval-filters");
const approvalBackBtn = document.getElementById("approval-back-btn");
const approvalDetailTitle = document.getElementById("approval-detail-title");
const approvalPassBtn = document.getElementById("approval-pass-btn");
const approvalRejectBtn = document.getElementById("approval-reject-btn");
const approvalAdjustBtn = document.getElementById("approval-adjust-btn");
const approvalDownloadBtn = document.getElementById("approval-download-btn");
const summaryByCustomerBtn = document.getElementById("summary-by-customer");
const summaryByPerformanceBtn = document.getElementById("summary-by-performance");
const summaryByRegionBtn = document.getElementById("summary-by-region");
const summaryDetailTab = document.getElementById("summary-detail-tab");
const approvalCustomerPanel = document.getElementById("approval-customer-panel");
const approvalDetailDataPanel = document.getElementById("approval-detail-data-panel");
const approvalSummaryPanel = document.getElementById("approval-summary-panel");
const approvalSummaryByCustomerBody = document.getElementById("approval-summary-by-customer-body");
const approvalSummaryBody = document.getElementById("approval-summary-body");
const approvalSummaryCustomerHead = document.getElementById("approval-summary-customer-head");
const approvalCustomerTableWrap = approvalSummaryCustomerHead?.closest(".table-wrap");
const approvalSummaryHead = document.getElementById("approval-summary-head");
const approvalDetailHead = document.getElementById("approval-detail-head");
const approvalDetailBody = document.getElementById("approval-detail-body");
const fcVersionWorkbench = document.getElementById("fc-version-workbench");
const fcVersionBody = document.getElementById("fc-version-body");
const fcVersionAddBtn = document.getElementById("fc-version-add-btn");
const fcVersionDialog = document.getElementById("fc-version-dialog");
const fcVersionDialogTitle = document.getElementById("fc-version-dialog-title");
const fcVersionNameInput = document.getElementById("fc-version-name");
const fcSalesStartMonthInput = document.getElementById("fc-sales-start-month");
const fcSalesEndMonthInput = document.getElementById("fc-sales-end-month");
const fcOpenStartInput = document.getElementById("fc-open-start");
const fcOpenEndInput = document.getElementById("fc-open-end");
const fcDelayStartInput = document.getElementById("fc-delay-start");
const fcDelayEndInput = document.getElementById("fc-delay-end");
const fcDelaySalesSearchInput = document.getElementById("fc-delay-sales-search");
const fcDelaySalesList = document.getElementById("fc-delay-sales-list");
const fcVersionCancelBtn = document.getElementById("fc-version-cancel-btn");
const fcVersionSaveBtn = document.getElementById("fc-version-save-btn");
const approvalOpinionDialog = document.getElementById("approval-opinion-dialog");
const approvalOpinionTitle = document.getElementById("approval-opinion-title");
const approvalOpinionInput = document.getElementById("approval-opinion-input");
const approvalOpinionCancelBtn = document.getElementById("approval-opinion-cancel-btn");
const approvalOpinionConfirmBtn = document.getElementById("approval-opinion-confirm-btn");
const approvalAdjustDialog = document.getElementById("approval-adjust-dialog");
const approvalAdjustOrderAmountInput = document.getElementById("approval-adjust-order-amount");
const approvalAdjustOrderQtyInput = document.getElementById("approval-adjust-order-qty");
const approvalAdjustInvoiceAmountInput = document.getElementById("approval-adjust-invoice-amount");
const approvalAdjustInvoiceQtyInput = document.getElementById("approval-adjust-invoice-qty");
const approvalAdjustRemarkInput = document.getElementById("approval-adjust-remark");
const approvalAdjustCancelBtn = document.getElementById("approval-adjust-cancel-btn");
const approvalAdjustSaveBtn = document.getElementById("approval-adjust-save-btn");
const approvalHistoryDialog = document.getElementById("approval-history-dialog");
const approvalHistoryTitle = document.getElementById("approval-history-title");
const approvalHistoryBody = document.getElementById("approval-history-body");
const approvalHistoryCloseBtn = document.getElementById("approval-history-close-btn");
const baseDataWorkbench = document.getElementById("base-data-workbench");
const baseDataTitle = document.getElementById("base-data-title");
const baseDataAddBtn = document.getElementById("base-data-add-btn");
const baseDataHead = document.getElementById("base-data-head");
const baseDataBody = document.getElementById("base-data-body");
const baseDataDialog = document.getElementById("base-data-dialog");
const baseDataDialogTitle = document.getElementById("base-data-dialog-title");
const baseDataForm = document.getElementById("base-data-form");
const baseDataCancelBtn = document.getElementById("base-data-cancel-btn");
const baseDataSaveBtn = document.getElementById("base-data-save-btn");
const userDialog = document.getElementById("user-dialog");
const userDialogTitle = document.getElementById("user-dialog-title");
const userForm = document.getElementById("user-form");
const userDialogCancelBtn = document.getElementById("user-dialog-cancel");
const userDialogSaveBtn = document.getElementById("user-dialog-save");
const dashboardWorkbench = document.getElementById("dashboard-workbench");
const dashboardCurrentPeriod = document.getElementById("dashboard-current-period");
const dashboardCurrentWindow = document.getElementById("dashboard-current-window");
const dashboardMonthStart = document.getElementById("dashboard-month-start");
const dashboardMonthEnd = document.getElementById("dashboard-month-end");
const kpiOrderAmt = document.getElementById("kpi-order-amt");
const kpiOrderQtySub = document.getElementById("kpi-order-qty-sub");
const kpiOrderYoy = document.getElementById("kpi-order-yoy");
const kpiInvAmt = document.getElementById("kpi-inv-amt");
const kpiInvQtySub = document.getElementById("kpi-inv-qty-sub");
const kpiInvYoy = document.getElementById("kpi-inv-yoy");
const kpiCompletion = document.getElementById("kpi-completion");
const kpiCompletionSub = document.getElementById("kpi-completion-sub");
const kpiPending = document.getElementById("kpi-pending");
const kpiPendingSub = document.getElementById("kpi-pending-sub");
const dashboardOrderTab = document.getElementById("dashboard-order-tab");
const dashboardInvoiceTab = document.getElementById("dashboard-invoice-tab");
const dashboardTrendTitle = document.getElementById("dashboard-trend-title");
const dashboardRegionShareTitle = document.getElementById("dashboard-region-share-title");
const dashboardIndustryShareTitle = document.getElementById("dashboard-industry-share-title");
const dashboardShareTitle = document.getElementById("dashboard-share-title");
const dashboardCompanyTitle = document.getElementById("dashboard-company-title");
const dashboardProductTitle = document.getElementById("dashboard-product-title");
const dashboardRegionShareChartEl = document.getElementById("dashboard-region-share-chart");
const dashboardIndustryShareChartEl = document.getElementById("dashboard-industry-share-chart");
const dashboardCompanyChartEl = document.getElementById("dashboard-company-chart");
const dashboardProductChartEl = document.getElementById("dashboard-product-chart");
const dashboardTrendChartEl = document.getElementById("dashboard-trend-chart");
const dashboardShareChartEl = document.getElementById("dashboard-share-chart");
const addForecastDialog = document.getElementById("add-forecast-dialog");
const addCustomer = document.getElementById("add-customer");
const addInvoice = document.getElementById("add-invoice");
const addPerformance = document.getElementById("add-performance");
const addRegion = document.getElementById("add-region");
const addPa = document.getElementById("add-pa");
const addSubPa1 = document.getElementById("add-subpa1");
const addSubPa2 = document.getElementById("add-subpa2");
const addMonthMetrics = document.getElementById("add-month-metrics");
const addDialogCancel = document.getElementById("add-dialog-cancel");
const addDialogSave = document.getElementById("add-dialog-save");

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthKeyMap = {
  Jan: "jan",
  Feb: "feb",
  Mar: "mar",
  Apr: "apr",
  May: "may",
  Jun: "jun",
  Jul: "jul",
  Aug: "aug",
  Sep: "sep",
  Oct: "oct",
  Nov: "nov",
  Dec: "dec"
};

function getQtyKey(month) {
  return `${monthKeyMap[month]}Qty`;
}

function getInvoiceKey(month) {
  return `${monthKeyMap[month]}Inv`;
}

function getOrderAmountKey(month) {
  return `${monthKeyMap[month]}OrderAmt`;
}

function getInvoiceAmountKey(month) {
  return `${monthKeyMap[month]}InvAmt`;
}

function getPeriodYear(period) {
  const match = String(period || "").match(/^(\d{4})/);
  return match ? match[1] : "2026";
}

/** 根据周期年份与英文月份缩写生成 YYYY-MM（用于长表年月列） */
function getYearMonthStr(period, monthAbbrev) {
  return getYearMonthByPeriodMonth(period, monthAbbrev);
}

function getYearMonthByPeriodMonth(period, monthAbbrev, periodMonths = null) {
  const months = (periodMonths && periodMonths.length ? periodMonths : periodWindows[period] || monthOrder).slice();
  const ymList = mapMonthsToYmList(months, getPeriodYear(period));
  const idx = months.indexOf(monthAbbrev);
  if (idx >= 0 && ymList[idx]) return ymList[idx];
  const fallbackMonthIdx = monthOrder.indexOf(monthAbbrev);
  const fallbackMonth = fallbackMonthIdx >= 0 ? monthOrder[fallbackMonthIdx] : monthOrder[0];
  const fallbackMonths = [fallbackMonth];
  return mapMonthsToYmList(fallbackMonths, getPeriodYear(period))[0] || `${getPeriodYear(period)}-01`;
}

function formatYmSlash(ym) {
  const [y, m] = String(ym || "").split("-");
  const mm = Number(m);
  if (!y || !mm) return String(ym || "-");
  return `${y}/${mm}`;
}

function getForecastYmRangeLabel(period) {
  const version = fcVersionRecords.find((item) => item.version === period);
  if (version?.salesStartMonth && version?.salesEndMonth) {
    return `${formatYmSlash(version.salesStartMonth)} - ${formatYmSlash(version.salesEndMonth)}`;
  }
  const months = getOpenMonths();
  if (!months.length) return "-";
  const startYm = getYearMonthByPeriodMonth(period, months[0], months);
  const endYm = getYearMonthByPeriodMonth(period, months[months.length - 1], months);
  return `${formatYmSlash(startYm)} - ${formatYmSlash(endYm)}`;
}

function getPriceProductKey(row) {
  return [row.pa, row.subpa1, row.subpa2, row.subpa3, row.subpa4].join("|");
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseLooseNumber(value) {
  const cleaned = String(value ?? "").replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatPlainMoney(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function ensureRowMetrics(row) {
  monthOrder.forEach((month) => {
    const legacyKey = monthKeyMap[month];
    const qtyKey = getQtyKey(month);
    const invKey = getInvoiceKey(month);
    const orderAmtKey = getOrderAmountKey(month);
    const invoiceAmtKey = getInvoiceAmountKey(month);
    const legacyValue = Number(row[legacyKey] ?? 0);
    if (typeof row[qtyKey] === "undefined") row[qtyKey] = Number.isFinite(legacyValue) ? legacyValue : 0;
    if (typeof row[invKey] === "undefined") row[invKey] = 0;
    const defaultPrice = getAveragePrice(row, month, row.period || state.forecast.period);
    if (typeof row[orderAmtKey] === "undefined") row[orderAmtKey] = Number(row[qtyKey] || 0) * defaultPrice;
    if (typeof row[invoiceAmtKey] === "undefined") row[invoiceAmtKey] = Number(row[invKey] || 0) * defaultPrice;
  });
}

let rowIdSeed = 1;
function ensureRowId(row) {
  if (!row.__id) {
    row.__id = `row_${rowIdSeed++}`;
  }
}

let forecastMessageTimer = null;
let forecastMessageTimer2 = null;

// 演示用：填报窗口按周期开放月份（后续可由“填报窗口管理”维护）
const periodWindows = {
  "2026FC1": ["Jan", "Feb", "Mar", "Apr"],
  "2026FC2": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
};

function setForecastMessage(type, text) {
  if (!forecastMessage) return;
  if (forecastMessageTimer) {
    window.clearTimeout(forecastMessageTimer);
    forecastMessageTimer = null;
  }
  forecastMessage.textContent = text;
  if (type === "error") {
    forecastMessage.style.color = "#b23a3a";
    forecastMessage.style.background = "#fff3f3";
    forecastMessage.style.borderColor = "#f2d0d0";
  } else if (type === "success") {
    forecastMessage.style.color = "#1d6e3f";
    forecastMessage.style.background = "#effaf2";
    forecastMessage.style.borderColor = "#cae8d2";
  } else {
    forecastMessage.style.color = "#4c6272";
    forecastMessage.style.background = "#f3f9fe";
    forecastMessage.style.borderColor = "#d6e9f7";
  }

  forecastMessage.classList.add("show");
  const hideDelay = type === "error" ? 4200 : 3200;
  forecastMessageTimer = window.setTimeout(() => {
    forecastMessage.classList.remove("show");
    forecastMessageTimer = null;
  }, hideDelay);
}

function setForecastMessage2(type, text) {
  if (!forecastMessage2) return;
  if (forecastMessageTimer2) {
    window.clearTimeout(forecastMessageTimer2);
    forecastMessageTimer2 = null;
  }
  forecastMessage2.textContent = text;
  if (type === "error") {
    forecastMessage2.style.color = "#b23a3a";
    forecastMessage2.style.background = "#fff3f3";
    forecastMessage2.style.borderColor = "#f2d0d0";
  } else if (type === "success") {
    forecastMessage2.style.color = "#1d6e3f";
    forecastMessage2.style.background = "#effaf2";
    forecastMessage2.style.borderColor = "#cae8d2";
  } else {
    forecastMessage2.style.color = "#4c6272";
    forecastMessage2.style.background = "#f3f9fe";
    forecastMessage2.style.borderColor = "#d6e9f7";
  }

  forecastMessage2.classList.add("show");
  const hideDelay = type === "error" ? 4200 : 3200;
  forecastMessageTimer2 = window.setTimeout(() => {
    forecastMessage2.classList.remove("show");
    forecastMessageTimer2 = null;
  }, hideDelay);
}

/** 根据当前是否在页面2，选择对应的提示区域 */
function activeForecastToast(type, text) {
  if (state.activeModule === FORECAST_MONTHLY_MODULE) setForecastMessage2(type, text);
  else setForecastMessage(type, text);
}

function getOpenMonths() {
  return state.forecast.months || monthOrder;
}

// 演示用：周期列表数据（历史 + 开放中）
const periodRecords = [
  {
    period: "2026FC1",
    openTime: "2026-04-01 ~ 2026-04-12",
    months: periodWindows["2026FC1"],
    status: "open",
    approval: "draft"
  },
  {
    period: "2026FC2",
    openTime: "2026-07-01 ~ 2026-07-15",
    months: periodWindows["2026FC2"],
    status: "open",
    approval: "submitted"
  },
  {
    period: "2025FC2",
    openTime: "2025-05-01 ~ 2025-05-15",
    months: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    status: "history",
    approval: "approved"
  }
];

let fcVersionSeed = 1;
const fcVersionRecords = periodRecords.map((item) => {
  const parts = item.openTime.split("~").map((v) => v.trim());
  const openEndAt = `${(parts[1] || parts[0])}T18:00`;
  const delayStartAt = openEndAt;
  return {
    id: `fcv_${fcVersionSeed++}`,
    version: item.period,
    salesStartMonth: item.months[0] ? `${item.period.slice(0, 4)}-${String(monthOrder.indexOf(item.months[0]) + 1).padStart(2, "0")}` : "2026-01",
    salesEndMonth: item.months[item.months.length - 1]
      ? `${item.period.slice(0, 4)}-${String(monthOrder.indexOf(item.months[item.months.length - 1]) + 1).padStart(2, "0")}`
      : "2026-12",
    openStart: `${parts[0]}T09:00`,
    openEnd: openEndAt,
    delayStart: delayStartAt,
    delayEnd: delayStartAt,
    delaySales: []
  };
});

const fc2 = fcVersionRecords.find((item) => item.version === "2026FC2");
if (fc2) {
  fc2.salesStartMonth = "2026-07";
  fc2.salesEndMonth = "2027-03";
  fc2.openStart = "2026-07-01T09:00";
  fc2.openEnd = "2026-07-15T18:00";
  fc2.delayStart = fc2.openEnd;
  fc2.delayEnd = fc2.openEnd;
}

function monthRangeToList(startMonth, endMonth) {
  if (!startMonth || !endMonth) return [];
  const [startY, startM] = startMonth.split("-").map(Number);
  const [endY, endM] = endMonth.split("-").map(Number);
  const start = new Date(startY, (startM || 1) - 1, 1);
  const end = new Date(endY, (endM || 1) - 1, 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const result = [];
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    result.push(monthOrder[cursor.getMonth()]);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

function monthRangeToYmList(startMonth, endMonth) {
  if (!startMonth || !endMonth) return [];
  const [startY, startM] = startMonth.split("-").map(Number);
  const [endY, endM] = endMonth.split("-").map(Number);
  const start = new Date(startY, (startM || 1) - 1, 1);
  const end = new Date(endY, (endM || 1) - 1, 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const result = [];
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    result.push(`${y}-${m}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

function mapMonthsToYmList(months, baseYear) {
  const list = [];
  let year = Number(baseYear || 2026);
  let prevMonthIdx = -1;
  (months || []).forEach((month) => {
    const idx = monthOrder.indexOf(month);
    if (idx < 0) return;
    if (prevMonthIdx >= 0 && idx < prevMonthIdx) year += 1;
    list.push(`${year}-${String(idx + 1).padStart(2, "0")}`);
    prevMonthIdx = idx;
  });
  return list;
}

function getPeriodAvailableYmList(period, fallbackMonths = []) {
  const cfg = fcVersionRecords.find((item) => item.version === period);
  if (cfg?.salesStartMonth && cfg?.salesEndMonth) {
    const list = monthRangeToYmList(cfg.salesStartMonth, cfg.salesEndMonth);
    if (list.length) return list;
  }
  return mapMonthsToYmList(fallbackMonths, getPeriodYear(period));
}

function shiftYmListByYear(ymList, deltaYear = -1) {
  return (ymList || []).map((ym) => {
    const [y, m] = String(ym).split("-");
    const yy = Number(y);
    if (!yy || !m) return ym;
    return `${yy + deltaYear}-${m}`;
  });
}

function syncPeriodRecordsFromFcVersions() {
  periodRecords.length = 0;
  const sorted = [...fcVersionRecords].sort((a, b) => (a.version < b.version ? 1 : -1));
  const latestId = sorted[0]?.id;
  sorted.forEach((item) => {
    const months = monthRangeToList(item.salesStartMonth, item.salesEndMonth);
    periodWindows[item.version] = months.length ? months : ["Jan"];
    const isOpen = item.id === latestId;
    periodRecords.push({
      period: item.version,
      openTime: `${item.openStart.replace("T", " ").slice(0, 16)} ~ ${item.openEnd.replace("T", " ").slice(0, 16)}`,
      months,
      status: isOpen ? "open" : "history",
      approval: isOpen ? "draft" : "approved"
    });
  });
}

syncPeriodRecordsFromFcVersions();

function buildProductCombos() {
  const combos = [];
  Object.entries(productHierarchy).forEach(([pa, sub1Map]) => {
    Object.entries(sub1Map).forEach(([subpa1, sub2Map]) => {
      Object.entries(sub2Map).forEach(([subpa2, sub3Map]) => {
        Object.entries(sub3Map).forEach(([subpa3, sub4List]) => {
          sub4List.forEach((subpa4) => {
            combos.push({ pa, subpa1, subpa2, subpa3, subpa4 });
          });
        });
      });
    });
  });
  return combos;
}

const productPriceMaster = {};

function buildMockProductPriceMaster() {
  const combos = buildProductCombos();
  combos.forEach((combo, comboIdx) => {
    const productKey = getPriceProductKey(combo);
    productPriceMaster[productKey] = {};
    ["2025", "2026"].forEach((year, yearIdx) => {
      monthOrder.forEach((month, monthIdx) => {
        const base = 45 + (comboIdx % 17) * 4 + (monthIdx % 6) * 3 + yearIdx * 2;
        productPriceMaster[productKey][`${year}-${month}`] = base;
      });
    });
  });
}

function getAveragePrice(row, month, period) {
  const year = getPeriodYear(period || row.period || state.forecast.period);
  return getAveragePriceByYear(row, month, year);
}

function getAveragePriceByYear(row, month, year) {
  const productKey = getPriceProductKey(row);
  const byProduct = productPriceMaster[productKey] || {};
  const value = byProduct[`${year}-${month}`];
  return Number(value || 0);
}

function getMonthOrderAmount(row, month, period) {
  const explicit = Number(row[getOrderAmountKey(month)]);
  return Number.isFinite(explicit) ? explicit : 0;
}

function getMonthInvoiceAmount(row, month, period) {
  const explicit = Number(row[getInvoiceAmountKey(month)]);
  return Number.isFinite(explicit) ? explicit : 0;
}

function getMonthOrderAmountByYear(row, month, year) {
  const explicit = Number(row[getOrderAmountKey(month)]);
  return Number.isFinite(explicit) ? explicit : 0;
}

function getMonthInvoiceAmountByYear(row, month, year) {
  const explicit = Number(row[getInvoiceAmountKey(month)]);
  return Number.isFinite(explicit) ? explicit : 0;
}

function getMonthSalesUnitPrice(row, month, period) {
  const qty = Number(row[getQtyKey(month)] || 0);
  if (!qty) return 0;
  return getMonthOrderAmount(row, month, period) / qty;
}

function getMonthInvoiceUnitPrice(row, month, period) {
  const inv = Number(row[getInvoiceKey(month)] || 0);
  if (!inv) return 0;
  return getMonthInvoiceAmount(row, month, period) / inv;
}

function calcRowAmounts(row, period) {
  const months = periodWindows[period] || monthOrder;
  let orderAmount = 0;
  let invoiceAmount = 0;
  months.forEach((month) => {
    orderAmount += getMonthOrderAmount(row, month, period);
    invoiceAmount += getMonthInvoiceAmount(row, month, period);
  });
  return { orderAmount, invoiceAmount };
}

buildMockProductPriceMaster();

function createBaseDataStores() {
  const industries = ["汽车", "医疗", "航空", "通用机械", "电子", "能源"];
  const credit = ["A", "B", "C"];
  const combos = buildProductCombos();
  const comboRows = combos.slice(0, 80);
  const productRows = combos.slice(0, 120);
  const priceRows = [];
  Object.entries(productPriceMaster)
    .slice(0, 10)
    .forEach(([key, monthMap]) => {
      Object.entries(monthMap)
        .slice(0, 6)
        .forEach(([ym, price]) => {
          priceRows.push({ id: `base_${baseRowSeed++}`, productKey: key, yearMonth: ym, avgPrice: Number(price) });
        });
    });

  baseDataStores["组织架构"] = {
    columns: [
      { key: "company", label: "所属公司" },
      { key: "salesName", label: "销售员" },
      { key: "performanceRegion", label: "业绩归属区域" },
      { key: "region", label: "大区" },
      { key: "salesEmail", label: "销售员邮箱" },
      { key: "lineManager", label: "直线经理" },
      { key: "lineManagerEmail", label: "直线经理邮箱" },
      { key: "regionOwner", label: "大区负责人" },
      { key: "finalApprover", label: "最终审批人" }
    ],
    fields: [
      { key: "company", label: "所属公司", type: "text", required: true },
      { key: "salesName", label: "销售员", type: "text", required: true },
      { key: "performanceRegion", label: "业绩归属区域", type: "text", required: true },
      { key: "region", label: "大区", type: "text", required: true },
      { key: "salesEmail", label: "销售员邮箱", type: "text", required: true },
      { key: "lineManager", label: "直线经理", type: "text", required: true },
      { key: "lineManagerEmail", label: "直线经理邮箱", type: "text", required: true },
      { key: "regionOwner", label: "大区负责人", type: "text", required: true },
      { key: "finalApprover", label: "最终审批人", type: "text", required: true }
    ],
    rows: [
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "韩学健",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "xuejian.han@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      },
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "李清",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "qing.li@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      },
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "李思梦",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "simeng.li@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      },
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "孙迎春",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "yingchun.sun@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      },
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "武健",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "jian.wu@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      },
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "赵强强",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "qiangqiang.zhao@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      },
      {
        company: "阿诺（北京）精密工具有限公司",
        salesName: "郑鸿鹏",
        performanceRegion: "北部销售大区-北京",
        region: "北部销售大区",
        salesEmail: "hongpeng.zheng@ahno-tool.com",
        lineManager: "李长春",
        lineManagerEmail: "changchun.li@ahno-tool.com",
        regionOwner: "杨依柱",
        finalApprover: "Frank Tao"
      }
    ].map((row) => ({ id: `base_${baseRowSeed++}`, ...row }))
  };

  baseDataStores["客户信息"] = {
    columns: [
      { key: "customerNo", label: "编号" },
      { key: "companyName", label: "公司名称" },
      { key: "industry", label: "行业" },
      { key: "brand", label: "品牌" },
      { key: "customerType01", label: "客户类型_01" }
    ],
    fields: [
      { key: "customerNo", label: "编号", type: "text", required: true },
      { key: "companyName", label: "公司名称", type: "text", required: true },
      { key: "industry", label: "行业", type: "select", required: true, options: industries },
      { key: "brand", label: "品牌", type: "text", required: true },
      { key: "customerType01", label: "客户类型_01", type: "select", required: true, options: ["自营", "经销商"] }
    ],
    rows: customerMaster.map((name, idx) => ({
      id: `base_${baseRowSeed++}`,
      customerNo: `C${String(idx + 1).padStart(4, "0")}`,
      companyName: name,
      industry: industries[idx % industries.length],
      brand: "阿诺",
      customerType01: idx % 2 === 0 ? "自营" : "经销商"
    }))
  };

  baseDataStores["产品库"] = {
    columns: [
      { key: "sku", label: "SKU" },
      { key: "pa", label: "PA" },
      { key: "subpa1", label: "Sub PA-1" },
      { key: "subpa2", label: "Sub PA-2" },
      { key: "subpa3", label: "Sub PA-3（产品名称）" },
      { key: "subpa4", label: "Sub PA-4（产品型号）" },
      { key: "status", label: "状态" }
    ],
    fields: [
      { key: "sku", label: "SKU", type: "text", required: true },
      { key: "pa", label: "PA", type: "text", required: true },
      { key: "subpa1", label: "Sub PA-1", type: "text", required: true },
      { key: "subpa2", label: "Sub PA-2", type: "text", required: true },
      { key: "subpa3", label: "Sub PA-3（产品名称）", type: "text", required: true },
      { key: "subpa4", label: "Sub PA-4", type: "text", required: true },
      { key: "status", label: "状态", type: "select", required: true, options: ["在售", "停用"] }
    ],
    rows: productRows.map((item, idx) => ({
      id: `base_${baseRowSeed++}`,
      sku: `SKU-${String(idx + 1).padStart(4, "0")}`,
      pa: item.pa,
      subpa1: item.subpa1,
      subpa2: item.subpa2,
      subpa3: item.subpa3,
      subpa4: item.subpa4,
      status: idx % 9 === 0 ? "停用" : "在售"
    }))
  };

  baseDataStores["数据字典"] = {
    columns: [
      { key: "dictType", label: "字典类型" },
      { key: "dictItem", label: "字典项" },
      { key: "status", label: "状态" }
    ],
    fields: [
      { key: "dictType", label: "字典类型", type: "select", required: true, options: ["业绩归属", "销售大区", "开票公司"] },
      { key: "dictItem", label: "字典项", type: "text", required: true },
      { key: "status", label: "状态", type: "select", required: true, options: ["启用", "停用"] }
    ],
    rows: [
      ...performanceOptions.map((item) => ({
        id: `base_${baseRowSeed++}`,
        dictType: "业绩归属",
        dictItem: item,
        status: "启用"
      })),
      ...regionOptions.map((item) => ({
        id: `base_${baseRowSeed++}`,
        dictType: "销售大区",
        dictItem: item,
        status: "启用"
      })),
      ...invoiceMaster.map((item) => ({
        id: `base_${baseRowSeed++}`,
        dictType: "开票公司",
        dictItem: item.invoice,
        status: "启用"
      }))
    ]
  };
}

createBaseDataStores();

function safeJsonParse(text, fallbackValue) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return fallbackValue;
  }
}

function loadFromStorage(key, fallbackValue) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallbackValue;
  return safeJsonParse(raw, fallbackValue);
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getNowIso() {
  return new Date().toISOString();
}

function formatDateTime(iso) {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return "-";
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function buildDefaultRolePermissions() {
  const allModules = [...new Set(menuGroups.flatMap((g) => g.items))];
  return {
    SYS_ADMIN: { roleId: "SYS_ADMIN", modules: allModules.slice() },
    SALES: {
      roleId: "SALES",
      modules: ["Dashboard", "销售填报预测填报", "分析报表"]
    },
    REGION_DIRECTOR: {
      roleId: "REGION_DIRECTOR",
      modules: ["Dashboard", "销售预测审核", "分析报表"]
    },
    SALES_DIRECTOR: {
      roleId: "SALES_DIRECTOR",
      modules: ["Dashboard", "销售预测审核", "分析报表"]
    },
    GM: {
      roleId: "GM",
      modules: ["Dashboard", "分析报表"]
    },
    FINANCE_MANAGER: {
      roleId: "FINANCE_MANAGER",
      modules: ["Dashboard", "销售预测审核", "分析报表"]
    }
  };
}

function initSystemData() {
  rolePermissions = loadFromStorage(STORAGE_KEYS.rolePermissions, {});
  if (!rolePermissions || Object.keys(rolePermissions).length === 0) {
    rolePermissions = buildDefaultRolePermissions();
    saveToStorage(STORAGE_KEYS.rolePermissions, rolePermissions);
  }

  userRecords = loadFromStorage(STORAGE_KEYS.users, []);
  if (!Array.isArray(userRecords)) userRecords = [];
  if (!Array.isArray(userRecords) || userRecords.length === 0) {
    userRecords = [
      {
        id: "u_admin",
        account: "admin@sandvik.com",
        displayName: "系统管理员",
        domain: "sandvik",
        roleId: "SYS_ADMIN",
        enabled: true,
        lastLoginAt: ""
      },
      {
        id: "u_sales_s",
        account: "mark.ji@sandvik.com",
        displayName: "Mark Ji",
        domain: "sandvik",
        roleId: "SALES",
        enabled: true,
        lastLoginAt: ""
      },
      {
        id: "u_rd_s",
        account: "director.cn@sandvik.com",
        displayName: "区域总监",
        domain: "sandvik",
        roleId: "REGION_DIRECTOR",
        enabled: true,
        lastLoginAt: ""
      },
      {
        id: "u_sd_s",
        account: "sales.director@sandvik.com",
        displayName: "销售总监",
        domain: "sandvik",
        roleId: "SALES_DIRECTOR",
        enabled: true,
        lastLoginAt: ""
      },
      { id: "u_gm_s", account: "gm@sandvik.com", displayName: "总经理", domain: "sandvik", roleId: "GM", enabled: true, lastLoginAt: "" },
      {
        id: "u_fin_s",
        account: "finance.manager@sandvik.com",
        displayName: "财务主管",
        domain: "sandvik",
        roleId: "FINANCE_MANAGER",
        enabled: true,
        lastLoginAt: ""
      },
      { id: "u_sales_a", account: "ahno.sales@ahno-tool.com", displayName: "AHNO Sales", domain: "AHNO", roleId: "SALES", enabled: true, lastLoginAt: "" }
    ];
    saveToStorage(STORAGE_KEYS.users, userRecords);
  }
  let userEmailMigrated = false;
  userRecords = userRecords.map((u) => {
    const raw = String(u?.account ?? "").trim();
    const accountPart = raw.includes("\\") ? raw.split("\\").pop() : raw;
    if (!accountPart || accountPart.includes("@")) return u;
    const domain = String(u?.domain || state.domain || "sandvik").toLowerCase();
    const suffix = domain.includes("ahno") ? "@ahno-tool.com" : "@sandvik.com";
    userEmailMigrated = true;
    return { ...u, account: `${accountPart}${suffix}` };
  });
  if (userEmailMigrated) {
    saveToStorage(STORAGE_KEYS.users, userRecords);
  }

  loginLogRecords = loadFromStorage(STORAGE_KEYS.loginLogs, []);
  if (!Array.isArray(loginLogRecords)) loginLogRecords = [];

  opLogRecords = loadFromStorage(STORAGE_KEYS.opLogs, []);
  if (!Array.isArray(opLogRecords)) opLogRecords = [];

  if (userRoleFilter) {
    userRoleFilter.innerHTML = `<option value="all">全部</option>${roleDefs
      .map((r) => `<option value="${r.id}">${r.name}</option>`)
      .join("")}`;
  }
  if (permissionRoleSelect) {
    permissionRoleSelect.innerHTML = roleDefs.map((r) => `<option value="${r.id}">${r.name}</option>`).join("");
  }
  if (opLogModuleSelect) {
    const moduleOptions = [...new Set(menuGroups.flatMap((g) => g.items))];
    opLogModuleSelect.innerHTML = `<option value="all">全部</option>${moduleOptions
      .map((name) => `<option value="${name}">${name}</option>`)
      .join("")}`;
  }
}

function getCurrentUser() {
  const user = userRecords.find((u) => u.id === state.userId);
  if (user) return user;
  return {
    id: state.userId || "-",
    account: state.userAccount || "-",
    displayName: currentUserName,
    domain: state.domain,
    roleId: state.userRoleId || "SALES",
    enabled: true,
    lastLoginAt: ""
  };
}

function recordLoginEvent({ event = "login", result, reason = "", account = "", displayName = "" }) {
  loginLogRecords.unshift({
    id: `login_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    time: getNowIso(),
    domain: state.domain,
    account: account || state.userAccount || "-",
    displayName: displayName || currentUserName,
    event,
    result,
    reason,
    userAgent: navigator.userAgent || "-"
  });
  if (loginLogRecords.length > 1000) loginLogRecords.length = 1000;
  saveToStorage(STORAGE_KEYS.loginLogs, loginLogRecords);
}

function recordOperationEvent({ module, action, detail = "" }) {
  const user = getCurrentUser();
  opLogRecords.unshift({
    id: `op_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    time: getNowIso(),
    domain: state.domain,
    account: user.account || "-",
    displayName: user.displayName || "-",
    roleId: user.roleId || "-",
    module: module || state.activeModule || "-",
    action,
    detail
  });
  if (opLogRecords.length > 5000) opLogRecords.length = 5000;
  saveToStorage(STORAGE_KEYS.opLogs, opLogRecords);
}

function canAccessModule(moduleName) {
  if (!moduleName || moduleName === "欢迎页") return true;
  const normalizedName =
    moduleName === FORECAST_MODULE_LEGACY || moduleName === FORECAST_MONTHLY_MODULE_LEGACY ? FORECAST_MONTHLY_MODULE : moduleName;
  const roleId = state.userRoleId || "SALES";
  if (roleId === "SYS_ADMIN") return true;
  const perm = rolePermissions[roleId];
  if (!perm || !Array.isArray(perm.modules)) return true;
  if (normalizedName === FORECAST_MONTHLY_MODULE) {
    return (
      perm.modules.includes(FORECAST_MONTHLY_MODULE) ||
      perm.modules.includes(FORECAST_MODULE_LEGACY) ||
      perm.modules.includes(FORECAST_MONTHLY_MODULE_LEGACY)
    );
  }
  return perm.modules.includes(normalizedName);
}

initSystemData();

function generateMockForecastRows(targetCount = 100) {
  const combos = buildProductCombos();
  if (combos.length === 0) return [];
  const allSales = Object.values(directorSalesMap).flat();
  const cyclePool = [...new Set(periodRecords.map((item) => item.period))];
  const rows = [];
  for (let i = 0; i < targetCount; i += 1) {
    const combo = combos[i % combos.length];
    const invoice = invoiceMaster[i % invoiceMaster.length];
    const customer = customerMaster[i % customerMaster.length];
    const sales = allSales[i % allSales.length];
    const period = cyclePool[i % cyclePool.length];
    const salesWeight = 1 + (allSales.indexOf(sales) % 6) * 0.18;
    const regionWeight = 1 + (invoiceMaster.indexOf(invoice) % 4) * 0.22;
    const year = Number(getPeriodYear(period) || 2026);
    // 让今年整体高于去年（演示口径），并保持可见差异
    const yearGrowth = year >= 2026 ? 1.14 : 0.9;
    const base = (26 + ((i * 19) % 82)) * salesWeight * regionWeight * yearGrowth;
    const row = {
      sales,
      period,
      customer,
      invoice: invoice.invoice,
      performance: invoice.performance,
      region: invoice.region,
      pa: combo.pa,
      subpa1: combo.subpa1,
      subpa2: combo.subpa2,
      subpa3: combo.subpa3,
      subpa4: combo.subpa4
    };

    monthOrder.forEach((month, monthIdx) => {
      const season = 0.82 + monthIdx * 0.04;
      // 月度扰动：制造“有高有低”的同比形态，而非所有月份同向变化
      const swing = 1 + [0.08, -0.05, 0.12, -0.04, 0.09, -0.06, 0.07, -0.03, 0.1, -0.05, 0.06, -0.02][monthIdx];
      // 定点演示规则：
      // 1) 去年8月 > 今年8月
      // 2) 去年9月 = 今年9月
      let specialMonthFactor = 1;
      if (year >= 2026) {
        if (month === "Aug") specialMonthFactor = 0.88;
        if (month === "Sep") specialMonthFactor = 1;
      } else {
        if (month === "Aug") specialMonthFactor = 1.55;
        if (month === "Sep") specialMonthFactor = 1.2666667;
      }
      const qty = Math.max(0, Math.round(base * season * swing * specialMonthFactor + monthIdx * (4 + (i % 4)) + (i % 9)));
      const invRatioBase = 0.72 + ((i + monthIdx) % 5) * 0.08;
      const invRatio = Math.min(0.96, Math.max(0.58, invRatioBase + (year >= 2026 ? 0.02 : -0.02)));
      const inv = Math.round(qty * invRatio);
      row[getQtyKey(month)] = qty;
      row[getInvoiceKey(month)] = inv;
    });
    rows.push(row);
  }
  return rows;
}

forecastRows.push(...generateMockForecastRows(150));

const approvalStatusOrder = ["draft", "submitted_director", "submitted_finance", "approved", "rejected"];
const approvalRecords = [];
const dashboardCharts = {};

function buildSeedHistoryForStatus(record, status) {
  const timeBase = new Date(`${getPeriodYear(record.period)}-01-10T09:00:00`);
  const chainMap = {
    draft: [{ status: "draft", actor: record.sales, opinion: "初始草稿保存。" }],
    submitted_director: [
      { status: "draft", actor: record.sales, opinion: "初始草稿保存。" },
      { status: "submitted_director", actor: record.sales, opinion: "提交区总审批，请审核。" }
    ],
    submitted_finance: [
      { status: "draft", actor: record.sales, opinion: "初始草稿保存。" },
      { status: "submitted_director", actor: record.sales, opinion: "提交区总审批，请审核。" },
      { status: "submitted_finance", actor: record.director, opinion: "区总审批通过，转财务复核。" }
    ],
    approved: [
      { status: "draft", actor: record.sales, opinion: "初始草稿保存。" },
      { status: "submitted_director", actor: record.sales, opinion: "提交区总审批，请审核。" },
      { status: "submitted_finance", actor: record.director, opinion: "区总审批通过，转财务复核。" },
      { status: "approved", actor: "财务主管", opinion: "财务审核通过，流程完成。" }
    ],
    rejected: [
      { status: "draft", actor: record.sales, opinion: "初始草稿保存。" },
      { status: "submitted_director", actor: record.sales, opinion: "提交区总审批，请审核。" },
      { status: "rejected", actor: record.director, opinion: "预测偏差较大，请补充说明后重提。" }
    ]
  };
  const chain = chainMap[status] || chainMap.draft;
  return chain.map((node, idx) => ({
    time: new Date(timeBase.getTime() + idx * 24 * 60 * 60 * 1000).toISOString(),
    status: node.status,
    opinion: node.opinion,
    actor: node.actor
  }));
}

function appendApprovalHistory(record, status, opinion, actor) {
  if (!record.history) record.history = [];
  record.history.push({
    time: new Date().toISOString(),
    status,
    opinion: opinion || "-",
    actor: actor || "审批人"
  });
}

function buildApprovalRecordsFromForecastRows() {
  const previousMap = new Map(
    approvalRecords.map((item) => [
      `${item.period}|${item.sales}`,
      {
        status: item.status,
        history: item.history || [],
        overrideTotals: item.overrideTotals || null
      }
    ])
  );
  approvalRecords.length = 0;
  const recordMap = new Map();
  forecastRows.forEach((row) => {
    const key = `${row.period}|${row.sales}`;
    if (!recordMap.has(key)) {
      recordMap.set(key, {
        id: `approval_${recordMap.size + 1}`,
        period: row.period,
        director: salesToDirector[row.sales] || "未分配总监",
        sales: row.sales,
        status: "draft",
        rows: []
      });
    }
    recordMap.get(key).rows.push(row);
  });

  let idx = 0;
  recordMap.forEach((record) => {
    const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];
    const amountTotal = record.rows.reduce(
      (sum, row) => {
        const amounts = calcRowAmounts(row, record.period);
        return {
          orderAmount: sum.orderAmount + amounts.orderAmount,
          invoiceAmount: sum.invoiceAmount + amounts.invoiceAmount
        };
      },
      { orderAmount: 0, invoiceAmount: 0 }
    );
    record.orderTotal = record.rows.reduce(
      (sum, row) => sum + months.reduce((mSum, month) => mSum + Number(row[getQtyKey(month)] || 0), 0),
      0
    );
    record.invoiceTotal = record.rows.reduce(
      (sum, row) => sum + months.reduce((mSum, month) => mSum + Number(row[getInvoiceKey(month)] || 0), 0),
      0
    );
    record.orderAmountTotal = amountTotal.orderAmount;
    record.invoiceAmountTotal = amountTotal.invoiceAmount;
    const key = `${record.period}|${record.sales}`;
    const previous = previousMap.get(key);
    const defaultStatus = approvalStatusOrder[idx % approvalStatusOrder.length];
    record.status = previous?.status || defaultStatus;
    record.history = previous?.history?.length ? previous.history : buildSeedHistoryForStatus(record, defaultStatus);
    record.overrideTotals = previous?.overrideTotals || null;
    idx += 1;
    approvalRecords.push(record);
  });
}

buildApprovalRecordsFromForecastRows();

forecastRows.forEach((row) => {
  ensureRowId(row);
  ensureRowMetrics(row);
});

function setActiveModule(name) {
  const normalizedName =
    name === FORECAST_MODULE_LEGACY || name === FORECAST_MONTHLY_MODULE_LEGACY ? FORECAST_MONTHLY_MODULE : name;
  if (!canAccessModule(normalizedName)) {
    dialogTitle.textContent = "无权限访问";
    dialogContent.textContent = `当前账号角色为「${roleNameById[state.userRoleId] || "-"}」，未开通模块「${normalizedName}」权限。`;
    infoDialog.showModal();
    return;
  }
  state.activeModule = normalizedName;
  if (activeModule) activeModule.textContent = normalizedName;
  moduleTitle.textContent = normalizedName;
  moduleDesc.textContent = moduleData[normalizedName] || "该功能详细流程将在下一步补充。";
  if (flowValue) flowValue.textContent = normalizedName === FORECAST_MONTHLY_MODULE ? "Draft" : "待发起预测填报";
  if (roleValue)
    roleValue.textContent = `${currentUserName}（${roleNameById[state.userRoleId] || mapRoleByModule(normalizedName) || state.role}）`;
  if (periodValue) periodValue.textContent = normalizedName === FORECAST_MONTHLY_MODULE ? state.forecast.period : "—";
  if (normalizedName === FORECAST_MONTHLY_MODULE) {
    if (periodWindowLabel) periodWindowLabel.textContent = `预测年月：${getForecastYmRangeLabel(state.forecast.period)}`;
  }
  updateActiveMenuStyle();
  renderModulePanel(normalizedName);
}

function mapRoleByModule(name) {
  if (["销售预测审核", "审批流程配置"].includes(name)) return "区域/销售总监";
  if (["用户账号管理", "角色和权限管理", "系统登录日志", "系统操作日志"].includes(name)) return "系统管理员";
  if (["审核节点邮件通知", "AD账号同步", "缓存刷新", "数据备份和清理"].includes(name)) return "后台服务";
  return "销售";
}

function renderModulePanel(name) {
  const isForecast = name === FORECAST_MONTHLY_MODULE;
  const isApproval = name === "销售预测审核";
  const isDashboard = name === "Dashboard";
  const isFcVersion = name === "预测周期管理";
  const isBaseData = basicDataModules.has(name);
  const isSystem = systemModules.has(name);
  const hideOverview = isForecast || isApproval || isDashboard || isFcVersion || isBaseData || isSystem;
  if (overviewHero) overviewHero.classList.toggle("hidden", hideOverview);
  if (overviewDashboard) overviewDashboard.classList.toggle("hidden", hideOverview);
  if (!isForecast && !isApproval && !isDashboard && !isFcVersion && !isBaseData && !isSystem) {
    forecastPeriods.classList.add("hidden");
    forecastWorkbench.classList.add("hidden");
    hideForecastPage2Panels();
    approvalWorkbench.classList.add("hidden");
    dashboardWorkbench.classList.add("hidden");
    fcVersionWorkbench.classList.add("hidden");
    baseDataWorkbench.classList.add("hidden");
    hideSystemWorkbench();
    return;
  }
  if (isSystem) {
    showSystemWorkbench(name);
    return;
  }
  if (isForecast) {
    showForecastPeriods2();
    return;
  }
  if (isFcVersion) {
    showFcVersionWorkbench();
    return;
  }
  if (isBaseData) {
    showBaseDataWorkbench(name);
    return;
  }
  if (isDashboard) {
    showDashboardWorkbench();
    return;
  }
  showApprovalWorkbench();
}

function hideForecastPage1Panels() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
}

function hideForecastPage2Panels() {
  if (forecastPeriods2) forecastPeriods2.classList.add("hidden");
  if (forecastWorkbench2) forecastWorkbench2.classList.add("hidden");
}

function hideSystemWorkbench() {
  if (systemWorkbench) systemWorkbench.classList.add("hidden");
  if (userMgmtPage) userMgmtPage.classList.add("hidden");
  if (rolePermissionPage) rolePermissionPage.classList.add("hidden");
  if (loginLogPage) loginLogPage.classList.add("hidden");
  if (opLogPage) opLogPage.classList.add("hidden");
}

let editingUserId = "";
let permissionEditingRoleId = "SYS_ADMIN";

function showSystemWorkbench(moduleName) {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  hideForecastPage2Panels();
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");

  if (systemWorkbench) systemWorkbench.classList.remove("hidden");
  if (systemTitle) systemTitle.textContent = moduleName;
  if (systemDesc) systemDesc.textContent = moduleData[moduleName] || "系统管理功能：维护用户、角色权限及审计日志。";

  if (userMgmtPage) userMgmtPage.classList.toggle("hidden", moduleName !== "用户账号管理");
  if (rolePermissionPage) rolePermissionPage.classList.toggle("hidden", moduleName !== "角色和权限管理");
  if (loginLogPage) loginLogPage.classList.toggle("hidden", moduleName !== "系统登录日志");
  if (opLogPage) opLogPage.classList.toggle("hidden", moduleName !== "系统操作日志");

  if (moduleName === "用户账号管理") renderUserManagement();
  if (moduleName === "角色和权限管理") renderRolePermission();
  if (moduleName === "系统登录日志") renderLoginLogs();
  if (moduleName === "系统操作日志") renderOpLogs();
}

function showMessage(title, content) {
  dialogTitle.textContent = title;
  dialogContent.textContent = content;
  infoDialog.showModal();
}

function normalizeText(text) {
  return String(text || "").trim().toLowerCase();
}

function renderUserManagement() {
  if (!userTableHead || !userTableBody) return;
  userTableHead.innerHTML = `
    <tr>
      <th>中文名</th>
      <th>M365账户</th>
      <th>角色</th>
      <th>状态</th>
      <th>操作</th>
    </tr>
  `;

  const keyword = normalizeText(userKeywordInput?.value);
  const roleId = userRoleFilter?.value || "all";
  const status = userStatusFilter?.value || "all";

  const filtered = userRecords
    .slice()
    .sort((a, b) => String(a.account || "").localeCompare(String(b.account || "")))
    .filter((u) => {
      if (roleId !== "all" && u.roleId !== roleId) return false;
      if (status === "enabled" && !u.enabled) return false;
      if (status === "disabled" && u.enabled) return false;
      if (keyword) {
        const blob = `${u.displayName || ""} ${u.account || ""}`.toLowerCase();
        if (!blob.includes(keyword)) return false;
      }
      return true;
    });

  if (!filtered.length) {
    userTableBody.innerHTML = `<tr><td colspan="5" class="period-empty">暂无用户数据。</td></tr>`;
    return;
  }

  userTableBody.innerHTML = filtered
    .map((u) => {
      const roleName = roleNameById[u.roleId] || u.roleId || "-";
      const statusText = u.enabled ? "启用" : "停用";
      const toggleText = u.enabled ? "停用" : "启用";
      return `
        <tr>
          <td>${u.displayName || "-"}</td>
          <td>${u.account || "-"}</td>
          <td>${roleName}</td>
          <td>${statusText}</td>
          <td class="period-action">
            <button class="icon-action-btn" data-user-edit="${u.id}" title="编辑" aria-label="编辑" type="button">&#9998;</button>
            <button class="icon-action-btn" data-user-toggle="${u.id}" title="${toggleText}" aria-label="${toggleText}" type="button">${u.enabled ? "&#128683;" : "&#9989;"}</button>
          </td>
        </tr>
      `;
    })
    .join("");

  userTableBody.querySelectorAll("button[data-user-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openUserDialog(btn.dataset.userEdit || ""));
  });
  userTableBody.querySelectorAll("button[data-user-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => toggleUserEnabled(btn.dataset.userToggle || ""));
  });
}

function openUserDialog(userId = "") {
  if (!userDialog || !userForm || !userDialogTitle) return;
  editingUserId = userId || "";
  const isEdit = Boolean(editingUserId);
  const user = userRecords.find((u) => u.id === editingUserId) || {
    id: "",
    account: "",
    displayName: "",
    domain: state.domain || "sandvik",
    roleId: "SALES",
    enabled: true
  };

  userDialogTitle.textContent = isEdit ? "编辑用户" : "新增用户";
  const roleOptions = roleDefs.map((r) => `<option value="${r.id}" ${user.roleId === r.id ? "selected" : ""}>${r.name}</option>`).join("");
  userForm.innerHTML = `
    <label>中文名
      <input data-user-field="displayName" type="text" value="${String(user.displayName || "")}" />
    </label>
    <label>M365账户
      <input data-user-field="account" type="text" value="${String(user.account || "")}" ${isEdit ? "disabled" : ""} />
    </label>
    <label>角色
      <select data-user-field="roleId">${roleOptions}</select>
    </label>
    <label>状态
      <select data-user-field="enabled">
        <option value="true" ${user.enabled ? "selected" : ""}>启用</option>
        <option value="false" ${!user.enabled ? "selected" : ""}>停用</option>
      </select>
    </label>
  `;
  userDialog.showModal();
}

function saveUserFromDialog() {
  const getField = (key) => userForm.querySelector(`[data-user-field="${key}"]`);
  const displayName = String(getField("displayName")?.value || "").trim();
  const account = String(getField("account")?.value || "").trim();
  const roleId = String(getField("roleId")?.value || "SALES").trim();
  const enabled = String(getField("enabled")?.value || "true") === "true";
  const domain = state.domain || "sandvik";

  if (!displayName) {
    showMessage("保存失败", "请填写姓名。");
    return;
  }
  if (!editingUserId) {
    if (!account) {
      showMessage("保存失败", "请填写M365账户（邮箱地址）。");
      return;
    }
    const exists = userRecords.some((u) => normalizeText(u.account) === normalizeText(account));
    if (exists) {
      showMessage("保存失败", "该M365账户已存在，请更换邮箱地址。");
      return;
    }
    const id = `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    userRecords.unshift({ id, account, displayName, domain, roleId, enabled, lastLoginAt: "" });
    saveToStorage(STORAGE_KEYS.users, userRecords);
    recordOperationEvent({ module: "用户账号管理", action: "新增用户", detail: `${account}（${displayName}）` });
  } else {
    const idx = userRecords.findIndex((u) => u.id === editingUserId);
    if (idx >= 0) {
      const old = userRecords[idx];
      userRecords.splice(idx, 1, { ...old, displayName, roleId, enabled });
      saveToStorage(STORAGE_KEYS.users, userRecords);
      recordOperationEvent({ module: "用户账号管理", action: "编辑用户", detail: `${old.account}（${displayName}）` });
    }
  }
  userDialog.close();
  renderUserManagement();
  renderMenu();
}

function toggleUserEnabled(userId) {
  const idx = userRecords.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  const user = userRecords[idx];
  user.enabled = !user.enabled;
  saveToStorage(STORAGE_KEYS.users, userRecords);
  recordOperationEvent({
    module: "用户账号管理",
    action: user.enabled ? "启用用户" : "停用用户",
    detail: `${user.account}（${user.displayName}）`
  });
  renderUserManagement();
}

function resetUserPassword(userId) {
  const idx = userRecords.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  const user = userRecords[idx];
  user.passwordResetAt = getNowIso();
  saveToStorage(STORAGE_KEYS.users, userRecords);
  recordOperationEvent({
    module: "用户账号管理",
    action: "重置密码",
    detail: `${user.domain}\\${user.account}（${user.displayName}）`
  });
  showMessage("操作成功", "已重置密码（演示模式）：请用户下次登录后修改。");
}

function renderRolePermission() {
  if (!permissionRoleSelect || !permissionTableHead || !permissionTableBody) return;
  permissionEditingRoleId = permissionRoleSelect.value || permissionEditingRoleId || "SYS_ADMIN";

  permissionTableHead.innerHTML = `
    <tr>
      <th>模块</th>
      <th>可访问</th>
    </tr>
  `;

  const allModules = [...new Set(menuGroups.flatMap((g) => g.items))];
  const current = rolePermissions[permissionEditingRoleId] || { roleId: permissionEditingRoleId, modules: [] };
  const allowed = new Set(Array.isArray(current.modules) ? current.modules : []);

  permissionTableBody.innerHTML = allModules
    .map((m) => {
      const checked = allowed.has(m) ? "checked" : "";
      const id = `perm_${permissionEditingRoleId}_${btoa(unescape(encodeURIComponent(m))).replace(/=+$/g, "")}`;
      return `
        <tr>
          <td>${m}</td>
          <td>
            <label class="permission-check" for="${id}">
              <input id="${id}" type="checkbox" data-perm-module="${m}" ${checked} />
              <span>${checked ? "已开通" : "未开通"}</span>
            </label>
          </td>
        </tr>
      `;
    })
    .join("");

  permissionTableBody.querySelectorAll("input[data-perm-module]").forEach((node) => {
    node.addEventListener("change", () => {
      const label = node.closest("label");
      const text = label?.querySelector("span");
      if (text) text.textContent = node.checked ? "已开通" : "未开通";
    });
  });
}

function saveRolePermission() {
  if (!permissionTableBody) return;
  const selected = [];
  permissionTableBody.querySelectorAll("input[data-perm-module]").forEach((node) => {
    const moduleName = node.dataset.permModule || "";
    if (!moduleName) return;
    if (node.checked) selected.push(moduleName);
  });
  rolePermissions[permissionEditingRoleId] = { roleId: permissionEditingRoleId, modules: selected };
  saveToStorage(STORAGE_KEYS.rolePermissions, rolePermissions);
  recordOperationEvent({
    module: "角色和权限管理",
    action: "保存权限",
    detail: `${roleNameById[permissionEditingRoleId] || permissionEditingRoleId}：${selected.length} 个模块`
  });
  renderMenu();
  showMessage("保存成功", "权限配置已保存。");
}

function resetRolePermissionToDefault() {
  const defaults = buildDefaultRolePermissions();
  const def = defaults[permissionEditingRoleId];
  rolePermissions[permissionEditingRoleId] = def ? { roleId: def.roleId, modules: def.modules.slice() } : { roleId: permissionEditingRoleId, modules: [] };
  saveToStorage(STORAGE_KEYS.rolePermissions, rolePermissions);
  recordOperationEvent({
    module: "角色和权限管理",
    action: "恢复默认权限",
    detail: `${roleNameById[permissionEditingRoleId] || permissionEditingRoleId}`
  });
  renderRolePermission();
  renderMenu();
  showMessage("操作成功", "已恢复默认权限。");
}

function getDateRangeFilter(startValue, endValue) {
  const start = startValue ? new Date(`${startValue}T00:00:00`) : null;
  const end = endValue ? new Date(`${endValue}T23:59:59`) : null;
  return { start, end };
}

function inRange(iso, start, end) {
  if (!start && !end) return true;
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return false;
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[,"\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(filename, headers, rows) {
  const lines = [headers.map(csvCell).join(",")].concat(rows.map((row) => row.map(csvCell).join(",")));
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function renderLoginLogs() {
  if (!loginLogHead || !loginLogBody) return;
  loginLogHead.innerHTML = `
    <tr>
      <th>时间</th>
      <th>事件</th>
      <th>域</th>
      <th>账号</th>
      <th>姓名</th>
      <th>结果</th>
      <th>原因</th>
      <th>终端</th>
    </tr>
  `;

  const keyword = normalizeText(loginLogUserInput?.value);
  const result = loginLogResultSelect?.value || "all";
  const { start, end } = getDateRangeFilter(loginLogDateStart?.value, loginLogDateEnd?.value);

  const filtered = loginLogRecords.filter((r) => {
    if (result !== "all" && String(r.result || "") !== result) return false;
    if (!inRange(r.time, start, end)) return false;
    if (keyword) {
      const blob = `${r.displayName || ""} ${r.account || ""}`.toLowerCase();
      if (!blob.includes(keyword)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    loginLogBody.innerHTML = `<tr><td colspan="8" class="period-empty">暂无登录日志。</td></tr>`;
    return;
  }

  loginLogBody.innerHTML = filtered
    .map((r) => {
      const resultText = r.result === "success" ? "成功" : r.result === "failed" ? "失败" : r.result || "-";
      return `
        <tr>
          <td>${formatDateTime(r.time)}</td>
          <td>${r.event || "login"}</td>
          <td>${r.domain || "-"}</td>
          <td>${r.account || "-"}</td>
          <td>${r.displayName || "-"}</td>
          <td>${resultText}</td>
          <td>${r.reason || "-"}</td>
          <td>${r.userAgent || "-"}</td>
        </tr>
      `;
    })
    .join("");
}

function renderOpLogs() {
  if (!opLogHead || !opLogBody) return;
  opLogHead.innerHTML = `
    <tr>
      <th>时间</th>
      <th>域</th>
      <th>账号</th>
      <th>姓名</th>
      <th>角色</th>
      <th>模块</th>
      <th>动作</th>
      <th>明细</th>
    </tr>
  `;

  const moduleName = opLogModuleSelect?.value || "all";
  const keyword = normalizeText(opLogUserInput?.value);
  const actionKeyword = normalizeText(opLogActionInput?.value);
  const { start, end } = getDateRangeFilter(opLogDateStart?.value, opLogDateEnd?.value);

  const filtered = opLogRecords.filter((r) => {
    if (moduleName !== "all" && String(r.module || "") !== moduleName) return false;
    if (!inRange(r.time, start, end)) return false;
    if (keyword) {
      const blob = `${r.displayName || ""} ${r.account || ""}`.toLowerCase();
      if (!blob.includes(keyword)) return false;
    }
    if (actionKeyword) {
      const blob = `${r.action || ""} ${r.detail || ""}`.toLowerCase();
      if (!blob.includes(actionKeyword)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    opLogBody.innerHTML = `<tr><td colspan="8" class="period-empty">暂无操作日志。</td></tr>`;
    return;
  }

  opLogBody.innerHTML = filtered
    .map((r) => {
      return `
        <tr>
          <td>${formatDateTime(r.time)}</td>
          <td>${r.domain || "-"}</td>
          <td>${r.account || "-"}</td>
          <td>${r.displayName || "-"}</td>
          <td>${roleNameById[r.roleId] || r.roleId || "-"}</td>
          <td>${r.module || "-"}</td>
          <td>${r.action || "-"}</td>
          <td>${r.detail || "-"}</td>
        </tr>
      `;
    })
    .join("");
}

function exportLoginLogsCsv() {
  const keyword = normalizeText(loginLogUserInput?.value);
  const result = loginLogResultSelect?.value || "all";
  const { start, end } = getDateRangeFilter(loginLogDateStart?.value, loginLogDateEnd?.value);
  const filtered = loginLogRecords.filter((r) => {
    if (result !== "all" && String(r.result || "") !== result) return false;
    if (!inRange(r.time, start, end)) return false;
    if (keyword) {
      const blob = `${r.displayName || ""} ${r.account || ""}`.toLowerCase();
      if (!blob.includes(keyword)) return false;
    }
    return true;
  });
  if (!filtered.length) {
    showMessage("导出失败", "当前筛选条件下无可导出的登录日志。");
    return;
  }
  const headers = ["time", "event", "domain", "account", "displayName", "result", "reason", "userAgent"];
  const rows = filtered.map((r) => [r.time, r.event || "login", r.domain, r.account, r.displayName, r.result, r.reason, r.userAgent]);
  downloadCsv(`login_logs_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  recordOperationEvent({ module: "系统登录日志", action: "导出CSV", detail: `${rows.length} 条` });
}

function clearLoginLogs() {
  loginLogRecords = [];
  saveToStorage(STORAGE_KEYS.loginLogs, loginLogRecords);
  recordOperationEvent({ module: "系统登录日志", action: "清空日志", detail: "-" });
  renderLoginLogs();
  showMessage("操作成功", "登录日志已清空。");
}

function exportOpLogsCsv() {
  const moduleName = opLogModuleSelect?.value || "all";
  const keyword = normalizeText(opLogUserInput?.value);
  const actionKeyword = normalizeText(opLogActionInput?.value);
  const { start, end } = getDateRangeFilter(opLogDateStart?.value, opLogDateEnd?.value);
  const filtered = opLogRecords.filter((r) => {
    if (moduleName !== "all" && String(r.module || "") !== moduleName) return false;
    if (!inRange(r.time, start, end)) return false;
    if (keyword) {
      const blob = `${r.displayName || ""} ${r.account || ""}`.toLowerCase();
      if (!blob.includes(keyword)) return false;
    }
    if (actionKeyword) {
      const blob = `${r.action || ""} ${r.detail || ""}`.toLowerCase();
      if (!blob.includes(actionKeyword)) return false;
    }
    return true;
  });
  if (!filtered.length) {
    showMessage("导出失败", "当前筛选条件下无可导出的操作日志。");
    return;
  }
  const headers = ["time", "domain", "account", "displayName", "roleId", "module", "action", "detail"];
  const rows = filtered.map((r) => [r.time, r.domain, r.account, r.displayName, r.roleId, r.module, r.action, r.detail]);
  downloadCsv(`op_logs_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  recordOperationEvent({ module: "系统操作日志", action: "导出CSV", detail: `${rows.length} 条` });
}

function clearOpLogs() {
  opLogRecords = [];
  saveToStorage(STORAGE_KEYS.opLogs, opLogRecords);
  recordOperationEvent({ module: "系统操作日志", action: "清空日志", detail: "-" });
  renderOpLogs();
  showMessage("操作成功", "操作日志已清空。");
}

function showForecastPeriods() {
  forecastPeriods.classList.remove("hidden");
  forecastWorkbench.classList.add("hidden");
  hideForecastPage2Panels();
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  hideSystemWorkbench();
  renderPeriodList();
}

function showForecastDetail(period) {
  hideForecastPage2Panels();
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.remove("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  hideSystemWorkbench();
  const hit = periodRecords.find((r) => r.period === period) || periodRecords[0];
  if (!hit) {
    setForecastMessage("error", "当前无可用FC Name，请先在预测周期管理中创建。");
    showForecastPeriods();
    return;
  }
  state.forecast.period = hit.period;
  state.forecast.months = hit.months;
  state.forecast.approval = hit.approval;
  state.forecast.readOnly = hit.status !== "open";

  if (roleValue) roleValue.textContent = `${currentUserName}（${roleNameById[state.userRoleId] || state.role}）`;
  if (flowValue) flowValue.textContent = "Draft";
  if (periodValue) periodValue.textContent = state.forecast.period;
  if (periodWindowLabel) periodWindowLabel.textContent = `预测年月：${getForecastYmRangeLabel(state.forecast.period)}`;
  renderForecastFilters();
  renderForecastTable();
  document.getElementById("add-row-btn").disabled = state.forecast.readOnly;
  document.getElementById("save-draft-btn").disabled = state.forecast.readOnly;
  document.getElementById("submit-btn").disabled = state.forecast.readOnly;
  if (uploadBtn) uploadBtn.disabled = state.forecast.readOnly;
  setForecastMessage(
    "info",
    state.forecast.readOnly
      ? "当前FC Name已关闭：仅可查看填报明细。"
      : "当前FC Name开放中：可填报销售预测。"
  );
}

function showForecastPeriods2() {
  hideForecastPage1Panels();
  forecastPeriods2.classList.remove("hidden");
  forecastWorkbench2.classList.add("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  hideSystemWorkbench();
  renderPeriodList2();
}

function showForecastDetail2(period) {
  hideForecastPage1Panels();
  forecastPeriods2.classList.add("hidden");
  forecastWorkbench2.classList.remove("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  hideSystemWorkbench();
  const hit = periodRecords.find((r) => r.period === period) || periodRecords[0];
  if (!hit) {
    setForecastMessage2("error", "当前无可用FC Name，请先在预测周期管理中创建。");
    showForecastPeriods2();
    return;
  }
  state.forecast.period = hit.period;
  state.forecast.months = hit.months;
  state.forecast.approval = hit.approval;
  state.forecast.readOnly = hit.status !== "open";

  if (roleValue) roleValue.textContent = `${currentUserName}（${roleNameById[state.userRoleId] || state.role}）`;
  if (flowValue) flowValue.textContent = "Draft";
  if (periodValue) periodValue.textContent = state.forecast.period;
  if (periodWindowLabel) periodWindowLabel.textContent = `预测年月：${getForecastYmRangeLabel(state.forecast.period)}`;
  renderForecastFilters2();
  renderForecastTable2(getFilteredForecastLongEntries());
  document.getElementById("add-row-btn-2").disabled = state.forecast.readOnly;
  document.getElementById("save-draft-btn-2").disabled = state.forecast.readOnly;
  document.getElementById("submit-btn-2").disabled = state.forecast.readOnly;
  if (uploadBtn2) uploadBtn2.disabled = state.forecast.readOnly;
  setForecastMessage2(
    "info",
    state.forecast.readOnly
      ? "当前FC Name已关闭：仅可查看填报明细。"
      : "当前FC Name开放中：可填报销售预测。"
  );
}

function updateActiveMenuStyle() {
  document.querySelectorAll(".menu-item").forEach((node) => {
    node.classList.toggle("active", node.dataset.item === state.activeModule);
  });
}

function renderMenu() {
  menuTree.innerHTML = "";
  menuGroups.forEach((groupObj, groupIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "menu-group";
    if (groupIndex > 0) {
      wrapper.classList.add("collapsed");
    }

    const title = document.createElement("button");
    title.className = "group-title";
    title.textContent = groupObj.group;
    title.type = "button";
    title.setAttribute("aria-expanded", groupIndex === 0 ? "true" : "false");

    const itemContainer = document.createElement("div");
    itemContainer.className = "menu-items";

    groupObj.items.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "menu-item";
      btn.dataset.item = item;
      btn.type = "button";
      btn.textContent = item;
      btn.disabled = !canAccessModule(item);
      btn.addEventListener("click", () => setActiveModule(item));
      itemContainer.appendChild(btn);
    });

    title.addEventListener("click", () => {
      const collapsed = wrapper.classList.toggle("collapsed");
      title.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });

    wrapper.appendChild(title);
    wrapper.appendChild(itemContainer);
    menuTree.appendChild(wrapper);
  });
}

function fillSelect(selectNode, list, includeAll = false, selected = "") {
  if (!selectNode) return;
  const uniqueValues = [...new Set(list)];
  const options = includeAll ? [{ value: "all", label: "全部" }] : [];
  uniqueValues.forEach((value) => options.push({ value, label: value }));
  const hasSelected = options.some((option) => option.value === selected);
  const safeSelected = hasSelected ? selected : options[0]?.value;
  selectNode.innerHTML = options
    .map((option) => `<option value="${option.value}" ${option.value === safeSelected ? "selected" : ""}>${option.label}</option>`)
    .join("");
}

function fillYmSelect(selectNode, ymList, selected = "all") {
  if (!selectNode) return;
  const unique = [...new Set(ymList)].filter(Boolean);
  const options = [{ value: "all", label: "全部" }, ...unique.map((ym) => ({ value: ym, label: formatYmSlash(ym) }))];
  const hasSelected = options.some((option) => option.value === selected);
  const safeSelected = hasSelected ? selected : "all";
  selectNode.innerHTML = options
    .map((option) => `<option value="${option.value}" ${option.value === safeSelected ? "selected" : ""}>${option.label}</option>`)
    .join("");
}

function fillSelectWithSelected(selectNode, list, selected, includeAll = false) {
  const uniqueValues = [...new Set(list)];
  if (selected && selected !== "all" && !uniqueValues.includes(selected)) {
    uniqueValues.unshift(selected);
  }
  fillSelect(selectNode, uniqueValues, includeAll, selected);
}

function syncDependentFilters() {
  fillSelect(invoiceFilter, invoiceMaster.map((entity) => entity.invoice), true, invoiceFilter.value || "all");
}

function syncInvoiceDependentFilters() {
  const selectedInvoice = invoiceFilter.value;
  if (selectedInvoice === "all") {
    fillSelect(performanceFilter, performanceOptions, true, performanceFilter.value || "all");
    fillSelect(regionFilter, regionOptions, true, regionFilter.value || "all");
    return;
  }
  const entityHit = invoiceMaster.find((entity) => entity.invoice === selectedInvoice) || invoiceMaster[0];
  if (!entityHit) return;
  fillSelectWithSelected(performanceFilter, performanceOptions, entityHit.performance, true);
  fillSelectWithSelected(regionFilter, regionOptions, entityHit.region, true);
}

function syncSubPaFilter() {
  const paValue = paFilter.value;
  const options =
    paValue === "all"
      ? Object.values(productMaster).flat()
      : productMaster[paValue] || [];
  fillSelect(subPa1Filter, options, true, subPa1Filter.value || "all");
}

function renderForecastFilters() {
  fillSelect(customerFilter, customerMaster, true, "all");
  fillSelect(paFilter, Object.keys(productMaster), true, "all");
  syncDependentFilters();
  syncInvoiceDependentFilters();
  syncSubPaFilter();
  syncSubPa234Filters();
}

function syncSubPa234Filters() {
  const paValue = paFilter.value;
  const sub1Value = subPa1Filter?.value || "all";
  const sub2Options = [];

  Object.entries(productHierarchy).forEach(([pa, sub1Map]) => {
    if (paValue !== "all" && pa !== paValue) return;
    Object.entries(sub1Map).forEach(([sub1, sub2Map]) => {
      if (sub1Value !== "all" && sub1 !== sub1Value) return;
      Object.entries(sub2Map).forEach(([sub2, sub3Map]) => {
        sub2Options.push(sub2);
      });
    });
  });

  fillSelect(subPa2Filter, sub2Options.length ? sub2Options : ["-"], true, subPa2Filter.value || "all");
}

function syncDependentFilters2() {
  fillSelect(invoiceFilter2, invoiceMaster.map((entity) => entity.invoice), true, invoiceFilter2.value || "all");
}

function syncInvoiceDependentFilters2() {
  const selectedInvoice = invoiceFilter2.value;
  if (selectedInvoice === "all") {
    fillSelect(performanceFilter2, performanceOptions, true, performanceFilter2.value || "all");
    fillSelect(regionFilter2, regionOptions, true, regionFilter2.value || "all");
    return;
  }
  const entityHit = invoiceMaster.find((entity) => entity.invoice === selectedInvoice) || invoiceMaster[0];
  if (!entityHit) return;
  fillSelectWithSelected(performanceFilter2, performanceOptions, entityHit.performance, true);
  fillSelectWithSelected(regionFilter2, regionOptions, entityHit.region, true);
}

function syncSubPaFilter2() {
  const paValue = paFilter2.value;
  const options =
    paValue === "all"
      ? Object.values(productMaster).flat()
      : productMaster[paValue] || [];
  fillSelect(subPa1Filter2, options, true, subPa1Filter2.value || "all");
}

function syncSubPa234Filters2() {
  const paValue = paFilter2.value;
  const sub1Value = subPa1Filter2?.value || "all";
  const sub2Options = [];

  Object.entries(productHierarchy).forEach(([pa, sub1Map]) => {
    if (paValue !== "all" && pa !== paValue) return;
    Object.entries(sub1Map).forEach(([sub1, sub2Map]) => {
      if (sub1Value !== "all" && sub1 !== sub1Value) return;
      Object.entries(sub2Map).forEach(([sub2, sub3Map]) => {
        sub2Options.push(sub2);
      });
    });
  });

  fillSelect(subPa2Filter2, sub2Options.length ? sub2Options : ["-"], true, subPa2Filter2.value || "all");
}

function renderForecastFilters2() {
  fillSelect(customerFilter2, customerMaster, true, "all");
  fillSelect(paFilter2, Object.keys(productMaster), true, "all");
  syncDependentFilters2();
  syncInvoiceDependentFilters2();
  syncSubPaFilter2();
  syncSubPa234Filters2();
  const months = getOpenMonths();
  const ymList = getPeriodAvailableYmList(state.forecast.period, months);
  fillYmSelect(forecastFilterYm2, ymList, forecastFilterYm2?.value || "all");
}

function getForecastFixedColumns(mode) {
  const compactColumns = [
    { key: "customer", zh: "客户", en: "Customer", bilingual: true },
    { key: "performance", zh: "业绩归属", en: "Performance attribution", bilingual: true },
    { key: "invoice", zh: "开票公司", en: "Invoicing Legal Entity", bilingual: true },
    { key: "region", zh: "销售大区", en: "Region", bilingual: true },
    { key: "pa", title: "PA", bilingual: false },
    { key: "subpa1", title: "Sub PA-1", bilingual: false },
    { key: "subpa2", title: "Sub PA-2", bilingual: false }
  ];
  if (mode === "compact") return compactColumns;
  return [{ key: "sales", zh: "销售", en: "Sales", bilingual: true }, ...compactColumns];
}

function renderForecastHead(openMonths, mode = state.forecastViewMode) {
  const fixedColumns = getForecastFixedColumns(mode);
  const bilingualHeadCells = fixedColumns
    .filter((col) => col.bilingual)
    .map(
      (col) => `
        <th rowspan="2" class="bilingual-th">
          <span class="th-zh">${col.zh}</span>
          <span class="th-en">${col.en}</span>
        </th>
      `
    )
    .join("");
  const plainHeadCells = fixedColumns
    .filter((col) => !col.bilingual)
    .map((col) => `<th rowspan="2">${col.title}</th>`)
    .join("");
  const fixedHeadCells = `${bilingualHeadCells}${plainHeadCells}`;
  const ymList = getPeriodAvailableYmList(state.forecast.period, openMonths);
  const monthTopCells = openMonths
    .map((month, idx) => `<th colspan="6" class="month-group-th">${formatYmSlash(ymList[idx] || getYearMonthByPeriodMonth(state.forecast.period, month, openMonths))}</th>`)
    .join("");
  const monthSubCells = openMonths
    .map(
      () =>
        '<th class="month-metric-th">订单数量</th><th class="month-metric-th">订单金额</th><th class="month-metric-th">订单单价</th><th class="month-metric-th">开票数量</th><th class="month-metric-th">开票金额</th><th class="month-metric-th">开票单价</th>'
    )
    .join("");
  forecastHead.innerHTML = `<tr>${fixedHeadCells}${monthTopCells}</tr><tr>${monthSubCells}</tr>`;
}

function renderForecastColgroup(openMonths, mode = state.forecastViewMode) {
  if (!forecastColgroup) return;
  const fixedColumns = getForecastFixedColumns(mode);
  const fixedWidths =
    mode === "compact"
      ? [140, 160, 180, 120, 92, 108, 108]
      : [104, 140, 160, 180, 120, 92, 108, 108];
  const qtyCellWidth = mode === "compact" ? 66 : 84;
  const unitPriceCellWidth = mode === "compact" ? 82 : 98;
  const amountCellWidth = mode === "compact" ? 124 : 136;
  const fixedCols = fixedColumns
    .map((_, idx) => `<col style="width:${fixedWidths[idx] || 110}px">`)
    .join("");
  const metricCols = openMonths
    .map(
      () =>
        `<col style="width:${qtyCellWidth}px"><col style="width:${amountCellWidth}px"><col style="width:${unitPriceCellWidth}px"><col style="width:${qtyCellWidth}px"><col style="width:${amountCellWidth}px"><col style="width:${unitPriceCellWidth}px">`
    )
    .join("");
  forecastColgroup.innerHTML = `${fixedCols}${metricCols}`;
}

function buildRow(row, openMonths, mode = state.forecastViewMode) {
  const monthCells = openMonths
    .map((m) => {
      const qtyValue = Number(row[getQtyKey(m)] ?? 0);
      const orderAmountValue = getMonthOrderAmount(row, m, state.forecast.period);
      const salesUnitPrice = getMonthSalesUnitPrice(row, m, state.forecast.period);
      const invValue = Number(row[getInvoiceKey(m)] ?? 0);
      const invoiceAmountValue = getMonthInvoiceAmount(row, m, state.forecast.period);
      const invoiceUnitPrice = getMonthInvoiceUnitPrice(row, m, state.forecast.period);
      return `
        <td class="month-qty-cell"><input type="number" class="month-qty-input" data-month="${m}" value="${qtyValue}" ${state.forecast.readOnly ? "readonly" : ""} /></td>
        <td class="month-order-amount-cell"><input type="text" inputmode="decimal" class="month-order-amount-input" data-month="${m}" value="${formatPlainMoney(
          orderAmountValue
        )}" ${state.forecast.readOnly ? "readonly" : ""} /></td>
        <td class="month-sales-unit-price-cell readonly" data-month="${m}"><span class="unit-price-value">${formatAmount(
          salesUnitPrice
        )}</span></td>
        <td class="month-inv-cell"><input type="number" class="month-inv-input" data-month="${m}" value="${invValue}" ${state.forecast.readOnly ? "readonly" : ""} /></td>
        <td class="month-invoice-amount-cell"><input type="text" inputmode="decimal" class="month-invoice-amount-input" data-month="${m}" value="${formatPlainMoney(
          invoiceAmountValue
        )}" ${state.forecast.readOnly ? "readonly" : ""} /></td>
        <td class="month-invoice-unit-price-cell readonly" data-month="${m}"><span class="unit-price-value">${formatAmount(
          invoiceUnitPrice
        )}</span></td>
      `;
    })
    .join("");

  const fixedColumns = getForecastFixedColumns(mode);
  const fixedCells = fixedColumns.map((col) => `<td class="readonly">${row[col.key] || "-"}</td>`).join("");

  return `
    <tr data-row-id="${row.__id}">
      ${fixedCells}
      ${monthCells}
    </tr>
  `;
}

function buildForecastTotalRow(rows, openMonths, mode = state.forecastViewMode) {
  if (!rows.length) return "";
  const fixedColCount = getForecastFixedColumns(mode).length;
  const monthCells = openMonths
    .map((month) => {
      const totals = rows.reduce(
        (acc, row) => {
          const qty = Number(row[getQtyKey(month)] || 0);
          const inv = Number(row[getInvoiceKey(month)] || 0);
          const orderAmount = getMonthOrderAmount(row, month, state.forecast.period);
          const invoiceAmount = getMonthInvoiceAmount(row, month, state.forecast.period);
          acc.qty += qty;
          acc.inv += inv;
          acc.orderAmount += orderAmount;
          acc.invoiceAmount += invoiceAmount;
          return acc;
        },
        { qty: 0, inv: 0, orderAmount: 0, invoiceAmount: 0 }
      );
      return `
        <td class="total-cell">${totals.qty}</td>
        <td class="total-cell">${formatAmount(totals.orderAmount)}</td>
        <td class="total-cell">-</td>
        <td class="total-cell">${totals.inv}</td>
        <td class="total-cell">${formatAmount(totals.invoiceAmount)}</td>
        <td class="total-cell">-</td>
      `;
    })
    .join("");
  return `
    <tr class="total-row">
      <td class="total-label" colspan="${fixedColCount}">汇总</td>
      ${monthCells}
    </tr>
  `;
}

function attachRowEvents() {
  if (state.forecast.readOnly) return;
  document.querySelectorAll("#forecast-body tr").forEach((rowNode) => {
    const rowId = rowNode.dataset.rowId;
    const rowData = forecastRows.find((item) => item.__id === rowId);
    if (!rowData) return;
    const refreshMonthCells = (month) => {
      const salesUnitNode = rowNode.querySelector(`.month-sales-unit-price-cell[data-month="${month}"]`);
      const invoiceUnitNode = rowNode.querySelector(`.month-invoice-unit-price-cell[data-month="${month}"]`);
      const salesValueNode = salesUnitNode?.querySelector(".unit-price-value") || salesUnitNode;
      const invoiceValueNode = invoiceUnitNode?.querySelector(".unit-price-value") || invoiceUnitNode;
      if (salesValueNode) salesValueNode.textContent = formatAmount(getMonthSalesUnitPrice(rowData, month, state.forecast.period));
      if (invoiceValueNode) invoiceValueNode.textContent = formatAmount(getMonthInvoiceUnitPrice(rowData, month, state.forecast.period));
    };
    rowNode.querySelectorAll(".month-qty-input").forEach((input) => {
      input.addEventListener("input", () => {
        const month = input.dataset.month;
        rowData[getQtyKey(month)] = Number(input.value || 0);
        refreshMonthCells(month);
      });
    });
    rowNode.querySelectorAll(".month-order-amount-input").forEach((input) => {
      input.addEventListener("input", () => {
        const month = input.dataset.month;
        rowData[getOrderAmountKey(month)] = parseLooseNumber(input.value);
        refreshMonthCells(month);
      });
      input.addEventListener("blur", () => {
        input.value = formatPlainMoney(parseLooseNumber(input.value));
      });
    });
    rowNode.querySelectorAll(".month-inv-input").forEach((input) => {
      input.addEventListener("input", () => {
        const month = input.dataset.month;
        rowData[getInvoiceKey(month)] = Number(input.value || 0);
        refreshMonthCells(month);
      });
    });
    rowNode.querySelectorAll(".month-invoice-amount-input").forEach((input) => {
      input.addEventListener("input", () => {
        const month = input.dataset.month;
        rowData[getInvoiceAmountKey(month)] = parseLooseNumber(input.value);
        refreshMonthCells(month);
      });
      input.addEventListener("blur", () => {
        input.value = formatPlainMoney(parseLooseNumber(input.value));
      });
    });
  });
}

function renderForecastTable(rows = forecastRows) {
  const openMonths = getOpenMonths();
  renderForecastColgroup(openMonths, state.forecastViewMode);
  renderForecastHead(openMonths, state.forecastViewMode);
  const dataRows = rows.map((row) => buildRow(row, openMonths, state.forecastViewMode)).join("");
  const totalRow = buildForecastTotalRow(rows, openMonths, state.forecastViewMode);
  forecastBody.innerHTML = `${dataRows}${totalRow}`;
  attachRowEvents();
}

function setForecastViewMode(mode) {
  state.forecastViewMode = mode;
  compactViewBtn?.classList.toggle("active", mode === "compact");
  detailViewBtn?.classList.toggle("active", mode === "detail");
  forecastTable?.classList.toggle("compact-view", mode === "compact");
  forecastTable?.classList.toggle("detail-view", mode === "detail");
  renderForecastTable(getFilteredForecastRows());
  renderForecastTable2(getFilteredForecastLongEntries());
}

function renderForecastLongHead() {
  const fixedColumns = getForecastFixedColumns("compact");
  const bilingualHeadCells = fixedColumns
    .filter((col) => col.bilingual)
    .map(
      (col) => `
        <th class="bilingual-th">
          <span class="th-zh">${col.zh}</span>
          <span class="th-en">${col.en}</span>
        </th>
      `
    )
    .join("");
  const plainHeadCells = fixedColumns
    .filter((col) => !col.bilingual)
    .map((col) => `<th>${col.title}</th>`)
    .join("");
  const tail =
    '<th>年月</th><th class="month-metric-th">订单数量</th><th class="month-metric-th">订单金额</th><th class="month-metric-th">订单单价</th><th class="month-metric-th">开票数量</th><th class="month-metric-th">开票金额</th><th class="month-metric-th">开票单价</th>';
  if (forecastHead2) forecastHead2.innerHTML = `<tr>${bilingualHeadCells}${plainHeadCells}${tail}</tr>`;
}

function renderForecastLongColgroup() {
  if (!forecastColgroup2) return;
  const fixedWidths = [140, 160, 180, 120, 92, 108, 108];
  const fixedCols = fixedWidths.map((w) => `<col style="width:${w}px">`).join("");
  forecastColgroup2.innerHTML = `${fixedCols}<col style="width:96px"><col style="width:72px"><col style="width:112px"><col style="width:94px"><col style="width:72px"><col style="width:112px"><col style="width:94px">`;
}

function buildLongRow(entry) {
  const { row, month, ym } = entry;
  const qtyValue = Number(row[getQtyKey(month)] ?? 0);
  const orderAmountValue = getMonthOrderAmount(row, month, state.forecast.period);
  const salesUnitPrice = getMonthSalesUnitPrice(row, month, state.forecast.period);
  const invValue = Number(row[getInvoiceKey(month)] ?? 0);
  const invoiceAmountValue = getMonthInvoiceAmount(row, month, state.forecast.period);
  const invoiceUnitPrice = getMonthInvoiceUnitPrice(row, month, state.forecast.period);
  const fixedColumns = getForecastFixedColumns("compact");
  const fixedCells = fixedColumns.map((col) => `<td class="readonly">${row[col.key] || "-"}</td>`).join("");
  const ro = state.forecast.readOnly ? "readonly" : "";
  return `
    <tr data-row-id="${row.__id}" data-month="${month}">
      ${fixedCells}
      <td class="readonly ym-cell">${ym}</td>
      <td class="month-qty-cell"><input type="number" class="month-qty-input month-qty-input-2" data-month="${month}" value="${qtyValue}" ${ro} /></td>
      <td class="month-order-amount-cell"><input type="text" inputmode="decimal" class="month-order-amount-input month-order-amount-input-2" data-month="${month}" value="${formatPlainMoney(
        orderAmountValue
      )}" ${ro} /></td>
      <td class="month-sales-unit-price-cell readonly long-sales-price-cell" data-month="${month}"><span class="unit-price-value">${formatAmount(
        salesUnitPrice
      )}</span></td>
      <td class="month-inv-cell"><input type="number" class="month-inv-input month-inv-input-2" data-month="${month}" value="${invValue}" ${ro} /></td>
      <td class="month-invoice-amount-cell"><input type="text" inputmode="decimal" class="month-invoice-amount-input month-invoice-amount-input-2" data-month="${month}" value="${formatPlainMoney(
        invoiceAmountValue
      )}" ${ro} /></td>
      <td class="month-invoice-unit-price-cell readonly long-invoice-price-cell" data-month="${month}"><span class="unit-price-value">${formatAmount(
        invoiceUnitPrice
      )}</span></td>
    </tr>
  `;
}

function buildLongTotalRow(entries) {
  if (!entries.length) return "";
  const fixedColCount = getForecastFixedColumns("compact").length + 1;
  let qty = 0;
  let inv = 0;
  let orderAmt = 0;
  let invAmt = 0;
  entries.forEach(({ row, month }) => {
    const q = Number(row[getQtyKey(month)] || 0);
    const i = Number(row[getInvoiceKey(month)] || 0);
    const orderAmount = getMonthOrderAmount(row, month, state.forecast.period);
    const invoiceAmount = getMonthInvoiceAmount(row, month, state.forecast.period);
    qty += q;
    inv += i;
    orderAmt += orderAmount;
    invAmt += invoiceAmount;
  });
  return `
    <tr class="total-row">
      <td class="total-label" colspan="${fixedColCount}">汇总</td>
      <td class="total-cell">${qty}</td>
      <td class="total-cell">${formatAmount(orderAmt)}</td>
      <td class="total-cell">-</td>
      <td class="total-cell">${inv}</td>
      <td class="total-cell">${formatAmount(invAmt)}</td>
      <td class="total-cell">-</td>
    </tr>
  `;
}

function attachRowEvents2() {
  if (state.forecast.readOnly) return;
  document.querySelectorAll("#forecast-body-2 tr[data-row-id]").forEach((rowNode) => {
    const rowId = rowNode.dataset.rowId;
    const month = rowNode.dataset.month;
    const rowData = forecastRows.find((item) => item.__id === rowId);
    if (!rowData || !month) return;
    const qtyInput = rowNode.querySelector(".month-qty-input-2");
    const orderAmountInput = rowNode.querySelector(".month-order-amount-input-2");
    const invInput = rowNode.querySelector(".month-inv-input-2");
    const invoiceAmountInput = rowNode.querySelector(".month-invoice-amount-input-2");
    const refreshLongMonthCells = () => {
      const salesPriceCell = rowNode.querySelector(".long-sales-price-cell");
      const invoicePriceCell = rowNode.querySelector(".long-invoice-price-cell");
      const salesValueNode = salesPriceCell?.querySelector(".unit-price-value") || salesPriceCell;
      const invoiceValueNode = invoicePriceCell?.querySelector(".unit-price-value") || invoicePriceCell;
      if (salesValueNode) salesValueNode.textContent = formatAmount(getMonthSalesUnitPrice(rowData, month, state.forecast.period));
      if (invoiceValueNode) invoiceValueNode.textContent = formatAmount(getMonthInvoiceUnitPrice(rowData, month, state.forecast.period));
    };
    if (qtyInput) {
      qtyInput.addEventListener("input", () => {
        rowData[getQtyKey(month)] = Number(qtyInput.value || 0);
        refreshLongMonthCells();
      });
    }
    if (orderAmountInput) {
      orderAmountInput.addEventListener("input", () => {
        rowData[getOrderAmountKey(month)] = parseLooseNumber(orderAmountInput.value);
        refreshLongMonthCells();
      });
      orderAmountInput.addEventListener("blur", () => {
        orderAmountInput.value = formatPlainMoney(parseLooseNumber(orderAmountInput.value));
      });
    }
    if (invInput) {
      invInput.addEventListener("input", () => {
        rowData[getInvoiceKey(month)] = Number(invInput.value || 0);
        refreshLongMonthCells();
      });
    }
    if (invoiceAmountInput) {
      invoiceAmountInput.addEventListener("input", () => {
        rowData[getInvoiceAmountKey(month)] = parseLooseNumber(invoiceAmountInput.value);
        refreshLongMonthCells();
      });
      invoiceAmountInput.addEventListener("blur", () => {
        invoiceAmountInput.value = formatPlainMoney(parseLooseNumber(invoiceAmountInput.value));
      });
    }
  });
}

function renderForecastTable2(entries = null) {
  if (!forecastBody2 || !forecastHead2) return;
  const list = entries ?? getFilteredForecastLongEntries();
  renderForecastLongColgroup();
  renderForecastLongHead();
  const dataRows = list.map((item) => buildLongRow(item)).join("");
  const totalRow = buildLongTotalRow(list);
  forecastBody2.innerHTML = `${dataRows}${totalRow}`;
  attachRowEvents2();
}

function approvalLabel(value) {
  switch (value) {
    case "draft":
      return "草稿";
    case "submitted_director":
      return "已提交区总待审批";
    case "submitted_finance":
      return "已提交财务待审批";
    case "submitted":
      return "已提交区总待审批";
    case "approved":
      return "已完成";
    case "rejected":
      return "已退回";
    default:
      return value || "-";
  }
}

function filterPeriodRecordsFrom(statusEl, keywordEl) {
  const status = statusEl?.value || "all";
  const keyword = (keywordEl?.value || "").trim().toLowerCase();

  return periodRecords.filter((item) => {
    const statusOk = status === "all" ? true : item.status === status;
    const keywordOk =
      keyword.length === 0
        ? true
        : `${item.period} ${item.openTime} ${item.months.join(" ")}`.toLowerCase().includes(keyword);
    return statusOk && keywordOk;
  });
}

function filterPeriodRecords() {
  return filterPeriodRecordsFrom(periodStatusFilter, periodKeyword);
}

function renderPeriodTable(bodyEl, statusEl, keywordEl, openDetailFn) {
  if (!bodyEl) return;
  const rows = filterPeriodRecordsFrom(statusEl, keywordEl);
  if (rows.length === 0) {
    bodyEl.innerHTML = `
      <tr>
        <td colspan="6" class="period-empty">未找到符合条件的FC Name，请调整筛选条件后重试。</td>
      </tr>
    `;
    return;
  }
  bodyEl.innerHTML = rows
    .map((r) => {
      const months = r.months.join(", ");
      const openText = r.status === "open" ? "开放中" : "已关闭";
      const openClass = r.status === "open" ? "status-open" : "status-history";
      return `
        <tr>
          <td>${r.period}</td>
          <td>${r.openTime}</td>
          <td class="period-months">${months}</td>
          <td><span class="status-pill ${openClass}">${openText}</span></td>
          <td>${approvalLabel(r.approval)}</td>
          <td class="period-action">
            <button
              class="icon-action-btn"
              data-period="${r.period}"
              title="${r.status === "open" ? "填报销售预测" : "查看填报明细"}"
              aria-label="${r.status === "open" ? "填报销售预测" : "查看填报明细"}"
              type="button"
            >
              ${r.status === "open" ? "&#9998;" : "&#128065;"}
            </button>
            <button
              class="icon-action-btn"
              data-history-period="${r.period}"
              title="查看审批历史"
              aria-label="查看审批历史"
              type="button"
            >
              &#128340;
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  bodyEl.querySelectorAll("button[data-period]").forEach((btn) => {
    btn.addEventListener("click", () => openDetailFn(btn.dataset.period));
  });
  bodyEl.querySelectorAll("button[data-history-period]").forEach((btn) => {
    btn.addEventListener("click", () => showApprovalHistoryByPeriod(btn.dataset.historyPeriod));
  });
}

function renderPeriodList() {
  renderPeriodTable(periodsBody, periodStatusFilter, periodKeyword, showForecastDetail);
}

function renderPeriodList2() {
  renderPeriodTable(periodsBody2, periodStatusFilter2, periodKeyword2, showForecastDetail2);
}

function approvalWorkflowLabel(status) {
  switch (status) {
    case "draft":
      return "草稿";
    case "submitted_director":
      return "已提交区域总监";
    case "submitted_finance":
      return "已提交财务审核";
    case "approved":
      return "已通过";
    case "rejected":
      return "已退回";
    default:
      return status || "-";
  }
}

function syncApprovalSalesFilter() {
  const selectedDirector = approvalDirectorFilter.value;
  const allSales = Object.values(directorSalesMap).flat();
  const salesList = selectedDirector === "all" ? allSales : directorSalesMap[selectedDirector] || [];
  fillSelect(approvalSalesFilter, salesList, true, approvalSalesFilter.value || "all");
}

function renderApprovalFilters() {
  fillSelect(
    approvalPeriodFilter,
    [...new Set(approvalRecords.map((item) => item.period))],
    true,
    approvalPeriodFilter.value || "all"
  );
  fillSelect(approvalDirectorFilter, Object.keys(directorSalesMap), true, approvalDirectorFilter.value || "all");
  syncApprovalSalesFilter();
}

function filterApprovalRecords() {
  const period = approvalPeriodFilter?.value || "all";
  const director = approvalDirectorFilter?.value || "all";
  const sales = approvalSalesFilter?.value || "all";
  const status = approvalStatusFilter?.value || "all";
  return approvalRecords.filter((item) => {
    const hitPeriod = period === "all" ? true : item.period === period;
    const hitDirector = director === "all" ? true : item.director === director;
    const hitSales = sales === "all" ? true : item.sales === sales;
    const hitStatus = status === "all" ? true : item.status === status;
    return hitPeriod && hitDirector && hitSales && hitStatus;
  });
}

function getApprovalDisplayTotals(record) {
  const base = {
    orderTotal: Number(record?.orderTotal || 0),
    invoiceTotal: Number(record?.invoiceTotal || 0),
    orderAmountTotal: Number(record?.orderAmountTotal || 0),
    invoiceAmountTotal: Number(record?.invoiceAmountTotal || 0)
  };
  const override = record?.overrideTotals;
  if (!override) return base;
  const pick = (value, fallback) => {
    if (value === null || value === undefined || value === "") return fallback;
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };
  return {
    orderTotal: pick(override.orderTotal, base.orderTotal),
    invoiceTotal: pick(override.invoiceTotal, base.invoiceTotal),
    orderAmountTotal: pick(override.orderAmountTotal, base.orderAmountTotal),
    invoiceAmountTotal: pick(override.invoiceAmountTotal, base.invoiceAmountTotal)
  };
}

function updateApprovalActionButtons(record) {
  const disabled = !record || record.status === "approved";
  approvalPassBtn.disabled = disabled;
  approvalRejectBtn.disabled = disabled;
  if (approvalAdjustBtn) approvalAdjustBtn.disabled = disabled;
}

function renderApprovalList() {
  const rows = filterApprovalRecords();
  if (rows.length === 0) {
    approvalListBody.innerHTML = `
      <tr>
        <td colspan="9" class="period-empty">未找到符合条件的审批提交记录。</td>
      </tr>
    `;
    return;
  }
  approvalListBody.innerHTML = rows
    .map((item) => {
      const statusClass = `status-${item.status}`;
      const totals = getApprovalDisplayTotals(item);
      return `
        <tr>
          <td>${item.period}</td>
          <td>${item.director}</td>
          <td>${item.sales}</td>
          <td>${totals.orderTotal}</td>
          <td>${totals.invoiceTotal}</td>
          <td>${formatAmount(totals.orderAmountTotal)}</td>
          <td>${formatAmount(totals.invoiceAmountTotal)}</td>
          <td><span class="status-pill ${statusClass}">${approvalWorkflowLabel(item.status)}</span></td>
          <td class="period-action">
            <div class="approval-actions-inline">
              <button class="icon-action-btn" data-approval-id="${item.id}" title="查看并审批" aria-label="查看并审批" type="button">&#128065;</button>
              <button class="icon-action-btn" data-approval-history-id="${item.id}" title="查看审批历史" aria-label="查看审批历史" type="button">&#128340;</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
  approvalListBody.querySelectorAll("button[data-approval-id]").forEach((btn) => {
    btn.addEventListener("click", () => showApprovalDetail(btn.dataset.approvalId));
  });
  approvalListBody.querySelectorAll("button[data-approval-history-id]").forEach((btn) => {
    btn.addEventListener("click", () => showApprovalHistoryByRecord(btn.dataset.approvalHistoryId));
  });
  const wrap = approvalListBody.closest(".table-wrap");
  if (wrap) {
    wrap.scrollLeft = 0;
    window.requestAnimationFrame(() => {
      wrap.scrollLeft = 0;
    });
  }
}

function runApprovalQuery() {
  buildApprovalRecordsFromForecastRows();
  state.selectedApprovalId = "";
  showApprovalListPage();
  renderApprovalList();
  setForecastMessage("info", "审批列表查询完成。");
}

function resetApprovalFilters() {
  approvalPeriodFilter.value = "all";
  approvalDirectorFilter.value = "all";
  syncApprovalSalesFilter();
  approvalSalesFilter.value = "all";
  approvalStatusFilter.value = "all";
  runApprovalQuery();
}

function buildApprovalSummaryRows(record, dimension) {
  const buckets = new Map();
  const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];
  const getKey = (row) => {
    if (dimension === "performance") return row.performance;
    if (dimension === "region") return row.region;
    return row.customer;
  };
  record.rows.forEach((row) => {
    const key = getKey(row) || "-";
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        order: 0,
        invoice: 0,
        orderAmount: 0,
        invoiceAmount: 0,
        monthly: Object.fromEntries(months.map((month) => [month, { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }]))
      });
    }
    const hit = buckets.get(key);
    months.forEach((month) => {
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      const orderAmount = getMonthOrderAmount(row, month, record.period);
      const invoiceAmount = getMonthInvoiceAmount(row, month, record.period);
      hit.monthly[month].order += qty;
      hit.monthly[month].invoice += inv;
      hit.monthly[month].orderAmount += orderAmount;
      hit.monthly[month].invoiceAmount += invoiceAmount;
      hit.order += qty;
      hit.invoice += inv;
      hit.orderAmount += orderAmount;
      hit.invoiceAmount += invoiceAmount;
    });
  });
  return [...buckets.values()].sort((a, b) => b.order - a.order);
}

function buildApprovalMonthContext(period, months) {
  const monthList = (months && months.length ? months : monthOrder).slice();
  const ymList = getPeriodAvailableYmList(period, monthList);
  const monthEntries = monthList.map((month, idx) => {
    const ym = ymList[idx] || getYearMonthByPeriodMonth(period, month, monthList);
    const year = String(ym || "").split("-")[0] || getPeriodYear(period);
    return { idx, month, ym, year };
  });
  const yearSegments = [];
  monthEntries.forEach((entry) => {
    const last = yearSegments[yearSegments.length - 1];
    if (!last || last.year !== entry.year) {
      yearSegments.push({ year: entry.year, indices: [entry.idx] });
      return;
    }
    last.indices.push(entry.idx);
  });
  return { monthEntries, yearSegments, crossYear: yearSegments.length > 1 };
}

function formatUnitPrice(qty, amount) {
  const q = Number(qty || 0);
  const a = Number(amount || 0);
  if (!Number.isFinite(q) || q <= 0) return "-";
  if (!Number.isFinite(a)) return "-";
  return formatAmount(a / q);
}

function renderApprovalSummaryHead(headNode, dimensionTitle, period, months) {
  if (!headNode) return;
  const ctx = buildApprovalMonthContext(period, months);
  const monthTopCols = ctx.yearSegments
    .map((seg) => {
      const monthCols = seg.indices.map((idx) => `<th colspan="6">${formatYmSlash(ctx.monthEntries[idx].ym)}</th>`).join("");
      const yearCols = ctx.crossYear ? `<th colspan="4">${seg.year}年度汇总</th>` : "";
      return `${monthCols}${yearCols}`;
    })
    .join("");
  const monthSubCols = ctx.yearSegments
    .map((seg) => {
      const monthCols = seg.indices
        .map(
          () =>
            "<th>订单数量</th><th>订单金额</th><th>订单单价</th><th>开票数量</th><th>开票金额</th><th>开票单价</th>"
        )
        .join("");
      const yearCols = ctx.crossYear
        ? "<th>订单数量汇总</th><th>订单金额汇总</th><th>开票数量汇总</th><th>开票金额汇总</th>"
        : "";
      return `${monthCols}${yearCols}`;
    })
    .join("");
  headNode.innerHTML = `
    <tr>
      <th rowspan="2">${dimensionTitle}</th>
      <th rowspan="2">订单数量汇总</th>
      <th rowspan="2">订单金额汇总</th>
      <th rowspan="2">开票数量汇总</th>
      <th rowspan="2">开票金额汇总</th>
      ${monthTopCols}
    </tr>
    <tr>
      ${monthSubCols}
    </tr>
  `;
}

function renderApprovalSummary(record) {
  const mode = state.approvalSummaryMode;
  summaryByCustomerBtn.classList.toggle("active", mode === "customer");
  summaryByPerformanceBtn.classList.toggle("active", mode === "performance");
  summaryByRegionBtn.classList.toggle("active", mode === "region");
  summaryDetailTab.classList.toggle("active", mode === "detail");

  approvalCustomerPanel.classList.toggle("hidden", mode !== "customer");
  approvalCustomerTableWrap?.classList.toggle("hidden", mode !== "customer");
  approvalSummaryPanel.classList.toggle("hidden", mode === "customer" || mode === "detail");
  approvalDetailDataPanel.classList.toggle("hidden", mode !== "detail");
  const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];
  const ctx = buildApprovalMonthContext(record.period, months);

  if (mode === "customer") {
    renderApprovalSummaryHead(approvalSummaryCustomerHead, "客户", record.period, months);
    const customerRows = buildApprovalSummaryRows(record, "customer");
    const displayTotals = getApprovalDisplayTotals(record);
    const customerRowHtml = customerRows
      .map(
        (item) => `
      <tr>
        <td>${item.key}</td>
        <td>${item.order}</td>
        <td>${formatAmount(item.orderAmount)}</td>
        <td>${item.invoice}</td>
        <td>${formatAmount(item.invoiceAmount)}</td>
        ${ctx.yearSegments
          .map((seg) => {
            const monthCells = seg.indices
              .map((idx) => {
                const month = ctx.monthEntries[idx].month;
                const ordQty = item.monthly[month].order;
                const ordAmt = item.monthly[month].orderAmount;
                const invQty = item.monthly[month].invoice;
                const invAmt = item.monthly[month].invoiceAmount;
                return `<td>${ordQty}</td><td>${formatAmount(ordAmt)}</td><td>${formatUnitPrice(ordQty, ordAmt)}</td><td>${invQty}</td><td>${formatAmount(invAmt)}</td><td>${formatUnitPrice(invQty, invAmt)}</td>`;
              })
              .join("");
            if (!ctx.crossYear) return monthCells;
            const yearTotals = seg.indices.reduce(
              (acc, idx) => {
                const month = ctx.monthEntries[idx].month;
                acc.order += item.monthly[month].order;
                acc.invoice += item.monthly[month].invoice;
                acc.orderAmount += item.monthly[month].orderAmount;
                acc.invoiceAmount += item.monthly[month].invoiceAmount;
                return acc;
              },
              { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
            );
            return `${monthCells}<td>${yearTotals.order}</td><td>${formatAmount(yearTotals.orderAmount)}</td><td>${yearTotals.invoice}</td><td>${formatAmount(yearTotals.invoiceAmount)}</td>`;
          })
          .join("")}
      </tr>
    `
      )
      .join("");
    const customerTotal = customerRows.reduce(
      (acc, item) => {
        months.forEach((month) => {
          acc.monthly[month].order += item.monthly[month].order;
          acc.monthly[month].invoice += item.monthly[month].invoice;
          acc.monthly[month].orderAmount += item.monthly[month].orderAmount;
          acc.monthly[month].invoiceAmount += item.monthly[month].invoiceAmount;
        });
        acc.order += item.order;
        acc.invoice += item.invoice;
        acc.orderAmount += item.orderAmount;
        acc.invoiceAmount += item.invoiceAmount;
        return acc;
      },
      {
        order: 0,
        invoice: 0,
        orderAmount: 0,
        invoiceAmount: 0,
        monthly: Object.fromEntries(months.map((month) => [month, { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }]))
      }
    );
    const customerTotalRow = `
      <tr class="total-row">
        <td class="total-label">汇总</td>
        <td class="total-cell">${displayTotals.orderTotal}</td>
        <td class="total-cell">${formatAmount(displayTotals.orderAmountTotal)}</td>
        <td class="total-cell">${displayTotals.invoiceTotal}</td>
        <td class="total-cell">${formatAmount(displayTotals.invoiceAmountTotal)}</td>
        ${ctx.yearSegments
          .map((seg) => {
            const monthCells = seg.indices
              .map((idx) => {
                const month = ctx.monthEntries[idx].month;
                const ordQty = customerTotal.monthly[month].order;
                const ordAmt = customerTotal.monthly[month].orderAmount;
                const invQty = customerTotal.monthly[month].invoice;
                const invAmt = customerTotal.monthly[month].invoiceAmount;
                return `<td class="total-cell">${ordQty}</td><td class="total-cell">${formatAmount(ordAmt)}</td><td class="total-cell">${formatUnitPrice(
                  ordQty,
                  ordAmt
                )}</td><td class="total-cell">${invQty}</td><td class="total-cell">${formatAmount(invAmt)}</td><td class="total-cell">${formatUnitPrice(
                  invQty,
                  invAmt
                )}</td>`;
              })
              .join("");
            if (!ctx.crossYear) return monthCells;
            const yearTotals = seg.indices.reduce(
              (acc, idx) => {
                const month = ctx.monthEntries[idx].month;
                acc.order += customerTotal.monthly[month].order;
                acc.invoice += customerTotal.monthly[month].invoice;
                acc.orderAmount += customerTotal.monthly[month].orderAmount;
                acc.invoiceAmount += customerTotal.monthly[month].invoiceAmount;
                return acc;
              },
              { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
            );
            return `${monthCells}<td class="total-cell">${yearTotals.order}</td><td class="total-cell">${formatAmount(
              yearTotals.orderAmount
            )}</td><td class="total-cell">${yearTotals.invoice}</td><td class="total-cell">${formatAmount(
              yearTotals.invoiceAmount
            )}</td>`;
          })
          .join("")}
      </tr>
    `;
    approvalSummaryByCustomerBody.innerHTML = `${customerRowHtml}${customerTotalRow}`;
    return;
  }
  if (mode === "detail") return;
  const dimensionTitle = mode === "performance" ? "业绩归属" : "销售大区";
  renderApprovalSummaryHead(approvalSummaryHead, dimensionTitle, record.period, months);
  const rows = buildApprovalSummaryRows(record, mode);
  const summaryRowsHtml = rows
    .map(
      (item) => `
      <tr>
        <td>${item.key}</td>
        <td>${item.order}</td>
        <td>${formatAmount(item.orderAmount)}</td>
        <td>${item.invoice}</td>
        <td>${formatAmount(item.invoiceAmount)}</td>
        ${ctx.yearSegments
          .map((seg) => {
            const monthCells = seg.indices
              .map((idx) => {
                const month = ctx.monthEntries[idx].month;
                const ordQty = item.monthly[month].order;
                const ordAmt = item.monthly[month].orderAmount;
                const invQty = item.monthly[month].invoice;
                const invAmt = item.monthly[month].invoiceAmount;
                return `<td>${ordQty}</td><td>${formatAmount(ordAmt)}</td><td>${formatUnitPrice(ordQty, ordAmt)}</td><td>${invQty}</td><td>${formatAmount(invAmt)}</td><td>${formatUnitPrice(invQty, invAmt)}</td>`;
              })
              .join("");
            if (!ctx.crossYear) return monthCells;
            const yearTotals = seg.indices.reduce(
              (acc, idx) => {
                const month = ctx.monthEntries[idx].month;
                acc.order += item.monthly[month].order;
                acc.invoice += item.monthly[month].invoice;
                acc.orderAmount += item.monthly[month].orderAmount;
                acc.invoiceAmount += item.monthly[month].invoiceAmount;
                return acc;
              },
              { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
            );
            return `${monthCells}<td>${yearTotals.order}</td><td>${formatAmount(yearTotals.orderAmount)}</td><td>${yearTotals.invoice}</td><td>${formatAmount(yearTotals.invoiceAmount)}</td>`;
          })
          .join("")}
      </tr>
    `
    )
    .join("");
  const summaryTotal = rows.reduce(
    (acc, item) => {
      months.forEach((month) => {
        acc.monthly[month].order += item.monthly[month].order;
        acc.monthly[month].invoice += item.monthly[month].invoice;
        acc.monthly[month].orderAmount += item.monthly[month].orderAmount;
        acc.monthly[month].invoiceAmount += item.monthly[month].invoiceAmount;
      });
      acc.order += item.order;
      acc.invoice += item.invoice;
      acc.orderAmount += item.orderAmount;
      acc.invoiceAmount += item.invoiceAmount;
      return acc;
    },
    {
      order: 0,
      invoice: 0,
      orderAmount: 0,
      invoiceAmount: 0,
      monthly: Object.fromEntries(months.map((month) => [month, { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }]))
    }
  );
  const displayTotals = getApprovalDisplayTotals(record);
  const summaryTotalRow = `
    <tr class="total-row">
      <td class="total-label">汇总</td>
      <td class="total-cell">${displayTotals.orderTotal}</td>
      <td class="total-cell">${formatAmount(displayTotals.orderAmountTotal)}</td>
      <td class="total-cell">${displayTotals.invoiceTotal}</td>
      <td class="total-cell">${formatAmount(displayTotals.invoiceAmountTotal)}</td>
      ${ctx.yearSegments
        .map((seg) => {
          const monthCells = seg.indices
            .map((idx) => {
              const month = ctx.monthEntries[idx].month;
              const ordQty = summaryTotal.monthly[month].order;
              const ordAmt = summaryTotal.monthly[month].orderAmount;
              const invQty = summaryTotal.monthly[month].invoice;
              const invAmt = summaryTotal.monthly[month].invoiceAmount;
              return `<td class="total-cell">${ordQty}</td><td class="total-cell">${formatAmount(ordAmt)}</td><td class="total-cell">${formatUnitPrice(
                ordQty,
                ordAmt
              )}</td><td class="total-cell">${invQty}</td><td class="total-cell">${formatAmount(invAmt)}</td><td class="total-cell">${formatUnitPrice(
                invQty,
                invAmt
              )}</td>`;
            })
            .join("");
          if (!ctx.crossYear) return monthCells;
          const yearTotals = seg.indices.reduce(
            (acc, idx) => {
              const month = ctx.monthEntries[idx].month;
              acc.order += summaryTotal.monthly[month].order;
              acc.invoice += summaryTotal.monthly[month].invoice;
              acc.orderAmount += summaryTotal.monthly[month].orderAmount;
              acc.invoiceAmount += summaryTotal.monthly[month].invoiceAmount;
              return acc;
            },
            { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
          );
          return `${monthCells}<td class="total-cell">${yearTotals.order}</td><td class="total-cell">${formatAmount(
            yearTotals.orderAmount
          )}</td><td class="total-cell">${yearTotals.invoice}</td><td class="total-cell">${formatAmount(
            yearTotals.invoiceAmount
          )}</td>`;
        })
        .join("")}
    </tr>
  `;
  approvalSummaryBody.innerHTML = `${summaryRowsHtml}${summaryTotalRow}`;
}

function renderApprovalDetailTable(record) {
  const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];
  const displayTotals = getApprovalDisplayTotals(record);
  const ctx = buildApprovalMonthContext(record.period, months);
  const monthTopHead = ctx.yearSegments
    .map((seg) => {
      const monthCols = seg.indices.map((idx) => `<th colspan="6">${formatYmSlash(ctx.monthEntries[idx].ym)}</th>`).join("");
      const yearCols = ctx.crossYear ? `<th colspan="4">${seg.year}年度汇总</th>` : "";
      return `${monthCols}${yearCols}`;
    })
    .join("");
  const monthSubHead = ctx.yearSegments
    .map((seg) => {
      const monthCols = seg.indices
        .map(
          () =>
            "<th>订单数量</th><th>订单金额</th><th>订单单价</th><th>开票数量</th><th>开票金额</th><th>开票单价</th>"
        )
        .join("");
      const yearCols = ctx.crossYear
        ? "<th>订单数量汇总</th><th>订单金额汇总</th><th>开票数量汇总</th><th>开票金额汇总</th>"
        : "";
      return `${monthCols}${yearCols}`;
    })
    .join("");
  approvalDetailHead.innerHTML = `
    <tr>
      <th rowspan="2">客户</th>
      <th rowspan="2">业绩归属</th>
      <th rowspan="2">销售大区</th>
      <th rowspan="2">PA</th>
      <th rowspan="2">Sub PA-1</th>
      <th rowspan="2">Sub PA-2</th>
      <th rowspan="2">订单数量汇总</th>
      <th rowspan="2">订单金额汇总</th>
      <th rowspan="2">开票数量汇总</th>
      <th rowspan="2">开票金额汇总</th>
      ${monthTopHead}
    </tr>
    <tr>
      ${monthSubHead}
    </tr>
  `;
  const detailRows = record.rows
    .map((row) => {
      const order = months.reduce((sum, month) => sum + Number(row[getQtyKey(month)] || 0), 0);
      const invoice = months.reduce((sum, month) => sum + Number(row[getInvoiceKey(month)] || 0), 0);
      const amounts = calcRowAmounts(row, record.period);
      const monthCells = ctx.yearSegments
        .map((seg) => {
          const monthCols = seg.indices
            .map((idx) => {
              const month = ctx.monthEntries[idx].month;
              const qty = Number(row[getQtyKey(month)] || 0);
              const inv = Number(row[getInvoiceKey(month)] || 0);
              const ordAmt = getMonthOrderAmount(row, month, record.period);
              const invAmt = getMonthInvoiceAmount(row, month, record.period);
              return `<td>${qty}</td><td>${formatAmount(ordAmt)}</td><td>${formatUnitPrice(qty, ordAmt)}</td><td>${inv}</td><td>${formatAmount(
                invAmt
              )}</td><td>${formatUnitPrice(inv, invAmt)}</td>`;
            })
            .join("");
          if (!ctx.crossYear) return monthCols;
          const yearTotals = seg.indices.reduce(
            (acc, idx) => {
              const month = ctx.monthEntries[idx].month;
              const qty = Number(row[getQtyKey(month)] || 0);
              const inv = Number(row[getInvoiceKey(month)] || 0);
              acc.order += qty;
              acc.invoice += inv;
              acc.orderAmount += getMonthOrderAmount(row, month, record.period);
              acc.invoiceAmount += getMonthInvoiceAmount(row, month, record.period);
              return acc;
            },
            { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
          );
          return `${monthCols}<td>${yearTotals.order}</td><td>${formatAmount(yearTotals.orderAmount)}</td><td>${yearTotals.invoice}</td><td>${formatAmount(
            yearTotals.invoiceAmount
          )}</td>`;
        })
        .join("");
      return `
        <tr>
          <td>${row.customer}</td>
          <td>${row.performance}</td>
          <td>${row.region}</td>
          <td>${row.pa}</td>
          <td>${row.subpa1}</td>
          <td>${row.subpa2}</td>
          <td>${order}</td>
          <td>${formatAmount(amounts.orderAmount)}</td>
          <td>${invoice}</td>
          <td>${formatAmount(amounts.invoiceAmount)}</td>
          ${monthCells}
        </tr>
      `;
    })
    .join("");
  const totalByMonth = Object.fromEntries(
    months.map((month) => [month, { qty: 0, inv: 0, orderAmount: 0, invoiceAmount: 0 }])
  );
  let totalOrder = 0;
  let totalInvoice = 0;
  let totalOrderAmount = 0;
  let totalInvoiceAmount = 0;
  record.rows.forEach((row) => {
    months.forEach((month) => {
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      const orderAmount = getMonthOrderAmount(row, month, record.period);
      const invoiceAmount = getMonthInvoiceAmount(row, month, record.period);
      totalByMonth[month].qty += qty;
      totalByMonth[month].inv += inv;
      totalByMonth[month].orderAmount += orderAmount;
      totalByMonth[month].invoiceAmount += invoiceAmount;
      totalOrder += qty;
      totalInvoice += inv;
      totalOrderAmount += orderAmount;
      totalInvoiceAmount += invoiceAmount;
    });
  });
  const totalMonthCells = ctx.yearSegments
    .map((seg) => {
      const monthCols = seg.indices
        .map((idx) => {
          const month = ctx.monthEntries[idx].month;
          const qty = totalByMonth[month].qty;
          const inv = totalByMonth[month].inv;
          const ordAmt = totalByMonth[month].orderAmount;
          const invAmt = totalByMonth[month].invoiceAmount;
          return `<td class="total-cell">${qty}</td><td class="total-cell">${formatAmount(ordAmt)}</td><td class="total-cell">${formatUnitPrice(
            qty,
            ordAmt
          )}</td><td class="total-cell">${inv}</td><td class="total-cell">${formatAmount(invAmt)}</td><td class="total-cell">${formatUnitPrice(
            inv,
            invAmt
          )}</td>`;
        })
        .join("");
      if (!ctx.crossYear) return monthCols;
      const yearTotals = seg.indices.reduce(
        (acc, idx) => {
          const month = ctx.monthEntries[idx].month;
          acc.order += totalByMonth[month].qty;
          acc.invoice += totalByMonth[month].inv;
          acc.orderAmount += totalByMonth[month].orderAmount;
          acc.invoiceAmount += totalByMonth[month].invoiceAmount;
          return acc;
        },
        { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
      );
      return `${monthCols}<td class="total-cell">${yearTotals.order}</td><td class="total-cell">${formatAmount(
        yearTotals.orderAmount
      )}</td><td class="total-cell">${yearTotals.invoice}</td><td class="total-cell">${formatAmount(yearTotals.invoiceAmount)}</td>`;
    })
    .join("");
  const totalRow = `
    <tr class="total-row">
      <td class="total-label" colspan="6">汇总</td>
      <td class="total-cell">${displayTotals.orderTotal}</td>
      <td class="total-cell">${formatAmount(displayTotals.orderAmountTotal)}</td>
      <td class="total-cell">${displayTotals.invoiceTotal}</td>
      <td class="total-cell">${formatAmount(displayTotals.invoiceAmountTotal)}</td>
      ${totalMonthCells}
    </tr>
  `;
  approvalDetailBody.innerHTML = `${detailRows}${totalRow}`;
}

function exportApprovalDetailCsv() {
  const record = approvalRecords.find((item) => item.id === state.selectedApprovalId);
  if (!record) {
    setForecastMessage("error", "请先选择一条审批记录。");
    return;
  }
  const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];
  const ctx = buildApprovalMonthContext(record.period, months);
  const headers = [
    "客户",
    "业绩归属",
    "销售大区",
    "PA",
    "Sub PA-1",
    "Sub PA-2",
    "订单数量汇总",
    "订单金额汇总",
    "开票数量汇总",
    "开票金额汇总"
  ];
  ctx.yearSegments.forEach((seg) => {
    seg.indices.forEach((idx) => {
      const ym = formatYmSlash(ctx.monthEntries[idx].ym);
      headers.push(
        `${ym}-订单数量`,
        `${ym}-订单金额`,
        `${ym}-订单单价`,
        `${ym}-开票数量`,
        `${ym}-开票金额`,
        `${ym}-开票单价`
      );
    });
    if (ctx.crossYear) {
      headers.push(
        `${seg.year}年度汇总-订单数量汇总`,
        `${seg.year}年度汇总-订单金额汇总`,
        `${seg.year}年度汇总-开票数量汇总`,
        `${seg.year}年度汇总-开票金额汇总`
      );
    }
  });

  const asFixed2 = (value) => {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return "";
    return num.toFixed(2);
  };
  const unitPrice = (qty, amount) => {
    const q = Number(qty || 0);
    const a = Number(amount || 0);
    if (!q || !Number.isFinite(a)) return "";
    return (a / q).toFixed(2);
  };

  const rows = record.rows.map((row) => {
    const orderQtyTotal = months.reduce((sum, month) => sum + Number(row[getQtyKey(month)] || 0), 0);
    const invoiceQtyTotal = months.reduce((sum, month) => sum + Number(row[getInvoiceKey(month)] || 0), 0);
    const amounts = calcRowAmounts(row, record.period);
    const cells = [
      row.customer ?? "",
      row.performance ?? "",
      row.region ?? "",
      row.pa ?? "",
      row.subpa1 ?? "",
      row.subpa2 ?? "",
      orderQtyTotal,
      asFixed2(amounts.orderAmount),
      invoiceQtyTotal,
      asFixed2(amounts.invoiceAmount)
    ];
    ctx.yearSegments.forEach((seg) => {
      seg.indices.forEach((idx) => {
        const month = ctx.monthEntries[idx].month;
        const qty = Number(row[getQtyKey(month)] || 0);
        const inv = Number(row[getInvoiceKey(month)] || 0);
        const ordAmt = getMonthOrderAmount(row, month, record.period);
        const invAmt = getMonthInvoiceAmount(row, month, record.period);
        cells.push(qty, asFixed2(ordAmt), unitPrice(qty, ordAmt), inv, asFixed2(invAmt), unitPrice(inv, invAmt));
      });
      if (ctx.crossYear) {
        const yearTotals = seg.indices.reduce(
          (acc, idx) => {
            const month = ctx.monthEntries[idx].month;
            const qty = Number(row[getQtyKey(month)] || 0);
            const inv = Number(row[getInvoiceKey(month)] || 0);
            acc.order += qty;
            acc.invoice += inv;
            acc.orderAmount += getMonthOrderAmount(row, month, record.period);
            acc.invoiceAmount += getMonthInvoiceAmount(row, month, record.period);
            return acc;
          },
          { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
        );
        cells.push(yearTotals.order, asFixed2(yearTotals.orderAmount), yearTotals.invoice, asFixed2(yearTotals.invoiceAmount));
      }
    });
    return cells;
  });

  const displayTotals = getApprovalDisplayTotals(record);
  const totalByMonth = Object.fromEntries(months.map((month) => [month, { qty: 0, inv: 0, orderAmount: 0, invoiceAmount: 0 }]));
  record.rows.forEach((row) => {
    months.forEach((month) => {
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      totalByMonth[month].qty += qty;
      totalByMonth[month].inv += inv;
      totalByMonth[month].orderAmount += getMonthOrderAmount(row, month, record.period);
      totalByMonth[month].invoiceAmount += getMonthInvoiceAmount(row, month, record.period);
    });
  });
  const totalRow = [
    "汇总",
    "",
    "",
    "",
    "",
    "",
    displayTotals.orderTotal,
    asFixed2(displayTotals.orderAmountTotal),
    displayTotals.invoiceTotal,
    asFixed2(displayTotals.invoiceAmountTotal)
  ];
  ctx.yearSegments.forEach((seg) => {
    seg.indices.forEach((idx) => {
      const month = ctx.monthEntries[idx].month;
      const qty = totalByMonth[month].qty;
      const inv = totalByMonth[month].inv;
      const ordAmt = totalByMonth[month].orderAmount;
      const invAmt = totalByMonth[month].invoiceAmount;
      totalRow.push(qty, asFixed2(ordAmt), unitPrice(qty, ordAmt), inv, asFixed2(invAmt), unitPrice(inv, invAmt));
    });
    if (ctx.crossYear) {
      const yearTotals = seg.indices.reduce(
        (acc, idx) => {
          const month = ctx.monthEntries[idx].month;
          acc.order += totalByMonth[month].qty;
          acc.invoice += totalByMonth[month].inv;
          acc.orderAmount += totalByMonth[month].orderAmount;
          acc.invoiceAmount += totalByMonth[month].invoiceAmount;
          return acc;
        },
        { order: 0, invoice: 0, orderAmount: 0, invoiceAmount: 0 }
      );
      totalRow.push(yearTotals.order, asFixed2(yearTotals.orderAmount), yearTotals.invoice, asFixed2(yearTotals.invoiceAmount));
    }
  });
  rows.push(totalRow);

  const safePeriod = String(record.period || "period").replace(/[\\/:*?"<>|]/g, "_");
  const safeSales = String(record.sales || "sales").replace(/[\\/:*?"<>|]/g, "_");
  downloadCsv(`审批明细_${safePeriod}_${safeSales}.csv`, headers, rows);
}

function showApprovalDetail(id) {
  const record = approvalRecords.find((item) => item.id === id);
  if (!record) return;
  if (state.selectedApprovalId !== id) {
    state.approvalSummaryMode = "customer";
  }
  state.selectedApprovalId = id;
  showApprovalDetailPage();
  approvalDetailTitle.textContent = `审批明细 · ${record.period} · ${record.sales}`;
  renderApprovalSummary(record);
  renderApprovalDetailTable(record);
  updateApprovalActionButtons(record);
}

function openApprovalOpinionDialog(action) {
  const record = approvalRecords.find((item) => item.id === state.selectedApprovalId);
  if (!record) {
    setForecastMessage("error", "请先选择一条审批记录。");
    return;
  }
  state.pendingApprovalAction = action;
  approvalOpinionTitle.textContent = action === "pass" ? "通过审批意见" : "退回审批意见";
  approvalOpinionInput.value = "";
  approvalOpinionDialog.showModal();
}

function openApprovalAdjustDialog() {
  const record = approvalRecords.find((item) => item.id === state.selectedApprovalId);
  if (!record) {
    setForecastMessage("error", "请先选择一条审批记录。");
    return;
  }
  if (record.status === "approved") {
    setForecastMessage("error", "已通过的记录不允许调整。");
    return;
  }
  const baseTotals = getApprovalDisplayTotals({ ...record, overrideTotals: null });
  const currentTotals = getApprovalDisplayTotals(record);
  if (approvalAdjustOrderAmountInput) approvalAdjustOrderAmountInput.value = String(currentTotals.orderAmountTotal ?? baseTotals.orderAmountTotal ?? 0);
  if (approvalAdjustOrderQtyInput) approvalAdjustOrderQtyInput.value = String(currentTotals.orderTotal ?? baseTotals.orderTotal ?? 0);
  if (approvalAdjustInvoiceAmountInput) approvalAdjustInvoiceAmountInput.value = String(currentTotals.invoiceAmountTotal ?? baseTotals.invoiceAmountTotal ?? 0);
  if (approvalAdjustInvoiceQtyInput) approvalAdjustInvoiceQtyInput.value = String(currentTotals.invoiceTotal ?? baseTotals.invoiceTotal ?? 0);
  if (approvalAdjustRemarkInput) approvalAdjustRemarkInput.value = "";
  approvalAdjustDialog?.showModal();
}

function submitApprovalAdjust() {
  const record = approvalRecords.find((item) => item.id === state.selectedApprovalId);
  if (!record) return;
  if (record.status === "approved") {
    setForecastMessage("error", "已通过的记录不允许调整。");
    return;
  }

  const orderAmountTotal = Number(approvalAdjustOrderAmountInput?.value ?? "");
  const orderTotal = Number(approvalAdjustOrderQtyInput?.value ?? "");
  const invoiceAmountTotal = Number(approvalAdjustInvoiceAmountInput?.value ?? "");
  const invoiceTotal = Number(approvalAdjustInvoiceQtyInput?.value ?? "");
  const remark = String(approvalAdjustRemarkInput?.value ?? "").trim();

  if (!Number.isFinite(orderAmountTotal) || !Number.isFinite(orderTotal) || !Number.isFinite(invoiceAmountTotal) || !Number.isFinite(invoiceTotal)) {
    setForecastMessage("error", "调整数值格式不正确，请输入数字。");
    return;
  }
  if (!remark) {
    setForecastMessage("error", "请填写调整备注说明。");
    return;
  }
  if (orderTotal < 0 || invoiceTotal < 0) {
    setForecastMessage("error", "调整数量不能为负数。");
    return;
  }

  const baseTotals = getApprovalDisplayTotals({ ...record, overrideTotals: null });
  record.overrideTotals = {
    orderTotal,
    invoiceTotal,
    orderAmountTotal,
    invoiceAmountTotal,
    base: baseTotals,
    remark,
    time: new Date().toISOString(),
    actor: currentUserName || "-"
  };

  const opinion = `调整并退回：订单总金额=${formatAmount(orderAmountTotal)}，订单总数量=${orderTotal}；开票总金额=${formatAmount(invoiceAmountTotal)}，开票总数量=${invoiceTotal}；备注=${remark}`;
  approvalAdjustDialog?.close();
  changeApprovalStatus("reject", opinion);
  recordOperationEvent({
    module: "销售预测审核",
    action: "调整并退回",
    detail: `${record.period || "-"} · ${record.sales || "-"}`
  });
}

function submitApprovalOpinion() {
  const opinion = (approvalOpinionInput.value || "").trim();
  if (!opinion) {
    setForecastMessage("error", "请填写审批意见后再提交。");
    return;
  }
  const action = state.pendingApprovalAction;
  approvalOpinionDialog.close();
  state.pendingApprovalAction = "";
  changeApprovalStatus(action, opinion);
}

function changeApprovalStatus(action, opinion = "") {
  const record = approvalRecords.find((item) => item.id === state.selectedApprovalId);
  if (!record) return;
  const fromStatus = record.status;
  if (action === "reject") {
    record.status = "rejected";
  } else if (record.status === "draft" || record.status === "rejected") {
    record.status = "submitted_director";
  } else if (record.status === "submitted_director") {
    record.status = "submitted_finance";
  } else if (record.status === "submitted_finance") {
    record.status = "approved";
  }
  record.lastOpinion = opinion;
  let actor = "审批人";
  if (record.status === "submitted_director") actor = record.sales;
  if (record.status === "submitted_finance") actor = record.director;
  if (record.status === "approved") actor = "财务主管";
  if (record.status === "rejected") actor = fromStatus === "submitted_finance" ? "财务主管" : record.director;
  appendApprovalHistory(record, record.status, opinion, actor);
  recordOperationEvent({
    module: "销售预测审核",
    action: action === "reject" ? "退回审批" : "通过审批",
    detail: `${record.period || "-"} · ${record.sales || "-"} · ${approvalWorkflowLabel(fromStatus)} -> ${approvalWorkflowLabel(record.status)}`
  });
  renderApprovalList();
  showApprovalDetail(record.id);
  setForecastMessage("success", `审批已更新：${approvalWorkflowLabel(record.status)}。审批意见：${opinion}`);
}

function showApprovalListPage() {
  approvalListPage.classList.remove("hidden");
  approvalDetailPage.classList.add("hidden");
  approvalFilters?.classList.remove("hidden");
}

function showApprovalDetailPage() {
  approvalListPage.classList.add("hidden");
  approvalDetailPage.classList.remove("hidden");
  approvalFilters?.classList.add("hidden");
}

function showApprovalWorkbench() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  hideForecastPage2Panels();
  approvalWorkbench.classList.remove("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  hideSystemWorkbench();
  buildApprovalRecordsFromForecastRows();
  showApprovalListPage();
  renderApprovalFilters();
  renderApprovalList();
  const wrap = approvalListBody?.closest(".table-wrap");
  if (wrap) wrap.scrollLeft = 0;
}

function showApprovalHistoryByPeriod(period) {
  const rows = approvalRecords
    .filter((record) => record.period === period)
    .flatMap((record) =>
      (record.history || []).map((item) => ({
        time: item.time,
        sales: record.sales,
        status: item.status,
        opinion: item.opinion,
        actor: item.actor
      }))
    )
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));

  renderApprovalHistoryTimeline(`审批历史 · ${period}`, rows);
}

function showApprovalHistoryByRecord(id) {
  const record = approvalRecords.find((item) => item.id === id);
  if (!record) return;
  const rows = (record.history || [])
    .map((item) => ({
      time: item.time,
      sales: record.sales,
      status: item.status,
      opinion: item.opinion,
      actor: item.actor
    }))
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  renderApprovalHistoryTimeline(`审批历史 · ${record.period} · ${record.sales}`, rows);
}

function renderApprovalHistoryTimeline(title, rows) {
  approvalHistoryTitle.textContent = title;
  if (!rows.length) {
    approvalHistoryBody.innerHTML = `<div class="period-empty">暂无审批历史记录。</div>`;
  } else {
    approvalHistoryBody.innerHTML = rows
      .map(
        (row) => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-head">
              <span class="timeline-time">${String(row.time).replace("T", " ").slice(0, 19)}</span>
              <span class="status-pill status-${row.status}">${approvalWorkflowLabel(row.status)}</span>
            </div>
            <div class="timeline-meta">销售人员：${row.sales} · 操作人：${row.actor || "-"}</div>
            <div class="timeline-opinion">${row.opinion || "-"}</div>
          </div>
        </div>
      `
      )
      .join("");
  }
  approvalHistoryDialog.showModal();
}

function getAllSalesUsers() {
  return Object.values(directorSalesMap).flat();
}

let fcDelaySalesSelection = new Set();

function buildDelaySalesCandidates() {
  return Object.entries(directorSalesMap).flatMap(([director, salesList]) =>
    salesList.map((sales) => ({ name: sales, director, status: "启用" }))
  );
}

function formatDelaySales(record) {
  if (!record.delaySales?.length) return "未指定";
  if (record.delaySales.length <= 6) return record.delaySales.join("、");
  return `${record.delaySales.slice(0, 6).join("、")} 等${record.delaySales.length}人`;
}

function renderDelaySalesSelector() {
  if (!fcDelaySalesList) return;
  const keyword = fcDelaySalesSearchInput?.value.trim() || "";
  const candidates = buildDelaySalesCandidates().filter((item) => item.name.includes(keyword));
  if (!candidates.length) {
    fcDelaySalesList.innerHTML = `
      <table>
        <tbody>
          <tr><td class="empty">未找到匹配人员</td></tr>
        </tbody>
      </table>
    `;
    return;
  }
  fcDelaySalesList.innerHTML = `
    <table>
      <thead>
        <tr>
          <th style="width:66px;">选择</th>
          <th>销售人员</th>
          <th>区域总监</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${candidates
          .map(
            (item) => `
          <tr>
            <td>
              <input
                type="checkbox"
                data-delay-sales="${item.name}"
                ${fcDelaySalesSelection.has(item.name) ? "checked" : ""}
              />
            </td>
            <td>${item.name}</td>
            <td>${item.director}</td>
            <td>${item.status}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderFcVersionList() {
  if (fcVersionRecords.length === 0) {
    fcVersionBody.innerHTML = `<tr><td colspan="6" class="period-empty">暂无预测周期，请先新增。</td></tr>`;
    return;
  }
  fcVersionBody.innerHTML = fcVersionRecords
    .map(
      (item) => `
      <tr>
        <td>${item.version}</td>
        <td>${item.salesStartMonth} ~ ${item.salesEndMonth}</td>
        <td>${item.openStart.replace("T", " ")} ~ ${item.openEnd.replace("T", " ")}</td>
        <td>${item.delayStart ? item.delayStart.replace("T", " ") : "-"} ~ ${item.delayEnd ? item.delayEnd.replace("T", " ") : "-"}</td>
        <td>${formatDelaySales(item)}</td>
        <td class="period-action">
          <button
            class="icon-action-btn"
            data-fc-edit="${item.id}"
            title="编辑预测周期"
            aria-label="编辑预测周期"
            type="button"
          >
            &#9998;
          </button>
          <button
            class="icon-action-btn"
            data-fc-del="${item.id}"
            title="删除预测周期"
            aria-label="删除预测周期"
            type="button"
          >
            &#128465;
          </button>
        </td>
      </tr>
    `
    )
    .join("");

  fcVersionBody.querySelectorAll("button[data-fc-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openFcVersionDialog(btn.dataset.fcEdit));
  });
  fcVersionBody.querySelectorAll("button[data-fc-del]").forEach((btn) => {
    btn.addEventListener("click", () => deleteFcVersion(btn.dataset.fcDel));
  });
}

function openFcVersionDialog(id = "") {
  state.editingFcVersionId = id;
  const editing = fcVersionRecords.find((item) => item.id === id);
  fcVersionDialogTitle.textContent = editing ? "编辑预测周期" : "新增预测周期";
  fcVersionNameInput.value = editing?.version || "";
  fcSalesStartMonthInput.value = editing?.salesStartMonth || "";
  fcSalesEndMonthInput.value = editing?.salesEndMonth || "";
  fcOpenStartInput.value = editing?.openStart || "";
  fcOpenEndInput.value = editing?.openEnd || "";
  fcDelayStartInput.value = editing?.delayStart || "";
  fcDelayEndInput.value = editing?.delayEnd || "";
  if (fcDelaySalesSearchInput) fcDelaySalesSearchInput.value = "";
  fcDelaySalesSelection = new Set(editing?.delaySales || []);
  renderDelaySalesSelector();
  fcVersionDialog.showModal();
}

function saveFcVersion() {
  const version = fcVersionNameInput.value.trim();
  const salesStartMonth = fcSalesStartMonthInput.value;
  const salesEndMonth = fcSalesEndMonthInput.value;
  const openStart = fcOpenStartInput.value;
  const openEnd = fcOpenEndInput.value;
  const delayStart = fcDelayStartInput.value;
  const delayEnd = fcDelayEndInput.value;
  const delaySales = [...fcDelaySalesSelection];
  const isEdit = Boolean(state.editingFcVersionId);

  if (!version || !salesStartMonth || !salesEndMonth || !openStart || !openEnd || !delayStart || !delayEnd) {
    setForecastMessage("error", "请完整填写预测周期名称、销售预测周期、填报时间与延期填报时间。");
    return;
  }
  if (salesStartMonth > salesEndMonth) {
    setForecastMessage("error", "销售预测周期开始年月不能晚于结束年月。");
    return;
  }
  if (openStart > openEnd) {
    setForecastMessage("error", "填报开始时间不能晚于结束时间。");
    return;
  }
  if (delayStart > delayEnd) {
    setForecastMessage("error", "延期填报开始时间不能晚于结束时间。");
    return;
  }
  const duplicate = fcVersionRecords.find(
    (item) => item.version === version && item.id !== state.editingFcVersionId
  );
  if (duplicate) {
    setForecastMessage("error", "预测周期名称已存在，请修改后重试。");
    return;
  }
  if (delaySales.length === 0) {
    setForecastMessage("error", "请至少选择一位可延期填报人员。");
    return;
  }

  const payload = {
    id: state.editingFcVersionId || `fcv_${fcVersionSeed++}`,
    version,
    salesStartMonth,
    salesEndMonth,
    openStart,
    openEnd,
    delayStart,
    delayEnd,
    delaySales
  };

  const existsIdx = fcVersionRecords.findIndex((item) => item.id === payload.id);
  if (existsIdx >= 0) {
    fcVersionRecords.splice(existsIdx, 1, payload);
  } else {
    fcVersionRecords.push(payload);
  }
  syncPeriodRecordsFromFcVersions();
  buildApprovalRecordsFromForecastRows();
  renderFcVersionList();
  renderPeriodList();
  renderPeriodList2();
  renderApprovalFilters();
  fcVersionDialog.close();
  setForecastMessage("success", "预测周期已保存。");
  recordOperationEvent({
    module: "预测周期管理",
    action: isEdit ? "编辑预测周期" : "新增预测周期",
    detail: `${version}（${salesStartMonth}~${salesEndMonth}）`
  });
}

function deleteFcVersion(id) {
  const idx = fcVersionRecords.findIndex((item) => item.id === id);
  if (idx < 0) return;
  const deleted = fcVersionRecords[idx];
  fcVersionRecords.splice(idx, 1);
  syncPeriodRecordsFromFcVersions();
  buildApprovalRecordsFromForecastRows();
  renderFcVersionList();
  renderPeriodList();
  renderPeriodList2();
  renderApprovalFilters();
  setForecastMessage("success", "预测周期已删除。");
  recordOperationEvent({ module: "预测周期管理", action: "删除预测周期", detail: deleted?.version || id || "-" });
}

function showFcVersionWorkbench() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  hideForecastPage2Panels();
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.remove("hidden");
  baseDataWorkbench.classList.add("hidden");
  hideSystemWorkbench();
  renderFcVersionList();
}

function getCurrentBaseStore() {
  return baseDataStores[state.activeModule];
}

function renderBaseDataTable() {
  const store = getCurrentBaseStore();
  if (!store) return;
  baseDataHead.innerHTML = `
    <tr>
      ${store.columns.map((col) => `<th>${col.label}</th>`).join("")}
      <th>操作</th>
    </tr>
  `;
  if (!store.rows.length) {
    baseDataBody.innerHTML = `<tr><td colspan="${store.columns.length + 1}" class="period-empty">暂无数据，请点击新增。</td></tr>`;
    return;
  }
  baseDataBody.innerHTML = store.rows
    .map(
      (row) => `
      <tr>
        ${store.columns.map((col) => `<td>${row[col.key] ?? "-"}</td>`).join("")}
        <td class="period-action">
          <button class="icon-action-btn" data-base-edit="${row.id}" title="编辑" aria-label="编辑" type="button">&#9998;</button>
          <button class="icon-action-btn" data-base-del="${row.id}" title="删除" aria-label="删除" type="button">&#128465;</button>
        </td>
      </tr>
    `
    )
    .join("");
  baseDataBody.querySelectorAll("button[data-base-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openBaseDataDialog(btn.dataset.baseEdit));
  });
  baseDataBody.querySelectorAll("button[data-base-del]").forEach((btn) => {
    btn.addEventListener("click", () => deleteBaseDataRow(btn.dataset.baseDel));
  });
}

function openBaseDataDialog(id = "") {
  const store = getCurrentBaseStore();
  if (!store) return;
  state.editingBaseRowId = id;
  const row = store.rows.find((item) => item.id === id) || {};
  baseDataDialogTitle.textContent = id ? `编辑${state.activeModule}` : `新增${state.activeModule}`;
  baseDataForm.innerHTML = store.fields
    .map((field) => {
      if (field.type === "select") {
        const options = field.options
          .map((option) => `<option value="${option}" ${String(row[field.key] || "") === String(option) ? "selected" : ""}>${option}</option>`)
          .join("");
        return `<label>${field.label}<select data-field="${field.key}">${options}</select></label>`;
      }
      return `<label>${field.label}<input type="${field.type || "text"}" data-field="${field.key}" value="${row[field.key] ?? ""}" /></label>`;
    })
    .join("");
  baseDataDialog.showModal();
}

function saveBaseDataRow() {
  const store = getCurrentBaseStore();
  if (!store) return;
  const payload = {};
  for (const field of store.fields) {
    const node = baseDataForm.querySelector(`[data-field="${field.key}"]`);
    const value = String(node?.value ?? "").trim();
    if (field.required && !value) {
      setForecastMessage("error", `请填写${field.label}。`);
      return;
    }
    payload[field.key] = field.type === "number" ? Number(value || 0) : value;
  }
  if (state.editingBaseRowId) {
    const idx = store.rows.findIndex((item) => item.id === state.editingBaseRowId);
    if (idx >= 0) store.rows.splice(idx, 1, { ...store.rows[idx], ...payload });
  } else {
    store.rows.push({ id: `base_${baseRowSeed++}`, ...payload });
  }
  baseDataDialog.close();
  renderBaseDataTable();
  setForecastMessage("success", "基础数据已保存。");
  const firstField = store.fields[0]?.key;
  const keyLabel = firstField ? String(payload[firstField] ?? "") : "";
  recordOperationEvent({
    module: state.activeModule,
    action: state.editingBaseRowId ? "编辑基础数据" : "新增基础数据",
    detail: keyLabel || "-"
  });
}

function deleteBaseDataRow(id) {
  const store = getCurrentBaseStore();
  if (!store) return;
  const idx = store.rows.findIndex((item) => item.id === id);
  if (idx < 0) return;
  const firstField = store.fields[0]?.key;
  const keyLabel = firstField ? String(store.rows[idx]?.[firstField] ?? "") : "";
  store.rows.splice(idx, 1);
  renderBaseDataTable();
  setForecastMessage("success", "基础数据已删除。");
  recordOperationEvent({ module: state.activeModule, action: "删除基础数据", detail: keyLabel || id || "-" });
}

function showBaseDataWorkbench(moduleName) {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  hideForecastPage2Panels();
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.remove("hidden");
  hideSystemWorkbench();
  baseDataTitle.textContent = `${moduleName}维护`;
  renderBaseDataTable();
}

function ensureDashboardChartInstance() {
  if (!window.echarts) return false;
  const defs = [
    ["trend", dashboardTrendChartEl],
    ["regionShare", dashboardRegionShareChartEl],
    ["industryShare", dashboardIndustryShareChartEl],
    ["share", dashboardShareChartEl],
    ["company", dashboardCompanyChartEl],
    ["product", dashboardProductChartEl]
  ];
  for (const [key, el] of defs) {
    if (!el) return false;
    if (!dashboardCharts[key]) dashboardCharts[key] = window.echarts.init(el);
  }
  return true;
}

function getCurrentDashboardPeriod() {
  const open = periodRecords.find((item) => item.status === "open");
  if (open) return open.period;
  const periods = [...new Set(forecastRows.map((row) => row.period))].sort((a, b) => (a < b ? 1 : -1));
  return periods[0] || "2026FC1";
}

function getDashboardRows() {
  const period = getCurrentDashboardPeriod();
  return forecastRows.filter((row) => row.period === period);
}

function groupRowsBy(rows, keyResolver, ymScope = []) {
  const map = new Map();
  const ymEntries = (ymScope || []).map((ym) => {
    const [year, mm] = String(ym).split("-");
    const month = monthOrder[Number(mm) - 1];
    return { ym, month, year: Number(year) };
  });
  rows.forEach((row) => {
    const key = keyResolver(row) || "-";
    if (!map.has(key)) map.set(key, { key, orderQty: 0, invoiceQty: 0, orderAmount: 0, invoiceAmount: 0 });
    const hit = map.get(key);
    ymEntries.forEach(({ month, year }) => {
      if (!month || !year) return;
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      const orderAmount = getMonthOrderAmountByYear(row, month, year);
      const invoiceAmount = getMonthInvoiceAmountByYear(row, month, year);
      hit.orderQty += qty;
      hit.invoiceQty += inv;
      hit.orderAmount += orderAmount;
      hit.invoiceAmount += invoiceAmount;
    });
  });
  return [...map.values()];
}

function normalizeCompanyName(name) {
  return String(name || "")
    .replace(/股份有限公司/g, "")
    .replace(/有限公司/g, "")
    .trim();
}

function buildTopRows(rows, metricKey, topN = 10, candidates = []) {
  const sorted = [...rows].sort((a, b) => Number(b[metricKey] || 0) - Number(a[metricKey] || 0));
  const used = new Set(sorted.map((item) => item.key));
  const result = sorted.slice(0, topN);
  const positive = sorted.map((item) => Number(item[metricKey] || 0)).filter((v) => v > 0);
  const baseSeed = positive.length ? Math.max(positive[positive.length - 1] * 0.4, 1) : 1000;
  let seedIndex = 0;
  for (const candidate of candidates) {
    if (result.length >= topN) break;
    if (used.has(candidate)) continue;
    const seed = Number((baseSeed * Math.max(0.35, 0.95 - seedIndex * 0.12)).toFixed(2));
    result.push({
      key: candidate,
      orderQty: Math.max(1, Math.round(seed / 20)),
      invoiceQty: Math.max(1, Math.round(seed / 24)),
      orderAmount: seed,
      invoiceAmount: Number((seed * 0.88).toFixed(2))
    });
    used.add(candidate);
    seedIndex += 1;
  }
  return result.slice(0, topN);
}

function calcPeriodTotals(rows, ymScope = []) {
  const ymEntries = (ymScope || []).map((ym) => {
    const [year, mm] = String(ym).split("-");
    const month = monthOrder[Number(mm) - 1];
    return { ym, month, year: Number(year) };
  });
  const monthAgg = Object.fromEntries(ymEntries.map(({ ym }) => [ym, { orderAmount: 0, invoiceAmount: 0, orderQty: 0, invoiceQty: 0 }]));
  let orderQty = 0;
  let invoiceQty = 0;
  let orderAmount = 0;
  let invoiceAmount = 0;
  let filledCount = 0;
  rows.forEach((row) => {
    let rowFilled = false;
    ymEntries.forEach(({ ym, month, year }) => {
      if (!month || !year) return;
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      const oa = getMonthOrderAmountByYear(row, month, year);
      const ia = getMonthInvoiceAmountByYear(row, month, year);
      if (qty > 0 || inv > 0) rowFilled = true;
      orderQty += qty;
      invoiceQty += inv;
      orderAmount += oa;
      invoiceAmount += ia;
      if (monthAgg[ym]) {
        monthAgg[ym].orderAmount += oa;
        monthAgg[ym].invoiceAmount += ia;
        monthAgg[ym].orderQty += qty;
        monthAgg[ym].invoiceQty += inv;
      }
    });
    if (rowFilled) {
      filledCount += 1;
    }
  });
  const totalCount = rows.length;
  const completionRate = totalCount ? (filledCount / totalCount) * 100 : 0;
  return { orderQty, invoiceQty, orderAmount, invoiceAmount, monthAgg, completionRate, filledCount, totalCount };
}

function calcYoY(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function getPrevYearPeriod(period) {
  const match = String(period || "").match(/^(\d{4})(.*)$/);
  if (!match) return "";
  const year = Number(match[1]);
  if (!year) return "";
  return `${year - 1}${match[2]}`;
}

function resolveDashboardMonthRange(openYmAll) {
  const ymList = (openYmAll || []).slice();
  if (!ymList.length) {
    state.dashboardMonthStart = "";
    state.dashboardMonthEnd = "";
    return { selectedMonths: [], start: "", end: "" };
  }
  let start = state.dashboardMonthStart;
  let end = state.dashboardMonthEnd;
  if (!ymList.includes(start)) start = ymList[0];
  if (!ymList.includes(end)) end = ymList[ymList.length - 1];
  let startIdx = ymList.indexOf(start);
  let endIdx = ymList.indexOf(end);
  if (startIdx > endIdx) [startIdx, endIdx] = [endIdx, startIdx];
  const selectedMonths = ymList.slice(startIdx, endIdx + 1);
  state.dashboardMonthStart = ymList[startIdx];
  state.dashboardMonthEnd = ymList[endIdx];
  return { selectedMonths, start: state.dashboardMonthStart, end: state.dashboardMonthEnd };
}

function syncDashboardMonthFilterControls(openYmAll = []) {
  if (!dashboardMonthStart || !dashboardMonthEnd) return;
  const ymList = (openYmAll || []).slice();
  const fill = (el, selected, role) => {
    el.innerHTML = "";
    ymList.forEach((ym) => {
      const option = document.createElement("option");
      option.value = ym;
      option.textContent = ym;
      if (ym === selected) option.selected = true;
      el.appendChild(option);
    });
    el.title = role;
  };
  fill(dashboardMonthStart, state.dashboardMonthStart, "开始年月");
  fill(dashboardMonthEnd, state.dashboardMonthEnd, "结束年月");
  dashboardMonthStart.disabled = ymList.length === 0;
  dashboardMonthEnd.disabled = ymList.length === 0;
}

function calcPendingApprovalStats() {
  buildApprovalRecordsFromForecastRows();
  let directorPending = 0;
  let financePending = 0;
  approvalRecords.forEach((item) => {
    if (item.status === "submitted_director") directorPending += 1;
    if (item.status === "submitted_finance") financePending += 1;
  });
  return { directorPending, financePending, total: directorPending + financePending };
}

function buildDashboardSnapshot() {
  const period = getCurrentDashboardPeriod();
  const periodInfo = periodRecords.find((item) => item.period === period);
  const openMonthsAll = (periodInfo?.months || periodWindows[period] || monthOrder).slice();
  const openYmAll = getPeriodAvailableYmList(period, openMonthsAll);
  const monthRange = resolveDashboardMonthRange(openYmAll);
  const openYmRange = monthRange.selectedMonths.length ? monthRange.selectedMonths : openYmAll;
  const prevYmRange = shiftYmListByYear(openYmRange, -1);
  const rows = getDashboardRows();
  const prevPeriod = getPrevYearPeriod(period);
  const prevRows = prevPeriod ? forecastRows.filter((row) => row.period === prevPeriod) : [];
  const nowTotals = calcPeriodTotals(rows, openYmRange);
  const prevTotals = calcPeriodTotals(prevRows, prevYmRange);

  const byCompany = groupRowsBy(rows, (row) => row.invoice, openYmRange);
  const byRegion = groupRowsBy(rows, (row) => row.region, openYmRange);
  const byPa = groupRowsBy(rows, (row) => row.pa, openYmRange);
  const byIndustry = groupRowsBy(rows, (row) => row.industry, openYmRange);
  const byCustomer = groupRowsBy(rows, (row) => row.customer, openYmRange);
  const regionCandidates = [...new Set(regionOptions)];
  const industryCandidates = [
    ...new Set([
      ...(baseDataStores["客户信息"]?.rows || []).map((item) => item.industry),
      ...byIndustry.map((item) => item.key)
    ].filter(Boolean))
  ];
  const companyCandidates = [...new Set(invoiceMaster.map((item) => normalizeCompanyName(item.invoice)))];
  const customerCandidates = [...new Set(customerMaster)];
  const byCompanyNormalizedMap = new Map();
  byCompany.forEach((item) => {
    const key = normalizeCompanyName(item.key);
    if (!byCompanyNormalizedMap.has(key)) {
      byCompanyNormalizedMap.set(key, { key, orderQty: 0, invoiceQty: 0, orderAmount: 0, invoiceAmount: 0 });
    }
    const hit = byCompanyNormalizedMap.get(key);
    hit.orderQty += item.orderQty;
    hit.invoiceQty += item.invoiceQty;
    hit.orderAmount += item.orderAmount;
    hit.invoiceAmount += item.invoiceAmount;
  });
  const byCompanyNormalized = [...byCompanyNormalizedMap.values()];
  const pending = calcPendingApprovalStats();
  const metricKey = state.dashboardMetricMode === "order" ? "orderAmount" : "invoiceAmount";
  const paRows = buildTopRows(byPa, metricKey, 8);
  const paExists = paRows.some((item) => item.key === state.dashboardPaDrillParent);
  if (state.dashboardPaDrillParent && !paExists) {
    state.dashboardPaDrillParent = "";
  }
  const paDrillRows = state.dashboardPaDrillParent
    ? buildTopRows(groupRowsBy(rows.filter((row) => row.pa === state.dashboardPaDrillParent), (row) => row.subpa2, openYmRange), metricKey, 8)
    : [];
  const paDisplayRows = state.dashboardPaDrillParent ? paDrillRows : paRows;

  return {
    period,
    prevPeriod,
    periodOpenTime: periodInfo?.openTime || "-",
    openMonthsAll,
    openYmAll,
    openMonthsLabel: openYmRange.length ? `${openYmRange[0]} ~ ${openYmRange[openYmRange.length - 1]}` : "-",
    openMonths: openYmRange,
    metricMode: state.dashboardMetricMode,
    orderQty: nowTotals.orderQty,
    invoiceQty: nowTotals.invoiceQty,
    orderAmount: nowTotals.orderAmount,
    invoiceAmount: nowTotals.invoiceAmount,
    orderYoY: calcYoY(nowTotals.orderAmount, prevTotals.orderAmount),
    invoiceYoY: calcYoY(nowTotals.invoiceAmount, prevTotals.invoiceAmount),
    completionRate: nowTotals.completionRate,
    filledCount: nowTotals.filledCount,
    totalCount: nowTotals.totalCount,
    pending,
    monthAgg: nowTotals.monthAgg,
    prevMonthAgg: prevTotals.monthAgg,
    regionShare: buildTopRows(byRegion, metricKey, 5, regionCandidates),
    industryShare: buildTopRows(byIndustry, metricKey, 5, industryCandidates),
    paShare: paDisplayRows,
    paDrillParent: state.dashboardPaDrillParent,
    topCompany: buildTopRows(
      byCompanyNormalized,
      metricKey,
      5,
      companyCandidates
    ),
    topProduct: buildTopRows(byCustomer, metricKey, 5, customerCandidates)
  };
}

function renderDashboardKpis(snapshot) {
  syncDashboardMonthFilterControls(snapshot.openYmAll || []);
  if (dashboardCurrentPeriod) dashboardCurrentPeriod.textContent = snapshot.period;
  if (dashboardCurrentWindow) dashboardCurrentWindow.textContent = snapshot.periodOpenTime;
  if (kpiOrderAmt) kpiOrderAmt.textContent = Math.round(Number(snapshot.orderAmount || 0)).toLocaleString("zh-CN");
  if (kpiOrderQtySub) kpiOrderQtySub.textContent = `数量：${Number(snapshot.orderQty).toLocaleString("zh-CN")}`;
  if (kpiOrderYoy) kpiOrderYoy.textContent = `同比：${snapshot.orderYoY.toFixed(1)}%`;
  if (kpiInvAmt) kpiInvAmt.textContent = Math.round(Number(snapshot.invoiceAmount || 0)).toLocaleString("zh-CN");
  if (kpiInvQtySub) kpiInvQtySub.textContent = `数量：${Number(snapshot.invoiceQty).toLocaleString("zh-CN")}`;
  if (kpiInvYoy) kpiInvYoy.textContent = `同比：${snapshot.invoiceYoY.toFixed(1)}%`;
  if (kpiCompletion) kpiCompletion.textContent = "80%";
  if (kpiCompletionSub) kpiCompletionSub.textContent = "80/100";
  if (kpiPending) kpiPending.textContent = String(snapshot.pending.total);
  if (kpiPendingSub) kpiPendingSub.textContent = `区总${snapshot.pending.directorPending} / 财务${snapshot.pending.financePending}`;
}

function setSingleMetricBar(chart, rows, title, key, color) {
  const labels = rows.map((item) => item.key);
  chart.setOption({
    color: [color],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 120, right: 18, top: 24, bottom: 20 },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: labels, inverse: true },
    series: [{ name: title, type: "bar", barMaxWidth: 20, data: rows.map((item) => Number((item[key] || 0).toFixed(2))) }]
  });
}

function renderDashboardTitles(metricMode) {
  const metricLabel = metricMode === "order" ? "订单" : "开票";
  if (dashboardTrendTitle) dashboardTrendTitle.textContent = `月度趋势（${metricLabel}）`;
  if (dashboardRegionShareTitle) dashboardRegionShareTitle.textContent = `销售大区金额占比（${metricLabel}）`;
  if (dashboardIndustryShareTitle) dashboardIndustryShareTitle.textContent = `行业分类销售额占比（${metricLabel}）`;
  if (dashboardShareTitle) {
    dashboardShareTitle.textContent = state.dashboardPaDrillParent
      ? `Sub PA-2 金额占比（${metricLabel}，${state.dashboardPaDrillParent}）`
      : `PA产品线预测金额（${metricLabel}，点击下钻Sub PA-2）`;
  }
  if (dashboardCompanyTitle) dashboardCompanyTitle.textContent = `开票公司 TOP 5（${metricLabel}）`;
  if (dashboardProductTitle) dashboardProductTitle.textContent = `按客户 TOP 5（${metricLabel}）`;
}

function renderDashboardCharts(snapshot) {
  if (!ensureDashboardChartInstance()) return;
  const metricKey = snapshot.metricMode === "order" ? "orderAmount" : "invoiceAmount";
  const metricLabel = snapshot.metricMode === "order" ? "订单金额" : "开票金额";
  const color = snapshot.metricMode === "order" ? "#1677ff" : "#1ab17c";
  renderDashboardTitles(snapshot.metricMode);
  setSingleMetricBar(dashboardCharts.company, snapshot.topCompany, metricLabel, metricKey, color);
  setSingleMetricBar(dashboardCharts.product, snapshot.topProduct, metricLabel, metricKey, color);

  const shareMetricKey = snapshot.metricMode === "order" ? "orderAmount" : "invoiceAmount";
  const setShareDonut = (chart, rows) => {
    chart.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, type: "scroll" },
      series: [
        {
          type: "pie",
          radius: ["48%", "70%"],
          center: ["50%", "44%"],
          data: rows.map((item) => ({ name: item.key, value: Number((item[shareMetricKey] || 0).toFixed(2)) })),
          label: { formatter: "{b}: {d}%" }
        }
      ]
    });
  };
  setShareDonut(dashboardCharts.regionShare, snapshot.regionShare);
  setShareDonut(dashboardCharts.industryShare, snapshot.industryShare);
  setShareDonut(dashboardCharts.share, snapshot.paShare);

  dashboardCharts.trend.setOption({
    color: [color],
    tooltip: { trigger: "axis" },
    legend: { top: 0, data: [metricLabel] },
    grid: { left: 72, right: 16, top: 32, bottom: 30, containLabel: true },
    xAxis: { type: "category", data: snapshot.openMonths },
    yAxis: { type: "value" },
    series: [
      {
        name: metricLabel,
        type: "line",
        smooth: true,
        data: snapshot.openMonths.map((m) =>
          Number((snapshot.metricMode === "order" ? snapshot.monthAgg[m].orderAmount : snapshot.monthAgg[m].invoiceAmount).toFixed(2))
        )
      }
    ]
  });
  dashboardCharts.share.off("click");
  dashboardCharts.share.on("click", (params) => {
    const clickedName = String(params?.name || "");
    if (!clickedName) return;
    state.dashboardPaDrillParent = snapshot.paDrillParent ? "" : clickedName;
    renderDashboard();
  });
}

function renderDashboardSwitchState() {
  const isOrder = state.dashboardMetricMode === "order";
  dashboardOrderTab?.classList.toggle("active", isOrder);
  dashboardInvoiceTab?.classList.toggle("active", !isOrder);
  dashboardOrderTab?.setAttribute("aria-selected", isOrder ? "true" : "false");
  dashboardInvoiceTab?.setAttribute("aria-selected", isOrder ? "false" : "true");
}

function setDashboardMetricMode(mode) {
  state.dashboardMetricMode = mode === "invoice" ? "invoice" : "order";
  state.dashboardPaDrillParent = "";
  renderDashboardSwitchState();
  renderDashboard();
}

function renderDashboard() {
  try {
    const snapshot = buildDashboardSnapshot();
    renderDashboardKpis(snapshot);
    renderDashboardCharts(snapshot);
  } catch (error) {
    console.error("Dashboard渲染失败", error);
  }
}

function showDashboardWorkbench() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  hideForecastPage2Panels();
  approvalWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.remove("hidden");
  hideSystemWorkbench();
  state.dashboardMonthStart = "";
  state.dashboardMonthEnd = "";
  renderDashboardSwitchState();
  renderDashboard();
}

function isAllValue(value) {
  return !value || value === "all";
}

function matchFilter(target, filterValue) {
  return isAllValue(filterValue) ? true : target === filterValue;
}

function getFilteredForecastRows() {
  return forecastRows.filter((row) => {
    const hitCustomer = matchFilter(row.customer, customerFilter.value);
    const hitInvoice = matchFilter(row.invoice, invoiceFilter.value);
    const hitPerformance = matchFilter(row.performance, performanceFilter.value);
    const hitRegion = matchFilter(row.region, regionFilter.value);
    const hitPa = matchFilter(row.pa, paFilter.value);
    const hitSub1 = matchFilter(row.subpa1, subPa1Filter.value);
    const hitSub2 = matchFilter(row.subpa2, subPa2Filter.value);
    return hitCustomer && hitInvoice && hitPerformance && hitRegion && hitPa && hitSub1 && hitSub2;
  });
}

function getFilteredForecastRows2() {
  return forecastRows.filter((row) => {
    const hitCustomer = matchFilter(row.customer, customerFilter2.value);
    const hitInvoice = matchFilter(row.invoice, invoiceFilter2.value);
    const hitPerformance = matchFilter(row.performance, performanceFilter2.value);
    const hitRegion = matchFilter(row.region, regionFilter2.value);
    const hitPa = matchFilter(row.pa, paFilter2.value);
    const hitSub1 = matchFilter(row.subpa1, subPa1Filter2.value);
    const hitSub2 = matchFilter(row.subpa2, subPa2Filter2.value);
    return hitCustomer && hitInvoice && hitPerformance && hitRegion && hitPa && hitSub1 && hitSub2;
  });
}

function expandForecastRowsToLongEntries(rows) {
  const ymV = forecastFilterYm2?.value || "all";
  const entries = [];
  rows.forEach((row) => {
    const months = periodWindows[row.period] || monthOrder;
    const ymList = getPeriodAvailableYmList(row.period, months);
    months.forEach((month) => {
      const monthIdx = months.indexOf(month);
      const ym = ymList[monthIdx] || getYearMonthByPeriodMonth(row.period, month, months);
      if (ymV !== "all" && ym !== ymV) return;
      entries.push({ row, month, ym });
    });
  });
  return entries;
}

function getFilteredForecastLongEntries() {
  return expandForecastRowsToLongEntries(getFilteredForecastRows2());
}

function hasFilledForecastValueForMonth(row, month) {
  return Number(row[getQtyKey(month)] || 0) > 0 || Number(row[getInvoiceKey(month)] || 0) > 0;
}

function hasFilledForecastValue(row) {
  return monthOrder.some((month) => Number(row[getQtyKey(month)] || 0) > 0 || Number(row[getInvoiceKey(month)] || 0) > 0);
}

function runForecastQuery() {
  const rows = getFilteredForecastRows().filter((row) => hasFilledForecastValue(row));
  renderForecastTable(rows);
  const entries = expandForecastRowsToLongEntries(rows).filter((e) => hasFilledForecastValueForMonth(e.row, e.month));
  renderForecastTable2(entries);
  setForecastMessage("info", `查询完成：共匹配 ${rows.length} 条已填报数据。`);
}

function resetForecastFilters() {
  customerFilter.value = "all";
  invoiceFilter.value = "all";
  performanceFilter.value = "all";
  regionFilter.value = "all";
  paFilter.value = "all";
  subPa1Filter.value = "all";
  subPa2Filter.value = "all";
  if (subPa3Filter) subPa3Filter.value = "all";
  if (subPa4Filter) subPa4Filter.value = "all";
  syncInvoiceDependentFilters();
  syncSubPaFilter();
  syncSubPa234Filters();
  renderForecastTable(getFilteredForecastRows());
  renderForecastTable2(getFilteredForecastLongEntries());
  setForecastMessage("info", "筛选条件已重置。");
}

function runForecastQuery2() {
  const entries = getFilteredForecastLongEntries().filter((e) => hasFilledForecastValueForMonth(e.row, e.month));
  renderForecastTable2(entries);
  setForecastMessage2("info", `查询完成：共匹配 ${entries.length} 条已填报明细（按月）。`);
}

function resetForecastFilters2() {
  customerFilter2.value = "all";
  invoiceFilter2.value = "all";
  performanceFilter2.value = "all";
  regionFilter2.value = "all";
  paFilter2.value = "all";
  subPa1Filter2.value = "all";
  subPa2Filter2.value = "all";
  if (subPa3Filter2) subPa3Filter2.value = "all";
  if (subPa4Filter2) subPa4Filter2.value = "all";
  if (forecastFilterYm2) forecastFilterYm2.value = "all";
  syncInvoiceDependentFilters2();
  syncSubPaFilter2();
  syncSubPa234Filters2();
  renderForecastTable2(getFilteredForecastLongEntries());
  setForecastMessage2("info", "筛选条件已重置。");
}

function createForecastRow(payload) {
  const row = {
    sales: payload.sales || currentUserName,
    period: payload.period || state.forecast.period || "2026FC1",
    customer: payload.customer,
    invoice: payload.invoice,
    performance: payload.performance,
    region: payload.region,
    pa: payload.pa,
    subpa1: payload.subpa1,
    subpa2: payload.subpa2,
    subpa3: payload.subpa3,
    subpa4: payload.subpa4 || "-"
  };
  ensureRowId(row);
  ensureRowMetrics(row);
  return row;
}

function syncAddInvoiceDependentFields() {
  const selected = invoiceMaster.find((item) => item.invoice === addInvoice.value) || invoiceMaster[0];
  if (!selected) return;
  fillSelectWithSelected(addPerformance, performanceOptions, selected.performance, false);
  fillSelectWithSelected(addRegion, regionOptions, selected.region, false);
}

function syncAddSubPaFilters() {
  const paValue = addPa.value;
  const sub1Options = productMaster[paValue] || [];
  fillSelect(addSubPa1, sub1Options, false, addSubPa1.value || sub1Options[0]);

  const sub1Value = addSubPa1.value;
  const sub2Map = (productHierarchy[paValue] || {})[sub1Value] || {};
  const sub2Options = Object.keys(sub2Map);
  fillSelect(addSubPa2, sub2Options.length ? sub2Options : ["-"], false, addSubPa2.value || sub2Options[0]);
}

function renderAddMonthMetrics() {
  const months = getOpenMonths();
  const ymList = getPeriodAvailableYmList(state.forecast.period, months);
  const rowsHtml = months
    .map((month, idx) => {
      const ym = ymList[idx] || getYearMonthByPeriodMonth(state.forecast.period, month, months);
      return `
        <tr data-month="${month}">
          <td class="readonly ym-cell">${formatYmSlash(ym)}</td>
          <td><input type="number" min="0" step="1" data-month="${month}" data-metric="qty" value="0" /></td>
          <td><input type="text" inputmode="decimal" data-month="${month}" data-metric="orderAmt" value="0.00" /></td>
          <td class="readonly"><span class="unit-price-value">0.00</span></td>
          <td><input type="number" min="0" step="1" data-month="${month}" data-metric="inv" value="0" /></td>
          <td><input type="text" inputmode="decimal" data-month="${month}" data-metric="invAmt" value="0.00" /></td>
          <td class="readonly"><span class="unit-price-value">0.00</span></td>
        </tr>
      `;
    })
    .join("");
  addMonthMetrics.innerHTML = `
    <div class="add-metrics-table-wrap">
      <table class="add-month-table">
        <thead>
          <tr>
            <th>年月</th>
            <th>订单数量</th>
            <th>订单金额</th>
            <th>订单单价</th>
            <th>开票数量</th>
            <th>开票金额</th>
            <th>开票单价</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `.trim();
}

function refreshAddMonthUnitPrice(month) {
  if (!addMonthMetrics) return;
  const qtyInput = addMonthMetrics.querySelector(`input[data-month="${month}"][data-metric="qty"]`);
  const orderAmtInput = addMonthMetrics.querySelector(`input[data-month="${month}"][data-metric="orderAmt"]`);
  const invInput = addMonthMetrics.querySelector(`input[data-month="${month}"][data-metric="inv"]`);
  const invAmtInput = addMonthMetrics.querySelector(`input[data-month="${month}"][data-metric="invAmt"]`);
  const row = addMonthMetrics.querySelector(`tr[data-month="${month}"]`);
  const unitNodes = row ? row.querySelectorAll(".unit-price-value") : [];
  const orderUnitCell = unitNodes[0] || null;
  const invUnitCell = unitNodes[1] || null;
  const qty = parseLooseNumber(qtyInput?.value);
  const orderAmt = parseLooseNumber(orderAmtInput?.value);
  const inv = parseLooseNumber(invInput?.value);
  const invAmt = parseLooseNumber(invAmtInput?.value);
  const orderUnit = qty > 0 ? orderAmt / qty : 0;
  const invUnit = inv > 0 ? invAmt / inv : 0;
  if (orderUnitCell) orderUnitCell.textContent = formatAmount(orderUnit);
  if (invUnitCell) invUnitCell.textContent = formatAmount(invUnit);
}

function attachAddDialogEvents() {
  if (!addMonthMetrics || addMonthMetrics.__bound) return;
  addMonthMetrics.__bound = true;
  addMonthMetrics.addEventListener("input", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const month = target.dataset.month;
    if (!month) return;
    if (target.dataset.metric === "orderAmt" || target.dataset.metric === "invAmt") {
      const n = parseLooseNumber(target.value);
      if (target.value && String(n) !== target.value) {
        target.value = target.value;
      }
    }
    refreshAddMonthUnitPrice(month);
  });
  addMonthMetrics.addEventListener("blur", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const month = target.dataset.month;
    if (!month) return;
    if (target.dataset.metric === "orderAmt" || target.dataset.metric === "invAmt") {
      target.value = formatPlainMoney(parseLooseNumber(target.value));
      refreshAddMonthUnitPrice(month);
    }
  }, true);
}

function openAddForecastDialog() {
  const useP2 = state.activeModule === FORECAST_MONTHLY_MODULE;
  const custEl = useP2 ? customerFilter2 : customerFilter;
  const invEl = useP2 ? invoiceFilter2 : invoiceFilter;
  const paEl = useP2 ? paFilter2 : paFilter;
  fillSelect(addCustomer, customerMaster, false, isAllValue(custEl.value) ? customerMaster[0] : custEl.value);
  fillSelect(addInvoice, invoiceMaster.map((item) => item.invoice), false, isAllValue(invEl.value) ? invoiceMaster[0].invoice : invEl.value);
  syncAddInvoiceDependentFields();
  fillSelect(addPa, Object.keys(productMaster), false, isAllValue(paEl.value) ? Object.keys(productMaster)[0] : paEl.value);
  syncAddSubPaFilters();
  renderAddMonthMetrics();
  attachAddDialogEvents();
  getOpenMonths().forEach((m) => refreshAddMonthUnitPrice(m));
  addForecastDialog.showModal();
}

function saveAddForecastRow() {
  const row = createForecastRow({
    customer: addCustomer.value,
    invoice: addInvoice.value,
    performance: addPerformance.value,
    region: addRegion.value,
    pa: addPa.value,
    subpa1: addSubPa1.value,
    subpa2: addSubPa2.value,
    subpa3: "-",
    subpa4: "-"
  });

  let hasAnyFilled = false;
  addMonthMetrics.querySelectorAll('input[data-month][data-metric="qty"]').forEach((input) => {
    const month = input.dataset.month;
    const value = Number(input.value || 0);
    row[getQtyKey(month)] = value;
    if (value > 0) hasAnyFilled = true;
  });
  addMonthMetrics.querySelectorAll('input[data-month][data-metric="orderAmt"]').forEach((input) => {
    const month = input.dataset.month;
    const value = parseLooseNumber(input.value);
    row[getOrderAmountKey(month)] = value;
  });
  addMonthMetrics.querySelectorAll('input[data-month][data-metric="inv"]').forEach((input) => {
    const month = input.dataset.month;
    const value = Number(input.value || 0);
    row[getInvoiceKey(month)] = value;
    if (value > 0) hasAnyFilled = true;
  });
  addMonthMetrics.querySelectorAll('input[data-month][data-metric="invAmt"]').forEach((input) => {
    const month = input.dataset.month;
    const value = parseLooseNumber(input.value);
    row[getInvoiceAmountKey(month)] = value;
  });

  const months = getOpenMonths();
  for (const month of months) {
    const qty = Number(row[getQtyKey(month)] || 0);
    const inv = Number(row[getInvoiceKey(month)] || 0);
    const orderAmt = Number(row[getOrderAmountKey(month)] || 0);
    const invAmt = Number(row[getInvoiceAmountKey(month)] || 0);
    if (orderAmt > 0 && qty === 0) {
      activeForecastToast("error", `${formatYmSlash(getYearMonthByPeriodMonth(state.forecast.period, month, months))}：已填订单金额但订单数量为0。`);
      return;
    }
    if (invAmt > 0 && inv === 0) {
      activeForecastToast("error", `${formatYmSlash(getYearMonthByPeriodMonth(state.forecast.period, month, months))}：已填开票金额但开票数量为0。`);
      return;
    }
  }

  if (!hasAnyFilled) {
    activeForecastToast("error", "请至少填写一个月份的订单数量或开票数量。");
    return;
  }

  forecastRows.push(row);
  buildApprovalRecordsFromForecastRows();
  addForecastDialog.close();
  renderForecastTable(getFilteredForecastRows());
  renderForecastTable2(getFilteredForecastLongEntries());
  activeForecastToast("success", `新增成功：已添加客户 ${row.customer} 的产品预测数据。`);
}

function addForecastRows() {
  openAddForecastDialog();
}

function parsePeriodOrder(period) {
  const match = String(period || "").match(/^(\d{4})FC(\d+)$/i);
  if (!match) return { year: 0, fc: 0 };
  return { year: Number(match[1]) || 0, fc: Number(match[2]) || 0 };
}

function getPreviousPeriod(currentPeriod) {
  const periods = [...new Set(periodRecords.map((item) => item.period))].sort((a, b) => {
    const pa = parsePeriodOrder(a);
    const pb = parsePeriodOrder(b);
    if (pa.year !== pb.year) return pa.year - pb.year;
    return pa.fc - pb.fc;
  });
  const idx = periods.indexOf(currentPeriod);
  if (idx <= 0) return "";
  return periods[idx - 1];
}

function makeForecastRowKey(row) {
  return [row.sales, row.customer, row.invoice, row.performance, row.region, row.pa, row.subpa1, row.subpa2, row.subpa3, row.subpa4].join("|");
}

function copyLastPeriodForecastData() {
  if (state.forecast.readOnly) {
    activeForecastToast("error", "当前周期为只读，无法复制上期数据。");
    return;
  }
  const currentPeriod = state.forecast.period;
  const prevPeriod = getPreviousPeriod(currentPeriod);
  if (!prevPeriod) {
    activeForecastToast("error", "未找到可复制的上期周期数据。");
    return;
  }
  const currentRows = forecastRows.filter((row) => row.period === currentPeriod);
  const prevRows = forecastRows.filter((row) => row.period === prevPeriod);
  if (!currentRows.length || !prevRows.length) {
    activeForecastToast("error", "上期或本期数据为空，无法复制。");
    return;
  }
  const prevMap = new Map(prevRows.map((row) => [makeForecastRowKey(row), row]));
  const months = getOpenMonths();
  let updatedCells = 0;
  let touchedRows = 0;

  currentRows.forEach((row) => {
    const source = prevMap.get(makeForecastRowKey(row));
    if (!source) return;
    let rowChanged = false;
    months.forEach((month) => {
      const qtyKey = getQtyKey(month);
      const invKey = getInvoiceKey(month);
      const orderAmtKey = getOrderAmountKey(month);
      const invAmtKey = getInvoiceAmountKey(month);
      const srcQty = Number(source[qtyKey] || 0);
      const srcInv = Number(source[invKey] || 0);
      const srcOrderAmt = Number(source[orderAmtKey] || 0);
      const srcInvAmt = Number(source[invAmtKey] || 0);
      if (Number(row[qtyKey] || 0) === 0 && srcQty > 0) {
        row[qtyKey] = srcQty;
        updatedCells += 1;
        rowChanged = true;
      }
      if (Number(row[invKey] || 0) === 0 && srcInv > 0) {
        row[invKey] = srcInv;
        updatedCells += 1;
        rowChanged = true;
      }
      if (Number(row[orderAmtKey] || 0) === 0 && srcOrderAmt > 0) {
        row[orderAmtKey] = srcOrderAmt;
        updatedCells += 1;
        rowChanged = true;
      }
      if (Number(row[invAmtKey] || 0) === 0 && srcInvAmt > 0) {
        row[invAmtKey] = srcInvAmt;
        updatedCells += 1;
        rowChanged = true;
      }
    });
    if (rowChanged) touchedRows += 1;
  });

  if (!updatedCells) {
    activeForecastToast("info", `未复制任何数据：本期已有值或未匹配到上期维度数据（${prevPeriod}）。`);
    return;
  }
  renderForecastTable(getFilteredForecastRows());
  renderForecastTable2(getFilteredForecastLongEntries());
  buildApprovalRecordsFromForecastRows();
  activeForecastToast("success", `已从 ${prevPeriod} 复制完成：更新 ${touchedRows} 行，${updatedCells} 个单元格。`);
}

function buildTemplateCsv() {
  const monthHeaders = monthOrder.flatMap((month) => [`${month}_qty`, `${month}_order_amount`, `${month}_invoice`, `${month}_invoice_amount`]);
  const headers = [
    "customer",
    "invoice",
    "performance",
    "region",
    "pa",
    "subpa1",
    "subpa2",
    "subpa3",
    "subpa4",
    ...monthHeaders
  ];
  const sample = forecastRows[0] || {};
  const sampleMetrics = monthOrder.flatMap((month) => [
    sample[getQtyKey(month)] ?? 0,
    sample[getOrderAmountKey(month)] ?? 0,
    sample[getInvoiceKey(month)] ?? 0,
    sample[getInvoiceAmountKey(month)] ?? 0
  ]);
  const sampleRow = [
    sample.customer || customerMaster[0],
    sample.invoice || invoiceMaster[0].invoice,
    sample.performance || invoiceMaster[0].performance,
    sample.region || invoiceMaster[0].region,
    sample.pa || Object.keys(productMaster)[0],
    sample.subpa1 || productMaster[Object.keys(productMaster)[0]][0],
    sample.subpa2 || "Sub2-A",
    sample.subpa3 || "Sub3-A1",
    sample.subpa4 || "Sub4-1",
    ...sampleMetrics
  ];
  return `${headers.join(",")}\n${sampleRow.join(",")}`;
}

function buildDataCsv(rows) {
  const monthHeaders = monthOrder.flatMap((month) => [
    `${month}_qty`,
    `${month}_order_amount`,
    `${month}_sales_unit_price`,
    `${month}_invoice`,
    `${month}_invoice_amount`,
    `${month}_invoice_unit_price`
  ]);
  const headers = [
    "period",
    "sales",
    "customer",
    "invoice",
    "performance",
    "region",
    "pa",
    "subpa1",
    "subpa2",
    ...monthHeaders
  ];
  const lines = rows.map((row) => {
    const monthValues = monthOrder.flatMap((month) => [
      Number(row[getQtyKey(month)] || 0),
      Number(getMonthOrderAmount(row, month, row.period).toFixed(2)),
      Number(getMonthSalesUnitPrice(row, month, row.period).toFixed(2)),
      Number(row[getInvoiceKey(month)] || 0),
      Number(getMonthInvoiceAmount(row, month, row.period).toFixed(2)),
      Number(getMonthInvoiceUnitPrice(row, month, row.period).toFixed(2))
    ]);
    return [
      row.period || "",
      row.sales || "",
      row.customer || "",
      row.invoice || "",
      row.performance || "",
      row.region || "",
      row.pa || "",
      row.subpa1 || "",
      row.subpa2 || "",
      ...monthValues
    ].join(",");
  });
  return `${headers.join(",")}\n${lines.join("\n")}`;
}

function downloadTemplate() {
  const csv = buildTemplateCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "forecast_upload_template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  activeForecastToast("success", "模板下载成功：请按模板格式填写后上传。");
}

function downloadData() {
  const rows = state.activeModule === FORECAST_MONTHLY_MODULE ? getFilteredForecastRows2() : getFilteredForecastRows();
  if (!rows.length) {
    activeForecastToast("error", "当前筛选条件下无数据可下载。");
    return;
  }
  const csv = buildDataCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `forecast_data_${state.forecast.period || "all"}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  activeForecastToast("success", `数据下载成功：共导出 ${rows.length} 行。`);
}

function uploadForecastCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const content = String(reader.result || "").trim();
    if (!content) {
      activeForecastToast("error", "上传失败：文件内容为空。");
      return;
    }
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      activeForecastToast("error", "上传失败：至少需要一行表头和一行数据。");
      return;
    }
    const headers = lines[0].split(",").map((item) => item.trim());
    const monthIndexes = {};
    monthOrder.forEach((month) => {
      monthIndexes[`${month}_qty`] = headers.indexOf(`${month}_qty`);
      monthIndexes[`${month}_order_amount`] = headers.indexOf(`${month}_order_amount`);
      monthIndexes[`${month}_invoice`] = headers.indexOf(`${month}_invoice`);
      monthIndexes[`${month}_invoice_amount`] = headers.indexOf(`${month}_invoice_amount`);
    });

    const requiredHeaders = ["customer", "invoice", "performance", "region", "pa", "subpa1", "subpa2", "subpa3", "subpa4"];
    const missingRequired = requiredHeaders.some((name) => headers.indexOf(name) < 0);
    if (missingRequired) {
      activeForecastToast("error", "上传失败：模板字段不完整，请先下载最新模板。");
      return;
    }

    let successCount = 0;
    lines.slice(1).forEach((line) => {
      const cells = line.split(",").map((item) => item.trim());
      if (!cells.some((cell) => cell)) return;
      const row = createForecastRow({
        customer: cells[headers.indexOf("customer")] || customerMaster[0],
        invoice: cells[headers.indexOf("invoice")] || invoiceMaster[0].invoice,
        performance: cells[headers.indexOf("performance")] || invoiceMaster[0].performance,
        region: cells[headers.indexOf("region")] || invoiceMaster[0].region,
        pa: cells[headers.indexOf("pa")] || Object.keys(productMaster)[0],
        subpa1: cells[headers.indexOf("subpa1")] || "-",
        subpa2: cells[headers.indexOf("subpa2")] || "-",
        subpa3: cells[headers.indexOf("subpa3")] || "-",
        subpa4: cells[headers.indexOf("subpa4")] || "Sub4-1"
      });
      monthOrder.forEach((month) => {
        const qtyIdx = monthIndexes[`${month}_qty`];
        const orderAmtIdx = monthIndexes[`${month}_order_amount`];
        const invIdx = monthIndexes[`${month}_invoice`];
        const invAmtIdx = monthIndexes[`${month}_invoice_amount`];
        row[getQtyKey(month)] = Number(cells[qtyIdx] || 0);
        row[getOrderAmountKey(month)] = Number(cells[orderAmtIdx] || 0);
        row[getInvoiceKey(month)] = Number(cells[invIdx] || 0);
        row[getInvoiceAmountKey(month)] = Number(cells[invAmtIdx] || 0);
      });
      forecastRows.push(row);
      successCount += 1;
    });

    buildApprovalRecordsFromForecastRows();
    runForecastQuery();
    recordOperationEvent({ module: state.activeModule, action: "上传CSV", detail: `新增 ${successCount} 行` });
    activeForecastToast("success", `上传成功：新增 ${successCount} 条预测数据。`);
  };
  reader.readAsText(file);
}

function validateForecast() {
  const invalidRows = [];
  const openMonths = getOpenMonths();
  const sourceRows =
    state.activeModule === FORECAST_MONTHLY_MODULE ? getFilteredForecastRows2() : getFilteredForecastRows();
  sourceRows.forEach((row, index) => {
    const metrics = openMonths.flatMap((month) => [
      Number(row[getQtyKey(month)] || 0),
      Number(row[getOrderAmountKey(month)] || 0),
      Number(row[getInvoiceKey(month)] || 0),
      Number(row[getInvoiceAmountKey(month)] || 0)
    ]);
    const hasNegative = metrics.some((value) => value < 0);
    const allEmpty = metrics.every((value) => !value);
    if (hasNegative || allEmpty) invalidRows.push(index + 1);
  });

  if (invalidRows.length > 0) {
    activeForecastToast(
      "error",
      `发现 ${invalidRows.length} 行异常：第 ${invalidRows.join(", ")} 行。请检查月份值（不可为负且至少填写一个月）。`
    );
    return false;
  }

  return true;
}

function login(domain) {
  state.domain = domain;
  const normalizedDomain = normalizeText(domain);
  const candidate =
    userRecords.find((u) => u.enabled && normalizeText(u.domain) === normalizedDomain) ||
    userRecords.find((u) => u.enabled && normalizeText(u.domain).includes(normalizedDomain)) ||
    userRecords.find((u) => u.enabled);

  if (!candidate) {
    recordLoginEvent({ event: "login", result: "failed", reason: "未找到可用账号" });
    showMessage("登录失败", "当前未配置任何可用账号，请先在用户账号管理中新增并启用账号。");
    return;
  }

  state.userId = candidate.id;
  state.userAccount = candidate.account;
  state.userRoleId = candidate.roleId || "SALES";
  state.role = roleNameById[state.userRoleId] || state.role;
  currentUserName = candidate.displayName || currentUserName;

  candidate.lastLoginAt = getNowIso();
  saveToStorage(STORAGE_KEYS.users, userRecords);

  if (currentDomainTag) currentDomainTag.textContent = `M365 SSO: ${domain} · ${candidate.account || "-"}`;
  recordLoginEvent({ event: "login", result: "success", account: candidate.account, displayName: candidate.displayName });

  renderMenu();
  loginView.classList.remove("active");
  mainView.classList.add("active");
  setActiveModule("Dashboard");
}

function logout() {
  recordLoginEvent({ event: "logout", result: "success" });
  recordOperationEvent({ module: "系统", action: "退出登录", detail: `${state.domain || "-"}\\${state.userAccount || "-"}` });
  state.userId = "";
  state.userAccount = "";
  state.userRoleId = "SALES";
  loginView.classList.add("active");
  mainView.classList.remove("active");
}

document.querySelectorAll(".sso-btn").forEach((btn) => {
  btn.addEventListener("click", () => login(btn.dataset.domain || "sandvik"));
});

// Render navigation early so a missing optional control does not block menu display.
renderMenu();

document.getElementById("logout-btn")?.addEventListener("click", logout);

document.getElementById("open-detail-btn")?.addEventListener("click", () => {
  dialogTitle.textContent = state.activeModule;
  dialogContent.textContent = moduleData[state.activeModule] || "该模块的业务细节待补充。";
  infoDialog.showModal();
});

document.getElementById("simulate-flow-btn")?.addEventListener("click", () => {
  const flowText =
    state.activeModule === FORECAST_MONTHLY_MODULE
      ? "流程模拟：销售提交预测 -> 区域总监审核 -> 财务复核 -> 汇总发布"
      : `流程模拟：进入 ${state.activeModule} -> 执行业务操作 -> 记录审计日志`;
  dialogTitle.textContent = "业务流程模拟";
  dialogContent.textContent = flowText;
  infoDialog.showModal();
});

document.getElementById("close-dialog-btn")?.addEventListener("click", () => infoDialog?.close());
userAddBtn?.addEventListener("click", () => openUserDialog());
userRefreshBtn?.addEventListener("click", renderUserManagement);
userKeywordInput?.addEventListener("input", renderUserManagement);
userRoleFilter?.addEventListener("change", renderUserManagement);
userStatusFilter?.addEventListener("change", renderUserManagement);
userDialogCancelBtn?.addEventListener("click", () => userDialog?.close());
userDialogSaveBtn?.addEventListener("click", saveUserFromDialog);

permissionRoleSelect?.addEventListener("change", renderRolePermission);
permissionSaveBtn?.addEventListener("click", saveRolePermission);
permissionResetBtn?.addEventListener("click", resetRolePermissionToDefault);

loginLogUserInput?.addEventListener("input", renderLoginLogs);
loginLogResultSelect?.addEventListener("change", renderLoginLogs);
loginLogDateStart?.addEventListener("change", renderLoginLogs);
loginLogDateEnd?.addEventListener("change", renderLoginLogs);
loginLogExportBtn?.addEventListener("click", exportLoginLogsCsv);
loginLogClearBtn?.addEventListener("click", clearLoginLogs);

opLogModuleSelect?.addEventListener("change", renderOpLogs);
opLogUserInput?.addEventListener("input", renderOpLogs);
opLogActionInput?.addEventListener("input", renderOpLogs);
opLogDateStart?.addEventListener("change", renderOpLogs);
opLogDateEnd?.addEventListener("change", renderOpLogs);
opLogExportBtn?.addEventListener("click", exportOpLogsCsv);
opLogClearBtn?.addEventListener("click", clearOpLogs);
document.getElementById("save-draft-btn")?.addEventListener("click", () => {
  setForecastMessage("info", "已保存（演示模式）：可继续编辑后提交审批。");
  recordOperationEvent({ module: state.activeModule, action: "保存草稿", detail: state.forecast.period || "-" });
});
document.getElementById("submit-btn")?.addEventListener("click", () => {
  if (validateForecast()) {
    if (flowValue) flowValue.textContent = "已提交审批";
    setForecastMessage("success", "提交成功：流程已流转至区域总监审核节点。");
    recordOperationEvent({ module: state.activeModule, action: "提交预测", detail: state.forecast.period || "-" });
  }
});
document.getElementById("save-draft-btn-2")?.addEventListener("click", () => {
  setForecastMessage2("info", "已保存（演示模式）：可继续编辑后提交审批。");
  recordOperationEvent({ module: state.activeModule, action: "保存草稿", detail: state.forecast.period || "-" });
});
document.getElementById("submit-btn-2")?.addEventListener("click", () => {
  if (validateForecast()) {
    if (flowValue) flowValue.textContent = "已提交审批";
    setForecastMessage2("success", "提交成功：流程已流转至区域总监审核节点。");
    recordOperationEvent({ module: state.activeModule, action: "提交预测", detail: state.forecast.period || "-" });
  }
});
downloadTemplateBtn?.addEventListener("click", () => {
  downloadTemplate();
  recordOperationEvent({ module: state.activeModule, action: "下载模板", detail: "-" });
});
downloadTemplateBtn2?.addEventListener("click", () => {
  downloadTemplate();
  recordOperationEvent({ module: state.activeModule, action: "下载模板", detail: "-" });
});
downloadDataBtn?.addEventListener("click", () => {
  downloadData();
  recordOperationEvent({ module: state.activeModule, action: "下载数据", detail: state.forecast.period || "-" });
});
downloadDataBtn2?.addEventListener("click", () => {
  downloadData();
  recordOperationEvent({ module: state.activeModule, action: "下载数据", detail: state.forecast.period || "-" });
});
uploadBtn?.addEventListener("click", () => uploadInput?.click());
uploadBtn2?.addEventListener("click", () => uploadInput2?.click());
uploadInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) uploadForecastCsv(file);
  uploadInput.value = "";
});
uploadInput2?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) uploadForecastCsv(file);
  uploadInput2.value = "";
});
queryBtn?.addEventListener("click", runForecastQuery);
resetQueryBtn?.addEventListener("click", resetForecastFilters);
queryBtn2?.addEventListener("click", runForecastQuery2);
resetQueryBtn2?.addEventListener("click", resetForecastFilters2);
addRowBtn?.addEventListener("click", addForecastRows);
addRowBtn2?.addEventListener("click", addForecastRows);
copyLastPeriodBtn?.addEventListener("click", copyLastPeriodForecastData);
copyLastPeriodBtn2?.addEventListener("click", copyLastPeriodForecastData);
approvalDirectorFilter?.addEventListener("change", syncApprovalSalesFilter);
approvalQueryBtn?.addEventListener("click", runApprovalQuery);
approvalResetBtn?.addEventListener("click", resetApprovalFilters);
approvalBackBtn?.addEventListener("click", showApprovalListPage);
approvalPassBtn?.addEventListener("click", () => openApprovalOpinionDialog("pass"));
approvalRejectBtn?.addEventListener("click", () => openApprovalOpinionDialog("reject"));
approvalAdjustBtn?.addEventListener("click", openApprovalAdjustDialog);
approvalDownloadBtn?.addEventListener("click", exportApprovalDetailCsv);
approvalOpinionCancelBtn?.addEventListener("click", () => approvalOpinionDialog?.close());
approvalOpinionConfirmBtn?.addEventListener("click", submitApprovalOpinion);
approvalAdjustCancelBtn?.addEventListener("click", () => approvalAdjustDialog?.close());
approvalAdjustSaveBtn?.addEventListener("click", submitApprovalAdjust);
approvalHistoryCloseBtn?.addEventListener("click", () => approvalHistoryDialog?.close());
summaryByCustomerBtn?.addEventListener("click", () => {
  state.approvalSummaryMode = "customer";
  showApprovalDetail(state.selectedApprovalId);
});
summaryDetailTab?.addEventListener("click", () => {
  state.approvalSummaryMode = "detail";
  showApprovalDetail(state.selectedApprovalId);
});
summaryByPerformanceBtn?.addEventListener("click", () => {
  state.approvalSummaryMode = "performance";
  showApprovalDetail(state.selectedApprovalId);
});
summaryByRegionBtn?.addEventListener("click", () => {
  state.approvalSummaryMode = "region";
  showApprovalDetail(state.selectedApprovalId);
});
fcVersionAddBtn?.addEventListener("click", () => openFcVersionDialog());
fcDelaySalesSearchInput?.addEventListener("input", renderDelaySalesSelector);
fcDelaySalesList?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;
  const name = target.dataset.delaySales;
  if (!name) return;
  if (target.checked) {
    fcDelaySalesSelection.add(name);
  } else {
    fcDelaySalesSelection.delete(name);
  }
});
fcVersionCancelBtn?.addEventListener("click", () => fcVersionDialog?.close());
fcVersionSaveBtn?.addEventListener("click", saveFcVersion);
baseDataAddBtn?.addEventListener("click", () => openBaseDataDialog());
baseDataCancelBtn?.addEventListener("click", () => baseDataDialog?.close());
baseDataSaveBtn?.addEventListener("click", saveBaseDataRow);
dashboardOrderTab?.addEventListener("click", () => setDashboardMetricMode("order"));
dashboardInvoiceTab?.addEventListener("click", () => setDashboardMetricMode("invoice"));
dashboardMonthStart?.addEventListener("change", () => {
  state.dashboardMonthStart = dashboardMonthStart.value || "";
  state.dashboardPaDrillParent = "";
  renderDashboard();
});
dashboardMonthEnd?.addEventListener("change", () => {
  state.dashboardMonthEnd = dashboardMonthEnd.value || "";
  state.dashboardPaDrillParent = "";
  renderDashboard();
});
addInvoice?.addEventListener("change", syncAddInvoiceDependentFields);
addPa?.addEventListener("change", syncAddSubPaFilters);
addSubPa1?.addEventListener("change", syncAddSubPaFilters);
addSubPa2?.addEventListener("change", syncAddSubPaFilters);
addDialogCancel?.addEventListener("click", () => addForecastDialog?.close());
addDialogSave?.addEventListener("click", saveAddForecastRow);
invoiceFilter?.addEventListener("change", syncInvoiceDependentFilters);
backToPeriods?.addEventListener("click", showForecastPeriods);
periodStatusFilter?.addEventListener("change", renderPeriodList);
periodKeyword?.addEventListener("input", renderPeriodList);
periodResetBtn?.addEventListener("click", () => {
  periodStatusFilter.value = "all";
  periodKeyword.value = "";
  renderPeriodList();
});
invoiceFilter2?.addEventListener("change", syncInvoiceDependentFilters2);
backToPeriods2?.addEventListener("click", showForecastPeriods2);
periodStatusFilter2?.addEventListener("change", renderPeriodList2);
periodKeyword2?.addEventListener("input", renderPeriodList2);
periodResetBtn2?.addEventListener("click", () => {
  periodStatusFilter2.value = "all";
  periodKeyword2.value = "";
  renderPeriodList2();
});
subPa1Filter?.addEventListener("change", syncSubPa234Filters);
subPa2Filter?.addEventListener("change", syncSubPa234Filters);
paFilter?.addEventListener("change", () => {
  syncSubPaFilter();
  syncSubPa234Filters();
});
subPa1Filter2?.addEventListener("change", syncSubPa234Filters2);
subPa2Filter2?.addEventListener("change", syncSubPa234Filters2);
paFilter2?.addEventListener("change", () => {
  syncSubPaFilter2();
  syncSubPa234Filters2();
});
window.addEventListener("resize", () => {
  Object.values(dashboardCharts).forEach((chart) => chart?.resize());
});

try {
  renderForecastFilters();
} catch (error) {
  console.warn("初始化填报页面1筛选失败（可能缺少对应DOM）", error);
}
try {
  renderForecastFilters2();
} catch (error) {
  console.warn("初始化填报页面2筛选失败（可能缺少对应DOM）", error);
}
if (periodWindowLabel) periodWindowLabel.textContent = `预测年月：${getForecastYmRangeLabel(state.forecast.period)}`;
try {
  renderForecastTable();
} catch (error) {
  console.warn("初始化填报页面1表格失败（可能缺少对应DOM）", error);
}
try {
  renderForecastTable2(getFilteredForecastLongEntries());
} catch (error) {
  console.warn("初始化填报页面2表格失败（可能缺少对应DOM）", error);
}
