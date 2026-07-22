<!-- 查看接诊单详情抽屉 -->
<template>
  <ElDrawer v-model="drawerVisible" title="接诊单详情" size="680px">
    <div class="order-detail">
      <!-- 送检信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:file-list-3-line" class="mr-1.5" />
          送检信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="患者类型">{{ detailData.patientType || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检医院">{{ detailData.hospital || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检科室">{{ detailData.department || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检医生">{{ detailData.doctor || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="优惠类型">{{ detailData.discountType || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="检测项目">{{ detailData.projectName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="项目价格">{{ detailData.projectPrice || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请日期">{{ detailData.applyDate || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="办理人">{{ detailData.handler || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请编码">{{ detailData.applyCode || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="备注" :span="2">{{ detailData.remark || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 个人信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:user-3-line" class="mr-1.5" />
          个人信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="姓名">{{ detailData.patientName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="性别">{{ detailData.gender || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="年龄">{{ detailData.age || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="身份证号">{{ detailData.idCard || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="住院号">{{ detailData.hospitalNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="门诊号">{{ detailData.outpatientNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="籍贯">{{ detailData.nativePlace || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="职业">{{ detailData.occupation || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="民族">{{ detailData.ethnicity || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="联系电话">{{ detailData.phone || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否重点关注">{{ detailData.isFocus ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否需要打印报告">{{ detailData.needPrint ? '是' : '否' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 送检样本及诊断信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:test-tube-line" class="mr-1.5" />
          送检样本及诊断信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="癌种类型">{{ detailData.cancerType || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本类型">{{ detailData.sampleSource || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理号">{{ detailData.pathologyNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理/临床诊断">{{ detailData.pathologyDiagnosis || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理审核医生">{{ detailData.pathologyDoctor || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本编码">{{ detailData.sampleCode || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本采集日期">{{ detailData.sampleCollectDate || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本接收日期">{{ detailData.sampleReceiveDate || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否自带样本">{{ detailData.isSelfSample === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="来源医院">{{ detailData.sourceHospital || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否返还">{{ detailData.isReturn === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本数量">{{ sampleQuantityText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="抽血时间" :span="2">{{ detailData.bloodDrawTime || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 个人史 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:history-line" class="mr-1.5" />
          个人史
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="是否初治">{{ detailData.isFirstTreatment === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="有无吸烟史">{{ smokingHistoryText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="有无饮酒史">{{ detailData.drinkingHistory === 'yes' ? '有' : '无' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="有无燃煤接触史">{{ detailData.coalExposure === 'yes' ? '有' : '无' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="既往患癌史">{{ previousCancerText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="近期化疗史">{{ detailData.recentChemo === 'yes' ? '有' : '无' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否接受过骨髓移植">{{ detailData.boneMarrowTransplant === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="近期是否接受过输血">{{ detailData.recentTransfusion === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="靶向治疗史" :span="2">{{ targetedTherapyText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="慢性病史" :span="2">{{ chronicDiseaseText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="肿瘤家族史" :span="2">{{ familyCancerText }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 样本信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:flask-line" class="mr-1.5" />
          样本信息
        </div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="组织样本">{{ tissueSamplesText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="液体样本">{{ liquidSamplesText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="固体样本">{{ solidSamplesText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否有备用样本">{{ backupText }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 对照样本完整信息 -->
      <div v-if="detailData.hasControl === 'yes'" class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:flask-fill" class="mr-1.5" />
          对照样本信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="是否有对照样本">{{ '是' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否有备用样本">{{ props.detailData.controlHasBackup === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="对照组织样本">{{ controlTissueSamplesText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="对照液体样本">{{ controlLiquidSamplesText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="全血是否配对">{{ props.detailData.controlBloodPaired === 'yes' ? '已配对' : '未配对' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="恶性渗出">{{ controlMalignantEffusionText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="对照固体样本">{{ controlSolidSamplesText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="备用样本类型">{{ controlBackupTypesText }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 家系样本 -->
      <div v-if="detailData.hasFamilyInfo === 'yes'" class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:group-line" class="mr-1.5" />
          家系样本
        </div>
        <div
          v-for="(member, index) in detailData.familyMembers"
          :key="index"
          class="family-member-detail"
        >
          <div class="family-member-title">家系成员 {{ index + 1 }}</div>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="与先证者关系">{{ member.relation || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="姓名">{{ member.name || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="性别">{{ member.gender || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="年龄">{{ member.age || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="出生日期">{{ member.birthDate || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="民族">{{ member.ethnicity || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="婚姻状况">{{ member.marriageStatus || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="疾病诊断">{{ member.diagnosis || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="是否有样本">{{ member.hasSample === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="样本类型">{{ member.sampleType || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="生育情况">{{ member.reproduction || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="备注" :span="2">{{ member.remark || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>
      </div>

      <!-- 申请单质控 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:shield-check-line" class="mr-1.5" />
          申请单质控
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="申请单复核">{{ detailData.reviewResult || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="复核人">{{ detailData.reviewer || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="复核时间">{{ detailData.reviewTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请单质控">{{ detailData.qcResult || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控备注" :span="2">{{ detailData.qcRemark || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="是否修订">{{ detailData.isRevised === 'yes' ? '是' : '否' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="修订人">{{ detailData.reviser || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 状态信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:information-line" class="mr-1.5" />
          状态信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="切片打印">
            <ElTag :type="detailData.slicePrint === '已打印' ? 'success' : 'info'" size="small">
              {{ detailData.slicePrint || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="缴费状态">
            <ElTag :type="paymentStatusType" size="small">{{ detailData.paymentStatus || '-' }}</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="质控状态">
            <ElTag :type="qcStatusType" size="small">{{ detailData.qcStatus || '-' }}</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="报告状态">
            <ElTag :type="reportStatusType" size="small">{{ detailData.reportStatus || '-' }}</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="复制状态">
            <ElTag :type="detailData.copyStatus === '已复制' ? 'success' : 'info'" size="small">
              {{ detailData.copyStatus || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          
        </ElDescriptions>
      </div>
    </div>

    <template v-if="showActions" #footer>
      <div class="dialog-footer">
        <ElButton @click="drawerVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleEdit">编辑</ElButton>
        <ElButton type="success" @click="handleCopy">复制</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  defineOptions({ name: 'OrderViewDrawer' })

  interface Props {
    visible: boolean
    detailData: any
    showActions?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'edit', data: any): void
    (e: 'copy', data: any): void
  }

  const props = withDefaults(defineProps<Props>(), {
    showActions: true
  })
  const emit = defineEmits<Emits>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 样本数量文本
  const sampleQuantityText = computed(() => {
    const parts = []
    if (props.detailData?.sliceCount) parts.push(`${props.detailData.sliceCount}片`)
    if (props.detailData?.tubeCount) parts.push(`${props.detailData.tubeCount}管/块`)
    if (props.detailData?.mlCount) parts.push(`${props.detailData.mlCount}ml`)
    return parts.length > 0 ? parts.join('、') : '-'
  })

  // 吸烟史文本
  const smokingHistoryText = computed(() => {
    if (props.detailData?.smokingHistory === 'yes') {
      return `有${props.detailData.smokingYears ? '，' + props.detailData.smokingYears + '年' : ''}`
    }
    return '无'
  })

  // 既往患癌史文本
  const previousCancerText = computed(() => {
    if (props.detailData?.previousCancer === 'yes') {
      return `有${props.detailData.previousCancerDetail ? '，' + props.detailData.previousCancerDetail : ''}`
    }
    return '无'
  })

  // 靶向治疗史文本
  const targetedTherapyText = computed(() => {
    if (props.detailData?.targetedTherapy === 'yes') {
      const parts = []
      if (props.detailData.targetedMedDuration) parts.push(`用药中${props.detailData.targetedMedDuration}个月`)
      if (props.detailData.targetedStopDuration) parts.push(`停药后${props.detailData.targetedStopDuration}个月`)
      if (props.detailData.targetedDrugName) parts.push(`药物：${props.detailData.targetedDrugName}`)
      return parts.length > 0 ? parts.join('，') : '有'
    }
    return '无'
  })

  // 慢性病史文本
  const chronicDiseaseText = computed(() => {
    if (props.detailData?.chronicDisease === 'yes') {
      const parts = []
      if (props.detailData.chronicDiseaseName) parts.push(`疾病：${props.detailData.chronicDiseaseName}`)
      if (props.detailData.infectiousDisease) parts.push(`传染病史：${props.detailData.infectiousDisease}`)
      return parts.length > 0 ? parts.join('，') : '有'
    }
    return '无'
  })

  // 肿瘤家族史文本
  const familyCancerText = computed(() => {
    if (props.detailData?.familyCancer === 'yes') {
      const parts = []
      if (props.detailData.familyRelation) parts.push(`关系：${props.detailData.familyRelation}`)
      if (props.detailData.familyCancerType) parts.push(`癌种：${props.detailData.familyCancerType}`)
      if (props.detailData.familyMemberName) parts.push(`姓名：${props.detailData.familyMemberName}`)
      if (props.detailData.familyGeneTest) parts.push(`基因检测：${props.detailData.familyGeneTest}`)
      return parts.length > 0 ? parts.join('，') : '有'
    }
    return '无'
  })

  // 组织样本文本
  const tissueSamplesText = computed(() => {
    const map: Record<string, string> = {
      paraffin: '石蜡块/切片',
      thyroid_puncture: '甲状腺穿刺样本',
      fresh_tissue: '新鲜组织',
      cervical_cells: '宫颈脱落细胞',
      cytology: '细胞学'
    }
    const arr = props.detailData?.tissueSamples || []
    return arr.length > 0 ? arr.map((v: string) => map[v] || v).join('、') : '-'
  })

  // 液体样本文本
  const liquidSamplesText = computed(() => {
    const map: Record<string, string> = {
      blood: '全血',
      malignant_effusion: '恶性渗出',
      csf: '脑脊液',
      marrow: '骨髓穿刺液',
      urine: '尿液'
    }
    const arr = props.detailData?.liquidSamples || []
    let text = arr.length > 0 ? arr.map((v: string) => map[v] || v).join('、') : '-'
    if (arr.includes('blood') && props.detailData?.bloodPaired) {
      text += `（${props.detailData.bloodPaired === 'yes' ? '已配对' : '未配对'}）`
    }
    if (arr.includes('malignant_effusion') && props.detailData?.malignantEffusion) {
      const effusionMap: Record<string, string> = { pleural_fluid: '胸水', ascites: '腹水', pericardial: '心包积液' }
      text += `（${effusionMap[props.detailData.malignantEffusion] || props.detailData.malignantEffusion}）`
    }
    return text
  })

  // 固体样本文本
  const solidSamplesText = computed(() => {
    const map: Record<string, string> = { stool: '粪便', other: '其他' }
    const arr = props.detailData?.solidSamples || []
    let text = arr.length > 0 ? arr.map((v: string) => map[v] || v).join('、') : '-'
    if (arr.includes('other') && props.detailData?.solidOtherDetail) {
      text += `（${props.detailData.solidOtherDetail}）`
    }
    return text
  })

  // 备用样本文本
  const backupText = computed(() => {
    if (props.detailData?.hasBackup === 'yes') {
      const map: Record<string, string> = { blood: '全血', pleural_fluid: '胸水', ascites: '腹水' }
      const val = props.detailData?.backupTypes
      return val ? (map[val] || val) : '是'
    }
    return '否'
  })

  // 对照样本文本
  const controlSampleText = computed(() => {
    if (props.detailData?.hasControl === 'yes') {
      const parts = []
      if (props.detailData.controlTissueSamples?.length > 0) parts.push('有组织样本')
      if (props.detailData.controlLiquidSamples?.length > 0) parts.push('有液体样本')
      if (props.detailData.controlSolidSamples?.length > 0) parts.push('有固体样本')
      if (props.detailData.controlHasBackup === 'yes') parts.push('有备用样本')
      return parts.length > 0 ? parts.join('、') : '是'
    }
    return '否'
  })

  // 对照组织样本
  const controlTissueSamplesText = computed(() => {
    const map: Record<string, string> = {
      paraffin: '石蜡块/切片',
      thyroid_puncture: '甲状腺穿刺样本',
      fresh_tissue: '新鲜组织',
      cervical_cells: '宫颈脱落细胞',
      cytology: '细胞学'
    }
    const arr = props.detailData?.controlTissueSamples || []
    return arr.length > 0 ? arr.map((v: string) => map[v] || v).join('、') : '-'
  })

  // 对照液体样本
  const controlLiquidSamplesText = computed(() => {
    const map: Record<string, string> = {
      blood: '全血',
      malignant_effusion: '恶性渗出',
      csf: '脑脊液',
      marrow: '骨髓穿刺液',
      urine: '尿液'
    }
    const arr = props.detailData?.controlLiquidSamples || []
    let text = arr.length > 0 ? arr.map((v: string) => map[v] || v).join('、') : '-'
    if (arr.includes('malignant_effusion') && props.detailData?.controlMalignantEffusion) {
      const effusionMap: Record<string, string> = { pleural_fluid: '胸水', ascites: '腹水', pericardial: '心包积液' }
      text += `（${effusionMap[props.detailData.controlMalignantEffusion] || props.detailData.controlMalignantEffusion}）`
    }
    return text
  })

  // 对照恶性渗出
  const controlMalignantEffusionText = computed(() => {
    if (!props.detailData?.controlMalignantEffusion) return '-'
    const map: Record<string, string> = { pleural_fluid: '胸水', ascites: '腹水', pericardial: '心包积液' }
    return map[props.detailData.controlMalignantEffusion] || props.detailData.controlMalignantEffusion
  })

  // 对照固体样本
  const controlSolidSamplesText = computed(() => {
    const map: Record<string, string> = { stool: '粪便', other: '其他' }
    const arr = props.detailData?.controlSolidSamples || []
    let text = arr.length > 0 ? arr.map((v: string) => map[v] || v).join('、') : '-'
    if (arr.includes('other') && props.detailData?.controlSolidOtherDetail) {
      text += `（${props.detailData.controlSolidOtherDetail}）`
    }
    return text
  })

  // 对照备用样本类型
  const controlBackupTypesText = computed(() => {
    if (props.detailData?.controlHasBackup !== 'yes') return '-'
    const map: Record<string, string> = { blood: '全血', pleural_fluid: '胸水', ascites: '腹水' }
    const val = props.detailData?.controlBackupTypes
    return val ? (map[val] || val) : '-'
  })

  // 状态标签类型
  const paymentStatusType = computed(() => {
    const map: Record<string, string> = { '未缴费': 'danger', '已缴费': 'success', '已退费': 'info', '待结算': 'warning' }
    return (map[props.detailData?.paymentStatus] || 'info') as any
  })
  const qcStatusType = computed(() => {
    const map: Record<string, string> = { '未质控': 'info', '质控中': 'warning', '合格': 'success', '不合格': 'danger' }
    return (map[props.detailData?.qcStatus] || 'info') as any
  })
  const reportStatusType = computed(() => {
    const map: Record<string, string> = { '未书写': 'info', '未上传': 'info', '已上传': '', '未制作': 'warning', '待审核': 'warning', '已审核': 'success' }
    return (map[props.detailData?.reportStatus] || 'info') as any
  })
  

  const handleEdit = () => {
    drawerVisible.value = false
    emit('edit', props.detailData)
  }

  const handleCopy = () => {
    drawerVisible.value = false
    emit('copy', props.detailData)
  }
</script>

<style lang="scss" scoped>
  .order-detail {
    .detail-section {
      margin-bottom: 24px;

      .detail-section-title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }

    .family-member-detail {
      margin-bottom: 16px;

      .family-member-title {
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
</style>
