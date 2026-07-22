import { AppRouteRecord } from '@/types/router'

export const knowledgeRoutes: AppRouteRecord = {
  path: '/knowledge',
  name: 'Knowledge',
  component: '/index/index',
  meta: {
    title: '知识库',
    icon: 'ri:book-open-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'share',
      name: 'KnowledgeShare',
      component: '/knowledge/share/index',
      meta: {
        title: '文件管理',
        icon: 'ri:file-text-line',
        keepAlive: true
      }
    },
    {
      path: 'permission',
      name: 'KnowledgePermission',
      component: '/knowledge/permission/index',
      meta: {
        title: '权限管理',
        icon: 'ri:lock-line',
        keepAlive: true
      }
    }
  ]
}