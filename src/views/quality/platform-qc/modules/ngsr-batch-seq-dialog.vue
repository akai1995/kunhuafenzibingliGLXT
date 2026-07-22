<!-- NGSR批量上机弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="批量上机" width="500px">
    <ElForm :model="form" label-width="120px">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="上机批号">
            <ElSelect v-model="form.seqBatchNo" placeholder="请选择" style="width: 100%">
              <ElOption label="B001" value="B001" />
              <ElOption label="B002" value="B002" />
              <ElOption label="B003" value="B003" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="簇密度">
            <ElInput v-model="form.clusterDensity" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="簇通过率">
            <ElInput v-model="form.clusterPassRate" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="Q30">
            <ElInput v-model="form.q30" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有效数据量">
            <ElInput v-model="form.validDataAmount" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="备注">
            <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控医生">
            <ElInput v-model="form.qcDoctor" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控时间">
            <ElDatePicker
              v-model="form.qcTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm"
              placeholder="请选择"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="质控结果">
            <ElSelect v-model="form.qcResult" placeholder="请选择" style="width: 100%">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
            </ElSelect>
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

  defineOptions({ name: 'NgsrBatchSeqDialog' })

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
    seqBatchNo: '',
    clusterDensity: '',
    clusterPassRate: '',
    q30: '',
    validDataAmount: '',
    remark: '',
    qcDoctor: '当前用户',
    qcTime: '',
    qcResult: ''
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        form.seqBatchNo = ''
        form.clusterDensity = ''
        form.clusterPassRate = ''
        form.q30 = ''
        form.validDataAmount = ''
        form.remark = ''
        form.qcDoctor = '当前用户'
        form.qcTime = formatNow()
        form.qcResult = ''
      }
    }
  )

  const handleSubmit = () => {
    emit('submit', { ...form })
    ElMessage.success('批量上机质控已提交')
    dialogVisible.value = false
  }
</script>
