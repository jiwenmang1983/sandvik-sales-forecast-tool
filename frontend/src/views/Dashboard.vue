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
        <span class="period-info-value">2026FC1</span>
      </div>
      <div class="period-info-divider"></div>
      <div class="period-info-item">
        <span class="period-info-label">填报时间</span>
        <span class="period-info-value">2026-01-01 ~ 2026-04-30</span>
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const metricMode = ref('order')
const startMonth = ref('2026-07')
const endMonth = ref('2027-03')
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const productDrillLevel = ref(0)

// KPI metrics
const metrics = reactive({
  amount: 6840183,
  count: 80825,
  yoy: 2.4,
  amount2: 5986814,
  count2: 70777,
  yoy2: 5.5,
  completion: 80,
  pendingTotal: 40,
  pendingDirector: 35,
  pendingFinance: 5
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

// Mock data
const mockData = {
  customers: [
    { name: '三一重工', orderAmt: 2850, invAmt: 2650 },
    { name: '中联重科', orderAmt: 2420, invAmt: 2280 },
    { name: '徐工集团', orderAmt: 2180, invAmt: 2050 },
    { name: '卡特彼勒', orderAmt: 1950, invAmt: 1820 },
    { name: '小松中国', orderAmt: 1680, invAmt: 1550 },
    { name: '柳工机械', orderAmt: 1420, invAmt: 1300 },
    { name: '龙工机械', orderAmt: 1280, invAmt: 1150 },
    { name: '山河智能', orderAmt: 1150, invAmt: 1020 },
  ],
  invoiceCompanies: [
    { name: '上海Sandvik机械', orderAmt: 4200, invAmt: 3950 },
    { name: '北京山特维克商贸', orderAmt: 3580, invAmt: 3350 },
    { name: '广州山特维克进出口', orderAmt: 2950, invAmt: 2780 },
    { name: '深圳精密机械', orderAmt: 2480, invAmt: 2320 },
    { name: '成都工程设备', orderAmt: 1980, invAmt: 1850 },
    { name: '武汉Sandvik机械', orderAmt: 1650, invAmt: 1520 },
  ],
  regions: [
    { name: '华东', orderAmt: 7250, invAmt: 6800 },
    { name: '华南', orderAmt: 5050, invAmt: 4750 },
    { name: '华北', orderAmt: 4550, invAmt: 4250 },
    { name: '西部', orderAmt: 3930, invAmt: 3680 },
    { name: '东北', orderAmt: 1510, invAmt: 1420 },
  ],
  productLines: [
    { name: '刀具', orderAmt: 5800, invAmt: 5450 },
    { name: '铣刀', orderAmt: 4850, invAmt: 4580 },
    { name: '车刀', orderAmt: 3980, invAmt: 3750 },
    { name: '螺纹', orderAmt: 3250, invAmt: 3050 },
    { name: '系统', orderAmt: 2680, invAmt: 2520 },
  ],
  subPA1: [
    { name: 'Holemaking', orderAmt: 2200, invAmt: 2080 },
    { name: 'Milling', orderAmt: 1850, invAmt: 1740 },
    { name: 'Turning', orderAmt: 1450, invAmt: 1360 },
    { name: 'Threading', orderAmt: 1200, invAmt: 1130 },
  ],
  industries: [
    { name: '航空航天', orderAmt: 285, invAmt: 268 },
    { name: '汽车制造', orderAmt: 423, invAmt: 398 },
    { name: '医疗器械', orderAmt: 198, invAmt: 185 },
    { name: '电子信息', orderAmt: 156, invAmt: 145 },
    { name: '模具制造', orderAmt: 112, invAmt: 105 },
    { name: '通用机械', orderAmt: 98, invAmt: 92 },
  ],
  monthly: {
    current: [8500, 9200, 10800, 12500],
    previous: [7200, 8100, 9500, 11200],
    months: ['1月', '2月', '3月', '4月']
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
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['当期预测', '上期实际'], bottom: 0 },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: mockData.monthly.months, axisLine: { lineStyle: { color: '#E5E7EB' } } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F0F0F0' } }, axisLabel: { formatter: v => (v / 10000) + '万' } },
    series: [
      { name: '当期预测', type: 'bar', data: mockData.monthly.current, itemStyle: { color: brandBlue }, barWidth: 24 },
      { name: '上期实际', type: 'line', data: mockData.monthly.previous, smooth: true, lineStyle: { color: brandOrange, width: 2 }, itemStyle: { color: brandOrange } }
    ]
  }
}

const getRegionOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c}万 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
      data: mockData.regions.map((r, i) => ({
        value: r[amtKey], name: r.name,
        itemStyle: { color: [brandBlue, '#2E6BD8', brandOrange, '#5A8FE8', '#8DB4E8'][i] }
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
    data = mockData.productLines.map(r => r[amtKey])
    names = mockData.productLines.map(r => r.name)
  } else if (productDrillLevel.value === 1) {
    data = mockData.subPA1.map(r => r[amtKey])
    names = mockData.subPA1.map(r => r.name)
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
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c}万 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
      data: mockData.industries.map((r, i) => ({
        value: r[amtKey], name: r.name,
        itemStyle: { color: [brandBlue, '#2E6BD8', brandOrange, '#5A8FE8', '#8DB4E8', '#B8D0F0'][i] }
      })),
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
    }]
  }
}

const getTopCustomerOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  const sorted = [...mockData.customers].sort((a, b) => b[amtKey] - a[amtKey]).slice(0, 5)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F0F0F0' } }, axisLabel: { formatter: v => v + '万' } },
    yAxis: { type: 'category', data: sorted.map(c => c.name).reverse(), axisLine: { lineStyle: { color: '#E5E7EB' } } },
    series: [{
      type: 'bar', data: sorted.map(c => c[amtKey]).reverse(), barWidth: 20,
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: brandBlue }, { offset: 1, color: '#5A8FE8' }]) },
      label: { show: true, position: 'right', formatter: '{c}万' }
    }]
  }
}

const getTopCompanyOption = () => {
  const mode = metricMode.value
  const amtKey = mode === 'order' ? 'orderAmt' : 'invAmt'
  const sorted = [...mockData.invoiceCompanies].sort((a, b) => b[amtKey] - a[amtKey]).slice(0, 5)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F0F0F0' } }, axisLabel: { formatter: v => v + '万' } },
    yAxis: { type: 'category', data: sorted.map(c => c.name).reverse(), axisLine: { lineStyle: { color: '#E5E7EB' } } },
    series: [{
      type: 'bar', data: sorted.map(c => c[amtKey]).reverse(), barWidth: 20,
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
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: transparent;
  color: #6B7280;
}

.metric-tab.active {
  background: #0D3D92;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.3);
}

.metric-tab:hover:not(.active) {
  color: #0D3D92;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s, transform 0.3s;
}

.kpi-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 12px;
}

.kpi-icon.blue { background: rgba(13, 61, 146, 0.1); }
.kpi-icon.green { background: rgba(82, 196, 26, 0.1); }
.kpi-icon.orange { background: rgba(245, 166, 35, 0.1); }
.kpi-icon.purple { background: rgba(137, 89, 168, 0.1); }

.kpi-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
}

.kpi-sub {
  font-size: 11px;
  color: #6B7280;
  margin-top: 6px;
}

.trend-up { color: #52C41A; font-weight: 600; }
.trend-down { color: #FF4D4F; font-weight: 600; }

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-card.full-width { grid-column: 1 / -1; }

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title-icon { font-size: 16px; }

.chart-container {
  width: 100%;
  height: 280px;
}

.chart-container.tall { height: 320px; }

.dashboard-footer {
  text-align: center;
  padding: 20px;
  color: #9CA3AF;
  font-size: 12px;
}
</style>
