<!-- 新鲜组织样本质控编辑抽屉 -->
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
          <ElFormItem label="细胞数" prop="cellCount">
            <ElInput v-model="form.cellCount" placeholder="请输入细胞数">
              <template #append>个</template>
            </ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="M0对照孔">
            <ElInput v-model="form.m0ControlWell" placeholder="请输入M0对照孔" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="CV值">
            <ElInput v-model="form.cvValue" placeholder="请输入CV值">
              <template #append>%</template>
            </ElInput>
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
              <ElOption label="重新采集" value="重新采集" />
              <ElOption label="继续检测" value="继续检测" />
              <ElOption label="退回处理" value="退回处理" />
              <ElOption label="作废处理" value="作废处理" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="储存位置">
            <ElInput v-model="form.storageLocation" placeholder="请输入储存位置" />
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

  defineOptions({ name: 'TissueQcEditDrawer' })

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
    patientName: '',
    hospitalNo: '',
    pathologyNo: '',
    testProject: '',
    sampleNo: '',
    cellCount: '',
    m0ControlWell: '',
    cvValue: '',
    isQualified: '',
    suggestion: '',
    sampleDestination: '',
    qcOperator: '',
    qcTime: ''
  })

  const formRef = ref<FormInstance>()
  const formRules: FormRules = {
    cellCount: [{ required: true, message: '请输入细胞数', trigger: 'blur' }],
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
