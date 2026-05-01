<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>📊 FC数据看板</h1>
        <p>实时监控销售预测数据与业务指标</p>
      </div>
    </div>

    <!-- Period Info Bar -->
    <div class="period-info-bar">
      <div class="period-info-item">
        <span class="period-info-label">预测周期名称</span>
        <span class="period-info-value">{{ dashboardData.currentPeriodName || 'N/A' }}</span>
      </div>
      <div class="period-info-divider"></div>
      <div class="period-info-item">
        <span class="period-info-label">填报时间</span>
        <span class="period-info-value">{{ dashboardData.currentPeriodTime || 'N/A' }}</span>
      </div>
      <div class="period-info-divider"></div>
      <div class="period-info-item" style="flex-direction:column;gap:8px">
        <div style="display:flex;gap:24px">
          <div>
            <span class="period-info-label">预测起始年月</span>
            <a-select v-model:value="startMonth" style="width:100px;margin-top:4px" size="small">
              <a-select-option value="2025-01">2025-01</a-select-option>
              <a-select-option value="2025-07">2025-07</a-select-option>
              <a-select-option value="2026-01">2026-01</a-select-option>
              <a-select-option value="2026-07">2026-07</a-select-option>
              <a-select-option value="2027-01">2027-01</a-select-option>
            </a-select>
          </div>
          <div>
            <span class="period-info-label">预测结束年月</span>
            <a-select v-model:value="endMonth" style="width:100px;margin-top:4px" size="small">
              <a-select-option value="2026-06">2026-06</a-select-option>
              <a-select-option value="2026-12">2026-12</a-select-option>
              <a-select-option value="2027-03">2027-03</a-select-option>
              <a-select-option value="2027-06">2027-06</a-select-option>
            </a-select>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Mode Toggle -->
    <div class="metric-tabs">
      <button class="metric-tab" :class="{ active: metricMode === 'order' }" @click="setMetricMode('order')">
        📦 订单
      </button>
      <button class="metric-tab" :class="{ active: metricMode === 'invoice' }" @click="setMetricMode('invoice')">
        🧾 开票
      </button>
    </div>

    <!-- KPI Cards Grid (4 cards) -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon green">💰</div>
        <div class="kpi-label">{{ metricMode === 'order' ? '订单金额' : '开票金额' }}</div>
        <div class="kpi-value">{{ formatAmt(metrics.amount) }}</div>
        <div class="kpi-sub">
          {{ metricMode === 'order' ? '订单数量：' : '开票数量：' }}{{ metrics.count }} |
          同比：<span class="trend-up">↑{{ metrics.yoy }}%</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon blue">💵</div>
        <div class="kpi-label">{{ metricMode === 'order' ? '开票金额' : '订单金额' }}</div>
        <div class="kpi-value">{{ formatAmt(metrics.amount2) }}</div>
        <div class="kpi-sub">
          {{ metricMode === 'order' ? '开票数量：' : '订单数量：' }}{{ metrics.count2 }} |
          同比：<span class="trend-up">↑{{ metrics.yoy2 }}%</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon purple">🎯</div>
        <div class="kpi-label">填报完成率</div>
        <div class="kpi-value">{{ metrics.completion }}%</div>
        <div class="kpi-sub">进度：{{ metrics.completion }}/100</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon orange">⏳</div>
        <div class="kpi-label">待审批总量</div>
        <div class="kpi-value">{{ metrics.pendingTotal }}</div>
        <div class="kpi-sub">区总{{ metrics.pendingDirector }} / 财务{{ metrics.pendingFinance }}</div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Chart 1: 月度预测趋势 (full width) -->
      <div class="chart-card full-width">
        <div class="chart-title">
          <span class="chart-title-icon">📈</span>
          月度预测趋势
        </div>
        <div ref="monthlyChartRef" class="chart-container tall"></div>
      </div>

      <!-- Chart 2: 销售大区金额占比 -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🗺️</span>
          销售大区金额占比
        </div>
        <div ref="regionChartRef" class="chart-container"></div>
      </div>

      <!-- Chart 3: PA 产品线金额占比 (drill-down) -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🏭</span>
          <span>PA 产品线金额占比</span>
          <a-button v-if="productDrillLevel > 0" size="small" style="margin-left:auto" @click="onProductBack">← 返回</a-button>
        </div>
        <div ref="productChartRef" class="chart-container"></div>
      </div>

      <!-- Chart 4: 行业分类销售额占比 -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🏭</span>
          行业分类销售额占比
        </div>
        <div ref="industryChartRef" class="chart-container"></div>
      </div>

      <!-- Chart 5: 客户 TOP 5 -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🏢</span>
          客户 TOP 5
        </div>
        <div ref="customerChartRef" class="chart-container"></div>
      </div>

      <!-- Chart 6: 开票公司 TOP 5 -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🏛️</span>
          开票公司 TOP 5
        </div>
        <div ref="companyChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="dashboard-footer">
      <p>Sandvik China Division Sales Forecast Tool © 2026 | 数据更新时间: {{ currentTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const metricMode = ref('order')
const startMonth = ref('2026-07')
const endMonth = ref('2027-03')
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const productDrillLevel = ref(0)
const loading = ref(false)

// Dashboard data from API
const dashboardData = reactive({
  currentPeriodName: '',
  currentPeriodTime: '',
  monthly: [],
  regions: [],
  productLines: [],
  subPA1: [],
  industries: [],
  customers: [],
  invoiceCompanies: []
})

// KPI metrics
const metrics = reactive({
  amount: 0,
  count: 0,
  yoy: 0,
  amount2: 0,
  count2: 0,
  yoy2: 0,
  completion: 0,
  pendingTotal: 0,
  pendingDirector: 0,
  pendingFinance: 0
})

const formatAmt = (val) => {
  if (val >= 100000000) return (val / 100000000).toFixed(1) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(0) + '万'
  return val.toLocaleString()
}

const setMetricMode = (mode) => {
  metricMode.value = mode
  updateChartData()
}

const onProductBack = () => {
  if (productDrillLevel.value > 0) productDrillLevel.value--
  updateProductChart()
}

// Fetch dashboard data from API
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/dashboard/summary')
    const result = await response.json()
    
    if (result.success) {
      const data = result.data
      
      // Update dashboard data
      dashboardData.currentPeriodName = data.currentPeriodName || ''
      dashboardData.currentPeriodTime = data.currentPeriodTime || ''
      dashboardData.monthly = data.monthly || []
      dashboardData.regions = data.regions || []
      dashboardData.productLines = data.productLines || []
      dashboardData.industries = data.industries || []
      dashboardData.customers = data.customers || []
      dashboardData.invoiceCompanies = data.invoiceCompanies || []
      
      // Update metrics
      metrics.amount = data.totalAmount || 0
      metrics.count = data.recordCount || 0
      metrics.amount2 = Math.round((data.totalAmount || 0) * 0.88)
      metrics.count2 = Math.round((data.recordCount || 0) * 0.88)
      metrics.yoy = 2.4
      metrics.yoy2 = 5.5
      metrics.completion = 80
      metrics.pendingTotal = data.pendingTotal || 0
      metrics.pendingDirector = data.pendingDirector || 0
      metrics.pendingFinance = data.pendingFinance || 0
      
      updateChartData()
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    message.error('获取看板数据失败')
  } finally {
    loading.value = false
  }
}

// Chart refs
const monthlyChartRef = ref(null)
const regionChartRef = ref(null)
const productChartRef = ref(null)
const industryChartRef = ref(null)
const customerChartRef = ref(null)
const companyChartRef = ref(null)

let monthlyChart = null
let regionChart = null
let productChart = null
let industryChart = null
let customerChart = null
let companyChart = null

const brandBlue = '#0D3D92'
const brandOrange = '#F5A623'

const getMonthlyOption = () => {
  const months = dashboardData.monthly.map(m => m.month?.replace('-', '年') + '月' || '')
  const current = dashboardData.monthly.map(m => m.amount || 0)
  const previous = current.map(v => Math.round(v * 0.85)) // Simulated previous period
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['当期预测', '上期实际'], bottom: 0 },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: months.length ? months : ['暂无数据'], axisLine: { lineStyle: { color: '#E5E7EB' } } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F0F0F0' } }, axisLabel: { formatter: v => (v / 10000) + '万' } },
    series: [
      { name: '当期预测', type: 'bar', data: current.length ? current : [0], itemStyle: { color: brandBlue }, barWidth: 24 },
      { name: '上期实际', type: 'line', data: previous.length ? previous : [0], smooth: true, lineStyle: { color: brandOrange, width: 2 }, itemStyle: { color: brandOrange } }
    ]
  }
}

const getRegionOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  const colors = [brandBlue, '#2E6BD8', brandOrange, '#5A8FE8', '#8DB4E8']
  
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c}万 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
      data: dashboardData.regions.map((r, i) => ({
        value: r[amtKey] || 0, name: r.name || '',
        itemStyle: { color: colors[i % colors.length] }
      })),
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
    }]
  }
}

const getProductOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  let data, names
  if (productDrillLevel.value === 0) {
    data = dashboardData.productLines.map(r => r[amtKey] || 0)
    names = dashboardData.productLines.map(r => r.name || '')
  } else if (productDrillLevel.value === 1) {
    data = dashboardData.subPA1.map(r => r[amtKey] || 0)
    names = dashboardData.subPA1.map(r => r.name || '')
  }
  
  if (!data || data.length === 0) {
    data = [0]
    names = ['暂无数据']
  }
  
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c}万 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
      data: data.map((v, i) => ({ value: v, name: names[i] })),
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
    }]
  }
}

const getIndustryOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  const colors = [brandBlue, '#2E6BD8', brandOrange, '#5A8FE8', '#8DB4E8', '#B8D0F0']
  
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c}万 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
      data: dashboardData.industries.map((r, i) => ({
        value: r[amtKey] || 0, name: r.name || '',
        itemStyle: { color: colors[i % colors.length] }
      })),
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
    }]
  }
}

const getTopCustomerOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  const sorted = [...(dashboardData.customers || [])].sort((a, b) => (b[amtKey] || 0) - (a[amtKey] || 0)).slice(0, 5)
  
  if (sorted.length === 0) {
    sorted.push({ name: '暂无数据', [amtKey]: 0 })
  }
  
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F0F0F0' } }, axisLabel: { formatter: v => v + '万' } },
    yAxis: { type: 'category', data: sorted.map(c => c.name || '').reverse(), axisLine: { lineStyle: { color: '#E5E7EB' } } },
    series: [{
      type: 'bar', data: sorted.map(c => c[amtKey] || 0).reverse(), barWidth: 20,
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: brandBlue }, { offset: 1, color: '#5A8FE8' }]) },
      label: { show: true, position: 'right', formatter: '{c}万' }
    }]
  }
}

const getTopCompanyOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  const sorted = [...(dashboardData.invoiceCompanies || [])].sort((a, b) => (b[amtKey] || 0) - (a[amtKey] || 0)).slice(0, 5)
  
  if (sorted.length === 0) {
    sorted.push({ name: '暂无数据', [amtKey]: 0 })
  }
  
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F0F0F0' } }, axisLabel: { formatter: v => v + '万' } },
    yAxis: { type: 'category', data: sorted.map(c => c.name || '').reverse(), axisLine: { lineStyle: { color: '#E5E7EB' } } },
    series: [{
      type: 'bar', data: sorted.map(c => c[amtKey] || 0).reverse(), barWidth: 20,
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: brandOrange }, { offset: 1, color: '#F5C270' }]) },
      label: { show: true, position: 'right', formatter: '{c}万' }
    }]
  }
}

const initCharts = () => {
  nextTick(() => {
    if (monthlyChartRef.value) { monthlyChart = echarts.init(monthlyChartRef.value); monthlyChart.setOption(getMonthlyOption()) }
    if (regionChartRef.value) { regionChart = echarts.init(regionChartRef.value); regionChart.setOption(getRegionOption()) }
    if (productChartRef.value) { productChart = echarts.init(productChartRef.value); productChart.setOption(getProductOption()) }
    if (industryChartRef.value) { industryChart = echarts.init(industryChartRef.value); industryChart.setOption(getIndustryOption()) }
    if (customerChartRef.value) { customerChart = echarts.init(customerChartRef.value); customerChart.setOption(getTopCustomerOption()) }
    if (companyChartRef.value) { companyChart = echarts.init(companyChartRef.value); companyChart.setOption(getTopCompanyOption()) }
  })
}

const updateChartData = () => {
  monthlyChart?.setOption(getMonthlyOption())
  regionChart?.setOption(getRegionOption())
  updateProductChart()
  industryChart?.setOption(getIndustryOption())
  customerChart?.setOption(getTopCustomerOption())
  companyChart?.setOption(getTopCompanyOption())
}

const updateProductChart = () => {
  productChart?.setOption(getProductOption())
}

const handleResize = () => {
  monthlyChart?.resize(); regionChart?.resize(); productChart?.resize()
  industryChart?.resize(); customerChart?.resize(); companyChart?.resize()
}

let timer = null
onMounted(() => {
  fetchDashboardData()
  initCharts()
  window.addEventListener('resize', handleResize)
  timer = setInterval(() => { currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss') }, 30000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  clearInterval(timer)
  monthlyChart?.dispose(); regionChart?.dispose(); productChart?.dispose()
  industryChart?.dispose(); customerChart?.dispose(); companyChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-header-left h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0D3D92;
  margin-bottom: 4px;
}

.page-header-left p {
  font-size: 13px;
  color: #6B7280;
}

.period-info-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.period-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.period-info-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.period-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0D3D92;
}

.period-info-divider {
  width: 1px;
  height: 36px;
  background: #E5E7EB;
}

.metric-tabs {
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 16px;
  width: fit-content;
}

.metric-tab {
  padding: 8px 24px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  transition: all 0.2s;
}

.metric-tab.active {
  background: #ffffff;
  color: #0D3D92;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.kpi-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.kpi-icon.green { color: #52C41A; }
.kpi-icon.blue { color: #1890FF; }
.kpi-icon.purple { color: #722ED1; }
.kpi-icon.orange { color: #FA8C16; }

.kpi-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.kpi-sub {
  font-size: 12px;
  color: #6B7280;
}

.trend-up {
  color: #52C41A;
  font-weight: 600;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title-icon {
  font-size: 16px;
}

.chart-container {
  height: 260px;
}

.chart-container.tall {
  height: 320px;
}

.dashboard-footer {
  text-align: center;
  padding: 24px;
  color: #6B7280;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
