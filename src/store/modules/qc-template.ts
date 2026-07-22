/**
 * 质控化模板 Store
 * 管理平台→项目→质控分类→字段的层级数据，供质控化模板页面和流程质控页面共享
 */
import { defineStore } from 'pinia'

// ===== 类型定义 =====
export type NodeType = 'platform' | 'project'

export interface ThresholdRule {
  op: string   // 大于(>), 等于(=), 小于(<)
  val: string  // 阈值数值
}

export interface ThresholdConfig {
  rules: ThresholdRule[]
}

export interface QcField {
  id: number
  fieldName: string
  fieldType: string
  required: boolean
  threshold: string
  defaultValue: string
  remark: string
  ruleDescription: string
}

// ===== 阈值工具函数 =====
export const parseThreshold = (threshold: string): ThresholdConfig | null => {
  if (!threshold) return null
  try {
    const parsed = JSON.parse(threshold)
    if (parsed && parsed.rules && Array.isArray(parsed.rules)) {
      return { rules: parsed.rules }
    }
  } catch { /* ignore */ }
  return null
}

export const formatThreshold = (config: ThresholdConfig | null): string => {
  if (!config || !config.rules.length) return ''
  return JSON.stringify(config)
}

// 数学符号映射
const opSymbol: Record<string, string> = { '>': '>', '<': '<', '=': '=' }

export const getThresholdRule = (threshold: string): string => {
  const config = parseThreshold(threshold)
  if (!config || !config.rules.length) return ''
  const rules = config.rules
  // 单个规则
  if (rules.length === 1) {
    return `${opSymbol[rules[0].op]}${rules[0].val}`
  }
  // 两个规则
  if (rules.length === 2) {
    const ops = rules.map((r) => r.op).sort().join('')
    if (ops === '=<') return `≤${rules.find((r) => r.op === '<')!.val}`
    if (ops === '=>') return `≥${rules.find((r) => r.op === '>')!.val}`
    if (ops === '<>') {
      // 大于+小于，两个值可能不同
      const lt = rules.find((r) => r.op === '<')
      const gt = rules.find((r) => r.op === '>')
      if (lt && gt && lt.val === gt.val) return `≠${lt.val}`
      return `${gt ? `>${gt.val}` : ''}${lt ? ` <${lt.val}` : ''}`
    }
  }
  // 三个规则
  if (rules.length === 3) {
    return `≠${rules[0].val}`
  }
  return rules.map((r) => `${opSymbol[r.op]}${r.val}`).join(' ')
}

export const checkThreshold = (threshold: string, value: string | number): boolean => {
  const config = parseThreshold(threshold)
  if (!config || !config.rules.length) return true
  const numVal = Number(value)
  if (isNaN(numVal)) return true
  // 所有规则都必须满足
  return config.rules.every((rule) => {
    const numThreshold = Number(rule.val)
    if (isNaN(numThreshold)) return true
    switch (rule.op) {
      case '>': return numVal > numThreshold
      case '<': return numVal < numThreshold
      case '=': return numVal === numThreshold
      default: return true
    }
  })
}

export interface QcCategory {
  id: string
  name: string
  fields: QcField[]
}

export interface TreeNode {
  id: string
  label: string
  type: NodeType
  children?: TreeNode[]
  qcCategories?: QcCategory[]
}

let idCounter = 100
const genId = (prefix: string) => `${prefix}-${++idCounter}`

export const resetIdCounter = () => { idCounter = 100 }

// 默认QC分类列表（根据平台类型不同）
const getDefaultQcCategories = (platform: string): QcCategory[] => {
  const categories: QcCategory[] = []
  if (platform === 'NGS' || platform === 'NGSR' || platform === 'NGSA') {
    categories.push(
      { id: genId('cat'), name: '核酸质控', fields: [] },
      { id: genId('cat'), name: '终文库质控', fields: [] },
      { id: genId('cat'), name: '上机质控', fields: [] },
      { id: genId('cat'), name: '生信审核', fields: [] }
    )
    if (platform === 'NGSR') {
      categories.splice(1, 0, { id: genId('cat'), name: '预文库质控', fields: [] })
    }
  } else if (platform === 'PCR' || platform === 'PCR10' || platform === 'PCR11') {
    categories.push(
      { id: genId('cat'), name: '核酸质控', fields: [] },
      { id: genId('cat'), name: '文库质控', fields: [] },
      { id: genId('cat'), name: '上机质控', fields: [] },
      { id: genId('cat'), name: '生信审核', fields: [] }
    )
  } else if (platform === 'FISH') {
    categories.push(
      { id: genId('cat'), name: '杂交质控', fields: [] },
      { id: genId('cat'), name: '上机质控', fields: [] },
      { id: genId('cat'), name: '生信审核', fields: [] }
    )
  }
  return categories
}

// 创建默认字段
const createDefaultFields = (catName: string, platform: string = ''): QcField[] => {
  let fieldId = 0
  const fields: QcField[] = []
  const addField = (name: string, type: string, required = true, threshold = '', defaultVal = '', remark = '', ruleDesc = '') => {
    fields.push({ id: ++fieldId, fieldName: name, fieldType: type, required, threshold, defaultValue: defaultVal, remark, ruleDescription: ruleDesc })
  }
  if (catName === '核酸质控') {
    const isPCR = platform.startsWith('PCR')
    if (isPCR) {
      addField('质控医生', '文本', true, '', '', '自动填充')
      addField('质控时间', '日期', true, '', '', '默认当前时间')
      addField('质控结果', '下拉选择', true, '', '合格', '合格/不合格')
      addField('DNA浓度(ng/μl)', '数字', true, '', '', '')
      addField('DNA 260/280', '数字', true, '', '', '')
      addField('DNA 260/230', '数字', true, '', '', '')
      addField('DNA体积(μl)', '数字', true, '', '', '')
      addField('DNA总量(ng)', '数字', true, '', '', '')
      addField('RNA浓度(ng/μl)', '数字', true, '', '', '')
      addField('RNA 260/280', '数字', true, '', '', '')
      addField('RNA 260/230', '数字', true, '', '', '')
      addField('RNA体积(μl)', '数字', true, '', '', '')
      addField('RNA总量(ng)', '数字', true, '', '', '')
    } else {
      addField('Qubit浓度(ng/vl)', '数字', true, '{"rules":[{"op":">","val":"10"}]}', '', '')
      addField('体积(vl)', '数字', true, '{"rules":[{"op":">","val":"10"}]}', '', '')
      addField('总量ng', '数字', true, '{"rules":[{"op":">","val":"100"}]}', '', '')
      addField('质控医生', '文本', true, '', '', '自动填充')
      addField('质控时间', '日期', true, '', '', '默认当前时间')
      addField('质控结果', '下拉选择', true, '', '合格', '合格/不合格')
    }
  } else if (catName === '预文库质控' || catName === '文库质控') {
    addField('Qubit浓度(ng/vl)', '数字', true, '{"rules":[{"op":">","val":"5"}]}', '', '')
    addField('体积(vl)', '数字', true, '{"rules":[{"op":">","val":"5"}]}', '', '')
    addField('总量ng', '数字', true, '{"rules":[{"op":">","val":"50"}]}', '', '')
    addField('质控医生', '文本', true, '', '', '自动填充')
    addField('质控时间', '日期', true, '', '', '默认当前时间')
    addField('质控结果', '下拉选择', true, '', '合格', '合格/不合格')
  } else if (catName === '终文库质控') {
    addField('Index_Set', '下拉选择', true, '', '', '')
    addField('Index_Well', '下拉选择', true, '', '', '')
    addField('Qubit浓度(ng/vl)', '数字', true, '', '', '')
    addField('片段', '文本', false, '', '', '')
    addField('片段大小', '下拉选择', false, '', '', '')
    addField('备注', '多行文本', false, '', '', '')
    addField('质控医生', '文本', true, '', '', '自动填充')
    addField('质控时间', '日期', true, '', '', '默认当前时间')
    addField('质控结果', '下拉选择', true, '', '合格', '合格/不合格')
  } else if (catName === '上机质控') {
    addField('上机批号', '下拉选择', true, '', '', '')
    addField('簇密度', '数字', true, '', '', '')
    addField('簇通过率', '数字', true, '', '', '')
    addField('Q30', '数字', true, '', '', '')
    addField('有效数据量', '数字', true, '', '', '')
    addField('备注', '多行文本', false, '', '', '')
    addField('质控医生', '文本', true, '', '', '自动填充')
    addField('质控时间', '日期', true, '', '', '默认当前时间')
    addField('质控结果', '下拉选择', true, '', '合格', '合格/不合格')
  } else if (catName === '生信审核') {
    addField('质控医生', '文本', true, '', '', '自动填充')
    addField('质控时间', '日期', true, '', '', '默认当前时间')
    addField('质控结果', '下拉选择', true, '', '合格', '合格/不合格')
  }
  return fields
}

const createDefaultTreeData = (): TreeNode[] => {
  resetIdCounter()
  return [
    {
      id: 'platform-ngs',
      label: 'NGS质控',
      type: 'platform' as NodeType,
      children: [
        {
          id: 'project-ngsr',
          label: 'NGSR质控',
          type: 'project' as NodeType,
          qcCategories: getDefaultQcCategories('NGSR').map((c) => ({ ...c, fields: createDefaultFields(c.name, 'NGSR') }))
        },
        {
          id: 'project-ngsa',
          label: 'NGSA质控',
          type: 'project' as NodeType,
          qcCategories: getDefaultQcCategories('NGSA').map((c) => ({ ...c, fields: createDefaultFields(c.name, 'NGSA') }))
        }
      ]
    },
    {
      id: 'platform-pcr',
      label: 'PCR质控',
      type: 'platform' as NodeType,
      children: [
        {
          id: 'project-pcr10',
          label: 'PCR10基因质控',
          type: 'project' as NodeType,
          qcCategories: getDefaultQcCategories('PCR10').map((c) => ({ ...c, fields: createDefaultFields(c.name, 'PCR10') }))
        },
        {
          id: 'project-pcr11',
          label: 'PCR11基因质控',
          type: 'project' as NodeType,
          qcCategories: getDefaultQcCategories('PCR11').map((c) => ({ ...c, fields: createDefaultFields(c.name, 'PCR11') }))
        }
      ]
    },
    {
      id: 'platform-fish',
      label: 'FISH质控',
      type: 'platform' as NodeType,
      children: [
        {
          id: 'project-fish',
          label: 'FISH质控',
          type: 'project' as NodeType,
          qcCategories: getDefaultQcCategories('FISH').map((c) => ({ ...c, fields: createDefaultFields(c.name, 'FISH') }))
        }
      ]
    }
  ]
}

// 工具函数：根据ID查找节点
const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 工具函数：从树中删除节点
const deleteNodeFromTree = (nodes: TreeNode[], id: string): boolean => {
  const idx = nodes.findIndex((n) => n.id === id)
  if (idx > -1) {
    nodes.splice(idx, 1)
    return true
  }
  for (const node of nodes) {
    if (node.children && deleteNodeFromTree(node.children, id)) return true
  }
  return false
}

export const useQcTemplateStore = defineStore('qc-template', () => {
  const treeData = ref<TreeNode[]>(createDefaultTreeData())

  // 重置为默认数据
  const resetToDefault = () => {
    treeData.value = createDefaultTreeData()
  }

  // 获取所有项目节点的扁平列表（用于查找项目所属平台）
  const getAllProjects = (): { project: TreeNode; platform: TreeNode }[] => {
    const result: { project: TreeNode; platform: TreeNode }[] = []
    for (const platform of treeData.value) {
      if (platform.children) {
        for (const project of platform.children) {
          result.push({ project, platform })
        }
      }
    }
    return result
  }

  // 根据项目ID获取QC分类和字段
  const getProjectById = (projectId: string): TreeNode | null => {
    return findNodeById(treeData.value, projectId)
  }

  // 根据项目ID获取平台ID
  const getPlatformIdByProjectId = (projectId: string): string | null => {
    for (const platform of treeData.value) {
      if (platform.children) {
        const found = platform.children.find((p) => p.id === projectId)
        if (found) return platform.id
      }
    }
    return null
  }

  // 获取指定项目某质控分类的字段列表
  const getFieldsByCategory = (projectId: string, categoryName: string): QcField[] => {
    const project = getProjectById(projectId)
    if (!project?.qcCategories) return []
    const category = project.qcCategories.find((c) => c.name === categoryName)
    return category?.fields || []
  }

  // 获取指定项目的所有质控分类
  const getCategoriesByProjectId = (projectId: string): QcCategory[] => {
    const project = getProjectById(projectId)
    return project?.qcCategories || []
  }

  // ===== 平台/项目 CRUD =====
  const addPlatform = (name: string): TreeNode => {
    const newNode: TreeNode = {
      id: genId('platform'),
      label: name,
      type: 'platform',
      children: []
    }
    treeData.value.push(newNode)
    return newNode
  }

  const addProject = (platformId: string, name: string): TreeNode | null => {
    const platform = findNodeById(treeData.value, platformId)
    if (!platform) return null
    if (!platform.children) platform.children = []
    const newNode: TreeNode = {
      id: genId('project'),
      label: name,
      type: 'project',
      qcCategories: getDefaultQcCategories(name).map((c) => ({ ...c, fields: createDefaultFields(c.name, name) }))
    }
    platform.children.push(newNode)
    return newNode
  }

  const updateNode = (nodeId: string, newLabel: string): boolean => {
    const node = findNodeById(treeData.value, nodeId)
    if (!node) return false
    node.label = newLabel
    return true
  }

  const deleteNode = (nodeId: string): boolean => {
    return deleteNodeFromTree(treeData.value, nodeId)
  }

  // ===== 质控分类 CRUD =====
  const addCategory = (projectId: string, categoryName: string): QcCategory | null => {
    const project = findNodeById(treeData.value, projectId)
    if (!project || !project.qcCategories) return null
    const newCat: QcCategory = {
      id: genId('cat'),
      name: categoryName,
      fields: []
    }
    project.qcCategories.push(newCat)
    return newCat
  }

  const updateCategory = (projectId: string, categoryId: string, newName: string): boolean => {
    const project = findNodeById(treeData.value, projectId)
    if (!project?.qcCategories) return false
    const cat = project.qcCategories.find((c) => c.id === categoryId)
    if (!cat) return false
    cat.name = newName
    return true
  }

  const deleteCategory = (projectId: string, categoryId: string): boolean => {
    const project = findNodeById(treeData.value, projectId)
    if (!project?.qcCategories) return false
    const idx = project.qcCategories.findIndex((c) => c.id === categoryId)
    if (idx === -1) return false
    project.qcCategories.splice(idx, 1)
    return true
  }

  // ===== 字段 CRUD =====
  const addField = (projectId: string, categoryId: string, field: QcField): boolean => {
    const project = findNodeById(treeData.value, projectId)
    if (!project?.qcCategories) return false
    const cat = project.qcCategories.find((c) => c.id === categoryId)
    if (!cat) return false
    const newId = Math.max(...cat.fields.map((f) => f.id), 0) + 1
    cat.fields.push({ ...field, id: newId })
    return true
  }

  const updateField = (projectId: string, categoryId: string, field: QcField): boolean => {
    const project = findNodeById(treeData.value, projectId)
    if (!project?.qcCategories) return false
    const cat = project.qcCategories.find((c) => c.id === categoryId)
    if (!cat) return false
    const idx = cat.fields.findIndex((f) => f.id === field.id)
    if (idx === -1) return false
    cat.fields[idx] = { ...field }
    return true
  }

  const deleteField = (projectId: string, categoryId: string, fieldId: number): boolean => {
    const project = findNodeById(treeData.value, projectId)
    if (!project?.qcCategories) return false
    const cat = project.qcCategories.find((c) => c.id === categoryId)
    if (!cat) return false
    const idx = cat.fields.findIndex((f) => f.id === fieldId)
    if (idx === -1) return false
    cat.fields.splice(idx, 1)
    return true
  }

  return {
    treeData,
    resetToDefault,
    getAllProjects,
    getProjectById,
    getPlatformIdByProjectId,
    getFieldsByCategory,
    getCategoriesByProjectId,
    addPlatform,
    addProject,
    updateNode,
    deleteNode,
    addCategory,
    updateCategory,
    deleteCategory,
    addField,
    updateField,
    deleteField
  }
})