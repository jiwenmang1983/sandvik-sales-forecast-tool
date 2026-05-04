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
                    <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" @click="selectPeriod(p)">填报</button>
                    <button type="button" class="ant-btn ant-btn-sm" @click="">历史</button>
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
            <input type="file" ref="importFileInput" style="display:none" accept=".xlsx" @change="handleImport" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getForecastData, saveForecastData } from '@/api/forecast'

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
const periods = ref([])

const fetchPeriods = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/forecast/periods', {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    const json = await res.json()
    if (json.success && json.data) {
      periods.value = json.data.map(p => ({
        id: p.id || p.Id,
        fcName: p.periodName || p.name || `预测周期${p.year}-${p.month}`,
        fillTime: p.startDate ? `${p.startDate.split('T')[0]} ~ ${p.endDate?.split('T')[0] || ''}` : '',
        period: p.periodName || `FC${p.year}-${p.month}`,
        status: (p.status || 'open').toLowerCase().includes('close') ? 'closed' : 'open',
        approval: p.approvalStatus || 'pending'
      }))
    }
  } catch (err) {
    console.error('Failed to fetch periods:', err)
  }
}

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
  Object.assign(currentPeriod, { period: p.fcName, window: p.fillTime, id: p.id })
  loadForecastData(p.id)
  view.value = 'workbench'
}

const backToPeriods = () => {
  view.value = 'periods'
}

// Forecast data (populated by loadForecastData from real API)
const forecastRows = ref([])

const loadForecastData = async (periodId) => {
  try {
    const result = await getForecastData(periodId)
    if (result && result.data) {
      forecastRows.value = result.data.map((r, idx) => ({
        __id: r.id || r.Id || ('r' + idx),
        customerId: r.customerId || r.CustomerId || '',
        customer: r.customerName || r.CustomerName || '',
        performanceId: r.performanceId || '',
        performance: r.performance || r.Performance || '',
        invoiceId: r.invoiceCompanyId || r.InvoiceCompanyId || '',
        invoice: r.invoiceCompany || r.InvoiceCompany || '',
        regionId: r.regionId || '',
        region: r.region || r.Region || '',
        productId: r.productId || r.ProductId || '',
        pa: r.productName || r.ProductName || '',
        subpa1: r.subPa1 || r.SubPa1 || '',
        subpa2: r.subPa2 || r.SubPa2 || '',
        data: {
          [r.year + '-' + String(r.month).padStart(2, '0')]: {
            qty: r.orderQty || 0,
            orderAmount: r.orderAmount || 0,
            inv: r.invoiceQty || 0,
            invoiceAmount: r.invoiceAmount || 0,
            notes: r.notes || ''
          }
        }
      }))
    }
  } catch (err) {
    console.error('Failed to load forecast data:', err)
  }
}

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
const setQty = (row, m, e) => { if (!row.data[m]) row.data[m] = {}; row.data[m].qty = parseFloat(e.target.value) || 0 }
const getInv = (row, m) => row.data[m]?.inv || 0
const setInv = (row, m, e) => { if (!row.data[m]) row.data[m] = {}; row.data[m].inv = parseFloat(e.target.value) || 0 }
const orderAmt = (row, m) => { const amt = row.data[m]?.orderAmount; return amt ? amt.toLocaleString() : '-' }
const orderPrice = (row, m) => { const d = row.data[m]; return (d?.qty > 0 && d?.orderAmount) ? (d.orderAmount / d.qty).toFixed(2) : '-' }
const invAmt = (row, m) => { const amt = row.data[m]?.invoiceAmount; return amt ? amt.toLocaleString() : '-' }
const invPrice = (row, m) => { const d = row.data[m]; return (d?.inv > 0 && d?.invoiceAmount) ? (d.invoiceAmount / d.inv).toFixed(2) : '-' }

const totalQty = (m) => filteredRows.value.reduce((s, r) => s + (r.data[m]?.qty || 0), 0)
const totalInv = (m) => filteredRows.value.reduce((s, r) => s + (r.data[m]?.inv || 0), 0)
const totalOrderAmt = (m) => { const amt = filteredRows.value.reduce((s, r) => s + (r.data[m]?.orderAmount || 0), 0); return amt > 0 ? amt.toLocaleString() : '-' }
const totalInvAmt = (m) => { const amt = filteredRows.value.reduce((s, r) => s + (r.data[m]?.invoiceAmount || 0), 0); return amt > 0 ? amt.toLocaleString() : '-' }

const runQuery = () => { message.info('查询功能') }
const resetFilters = () => { Object.keys(filters).forEach(k => filters[k] = '') }

// Toolbar button handlers
const importFileInput = ref(null)

const downloadTemplate = () => {
  const token = localStorage.getItem('token')
  fetch('/api/forecast/template', {
    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'forecast_import_template.xlsx'
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('模板下载成功')
    })
    .catch(err => {
      console.error('Failed to download template:', err)
      message.error('模板下载失败')
    })
}

const downloadData = () => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (currentPeriod.id) params.append('forecastPeriodId', currentPeriod.id)

  fetch('/api/forecast/export?' + params.toString(), {
    method: 'POST',
    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
  })
    .then(res => {
      if (!res.ok) throw new Error('Export failed')
      return res.blob()
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `forecast_export_${currentPeriod.period || 'data'}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('数据下载成功')
    })
    .catch(err => {
      console.error('Failed to download data:', err)
      message.error('数据下载失败')
    })
}

const triggerImport = () => {
  importFileInput.value.click()
}

const handleImport = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)

  fetch('/api/forecast/import', {
    method: 'POST',
    headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        message.success(`导入成功：新建 ${data.created} 条，更新 ${data.updated} 条`)
        if (data.errors && data.errors.length > 0) {
          message.warning(`有 ${data.errors.length} 条错误`)
        }
        // Refresh data
        if (currentPeriod.id) {
          loadForecastData(currentPeriod.id)
        }
      } else {
        message.error('导入失败：' + (data.message || '未知错误'))
      }
    })
    .catch(err => {
      console.error('Failed to import:', err)
      message.error('导入失败：' + err.message)
    })
    .finally(() => {
      // Reset input so same file can be imported again
      e.target.value = ''
    })
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
    const records = forecastRows.value.map(row => ({
      customerId: row.customerId || row.customer || '',
      productId: row.productId || row.pa || '',
      year: parseInt(currentMonths.value[0].split('-')[0]),
      month: parseInt(currentMonths.value[0].split('-')[1]),
      orderQty: row.data[currentMonths.value[0]]?.qty || 0,
      orderAmount: row.data[currentMonths.value[0]]?.orderAmount || 0,
      invoiceQty: row.data[currentMonths.value[0]]?.inv || 0,
      invoiceAmount: row.data[currentMonths.value[0]]?.invoiceAmount || 0,
      notes: row.data[currentMonths.value[0]]?.notes || ''
    }))
    await saveForecastData(currentPeriod.id, records)
    message.success('草稿保存成功')
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

onMounted(() => {
  fetchPeriods()
})
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
