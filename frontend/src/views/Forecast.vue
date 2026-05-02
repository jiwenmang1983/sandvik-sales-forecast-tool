<template>
  <div class="forecast-page">
    <!-- Phase 1: Period List View -->
    <div v-if="view === 'periods'">
      <a-card :bordered="false" class="filter-card">
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <a-select v-model:value="periodFilter.status" style="width:130px">
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="open">开放中</a-select-option>
              <a-select-option value="closed">已关闭</a-select-option>
            </a-select>
          </div>
          <div class="filter-item" style="flex:1; max-width:280px;">
            <span class="filter-label">FC Name</span>
            <a-input v-model:value="periodFilter.keyword" placeholder="输入FC Name关键字" allow-clear />
          </div>
          <div class="filter-actions">
            <a-button @click="resetPeriodFilter">重置</a-button>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false" class="table-card">
        <div class="table-wrap">
          <table class="forecast-table periods-table">
            <thead>
              <tr>
                <th>FC Name</th>
                <th>填报时间</th>
                <th>销售预测周期</th>
                <th>状态</th>
                <th>审批状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredPeriods" :key="p.id" @click="selectPeriod(p)" class="clickable-row">
                <td><span class="fc-name-cell">{{ p.fcName }}</span></td>
                <td>{{ p.fillTime }}</td>
                <td>{{ p.period }}</td>
                <td><span class="status-badge" :class="periodStatusClass(p.status)">{{ periodStatusLabel(p.status) }}</span></td>
                <td><span class="status-badge" :class="approvalStatusClass(p.approval)">{{ approvalStatusLabel(p.approval) }}</span></td>
                <td @click.stop>
                  <a-space>
                    <a-button size="small" type="primary" @click="selectPeriod(p)">填报</a-button>
                    <a-button size="small">历史</a-button>
                  </a-space>
                </td>
              </tr>
              <tr v-if="filteredPeriods.length === 0">
                <td colspan="6" class="empty-cell">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </a-card>
    </div>

    <!-- Phase 2: Forecast Workbench -->
    <div v-if="view === 'workbench'" class="forecast-workbench">
      <!-- Toolbar -->
      <a-card :bordered="false" class="toolbar-card">
        <div class="forecast-toolbar">
          <div class="toolbar-left">
            <a-button @click="backToPeriods" class="back-btn">返回周期列表</a-button>
            <span class="tag">角色：<strong>{{ currentRole }}</strong></span>
            <span class="tag">流程：<strong>{{ currentFlow }}</strong></span>
            <span class="tag">周期：<strong>{{ currentPeriod.period }}</strong></span>
            <span class="tag" v-if="currentPeriod.window">填报窗口：<strong>{{ currentPeriod.window }}</strong></span>
          </div>
          <div class="toolbar-right">
            <a-button @click="downloadTemplate">下载模板</a-button>
            <a-button @click="downloadData">下载数据</a-button>
            <a-button @click="triggerImport">导入</a-button>
            <input type="file" ref="importFileInput" style="display:none" accept=".csv" @change="handleImport" />
            <a-button @click="copyLastPeriod">复制上期</a-button>
            <a-button class="secondary-btn" @click="addNewRow">新增行</a-button>
            <a-button @click="saveDraft" :loading="saving">保存草稿</a-button>
            <a-button type="primary" @click="submitForApproval" :loading="submitting">提交审批</a-button>
          </div>
        </div>
      </a-card>

      <!-- Filter Bar -->
      <a-card :bordered="false" class="filter-card">
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">客户</span>
            <a-select v-model:value="filters.customer" style="width:140px" allow-clear placeholder="选择客户">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="c in customerMaster" :key="c" :value="c">{{ c }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">开票公司</span>
            <a-select v-model:value="filters.invoice" style="width:160px" allow-clear placeholder="选择公司">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="inv in invoiceMaster" :key="inv" :value="inv">{{ inv }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">业绩归属</span>
            <a-select v-model:value="filters.performance" style="width:150px" allow-clear placeholder="选择归属">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="p in performanceMaster" :key="p" :value="p">{{ p }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">销售大区</span>
            <a-select v-model:value="filters.region" style="width:140px" allow-clear placeholder="选择大区">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="r in regionMaster" :key="r" :value="r">{{ r }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">PA</span>
            <a-select v-model:value="filters.pa" style="width:120px" allow-clear placeholder="选择PA">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="pa in paOptions" :key="pa" :value="pa">{{ pa }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">Sub PA-1</span>
            <a-select v-model:value="filters.subpa1" style="width:130px" allow-clear placeholder="选择Sub PA-1">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="s in subpa1Options" :key="s" :value="s">{{ s }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">Sub PA-2</span>
            <a-select v-model:value="filters.subpa2" style="width:130px" allow-clear placeholder="选择Sub PA-2">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="s in subpa2Options" :key="s" :value="s">{{ s }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-actions">
            <a-button type="primary" @click="runQuery">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </div>
        </div>
      </a-card>

      <!-- Forecast Table -->
      <a-card :bordered="false" class="table-card">
        <div class="table-wrap">
          <table class="forecast-table">
            <thead>
              <tr>
                <th>客户</th>
                <th>业绩归属</th>
                <th>开票公司</th>
                <th>销售大区</th>
                <th>PA</th>
                <th>Sub PA-1</th>
                <th>Sub PA-2</th>
                <th v-for="m in currentMonths" :key="m" colspan="6" class="month-col">{{ m }}</th>
                <th>操作</th>
              </tr>
              <tr>
                <th></th><th></th><th></th><th></th><th></th><th></th><th></th>
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
                <td>{{ row.customer }}</td>
                <td>{{ row.performance }}</td>
                <td>{{ row.invoice }}</td>
                <td>{{ row.region }}</td>
                <td>{{ row.pa }}</td>
                <td>{{ row.subpa1 }}</td>
                <td>{{ row.subpa2 }}</td>
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
                    <a-button size="small">编辑</a-button>
                    <a-button size="small" danger>删除</a-button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td :colspan="getColspan" class="empty-cell">暂无数据</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-row">
                <td colspan="7" class="summary-label">合计</td>
                <td v-for="m in currentMonths" :key="m + '_q'" class="num">{{ totalQty(m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_oa'" class="num">{{ totalOrderAmt(m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_op'">-</td>
                <td v-for="m in currentMonths" :key="m + '_iq'" class="num">{{ totalInv(m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_ia'" class="num">{{ totalInvAmt(m) }}</td>
                <td v-for="m in currentMonths" :key="m + '_ip'">-</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="table-footer">
          <span>共 {{ filteredRows.length }} 条记录，当前周期：<strong>{{ currentPeriod.period }}</strong></span>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const view = ref('periods')
const currentRole = ref('销售')
const currentFlow = ref('标准流程')
const currentMonths = ref(['2026-04', '2026-05', '2026-06'])
const submitting = ref(false)
const saving = ref(false)

const currentPeriod = reactive({
  period: '2026FC2',
  window: '2026-04-01 ~ 2026-04-30'
})

const periodFilter = reactive({ status: 'all', keyword: '' })

const filters = reactive({
  customer: '',
  invoice: '',
  performance: '',
  region: '',
  pa: '',
  subpa1: '',
  subpa2: ''
})

// Master data
const customerMaster = ['苏州精密工具', '昆山智造装备', '上海刃具', '杭州刀具科技', '深圳工业']
const invoiceMaster = ['山特维克商贸(上海)', '阿诺精密切削工具(成都)', '武汉阿诺精密', '廊坊舍弗勒']
const performanceMaster = ['精密工具事业部', '刀具事业部', '工业仪器事业部']
const regionMaster = ['华东大区', '华南大区', '华北东北大区', '西南大区']
const paOptions = ['刀具', '钻头', '铣刀', '量具', '夹具']
const subpa1Options = ['标准刀具', '非标刀具', '普通钻头', '超硬钻头']
const subpa2Options = ['2刃', '3刃', '4刃', '5刃以上']

// Period list
const periods = ref([
  { id: 1, fcName: '2026FC2', fillTime: '2026-04-01 ~ 2026-04-30', period: '2026FC2-Q2', status: 'open', approval: 'pending' },
  { id: 2, fcName: '2026FC1', fillTime: '2026-01-01 ~ 2026-01-31', period: '2026FC1-Q1', status: 'closed', approval: 'approved' },
  { id: 3, fcName: '2025FC2', fillTime: '2025-07-01 ~ 2025-07-31', period: '2025FC2-Q2', status: 'closed', approval: 'approved' }
])

const filteredPeriods = computed(() => {
  return periods.value.filter(p => {
    if (periodFilter.status !== 'all' && p.status !== periodFilter.status) return false
    if (periodFilter.keyword && !p.fcName.toLowerCase().includes(periodFilter.keyword.toLowerCase())) return false
    return true
  })
})

const periodStatusLabel = (s) => ({ open: '开放中', closed: '已关闭' }[s] || s)
const periodStatusClass = (s) => ({ open: 'status-open', closed: 'status-closed' }[s] || '')
const approvalStatusLabel = (s) => ({ pending: '待审批', approved: '已审批', rejected: '已驳回' }[s] || s)
const approvalStatusClass = (s) => ({ pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' }[s] || '')

const resetPeriodFilter = () => {
  periodFilter.status = 'all'
  periodFilter.keyword = ''
}

const selectPeriod = (p) => {
  Object.assign(currentPeriod, { period: p.fcName, window: p.fillTime })
  view.value = 'workbench'
}

const backToPeriods = () => {
  view.value = 'periods'
}

// Forecast data
const forecastRows = ref([
  { __id: 'r1', customer: '苏州精密工具', performance: '精密工具事业部', invoice: '山特维克商贸(上海)', region: '华东大区', pa: '刀具', subpa1: '标准刀具', subpa2: '2刃', data: { '2026-04': { qty: 100, inv: 80 }, '2026-05': { qty: 120, inv: 0 }, '2026-06': { qty: 150, inv: 0 } } },
  { __id: 'r2', customer: '昆山智造装备', performance: '刀具事业部', invoice: '阿诺精密切削工具(成都)', region: '西南大区', pa: '钻头', subpa1: '普通钻头', subpa2: '3刃', data: { '2026-04': { qty: 200, inv: 150 }, '2026-05': { qty: 220, inv: 0 }, '2026-06': { qty: 250, inv: 0 } } },
  { __id: 'r3', customer: '上海刃具', performance: '精密工具事业部', invoice: '武汉阿诺精密', region: '华东大区', pa: '铣刀', subpa1: '非标刀具', subpa2: '4刃', data: { '2026-04': { qty: 80, inv: 70 }, '2026-05': { qty: 90, inv: 0 }, '2026-06': { qty: 110, inv: 0 } } },
  { __id: 'r4', customer: '杭州刀具科技', performance: '工业仪器事业部', invoice: '山特维克商贸(上海)', region: '华南大区', pa: '量具', subpa1: '标准刀具', subpa2: '2刃', data: { '2026-04': { qty: 150, inv: 120 }, '2026-05': { qty: 180, inv: 0 }, '2026-06': { qty: 200, inv: 0 } } }
])

const filteredRows = computed(() => {
  return forecastRows.value.filter(row => {
    if (filters.customer && row.customer !== filters.customer) return false
    if (filters.invoice && row.invoice !== filters.invoice) return false
    if (filters.performance && row.performance !== filters.performance) return false
    if (filters.region && row.region !== filters.region) return false
    if (filters.pa && row.pa !== filters.pa) return false
    if (filters.subpa1 && row.subpa1 !== filters.subpa1) return false
    if (filters.subpa2 && row.subpa2 !== filters.subpa2) return false
    return true
  })
})

const getColspan = computed(() => 7 + currentMonths.value.length * 6 + 1)

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

const runQuery = () => { message.info('查询功能') }
const resetFilters = () => { Object.keys(filters).forEach(k => filters[k] = '') }

// Toolbar button handlers
const importFileInput = ref(null)

const downloadTemplate = () => {
  const csv = 'Customer,InvoiceCompany,Product,Amount,Notes\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'forecast_template.csv'
  link.click()
  URL.revokeObjectURL(url)
  message.success('模板下载成功')
}

const downloadData = () => {
  const headers = ['Customer', 'InvoiceCompany', 'Performance', 'Region', 'PA', 'SubPA1', 'SubPA2']
  currentMonths.value.forEach(m => {
    headers.push(`${m}_OrderQty`, `${m}_OrderAmt`, `${m}_InvQty`, `${m}_InvAmt`)
  })
  let csv = headers.join(',') + '\n'
  filteredRows.value.forEach(row => {
    const values = [
      row.customer, row.invoice, row.performance, row.region, row.pa, row.subpa1, row.subpa2
    ]
    currentMonths.value.forEach(m => {
      values.push(row.data[m]?.qty || 0, row.data[m]?.qty * 1000 || 0, row.data[m]?.inv || 0, row.data[m]?.inv * 1000 || 0)
    })
    csv += values.join(',') + '\n'
  })
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `forecast_data_${currentPeriod.period}.csv`
  link.click()
  URL.revokeObjectURL(url)
  message.success('数据下载成功')
}

const triggerImport = () => {
  importFileInput.value.click()
}

const handleImport = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const text = event.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        message.warning('CSV文件为空或格式不正确')
        return
      }
      // Skip header, parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 4) {
          const newRow = {
            __id: 'r' + Date.now() + '_' + i,
            customer: values[0] || '',
            invoice: values[1] || '',
            performance: values[2] || '',
            region: values[3] || '',
            pa: values[4] || '',
            subpa1: values[5] || '',
            subpa2: values[6] || '',
            data: {}
          }
          currentMonths.value.forEach((m, idx) => {
            const baseIdx = 7 + idx * 4
            if (values[baseIdx] !== undefined) {
              newRow.data[m] = {
                qty: parseFloat(values[baseIdx]) || 0,
                inv: parseFloat(values[baseIdx + 2]) || 0
              }
            }
          })
          forecastRows.value.push(newRow)
        }
      }
      message.success(`成功导入 ${lines.length - 1} 条数据`)
    } catch (err) {
      message.error('导入失败：' + err.message)
    }
  }
  reader.readAsText(file)
  // Reset input so same file can be imported again
  e.target.value = ''
}

const copyLastPeriod = () => {
  message.info('复制上期数据功能（待实现）')
}

const addNewRow = () => {
  const newRow = {
    __id: 'r' + Date.now(),
    customer: '',
    invoice: '',
    performance: '',
    region: '',
    pa: '',
    subpa1: '',
    subpa2: '',
    data: {}
  }
  currentMonths.value.forEach(m => {
    newRow.data[m] = { qty: 0, inv: 0 }
  })
  forecastRows.value.push(newRow)
  message.success('已新增一行')
}

const saveDraft = async () => {
  saving.value = true
  try {
    // Transform forecastRows to API format
    const records = []
    forecastRows.value.forEach(row => {
      currentMonths.value.forEach(m => {
        if (row.data[m]?.qty > 0 || row.data[m]?.inv > 0) {
          records.push({
            customerId: row.customer,
            invoiceCompanyId: row.invoice,
            productId: row.pa,
            year: parseInt(m.split('-')[0]),
            month: parseInt(m.split('-')[1]),
            orderAmount: row.data[m].qty * 1000
          })
        }
      })
    })
    const token = localStorage.getItem('token')
    const response = await fetch('/api/forecast/save-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ PeriodId: currentPeriod.id || currentPeriod.period, records })
    })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || '保存失败')
    }
    message.success('草稿保存成功 (' + records.length + ' 条记录)')
  } catch (err) {
    message.error('保存失败: ' + err.message)
  } finally {
    saving.value = false
  }
}

const submitForApproval = async () => {
  submitting.value = true
  try {
    const token = localStorage.getItem('token')
    // Step 1: Submit forecast
    const submitRes = await fetch('/api/forecast/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ PeriodId: currentPeriod.id || currentPeriod.period })
    })
    if (!submitRes.ok) {
      const errData = await submitRes.json().catch(() => ({}))
      throw new Error(errData.message || '提交失败')
    }
    // Step 2: Start approval flow
    const flowRes = await fetch('/api/approval-flow/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ ForecastPeriodId: currentPeriod.id || currentPeriod.period })
    })
    if (!flowRes.ok) {
      const errData = await flowRes.json().catch(() => ({}))
      throw new Error(errData.message || '启动审批流程失败')
    }
    message.success('提交审批成功')
    backToPeriods()
  } catch (err) {
    message.error('提交失败: ' + err.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.forecast-page {
  padding: 0;
}

.filter-card,
.toolbar-card,
.table-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.forecast-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.back-btn {
  color: #0D3D92;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #F1F5F9;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
}

.tag strong {
  color: #0D3D92;
}

.secondary-btn {
  background: #F5A623;
  color: #fff;
  border-color: #F5A623;
}

.table-wrap {
  overflow-x: auto;
}

.forecast-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1200px;
}

.forecast-table th {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
  text-align: center;
  padding: 10px 12px;
  border-bottom: 2px solid #E2E8F0;
  white-space: nowrap;
}

.forecast-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #F1F5F9;
  color: #1E293B;
  text-align: center;
}

.month-col {
  background: #EEF2FF;
  color: #0D3D92;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s;
}

.clickable-row:hover {
  background: #F8FAFF;
}

.fc-name-cell {
  font-weight: 600;
  color: #0D3D92;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-open { background: #D1FAE5; color: #059669; }
.status-closed { background: #F1F5F9; color: #64748B; }
.status-pending { background: #FEF3C7; color: #D97706; }
.status-approved { background: #D1FAE5; color: #059669; }
.status-rejected { background: #FEE2E2; color: #DC2626; }

.editable input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
}

.editable input:focus {
  outline: none;
  border-color: #0D3D92;
  box-shadow: 0 0 0 2px rgba(13, 61, 146, 0.1);
}

.num {
  font-family: 'Roboto Mono', monospace;
  text-align: right;
}

.summary-row td {
  background: #F8FAFC;
  font-weight: 600;
  padding: 10px 12px;
}

.summary-label {
  text-align: right;
  padding-right: 12px !important;
}

.row-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.empty-cell {
  text-align: center;
  color: #94A3B8;
  padding: 32px !important;
}

.table-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #64748B;
}
</style>
