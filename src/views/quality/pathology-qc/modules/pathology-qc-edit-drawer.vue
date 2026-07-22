<!-- 病理/组织质控编辑抽屉 -->
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
          <ElFormItem label="蜡块号" prop="paraffinBlockNo">
            <ElInput v-model="form.paraffinBlockNo" placeholder="请输入蜡块号" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="肿瘤细胞数量">
            <ElSelect v-model="form.tumorCellCount" placeholder="请选择" style="width: 100%">
              <ElOption label="充足" value="充足" />
              <ElOption label="中等" value="中等" />
              <ElOption label="少量" value="少量" />
              <ElOption label="极少" value="极少" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="肿瘤细胞比例">
            <ElInput v-model="form.tumorCellRatio" placeholder="请输入比例">
              <template #append>%</template>
            </ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="样本大小">
            <ElSelect v-model="form.sampleSize" placeholder="请选择" style="width: 100%">
              <ElOption label="大" value="大" />
              <ElOption label="中" value="中" />
              <ElOption label="小" value="小" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有无坏死">
            <ElInput v-model="form.necrosis" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有无出血">
            <ElInput v-model="form.hemorrhage" placeholder="请输入" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="样本种类">
            <ElInput v-model="form.sampleCategory" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控结果">
            <ElSelect v-model="form.isQualified" placeholder="请选择" style="width: 100%">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="处理意见">
            <ElSelect v-model="form.suggestion" placeholder="请选择" style="width: 100%">
              <ElOption label="重新切片" value="重新切片" />
              <ElOption label="补充取材" value="补充取材" />
              <ElOption label="退回重做" value="退回重做" />
              <ElOption label="继续检测" value="继续检测" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="重借病理号">
            <ElInput v-model="form.reBorrowPathologyNo" placeholder="请输入重借病理号" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控人">
            <ElInput v-model="form.qcOperator" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控时间" prop="qcTime">
            <ElDatePicker
              v-model="form.qcTime"
              type="datetime"
              placeholder="请选择质控时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'PathologyQcEditDrawer' })

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

  const userStore = useUserStore()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const getNowTime = () => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const form = reactive({
    id: 0,
    sampleNo: '',
    applyTime: '',
    patientName: '',
    paraffinBlockNo: '',
    testProject: '',
    qcTime: '',
    qcOperator: '',
    tumorCellCount: '',
    tumorCellRatio: '',
    sampleSize: '',
    necrosis: '',
    hemorrhage: '',
    sampleCategory: '',
    isQualified: '',
    suggestion: '',
    reBorrowPathologyNo: ''
  })

  const formRef = ref<FormInstance>()
  const formRules: FormRules = {
    paraffinBlockNo: [{ required: true, message: '请输入蜡块号', trigger: 'blur' }],
    qcTime: [{ required: true, message: '请选择质控时间', trigger: 'change' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val && props.rowData) {
        Object.assign(form, props.rowData)
        form.qcTime = getNowTime()
        form.qcOperator = userStore.getUserInfo.userName || '当前用户'
      }
    }
  )

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
