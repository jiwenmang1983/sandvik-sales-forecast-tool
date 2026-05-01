import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: () => {
      const hasToken = !!localStorage.getItem('token')
      return hasToken ? '/dashboard' : '/login'
    },
    meta: { requiresAuth: false },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
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
