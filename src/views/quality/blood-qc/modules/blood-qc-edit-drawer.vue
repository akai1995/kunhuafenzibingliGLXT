<!-- 血液样本质控编辑抽屉 -->
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
          <ElFormItem label="是否离心" prop="isCentrifuged">
            <ElSelect v-model="form.isCentrifuged" placeholder="请选择" style="width: 100%">
              <ElOption label="是" value="是" />
              <ElOption label="否" value="否" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="体积">
            <ElInput v-model="form.volume" placeholder="请输入体积" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="全血体积">
            <ElInput v-model="form.wholeBloodVolume" placeholder="请输入全血体积" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="血浆体积">
            <ElInput v-model="form.plasmaVolume" placeholder="请输入血浆体积" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有无溶血">
            <ElSelect v-model="form.hemolysis" placeholder="请选择" style="width: 100%">
              <ElOption label="有" value="有" />
              <ElOption label="无" value="无" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有无脂血">
            <ElSelect v-model="form.lipidemia" placeholder="请选择" style="width: 100%">
              <ElOption label="有" value="有" />
              <ElOption label="无" value="无" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有无凝血">
            <ElSelect v-model="form.coagulation" placeholder="请选择" style="width: 100%">
              <ElOption label="有" value="有" />
              <ElOption label="无" value="无" />
            </ElSelect>
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
          <ElFormItem label="样本去向">
            <ElSelect v-model="form.sampleDestination" placeholder="请选择" style="width: 100%">
              <ElOption label="检测中" value="检测中" />
              <ElOption label="已入库" value="已入库" />
              <ElOption label="已销毁" value="已销毁" />
              <ElOption label="已转送" value="已转送" />
            </ElSelect>
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

  defineOptions({ name: 'BloodQcEditDrawer' })

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
    bloodDrawTime: '',
    patientName: '',
    sampleNo: '',
    testProject: '',
    isCentrifuged: '',
    volume: '',
    wholeBloodVolume: '',
    plasmaVolume: '',
    hemolysis: '',
    lipidemia: '',
    coagulation: '',
    isQualified: '',
    suggestion: '',
    sampleDestination: '',
    qcOperator: '',
    qcTime: ''
  })

  const formRef = ref<FormInstance>()
  const formRules: FormRules = {
    isCentrifuged: [{ required: true, message: '请选择是否离心', trigger: 'change' }],
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
