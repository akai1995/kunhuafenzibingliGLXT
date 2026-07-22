import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { analysisRoutes } from './analysis'
import { knowledgeRoutes } from './knowledge'
import { receptionRoutes } from './reception'
import { sampleRoutes } from './sample'
import { qualityRoutes } from './quality'
import { reportRoutes } from './report'
import { reagentRoutes } from './reagent'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { settingsRoutes } from './settings'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  receptionRoutes,
  sampleRoutes,
  qualityRoutes,
  reportRoutes,
  reagentRoutes,
  knowledgeRoutes,
  analysisRoutes,
  resultRoutes,
  settingsRoutes,
  exceptionRoutes
]
