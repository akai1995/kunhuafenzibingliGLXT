<!-- PCR核酸质控弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="核酸质控"
    width="640px"
    :close-on-click-modal="true"
  >
    <ElForm :model="form" label-width="120px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="质控医生">
            <ElInput v-model="form.qcDoctor" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控时间">
            <ElInput v-model="form.qcTime" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控结果">
            <ElSelect v-model="form.qcResult" placeholder="请选择" style="width: 100%">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- DNA主要质控 -->
      <div class="qc-section-title">DNA主要质控</div>
      <ElRow :gutter="16">
        <ElCol :span="8">
          <ElFormItem label="浓度">
            <ElInput v-model="form.dnaConc" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="260/280">
            <ElInput v-model="form.dna260280" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="260/230">
            <ElInput v-model="form.dna260230" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="体积">
            <ElInput v-model="form.dnaVolume" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="总量">
            <ElInput v-model="form.dnaTotal" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- RNA主要质控 -->
      <div class="qc-section-title">RNA主要质控</div>
      <ElRow :gutter="16">
        <ElCol :span="8">
          <ElFormItem label="浓度">
            <ElInput v-model="form.rnaConc" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="260/280">
            <ElInput v-model="form.rna260280" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="260/230">
            <ElInput v-model="form.rna260230" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="体积">
            <ElInput v-model="form.rnaVolume" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="总量">
            <ElInput v-model="form.rnaTotal" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'PcrNaDialog' })

  interface Props {
    visible: boolean
    rowData: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

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
    qcDoctor: '当前用户',
    qcTime: '',
    qcResult: '',
    dnaConc: '',
    dna260280: '',
    dna260230: '',
    dnaVolume: '',
    dnaTotal: '',
    rnaConc: '',
    rna260280: '',
    rna260230: '',
    rnaVolume: '',
    rnaTotal: ''
  })

  watch(
    () => props.visible,
    (val) => {
      if (val && props.rowData) {
        Object.assign(form, {
          id: props.rowData.id || 0,
          applyCode: props.rowData.applyCode || props.rowData.sampleNo || '',
          patientName: props.rowData.patientName || '',
          sampleNo: props.rowData.sampleNo || '',
          qcDoctor: '当前用户',
          qcTime: formatNow(),
          qcResult: props.rowData.nucleicAcidQc === '待质控' ? '' : props.rowData.nucleicAcidQc || '',
          dnaConc: props.rowData.dnaConc || '',
          dna260280: props.rowData.dna260280 || '',
          dna260230: props.rowData.dna260230 || '',
          dnaVolume: props.rowData.dnaVolume || '',
          dnaTotal: props.rowData.dnaTotal || '',
          rnaConc: props.rowData.rnaConc || '',
          rna260280: props.rowData.rna260280 || '',
          rna260230: props.rowData.rna260230 || '',
          rnaVolume: props.rowData.rnaVolume || '',
          rnaTotal: props.rowData.rnaTotal || ''
        })
      }
    }
  )

  const handleSubmit = () => {
    emit('submit', { ...form })
    ElMessage.success('核酸质控已保存')
    dialogVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .qc-section-title {
    margin: 16px 0 12px;
    padding-left: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }
</style>
