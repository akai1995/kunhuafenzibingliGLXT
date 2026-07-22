import { AppRouteRecord } from '@/types/router'

export const sampleRoutes: AppRouteRecord = {
  path: '/sample',
  name: 'Sample',
  component: '/index/index',
  meta: {
    title: '样本管理',
    icon: 'ri:test-tube-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'register',
      name: 'SampleRegister',
      component: '/sample/register',
      meta: {
        title: '样本入库',
        icon: 'ri:inbox-archive-line',
        keepAlive: true
      }
    },
    {
      path: 'storage',
      name: 'SampleStorage',
      component: '/sample/storage',
      meta: {
        title: '存储设备管理',
        icon: 'ri:fridge-line',
        keepAlive: true
      }
    },
    {
      path: 'storage/detail/:id',
      name: 'StorageDeviceDetail',
      component: '/sample/storage/detail',
      meta: {
        title: '设备详情',
        icon: 'ri:fridge-line',
        isHide: true,
        isHideTab: true,
        activeMenu: '/sample/storage'
      }
    }
  ]
}
