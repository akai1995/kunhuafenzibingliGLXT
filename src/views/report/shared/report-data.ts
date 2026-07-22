import { reactive, ref } from 'vue'
import { useSampleFlowStore } from '@/store/modules/sample-flow'
import type { FlowSample } from '@/store/modules/sample-flow'

// ===== 类型定义 =====
export interface AuditRecord {
  level: 1 | 2
  result: 'pass' | 'reject'
  auditor: string
  auditTime: string
  auditRemark: string
}

export interface ReportItem {
  id: number
  patientName: string
  sampleNo: string
  gender: string
  age: string
  projectName: string
  pathologyNo: string
  sampleType: string
  templateName: string
  templateId: string
  reportStatus: '未书写' | '书写中' | '已书写' | '已上传'
  auditStatus: 'pending' | 'level1Passed' | 'passed' | 'rejected'
  createTime: string
  // 报告书写数据
  reportData?: Record<string, unknown>
  // 报告上传数据
  uploadData?: Record<string, unknown>
  // 审核数据（兼容旧字段）
  auditRemark?: string
  auditTime?: string
  // 审核记录（一级审核 + 二级审核）
  auditRecords?: AuditRecord[]
  // 来源
  sourceOrderId?: number
}

export interface TemplateField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  required?: boolean
  options?: string[]
  placeholder?: string
  defaultValue?: string
}

export interface TemplateItem {
  id: number
  name: string
  type: string
  category: string
  code: string
  path: string
  projectName: string
  projectCode: string
  fields: TemplateField[]
}

export interface GeneItem {
  id: number
  geneName: string
  interpretation: string
}

export interface PriceProjectItem {
  id: number
  projectCode: string
  projectName: string
}

// ===== 项目价格维护数据（用于报告模板关联项目选择）=====
export const priceProjectMock: PriceProjectItem[] = [
  { id: 1, projectCode: 'EGFR-2026-001', projectName: 'EGFR基因突变检测' },
  { id: 2, projectCode: 'KRAS-2026-002', projectName: 'KRAS基因突变检测' },
  { id: 3, projectCode: 'BRAF-2026-003', projectName: 'BRAF V600E突变检测' },
  { id: 4, projectCode: 'HER2-2026-004', projectName: 'HER2基因扩增检测' },
  { id: 5, projectCode: 'ALK-2026-005', projectName: 'ALK融合基因检测' },
  { id: 6, projectCode: 'ROS1-2026-006', projectName: 'ROS1融合基因检测' },
  { id: 7, projectCode: 'MET-2026-007', projectName: 'MET外显子14跳跃检测' },
  { id: 8, projectCode: 'NGS-2026-008', projectName: 'NGS多基因联合检测' },
  { id: 9, projectCode: 'PIK3CA-009', projectName: 'PIK3CA突变检测' },
  { id: 10, projectCode: 'TP53-2026-010', projectName: 'TP53基因突变检测' }
]

// ===== 报告模板字段生成 =====
const generateFields = (
  category: string,
  projectName: string,
  projectCode: string
): TemplateField[] => {
  const baseFields: TemplateField[] = [
    {
      key: 'projectName',
      label: '项目名称',
      type: 'input',
      required: true,
      defaultValue: projectName,
      placeholder: '请输入项目名称'
    },
    {
      key: 'projectCode',
      label: '项目编码',
      type: 'input',
      required: true,
      defaultValue: projectCode,
      placeholder: '请输入项目编码'
    },
    {
      key: 'patientName',
      label: '患者姓名',
      type: 'input',
      required: true,
      placeholder: '请输入患者姓名'
    },
    {
      key: 'sampleNo',
      label: '样本编号',
      type: 'input',
      required: true,
      placeholder: '请输入样本编号'
    },
    {
      key: 'gender',
      label: '性别',
      type: 'select',
      required: true,
      options: ['男', '女'],
      placeholder: '请选择性别'
    },
    {
      key: 'age',
      label: '年龄',
      type: 'input',
      required: true,
      placeholder: '请输入年龄'
    },
    {
      key: 'pathologyNo',
      label: '病理号',
      type: 'input',
      required: true,
      placeholder: '请输入病理号'
    },
    {
      key: 'sampleType',
      label: '样本类型',
      type: 'select',
      required: true,
      options: ['石蜡切片', '新鲜组织', '血液', '胸水', '骨髓'],
      placeholder: '请选择样本类型'
    }
  ]

  let specificFields: TemplateField[] = []
  switch (category) {
    case 'mutation':
      specificFields = [
        {
          key: 'detectionMethod',
          label: '检测方法',
          type: 'select',
          required: true,
          options: ['ARMS-PCR', 'Sanger测序', 'NGS'],
          placeholder: '请选择检测方法'
        },
        {
          key: 'mutationSite',
          label: '突变位点',
          type: 'input',
          required: true,
          placeholder: '请输入突变位点'
        },
        {
          key: 'result',
          label: '检测结果',
          type: 'select',
          required: true,
          options: ['阳性', '阴性', '未见突变'],
          placeholder: '请选择检测结果'
        },
        {
          key: 'interpretation',
          label: '结果解释',
          type: 'textarea',
          required: true,
          placeholder: '请输入结果解释'
        }
      ]
      break
    case 'fusion':
      specificFields = [
        {
          key: 'detectionMethod',
          label: '检测方法',
          type: 'select',
          required: true,
          options: ['FISH', 'RT-PCR', 'NGS'],
          placeholder: '请选择检测方法'
        },
        {
          key: 'fusionPartner',
          label: '融合伴侣',
          type: 'input',
          required: true,
          placeholder: '请输入融合伴侣'
        },
        {
          key: 'result',
          label: '检测结果',
          type: 'select',
          required: true,
          options: ['阳性', '阴性'],
          placeholder: '请选择检测结果'
        },
        {
          key: 'interpretation',
          label: '结果解释',
          type: 'textarea',
          required: true,
          placeholder: '请输入结果解释'
        }
      ]
      break
    case 'amplification':
      specificFields = [
        {
          key: 'detectionMethod',
          label: '检测方法',
          type: 'select',
          required: true,
          options: ['FISH', 'IHC', 'NGS'],
          placeholder: '请选择检测方法'
        },
        {
          key: 'amplificationRatio',
          label: '扩增比值',
          type: 'input',
          required: true,
          placeholder: '请输入扩增比值'
        },
        {
          key: 'result',
          label: '检测结果',
          type: 'select',
          required: true,
          options: ['扩增', '无扩增', '可疑扩增'],
          placeholder: '请选择检测结果'
        },
        {
          key: 'interpretation',
          label: '结果解释',
          type: 'textarea',
          required: true,
          placeholder: '请输入结果解释'
        }
      ]
      break
    case 'comprehensive':
      specificFields = [
        {
          key: 'panelName',
          label: 'Panel名称',
          type: 'input',
          required: true,
          placeholder: '请输入Panel名称'
        },
        {
          key: 'detectionMethod',
          label: '检测方法',
          type: 'select',
          required: true,
          options: ['NGS'],
          placeholder: '请选择检测方法'
        },
        {
          key: 'result',
          label: '检测结果',
          type: 'select',
          required: true,
          options: ['有阳性发现', '未见异常'],
          placeholder: '请选择检测结果'
        },
        {
          key: 'interpretation',
          label: '结果解释',
          type: 'textarea',
          required: true,
          placeholder: '请输入结果解释'
        }
      ]
      break
  }

  return [...baseFields, ...specificFields]
}

// ===== 报告模板数据 =====
export const templateMock: TemplateItem[] = [
  { id: 1, name: 'EGFR突变检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-EGFR-001', path: '/templates/egfr_mutation.docx', projectName: 'EGFR基因突变检测', projectCode: 'EGFR-2026-001', fields: generateFields('mutation', 'EGFR基因突变检测', 'EGFR-2026-001') },
  { id: 2, name: 'KRAS突变检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-KRAS-001', path: '/templates/kras_mutation.docx', projectName: 'KRAS基因突变检测', projectCode: 'KRAS-2026-002', fields: generateFields('mutation', 'KRAS基因突变检测', 'KRAS-2026-002') },
  { id: 3, name: 'BRAF V600E检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-BRAF-001', path: '/templates/braf_v600e.docx', projectName: 'BRAF V600E突变检测', projectCode: 'BRAF-2026-003', fields: generateFields('mutation', 'BRAF V600E突变检测', 'BRAF-2026-003') },
  { id: 4, name: 'ALK融合检测报告模板', type: 'gene', category: 'fusion', code: 'TPL-ALK-001', path: '/templates/alk_fusion.docx', projectName: 'ALK融合基因检测', projectCode: 'ALK-2026-005', fields: generateFields('fusion', 'ALK融合基因检测', 'ALK-2026-005') },
  { id: 5, name: 'HER2扩增检测报告模板', type: 'gene', category: 'amplification', code: 'TPL-HER2-001', path: '/templates/her2_amp.docx', projectName: 'HER2基因扩增检测', projectCode: 'HER2-2026-004', fields: generateFields('amplification', 'HER2基因扩增检测', 'HER2-2026-004') },
  { id: 6, name: 'ROS1融合检测报告模板', type: 'gene', category: 'fusion', code: 'TPL-ROS1-001', path: '/templates/ros1_fusion.docx', projectName: 'ROS1融合基因检测', projectCode: 'ROS1-2026-006', fields: generateFields('fusion', 'ROS1融合基因检测', 'ROS1-2026-006') },
  { id: 7, name: '综合病理报告模板', type: 'comprehensive', category: 'comprehensive', code: 'TPL-PATH-001', path: '/templates/comprehensive_path.docx', projectName: 'NGS多基因联合检测', projectCode: 'NGS-2026-008', fields: generateFields('comprehensive', 'NGS多基因联合检测', 'NGS-2026-008') },
  { id: 8, name: 'MET跳跃检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-MET-001', path: '/templates/met_exon14.docx', projectName: 'MET外显子14跳跃检测', projectCode: 'MET-2026-007', fields: generateFields('mutation', 'MET外显子14跳跃检测', 'MET-2026-007') }
]

// ===== 基因检测结果解释数据 =====
export const geneMock: GeneItem[] = [
  { id: 1, geneName: 'EGFR', interpretation: 'EGFR基因突变提示对酪氨酸激酶抑制剂（TKI）治疗敏感，常见突变如L858R、19del等。' },
  { id: 2, geneName: 'KRAS', interpretation: 'KRAS基因突变通常提示对抗EGFR治疗耐药，常见突变位点在密码子12、13。' },
  { id: 3, geneName: 'BRAF', interpretation: 'BRAF V600E突变提示可使用BRAF抑制剂治疗，常见于黑色素瘤和甲状腺癌。' },
  { id: 4, geneName: 'HER2', interpretation: 'HER2基因扩增提示可使用抗HER2靶向药物治疗，如曲妥珠单抗。' },
  { id: 5, geneName: 'ALK', interpretation: 'ALK融合基因阳性提示可使用ALK抑制剂治疗，如克唑替尼、阿来替尼等。' },
  { id: 6, geneName: 'ROS1', interpretation: 'ROS1融合基因阳性提示可使用ROS1抑制剂治疗，如克唑替尼、恩曲替尼等。' },
  { id: 7, geneName: 'MET', interpretation: 'MET外显子14跳跃突变提示可使用MET抑制剂治疗，如赛沃替尼、卡马替尼等。' },
  { id: 8, geneName: 'PIK3CA', interpretation: 'PIK3CA突变可能与靶向治疗耐药相关，常见于乳腺癌和结直肠癌。' }
]

// ===== 报告共享 Store =====
// 流程逻辑：
// 1. 报告生成新增的报告 → 展示在报告书写模块
// 2. 报告书写完成 → 展示在报告上传模块
// 3. 报告上传完成 → 展示在报告审核模块
// 重点流程：数据在某个流程审核/确认成功后，数据依然在这个流程展示

const initialReports: ReportItem[] = [
  // ===== 报告审核模块可见（reportStatus === '已上传'）=====
  // 已完成两级审核（审核通过）
  { id: 1, patientName: '张明', sampleNo: 'S20260701001', gender: '男', age: '58', projectName: 'EGFR基因突变检测', pathologyNo: 'P2026-001', sampleType: '石蜡切片', templateName: 'EGFR突变检测报告模板', templateId: 'tpl_egfr', reportStatus: '已上传', auditStatus: 'passed', createTime: '2026-07-01 09:30:00', auditRecords: [{ level: 1, result: 'pass', auditor: '张主任', auditTime: '2026-07-02 10:30:00', auditRemark: '一级审核通过，数据完整，建议进入二级审核' }, { level: 2, result: 'pass', auditor: '李主任', auditTime: '2026-07-03 14:00:00', auditRemark: '二级审核通过，报告可发布' }] },
  { id: 2, patientName: '李华', sampleNo: 'S20260701002', gender: '女', age: '45', projectName: 'KRAS基因突变检测', pathologyNo: 'P2026-002', sampleType: '新鲜组织', templateName: 'KRAS突变检测报告模板', templateId: 'tpl_kras', reportStatus: '已上传', auditStatus: 'passed', createTime: '2026-07-01 10:15:00', auditRecords: [{ level: 1, result: 'pass', auditor: '张主任', auditTime: '2026-07-02 11:00:00', auditRemark: '一级审核通过，突变位点检测准确' }, { level: 2, result: 'pass', auditor: '李主任', auditTime: '2026-07-03 15:30:00', auditRemark: '审核通过，报告符合规范' }] },
  // 一级审核通过，待二级审核
  { id: 3, patientName: '王芳', sampleNo: 'S20260701003', gender: '女', age: '52', projectName: 'BRAF V600E突变检测', pathologyNo: 'P2026-003', sampleType: '血液', templateName: 'BRAF V600E检测报告模板', templateId: 'tpl_braf', reportStatus: '已上传', auditStatus: 'level1Passed', createTime: '2026-07-01 14:20:00', auditRecords: [{ level: 1, result: 'pass', auditor: '张主任', auditTime: '2026-07-02 16:00:00', auditRemark: '一级审核通过，检测结果与临床诊断一致' }] },
  { id: 4, patientName: '刘强', sampleNo: 'S20260701004', gender: '男', age: '63', projectName: 'HER2基因扩增检测', pathologyNo: 'P2026-004', sampleType: '石蜡切片', templateName: 'HER2扩增检测报告模板', templateId: 'tpl_her2', reportStatus: '已上传', auditStatus: 'level1Passed', createTime: '2026-07-02 08:30:00', auditRecords: [{ level: 1, result: 'pass', auditor: '张主任', auditTime: '2026-07-03 09:00:00', auditRemark: '一级审核通过，FISH检测结果清晰' }] },
  // 待一级审核（已上传但未审核）
  { id: 5, patientName: '陈静', sampleNo: 'S20260701005', gender: '女', age: '39', projectName: 'ALK融合基因检测', pathologyNo: 'P2026-005', sampleType: '新鲜组织', templateName: 'ALK融合检测报告模板', templateId: 'tpl_alk', reportStatus: '已上传', auditStatus: 'pending', createTime: '2026-07-02 10:45:00' },
  { id: 6, patientName: '赵伟', sampleNo: 'S20260701006', gender: '男', age: '67', projectName: 'NGS多基因联合检测', pathologyNo: 'P2026-006', sampleType: '血液', templateName: '综合病理报告模板', templateId: 'tpl_comp', reportStatus: '已上传', auditStatus: 'pending', createTime: '2026-07-02 15:00:00' },

  // ===== 报告上传模块可见（reportStatus === '已书写'）=====
  { id: 7, patientName: '孙丽', sampleNo: 'S20260701007', gender: '女', age: '41', projectName: 'ROS1融合基因检测', pathologyNo: 'P2026-007', sampleType: '石蜡切片', templateName: 'ROS1融合检测报告模板', templateId: 'tpl_ros1', reportStatus: '已书写', auditStatus: 'pending', createTime: '2026-07-03 08:20:00' },
  { id: 8, patientName: '周明', sampleNo: 'S20260701008', gender: '男', age: '55', projectName: 'MET外显子14跳跃检测', pathologyNo: 'P2026-008', sampleType: '新鲜组织', templateName: 'MET跳跃检测报告模板', templateId: 'tpl_met', reportStatus: '已书写', auditStatus: 'pending', createTime: '2026-07-03 09:10:00' },

  // ===== 报告书写模块可见（reportStatus === '未书写'）=====
  { id: 9, patientName: '杨光', sampleNo: 'S20260701009', gender: '男', age: '60', projectName: 'EGFR基因突变检测', pathologyNo: 'P2026-009', sampleType: '血液', templateName: 'EGFR突变检测报告模板', templateId: 'tpl_egfr', reportStatus: '未书写', auditStatus: 'pending', createTime: '2026-07-03 10:00:00' },
  { id: 10, patientName: '赵丽', sampleNo: 'S20260701010', gender: '女', age: '47', projectName: 'PIK3CA突变检测', pathologyNo: 'P2026-010', sampleType: '石蜡切片', templateName: '综合病理报告模板', templateId: 'tpl_comp', reportStatus: '未书写', auditStatus: 'pending', createTime: '2026-07-03 11:00:00' },

  // ===== 接诊单流转数据（已完成技术平台质控，进入报告中心等待报告书写）=====
  { id: 201, patientName: '吴敏', sampleNo: 'S20260701011', gender: '女', age: '48', projectName: 'PIK3CA突变检测', pathologyNo: 'BL20260011', sampleType: '组织样本', templateName: '', templateId: '', reportStatus: '未书写', auditStatus: 'pending', createTime: '2026-07-02 16:30:00', sourceOrderId: 9 },
  { id: 202, patientName: '郑浩', sampleNo: 'S20260701012', gender: '男', age: '61', projectName: 'TP53基因突变检测', pathologyNo: 'BL20260012', sampleType: '血液样本', templateName: '', templateId: '', reportStatus: '未书写', auditStatus: 'pending', createTime: '2026-07-02 17:00:00', sourceOrderId: 10 },

  // ===== 已驳回数据（审核被驳回，回到报告书写阶段）=====
  { id: 203, patientName: '马丽', sampleNo: 'S20260701013', gender: '女', age: '53', projectName: 'MET外显子14跳跃检测', pathologyNo: 'BL20260013', sampleType: '组织样本', templateName: 'MET跳跃检测报告模板', templateId: 'tpl_met', reportStatus: '已书写', auditStatus: 'rejected', createTime: '2026-07-03 08:00:00', auditRemark: '检测结果解释不充分，请补充临床意义说明' },
  { id: 204, patientName: '黄磊', sampleNo: 'S20260701014', gender: '男', age: '42', projectName: 'EGFR基因突变检测', pathologyNo: 'BL20260014', sampleType: '血液样本', templateName: 'EGFR突变检测报告模板', templateId: 'tpl_egfr', reportStatus: '已书写', auditStatus: 'rejected', createTime: '2026-07-03 09:00:00', auditRemark: '病理号信息不完整，请核实后重新提交' }
]

// 共享 reactive 数据
export const reportStore = reactive({
  reports: [...initialReports] as ReportItem[],
  templates: [...templateMock] as TemplateItem[],
  genes: [...geneMock] as GeneItem[],
  priceProjects: [...priceProjectMock] as PriceProjectItem[],
  nextId: 300
})

// ===== 报告操作方法 =====
export const useReportStore = () => {
  const sampleFlowStore = useSampleFlowStore()

  /**
   * 将流转样本转换为报告数据格式
   */
  const flowSampleToReportItem = (fs: FlowSample): ReportItem => {
    // 根据流转审核状态映射报告状态
    const reportStatusMap: Record<string, string> = {
      '': '未书写',
      pending: '未书写',
      level1Passed: '已上传',
      passed: '已上传',
      rejected: '已书写'
    }
    const auditStatusMap: Record<string, string> = {
      '': 'pending',
      pending: 'pending',
      level1Passed: 'level1Passed',
      passed: 'passed',
      rejected: 'rejected'
    }
    return {
      id: fs.sourceOrderId + 1000, // 避免与手动报告ID冲突
      patientName: fs.patientName,
      sampleNo: fs.sampleNo,
      gender: fs.gender,
      age: fs.age,
      projectName: fs.projectName,
      pathologyNo: fs.pathologyNo,
      sampleType: fs.sampleType,
      templateName: '',
      templateId: '',
      reportStatus: reportStatusMap[fs.reportAuditStatus] || '未书写',
      auditStatus: auditStatusMap[fs.reportAuditStatus] || 'pending',
      createTime: fs.platformQcTime || fs.orderSubmitTime,
      sourceOrderId: fs.sourceOrderId
    }
  }

  // 获取所有报告（报告生成页面：只展示手动生成的报告，不展示接诊单流转数据）
  const getAllReports = (): ReportItem[] => {
    return reportStore.reports.filter((r) => !r.sourceOrderId)
  }

  // 获取待书写报告（报告书写页面：reportStatus 为 未书写/书写中，或 auditStatus 为 rejected）
  // 同时包含从样本流转Store中到达报告阶段但尚未开始书写的样本
  const getWritingReports = (): ReportItem[] => {
    // 从报告Store获取已有数据
    const existing = reportStore.reports.filter(
      (r) => r.reportStatus === '未书写' || r.reportStatus === '书写中' || r.auditStatus === 'rejected'
    )

    // 从样本流转Store获取到达报告阶段的样本（qc_platform_done及以上）
    const flowSamples = sampleFlowStore.getSamplesForReport()
    const existingSourceIds = new Set(existing.map((r) => r.sourceOrderId).filter(Boolean))
    const flowReports = flowSamples
      .filter((fs) => {
        // 排除已审核通过的样本（它们应该出现在报告审核页面）
        if (fs.reportAuditStatus === 'level1Passed' || fs.reportAuditStatus === 'passed') return false
        return !existingSourceIds.has(fs.sourceOrderId)
      })
      .map((fs) => flowSampleToReportItem(fs))

    return [...existing, ...flowReports]
  }

  // 获取待上传报告（报告上传页面：reportStatus 为 已书写 或 已上传）
  const getUploadReports = (): ReportItem[] => {
    return reportStore.reports.filter(
      (r) => r.reportStatus === '已书写' || r.reportStatus === '已上传'
    )
  }

  // 获取待审核报告（报告审核页面：reportStatus 为 已上传）
  // 同时包含从样本流转Store中已审核通过的样本
  const getAuditReports = (): ReportItem[] => {
    const existing = reportStore.reports.filter((r) => r.reportStatus === '已上传')

    // 从样本流转Store获取已审核通过的样本
    const flowSamples = sampleFlowStore.getSamplesForReport()
    const existingSourceIds = new Set(existing.map((r) => r.sourceOrderId).filter(Boolean))
    const flowReports = flowSamples
      .filter((fs) => {
        // 已审核（level1Passed 或 passed）且尚未在报告Store中
        const isAudited = fs.reportAuditStatus === 'level1Passed' || fs.reportAuditStatus === 'passed'
        return isAudited && !existingSourceIds.has(fs.sourceOrderId)
      })
      .map((fs) => flowSampleToReportItem(fs))

    return [...existing, ...flowReports]
  }

  // 新增报告
  const addReport = (data: Partial<ReportItem>): number => {
    const id = reportStore.nextId++
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const createTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    reportStore.reports.unshift({
      id,
      patientName: data.patientName || '',
      sampleNo: data.sampleNo || '',
      gender: data.gender || '',
      age: data.age || '',
      projectName: data.projectName || '',
      pathologyNo: data.pathologyNo || '',
      sampleType: data.sampleType || '',
      templateName: data.templateName || '',
      templateId: data.templateId || '',
      reportStatus: data.reportStatus || '未书写',
      auditStatus: 'pending',
      createTime
    })
    return id
  }

  // 保存报告书写进度（状态变为"书写中"）
  const saveWriting = (id: number, reportData: Record<string, unknown>) => {
    let report = reportStore.reports.find((r) => r.id === id)
    if (!report) {
      const flowSample = sampleFlowStore.flowSamples.find((fs) => fs.sourceOrderId + 1000 === id)
      if (flowSample) {
        const newReport = flowSampleToReportItem(flowSample)
        newReport.id = id
        reportStore.reports.push(newReport)
        report = newReport
      }
    }
    if (report) {
      report.reportStatus = '书写中'
      report.reportData = reportData
    }
  }

  // 报告书写完成
  const completeWriting = (id: number, reportData: Record<string, unknown>) => {
    let report = reportStore.reports.find((r) => r.id === id)
    if (!report) {
      // 如果报告Store中不存在，则从流转Store中查找并创建
      const flowSample = sampleFlowStore.flowSamples.find((fs) => fs.sourceOrderId + 1000 === id)
      if (flowSample) {
        const newReport = flowSampleToReportItem(flowSample)
        newReport.id = id
        reportStore.reports.push(newReport)
        report = newReport
      }
    }
    if (report) {
      report.reportStatus = '已书写'
      report.reportData = reportData
    }
  }

  // 报告上传完成
  const completeUpload = (id: number, uploadData: Record<string, unknown>) => {
    let report = reportStore.reports.find((r) => r.id === id)
    if (!report) {
      const flowSample = sampleFlowStore.flowSamples.find((fs) => fs.sourceOrderId + 1000 === id)
      if (flowSample) {
        const newReport = flowSampleToReportItem(flowSample)
        newReport.id = id
        reportStore.reports.push(newReport)
        report = newReport
      }
    }
    if (report) {
      report.reportStatus = '已上传'
      report.uploadData = uploadData
    }
  }

  // 撤回报告上传（未审核或一级审核通过的数据可撤回）
  const cancelUpload = (id: number): boolean => {
    const report = reportStore.reports.find((r) => r.id === id)
    if (!report) return false
    if (report.reportStatus === '已上传') {
      if (!report.auditStatus || report.auditStatus === 'pending') {
        // 未审核 → 撤回上传，状态回到已书写
        report.reportStatus = '已书写'
        return true
      }
      if (report.auditStatus === 'level1Passed') {
        // 一级审核通过 → 撤回审核，重置审核状态
        report.auditStatus = 'pending'
        report.auditRemark = ''
        report.auditTime = ''
        report.auditRecords = []
        return true
      }
    }
    return false
  }

  // 报告审核
  const auditReport = (id: number, passed: boolean, remark: string) => {
    let report = reportStore.reports.find((r) => r.id === id)
    if (!report) {
      const flowSample = sampleFlowStore.flowSamples.find((fs) => fs.sourceOrderId + 1000 === id)
      if (flowSample) {
        const newReport = flowSampleToReportItem(flowSample)
        newReport.id = id
        reportStore.reports.push(newReport)
        report = newReport
      }
    }
    if (!report) return false

    // 同步更新样本流转Store
    const sampleNo = report.sampleNo
    if (sampleNo) {
      sampleFlowStore.auditReport(sampleNo, passed)
    }

    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const auditTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    if (!report.auditRecords) {
      report.auditRecords = []
    }
    if (passed) {
      if (report.auditStatus === 'pending' || !report.auditStatus) {
        report.auditStatus = 'level1Passed'
        report.auditRemark = remark
        report.auditTime = auditTime
        report.auditRecords.push({
          level: 1,
          result: 'pass',
          auditor: '张主任',
          auditTime,
          auditRemark: remark
        })
      } else if (report.auditStatus === 'level1Passed') {
        report.auditStatus = 'passed'
        report.auditRemark = remark
        report.auditTime = auditTime
        report.auditRecords.push({
          level: 2,
          result: 'pass',
          auditor: '李主任',
          auditTime,
          auditRemark: remark
        })
      }
    } else {
      // 审核驳回：回到报告书写阶段
      report.auditStatus = 'rejected'
      report.reportStatus = '已书写'
      report.auditRemark = remark
      report.auditTime = auditTime
      report.auditRecords = []
    }
    return true
  }

  // 取消审核
  const cancelAudit = (id: number) => {
    const report = reportStore.reports.find((r) => r.id === id)
    if (!report) return false
    report.auditStatus = 'pending'
    report.auditRemark = ''
    report.auditTime = ''
    report.auditRecords = []
    return true
  }

  // 删除报告
  const deleteReport = (id: number): boolean => {
    const index = reportStore.reports.findIndex((r) => r.id === id)
    if (index === -1) return false
    reportStore.reports.splice(index, 1)
    return true
  }

  return {
    getAllReports,
    getWritingReports,
    getUploadReports,
    getAuditReports,
    addReport,
    saveWriting,
    completeWriting,
    completeUpload,
    cancelUpload,
    auditReport,
    cancelAudit,
    deleteReport
  }
}
