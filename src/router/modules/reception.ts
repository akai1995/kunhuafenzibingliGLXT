import { AppRouteRecord } from '@/types/router'

export const receptionRoutes: AppRouteRecord = {
  path: '/reception',
  name: 'Reception',
  component: '/index/index',
  meta: {
    title: '接诊管理',
    icon: 'ri:file-list-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'order-manage',
      name: 'OrderManage',
      component: '/reception/order-manage',
      meta: {
        title: '接诊单管理',
        icon: 'ri:file-edit-line',
        keepAlive: true
      }
    },
    {
      path: 'price',
      name: 'PriceMaintain',
      component: '/reception/price',
      meta: {
        title: '项目价格维护',
        icon: 'ri:price-tag-3-line',
        keepAlive: true
      }
    },
    {
      path: 'config',
      name: 'ConfigManage',
      component: '/reception/config',
      meta: {
        title: '配置管理',
        icon: 'ri:settings-3-line',
        keepAlive: true
      }
    },
    {
      path: 'external-sample',
      name: 'ExternalSample',
      component: '/reception/external-sample',
      meta: {
        title: '样本接收',
        icon: 'ri:exchange-line',
        keepAlive: true
      }
    }
  ]
}
