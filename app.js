const moduleData = {
  "组织架构": "维护销售组织、区域与汇报关系，支持后续预测聚合统计。",
  "客户信息": "管理客户主数据、行业标签与信用信息，支持预测维度分析。",
  "产品库": "维护 SKU 主数据和可售状态，支撑销售预测引用。",
  "数据字典": "维护跨区域归属规则，保证预测与财务核算口径一致。",
  "销售预测填报": "销售人员按客户与产品维度提交预测，支持保存草稿与批量导入。",
  "销售预测审核": "区域负责人对下级预测进行审核、驳回与调整。",
  "Dashboard": "自动汇总各层级预测数据，并通过看板展示趋势与差异。",
  "分析报表": "按业务口径输出预测报表，支持 Excel/PDF 导出。",
  "预测周期管理": "维护FC Version、销售周期、填报时间与开放范围。",
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
    items: ["Dashboard", "销售预测填报", "销售预测审核", "分析报表"]
  },
  {
    group: "基础数据管理",
    items: ["组织架构", "客户信息", "产品库", "数据字典"]
  },
  {
    group: "系统管理",
    items: ["用户账号管理", "角色和权限管理", "预测周期管理", "审批流程配置", "系统登录日志", "系统操作日志"]
  }
];

const state = {
  domain: "",
  activeModule: "欢迎页",
  role: "Sales",
  dashboardMetricMode: "order",
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

const currentUserName = "Mark Ji";

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
let baseRowSeed = 1;
const baseDataStores = {};

const forecastRows = [];

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
const forecastWorkbench = document.getElementById("forecast-workbench");
const forecastPeriods = document.getElementById("forecast-periods");
const periodsBody = document.getElementById("periods-body");
const periodStatusFilter = document.getElementById("period-status-filter");
const periodKeyword = document.getElementById("period-keyword");
const periodResetBtn = document.getElementById("period-reset-btn");
const backToPeriods = document.getElementById("back-to-periods");
const downloadTemplateBtn = document.getElementById("download-template-btn");
const uploadBtn = document.getElementById("upload-btn");
const uploadInput = document.getElementById("upload-input");
const queryBtn = document.getElementById("query-btn");
const resetQueryBtn = document.getElementById("reset-query-btn");
const addRowBtn = document.getElementById("add-row-btn");
const copyLastPeriodBtn = document.getElementById("copy-last-period-btn");
const compactViewBtn = document.getElementById("compact-view-btn");
const detailViewBtn = document.getElementById("detail-view-btn");
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
const approvalBackBtn = document.getElementById("approval-back-btn");
const approvalDetailTitle = document.getElementById("approval-detail-title");
const approvalAdjustAmount = document.getElementById("approval-adjust-amount");
const approvalPassBtn = document.getElementById("approval-pass-btn");
const approvalRejectBtn = document.getElementById("approval-reject-btn");
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
const fcSalesSearchInput = document.getElementById("fc-sales-search");
const fcSalesSelectedTags = document.getElementById("fc-sales-selected-tags");
const fcVersionCancelBtn = document.getElementById("fc-version-cancel-btn");
const fcVersionSaveBtn = document.getElementById("fc-version-save-btn");
const approvalOpinionDialog = document.getElementById("approval-opinion-dialog");
const approvalOpinionTitle = document.getElementById("approval-opinion-title");
const approvalOpinionInput = document.getElementById("approval-opinion-input");
const approvalOpinionCancelBtn = document.getElementById("approval-opinion-cancel-btn");
const approvalOpinionConfirmBtn = document.getElementById("approval-opinion-confirm-btn");
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
const dashboardWorkbench = document.getElementById("dashboard-workbench");
const dashboardCurrentPeriod = document.getElementById("dashboard-current-period");
const dashboardCurrentWindow = document.getElementById("dashboard-current-window");
const dashboardCurrentMonths = document.getElementById("dashboard-current-months");
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
const dashboardShareTitle = document.getElementById("dashboard-share-title");
const dashboardCompanyTitle = document.getElementById("dashboard-company-title");
const dashboardProductTitle = document.getElementById("dashboard-product-title");
const dashboardSalesTitle = document.getElementById("dashboard-sales-title");
const dashboardRegionShareChartEl = document.getElementById("dashboard-region-share-chart");
const dashboardCompanyChartEl = document.getElementById("dashboard-company-chart");
const dashboardProductChartEl = document.getElementById("dashboard-product-chart");
const dashboardSalesChartEl = document.getElementById("dashboard-sales-chart");
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
const addSubPa3 = document.getElementById("add-subpa3");
const addSubPa4 = document.getElementById("add-subpa4");
const addSubPa4List = document.getElementById("add-subpa4-list");
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

function getPeriodYear(period) {
  const match = String(period || "").match(/^(\d{4})/);
  return match ? match[1] : "2026";
}

function getPriceProductKey(row) {
  return [row.pa, row.subpa1, row.subpa2, row.subpa3, row.subpa4].join("|");
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ensureRowMetrics(row) {
  monthOrder.forEach((month) => {
    const legacyKey = monthKeyMap[month];
    const qtyKey = getQtyKey(month);
    const invKey = getInvoiceKey(month);
    const legacyValue = Number(row[legacyKey] ?? 0);
    if (typeof row[qtyKey] === "undefined") row[qtyKey] = Number.isFinite(legacyValue) ? legacyValue : 0;
    if (typeof row[invKey] === "undefined") row[invKey] = 0;
  });
}

let rowIdSeed = 1;
function ensureRowId(row) {
  if (!row.__id) {
    row.__id = `row_${rowIdSeed++}`;
  }
}

let forecastMessageTimer = null;

// 演示用：填报窗口按周期开放月份（后续可由“填报窗口管理”维护）
const periodWindows = {
  "2026FC1": ["Jan", "Feb", "Mar", "Apr"],
  "2026FC2": ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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
    openTime: "2026-05-01 ~ 2026-05-15",
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
  return {
    id: `fcv_${fcVersionSeed++}`,
    version: item.period,
    salesStartMonth: item.months[0] ? `${item.period.slice(0, 4)}-${String(monthOrder.indexOf(item.months[0]) + 1).padStart(2, "0")}` : "2026-01",
    salesEndMonth: item.months[item.months.length - 1]
      ? `${item.period.slice(0, 4)}-${String(monthOrder.indexOf(item.months[item.months.length - 1]) + 1).padStart(2, "0")}`
      : "2026-12",
    openStart: `${parts[0]}T09:00`,
    openEnd: `${(parts[1] || parts[0])}T18:00`,
    delayStart: "",
    delayEnd: "",
    delaySales: []
  };
});

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
  const productKey = getPriceProductKey(row);
  const byProduct = productPriceMaster[productKey] || {};
  const value = byProduct[`${year}-${month}`];
  return Number(value || 0);
}

function calcRowAmounts(row, period) {
  const months = periodWindows[period] || monthOrder;
  let orderAmount = 0;
  let invoiceAmount = 0;
  months.forEach((month) => {
    const price = getAveragePrice(row, month, period);
    orderAmount += Number(row[getQtyKey(month)] || 0) * price;
    invoiceAmount += Number(row[getInvoiceKey(month)] || 0) * price;
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
      { key: "director", label: "区域总监" },
      { key: "sales", label: "销售人员" },
      { key: "status", label: "状态" }
    ],
    fields: [
      { key: "director", label: "区域总监", type: "text", required: true },
      { key: "sales", label: "销售人员", type: "text", required: true },
      { key: "status", label: "状态", type: "select", required: true, options: ["启用", "停用"] }
    ],
    rows: Object.entries(directorSalesMap).flatMap(([director, salesList]) =>
      salesList.map((sales) => ({ id: `base_${baseRowSeed++}`, director, sales, status: "启用" }))
    )
  };

  baseDataStores["客户信息"] = {
    columns: [
      { key: "customer", label: "客户名称" },
      { key: "industry", label: "行业" },
      { key: "credit", label: "信用等级" }
    ],
    fields: [
      { key: "customer", label: "客户名称", type: "text", required: true },
      { key: "industry", label: "行业", type: "select", required: true, options: industries },
      { key: "credit", label: "信用等级", type: "select", required: true, options: credit }
    ],
    rows: customerMaster.map((name, idx) => ({
      id: `base_${baseRowSeed++}`,
      customer: name,
      industry: industries[idx % industries.length],
      credit: credit[idx % credit.length]
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
      { key: "invoice", label: "开票公司" },
      { key: "performance", label: "业绩归属" },
      { key: "region", label: "销售大区" }
    ],
    fields: [
      { key: "invoice", label: "开票公司", type: "text", required: true },
      { key: "performance", label: "业绩归属", type: "text", required: true },
      { key: "region", label: "销售大区", type: "text", required: true }
    ],
    rows: invoiceMaster.map((item) => ({ id: `base_${baseRowSeed++}`, invoice: item.invoice, performance: item.performance, region: item.region }))
  };
}

createBaseDataStores();

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

forecastRows.push(...generateMockForecastRows(300));

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
    actor: node.actor,
    adjustmentAmount: 0
  }));
}

function appendApprovalHistory(record, status, opinion, actor, adjustmentAmount = 0) {
  if (!record.history) record.history = [];
  record.history.push({
    time: new Date().toISOString(),
    status,
    opinion: opinion || "-",
    actor: actor || "审批人",
    adjustmentAmount: Number(adjustmentAmount || 0)
  });
}

function buildApprovalRecordsFromForecastRows() {
  const previousMap = new Map(
    approvalRecords.map((item) => [
      `${item.period}|${item.sales}`,
      { status: item.status, history: item.history || [], adjustmentAmount: Number(item.adjustmentAmount || 0) }
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
    record.adjustmentAmount = Number(previous?.adjustmentAmount || 0);
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
  state.activeModule = name;
  if (activeModule) activeModule.textContent = name;
  moduleTitle.textContent = name;
  moduleDesc.textContent = moduleData[name] || "该功能详细流程将在下一步补充。";
  if (flowValue) flowValue.textContent = name === "销售预测填报" ? "Draft" : "待发起预测填报";
  if (roleValue) roleValue.textContent = name === "销售预测填报" ? currentUserName : mapRoleByModule(name);
  if (periodValue) periodValue.textContent = name === "销售预测填报" ? state.forecast.period : "—";
  if (name === "销售预测填报") {
    if (periodWindowLabel) periodWindowLabel.textContent = `填报窗口：${getOpenMonths().join(", ")}`;
  }
  updateActiveMenuStyle();
  renderModulePanel(name);
}

function mapRoleByModule(name) {
  if (["销售预测审核", "审批流程配置"].includes(name)) return "区域/销售总监";
  if (["用户账号管理", "角色和权限管理", "系统登录日志", "系统操作日志"].includes(name)) return "系统管理员";
  if (["审核节点邮件通知", "AD账号同步", "缓存刷新", "数据备份和清理"].includes(name)) return "后台服务";
  return "销售";
}

function renderModulePanel(name) {
  const isForecast = name === "销售预测填报";
  const isApproval = name === "销售预测审核";
  const isDashboard = name === "Dashboard";
  const isFcVersion = name === "预测周期管理";
  const isBaseData = basicDataModules.has(name);
  const hideOverview = isForecast || isApproval || isDashboard || isFcVersion || isBaseData;
  if (overviewHero) overviewHero.classList.toggle("hidden", hideOverview);
  if (overviewDashboard) overviewDashboard.classList.toggle("hidden", hideOverview);
  if (!isForecast && !isApproval && !isDashboard && !isFcVersion && !isBaseData) {
    forecastPeriods.classList.add("hidden");
    forecastWorkbench.classList.add("hidden");
    approvalWorkbench.classList.add("hidden");
    dashboardWorkbench.classList.add("hidden");
    fcVersionWorkbench.classList.add("hidden");
    baseDataWorkbench.classList.add("hidden");
    return;
  }
  if (isForecast) {
    // 进入“销售预测填报”默认先看周期列表
    showForecastPeriods();
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

function showForecastPeriods() {
  forecastPeriods.classList.remove("hidden");
  forecastWorkbench.classList.add("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  renderPeriodList();
}

function showForecastDetail(period) {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.remove("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  const hit = periodRecords.find((r) => r.period === period) || periodRecords[0];
  if (!hit) {
    setForecastMessage("error", "当前无可用FC Version，请先在预测周期管理中创建。");
    showForecastPeriods();
    return;
  }
  state.forecast.period = hit.period;
  state.forecast.months = hit.months;
  state.forecast.approval = hit.approval;
  state.forecast.readOnly = hit.status !== "open";

  if (roleValue) roleValue.textContent = currentUserName;
  if (flowValue) flowValue.textContent = "Draft";
  if (periodValue) periodValue.textContent = state.forecast.period;
  if (periodWindowLabel) periodWindowLabel.textContent = `填报窗口：${getOpenMonths().join(", ")}`;
  renderForecastTable();
  document.getElementById("add-row-btn").disabled = state.forecast.readOnly;
  document.getElementById("save-draft-btn").disabled = state.forecast.readOnly;
  document.getElementById("submit-btn").disabled = state.forecast.readOnly;
  if (uploadBtn) uploadBtn.disabled = state.forecast.readOnly;
  setForecastMessage(
    "info",
    state.forecast.readOnly
      ? "当前FC Version已关闭：仅可查看填报明细。"
      : "当前FC Version开放中：可填报销售预测。"
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
  const uniqueValues = [...new Set(list)];
  const options = includeAll ? [{ value: "all", label: "全部" }] : [];
  uniqueValues.forEach((value) => options.push({ value, label: value }));
  const hasSelected = options.some((option) => option.value === selected);
  const safeSelected = hasSelected ? selected : options[0]?.value;
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
  const sub1Value = subPa1Filter.value;
  const sub2Value = subPa2Filter.value;
  const sub3Value = subPa3Filter.value;
  const sub2Options = [];
  const sub3Options = [];
  const sub4Options = [];

  Object.entries(productHierarchy).forEach(([pa, sub1Map]) => {
    if (paValue !== "all" && pa !== paValue) return;
    Object.entries(sub1Map).forEach(([sub1, sub2Map]) => {
      if (sub1Value !== "all" && sub1 !== sub1Value) return;
      Object.entries(sub2Map).forEach(([sub2, sub3Map]) => {
        sub2Options.push(sub2);
        Object.entries(sub3Map).forEach(([sub3, sub4List]) => {
          if (sub2Value !== "all" && sub2Value && sub2Value !== sub2) return;
          sub3Options.push(sub3);
          if (sub3Value !== "all" && sub3Value && sub3Value !== sub3) return;
          sub4Options.push(...sub4List);
        });
      });
    });
  });

  fillSelect(subPa2Filter, sub2Options.length ? sub2Options : ["-"], true, subPa2Filter.value || "all");
  fillSelect(subPa3Filter, sub3Options.length ? sub3Options : ["-"], true, subPa3Filter.value || "all");
  fillSelect(subPa4Filter, sub4Options.length ? sub4Options : ["-"], true, subPa4Filter.value || "all");
}

function getForecastFixedColumns(mode) {
  const compactColumns = [
    { key: "customer", zh: "客户", en: "Customer", bilingual: true },
    { key: "performance", zh: "业绩归属", en: "Performance attribution", bilingual: true },
    { key: "subpa3", title: "Sub PA-3", bilingual: false },
    { key: "subpa4", title: "Sub PA-4", bilingual: false }
  ];
  if (mode === "compact") return compactColumns;
  return [
    { key: "sales", zh: "销售", en: "Sales", bilingual: true },
    ...compactColumns.slice(0, 2),
    { key: "invoice", zh: "开票公司", en: "Invoicing Legal Entity", bilingual: true },
    { key: "region", zh: "销售大区", en: "Region", bilingual: true },
    { key: "pa", title: "PA", bilingual: false },
    { key: "subpa1", title: "Sub PA-1", bilingual: false },
    { key: "subpa2", title: "Sub PA-2", bilingual: false },
    { key: "subpa3", title: "Sub PA-3", bilingual: false },
    { key: "subpa4", title: "Sub PA-4", bilingual: false }
  ];
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
  const monthTopCells = openMonths.map((month) => `<th colspan="5" class="month-group-th">${month}</th>`).join("");
  const monthSubCells = openMonths
    .map(
      () =>
        '<th class="month-metric-th">订单数量</th><th class="month-metric-th">开票数量</th><th class="month-metric-th">均价</th><th class="month-metric-th">订单金额</th><th class="month-metric-th">开票金额</th>'
    )
    .join("");
  forecastHead.innerHTML = `<tr>${fixedHeadCells}${monthTopCells}</tr><tr>${monthSubCells}</tr>`;
}

function renderForecastColgroup(openMonths, mode = state.forecastViewMode) {
  if (!forecastColgroup) return;
  const fixedColumns = getForecastFixedColumns(mode);
  const fixedWidths =
    mode === "compact"
      ? [140, 160, 110, 110]
      : [110, 140, 160, 140, 120, 100, 110, 110, 110, 110];
  const qtyCellWidth = mode === "compact" ? 66 : 84;
  const priceCellWidth = mode === "compact" ? 68 : 86;
  const amountCellWidth = mode === "compact" ? 96 : 110;
  const fixedCols = fixedColumns
    .map((_, idx) => `<col style="width:${fixedWidths[idx] || 110}px">`)
    .join("");
  const metricCols = openMonths
    .map(
      () =>
        `<col style="width:${qtyCellWidth}px"><col style="width:${qtyCellWidth}px"><col style="width:${priceCellWidth}px"><col style="width:${amountCellWidth}px"><col style="width:${amountCellWidth}px">`
    )
    .join("");
  forecastColgroup.innerHTML = `${fixedCols}${metricCols}`;
}

function buildRow(row, openMonths, mode = state.forecastViewMode) {
  const monthCells = openMonths
    .map((m) => {
      const qtyValue = Number(row[getQtyKey(m)] ?? 0);
      const invValue = Number(row[getInvoiceKey(m)] ?? 0);
      const avgPrice = getAveragePrice(row, m, state.forecast.period);
      const orderAmount = qtyValue * avgPrice;
      const invoiceAmount = invValue * avgPrice;
      return `
        <td class="month-qty-cell"><input type="number" class="month-qty-input" data-month="${m}" value="${qtyValue}" ${state.forecast.readOnly ? "readonly" : ""} /></td>
        <td class="month-inv-cell"><input type="number" class="month-inv-input" data-month="${m}" value="${invValue}" ${state.forecast.readOnly ? "readonly" : ""} /></td>
        <td class="month-price-cell readonly" data-month="${m}">${formatAmount(avgPrice)}</td>
        <td class="month-order-amount-cell readonly" data-month="${m}">${formatAmount(orderAmount)}</td>
        <td class="month-invoice-amount-cell readonly" data-month="${m}">${formatAmount(invoiceAmount)}</td>
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
          const price = getAveragePrice(row, month, state.forecast.period);
          acc.qty += qty;
          acc.inv += inv;
          acc.orderAmount += qty * price;
          acc.invoiceAmount += inv * price;
          return acc;
        },
        { qty: 0, inv: 0, orderAmount: 0, invoiceAmount: 0 }
      );
      return `
        <td class="total-cell">${totals.qty}</td>
        <td class="total-cell">${totals.inv}</td>
        <td class="total-cell">-</td>
        <td class="total-cell">${formatAmount(totals.orderAmount)}</td>
        <td class="total-cell">${formatAmount(totals.invoiceAmount)}</td>
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
    rowNode.querySelectorAll(".month-qty-input").forEach((input) => {
      input.addEventListener("input", () => {
        const month = input.dataset.month;
        rowData[getQtyKey(month)] = Number(input.value || 0);
        const avgPrice = getAveragePrice(rowData, month, state.forecast.period);
        const qty = Number(rowData[getQtyKey(month)] || 0);
        const orderAmountNode = rowNode.querySelector(`.month-order-amount-cell[data-month="${month}"]`);
        if (orderAmountNode) orderAmountNode.textContent = formatAmount(qty * avgPrice);
      });
    });
    rowNode.querySelectorAll(".month-inv-input").forEach((input) => {
      input.addEventListener("input", () => {
        const month = input.dataset.month;
        rowData[getInvoiceKey(month)] = Number(input.value || 0);
        const avgPrice = getAveragePrice(rowData, month, state.forecast.period);
        const inv = Number(rowData[getInvoiceKey(month)] || 0);
        const invoiceAmountNode = rowNode.querySelector(`.month-invoice-amount-cell[data-month="${month}"]`);
        if (invoiceAmountNode) invoiceAmountNode.textContent = formatAmount(inv * avgPrice);
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

function filterPeriodRecords() {
  const status = periodStatusFilter?.value || "all";
  const keyword = (periodKeyword?.value || "").trim().toLowerCase();

  return periodRecords.filter((item) => {
    const statusOk = status === "all" ? true : item.status === status;
    const keywordOk =
      keyword.length === 0
        ? true
        : `${item.period} ${item.openTime} ${item.months.join(" ")}`.toLowerCase().includes(keyword);
    return statusOk && keywordOk;
  });
}

function renderPeriodList() {
  const rows = filterPeriodRecords();
  if (rows.length === 0) {
    periodsBody.innerHTML = `
      <tr>
        <td colspan="5" class="period-empty">未找到符合条件的FC Version，请调整筛选条件后重试。</td>
      </tr>
    `;
    return;
  }
  periodsBody.innerHTML = rows
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

  periodsBody.querySelectorAll("button[data-period]").forEach((btn) => {
    btn.addEventListener("click", () => showForecastDetail(btn.dataset.period));
  });
  periodsBody.querySelectorAll("button[data-history-period]").forEach((btn) => {
    btn.addEventListener("click", () => showApprovalHistoryByPeriod(btn.dataset.historyPeriod));
  });
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

function updateApprovalActionButtons(record) {
  const disabled = !record || record.status === "approved";
  approvalPassBtn.disabled = disabled;
  approvalRejectBtn.disabled = disabled;
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
      return `
        <tr>
          <td>${item.period}</td>
          <td>${item.director}</td>
          <td>${item.sales}</td>
          <td>${item.orderTotal}</td>
          <td>${item.invoiceTotal}</td>
          <td>${formatAmount(item.orderAmountTotal)}</td>
          <td>${formatAmount(item.invoiceAmountTotal)}</td>
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
      const price = getAveragePrice(row, month, record.period);
      hit.monthly[month].order += qty;
      hit.monthly[month].invoice += inv;
      hit.monthly[month].orderAmount += qty * price;
      hit.monthly[month].invoiceAmount += inv * price;
      hit.order += qty;
      hit.invoice += inv;
      hit.orderAmount += qty * price;
      hit.invoiceAmount += inv * price;
    });
  });
  return [...buckets.values()].sort((a, b) => b.order - a.order);
}

function renderApprovalSummaryHead(headNode, dimensionTitle, months) {
  if (!headNode) return;
  const monthTopCols = months.map((month) => `<th colspan="4">${month}</th>`).join("");
  const monthSubCols = months.map(() => "<th>订单数量</th><th>开票数量</th><th>订单金额</th><th>开票金额</th>").join("");
  headNode.innerHTML = `
    <tr>
      <th rowspan="2">${dimensionTitle}</th>
      ${monthTopCols}
      <th rowspan="2">订单数量汇总</th>
      <th rowspan="2">开票数量汇总</th>
      <th rowspan="2">订单金额汇总</th>
      <th rowspan="2">开票金额汇总</th>
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
  approvalSummaryPanel.classList.toggle("hidden", mode === "customer" || mode === "detail");
  approvalDetailDataPanel.classList.toggle("hidden", mode !== "detail");
  const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];

  if (mode === "customer") {
    renderApprovalSummaryHead(approvalSummaryCustomerHead, "客户", months);
    const customerRows = buildApprovalSummaryRows(record, "customer");
    const customerRowHtml = customerRows
      .map(
        (item) => `
      <tr>
        <td>${item.key}</td>
        ${months
          .map(
            (month) =>
              `<td>${item.monthly[month].order}</td><td>${item.monthly[month].invoice}</td><td>${formatAmount(item.monthly[month].orderAmount)}</td><td>${formatAmount(item.monthly[month].invoiceAmount)}</td>`
          )
          .join("")}
        <td>${item.order}</td>
        <td>${item.invoice}</td>
        <td>${formatAmount(item.orderAmount)}</td>
        <td>${formatAmount(item.invoiceAmount)}</td>
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
        ${months
          .map(
            (month) =>
              `<td class="total-cell">${customerTotal.monthly[month].order}</td><td class="total-cell">${customerTotal.monthly[month].invoice}</td><td class="total-cell">${formatAmount(customerTotal.monthly[month].orderAmount)}</td><td class="total-cell">${formatAmount(customerTotal.monthly[month].invoiceAmount)}</td>`
          )
          .join("")}
        <td class="total-cell">${customerTotal.order}</td>
        <td class="total-cell">${customerTotal.invoice}</td>
        <td class="total-cell">${formatAmount(customerTotal.orderAmount)}</td>
        <td class="total-cell">${formatAmount(customerTotal.invoiceAmount)}</td>
      </tr>
    `;
    approvalSummaryByCustomerBody.innerHTML = `${customerRowHtml}${customerTotalRow}`;
    return;
  }
  if (mode === "detail") return;
  const dimensionTitle = mode === "performance" ? "业绩归属" : "销售大区";
  renderApprovalSummaryHead(approvalSummaryHead, dimensionTitle, months);
  const rows = buildApprovalSummaryRows(record, mode);
  const summaryRowsHtml = rows
    .map(
      (item) => `
      <tr>
        <td>${item.key}</td>
        ${months
          .map(
            (month) =>
              `<td>${item.monthly[month].order}</td><td>${item.monthly[month].invoice}</td><td>${formatAmount(item.monthly[month].orderAmount)}</td><td>${formatAmount(item.monthly[month].invoiceAmount)}</td>`
          )
          .join("")}
        <td>${item.order}</td>
        <td>${item.invoice}</td>
        <td>${formatAmount(item.orderAmount)}</td>
        <td>${formatAmount(item.invoiceAmount)}</td>
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
  const summaryTotalRow = `
    <tr class="total-row">
      <td class="total-label">汇总</td>
      ${months
        .map(
          (month) =>
            `<td class="total-cell">${summaryTotal.monthly[month].order}</td><td class="total-cell">${summaryTotal.monthly[month].invoice}</td><td class="total-cell">${formatAmount(summaryTotal.monthly[month].orderAmount)}</td><td class="total-cell">${formatAmount(summaryTotal.monthly[month].invoiceAmount)}</td>`
        )
        .join("")}
      <td class="total-cell">${summaryTotal.order}</td>
      <td class="total-cell">${summaryTotal.invoice}</td>
      <td class="total-cell">${formatAmount(summaryTotal.orderAmount)}</td>
      <td class="total-cell">${formatAmount(summaryTotal.invoiceAmount)}</td>
    </tr>
  `;
  approvalSummaryBody.innerHTML = `${summaryRowsHtml}${summaryTotalRow}`;
}

function renderApprovalDetailTable(record) {
  const months = periodWindows[record.period] || ["Jan", "Feb", "Mar", "Apr"];
  const monthTopHead = months.map((month) => `<th colspan="5">${month}</th>`).join("");
  const monthSubHead = months
    .map(() => "<th>订单数量</th><th>开票数量</th><th>均价</th><th>订单金额</th><th>开票金额</th>")
    .join("");
  approvalDetailHead.innerHTML = `
    <tr>
      <th rowspan="2">客户</th>
      <th rowspan="2">业绩归属</th>
      <th rowspan="2">销售大区</th>
      <th rowspan="2">PA</th>
      <th rowspan="2">Sub PA-3</th>
      <th rowspan="2">Sub PA-4</th>
      ${monthTopHead}
      <th rowspan="2">订单数量汇总</th>
      <th rowspan="2">开票数量汇总</th>
      <th rowspan="2">订单金额汇总</th>
      <th rowspan="2">开票金额汇总</th>
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
      const monthCells = months
        .map((month) => {
          const qty = Number(row[getQtyKey(month)] || 0);
          const inv = Number(row[getInvoiceKey(month)] || 0);
          const price = getAveragePrice(row, month, record.period);
          return `<td>${qty}</td><td>${inv}</td><td>${formatAmount(price)}</td><td>${formatAmount(qty * price)}</td><td>${formatAmount(
            inv * price
          )}</td>`;
        })
        .join("");
      return `
        <tr>
          <td>${row.customer}</td>
          <td>${row.performance}</td>
          <td>${row.region}</td>
          <td>${row.pa}</td>
          <td>${row.subpa3}</td>
          <td>${row.subpa4}</td>
          ${monthCells}
          <td>${order}</td>
          <td>${invoice}</td>
          <td>${formatAmount(amounts.orderAmount)}</td>
          <td>${formatAmount(amounts.invoiceAmount)}</td>
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
      const price = getAveragePrice(row, month, record.period);
      totalByMonth[month].qty += qty;
      totalByMonth[month].inv += inv;
      totalByMonth[month].orderAmount += qty * price;
      totalByMonth[month].invoiceAmount += inv * price;
      totalOrder += qty;
      totalInvoice += inv;
      totalOrderAmount += qty * price;
      totalInvoiceAmount += inv * price;
    });
  });
  const totalMonthCells = months
    .map(
      (month) =>
        `<td class="total-cell">${totalByMonth[month].qty}</td><td class="total-cell">${totalByMonth[month].inv}</td><td class="total-cell">-</td><td class="total-cell">${formatAmount(totalByMonth[month].orderAmount)}</td><td class="total-cell">${formatAmount(totalByMonth[month].invoiceAmount)}</td>`
    )
    .join("");
  const totalRow = `
    <tr class="total-row">
      <td class="total-label" colspan="6">汇总</td>
      ${totalMonthCells}
      <td class="total-cell">${totalOrder}</td>
      <td class="total-cell">${totalInvoice}</td>
      <td class="total-cell">${formatAmount(totalOrderAmount)}</td>
      <td class="total-cell">${formatAmount(totalInvoiceAmount)}</td>
    </tr>
  `;
  approvalDetailBody.innerHTML = `${detailRows}${totalRow}`;
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
  if (approvalAdjustAmount) {
    approvalAdjustAmount.value = String(Number(record.adjustmentAmount || 0));
    approvalAdjustAmount.disabled = record.status === "approved";
  }
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

function submitApprovalOpinion() {
  const opinion = (approvalOpinionInput.value || "").trim();
  if (!opinion) {
    setForecastMessage("error", "请填写审批意见后再提交。");
    return;
  }
  const adjustmentAmount = Number(approvalAdjustAmount?.value || 0);
  if (Number.isNaN(adjustmentAmount)) {
    setForecastMessage("error", "Total调整金额格式不正确。");
    return;
  }
  const action = state.pendingApprovalAction;
  approvalOpinionDialog.close();
  state.pendingApprovalAction = "";
  changeApprovalStatus(action, opinion, adjustmentAmount);
}

function changeApprovalStatus(action, opinion = "", adjustmentAmount = 0) {
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
  record.adjustmentAmount = Number(adjustmentAmount || 0);
  appendApprovalHistory(record, record.status, opinion, actor, record.adjustmentAmount);
  renderApprovalList();
  showApprovalDetail(record.id);
  setForecastMessage(
    "success",
    `审批已更新：${approvalWorkflowLabel(record.status)}。审批意见：${opinion}。Total调整金额：${formatAmount(record.adjustmentAmount)}`
  );
}

function showApprovalListPage() {
  approvalListPage.classList.remove("hidden");
  approvalDetailPage.classList.add("hidden");
}

function showApprovalDetailPage() {
  approvalListPage.classList.add("hidden");
  approvalDetailPage.classList.remove("hidden");
}

function showApprovalWorkbench() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  approvalWorkbench.classList.remove("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
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
        actor: item.actor,
        adjustmentAmount: Number(item.adjustmentAmount || 0)
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
      actor: item.actor,
      adjustmentAmount: Number(item.adjustmentAmount || 0)
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
            <div class="timeline-meta">Total调整金额：${formatAmount(row.adjustmentAmount || 0)}</div>
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

function renderFcSalesPickers(selected = []) {
  const salesList = getAllSalesUsers();
  fcSalesPickers.innerHTML = salesList
    .map(
      (name) => `
      <label class="fc-sales-checkbox">
        <input type="checkbox" value="${name}" ${selected.includes(name) ? "checked" : ""} />
        <span>${name}</span>
      </label>
    `
    )
    .join("");
}

function toggleFcSalesPickers() {
  const custom = fcOpenScopeMode.value === "custom";
  fcSalesPickers.classList.toggle("hidden", !custom);
}

function formatScope(record) {
  if (record.scopeMode !== "custom") return "全部销售人员";
  return record.openSales.length ? record.openSales.join("、") : "未指定";
}

function renderFcVersionList() {
  if (fcVersionRecords.length === 0) {
    fcVersionBody.innerHTML = `<tr><td colspan="5" class="period-empty">暂无FC Version，请先新增。</td></tr>`;
    return;
  }
  fcVersionBody.innerHTML = fcVersionRecords
    .map(
      (item) => `
      <tr>
        <td>${item.version}</td>
        <td>${item.salesStartMonth} ~ ${item.salesEndMonth}</td>
        <td>${item.openStart.replace("T", " ")} ~ ${item.openEnd.replace("T", " ")}</td>
        <td>${formatScope(item)}</td>
        <td class="period-action">
          <button
            class="icon-action-btn"
            data-fc-edit="${item.id}"
            title="编辑FC Version"
            aria-label="编辑FC Version"
            type="button"
          >
            &#9998;
          </button>
          <button
            class="icon-action-btn"
            data-fc-del="${item.id}"
            title="删除FC Version"
            aria-label="删除FC Version"
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
  fcVersionDialogTitle.textContent = editing ? "编辑FC Version" : "新增FC Version";
  fcVersionNameInput.value = editing?.version || "";
  fcSalesStartMonthInput.value = editing?.salesStartMonth || "";
  fcSalesEndMonthInput.value = editing?.salesEndMonth || "";
  fcOpenStartInput.value = editing?.openStart || "";
  fcOpenEndInput.value = editing?.openEnd || "";
  fcOpenScopeMode.value = editing?.scopeMode || "all";
  renderFcSalesPickers(editing?.openSales || []);
  toggleFcSalesPickers();
  fcVersionDialog.showModal();
}

function saveFcVersion() {
  const version = fcVersionNameInput.value.trim();
  const salesStartMonth = fcSalesStartMonthInput.value;
  const salesEndMonth = fcSalesEndMonthInput.value;
  const openStart = fcOpenStartInput.value;
  const openEnd = fcOpenEndInput.value;
  const scopeMode = fcOpenScopeMode.value;
  const openSales = [...fcSalesPickers.querySelectorAll('input[type="checkbox"]:checked')].map((node) => node.value);

  if (!version || !salesStartMonth || !salesEndMonth || !openStart || !openEnd) {
    setForecastMessage("error", "请完整填写FC Version、销售周期和填报时间。");
    return;
  }
  if (salesStartMonth > salesEndMonth) {
    setForecastMessage("error", "销售周期开始年月不能晚于结束年月。");
    return;
  }
  if (openStart > openEnd) {
    setForecastMessage("error", "填报开始时间不能晚于结束时间。");
    return;
  }
  const duplicate = fcVersionRecords.find(
    (item) => item.version === version && item.id !== state.editingFcVersionId
  );
  if (duplicate) {
    setForecastMessage("error", "FC Version名称已存在，请修改后重试。");
    return;
  }
  if (scopeMode === "custom" && openSales.length === 0) {
    setForecastMessage("error", "开放范围为指定销售人员时，至少选择一位销售人员。");
    return;
  }

  const payload = {
    id: state.editingFcVersionId || `fcv_${fcVersionSeed++}`,
    version,
    salesStartMonth,
    salesEndMonth,
    openStart,
    openEnd,
    scopeMode,
    openSales
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
  renderApprovalFilters();
  fcVersionDialog.close();
  setForecastMessage("success", "FC Version已保存。");
}

function deleteFcVersion(id) {
  const idx = fcVersionRecords.findIndex((item) => item.id === id);
  if (idx < 0) return;
  fcVersionRecords.splice(idx, 1);
  syncPeriodRecordsFromFcVersions();
  buildApprovalRecordsFromForecastRows();
  renderFcVersionList();
  renderPeriodList();
  renderApprovalFilters();
  setForecastMessage("success", "FC Version已删除。");
}

function showFcVersionWorkbench() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.remove("hidden");
  baseDataWorkbench.classList.add("hidden");
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
}

function deleteBaseDataRow(id) {
  const store = getCurrentBaseStore();
  if (!store) return;
  const idx = store.rows.findIndex((item) => item.id === id);
  if (idx < 0) return;
  store.rows.splice(idx, 1);
  renderBaseDataTable();
  setForecastMessage("success", "基础数据已删除。");
}

function showBaseDataWorkbench(moduleName) {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  approvalWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.remove("hidden");
  baseDataTitle.textContent = `${moduleName}维护`;
  renderBaseDataTable();
}

function ensureDashboardChartInstance() {
  if (!window.echarts) return false;
  const defs = [
    ["regionShare", dashboardRegionShareChartEl],
    ["share", dashboardShareChartEl],
    ["company", dashboardCompanyChartEl],
    ["product", dashboardProductChartEl],
    ["sales", dashboardSalesChartEl],
    ["trend", dashboardTrendChartEl]
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

function groupRowsBy(rows, keyResolver) {
  const map = new Map();
  rows.forEach((row) => {
    const key = keyResolver(row) || "-";
    if (!map.has(key)) map.set(key, { key, orderQty: 0, invoiceQty: 0, orderAmount: 0, invoiceAmount: 0 });
    const hit = map.get(key);
    const months = periodWindows[row.period] || monthOrder;
    months.forEach((month) => {
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      const price = getAveragePrice(row, month, row.period);
      hit.orderQty += qty;
      hit.invoiceQty += inv;
      hit.orderAmount += qty * price;
      hit.invoiceAmount += inv * price;
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

function calcPeriodTotals(rows, monthsScope = monthOrder) {
  const monthAgg = Object.fromEntries(monthsScope.map((m) => [m, { orderAmount: 0, invoiceAmount: 0, orderQty: 0, invoiceQty: 0 }]));
  let orderQty = 0;
  let invoiceQty = 0;
  let orderAmount = 0;
  let invoiceAmount = 0;
  let filledCount = 0;
  rows.forEach((row) => {
    const months = monthsScope;
    let rowFilled = false;
    months.forEach((month) => {
      const qty = Number(row[getQtyKey(month)] || 0);
      const inv = Number(row[getInvoiceKey(month)] || 0);
      const price = getAveragePrice(row, month, row.period);
      const oa = qty * price;
      const ia = inv * price;
      if (qty > 0 || inv > 0) rowFilled = true;
      orderQty += qty;
      invoiceQty += inv;
      orderAmount += oa;
      invoiceAmount += ia;
      monthAgg[month].orderAmount += oa;
      monthAgg[month].invoiceAmount += ia;
      monthAgg[month].orderQty += qty;
      monthAgg[month].invoiceQty += inv;
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
  const openMonths = (periodInfo?.months || periodWindows[period] || monthOrder).slice();
  const rows = getDashboardRows();
  const prevPeriod = getPrevYearPeriod(period);
  const prevRows = prevPeriod ? forecastRows.filter((row) => row.period === prevPeriod) : [];
  const nowTotals = calcPeriodTotals(rows, openMonths);
  const prevTotals = calcPeriodTotals(prevRows, openMonths);

  const byCompany = groupRowsBy(rows, (row) => row.invoice);
  const byRegion = groupRowsBy(rows, (row) => row.region);
  const byPa = groupRowsBy(rows, (row) => row.pa);
  const byCustomer = groupRowsBy(rows, (row) => row.customer);
  const bySales = groupRowsBy(rows, (row) => row.sales);
  const regionCandidates = [...new Set(regionOptions)];
  const companyCandidates = [...new Set(invoiceMaster.map((item) => normalizeCompanyName(item.invoice)))];
  const customerCandidates = [...new Set(customerMaster)];
  const salesCandidates = [...new Set(Object.values(directorSalesMap).flat())];
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

  return {
    period,
    prevPeriod,
    periodOpenTime: periodInfo?.openTime || "-",
    openMonthsLabel: (periodInfo?.months || []).join(", ") || "-",
    openMonths,
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
    regionShare: buildTopRows(byRegion, state.dashboardMetricMode === "order" ? "orderAmount" : "invoiceAmount", 5, regionCandidates),
    paShare: buildTopRows(byPa, state.dashboardMetricMode === "order" ? "orderAmount" : "invoiceAmount", 5),
    topCompany: buildTopRows(
      byCompanyNormalized,
      state.dashboardMetricMode === "order" ? "orderAmount" : "invoiceAmount",
      5,
      companyCandidates
    ),
    topProduct: buildTopRows(byCustomer, state.dashboardMetricMode === "order" ? "orderAmount" : "invoiceAmount", 5, customerCandidates),
    topSales: buildTopRows(bySales, state.dashboardMetricMode === "order" ? "orderAmount" : "invoiceAmount", 5, salesCandidates)
  };
}

function renderDashboardKpis(snapshot) {
  if (dashboardCurrentPeriod) dashboardCurrentPeriod.textContent = snapshot.period;
  if (dashboardCurrentWindow) dashboardCurrentWindow.textContent = snapshot.periodOpenTime;
  if (dashboardCurrentMonths) dashboardCurrentMonths.textContent = snapshot.openMonthsLabel;
  if (kpiOrderAmt) kpiOrderAmt.textContent = Math.round(Number(snapshot.orderAmount || 0)).toLocaleString("zh-CN");
  if (kpiOrderQtySub) kpiOrderQtySub.textContent = `数量：${Number(snapshot.orderQty).toLocaleString("zh-CN")}`;
  if (kpiOrderYoy) kpiOrderYoy.textContent = `同比：${snapshot.orderYoY.toFixed(1)}%`;
  if (kpiInvAmt) kpiInvAmt.textContent = Math.round(Number(snapshot.invoiceAmount || 0)).toLocaleString("zh-CN");
  if (kpiInvQtySub) kpiInvQtySub.textContent = `数量：${Number(snapshot.invoiceQty).toLocaleString("zh-CN")}`;
  if (kpiInvYoy) kpiInvYoy.textContent = `同比：${snapshot.invoiceYoY.toFixed(1)}%`;
  if (kpiCompletion) kpiCompletion.textContent = `${Math.round(snapshot.completionRate)}%`;
  if (kpiCompletionSub) kpiCompletionSub.textContent = `${snapshot.filledCount}/${snapshot.totalCount}`;
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
  if (dashboardShareTitle) dashboardShareTitle.textContent = `PA 金额占比（${metricLabel}）`;
  if (dashboardCompanyTitle) dashboardCompanyTitle.textContent = `按公司 TOP 5（${metricLabel}）`;
  if (dashboardProductTitle) dashboardProductTitle.textContent = `按客户 TOP 5（${metricLabel}）`;
  if (dashboardSalesTitle) dashboardSalesTitle.textContent = `按销售人员 TOP 5（${metricLabel}）`;
}

function renderDashboardCharts(snapshot) {
  if (!ensureDashboardChartInstance()) return;
  const metricKey = snapshot.metricMode === "order" ? "orderAmount" : "invoiceAmount";
  const metricLabel = snapshot.metricMode === "order" ? "订单金额" : "开票金额";
  const color = snapshot.metricMode === "order" ? "#1677ff" : "#1ab17c";
  renderDashboardTitles(snapshot.metricMode);
  setSingleMetricBar(dashboardCharts.company, snapshot.topCompany, metricLabel, metricKey, color);
  setSingleMetricBar(dashboardCharts.product, snapshot.topProduct, metricLabel, metricKey, color);
  setSingleMetricBar(dashboardCharts.sales, snapshot.topSales, metricLabel, metricKey, color);

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
  setShareDonut(dashboardCharts.share, snapshot.paShare);

  dashboardCharts.trend.setOption({
    color: [color, "#9fb3c8"],
    tooltip: { trigger: "axis" },
    legend: { top: 0, data: [metricLabel, "去年同期"] },
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
      },
      {
        name: "去年同期",
        type: "line",
        smooth: true,
        lineStyle: { type: "dashed" },
        data: snapshot.openMonths.map((m) =>
          Number((snapshot.metricMode === "order" ? snapshot.prevMonthAgg[m].orderAmount : snapshot.prevMonthAgg[m].invoiceAmount).toFixed(2))
        )
      }
    ]
  });
}

function renderDashboardSwitchState() {
  dashboardOrderTab?.classList.toggle("active", state.dashboardMetricMode === "order");
  dashboardInvoiceTab?.classList.toggle("active", state.dashboardMetricMode === "invoice");
}

function setDashboardMetricMode(mode) {
  state.dashboardMetricMode = mode === "invoice" ? "invoice" : "order";
  renderDashboardSwitchState();
  renderDashboard();
}

function renderDashboard() {
  const snapshot = buildDashboardSnapshot();
  renderDashboardKpis(snapshot);
  renderDashboardCharts(snapshot);
}

function showDashboardWorkbench() {
  forecastPeriods.classList.add("hidden");
  forecastWorkbench.classList.add("hidden");
  approvalWorkbench.classList.add("hidden");
  fcVersionWorkbench.classList.add("hidden");
  baseDataWorkbench.classList.add("hidden");
  dashboardWorkbench.classList.remove("hidden");
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
    const hitSub3 = matchFilter(row.subpa3, subPa3Filter.value);
    const hitSub4 = matchFilter(row.subpa4, subPa4Filter.value);
    return hitCustomer && hitInvoice && hitPerformance && hitRegion && hitPa && hitSub1 && hitSub2 && hitSub3 && hitSub4;
  });
}

function hasFilledForecastValue(row) {
  return monthOrder.some((month) => Number(row[getQtyKey(month)] || 0) > 0 || Number(row[getInvoiceKey(month)] || 0) > 0);
}

function runForecastQuery() {
  const rows = getFilteredForecastRows().filter((row) => hasFilledForecastValue(row));
  renderForecastTable(rows);
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
  subPa3Filter.value = "all";
  subPa4Filter.value = "all";
  syncInvoiceDependentFilters();
  syncSubPaFilter();
  syncSubPa234Filters();
  renderForecastTable(getFilteredForecastRows());
  setForecastMessage("info", "筛选条件已重置。");
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

  const sub2Value = addSubPa2.value;
  const sub3Map = sub2Map[sub2Value] || {};
  const sub3Options = Object.keys(sub3Map);
  fillSelect(addSubPa3, sub3Options.length ? sub3Options : ["-"], false, addSubPa3.value || sub3Options[0]);

  const sub3Value = addSubPa3.value;
  const sub4Options = sub3Map[sub3Value] || ["-"];
  const preferred = addSubPa4.value || sub4Options[0] || "-";
  if (addSubPa4List) {
    addSubPa4List.innerHTML = sub4Options.map((item) => `<option value="${item}"></option>`).join("");
  }
  if (!sub4Options.includes(addSubPa4.value)) {
    const fuzzy = sub4Options.find((item) => item.includes(addSubPa4.value || ""));
    addSubPa4.value = fuzzy || preferred;
  }
}

function renderAddMonthMetrics() {
  const months = getOpenMonths();
  addMonthMetrics.innerHTML = months
    .map(
      (month) => `
      <div class="add-month-item">
        <div class="add-month-title">${month}</div>
        <label>订单数量
          <input type="number" min="0" step="1" data-month="${month}" data-metric="qty" value="0" />
        </label>
        <label>开票数量
          <input type="number" min="0" step="1" data-month="${month}" data-metric="inv" value="0" />
        </label>
      </div>
    `
    )
    .join("");
}

function openAddForecastDialog() {
  fillSelect(addCustomer, customerMaster, false, isAllValue(customerFilter.value) ? customerMaster[0] : customerFilter.value);
  fillSelect(addInvoice, invoiceMaster.map((item) => item.invoice), false, isAllValue(invoiceFilter.value) ? invoiceMaster[0].invoice : invoiceFilter.value);
  syncAddInvoiceDependentFields();
  fillSelect(addPa, Object.keys(productMaster), false, isAllValue(paFilter.value) ? Object.keys(productMaster)[0] : paFilter.value);
  syncAddSubPaFilters();
  renderAddMonthMetrics();
  addForecastDialog.showModal();
}

function saveAddForecastRow() {
  const validSubPa4 = [...(addSubPa4List?.options || [])].map((opt) => opt.value);
  if (validSubPa4.length && !validSubPa4.includes(addSubPa4.value)) {
    setForecastMessage("error", "请选择有效的 Sub PA-4（可输入关键字后从建议中选择）。");
    return;
  }
  const row = createForecastRow({
    customer: addCustomer.value,
    invoice: addInvoice.value,
    performance: addPerformance.value,
    region: addRegion.value,
    pa: addPa.value,
    subpa1: addSubPa1.value,
    subpa2: addSubPa2.value,
    subpa3: addSubPa3.value,
    subpa4: addSubPa4.value
  });

  let hasAnyFilled = false;
  addMonthMetrics.querySelectorAll('input[data-month][data-metric="qty"]').forEach((input) => {
    const month = input.dataset.month;
    const value = Number(input.value || 0);
    row[getQtyKey(month)] = value;
    if (value > 0) hasAnyFilled = true;
  });
  addMonthMetrics.querySelectorAll('input[data-month][data-metric="inv"]').forEach((input) => {
    const month = input.dataset.month;
    const value = Number(input.value || 0);
    row[getInvoiceKey(month)] = value;
    if (value > 0) hasAnyFilled = true;
  });

  if (!hasAnyFilled) {
    setForecastMessage("error", "请至少填写一个月份的订单数量或开票数量。");
    return;
  }

  forecastRows.push(row);
  buildApprovalRecordsFromForecastRows();
  addForecastDialog.close();
  renderForecastTable(getFilteredForecastRows());
  setForecastMessage("success", `新增成功：已添加客户 ${row.customer} 的产品预测数据。`);
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
    setForecastMessage("error", "当前周期为只读，无法复制上期数据。");
    return;
  }
  const currentPeriod = state.forecast.period;
  const prevPeriod = getPreviousPeriod(currentPeriod);
  if (!prevPeriod) {
    setForecastMessage("error", "未找到可复制的上期周期数据。");
    return;
  }
  const currentRows = forecastRows.filter((row) => row.period === currentPeriod);
  const prevRows = forecastRows.filter((row) => row.period === prevPeriod);
  if (!currentRows.length || !prevRows.length) {
    setForecastMessage("error", "上期或本期数据为空，无法复制。");
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
      const srcQty = Number(source[qtyKey] || 0);
      const srcInv = Number(source[invKey] || 0);
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
    });
    if (rowChanged) touchedRows += 1;
  });

  if (!updatedCells) {
    setForecastMessage("info", `未复制任何数据：本期已有值或未匹配到上期维度数据（${prevPeriod}）。`);
    return;
  }
  renderForecastTable(getFilteredForecastRows());
  buildApprovalRecordsFromForecastRows();
  setForecastMessage("success", `已从 ${prevPeriod} 复制完成：更新 ${touchedRows} 行，${updatedCells} 个单元格。`);
}

function buildTemplateCsv() {
  const monthHeaders = monthOrder.flatMap((month) => [`${month}_qty`, `${month}_invoice`]);
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
  const sampleMetrics = monthOrder.flatMap((month) => [sample[getQtyKey(month)] ?? 0, sample[getInvoiceKey(month)] ?? 0]);
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
  setForecastMessage("success", "模板下载成功：请按模板格式填写后上传。");
}

function uploadForecastCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const content = String(reader.result || "").trim();
    if (!content) {
      setForecastMessage("error", "上传失败：文件内容为空。");
      return;
    }
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      setForecastMessage("error", "上传失败：至少需要一行表头和一行数据。");
      return;
    }
    const headers = lines[0].split(",").map((item) => item.trim());
    const monthIndexes = {};
    monthOrder.forEach((month) => {
      monthIndexes[`${month}_qty`] = headers.indexOf(`${month}_qty`);
      monthIndexes[`${month}_invoice`] = headers.indexOf(`${month}_invoice`);
    });

    const requiredHeaders = ["customer", "invoice", "performance", "region", "pa", "subpa1", "subpa2", "subpa3", "subpa4"];
    const missingRequired = requiredHeaders.some((name) => headers.indexOf(name) < 0);
    if (missingRequired) {
      setForecastMessage("error", "上传失败：模板字段不完整，请先下载最新模板。");
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
        const invIdx = monthIndexes[`${month}_invoice`];
        row[getQtyKey(month)] = Number(cells[qtyIdx] || 0);
        row[getInvoiceKey(month)] = Number(cells[invIdx] || 0);
      });
      forecastRows.push(row);
      successCount += 1;
    });

    buildApprovalRecordsFromForecastRows();
    runForecastQuery();
    setForecastMessage("success", `上传成功：新增 ${successCount} 条预测数据。`);
  };
  reader.readAsText(file);
}

function validateForecast() {
  const invalidRows = [];
  const openMonths = getOpenMonths();
  getFilteredForecastRows().forEach((row, index) => {
    const metrics = openMonths.flatMap((month) => [Number(row[getQtyKey(month)] || 0), Number(row[getInvoiceKey(month)] || 0)]);
    const hasNegative = metrics.some((value) => value < 0);
    const allEmpty = metrics.every((value) => !value);
    if (hasNegative || allEmpty) invalidRows.push(index + 1);
  });

  if (invalidRows.length > 0) {
    setForecastMessage(
      "error",
      `发现 ${invalidRows.length} 行异常：第 ${invalidRows.join(", ")} 行。请检查月份值（不可为负且至少填写一个月）。`
    );
    return false;
  }

  setForecastMessage("success", "校验通过：主数据联动正常，预测数据可保存或提交审批。");
  return true;
}

function login(domain) {
  state.domain = domain;
  if (currentDomainTag) currentDomainTag.textContent = `M365 SSO: ${domain}`;
  loginView.classList.remove("active");
  mainView.classList.add("active");
  setActiveModule("Dashboard");
}

function logout() {
  loginView.classList.add("active");
  mainView.classList.remove("active");
}

document.querySelectorAll(".sso-btn").forEach((btn) => {
  btn.addEventListener("click", () => login(btn.dataset.domain || "sandvik"));
});

document.getElementById("logout-btn").addEventListener("click", logout);

document.getElementById("open-detail-btn").addEventListener("click", () => {
  dialogTitle.textContent = state.activeModule;
  dialogContent.textContent = moduleData[state.activeModule] || "该模块的业务细节待补充。";
  infoDialog.showModal();
});

document.getElementById("simulate-flow-btn").addEventListener("click", () => {
  const flowText =
    state.activeModule === "销售预测填报"
      ? "流程模拟：销售提交预测 -> 区域总监审核 -> 财务复核 -> 汇总发布"
      : `流程模拟：进入 ${state.activeModule} -> 执行业务操作 -> 记录审计日志`;
  dialogTitle.textContent = "业务流程模拟";
  dialogContent.textContent = flowText;
  infoDialog.showModal();
});

document.getElementById("close-dialog-btn").addEventListener("click", () => infoDialog.close());
document.getElementById("save-draft-btn").addEventListener("click", () => {
  setForecastMessage("info", "已保存（演示模式）：可继续编辑后提交审批。");
});
document.getElementById("submit-btn").addEventListener("click", () => {
  if (validateForecast()) {
    if (flowValue) flowValue.textContent = "已提交审批";
    setForecastMessage("success", "提交成功：流程已流转至区域总监审核节点。");
  }
});
downloadTemplateBtn?.addEventListener("click", downloadTemplate);
uploadBtn?.addEventListener("click", () => uploadInput?.click());
uploadInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) uploadForecastCsv(file);
  uploadInput.value = "";
});
queryBtn?.addEventListener("click", runForecastQuery);
resetQueryBtn?.addEventListener("click", resetForecastFilters);
addRowBtn?.addEventListener("click", addForecastRows);
copyLastPeriodBtn?.addEventListener("click", copyLastPeriodForecastData);
compactViewBtn?.addEventListener("click", () => setForecastViewMode("compact"));
detailViewBtn?.addEventListener("click", () => setForecastViewMode("detail"));
approvalDirectorFilter?.addEventListener("change", syncApprovalSalesFilter);
approvalQueryBtn?.addEventListener("click", runApprovalQuery);
approvalResetBtn?.addEventListener("click", resetApprovalFilters);
approvalBackBtn?.addEventListener("click", showApprovalListPage);
approvalPassBtn?.addEventListener("click", () => openApprovalOpinionDialog("pass"));
approvalRejectBtn?.addEventListener("click", () => openApprovalOpinionDialog("reject"));
approvalOpinionCancelBtn?.addEventListener("click", () => approvalOpinionDialog?.close());
approvalOpinionConfirmBtn?.addEventListener("click", submitApprovalOpinion);
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
fcOpenScopeMode?.addEventListener("change", toggleFcSalesPickers);
fcVersionCancelBtn?.addEventListener("click", () => fcVersionDialog?.close());
fcVersionSaveBtn?.addEventListener("click", saveFcVersion);
baseDataAddBtn?.addEventListener("click", () => openBaseDataDialog());
baseDataCancelBtn?.addEventListener("click", () => baseDataDialog?.close());
baseDataSaveBtn?.addEventListener("click", saveBaseDataRow);
dashboardOrderTab?.addEventListener("click", () => setDashboardMetricMode("order"));
dashboardInvoiceTab?.addEventListener("click", () => setDashboardMetricMode("invoice"));
addInvoice?.addEventListener("change", syncAddInvoiceDependentFields);
addPa?.addEventListener("change", syncAddSubPaFilters);
addSubPa1?.addEventListener("change", syncAddSubPaFilters);
addSubPa2?.addEventListener("change", syncAddSubPaFilters);
addSubPa3?.addEventListener("change", syncAddSubPaFilters);
addDialogCancel?.addEventListener("click", () => addForecastDialog?.close());
addDialogSave?.addEventListener("click", saveAddForecastRow);
invoiceFilter.addEventListener("change", syncInvoiceDependentFilters);
backToPeriods.addEventListener("click", showForecastPeriods);
periodStatusFilter.addEventListener("change", renderPeriodList);
periodKeyword.addEventListener("input", renderPeriodList);
periodResetBtn?.addEventListener("click", () => {
  periodStatusFilter.value = "all";
  periodKeyword.value = "";
  renderPeriodList();
});
subPa1Filter.addEventListener("change", syncSubPa234Filters);
subPa2Filter.addEventListener("change", syncSubPa234Filters);
subPa3Filter.addEventListener("change", syncSubPa234Filters);
paFilter.addEventListener("change", () => {
  syncSubPaFilter();
  syncSubPa234Filters();
});
window.addEventListener("resize", () => {
  Object.values(dashboardCharts).forEach((chart) => chart?.resize());
});

renderMenu();
renderForecastFilters();
if (periodWindowLabel) periodWindowLabel.textContent = `填报窗口：${getOpenMonths().join(", ")}`;
renderForecastTable();
