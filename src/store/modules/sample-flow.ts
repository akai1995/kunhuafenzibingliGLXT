/**
 * 样本流转状态管理模块
 *
 * 管理样本在四个流程中的流转状态：
 * 流程一：接诊单 → 流程二：样本管理 → 流程三：质控管理 → 流程四：报告管理
 *
 * 重点流程规则：数据在某个流程审核或确认成功后，数据依然会在这个流程展示，而不是删除或隐藏
 * 驳回规则：驳回时回退到流程一（rejected阶段），数据只在接诊单管理展示
 *
 * @module store/modules/sample-flow
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 流程阶段定义
 * - rejected: 驳回回退到流程一，不可在下游模块展示
 * - reception: 接诊单已提交，样本管理可见
 * - sample_stored: 样本已采集入库，样本质控模块可见
 * - qc_sample_done: 样本质控完成，技术平台质控可见
 * - qc_platform_done: 技术平台质控完成，报告管理可见
 * - report_audited: 报告已审核完成
 */
export type FlowStage =
  | 'rejected'
  | 'reception'
  | 'sample_stored'
  | 'qc_sample_done'
  | 'qc_platform_done'
  | 'report_audited'

/**
 * 阶段顺序映射（用于 >= 比较，实现重点流程规则）
 * 数据到达某个阶段后，依然在所有前置阶段的页面展示
 */
const stageOrder: Record<FlowStage, number> = {
  rejected: 0,
  reception: 1,
  sample_stored: 2,
  qc_sample_done: 3,
  qc_platform_done: 4,
  report_audited: 5
}

/**
 * 流转样本数据结构
 */
export interface FlowSample {
  id: number
  // 基本信息
  patientName: string
  gender: string
  age: string
  idCard: string
  patientType: string
  hospital: string
  department: string
  doctor: string
  projectName: string
  sampleType: string
  sampleNo: string
  pathologyNo: string
  applyCode: string
  applyTime: string
  barcode: string
  storageLocation: string
  isSelfSample: string // 'yes' = 自带(本院), 'no' = 外院
  sourceHospital: string
  // 流程阶段
  flowStage: FlowStage
  // 外院样本核收状态
  receiveStatus: 'pending' | 'received' | 'rejected' // 待核收/已核收/核收不成功
  // 各阶段时间记录
  orderSubmitTime: string
  sampleStoreTime: string
  platformQcTime: string
  reportAuditTime: string
  // 报告审核状态
  reportAuditStatus: string // pending/level1Passed/passed/rejected
  // 来源模块的原始ID（用于跨模块关联）
  sourceOrderId: number
}

/**
 * 获取当前时间字符串
 */
const now = (): string => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const useSampleFlowStore = defineStore('sampleFlow', () => {
  // 流转样本列表
  const flowSamples = ref<FlowSample[]>([])

  // 自增ID（使用大起始值避免与各模块Mock数据ID冲突）
  let nextId = 100000

  // 条形码自增序号
  let barcodeSeq = 9001

  // 样本编号自增序号
  let sampleNoSeq = 2001

  // ===== 初始化流转样本数据（与接诊单管理mockData对应） =====
  const initFlowSamples = () => {
    if (flowSamples.value.length > 0) return // 已初始化则跳过

    const now = (): string => {
      const d = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const initialSamples: FlowSample[] = [
      { id: nextId++, patientName: '张伟', gender: '男', age: '45岁', idCard: '530102198103156734', patientType: '住院患者', hospital: '昆华医院', department: '肿瘤科', doctor: '张医生', projectName: 'EGFR基因突变检测', sampleType: '组织样本', sampleNo: 'S20260701001', pathologyNo: 'BL20261001', applyCode: 'AP2026070001', applyTime: '2026-07-01 08:30:00', barcode: 'BC20269001', storageLocation: '冰箱A-1号架-1号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-01 08:30:00', sampleStoreTime: '2026-07-01 10:00:00', platformQcTime: '2026-07-02 15:00:00', reportAuditTime: '', reportAuditStatus: 'level1Passed', sourceOrderId: 1 },
      { id: nextId++, patientName: '李娜', gender: '女', age: '52岁', idCard: '530103197409128765', patientType: '住院患者', hospital: '昆华医院', department: '乳腺外科', doctor: '王医生', projectName: 'HER2基因扩增检测', sampleType: '血液样本', sampleNo: 'S20260701002', pathologyNo: 'BL20261002', applyCode: 'AP2026070002', applyTime: '2026-07-01 09:00:00', barcode: 'BC20269002', storageLocation: '冰箱A-2号架-3号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-01 09:00:00', sampleStoreTime: '2026-07-01 11:00:00', platformQcTime: '2026-07-02 16:00:00', reportAuditTime: '', reportAuditStatus: 'level1Passed', sourceOrderId: 2 },
      { id: nextId++, patientName: '王芳', gender: '女', age: '52岁', idCard: '530103197409120003', patientType: '门诊患者', hospital: '昆华医院', department: '肿瘤科', doctor: '李医生', projectName: 'BRAF V600E突变检测', sampleType: '血液', sampleNo: 'S20260701003', pathologyNo: 'P2026-003', applyCode: 'AP2026070003', applyTime: '2026-07-01 14:20:00', barcode: 'BC20269003', storageLocation: '冰箱B-1号架-2号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-01 14:20:00', sampleStoreTime: '2026-07-01 16:00:00', platformQcTime: '2026-07-02 17:00:00', reportAuditTime: '', reportAuditStatus: 'level1Passed', sourceOrderId: 3 },
      { id: nextId++, patientName: '刘强', gender: '男', age: '63岁', idCard: '530103196306150004', patientType: '住院患者', hospital: '昆华医院', department: '胃肠外科', doctor: '赵医生', projectName: 'HER2基因扩增检测', sampleType: '石蜡切片', sampleNo: 'S20260701004', pathologyNo: 'P2026-004', applyCode: 'AP2026070004', applyTime: '2026-07-02 08:30:00', barcode: 'BC20269004', storageLocation: '冰箱B-3号架-1号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-02 08:30:00', sampleStoreTime: '2026-07-02 10:00:00', platformQcTime: '2026-07-03 09:00:00', reportAuditTime: '', reportAuditStatus: 'level1Passed', sourceOrderId: 4 },
      { id: nextId++, patientName: '陈静', gender: '女', age: '39岁', idCard: '530103198703150005', patientType: '门诊患者', hospital: '昆华医院', department: '呼吸科', doctor: '张医生', projectName: 'ALK融合基因检测', sampleType: '新鲜组织', sampleNo: 'S20260701005', pathologyNo: 'P2026-005', applyCode: 'AP2026070005', applyTime: '2026-07-02 10:45:00', barcode: 'BC20269005', storageLocation: '冰箱C-1号架-4号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-02 10:45:00', sampleStoreTime: '2026-07-02 14:00:00', platformQcTime: '2026-07-03 10:00:00', reportAuditTime: '', reportAuditStatus: 'pending', sourceOrderId: 5 },
      { id: nextId++, patientName: '赵伟', gender: '男', age: '67岁', idCard: '530103195905150006', patientType: '住院患者', hospital: '昆华医院', department: '肿瘤科', doctor: '李医生', projectName: 'NGS多基因联合检测', sampleType: '血液', sampleNo: 'S20260701006', pathologyNo: 'P2026-006', applyCode: 'AP2026070006', applyTime: '2026-07-02 15:00:00', barcode: 'BC20269006', storageLocation: '冰箱C-2号架-2号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-02 15:00:00', sampleStoreTime: '2026-07-02 17:00:00', platformQcTime: '2026-07-03 14:00:00', reportAuditTime: '', reportAuditStatus: 'pending', sourceOrderId: 6 },
      { id: nextId++, patientName: '孙丽', gender: '女', age: '41岁', idCard: '530103198503150007', patientType: '门诊患者', hospital: '昆华医院', department: '呼吸科', doctor: '王医生', projectName: 'ROS1融合基因检测', sampleType: '石蜡切片', sampleNo: 'S20260701007', pathologyNo: 'P2026-007', applyCode: 'AP2026070007', applyTime: '2026-07-03 08:20:00', barcode: 'BC20269007', storageLocation: '冰箱A-3号架-1号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-03 08:20:00', sampleStoreTime: '2026-07-03 10:00:00', platformQcTime: '2026-07-04 09:00:00', reportAuditTime: '', reportAuditStatus: 'pending', sourceOrderId: 7 },
      { id: nextId++, patientName: '周明', gender: '男', age: '55岁', idCard: '530103197105150008', patientType: '住院患者', hospital: '昆华医院', department: '肿瘤科', doctor: '赵医生', projectName: 'MET外显子14跳跃检测', sampleType: '新鲜组织', sampleNo: 'S20260701008', pathologyNo: 'P2026-008', applyCode: 'AP2026070008', applyTime: '2026-07-03 09:10:00', barcode: 'BC20269008', storageLocation: '冰箱B-4号架-3号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-03 09:10:00', sampleStoreTime: '2026-07-03 11:00:00', platformQcTime: '2026-07-04 10:00:00', reportAuditTime: '', reportAuditStatus: 'pending', sourceOrderId: 8 },
      { id: nextId++, patientName: '杨光', gender: '男', age: '60岁', idCard: '530103196605150009', patientType: '门诊患者', hospital: '昆华医院', department: '呼吸科', doctor: '张医生', projectName: 'EGFR基因突变检测', sampleType: '血液', sampleNo: 'S20260701009', pathologyNo: 'P2026-009', applyCode: 'AP2026070009', applyTime: '2026-07-03 10:00:00', barcode: 'BC20269009', storageLocation: '冰箱C-3号架-2号盒', isSelfSample: 'no', sourceHospital: '云南省第一人民医院', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-03 10:00:00', sampleStoreTime: '2026-07-03 14:00:00', platformQcTime: '2026-07-04 11:00:00', reportAuditTime: '', reportAuditStatus: 'pending', sourceOrderId: 9 },
      { id: nextId++, patientName: '赵丽', gender: '女', age: '47岁', idCard: '530103197905150010', patientType: '住院患者', hospital: '昆华医院', department: '乳腺外科', doctor: '李医生', projectName: 'PIK3CA突变检测', sampleType: '石蜡切片', sampleNo: 'S20260701010', pathologyNo: 'P2026-010', applyCode: 'AP2026070010', applyTime: '2026-07-03 11:00:00', barcode: 'BC20269010', storageLocation: '冰箱A-4号架-1号盒', isSelfSample: 'yes', sourceHospital: '', flowStage: 'qc_platform_done', receiveStatus: 'received', orderSubmitTime: '2026-07-03 11:00:00', sampleStoreTime: '2026-07-03 15:00:00', platformQcTime: '2026-07-04 14:00:00', reportAuditTime: '', reportAuditStatus: 'pending', sourceOrderId: 10 }
    ]

    flowSamples.value = initialSamples
  }

  // 初始化数据
  initFlowSamples()

  /**
   * 生成条形码（格式：BC + 年份 + 4位序号）
   */
  const generateBarcode = (): string => {
    const year = new Date().getFullYear()
    return `BC${year}${String(barcodeSeq++).padStart(4, '0')}`
  }

  /**
   * 生成样本编号（格式：S + 年月 + 4位序号）
   * 每条接诊单提交后都会生成对应的样本编号
   */
  const generateSampleNo = (): string => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const ym = `${d.getFullYear()}${pad(d.getMonth() + 1)}`
    return `S${ym}${String(sampleNoSeq++).padStart(4, '0')}`
  }

  /**
   * 流程一：接诊单提交
   * 新增接诊单提交后，创建流转样本，生成样本编号和条形码，样本管理可见
   */
  const submitOrder = (orderData: {
    patientName: string
    gender: string
    age: string
    idCard: string
    patientType: string
    hospital: string
    department: string
    doctor: string
    projectName: string
    sampleType: string
    pathologyNo: string
    applyCode: string
    applyTime: string
    isSelfSample: string
    sourceHospital: string
    sourceOrderId: number
  }) => {
    const sample: FlowSample = {
      id: nextId++,
      ...orderData,
      sampleNo: generateSampleNo(),
      barcode: generateBarcode(),
      storageLocation: '',
      flowStage: 'reception',
      receiveStatus: orderData.isSelfSample === 'no' ? 'pending' : 'received',
      orderSubmitTime: now(),
      sampleStoreTime: '',
      platformQcTime: '',
      reportAuditTime: '',
      reportAuditStatus: ''
    }
    flowSamples.value.unshift(sample)
    return sample
  }

  /**
   * 获取接诊单管理可见的流转样本
   * 流程一展示所有流转样本（包括驳回的），因为驳回的样本回退到流程一
   * 成功的样本也依然在接诊单管理展示（重点流程规则）
   */
  const getSamplesForReception = (): FlowSample[] => {
    return flowSamples.value
  }

  /**
   * 获取样本管理阶段可见的流转样本
   * 重点流程规则：flowStage >= reception 的样本都展示（含已入库、已确认等后续阶段）
   * 驳回的样本（rejected阶段）不展示
   */
  const getSamplesForSampleManage = (): FlowSample[] => {
    return flowSamples.value.filter((s) => stageOrder[s.flowStage] >= stageOrder.reception)
  }

  /**
   * 外院样本核收
   * 核收成功 → 允许采集入库
   * 核收不成功 → 驳回到流程一（rejected阶段），重置所有状态，只在接诊单管理展示
   */
  const receiveSample = (id: number, success: boolean): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    if (success) {
      sample.receiveStatus = 'received'
    } else {
      // 重置所有状态，回退到流程一
      sample.flowStage = 'rejected'
      sample.receiveStatus = 'pending'
      sample.barcode = ''
      sample.storageLocation = ''
      sample.sampleStoreTime = ''
      sample.platformQcTime = ''
      sample.reportAuditTime = ''
      sample.reportAuditStatus = 'pending'
    }
    return true
  }

  /**
   * 流程二：样本采集入库
   * 采集入库成功 → 样本质控模块可见（重点流程规则：同时在样本管理可见）
   * 采集入库不成功 → 驳回到流程一
   */
  const storeSample = (id: number, barcode: string, storageLocation: string): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    // 外院样本需要先核收成功
    if (sample.isSelfSample === 'no' && sample.receiveStatus !== 'received') {
      return false
    }
    sample.barcode = barcode
    sample.storageLocation = storageLocation
    sample.flowStage = 'sample_stored'
    sample.sampleStoreTime = now()
    return true
  }

  /**
   * 采集入库不成功 → 驳回到流程一（rejected阶段），重置所有状态
   */
  const rejectStoreSample = (id: number): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    // 重置所有状态，回退到流程一
    sample.flowStage = 'rejected'
    sample.receiveStatus = 'pending'
    sample.barcode = ''
    sample.storageLocation = ''
    sample.sampleStoreTime = ''
    sample.platformQcTime = ''
    sample.reportAuditTime = ''
    sample.reportAuditStatus = 'pending'
    return true
  }

  /**
   * 获取样本质控阶段可见的流转样本
   * 重点流程规则：flowStage >= sample_stored 的样本都展示
   */
  const getSamplesForSampleQc = (): FlowSample[] => {
    return flowSamples.value.filter((s) => stageOrder[s.flowStage] >= stageOrder.sample_stored)
  }

  /**
   * 流程三：样本质控完成
   * 样本质控完成 → 技术平台质控可见（重点流程规则：同时在样本质控可见）
   */
  const completeSampleQc = (id: number): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    sample.flowStage = 'qc_sample_done'
    return true
  }

  /**
   * 获取技术平台质控阶段可见的流转样本
   * 重点流程规则：flowStage >= qc_sample_done 的样本都展示
   */
  const getSamplesForPlatformQc = (): FlowSample[] => {
    return flowSamples.value.filter((s) => stageOrder[s.flowStage] >= stageOrder.qc_sample_done)
  }

  /**
   * 流程三：技术平台质控完成
   * 技术平台质控完成 → 报告管理可见（重点流程规则：同时在技术平台质控可见）
   */
  const completePlatformQc = (id: number): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    sample.flowStage = 'qc_platform_done'
    sample.platformQcTime = now()
    return true
  }

  /**
   * 获取报告管理阶段可见的流转样本
   * 重点流程规则：flowStage >= qc_platform_done 的样本都展示
   */
  const getSamplesForReport = (): FlowSample[] => {
    return flowSamples.value.filter((s) => stageOrder[s.flowStage] >= stageOrder.qc_platform_done)
  }

  /**
   * 流程四：报告审核
   * 审核成功 → 更新样本状态为已完成（重点流程规则：同时在报告管理可见）
   * 审核不成功（驳回） → 状态变成还没有审核，删除报告书写、报告上传数据，需重新填写
   */
  const auditReport = (id: number, passed: boolean): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    if (passed) {
      // 两级审核：pending → level1Passed → passed
      if (sample.reportAuditStatus === 'pending' || !sample.reportAuditStatus) {
        sample.reportAuditStatus = 'level1Passed'
      } else if (sample.reportAuditStatus === 'level1Passed') {
        sample.reportAuditStatus = 'passed'
        sample.flowStage = 'report_audited'
        sample.reportAuditTime = now()
      }
    } else {
      // 审核不成功 → 状态变成还没有审核，保持qc_platform_done阶段
      // 删除报告书写、报告上传数据需在各报告模块中处理
      sample.reportAuditStatus = 'rejected'
      sample.reportAuditTime = now()
    }
    return true
  }

  /**
   * 取消审核 → 回到报告管理阶段
   */
  const cancelAudit = (id: number): boolean => {
    const sample = flowSamples.value.find((s) => s.id === id)
    if (!sample) return false
    sample.reportAuditStatus = 'pending'
    sample.flowStage = 'qc_platform_done'
    sample.reportAuditTime = ''
    return true
  }

  /**
   * 检查样本是否已完成接诊单提交（用于样本管理判断数据来源）
   */
  const isFromReception = (sourceOrderId: number): boolean => {
    return flowSamples.value.some((s) => s.sourceOrderId === sourceOrderId)
  }

  /**
   * 获取条形码管理可见的流转样本（所有已提交接诊单的样本，不限流程阶段）
   * 每条接诊单提交成功后都会生成对应的条形码
   */
  const getSamplesForBarcode = (): FlowSample[] => {
    return flowSamples.value.filter((s) => s.barcode)
  }

  return {
    flowSamples,
    submitOrder,
    getSamplesForReception,
    getSamplesForSampleManage,
    receiveSample,
    storeSample,
    rejectStoreSample,
    getSamplesForSampleQc,
    completeSampleQc,
    getSamplesForPlatformQc,
    completePlatformQc,
    getSamplesForReport,
    auditReport,
    cancelAudit,
    isFromReception,
    getSamplesForBarcode
  }
})
