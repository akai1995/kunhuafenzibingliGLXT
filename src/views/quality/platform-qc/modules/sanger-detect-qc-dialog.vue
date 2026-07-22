<!-- 一代测序检测质控编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="检测质控"
    width="550px"
    :close-on-click-modal="false"
  >
    <ElForm :model="form" label-width="100px" ref="formRef" :rules="formRules">
      <ElFormItem label="患者姓名">
        <ElInput :model-value="form.patientName" disabled />
      </ElFormItem>
      <ElFormItem label="样本编号">
        <ElInput :model-value="form.sampleNo" disabled />
      </ElFormItem>
      <ElFormItem label="上机批号" prop="batchNo">
        <ElInput v-model="form.batchNo" placeholder="请输入上机批号" />
      </ElFormItem>
      <ElFormItem label="阴控" prop="negativeControl">
        <ElSelect v-model="form.negativeControl" placeholder="请选择" style="width: 100%">
          <ElOption label="在控" value="在控" />
          <ElOption label="失控" value="失控" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="阳控" prop="positiveControl">
        <ElSelect v-model="form.positiveControl" placeholder="请选择" style="width: 100%">
          <ElOption label="在控" value="在控" />
          <ElOption label="失控" value="失控" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="Blank质控" prop="blankControl">
        <ElSelect v-model="form.blankControl" placeholder="请选择" style="width: 100%">
          <ElOption label="在控" value="在控" />
          <ElOption label="失控" value="失控" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="质控结果" prop="qcResult">
        <ElSelect v-model="form.qcResult" placeholder="请选择" style="width: 100%">
          <ElOption label="合格" value="合格" />
          <ElOption label="不合格" value="不合格" />
          <ElOption label="风险上机" value="风险上机" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="质控医生">
        <ElInput :model-value="form.qcDoctor" disabled />
      </ElFormItem>
      <ElFormItem label="质控时间">
        <ElInput :model-value="form.qcTime" disabled />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确认</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'SangerDetectQcDialog' })

  interface Props {
    visible: boolean
    rowData?: any
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

  const formRef = ref<FormInstance>()
  const form = reactive({
    patientName: '',
    sampleNo: '',
    batchNo: '',
    negativeControl: '',
    positiveControl: '',
    blankControl: '',
    qcResult: '',
    qcDoctor: '当前用户',
    qcTime: ''
  })

  const formRules: FormRules = {
    negativeControl: [{ required: true, message: '请选择阴控', trigger: 'change' }],
    positiveControl: [{ required: true, message: '请选择阳控', trigger: 'change' }],
    blankControl: [{ required: true, message: '请选择Blank质控', trigger: 'change' }],
    qcResult: [{ required: true, message: '请选择质控结果', trigger: 'change' }]
  }

  watch(
    () => props.rowData,
    (val) => {
      if (val) {
        form.patientName = val.patientName || ''
        form.sampleNo = val.sampleNo || ''
        form.batchNo = val.detectBatchNo || ''
        form.negativeControl = val.detectNegativeControl || ''
        form.positiveControl = val.detectPositiveControl || ''
        form.blankControl = val.detectBlankControl || ''
        form.qcResult = val.detectQc || ''
        form.qcDoctor = '当前用户'
        form.qcTime = new Date().toLocaleString('zh-CN', { hour12: false })
      }
    },
    { immediate: true }
  )

  const handleSubmit = () => {
    formRef.value?.validate((valid) => {
      if (valid) {
        emit('submit', { ...form })
        dialogVisible.value = false
        ElMessage.success('检测质控保存成功')
      }
    })
  }
</script>