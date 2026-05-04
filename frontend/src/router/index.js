import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import MicrosoftCallback from '../views/MicrosoftCallback.vue'
import Dashboard from '../views/Dashboard.vue'
import Layout from '../views/Layout.vue'
import Forecast from '../views/Forecast.vue'
import Approval from '../views/Approval.vue'
import OrgChart from '../views/OrgChart.vue'
import BaseData from '../views/BaseData.vue'
import Users from '../views/Users.vue'
import Permissions from '../views/Permissions.vue'
import FcVersion from '../views/FcVersion.vue'
import SystemLog from '../views/SystemLog.vue'
import LoginLog from '../views/LoginLog.vue'
import ApprovalFlow from '../views/ApprovalFlow.vue'
import TemplateManagement from '../views/TemplateManagement.vue'
import ForecastPeriod from '../views/ForecastPeriod.vue'
import EmailQueue from '../views/EmailQueue.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: () => {
      const hasToken = !!localStorage.getItem('token')
      return hasToken ? '/dashboard' : '/login'
    },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'forecast', name: 'Forecast', component: Forecast },
      { path: 'approval', name: 'Approval', component: Approval },
      { path: 'analysis', name: 'Analysis', component: Dashboard },
      { path: 'org', name: 'Org', component: OrgChart },
      {
        path: 'customers',
        name: 'Customers',
        component: BaseData,
        meta: { baseDataTab: 'customer' }
      },
      {
        path: 'products',
        name: 'Products',
        component: BaseData,
        meta: { baseDataTab: 'productLibrary' }
      },
      {
        path: 'datadict',
        name: 'DataDict',
        component: BaseData,
        meta: { baseDataTab: 'regionMapping' }
      },
      { path: 'users', name: 'Users', component: Users },
      { path: 'permissions', name: 'Permissions', component: Permissions },
      { path: 'fc-version', name: 'FcVersion', component: ForecastPeriod },
      { path: 'login-log', name: 'LoginLog', component: LoginLog },
      { path: 'system-log', name: 'SystemLog', component: SystemLog },
      { path: 'approval-flow', name: 'ApprovalFlow', component: ApprovalFlow },
      { path: 'template-management', name: 'TemplateManagement', component: TemplateManagement },
      { path: 'forecast-periods', name: 'ForecastPeriod', component: ForecastPeriod },
      { path: 'email-queue', name: 'EmailQueue', component: EmailQueue }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/microsoft-callback',
    name: 'MicrosoftCallback',
    component: MicrosoftCallback,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const hasToken = !!localStorage.getItem('token')
  if (to.path === '/login') {
    if (hasToken) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }
  if (to.meta.requiresAuth !== false && !hasToken) {
    next('/login')
  } else {
    next()
  }
})

export default router
