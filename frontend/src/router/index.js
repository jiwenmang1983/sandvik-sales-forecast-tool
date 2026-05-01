import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// Lazy load views
const Login = () => import('../views/Login.vue')
const Layout = () => import('../views/Layout.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Forecast = () => import('../views/Forecast.vue')
const Approval = () => import('../views/Approval.vue')
const BaseData = () => import('../views/BaseData.vue')
const Users = () => import('../views/Users.vue')
const Permissions = () => import('../views/Permissions.vue')
const SystemLog = () => import('../views/SystemLog.vue')
const ApprovalFlow = () => import('../views/ApprovalFlow.vue')
const FcVersion = () => import('../views/FcVersion.vue')
const Home = () => import('../views/Home.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard', icon: 'dashboard' }
      },
      {
        path: 'forecast',
        name: 'Forecast',
        component: Forecast,
        meta: { title: '销售预测填报', icon: 'form' }
      },
      {
        path: 'approval',
        name: 'Approval',
        component: Approval,
        meta: { title: '销售预测审核', icon: 'check-circle' }
      },
      {
        path: 'basedata',
        name: 'BaseData',
        component: BaseData,
        meta: { title: '基础数据管理', icon: 'database' }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: '用户账号管理', icon: 'user' }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: Permissions,
        meta: { title: '角色和权限管理', icon: 'safety' }
      },
      {
        path: 'system-log',
        name: 'SystemLog',
        component: SystemLog,
        meta: { title: '系统操作日志', icon: 'file-text' }
      },
      {
        path: 'approval-flow',
        name: 'ApprovalFlow',
        component: ApprovalFlow,
        meta: { title: '审批流程配置', icon: 'setting' }
      },
      {
        path: 'fc-version',
        name: 'FcVersion',
        component: FcVersion,
        meta: { title: '预测周期管理', icon: 'calendar' }
      }
    ]
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
