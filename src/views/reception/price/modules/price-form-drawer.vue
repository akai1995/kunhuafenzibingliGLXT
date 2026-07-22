<!-- 新增/编辑/查看/项目变更 抽屉 -->
<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="drawerTitle"
    size="560px"
    :close-on-click-modal="true"
  >
    <ElForm
      ref="formRef"
      :key="props.mode"
      :model="formData"
      :rules="rules"
      label-width="130px"
      :disabled="isView"
    >
      <ElFormItem label="项目分类" prop="category">
        <ElSelect
          v-model="formData.category"
          placeholder="请选择项目分类"
          style="width: 100%"
        >
          <ElOption
            v-for="item in categoryOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="项目编码" prop="projectCode">
        <ElInput v-model="formData.projectCode" placeholder="请输入项目编码" />
      </ElFormItem>
      <ElFormItem label="项目名称" prop="projectName">
        <ElInput v-model="formData.projectName" placeholder="请输入项目名称" />
      </ElFormItem>
      <ElFormItem label="金额(元)" prop="amount">
        <ElInputNumber
          v-model="formData.amount"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="分组" prop="group">
        <ElSelect v-model="formData.group" placeholder="请选择分组" style="width: 100%">
          <ElOption
            v-for="item in groupOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="报告通知类型" prop="notifyDays">
        <ElInputNumber v-model="formData.notifyDays" :min="1" style="width: 200px" />
        <span class="ml-2">个工作日</span>
      </ElFormItem>
      <ElFormItem label="项目负责人" prop="projectLeader">
        <ElSelect
          v-model="formData.projectLeader"
          placeholder="请选择项目负责人"
          style="width: 100%"
        >
          <ElOption
            v-for="item in leaderOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="项目审核人" prop="auditor">
        <ElSelect
          v-model="formData.auditor"
          placeholder="请选择项目审核人"
          style="width: 100%"
        >
          <ElOption
            v-for="item in auditorOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="血液/组织类型" prop="sampleType">
        <ElRadioGroup v-model="formData.sampleType">
          <ElRadio v-for="item in sampleTypeOptions" :key="item" :value="item">
            {{ item }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="核酸提取类型" prop="extractionType">
        <ElRadioGroup v-model="formData.extractionType">
          <ElRadio v-for="item in extractionTypeOptions" :key="item" :value="item">
            {{ item }}
          </ElRadio>
        </ElRadioGroup>
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

  defineOptions({ name: 'PriceFormDrawer' })

  interface Props {
    visible: boolean
    mode: 'add' | 'edit' | 'view' | 'change'
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
      add: '新增项目',
      edit: '编辑项目',
      view: '查看项目',
      change: '项目变更'
    }
    return map[props.mode] || '项目'
  })

  const defaultFormData = () => ({
    category: '',
    projectCode: '',
    projectName: '',
    amount: 0,
    group: '',
    notifyDays: 3,
    projectLeader: '',
    auditor: '',
    sampleType: '',
    extractionType: ''
  })

  const formData = reactive(defaultFormData())

  const categoryOptions = [
    '基因突变检测',
    '基因扩增检测',
    '融合基因检测',
    '高通量测序',
    '甲基化检测'
  ]

  const groupOptions = ['靶向用药', '辅助诊断', '综合检测', '化疗用药']

  const leaderOptions = ['陈医生', '杨医生', '黄医生', '张医生', '李医生']

  const auditorOptions = ['刘主任', '王主任', '赵主任']

  const sampleTypeOptions = [
    '无',
    '血液+组织/组织',
    '组织+血液',
    '组织',
    '组织+血液/血液',
    '血液',
    '血液/组织'
  ]

  const extractionTypeOptions = ['DNA', 'RNA', 'DNA+RNA']

  const rules: FormRules = {
    category: [{ required: true, message: '请选择项目分类', trigger: 'change' }],
    projectCode: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
    group: [{ required: true, message: '请选择分组', trigger: 'change' }],
    projectLeader: [
      { required: true, message: '请选择项目负责人', trigger: 'change' }
    ],
    auditor: [{ required: true, message: '请选择项目审核人', trigger: 'change' }],
    extractionType: [
      { required: true, message: '请选择核酸提取类型', trigger: 'change' }
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
            category: props.editData.category || '',
            projectCode: props.editData.projectCode || '',
            projectName: props.editData.projectName || '',
            amount: props.editData.amount || 0,
            group: props.editData.group || '',
            notifyDays: props.editData.notifyDays || 3,
            projectLeader: props.editData.projectLeader || '',
            auditor: props.editData.auditor || '',
            sampleType: props.editData.sampleType || '',
            extractionType: props.editData.extractionType || ''
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
