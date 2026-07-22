<!-- 样本登记/编辑抽屉 -->
<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="drawerTitle"
    size="560px"
    :close-on-click-modal="true"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="isView"
    >
      <ElFormItem label="患者姓名" prop="patientName">
        <ElInput v-model="formData.patientName" placeholder="请输入患者姓名" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElRadioGroup v-model="formData.gender">
          <ElRadio value="男">男</ElRadio>
          <ElRadio value="女">女</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="年龄" prop="age">
        <ElInput v-model="formData.age" placeholder="请输入年龄" />
      </ElFormItem>
      <ElFormItem label="身份证号" prop="idCard">
        <ElInput v-model="formData.idCard" placeholder="请输入身份证号" />
      </ElFormItem>
      <ElFormItem label="患者类型" prop="patientType">
        <ElSelect v-model="formData.patientType" placeholder="请选择" style="width: 100%">
          <ElOption label="住院患者" value="住院患者" />
          <ElOption label="门诊患者" value="门诊患者" />
          <ElOption label="体检患者" value="体检患者" />
          <ElOption label="对照样本患者" value="对照样本患者" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="送检医院" prop="hospital">
        <ElSelect v-model="formData.hospital" placeholder="请选择" style="width: 100%">
          <ElOption label="昆华医院" value="昆华医院" />
          <ElOption label="第一人民医院" value="第一人民医院" />
          <ElOption label="肿瘤医院" value="肿瘤医院" />
          <ElOption label="中心医院" value="中心医院" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="送检科室" prop="department">
        <ElSelect v-model="formData.department" placeholder="请选择" style="width: 100%">
          <ElOption label="肿瘤科" value="肿瘤科" />
          <ElOption label="呼吸科" value="呼吸科" />
          <ElOption label="消化科" value="消化科" />
          <ElOption label="血液科" value="血液科" />
          <ElOption label="病理科" value="病理科" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="送检医生" prop="doctor">
        <ElInput v-model="formData.doctor" placeholder="请输入送检医生" />
      </ElFormItem>
      <ElFormItem label="检测项目" prop="projectName">
        <ElInput v-model="formData.projectName" placeholder="请输入检测项目" />
      </ElFormItem>
      <ElFormItem label="样本类型" prop="sampleType">
        <ElSelect v-model="formData.sampleType" placeholder="请选择" style="width: 100%">
          <ElOption label="组织样本" value="组织样本" />
          <ElOption label="血液样本" value="血液样本" />
          <ElOption label="胸水样本" value="胸水样本" />
          <ElOption label="骨髓样本" value="骨髓样本" />
          <ElOption label="尿液样本" value="尿液样本" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="存储位置" prop="storageLocation">
        <ElSelect v-model="formData.storageLocation" placeholder="请选择" style="width: 100%">
          <ElOption label="冰箱A-1层" value="冰箱A-1层" />
          <ElOption label="冰箱A-2层" value="冰箱A-2层" />
          <ElOption label="冰箱B-1层" value="冰箱B-1层" />
          <ElOption label="冰箱B-2层" value="冰箱B-2层" />
          <ElOption label="常温柜C-1层" value="常温柜C-1层" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton v-if="!isView" type="primary" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'SampleFormDrawer' })

  interface Props {
    visible: boolean
    mode: 'add' | 'edit' | 'view'
    editData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', formData: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const isView = computed(() => props.mode === 'view')

  const drawerTitle = computed(() => {
    const map: Record<string, string> = {
      add: '样本登记',
      edit: '编辑样本',
      view: '样本详情'
    }
    return map[props.mode] || '样本'
  })

  const defaultFormData = () => ({
    patientName: '',
    gender: '',
    age: '',
    idCard: '',
    patientType: '',
    hospital: '',
    department: '',
    doctor: '',
    projectName: '',
    sampleType: '',
    storageLocation: ''
  })

  const formData = reactive(defaultFormData())

  const rules: FormRules = {
    patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
    idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
    patientType: [{ required: true, message: '请选择患者类型', trigger: 'change' }],
    hospital: [{ required: true, message: '请选择送检医院', trigger: 'change' }],
    department: [{ required: true, message: '请选择送检科室', trigger: 'change' }],
    doctor: [{ required: true, message: '请输入送检医生', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入检测项目', trigger: 'blur' }],
    sampleType: [{ required: true, message: '请选择样本类型', trigger: 'change' }],
    storageLocation: [
      { required: true, message: '请选择存储位置', trigger: 'change' }
    ]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.mode === 'add') {
          Object.assign(formData, defaultFormData())
        } else if (props.editData) {
          Object.assign(formData, {
            patientName: props.editData.patientName || '',
            gender: props.editData.gender || '',
            age: props.editData.age || '',
            idCard: props.editData.idCard || '',
            patientType: props.editData.patientType || '',
            hospital: props.editData.hospital || '',
            department: props.editData.department || '',
            doctor: props.editData.doctor || '',
            projectName: props.editData.projectName || '',
            sampleType: props.editData.sampleType || '',
            storageLocation: props.editData.storageLocation || ''
          })
        }
        formRef.value?.clearValidate()
      } else {
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('submit', { ...formData })
        drawerVisible.value = false
      }
    })
  }
</script>

<style lang="scss" scoped>
  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
