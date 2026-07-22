import { AppRouteRecord } from '@/types/router'

export const reagentRoutes: AppRouteRecord = {
  path: '/reagent',
  name: 'Reagent',
  component: '/index/index',
  meta: {
    title: '试剂耗材管理',
    icon: 'ri:flask-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'stock-in',
      name: 'ReagentStockIn',
      component: '/reagent/stock-in/index',
      meta: {
        title: '入库管理',
        icon: 'ri:inbox-line',
        keepAlive: true
      }
    },
    {
      path: 'inventory',
      name: 'ReagentInventory',
      component: '/reagent/inventory/index',
      meta: {
        title: '库存查询',
        icon: 'ri:search-line',
        keepAlive: true
      }
    },
    {
      path: 'requisition',
      name: 'ReagentRequisition',
      component: '/reagent/requisition/index',
      meta: {
        title: '出库管理',
        icon: 'ri:hand-heart-line',
        keepAlive: true
      }
    },
    {
      path: 'warning',
      name: 'ReagentWarning',
      component: '/reagent/warning/index',
      meta: {
        title: '库存预警',
        icon: 'ri:alarm-warning-line',
        keepAlive: true
      }
    }
  ]
}
