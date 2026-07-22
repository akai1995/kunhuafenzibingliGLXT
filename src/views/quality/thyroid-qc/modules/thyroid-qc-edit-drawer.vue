<!-- 甲状腺穿刺液质控编辑抽屉 -->
<template>
  <ElDrawer v-model="drawerVisible" title="编辑质控信息" size="600px">
    <ElForm :model="form" label-width="120px" ref="formRef" :rules="formRules">
      <ElRow :gutter="16">
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
        <ElCol :span="24">
          <ElFormItem label="检测项目">
            <ElInput v-model="form.testProject" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="穿刺液体积" prop="punctureVolume">
            <ElInput v-model="form.punctureVolume" placeholder="请输入穿刺液体积" />
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
        <ElCol :span="12">
          <ElFormItem label="处理意见">
            <ElSelect v-model="form.suggestion" placeholder="请选择" style="width: 100%">
              <ElOption label="重新采集" value="重新采集" />
              <ElOption label="继续检测" value="继续检测" />
              <ElOption label="退回" value="退回" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="样本去向">
            <ElSelect v-model="form.sampleDestination" placeholder="请选择" style="width: 100%">
              <ElOption label="检测中" value="检测中" />
              <ElOption label="已废弃" value="已废弃" />
              <ElOption label="已退回" value="已退回" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确认修改</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'ThyroidQcEditDrawer' })

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

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const form = reactive({
    patientName: '',
    sampleNo: '',
    testProject: '',
    punctureVolume: '',
    qcResult: '',
    suggestion: '',
    sampleDestination: '检测中'
  })

  const formRules: FormRules = {
    punctureVolume: [{ required: true, message: '请输入穿刺液体积', trigger: 'blur' }]
  }

  watch(
    () => props.rowData,
    (val) => {
      if (val) {
        form.patientName = val.patientName || ''
        form.sampleNo = val.sampleNo || ''
        form.testProject = val.testProject || ''
        form.punctureVolume = val.punctureVolume || ''
        form.qcResult = val.qcResult || ''
        form.suggestion = val.suggestion || ''
        form.sampleDestination = val.sampleDestination || '检测中'
      }
    },
    { immediate: true }
  )

  const handleSubmit = () => {
    formRef.value?.validate((valid) => {
      if (valid) {
        emit('submit', { ...form })
        drawerVisible.value = false
        ElMessage.success('质控信息修改成功')
      }
    })
  }
</script>