/** 质控顺序校验工具 */

// 质控类型对应的中文标签
const qcLabelMap: Record<string, string> = {
  nucleicAcid: '核酸质控',
  preLib: '预文库质控',
  finalLib: '终文库质控',
  seq: '上机质控',
  bio: '生信审核',
  library: '文库质控'
}

// 质控类型对应的数据字段
const qcFieldMap: Record<string, string> = {
  nucleicAcid: 'nucleicAcidQc',
  preLib: 'preLibQc',
  finalLib: 'finalLibQc',
  seq: 'seqQc',
  bio: 'bioAnalysisQc',
  library: 'libraryQc',
  machine: 'machineQc',
  bioinfo: 'bioinfoAudit'
}

/**
 * 获取质控顺序
 * @param includePreLib 是否包含预文库质控（NGSR=true, NGSA=false）
 */
export const getQcOrder = (includePreLib: boolean): string[] => {
  const order = ['nucleicAcid', 'finalLib', 'seq', 'bio']
  if (includePreLib) {
    order.splice(1, 0, 'preLib')
  }
  return order
}

/**
 * 校验NGS质控顺序
 */
export const checkQcSequence = (
  qcType: string,
  data: any,
  includePreLib: boolean
): { passed: boolean; message?: string } => {
  const order = getQcOrder(includePreLib)
  const idx = order.indexOf(qcType)

  if (idx <= 0) return { passed: true }

  for (let i = 0; i < idx; i++) {
    const prevKey = order[i]
    const prevField = qcFieldMap[prevKey]
    const prevValue = data?.[prevField]

    if (!prevValue || prevValue === '待质控' || prevValue === '不合格') {
      return { passed: false, message: `请先完成 ${qcLabelMap[prevKey]}` }
    }
  }

  return { passed: true }
}

/**
 * 获取PCR质控顺序
 */
export const getPcrQcOrder = (): string[] => {
  return ['nucleicAcid', 'library', 'machine', 'bioinfo']
}

/**
 * 校验PCR质控顺序
 */
export const checkPcrQcSequence = (
  qcType: string,
  data: any
): { passed: boolean; message?: string } => {
  const order = getPcrQcOrder()
  const idx = order.indexOf(qcType)

  if (idx <= 0) return { passed: true }

  for (let i = 0; i < idx; i++) {
    const prevKey = order[i]
    const prevField = qcFieldMap[prevKey]
    const prevValue = data?.[prevField]

    if (!prevValue || prevValue === '待质控' || prevValue === '不合格') {
      return { passed: false, message: `请先完成 ${qcLabelMap[prevKey]}` }
    }
  }

  return { passed: true }
}
