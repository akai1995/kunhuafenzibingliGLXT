<!-- 字段新增/编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <ElFormItem label="字段名称" prop="fieldName">
        <ElInput v-model="formData.fieldName" placeholder="请输入字段名称" />
      </ElFormItem>
      <ElFormItem label="字段类型" prop="fieldType">
        <ElSelect v-model="formData.fieldType" placeholder="请选择字段类型" style="width: 100%">
          <ElOption label="文本" value="文本" />
          <ElOption label="数字" value="数字" />
          <ElOption label="日期" value="日期" />
          <ElOption label="下拉选择" value="下拉选择" />
          <ElOption label="单选" value="单选" />
          <ElOption label="多行文本" value="多行文本" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="是否必填">
        <ElSwitch v-model="formData.required" />
      </ElFormItem>

      <!-- 阈值：数字类型时显示 -->
      <ElFormItem v-if="formData.fieldType === '数字'" label="阈值">
        <div class="threshold-wrapper">
          <ElCheckboxGroup v-model="thresholdOps" class="threshold-ops">
            <ElCheckbox label=">">大于</ElCheckbox>
            <ElCheckbox label="=">等于</ElCheckbox>
            <ElCheckbox label="<">小于</ElCheckbox>
          </ElCheckboxGroup>
          <div v-if="thresholdOps.length > 0" class="threshold-values">
            <div v-for="op in thresholdOps" :key="op" class="threshold-item">
              <span class="threshold-op-label">{{ opLabel(op) }}</span>
              <ElInput v-model="thresholdValMap[op]" placeholder="数值" style="width: 100px" />
            </div>
          </div>
        </div>
      </ElFormItem>

      <ElFormItem v-if="formData.fieldType === '数字'" label="规则说明">
        <ElInput v-model="formData.ruleDescription" placeholder="请输入规则说明" />
      </ElFormItem>

      <ElFormItem label="默认值">
        <ElInput v-model="formData.defaultValue" placeholder="请输入默认值" />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="formData.remark" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { parseThreshold, formatThreshold } from '@/store/modules/qc-template'

  defineOptions({ name: 'FieldEditDialog' })

  interface FieldData {
    id: number
    fieldName: string
    fieldType: string
    required: boolean
    threshold: string
    defaultValue: string
    remark: string
    ruleDescription: string
  }

  interface Props {
    visible: boolean
    mode: 'add' | 'edit'
    fieldData?: FieldData | null
  }

  interface Emits {
    (e: 'update:visible', val: boolean): void
    (e: 'submit', data: FieldData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    fieldData: null
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  const defaultForm = (): FieldData => ({
    id: 0,
    fieldName: '',
    fieldType: '文本',
    required: false,
    threshold: '',
    defaultValue: '',
    remark: '',
    ruleDescription: ''
  })

  const formData = reactive<FieldData>(defaultForm())

  const thresholdOps = ref<string[]>([])
  const thresholdValMap = reactive<Record<string, string>>({ '>': '', '=': '', '<': '' })

  const opLabel = (op: string) => {
    const map: Record<string, string> = { '>': '大于', '<': '小于', '=': '等于' }
    return map[op] || op
  }

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const dialogTitle = computed(() =>
    props.mode === 'add' ? '新增字段' : '编辑字段'
  )

  const formRules: FormRules = {
    fieldName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
    fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.mode === 'edit' && props.fieldData) {
          Object.assign(formData, props.fieldData)
          const config = parseThreshold(props.fieldData.threshold)
          if (config) {
            thresholdOps.value = config.rules.map((r) => r.op)
            config.rules.forEach((r) => {
              thresholdValMap[r.op] = r.val
            })
            // 清除未选中的值
            const allOps = ['>', '=', '<']
            allOps.forEach((op) => {
              if (!thresholdOps.value.includes(op)) thresholdValMap[op] = ''
            })
          } else {
            thresholdOps.value = []
            thresholdValMap['>'] = ''
            thresholdValMap['='] = ''
            thresholdValMap['<'] = ''
          }
        } else {
          Object.assign(formData, defaultForm())
          thresholdOps.value = []
          thresholdValMap['>'] = ''
          thresholdValMap['='] = ''
          thresholdValMap['<'] = ''
        }
        nextTick(() => formRef.value?.clearValidate())
      }
    }
  )

  watch(() => formData.fieldType, (newType) => {
    if (newType !== '数字') {
      thresholdOps.value = []
      thresholdValMap['>'] = ''
      thresholdValMap['='] = ''
      thresholdValMap['<'] = ''
    }
  })

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      const rules = thresholdOps.value
        .filter((op) => thresholdValMap[op].trim())
        .map((op) => ({ op, val: thresholdValMap[op].trim() }))
      formData.threshold = formatThreshold(rules.length > 0 ? { rules } : null)
      emit('submit', { ...formData })
      dialogVisible.value = false
    })
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    Object.assign(formData, defaultForm())
    thresholdOps.value = []
    thresholdValMap['>'] = ''
    thresholdValMap['='] = ''
    thresholdValMap['<'] = ''
  }
</script>

<style lang="scss" scoped>
  .threshold-wrapper {
    width: 100%;
  }

  .threshold-ops {
    margin-bottom: 4px;
  }

  .threshold-values {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .threshold-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .threshold-op-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    min-width: 32px;
  }
</style>