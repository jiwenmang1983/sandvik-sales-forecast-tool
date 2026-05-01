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
const LoginLog = () => import('../views/LoginLog.vue')
const Org = () => import('../views/OrgChart.vue')
const Customers = () => import('../views/BaseData.vue')
const Products = () => import('../views/BaseData.vue')
const DataDict = () => import('../views/BaseData.vue')
const Analysis = () => import('../views/Dashboard.vue')
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
        meta: { title: '销售填报预测填报', icon: 'form' }
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
      },
      {
        path: 'login-log',
        name: 'LoginLog',
        component: LoginLog,
        meta: { title: '系统登录日志', icon: 'login' }
      },
      {
        path: 'org',
        name: 'Org',
        component: Org,
        meta: { title: '组织架构', icon: 'apartment' }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: Customers,
        meta: { title: '客户信息', icon: 'team' }
      },
      {
        path: 'products',
        name: 'Products',
        component: Products,
        meta: { title: '产品库', icon: 'appstore' }
      },
      {
        path: 'datadict',
        name: 'DataDict',
        component: DataDict,
        meta: { title: '数据字典', icon: 'book' }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: Analysis,
        meta: { title: '分析报表', icon: 'bar-chart' }
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
