import { AppRouteRecord } from '@/types/router'

export const analysisRoutes: AppRouteRecord = {
  name: 'Analysis',
  path: '/analysis',
  component: '/analysis/index',
  meta: {
    title: '数据统计',
    icon: 'ri:bar-chart-2-line',
    keepAlive: false,
    roles: ['R_SUPER', 'R_ADMIN']
  }
}