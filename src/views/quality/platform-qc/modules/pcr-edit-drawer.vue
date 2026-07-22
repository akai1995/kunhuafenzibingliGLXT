<!-- PCR平台质控编辑抽屉 -->
<template>
  <ElDrawer
    v-model="drawerVisible"
    title="编辑质控信息"
    size="600px"
    :close-on-click-modal="true"
  >
    <div class="edit-wrapper">
      <ElForm :model="form" label-width="120px">
        <!-- 基础信息 -->
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="申请编号">
              <ElInput v-model="form.applyCode" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="患者姓名">
              <ElInput v-model="form.patientName" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="样本编号">
              <ElInput v-model="form.sampleNo" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检测项目">
              <ElInput v-model="form.projectName" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="试剂盒号">
              <ElInput v-model="form.kitNo" disabled />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <!-- 质控结果信息 -->
        <ElRow :gutter="16">
          <ElCol v-for="item in qcItems" :key="item.key" :span="12">
            <ElFormItem :label="item.label">
              <QcStatusTag
                :status="(form as any)[item.resultField]"
                clickable
                @click="handleOpenQcDialog(item.key)"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>

    <!-- 质控详情弹窗 -->
    <PcrQcDetailDialog
      v-model:visible="qcDialogVisible"
      :qc-type="activeQcType"
      :form-data="form"
      :readonly="false"
      :project-id="projectId"
      @submit="handleQcSubmit"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import QcStatusTag from './qc-status-tag.vue'
  import PcrQcDetailDialog from './pcr-qc-detail-dialog.vue'
  import { checkPcrQcSequence } from './qc-sequence'

  defineOptions({ name: 'PcrEditDrawer' })

  interface Props {
    visible: boolean
    rowData: any
    subPlatform?: 'pcr10' | 'pcr11'
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = withDefaults(defineProps<Props>(), { subPlatform: 'pcr10' })
  const emit = defineEmits<Emits>()

  const projectId = computed(() => {
    return props.subPlatform === 'pcr10' ? 'project-pcr10' : 'project-pcr11'
  })

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const qcItems = computed(() => {
    return [
      { key: 'nucleicAcid', label: '核酸质控', resultField: 'nucleicAcidQc' },
      { key: 'library', label: '文库质控', resultField: 'libraryQc' },
      { key: 'machine', label: '上机质控', resultField: 'machineQc' },
      { key: 'bioinfo', label: '生信审核', resultField: 'bioinfoAudit' }
    ]
  })

  const qcDialogVisible = ref(false)
  const activeQcType = ref('nucleicAcid')

  const formatNow = () => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const form = reactive({
    id: 0,
    applyCode: '',
    patientName: '',
    sampleNo: '',
    pathologyNo: '',
    projectName: '',
    kitNo: '',
    // 核酸质控
    nucleicAcidQc: '',
    naQcDoctor: '',
    naQcTime: '',
    // DNA
    dnaConc: '',
    dna260280: '',
    dna260230: '',
    dnaVolume: '',
    dnaTotal: '',
    // RNA
    rnaConc: '',
    rna260280: '',
    rna260230: '',
    rnaVolume: '',
    rnaTotal: '',
    // 文库质控
    libraryQc: '',
    libQcDoctor: '',
    libQcTime: '',
    libQubitConc: '',
    libVolume: '',
    libTotalAmount: '',
    libRemark: '',
    // 上机质控
    machineQc: '',
    machineQcDoctor: '',
    machineQcTime: '',
    machineLotNo: '',
    machineClusterDensity: '',
    machineClusterPass: '',
    machineQ30: '',
    machineEffectiveData: '',
    machineRemark: '',
    // 生信审核
    bioinfoAudit: '',
    bioQcDoctor: '',
    bioQcTime: ''
  })

  watch(
    () => props.visible,
    (val) => {
      if (val && props.rowData) {
        Object.assign(form, props.rowData)
        form.applyCode = props.rowData.pathologyNo || props.rowData.applyCode || ''
        activeQcType.value = 'nucleicAcid'
      }
    }
  )

  const handleOpenQcDialog = (key: string) => {
    const { passed, message } = checkPcrQcSequence(key, form)
    if (!passed) {
      ElMessageBox.alert(message!, '提示', { type: 'warning', center: true, confirmButtonText: '确定' })
      return
    }
    activeQcType.value = key
    qcDialogVisible.value = true
  }

  const handleQcSubmit = (data: any) => {
    Object.assign(form, data)
  }

  const handleSubmit = () => {
    emit('submit', { ...form })
    ElMessage.success('质控信息已保存')
    drawerVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .edit-wrapper {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }
</style>