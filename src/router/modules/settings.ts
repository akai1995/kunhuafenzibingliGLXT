import { AppRouteRecord } from '@/types/router'

export const settingsRoutes: AppRouteRecord = {
  path: '/settings',
  name: 'Settings',
  component: '/index/index',
  meta: {
    title: '系统设置',
    icon: 'ri:settings-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'log',
      name: 'OperationLog',
      component: '/sample/log',
      meta: {
        title: '操作日志',
        icon: 'ri:file-list-3-line',
        keepAlive: true
      }
    },
    {
      path: 'role',
      name: 'SettingsRole',
      component: '/system/role/index',
      meta: {
        title: '角色管理',
        icon: 'ri:user-settings-line',
        keepAlive: true
      }
    }
  ]
}