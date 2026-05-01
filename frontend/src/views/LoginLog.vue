<template>
  <div class="loginlog-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">日期范围</span>
          <a-range-picker v-model:value="dateRange" style="width:220px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">用户账号</span>
          <a-select v-model:value="filterUser" style="width:140px" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="u in userList" :key="u" :value="u">{{ u }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">登录状态</span>
          <a-select v-model:value="filterStatus" style="width:120px" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="fail">失败</a-select-option>
          </a-select>
        </div>
        <div class="filter-item" style="flex:1;max-width:260px;">
          <span class="filter-label">关键词</span>
          <a-input v-model:value="keyword" placeholder="搜索IP或详情..." allow-clear @pressEnter="onSearch" />
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

    <!-- Login Log Table -->
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
          <template v-if="column.key === 'status'">
            <a-tag :color="record.success ? 'green' : 'red'">
              {{ record.success ? '成功' : '失败' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'ip'">
            <span style="font-family:monospace;font-size:12px;color:#6B7280;">{{ record.ip }}</span>
          </template>
          <template v-if="column.key === 'device'">
            <span style="font-size:12px;color:#4B5563;">{{ record.device }}</span>
          </template>
          <template v-if="column.key === 'location'">
            <span style="font-size:12px;color:#6B7280;">{{ record.location }}</span>
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
const filterStatus = ref('')
const keyword = ref('')

const userList = ['陈明', '张伟', '王强', '孙磊', '吴昊', '李娜', '周婷']
const actionTypes = ['登录', '登出', '新增', '编辑', '删除', '提交', '审批', '导入', '导出', '系统设置']

const columns = [
  { title: '时间', key: 'time', dataIndex: 'time', width: 160 },
  { title: '用户', key: 'user', width: 140 },
  { title: '登录状态', key: 'status', width: 90 },
  { title: '登录方式', key: 'loginType', width: 100 },
  { title: '设备', key: 'device', width: 140 },
  { title: 'IP地址', key: 'ip', width: 130 },
  { title: '登录地点', key: 'location', width: 120 },
  { title: '详情', key: 'detail' }
]

const logs = ref([
  { id: 1, time: '2026-04-30 14:32:15', user: '张伟', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.1.105', location: '苏州', detail: '正常登录' },
  { id: 2, time: '2026-04-30 14:28:03', user: '王强', success: true, loginType: '密码登录', device: 'Firefox/Win11', ip: '10.0.1.108', location: '上海', detail: '正常登录' },
  { id: 3, time: '2026-04-30 13:45:22', user: '李娜', success: true, loginType: '密码登录', device: 'Safari/MacOS', ip: '10.0.2.201', location: '北京', detail: '正常登录' },
  { id: 4, time: '2026-04-30 11:20:10', user: '陈明', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.3.1', location: '苏州', detail: '正常登录' },
  { id: 5, time: '2026-04-30 10:15:44', user: '吴昊', success: false, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.1.104', location: '杭州', detail: '密码错误' },
  { id: 6, time: '2026-04-30 09:30:18', user: '孙磊', success: true, loginType: '密码登录', device: 'Edge/Win10', ip: '10.0.1.107', location: '无锡', detail: '正常登录' },
  { id: 7, time: '2026-04-29 17:45:33', user: '周婷', success: true, loginType: '密码登录', device: 'Chrome/Win11', ip: '10.0.2.202', location: '南京', detail: '正常登录' },
  { id: 8, time: '2026-04-29 16:22:07', user: '张伟', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.1.105', location: '苏州', detail: '正常退出' },
  { id: 9, time: '2026-04-29 16:20:55', user: '张伟', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.1.105', location: '苏州', detail: '正常登录' },
  { id: 10, time: '2026-04-29 14:10:02', user: '陈明', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.3.1', location: '苏州', detail: '正常登录' },
  { id: 11, time: '2026-04-29 11:05:19', user: '王强', success: false, loginType: '密码登录', device: 'Firefox/Win11', ip: '10.0.1.108', location: '上海', detail: '账号锁定' },
  { id: 12, time: '2026-04-28 16:33:45', user: '李娜', success: true, loginType: '密码登录', device: 'Safari/MacOS', ip: '10.0.2.201', location: '北京', detail: '正常登录' },
  { id: 13, time: '2026-04-28 10:08:30', user: '陈明', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.3.1', location: '苏州', detail: '正常退出' },
  { id: 14, time: '2026-04-27 15:20:11', user: '吴昊', success: true, loginType: '密码登录', device: 'Chrome/Win10', ip: '10.0.1.104', location: '杭州', detail: '正常登录' },
  { id: 15, time: '2026-04-27 09:15:42', user: '孙磊', success: false, loginType: '密码登录', device: 'Edge/Win10', ip: '10.0.1.107', location: '无锡', detail: '密码错误' }
])

const filteredLogs = computed(() => {
  let list = logs.value
  if (filterUser.value) list = list.filter(x => x.user === filterUser.value)
  if (filterStatus.value) {
    const isSuccess = filterStatus.value === 'success'
    list = list.filter(x => x.success === isSuccess)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(x => 
      x.ip.toLowerCase().includes(kw) || 
      x.detail.toLowerCase().includes(kw) ||
      x.location.toLowerCase().includes(kw)
    )
  }
  return list
})

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const onSearch = () => {}
const resetFilters = () => { dateRange.value = null; filterUser.value = ''; filterStatus.value = ''; keyword.value = '' }
const exportData = () => message.info('导出登录日志（演示）')
</script>

<style scoped>
.loginlog-page { }
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 4px 0; }
.filter-item { display: flex; flex-direction: column; gap: 3px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.user-cell { display: flex; align-items: center; gap: 8px; }
</style>
