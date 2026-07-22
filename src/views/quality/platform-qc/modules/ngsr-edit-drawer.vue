<!-- NGSR质控编辑抽屉 -->
<template>
  <ElDrawer
    v-model="drawerVisible"
    title="编辑质控信息"
    size="600px"
    :close-on-click-modal="true"
  >
    <div class="edit-wrapper">
      <ElForm :model="form" label-width="120px" :rules="formRules">
        <!-- 基础信息 -->
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="患者姓名">
              <ElInput v-model="form.patientName" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="样本编号">
              <ElInput v-model="form.sampleNo" placeholder="请输入样本编号" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="病理号">
              <ElInput v-model="form.pathologyNo" disabled />
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
          <ElCol :span="12">
            <ElFormItem label="质控医生">
              <ElInput v-model="form.qcDoctor" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="质控时间" prop="qcTime">
              <ElDatePicker
                v-model="form.qcTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="请选择"
                style="width: 100%"
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
    <NgsrQcDetailDialog
      v-model:visible="qcDialogVisible"
      :qc-type="activeQcType"
      :form-data="form"
      :readonly="false"
      @submit="handleQcSubmit"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import QcStatusTag from './qc-status-tag.vue'
  import NgsrQcDetailDialog from './ngsr-qc-detail-dialog.vue'
  import { checkQcSequence } from './qc-sequence'

  defineOptions({ name: 'NgsrEditDrawer' })

  interface Props {
    visible: boolean
    rowData: any
    qcType: string
    showPreLib?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = withDefaults(defineProps<Props>(), {
    showPreLib: true
  })
  const emit = defineEmits<Emits>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const qcItems = computed(() => {
    const items = [
      { key: 'nucleicAcid', label: '核酸质控', resultField: 'nucleicAcidQc' },
      { key: 'finalLib', label: '终文库质控', resultField: 'finalLibQc' },
      { key: 'seq', label: '上机质控', resultField: 'seqQc' },
      { key: 'bio', label: '生信审核', resultField: 'bioAnalysisQc' }
    ]
    if (props.showPreLib) {
      items.splice(1, 0, { key: 'preLib', label: '预文库质控', resultField: 'preLibQc' })
    }
    return items
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
    qcDoctor: '当前用户',
    qcTime: '',
    nucleicAcidQc: '',
    naQubitConc: '',
    naVolume: '',
    naTotalAmount: '',
    preLibQc: '',
    plQubitConc: '',
    plVolume: '',
    plTotalAmount: '',
    finalLibQc: '',
    flIndexSet: '',
    flIndexWell: '',
    flQubitConc: '',
    flFragment: '',
    flFragmentSize: '',
    flRemark: '',
    seqQc: '',
    seqBatchNo: '',
    seqClusterDensity: '',
    seqClusterPassRate: '',
    seqQ30: '',
    seqValidData: '',
    seqRemark: '',
    bioAnalysisQc: ''
  })

  const formRef = ref<FormInstance>()
  const formRules: FormRules = {
    qcTime: [{ required: true, message: '请选择质控时间', trigger: 'change' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val && props.rowData) {
        Object.assign(form, props.rowData)
        form.applyCode = props.rowData.pathologyNo || props.rowData.applyCode || ''
        form.qcDoctor = '当前用户'
        if (!form.qcTime) form.qcTime = formatNow()
        activeQcType.value = props.qcType || 'nucleicAcid'
      }
    }
  )

  const handleOpenQcDialog = (key: string) => {
    const { passed, message } = checkQcSequence(key, form, props.showPreLib)
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

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('submit', { ...form })
        ElMessage.success('质控信息已保存')
        drawerVisible.value = false
      }
    })
  }
</script>

<style lang="scss" scoped>
  .edit-wrapper {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }
</style>
