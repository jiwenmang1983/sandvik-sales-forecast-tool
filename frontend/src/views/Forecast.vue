<template>
  <div class="forecast-page">
    <!-- Period List View -->
    <div v-if="view === 'periods'">
      <a-card :bordered="false" style="margin-bottom:16px">
        <template #title>
          <div style="display:flex;align-items:center;gap:8px;">
            <span>📋 预测周期列表</span>
          </div>
        </template>
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <a-select v-model:value="periodFilter.status" style="width:130px" @change="onPeriodFilter">
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="open">开放中</a-select-option>
              <a-select-option value="history">历史</a-select-option>
              <a-select-option value="closed">已关闭</a-select-option>
            </a-select>
          </div>
          <div class="filter-item" style="flex:1;max-width:280px;">
            <span class="filter-label">关键词搜索</span>
            <a-input v-model:value="periodFilter.keyword" placeholder="搜索周期名称..." allow-clear @pressEnter="onPeriodFilter" />
          </div>
          <div style="display:flex;align-items:flex-end;gap:8px;margin-left:auto;">
            <a-button @click="resetPeriodFilter">🔄 重置</a-button>
            <a-button type="primary" @click="openAddPeriodDialog">+ 新增周期</a-button>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false">
        <a-table
          :columns="periodColumns"
          :data-source="filteredPeriods"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'period'">
              <strong>{{ record.period }}</strong>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'open' ? 'green' : record.status === 'closed' ? 'orange' : 'default'">
                {{ statusLabel(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'approval'">
              <a-tag :color="record.approval === 'pending' ? 'orange' : record.approval === 'approved' ? 'green' : 'red'">
                {{ approvalStatusLabel(record.approval) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="selectPeriod(record)">✏️ 填报</a-button>
                <a-button size="small" @click="viewPeriodHistory(record)">📋 历史</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- Forecast Detail View -->
    <div v-if="view === 'detail'" class="forecast-detail">
      <a-card :bordered="false" style="margin-bottom:12px">
        <div class="forecast-toolbar">
          <div class="toolbar-info-tags">
            <a-tag>角色：<strong>{{ currentRole }}</strong></a-tag>
            <a-tag>流程：<strong>{{ currentFlow }}</strong></a-tag>
            <a-tag>周期：<strong>{{ currentPeriod.period }}</strong></a-tag>
            <a-tag>填报窗口：<strong>{{ currentPeriod.openTime }}</strong></a-tag>
          </div>
          <a-divider type="vertical" />
          <a-space>
            <a-button @click="downloadTemplate">📥 下载模板</a-button>
            <a-upload :before-upload="uploadCsv" :show-upload-list="false" accept=".csv">
              <a-button>📤 批量上传</a-button>
            </a-upload>
          </a-space>
          <a-divider type="vertical" />
          <a-space>
            <a-button @click="runQuery">🔍 查询</a-button>
            <a-button @click="resetFilters">🔄 重置</a-button>
          </a-space>
          <a-divider type="vertical" />
          <a-space>
            <a-button @click="openAddRowDialog">➕ 添加</a-button>
            <a-button @click="copyLastPeriod">📋 复制上期</a-button>
          </a-space>
          <div style="margin-left:auto;">
            <a-radio-group v-model:value="viewMode" button-style="solid">
              <a-radio-button value="compact">紧凑视图</a-radio-button>
              <a-radio-button value="detail">详细视图</a-radio-button>
            </a-radio-group>
          </div>
          <a-divider type="vertical" />
          <a-space>
            <a-button @click="downloadData">📤 下载数据</a-button>
            <a-button @click="saveDraft">💾 保存草稿</a-button>
            <a-button type="primary" @click="submitForApproval">🚀 提交审批</a-button>
          </a-space>
        </div>
      </a-card>

      <a-card :bordered="false" style="margin-bottom:12px">
        <div class="filter-panel">
          <div class="filter-item">
            <span class="filter-label">客户</span>
            <a-select v-model:value="filters.customer" style="width:130px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="c in customerMaster" :key="c" :value="c">{{ c }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">开票公司</span>
            <a-select v-model:value="filters.invoice" style="width:130px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="inv in invoiceMaster" :key="inv" :value="inv">{{ inv }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">业绩归属</span>
            <a-select v-model:value="filters.performance" style="width:130px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="p in filteredPerformance" :key="p" :value="p">{{ p }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">销售大区</span>
            <a-select v-model:value="filters.region" style="width:130px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="r in filteredRegions" :key="r" :value="r">{{ r }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">PA产品线</span>
            <a-select v-model:value="filters.pa" style="width:130px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="pa in paOptions" :key="pa" :value="pa">{{ pa }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">Sub PA-1</span>
            <a-select v-model:value="filters.subpa1" style="width:130px" :disabled="!filters.pa" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="s in subpa1Options" :key="s" :value="s">{{ s }}</a-select-option>
            </a-select>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false">
        <div class="table-wrap">
          <table class="forecast-table">
            <thead>
              <tr>
                <template v-if="viewMode === 'detail'">
                  <th>销售</th>
                  <th>客户</th>
                  <th>业绩归属</th>
                  <th>开票公司</th>
                  <th>销售大区</th>
                  <th>PA</th>
                  <th>Sub PA-1</th>
                  <th>Sub PA-2</th>
                </template>
                <template v-if="viewMode === 'compact'">
                  <th>客户</th>
                  <th>业绩归属</th>
                  <th>开票公司</th>
                  <th>销售大区</th>
                  <th>PA</th>
                  <th>Sub PA-1</th>
                  <th>Sub PA-2</th>
                </template>
                <th v-for="m in currentMonths" :key="m" :colspan="6" class="month-colgroup-title">{{ m }}</th>
                <th>操作</th>
              </tr>
              <tr>
                <template v-if="viewMode === 'detail'">
                  <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
                </template>
                <template v-if="viewMode === 'compact'">
                  <th></th><th></th><th></th><th></th><th></th><th></th><th></th>
                </template>
                <th v-for="m in currentMonths" :key="m + '_oq'">订单数量</th>
                <th v-for="m in currentMonths" :key="m + '_oa'">订单金额</th>
                <th v-for="m in currentMonths" :key="m + '_op'">订单单价</th>
                <th v-for="m in currentMonths" :key="m + '_iq'">开票数量</th>
                <th v-for="m in currentMonths" :key="m + '_ia'">开票金额</th>
                <th v-for="m in currentMonths" :key="m + '_ip'">开票单价</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.__id">
                <template v-if="viewMode === 'detail'">
                  <td>{{ row.sales }}</td>
                  <td>{{ row.customer }}</td>
                  <td>{{ row.performance }}</td>
                  <td>{{ row.invoice }}</td>
                  <td>{{ row.region }}</td>
                  <td>{{ row.pa }}</td>
                  <td>{{ row.subpa1 }}</td>
                  <td>{{ row.subpa2 }}</td>
                </template>
                <template v-if="viewMode === 'compact'">
                  <td>{{ row.customer }}</td>
                  <td>{{ row.performance }}</td>
                  <td>{{ row.invoice }}</td>
                  <td>{{ row.region }}</td>
                  <td>{{ row.pa }}</td>
                  <td>{{ row.subpa1 }}</td>
                  <td>{{ row.subpa2 }}</td>
                </template>
                <td v-for="m in currentMonths" :key="m" class="editable">
                  <input type="number" :value="getQty(row, m)" @change="setQty(row, m, $event)" placeholder="0" />
                </td>
                <td v-for="m in currentMonths" :key="m + '_oq'">{{ orderAmt(row, m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_op'">{{ orderPrice(row, m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_iq'" class="editable">
                  <input type="number" :value="getInv(row, m)" @change="setInv(row, m, $event)" placeholder="0" />
                </td>
                <td v-for="m in currentMonths" :key="m + '_ia'">{{ invAmt(row, m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_ip'">{{ invPrice(row, m) }}</td>
                <td>
                  <div class="row-actions">
                    <a-button size="small" @click="editRow(row)">✏️</a-button>
                    <a-button size="small" danger @click="deleteRow(row)">🗑️</a-button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td :colspan="getColspan">
                  <a-empty description="暂无数据，请添加或上传预测数据">
                    <a-button type="primary" @click="openAddRowDialog">+ 添加预测记录</a-button>
                  </a-empty>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-row">
                <td :colspan="viewMode === 'detail' ? 8 : 7" style="font-weight:600;background:#f5f7fa;text-align:right;padding-right:12px;">
                  合计
                </td>
                <td v-for="m in currentMonths" :key="m + '_q'" style="font-weight:600;background:#f5f7fa;">
                  {{ totalQty(m) }}
                </td>
                <td v-for="m in currentMonths" :key="m + '_oa'" style="font-weight:600;background:#f5f7fa;">
                  {{ totalOrderAmt(m) }}
                </td>
                <td v-for="m in currentMonths" :key="m + '_op'" style="font-weight:600;background:#f5f7fa;">-</td>
                <td v-for="m in currentMonths" :key="m + '_iq'" style="font-weight:600;background:#f5f7fa;">
                  {{ totalInv(m) }}
                </td>
                <td v-for="m in currentMonths" :key="m + '_ia'" style="font-weight:600;background:#f5f7fa;">
                  {{ totalInvAmt(m) }}
                </td>
                <td v-for="m in currentMonths" :key="m + '_ip'" style="font-weight:600;background:#f5f7fa;">-</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="table-footer">
          <span>共 {{ filteredRows.length }} 条记录，当前周期：<strong>{{ currentPeriod.period }}</strong></span>
          <a-pagination
            v-model:current="page"
            :total="filteredRows.length"
            :page-size="20"
            show-quick-jumper
          />
        </div>
      </a-card>
    </div>

    <!-- Add Row Modal -->
    <a-modal
      v-model:open="showAddModal"
      :title="editingRow ? '编辑预测记录' : '添加预测记录'"
      width="680px"
      @ok="saveRow"
      @cancel="showAddModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">客户<span style="color:#ff4d4f">*</span></label>
          <a-select v-model:value="formData.customer" placeholder="请选择客户">
            <a-select-option v-for="c in customerMaster" :key="c" :value="c">{{ c }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">开票公司<span style="color:#ff4d4f">*</span></label>
          <a-select v-model:value="formData.invoice" placeholder="请选择">
            <a-select-option v-for="inv in invoiceMaster" :key="inv" :value="inv">{{ inv }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">业绩归属</label>
          <a-select v-model:value="formData.performance" placeholder="请选择">
            <a-select-option v-for="p in performanceMaster" :key="p" :value="p">{{ p }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">销售大区</label>
          <a-select v-model:value="formData.region" placeholder="请选择">
            <a-select-option v-for="r in regionMaster" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">PA产品线</label>
          <a-select v-model:value="formData.pa" placeholder="请选择">
            <a-select-option v-for="pa in paOptions" :key="pa" :value="pa">{{ pa }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">Sub PA-1</label>
          <a-input v-model:value="formData.subpa1" placeholder="请输入" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Sub PA-2</label>
          <a-input v-model:value="formData.subpa2" placeholder="请输入" />
        </div>
        <div class="form-group">
          <label class="form-label">销售</label>
          <a-input v-model:value="formData.sales" placeholder="请输入" />
        </div>
      </div>
    </a-modal>

    <!-- Add Period Modal -->
    <a-modal
      v-model:open="showAddPeriodModal"
      title="新增预测周期"
      @ok="savePeriod"
      @cancel="showAddPeriodModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">周期名称<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="periodForm.period" placeholder="如：2026FC3" />
        </div>
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="periodForm.status">
            <a-select-option value="open">开放中</a-select-option>
            <a-select-option value="history">历史</a-select-option>
            <a-select-option value="closed">已关闭</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">填报开始时间</label>
          <a-date-picker v-model:value="periodForm.startDate" style="width:100%" />
        </div>
        <div class="form-group">
          <label class="form-label">填报截止时间</label>
          <a-date-picker v-model:value="periodForm.endDate" style="width:100%" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const view = ref('periods')
const viewMode = ref('detail')
const page = ref(1)
const showAddModal = ref(false)
const showAddPeriodModal = ref(false)
const editingRow = ref(null)
const currentRole = ref('销售')
const currentFlow = ref('标准流程')
const currentMonths = ref(['2026-04', '2026-05', '2026-06'])

const currentPeriod = reactive({
  period: '2026FC2',
  openTime: '2026-04-01 ~ 2026-04-30'
})

const filters = reactive({
  customer: '',
  invoice: '',
  performance: '',
  region: '',
  pa: '',
  subpa1: '',
  subpa2: ''
})

const periodFilter = reactive({ status: 'all', keyword: '' })

const formData = reactive({
  customer: '', invoice: '', performance: '', region: '', pa: '', subpa1: '', subpa2: '', sales: ''
})

const periodForm = reactive({ period: '', status: 'open', startDate: null, endDate: null })

// Master data
const customerMaster = ['苏州精密工具', '昆山智造装备', '上海刃具', '杭州刀具科技', '深圳工业']
const invoiceMaster = ['山特维克商贸(上海)', '阿诺精密切削工具(成都)', '武汉阿诺精密', '廊坊舍弗勒']
const performanceMaster = ['精密工具事业部', '刀具事业部', '工业仪器事业部']
const regionMaster = ['华东大区', '华南大区', '华北东北大区', '西南大区']
const paOptions = ['刀具', '钻头', '铣刀', '量具', '夹具']
const subpa1Options = ['标准刀具', '非标刀具', '普通钻头', '超硬钻头']
const subpa2Options = ['2刃', '3刃', '4刃', '5刃以上']

const filteredPerformance = computed(() => performanceMaster)
const filteredRegions = computed(() => regionMaster)

// Period list
const periodColumns = [
  { title: '预测周期', key: 'period', dataIndex: 'period' },
  { title: '开放时间', key: 'openTime', dataIndex: 'openTime' },
  { title: '包含月份', key: 'months', dataIndex: 'months' },
  { title: '状态', key: 'status' },
  { title: '填报状态', key: 'approval' },
  { title: '操作', key: 'actions' }
]

const periods = ref([
  { id: 'fc2', period: '2026FC2', openTime: '2026-04-01 ~ 2026-04-30', months: ['2026-04', '2026-05', '2026-06'], status: 'open', approval: 'pending' },
  { id: 'fc1', period: '2026FC1', openTime: '2026-01-01 ~ 2026-01-31', months: ['2026-01', '2026-02', '2026-03'], status: 'history', approval: 'approved' },
  { id: 'fc0', period: '2025FC2', openTime: '2025-07-01 ~ 2025-07-31', months: ['2025-07', '2025-08', '2025-09'], status: 'closed', approval: 'approved' }
])

const filteredPeriods = computed(() => {
  return periods.value.filter(p => {
    if (periodFilter.status !== 'all' && p.status !== periodFilter.status) return false
    if (periodFilter.keyword && !p.period.includes(periodFilter.keyword)) return false
    return true
  })
})

const statusLabel = (s) => ({ open: '开放中', history: '历史', closed: '已关闭' }[s] || s)
const approvalStatusLabel = (s) => ({ pending: '待审批', approved: '已审批', rejected: '已驳回' }[s] || s)

const onPeriodFilter = () => {}
const resetPeriodFilter = () => { periodFilter.status = 'all'; periodFilter.keyword = '' }
const selectPeriod = (p) => { Object.assign(currentPeriod, p); view.value = 'detail' }
const viewPeriodHistory = (p) => { message.info('查看历史：' + p.period) }
const openAddPeriodDialog = () => { showAddPeriodModal.value = true }
const savePeriod = () => {
  if (!periodForm.period) { message.error('请填写必填项'); return }
  periods.value.push({ id: 'fc_' + Date.now(), ...periodForm, months: currentMonths.value, approval: 'pending' })
  showAddPeriodModal.value = false
  message.success('周期已创建')
}

// Detail table
const forecastRows = ref([
  { __id: 'r1', sales: '张伟', customer: '苏州精密工具', performance: '精密工具事业部', invoice: '山特维克商贸(上海)', region: '华东大区', pa: '刀具', subpa1: '标准刀具', subpa2: '2刃', data: { '2026-04': { qty: 100, inv: 80 }, '2026-05': { qty: 120, inv: 0 }, '2026-06': { qty: 150, inv: 0 } } },
  { __id: 'r2', sales: '王强', customer: '昆山智造装备', performance: '刀具事业部', invoice: '阿诺精密切削工具(成都)', region: '西南大区', pa: '钻头', subpa1: '普通钻头', subpa2: '3刃', data: { '2026-04': { qty: 200, inv: 150 }, '2026-05': { qty: 220, inv: 0 }, '2026-06': { qty: 250, inv: 0 } } },
  { __id: 'r3', sales: '孙磊', customer: '上海刃具', performance: '精密工具事业部', invoice: '武汉阿诺精密', region: '华东大区', pa: '铣刀', subpa1: '非标刀具', subpa2: '4刃', data: { '2026-04': { qty: 80, inv: 70 }, '2026-05': { qty: 90, inv: 0 }, '2026-06': { qty: 110, inv: 0 } } },
  { __id: 'r4', sales: '吴昊', customer: '杭州刀具科技', performance: '工业仪器事业部', invoice: '山特维克商贸(上海)', region: '华南大区', pa: '量具', subpa1: '标准刀具', subpa2: '2刃', data: { '2026-04': { qty: 150, inv: 120 }, '2026-05': { qty: 180, inv: 0 }, '2026-06': { qty: 200, inv: 0 } } }
])

const filteredRows = computed(() => {
  return forecastRows.value.filter(row => {
    if (filters.customer && row.customer !== filters.customer) return false
    if (filters.invoice && row.invoice !== filters.invoice) return false
    if (filters.performance && row.performance !== filters.performance) return false
    if (filters.region && row.region !== filters.region) return false
    if (filters.pa && row.pa !== filters.pa) return false
    if (filters.subpa1 && row.subpa1 !== filters.subpa1) return false
    return true
  })
})

const getColspan = computed(() => (viewMode.value === 'detail' ? 8 : 7) + currentMonths.value.length * 6 + 1)

const getQty = (row, m) => row.data[m]?.qty || 0
const setQty = (row, m, e) => { if (!row.data[m]) row.data[m] = { qty: 0, inv: 0 }; row.data[m].qty = parseFloat(e.target.value) || 0 }
const getInv = (row, m) => row.data[m]?.inv || 0
const setInv = (row, m, e) => { if (!row.data[m]) row.data[m] = { qty: 0, inv: 0 }; row.data[m].inv = parseFloat(e.target.value) || 0 }
const orderAmt = (row, m) => { const qty = getQty(row, m); return qty > 0 ? (qty * 1000).toLocaleString() : '-' }
const orderPrice = (row, m) => { const qty = getQty(row, m); return qty > 0 ? '1,000' : '-' }
const invAmt = (row, m) => { const inv = getInv(row, m); return inv > 0 ? (inv * 1000).toLocaleString() : '-' }
const invPrice = (row, m) => { const inv = getInv(row, m); return inv > 0 ? '1,000' : '-' }

const totalQty = (m) => filteredRows.value.reduce((s, r) => s + (getQty(r, m) || 0), 0)
const totalInv = (m) => filteredRows.value.reduce((s, r) => s + (getInv(r, m) || 0), 0)
const totalOrderAmt = (m) => { const t = totalQty(m); return t > 0 ? (t * 1000).toLocaleString() : '-' }
const totalInvAmt = (m) => { const t = totalInv(m); return t > 0 ? (t * 1000).toLocaleString() : '-' }

const runQuery = () => { page.value = 1 }
const resetFilters = () => { Object.keys(filters).forEach(k => filters[k] = '') }

const openAddRowDialog = () => { editingRow.value = null; Object.keys(formData).forEach(k => formData[k] = ''); showAddModal.value = true }
const editRow = (row) => {
  editingRow.value = row
  Object.assign(formData, { customer: row.customer, invoice: row.invoice, performance: row.performance, region: row.region, pa: row.pa, subpa1: row.subpa1, subpa2: row.subpa2, sales: row.sales })
  showAddModal.value = true
}
const deleteRow = (row) => {
  const idx = forecastRows.value.findIndex(r => r.__id === row.__id)
  if (idx >= 0) forecastRows.value.splice(idx, 1)
  message.success('已删除')
}
const saveRow = () => {
  if (!formData.customer || !formData.invoice) { message.error('请填写必填项'); return }
  if (editingRow.value) {
    const idx = forecastRows.value.findIndex(r => r.__id === editingRow.value.__id)
    if (idx >= 0) Object.assign(forecastRows.value[idx], { ...formData })
    message.success('更新成功')
  } else {
    forecastRows.value.push({ __id: 'r_' + Date.now(), ...formData, data: {} })
    message.success('添加成功')
  }
  showAddModal.value = false
}

const copyLastPeriod = () => message.info('复制上期数据（演示）')
const submitForApproval = () => message.success('已提交审批')
const downloadTemplate = () => message.info('下载模板（演示）')
const uploadCsv = (file) => { message.info('上传CSV：' + file.name); return false }
const downloadData = () => message.info('下载数据（演示）')
const saveDraft = () => message.success('草稿已保存')
</script>

<style scoped>
.forecast-page { }
.period-filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid #E5E7EB; background: #fafafa; }
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 4px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.forecast-toolbar { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 20px; border-bottom: 1px solid #E5E7EB; background: #fafafa; align-items: center; }
.toolbar-info-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-panel { display: flex; gap: 12px; flex-wrap: wrap; padding: 12px 20px; background: #fff; }
.table-wrap { overflow-x: auto; }
.forecast-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.forecast-table th { background: #f5f7fa; padding: 8px 10px; text-align: center; font-weight: 600; color: #6B7280; border: 1px solid #E5E7EB; white-space: nowrap; }
.forecast-table th.left { text-align: left; }
.forecast-table td { padding: 6px 10px; border: 1px solid #E5E7EB; text-align: center; }
.forecast-table td.left { text-align: left; }
.forecast-table td.editable { background: #fff; }
.forecast-table td input[type="number"] { width: 70px; border: 1px solid transparent; border-radius: 4px; padding: 3px 6px; text-align: right; font-size: 12px; background: transparent; }
.forecast-table td input[type="number"]:focus { border-color: #0D3D92; background: #fff; outline: none; }
.month-colgroup-title { background: #e8f0fe; font-weight: 700; color: #0D3D92; }
.row-actions { display: flex; gap: 4px; justify-content: center; }
.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-top: 1px solid #E5E7EB; background: #fafafa; font-size: 12px; color: #6B7280; }
.summary-row td { background: #f5f7fa !important; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 600; color: #6B7280; }
</style>
