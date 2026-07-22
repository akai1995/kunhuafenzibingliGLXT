import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  name: 'DashboardHome',
  path: '/dashboard',
  component: '/dashboard/home',
  meta: {
    title: '首页',
    icon: 'ri:home-smile-2-line',
    keepAlive: false,
    fixedTab: true,
    roles: ['R_SUPER', 'R_ADMIN']
  }
}
