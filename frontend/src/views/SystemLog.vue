<template>
  <div class="systemlog-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">模块</span>
          <a-select v-model:value="filter.module" style="width:140px" allow-clear placeholder="选择模块">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="m in moduleList" :key="m" :value="m">{{ m }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">用户</span>
          <a-input v-model:value="filter.user" placeholder="姓名/账号" style="width:140px" allow-clear />
        </div>
        <div class="filter-item">
          <span class="filter-label">动作</span>
          <a-input v-model:value="filter.action" placeholder="例如：提交/审批/新增" style="width:140px" allow-clear />
        </div>
        <div class="filter-item">
          <span class="filter-label">开始日期</span>
          <a-date-picker v-model:value="filter.startDate" style="width:140px" placeholder="开始日期" />
        </div>
        <div class="filter-item">
          <span class="filter-label">结束日期</span>
          <a-date-picker v-model:value="filter.endDate" style="width:140px" placeholder="结束日期" />
        </div>
        <div class="filter-actions">
          <a-button type="primary" @click="handleExport">导出CSV</a-button>
          <a-button @click="handleClear">清空</a-button>
        </div>
      </div>
    </a-card>

    <!-- Log Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>用户</th>
              <th>动作</th>
              <th>模块</th>
              <th>操作详情</th>
              <th>IP地址</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="time-cell">{{ log.time }}</td>
              <td>
                <div class="user-cell">
                  <a-avatar :size="24" :style="{ background: avatarColor(log.user) }">
                    {{ log.user?.charAt(0) || 'U' }}
                  </a-avatar>
                  <span>{{ log.user }}</span>
                </div>
              </td>
              <td><span class="action-badge" :class="'action-' + log.action.toLowerCase()">{{ log.action }}</span></td>
              <td><span class="module-link">{{ log.module }}</span></td>
              <td class="detail-cell">{{ log.detail }}</td>
              <td class="ip-cell">{{ log.ip }}</td>
              <td><span class="status-badge" :class="log.success ? 'status-success' : 'status-failed'">{{ log.success ? '成功' : '失败' }}</span></td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="7" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const filter = reactive({
  module: '',
  user: '',
  action: '',
  startDate: null,
  endDate: null
})

const moduleList = ['销售预测', '审批管理', '基础数据', '用户权限', '系统配置', '系统']
const actionTypes = ['登录', '登出', '新增', '编辑', '删除', '提交', '审批', '导入', '导出', '系统设置']

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
  return logs.value.filter(log => {
    if (filter.module && log.module !== filter.module) return false
    if (filter.user && !log.user.toLowerCase().includes(filter.user.toLowerCase())) return false
    if (filter.action && !log.action.toLowerCase().includes(filter.action.toLowerCase())) return false
    return true
  })
})

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const handleExport = () => {
  message.success('导出CSV功能')
}

const handleClear = () => {
  message.info('清空功能')
}
</script>

<style scoped>
.systemlog-page {
  padding: 0;
}

.filter-card,
.table-card {
  margin-bottom: 16px;
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

.table-wrap {
  overflow-x: auto;
}

.forecast-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.forecast-table th {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #E2E8F0;
  white-space: nowrap;
}

.forecast-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #F1F5F9;
  color: #1E293B;
}

.time-cell {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #64748B;
  white-space: nowrap;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.action-登录 { background: #DBEAFE; color: #2563EB; }
.action-登出 { background: #F1F5F9; color: #64748B; }
.action-新增 { background: #D1FAE5; color: #059669; }
.action-编辑 { background: #FEF3C7; color: #D97706; }
.action-删除 { background: #FEE2E2; color: #DC2626; }
.action-提交 { background: #CFFAFE; color: #0891B2; }
.action-审批 { background: #EDE9FE; color: #7C3AED; }
.action-导入 { background: #E0E7FF; color: #4F46E5; }
.action-导出 { background: #FEF3C7; color: #D97706; }
.action-系统设置 { background: #FEE2E2; color: #DC2626; }

.module-link {
  color: #0D3D92;
  font-weight: 500;
}

.detail-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ip-cell {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #64748B;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-success { background: #D1FAE5; color: #059669; }
.status-failed { background: #FEE2E2; color: #DC2626; }

.empty-cell {
  text-align: center;
  color: #94A3B8;
  padding: 32px !important;
}
</style>
