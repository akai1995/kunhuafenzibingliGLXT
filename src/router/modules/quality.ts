import { AppRouteRecord } from '@/types/router'

export const qualityRoutes: AppRouteRecord = {
  path: '/quality',
  name: 'Quality',
  component: '/index/index',
  meta: {
    title: '质控管理',
    icon: 'ri:shield-check-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'sample-qc',
      name: 'SampleQcGroup',
      meta: {
        title: '样本质控',
        icon: 'ri:shield-check-line',
        roles: ['R_SUPER', 'R_ADMIN']
      },
      children: [
        {
          path: 'pathology',
          name: 'PathologyQcCheck',
          component: '/quality/pathology-qc',
          meta: {
            title: '病理/组织质控',
            icon: 'ri:microscope-line',
            keepAlive: true
          }
        },
        {
          path: 'blood',
          name: 'BloodQcCheck',
          component: '/quality/blood-qc',
          meta: {
            title: '血液样本质控',
            icon: 'ri:water-flash-line',
            keepAlive: true
          }
        },
        {
          path: 'tissue',
          name: 'TissueQcCheck',
          component: '/quality/tissue-qc',
          meta: {
            title: '新鲜组织样本质控',
            icon: 'ri:leaf-line',
            keepAlive: true
          }
        },
        {
          path: 'thyroid',
          name: 'ThyroidQcCheck',
          component: '/quality/thyroid-qc',
          meta: {
            title: '甲状腺穿刺液质控',
            icon: 'ri:drop-line',
            keepAlive: true
          }
        }
      ]
    },
    {
      path: 'platform-qc',
      name: 'PlatformQc',
      meta: {
        title: '流程质控',
        icon: 'ri:computer-line',
        roles: ['R_SUPER', 'R_ADMIN']
      },
      children: [
        {
          path: 'ngs',
          name: 'NgsQc',
          meta: {
            title: 'NGS质控',
            icon: 'ri:dna-line',
            roles: ['R_SUPER', 'R_ADMIN']
          },
          children: [
            {
              path: 'ngsr',
              name: 'NgsrQc',
              component: '/quality/platform-qc',
              meta: {
                title: 'NGSR质控',
                icon: 'ri:file-list-3-line',
                keepAlive: true
              }
            },
            {
              path: 'ngsa',
              name: 'NgsaQc',
              component: '/quality/platform-qc',
              meta: {
                title: 'NGSA质控',
                icon: 'ri:file-list-2-line',
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'pcr',
          name: 'PcrQc',
          meta: {
            title: 'PCR质控',
            icon: 'ri:test-tube-line',
            roles: ['R_SUPER', 'R_ADMIN']
          },
          children: [
            {
              path: 'pcr10',
              name: 'Pcr10Qc',
              component: '/quality/platform-qc',
              meta: {
                title: 'PCR10基因质控',
                icon: 'ri:file-list-3-line',
                keepAlive: true
              }
            },
            {
              path: 'pcr11',
              name: 'Pcr11Qc',
              component: '/quality/platform-qc',
              meta: {
                title: 'PCR11基因质控',
                icon: 'ri:file-list-2-line',
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'fish',
          name: 'FishQc',
          component: '/quality/platform-qc',
          meta: {
            title: 'FISH质控',
            icon: 'ri:eye-line',
            keepAlive: true
          }
        },
        {
          path: 'sanger',
          name: 'SangerQc',
          component: '/quality/platform-qc',
          meta: {
            title: '一代测序质控',
            icon: 'ri:dna-line',
            keepAlive: true
          }
        },
        {
          path: 'cd348',
          name: 'Cd348Qc',
          component: '/quality/platform-qc',
          meta: {
            title: 'CD348质控',
            icon: 'ri:test-tube-line',
            keepAlive: true
          }
        },
        {
          path: 'e6e7',
          name: 'E6e7Qc',
          component: '/quality/platform-qc',
          meta: {
            title: 'E6E7质控',
            icon: 'ri:microscope-line',
            keepAlive: true
          }
        }
      ]
    },
    {
      path: 'na-extraction',
      name: 'NaExtraction',
      meta: {
        title: '核酸提取',
        icon: 'ri:test-tube-line',
        roles: ['R_SUPER', 'R_ADMIN']
      },
      children: [
        {
          path: 'dna',
          name: 'DnaQc',
          component: '/quality/na-extraction',
          meta: {
            title: 'DNA',
            icon: 'ri:dna-line',
            keepAlive: true
          }
        },
        {
          path: 'rna',
          name: 'RnaQc',
          component: '/quality/na-extraction',
          meta: {
            title: 'RNA',
            icon: 'ri:file-list-2-line',
            keepAlive: true
          }
        },
        {
          path: 'batch',
          name: 'NaBatchQc',
          component: '/quality/na-extraction',
          meta: {
            title: '核酸提取批次',
            icon: 'ri:file-list-3-line',
            keepAlive: true
          }
        }
      ]
    },
    {
      path: 'rule',
      name: 'QcRule',
      component: '/quality/rule',
      meta: {
        title: '质控化模板',
        icon: 'ri:file-list-3-line',
        keepAlive: true
      }
    }
  ]
}