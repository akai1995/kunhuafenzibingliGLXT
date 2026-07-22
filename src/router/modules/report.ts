import { AppRouteRecord } from '@/types/router'

export const reportRoutes: AppRouteRecord = {
  path: '/report',
  name: 'Report',
  component: '/index/index',
  meta: {
    title: '报告中心',
    icon: 'ri:file-text-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'writing',
      name: 'ReportWriting',
      component: '/report/writing',
      meta: { title: '报告书写', icon: 'ri:edit-line', keepAlive: true }
    },
    {
      path: 'upload',
      name: 'ReportUpload',
      component: '/report/upload',
      meta: { title: '报告上传', icon: 'ri:upload-2-line', keepAlive: true }
    },
    {
      path: 'audit',
      name: 'ReportAudit',
      component: '/report/audit',
      meta: { title: '报告审核', icon: 'ri:checkbox-circle-line', keepAlive: true }
    },
    {
      path: 'print',
      name: 'ReportPrint',
      component: '/report/print',
      meta: { title: '报告打印', icon: 'ri:printer-line', keepAlive: true }
    },
    {
      path: 'template',
      name: 'ReportTemplate',
      component: '/report/template',
      meta: { title: '报告模板', icon: 'ri:folder-line', keepAlive: true }
    },
    {
      path: 'gene-interpretation',
      name: 'GeneInterpretation',
      component: '/report/gene-interpretation',
      meta: { title: '基因检测结果解释', icon: 'ri:dna-line', keepAlive: true }
    }
  ]
}
