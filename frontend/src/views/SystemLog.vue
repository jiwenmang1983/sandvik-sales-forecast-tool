<template>
  <div class="systemlog-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">日期范围</span>
          <a-range-picker v-model:value="dateRange" style="width:220px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">操作用户</span>
          <a-select v-model:value="filterUser" style="width:140px" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="u in userList" :key="u" :value="u">{{ u }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">操作类型</span>
          <a-select v-model:value="filterAction" style="width:140px" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="a in actionTypes" :key="a" :value="a">{{ a }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item" style="flex:1;max-width:260px;">
          <span class="filter-label">关键词</span>
          <a-input v-model:value="keyword" placeholder="搜索操作描述..." allow-clear @pressEnter="onSearch" />
        </div>
        <a-button @click="resetFilters">🔄 重置</a-button>
      </div>
      <div class="toolbar" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;color:#6B7280;">共 {{ filteredLogs.length }} 条记录</span>
        <a-space>
          <a-button @click="exportData">📥 导出日志</a-button>
        </a-space>
      </div>
    </a-card>

    <!-- Log Table -->
    <a-card :bordered="false">
      <a-table :columns="columns" :data-source="filteredLogs" :pagination="{pageSize:20}" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-cell">
              <a-avatar :size="28" :style="{ background: avatarColor(record.user) }">
                {{ record.user?.charAt(0) || 'U' }}
              </a-avatar>
              <span>{{ record.user }}</span>
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <a-tag :color="actionTagColor(record.action)">{{ record.action }}</a-tag>
          </template>
          <template v-if="column.key === 'module'">
            <span style="color:#0D3D92;font-weight:500;">{{ record.module }}</span>
          </template>
          <template v-if="column.key === 'ip'">
            <span style="font-family:monospace;font-size:12px;color:#6B7280;">{{ record.ip }}</span>
          </template>
          <template v-if="column.key === 'detail'">
            <span style="font-size:12px;color:#4B5563;">{{ record.detail }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.success ? 'green' : 'red'">{{ record.success ? '成功' : '失败' }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const dateRange = ref(null)
const filterUser = ref('')
const filterAction = ref('')
const keyword = ref('')

const userList = ['陈明', '张伟', '王强', '孙磊', '吴昊', '李娜', '周婷']
const actionTypes = ['登录', '登出', '新增', '编辑', '删除', '提交', '审批', '导入', '导出', '系统设置']

const columns = [
  { title: '时间', key: 'time', dataIndex: 'time', width: 160 },
  { title: '用户', key: 'user', width: 140 },
  { title: '操作类型', key: 'action', width: 100 },
  { title: '模块', key: 'module', width: 120 },
  { title: '操作详情', key: 'detail' },
  { title: 'IP', key: 'ip', width: 130 },
  { title: '状态', key: 'status', width: 70 }
]

const logs = ref([
  { id: 1, time: '2026-04-30 14:32:15', user: '张伟', action: '提交', module: '销售预测', detail: '提交 2026FC2-Q2 预测数据', ip: '10.0.1.105', success: true },
  { id: 2, time: '2026-04-30 14:28:03', user: '王强', action: '编辑', module: '销售预测', detail: '修改客户"昆山智造装备"预测记录', ip: '10.0.1.108', success: true },
  { id: 3, time: '2026-04-30 13:45:22', user: '李娜', action: '审批', module: '审批管理', detail: '通过 2026FC1-华东区Q1预测', ip: '10.0.2.201', success: true },
  { id: 4, time: '2026-04-30 11:20:10', user: '陈明', action: '系统设置', module: '系统配置', detail: '修改审批流程配置', ip: '10.0.3.1', success: true },
  { id: 5, time: '2026-04-30 10:15:44', user: '吴昊', action: '导入', module: '基础数据', detail: '批量导入客户数据 32 条', ip: '10.0.1.104', success: true },
  { id: 6, time: '2026-04-30 09:30:18', user: '孙磊', action: '新增', module: '基础数据', detail: '添加客户"深圳工业设备"', ip: '10.0.1.107', success: true },
  { id: 7, time: '2026-04-29 17:45:33', user: '周婷', action: '审批', module: '审批管理', detail: '驳回 2026FC2-华北区Q2预测，原因：数据不完整', ip: '10.0.2.202', success: true },
  { id: 8, time: '2026-04-29 16:22:07', user: '张伟', action: '登出', module: '系统', detail: '正常退出系统', ip: '10.0.1.105', success: true },
  { id: 9, time: '2026-04-29 16:20:55', user: '张伟', action: '登录', module: '系统', detail: '用户登录系统', ip: '10.0.1.105', success: true },
  { id: 10, time: '2026-04-29 14:10:02', user: '陈明', action: '删除', module: '基础数据', detail: '删除产品"旧型号钻头"', ip: '10.0.3.1', success: true },
  { id: 11, time: '2026-04-29 11:05:19', user: '王强', action: '导出', module: '销售预测', detail: '导出 2026FC1 历史数据', ip: '10.0.1.108', success: true },
  { id: 12, time: '2026-04-28 16:33:45', user: '李娜', action: '编辑', module: '用户权限', detail: '修改用户"赵丽"角色为销售', ip: '10.0.2.201', success: true },
  { id: 13, time: '2026-04-28 10:08:30', user: '陈明', action: '系统设置', module: '系统配置', detail: '添加新预测周期 2026FC3', ip: '10.0.3.1', success: true },
  { id: 14, time: '2026-04-27 15:20:11', user: '吴昊', action: '新增', module: '销售预测', detail: '添加预测记录：客户"杭州刀具科技"', ip: '10.0.1.104', success: true },
  { id: 15, time: '2026-04-27 09:15:42', user: '孙磊', action: '提交', module: '销售预测', detail: '提交 2026FC2-Q2 华北区预测', ip: '10.0.1.107', success: false }
])

const filteredLogs = computed(() => {
  let list = logs.value
  if (filterUser.value) list = list.filter(x => x.user === filterUser.value)
  if (filterAction.value) list = list.filter(x => x.action === filterAction.value)
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(x => x.detail.toLowerCase().includes(kw) || x.module.toLowerCase().includes(kw))
  }
  return list
})

const actionTagColor = (a) => {
  const map = { '登录': 'blue', '登出': 'default', '新增': 'green', '编辑': 'orange', '删除': 'red', '提交': 'cyan', '审批': 'purple', '导入': 'geekblue', '导出': 'gold', '系统设置': 'volcano' }
  return map[a] || 'default'
}

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const onSearch = () => {}
const resetFilters = () => { dateRange.value = null; filterUser.value = ''; filterAction.value = ''; keyword.value = '' }
const exportData = () => message.info('导出日志（演示）')
</script>

<style scoped>
.systemlog-page { }
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 4px 0; }
.filter-item { display: flex; flex-direction: column; gap: 3px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.user-cell { display: flex; align-items: center; gap: 8px; }
</style>