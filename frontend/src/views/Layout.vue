<template>
  <a-layout class="app-layout">
    <!-- Sider -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="240"
      :collapsed-width="64"
      class="app-sider"
    >
      <!-- Logo -->
      <div class="sider-header">
        <img
          class="sider-logo-img"
          src="https://www.home.sandvik/logo/logo_dark.svg"
          alt="Sandvik"
          @error="e => e.target.style.display='none'"
        >
        <div v-if="!collapsed" class="sider-logo-text">
          <div>Sandvik</div>
          <div class="sider-logo-sub">China Division</div>
        </div>
      </div>

      <!-- Menu -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="light"
        class="sider-menu"
      >
        <!-- Group 1: 销售预测管理 -->
        <a-menu-item-group key="g1" :title="'📊 销售预测管理'">
          <a-menu-item key="dashboard" @click="navigate('/dashboard')">
            <template #icon><DashboardOutlined /></template>
            <span>Dashboard</span>
          </a-menu-item>
          <a-sub-menu key="forecast-sub">
            <template #icon><FormOutlined /></template>
            <span slot="title">销售预测</span>
            <a-menu-item key="forecast" @click="navigate('/forecast')">销售预测填报</a-menu-item>
            <a-menu-item key="approval" @click="navigate('/approval')">销售预测审核</a-menu-item>
          </a-sub-menu>
        </a-menu-item-group>

        <!-- Group 2: 基础数据管理 -->
        <a-menu-item-group key="g2" :title="'🗂 基础数据管理'">
          <a-menu-item key="basedata" @click="navigate('/basedata')">
            <template #icon><DatabaseOutlined /></template>
            <span>基础数据管理</span>
          </a-menu-item>
        </a-menu-item-group>

        <!-- Group 3: 系统管理 -->
        <a-menu-item-group key="g3" :title="'⚙️ 系统管理'">
          <a-menu-item key="users" @click="navigate('/users')">
            <template #icon><UserOutlined /></template>
            <span>用户账号管理</span>
          </a-menu-item>
          <a-menu-item key="permissions" @click="navigate('/permissions')">
            <template #icon><SafetyOutlined /></template>
            <span>角色和权限管理</span>
          </a-menu-item>
          <a-menu-item key="fc-version" @click="navigate('/fc-version')">
            <template #icon><CalendarOutlined /></template>
            <span>预测周期管理</span>
          </a-menu-item>
          <a-menu-item key="system-log" @click="navigate('/system-log')">
            <template #icon><FileTextOutlined /></template>
            <span>系统操作日志</span>
          </a-menu-item>
          <a-menu-item key="approval-flow" @click="navigate('/approval-flow')">
            <template #icon><SettingOutlined /></template>
            <span>审批流程配置</span>
          </a-menu-item>
        </a-menu-item-group>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- Header -->
      <a-layout-header class="app-header">
        <div class="header-left">
          <menu-unfold-outlined v-if="collapsed" class="trigger" @click="toggleCollapsed" />
          <menu-fold-outlined v-else class="trigger" @click="toggleCollapsed" />
          <span class="header-title">{{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <a-badge :count="3" :offset="[-2, 2]">
            <BellOutlined class="header-icon-btn" />
          </a-badge>
          <a-dropdown>
            <div class="header-user">
              <a-avatar :size="28" class="header-user-avatar">
                {{ user?.avatar || 'U' }}
              </a-avatar>
              <span class="header-user-name">{{ user?.name || 'User' }}</span>
              <down-outlined style="font-size: 10px; color: #d9d9d9;" />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined /> 个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../store/auth'
import { logout } from '../api/auth'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  FormOutlined,
  DatabaseOutlined,
  UserOutlined,
  SafetyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  DownOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const selectedKeys = ref(['dashboard'])
const openKeys = ref(['g1'])

const user = computed(() => authStore.user)

const routeTitleMap = {
  '/dashboard': 'Dashboard',
  '/forecast': '销售预测填报',
  '/approval': '销售预测审核',
  '/basedata': '基础数据管理',
  '/users': '用户账号管理',
  '/permissions': '角色和权限管理',
  '/fc-version': '预测周期管理',
  '/system-log': '系统操作日志',
  '/approval-flow': '审批流程配置'
}

const currentTitle = computed(() => routeTitleMap[route.path] || 'Sandvik China Division')

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

const navigate = (path) => {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await logout()
  } catch {
    // Ignore errors
  }
  authStore.clearAuth()
  message.success('已退出登录')
  router.push('/login')
}

// Sync selected menu with route
watch(
  () => route.path,
  (path) => {
    const key = path.replace('/', '')
    if (key) {
      selectedKeys.value = [key]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-sider {
  background: #fff !important;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

.sider-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #0D3D92;
  gap: 10px;
}

.sider-logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.sider-logo-text {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.sider-logo-sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
}

.sider-menu {
  height: calc(100vh - 60px);
  border-inline-end: none !important;
}

.app-header {
  background: #fff !important;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #E5E7EB;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  color: #6B7280;
}

.trigger:hover {
  color: #0D3D92;
}

.header-title {
  font-size: 15px;
  font-weight: 500;
  color: #1F2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-btn {
  font-size: 18px;
  color: #6B7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s;
}

.header-icon-btn:hover {
  color: #0D3D92;
  background: rgba(13, 61, 146, 0.06);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.header-user:hover {
  background: rgba(0, 0, 0, 0.04);
}

.header-user-avatar {
  background: #0D3D92;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.header-user-name {
  font-size: 13px;
  color: #1F2937;
}

.app-content {
  margin: 0;
  padding: 24px;
  background: #F5F7FA;
  min-height: calc(100vh - 60px);
}
</style>
