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

      <!-- Flat Menu Navigation -->
      <div class="sider-menu-wrapper">
        <!-- Group 1: 销售预测管理 -->
        <div class="menu-group">
          <div class="menu-group-label" v-if="!collapsed">
            <span class="menu-group-icon">📊</span>
            <span>销售预测管理</span>
          </div>
          <div class="menu-group-divider" v-if="collapsed"></div>
          
          <div class="menu-items">
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('dashboard') }"
              @click="navigate('/dashboard')"
            >
              <DashboardOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">Dashboard</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('forecast') }"
              @click="navigate('/forecast')"
            >
              <FormOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">销售填报预测填报</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('approval') }"
              @click="navigate('/approval')"
            >
              <CheckCircleOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">销售预测审核</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('analysis') }"
              @click="navigate('/analysis')"
            >
              <BarChartOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">分析报表</span>
            </div>
          </div>
        </div>

        <!-- Group 2: 基础数据管理 -->
        <div class="menu-group">
          <div class="menu-group-label" v-if="!collapsed">
            <span class="menu-group-icon">🗂</span>
            <span>基础数据管理</span>
          </div>
          <div class="menu-group-divider" v-if="collapsed"></div>
          
          <div class="menu-items">
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('org') }"
              @click="navigate('/org')"
            >
              <ApartmentOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">组织架构</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('customers') }"
              @click="navigate('/customers')"
            >
              <TeamOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">客户信息</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('products') }"
              @click="navigate('/products')"
            >
              <AppstoreOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">产品库</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('datadict') }"
              @click="navigate('/datadict')"
            >
              <BookOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">数据字典</span>
            </div>
          </div>
        </div>

        <!-- Group 3: 系统管理 -->
        <div class="menu-group">
          <div class="menu-group-label" v-if="!collapsed">
            <span class="menu-group-icon">⚙️</span>
            <span>系统管理</span>
          </div>
          <div class="menu-group-divider" v-if="collapsed"></div>
          
          <div class="menu-items">
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('users') }"
              @click="navigate('/users')"
            >
              <UserOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">用户账号管理</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('permissions') }"
              @click="navigate('/permissions')"
            >
              <SafetyOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">角色和权限管理</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('fc-version') }"
              @click="navigate('/fc-version')"
            >
              <CalendarOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">预测周期管理</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('login-log') }"
              @click="navigate('/login-log')"
            >
              <LoginOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">系统登录日志</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('system-log') }"
              @click="navigate('/system-log')"
            >
              <FileTextOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">系统操作日志</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: selectedKeys.includes('approval-flow') }"
              @click="navigate('/approval-flow')"
            >
              <BranchesOutlined class="menu-icon" />
              <span class="menu-label" v-if="!collapsed">审批流程配置</span>
            </div>
          </div>
        </div>
      </div>
    </a-layout-sider>

    <a-layout>
      <!-- Header -->
      <a-layout-header class="app-header">
        <div class="header-left">
          <menu-unfold-outlined v-if="collapsed" class="trigger" @click="toggleCollapsed" />
          <menu-fold-outlined v-else class="trigger" @click="toggleCollapsed" />
          <a-breadcrumb class="header-breadcrumb">
            <a-breadcrumb-item>Sandvik China Division</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-badge :count="3" :offset="[-2, 2]">
            <bell-outlined class="header-icon-btn" />
          </a-badge>
          <a-dropdown>
            <div class="header-user">
              <a-avatar :size="28" class="header-user-avatar">
                {{ user?.avatar || 'A' }}
              </a-avatar>
              <span class="header-user-name">{{ user?.name || 'Admin' }}</span>
              <down-outlined style="font-size: 10px; color: #d9d9d9;" />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <user-outlined /> 个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined /> 退出登录
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
  CheckCircleOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BookOutlined,
  UserOutlined,
  SafetyOutlined,
  CalendarOutlined,
  LoginOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  BranchesOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const selectedKeys = ref(['dashboard'])

const user = computed(() => authStore.user)

const routeTitleMap = {
  '/dashboard': 'Dashboard',
  '/forecast': '销售填报预测填报',
  '/approval': '销售预测审核',
  '/analysis': '分析报表',
  '/basedata': '基础数据管理',
  '/org': '组织架构',
  '/customers': '客户信息',
  '/products': '产品库',
  '/datadict': '数据字典',
  '/users': '用户账号管理',
  '/permissions': '角色和权限管理',
  '/fc-version': '预测周期管理',
  '/login-log': '系统登录日志',
  '/system-log': '系统操作日志',
  '/approval-flow': '审批流程配置'
}

const currentTitle = computed(() => routeTitleMap[route.path] || 'Dashboard')

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

const navigate = (path) => {
  router.push(path)
}

const handleLogout = async () => {
  console.log('Logout: Starting...')
  
  // Fire and forget the logout API call - we don't want to block navigation
  const logoutPromise = logout()
  
  // Clear auth state immediately
  console.log('Logout: Clearing auth state...')
  authStore.clearAuth()
  message.success('已退出登录')
  
  // Wait for logout API with timeout, but don't block navigation
  try {
    await Promise.race([
      logoutPromise,
      new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
    ])
    console.log('Logout: API call completed')
  } catch (error) {
    console.log('Logout: API call failed (ignoring):', error.message)
  }
  
  // Always redirect to login, regardless of API result
  console.log('Logout: Redirecting to /login...')
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

/* Flat Menu Styles */
.sider-menu-wrapper {
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 12px 0;
}

.menu-group {
  margin-bottom: 8px;
}

.menu-group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-group-icon {
  font-size: 12px;
}

.menu-group-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 8px 12px;
}

.menu-items {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #4B5563;
  font-size: 14px;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(13, 61, 146, 0.06);
  color: #0D3D92;
}

.menu-item.active {
  background: rgba(13, 61, 146, 0.08);
  color: #0D3D92;
  border-left-color: #0D3D92;
  font-weight: 500;
}

.menu-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Collapsed state adjustments */
.app-sider :deep(.ant-layout-sider-collapsed) .menu-group-label {
  display: none;
}

.app-sider :deep(.ant-layout-sider-collapsed) .menu-item {
  justify-content: center;
  padding: 10px;
  margin: 2px 6px;
}

.app-sider :deep(.ant-layout-sider-collapsed) .menu-group-divider {
  margin: 8px 6px;
}

/* Header */
.app-header {
  background: #fff !important;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #E5E7EB;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  color: #6B7280;
}

.trigger:hover {
  color: #0D3D92;
}

.header-breadcrumb {
  font-size: 14px;
}

:deep(.ant-breadcrumb-link) {
  color: #6B7280;
}

:deep(.ant-breadcrumb li:last-child .ant-breadcrumb-link) {
  color: #1F2937;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-btn {
  font-size: 18px;
  color: #6B7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
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
  padding: 20px 24px;
  background: #F5F7FA;
  min-height: calc(100vh - 60px);
}
</style>
