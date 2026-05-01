<template>
  <div class="dashboard-page">
    <!-- Period Info Bar -->
    <div class="period-info-bar">
      <div class="period-info-item">
        <span class="period-info-label">当前周期</span>
        <span class="period-info-value">2026FC2</span>
      </div>
      <div class="period-info-divider"></div>
      <div class="period-info-item forecast-month-item">
        <span class="period-info-label">填报月份</span>
        <div class="forecast-month-subfields">
          <div class="forecast-month-subfield">
            <span class="period-info-value">2026-04</span>
            <span class="period-info-label">~</span>
          </div>
          <div class="forecast-month-subfield">
            <span class="period-info-value">Q2</span>
            <span class="period-info-label">预测季度</span>
          </div>
        </div>
      </div>
      <div class="period-info-divider"></div>
      <div class="period-info-item">
        <span class="period-info-label">填报截止</span>
        <span class="period-info-value">2026-04-30</span>
      </div>
      <div class="period-info-divider"></div>
      <div class="period-info-item">
        <span class="period-info-label">填报状态</span>
        <a-tag color="orange" style="margin:0">开放中</a-tag>
      </div>
      <div style="margin-left:auto;">
        <a-select v-model:value="selectedPeriod" style="width:140px">
          <a-select-option value="fc2">2026FC2</a-select-option>
          <a-select-option value="fc3">2026FC3</a-select-option>
        </a-select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon blue">💰</div>
        <div class="kpi-label">总预测金额</div>
        <div class="kpi-value">¥{{ formatNum(kpiData.totalForecast) }}</div>
        <div class="kpi-sub">本季度预测总计</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green">🎯</div>
        <div class="kpi-label">预测准确率</div>
        <div class="kpi-value">{{ kpiData.accuracy }}%</div>
        <div class="kpi-sub">较上期 <span :class="kpiData.accuracyTrend > 0 ? 'trend-up' : 'trend-down'">{{ kpiData.accuracyTrend > 0 ? '↑' : '↓' }} {{ Math.abs(kpiData.accuracyTrend) }}%</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon orange">⏳</div>
        <div class="kpi-label">待审批数量</div>
        <div class="kpi-value">{{ kpiData.pendingApprovals }}</div>
        <div class="kpi-sub">当前等待审批</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon purple">🚚</div>
        <div class="kpi-label">准时交货率</div>
        <div class="kpi-value">{{ kpiData.onTimeDelivery }}%</div>
        <div class="kpi-sub">近90天统计</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red">📊</div>
        <div class="kpi-label">实际 vs 预测</div>
        <div class="kpi-value">{{ kpiData.actualVsForecast }}%</div>
        <div class="kpi-sub">实际完成比例</div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Monthly Forecast vs Actual -->
      <div class="chart-card full-width">
        <div class="chart-title">
          <span class="chart-title-icon">📈</span>
          月度预测 vs 实际
        </div>
        <div ref="monthlyChartRef" class="chart-container tall"></div>
      </div>

      <!-- Revenue by Region -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🌍</span>
          区域营收分布
        </div>
        <div ref="regionChartRef" class="chart-container"></div>
      </div>

      <!-- Sales by Category -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">📦</span>
          产品类别销售
        </div>
        <div ref="categoryChartRef" class="chart-container"></div>
      </div>

      <!-- Forecast Accuracy Trend -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🎯</span>
          预测准确率趋势
        </div>
        <div ref="accuracyTrendChartRef" class="chart-container"></div>
      </div>

      <!-- Top Products -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🏆</span>
          Top 5 产品
        </div>
        <div ref="topProductsChartRef" class="chart-container"></div>
      </div>

      <!-- Pipeline Status -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="chart-title-icon">🔄</span>
          预测 Pipeline 状态
        </div>
        <div ref="pipelineChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const selectedPeriod = ref('fc2')

// KPI Data
const kpiData = reactive({
  totalForecast: 128500000,
  accuracy: 87.5,
  accuracyTrend: 2.3,
  pendingApprovals: 12,
  onTimeDelivery: 94.2,
  actualVsForecast: 83.6
})

const formatNum = (num) => {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(0) + '万'
  return num.toLocaleString()
}

// Chart refs
const monthlyChartRef = ref(null)
const regionChartRef = ref(null)
const categoryChartRef = ref(null)
const accuracyTrendChartRef = ref(null)
const topProductsChartRef = ref(null)
const pipelineChartRef = ref(null)

let monthlyChart = null
let regionChart = null
let categoryChart = null
let accuracyTrendChart = null
let topProductsChart = null
let pipelineChart = null

// Chart options
const brandBlue = '#0D3D92'
const brandOrange = '#F5A623'

const getMonthlyOption = () => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['预测', '实际'], bottom: 0 },
  grid: { left: 50, right: 20, top: 20, bottom: 50 },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: '#E5E7EB' } }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#F0F0F0' } },
    axisLabel: { formatter: val => (val / 10000) + '万' }
  },
  series: [
    {
      name: '预测',
      type: 'line',
      data: [820, 932, 901, 1034, 1290, 1330, 1320, 1100, 1250, 1380, 1420, 1450],
      smooth: true,
      lineStyle: { color: brandBlue, width: 3 },
      itemStyle: { color: brandBlue },
      areaStyle: { color: 'rgba(13,61,146,0.08)' }
    },
    {
      name: '实际',
      type: 'line',
      data: [780, 890, 920, 980, 1150, 1200, null, null, null, null, null, null],
      smooth: true,
      lineStyle: { color: brandOrange, width: 3 },
      itemStyle: { color: brandOrange },
      areaStyle: { color: 'rgba(245,166,35,0.08)' }
    }
  ]
})

const getRegionOption = () => ({
  tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    center: ['35%', '50%'],
    data: [
      { value: 320, name: '华东', itemStyle: { color: brandBlue } },
      { value: 280, name: '华南', itemStyle: { color: '#2E6BD8' } },
      { value: 220, name: '华北', itemStyle: { color: brandOrange } },
      { value: 180, name: '西南', itemStyle: { color: '#5A8FE8' } },
      { value: 140, name: '东北', itemStyle: { color: '#8DB4E8' } }
    ],
    label: { show: false },
    emphasis: {
      itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' }
    }
  }]
})

const getCategoryOption = () => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['50%', '75%'],
    center: ['50%', '50%'],
    data: [
      { value: 350, name: '刀具', itemStyle: { color: brandBlue } },
      { value: 280, name: '钻头', itemStyle: { color: brandOrange } },
      { value: 200, name: '铣刀', itemStyle: { color: '#2E6BD8' } },
      { value: 150, name: '量具', itemStyle: { color: '#5A8FE8' } },
      { value: 120, name: '其他', itemStyle: { color: '#8DB4E8' } }
    ],
    label: { formatter: '{b}\n{d}%' },
    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
  }]
})

const getAccuracyTrendOption = () => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['FC1', 'FC2', 'FC3', 'FC4', 'FC5', 'FC6'],
    axisLine: { lineStyle: { color: '#E5E7EB' } }
  },
  yAxis: {
    type: 'value',
    min: 70,
    max: 100,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#F0F0F0' } },
    axisLabel: { formatter: '{value}%' }
  },
  series: [{
    type: 'area',
    data: [82, 85, 88, 84, 87, 90],
    smooth: true,
    lineStyle: { color: '#52C41A', width: 2 },
    itemStyle: { color: '#52C41A' },
    areaStyle: { color: 'rgba(82,196,26,0.15)' }
  }]
})

const getTopProductsOption = () => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 80, right: 20, top: 10, bottom: 30 },
  xAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#F0F0F0' } },
    axisLabel: { formatter: val => (val / 10000) + '万' }
  },
  yAxis: {
    type: 'category',
    data: [' CoroPak', 'SuperAust', 'DuraMax', 'InvaX', 'SMax'],
    axisLine: { lineStyle: { color: '#E5E7EB' } }
  },
  series: [{
    type: 'bar',
    data: [320, 280, 240, 200, 160],
    barWidth: 20,
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: brandBlue },
        { offset: 1, color: '#5A8FE8' }
      ])
    },
    label: { show: true, position: 'right', formatter: '{c}万' }
  }]
})

const getPipelineOption = () => ({
  tooltip: {},
  radar: {
    center: ['50%', '55%'],
    radius: '65%',
    indicator: [
      { name: '填报完成', max: 100 },
      { name: '待审批', max: 50 },
      { name: '已审批', max: 100 },
      { name: '已锁定', max: 50 },
      { name: '已归档', max: 50 }
    ],
    axisName: { color: '#6B7280', fontSize: 11 }
  },
  series: [{
    type: 'radar',
    data: [{
      value: [95, 12, 78, 25, 40],
      name: 'Pipeline状态',
      lineStyle: { color: brandBlue, width: 2 },
      itemStyle: { color: brandBlue },
      areaStyle: { color: 'rgba(13,61,146,0.2)' }
    }]
  }]
})

const initCharts = () => {
  nextTick(() => {
    if (monthlyChartRef.value) {
      monthlyChart = echarts.init(monthlyChartRef.value)
      monthlyChart.setOption(getMonthlyOption())
    }
    if (regionChartRef.value) {
      regionChart = echarts.init(regionChartRef.value)
      regionChart.setOption(getRegionOption())
    }
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value)
      categoryChart.setOption(getCategoryOption())
    }
    if (accuracyTrendChartRef.value) {
      accuracyTrendChart = echarts.init(accuracyTrendChartRef.value)
      accuracyTrendChart.setOption(getAccuracyTrendOption())
    }
    if (topProductsChartRef.value) {
      topProductsChart = echarts.init(topProductsChartRef.value)
      topProductsChart.setOption(getTopProductsOption())
    }
    if (pipelineChartRef.value) {
      pipelineChart = echarts.init(pipelineChartRef.value)
      pipelineChart.setOption(getPipelineOption())
    }
  })
}

const handleResize = () => {
  monthlyChart?.resize()
  regionChart?.resize()
  categoryChart?.resize()
  accuracyTrendChart?.resize()
  topProductsChart?.resize()
  pipelineChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  monthlyChart?.dispose()
  regionChart?.dispose()
  categoryChart?.dispose()
  accuracyTrendChart?.dispose()
  topProductsChart?.dispose()
  pipelineChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.period-info-bar {
  display: flex;
  align-items: center;
  gap: 32px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.period-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.period-info-label {
  font-size: 12px;
  color: #6B7280;
}

.period-info-value {
  font-size: 15px;
  font-weight: 600;
  color: #0D3D92;
}

.period-info-divider {
  width: 1px;
  height: 40px;
  background: #E5E7EB;
}

.forecast-month-item {
  flex-direction: column;
  gap: 8px;
}

.forecast-month-subfields {
  display: flex;
  gap: 24px;
}

.forecast-month-subfield {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1400px) {
  .kpi-grid { grid-template-columns: repeat(4, 1fr); }
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
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
.kpi-icon.red { background: rgba(255, 77, 79, 0.1); }
.kpi-icon.purple { background: rgba(137, 89, 168, 0.1); }

.kpi-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
  line-height: 1.3;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1.2;
}

.kpi-sub {
  font-size: 12px;
  color: #6B7280;
  margin-top: 6px;
}

.kpi-sub .trend-up { color: #52C41A; font-weight: 600; }
.kpi-sub .trend-down { color: #FF4D4F; font-weight: 600; }

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .charts-grid { grid-template-columns: 1fr; }
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title-icon {
  font-size: 18px;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.chart-container.tall {
  height: 360px;
}
</style>
