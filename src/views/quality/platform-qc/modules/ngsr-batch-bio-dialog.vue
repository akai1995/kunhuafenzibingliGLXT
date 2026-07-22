<!-- NGSR批量生信弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="批量生信" width="400px">
    <ElForm :model="form" label-width="120px">
      <ElFormItem label="质控医生">
        <ElInput v-model="form.qcDoctor" disabled />
      </ElFormItem>
      <ElFormItem label="质控时间">
        <ElDatePicker
          v-model="form.qcTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          placeholder="请选择"
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="质控结果">
        <ElSelect v-model="form.qcResult" placeholder="请选择" style="width: 100%">
          <ElOption label="合格" value="合格" />
          <ElOption label="不合格" value="不合格" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'NgsrBatchBioDialog' })

  interface Props {
    visible: boolean
    rows: any[]
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
    qcDoctor: '当前用户',
    qcTime: '',
    qcResult: ''
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        form.qcDoctor = '当前用户'
        form.qcTime = formatNow()
        form.qcResult = ''
      }
    }
  )

  const handleSubmit = () => {
    emit('submit', { ...form })
    ElMessage.success('批量生信质控已提交')
    dialogVisible.value = false
  }
</script>
