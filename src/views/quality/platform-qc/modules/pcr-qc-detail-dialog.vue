<!-- PCR质控详情弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <ElForm :model="form" label-width="120px" class="qc-detail-form">
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

        <!-- 基本信息字段 -->
        <template v-for="field in groupedFields.general" :key="field.id">
          <ElCol :span="field.fieldName.includes('备注') || field.fieldType === '多行文本' ? 24 : 12">
            <ElFormItem :label="field.fieldName" :required="field.required">
              <ElInput
                v-if="field.fieldType === '文本' || field.fieldType === '数字'"
                v-model="form[fieldPropKey(field)]"
                :disabled="readonly"
                :placeholder="field.defaultValue || '请输入'"
              />
              <ElDatePicker
                v-else-if="field.fieldType === '日期'"
                v-model="form[fieldPropKey(field)]"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="请选择"
                :disabled="readonly"
                style="width: 100%"
              />
              <ElSelect
                v-else-if="field.fieldType === '下拉选择'"
                v-model="form[fieldPropKey(field)]"
                :disabled="readonly"
                placeholder="请选择"
                style="width: 100%"
              >
                <ElOption
                  v-for="opt in getFieldOptions(field)"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </ElSelect>
              <ElRadioGroup
                v-else-if="field.fieldType === '单选'"
                v-model="form[fieldPropKey(field)]"
                :disabled="readonly"
              >
                <ElRadio
                  v-for="opt in getFieldOptions(field)"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </ElRadio>
              </ElRadioGroup>
              <ElInput
                v-else-if="field.fieldType === '多行文本'"
                v-model="form[fieldPropKey(field)]"
                type="textarea"
                :rows="3"
                :disabled="readonly"
                :placeholder="field.defaultValue || '请输入'"
              />
              <ElInput
                v-else
                v-model="form[fieldPropKey(field)]"
                :disabled="readonly"
                :placeholder="field.defaultValue || '请输入'"
              />
            </ElFormItem>
          </ElCol>
        </template>

        <!-- DNA主要质控 -->
        <template v-if="groupedFields.dna.length > 0">
          <ElCol :span="24">
            <div class="section-title">DNA主要质控</div>
          </ElCol>
          <template v-for="field in groupedFields.dna" :key="field.id">
            <ElCol :span="field.fieldName.includes('备注') || field.fieldType === '多行文本' ? 24 : 12">
              <ElFormItem :label="field.fieldName" :required="field.required">
                <ElInput
                  v-if="field.fieldType === '文本' || field.fieldType === '数字'"
                  v-model="form[fieldPropKey(field)]"
                  :disabled="readonly"
                  :placeholder="field.defaultValue || '请输入'"
                />
                <ElDatePicker
                  v-else-if="field.fieldType === '日期'"
                  v-model="form[fieldPropKey(field)]"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  placeholder="请选择"
                  :disabled="readonly"
                  style="width: 100%"
                />
                <ElSelect
                  v-else-if="field.fieldType === '下拉选择'"
                  v-model="form[fieldPropKey(field)]"
                  :disabled="readonly"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="opt in getFieldOptions(field)"
                    :key="opt"
                    :label="opt"
                    :value="opt"
                  />
                </ElSelect>
                <ElInput
                  v-else
                  v-model="form[fieldPropKey(field)]"
                  :disabled="readonly"
                  :placeholder="field.defaultValue || '请输入'"
                />
              </ElFormItem>
            </ElCol>
          </template>
        </template>

        <!-- RNA主要质控 -->
        <template v-if="groupedFields.rna.length > 0">
          <ElCol :span="24">
            <div class="section-title">RNA主要质控</div>
          </ElCol>
          <template v-for="field in groupedFields.rna" :key="field.id">
            <ElCol :span="field.fieldName.includes('备注') || field.fieldType === '多行文本' ? 24 : 12">
              <ElFormItem :label="field.fieldName" :required="field.required">
                <ElInput
                  v-if="field.fieldType === '文本' || field.fieldType === '数字'"
                  v-model="form[fieldPropKey(field)]"
                  :disabled="readonly"
                  :placeholder="field.defaultValue || '请输入'"
                />
                <ElDatePicker
                  v-else-if="field.fieldType === '日期'"
                  v-model="form[fieldPropKey(field)]"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  placeholder="请选择"
                  :disabled="readonly"
                  style="width: 100%"
                />
                <ElSelect
                  v-else-if="field.fieldType === '下拉选择'"
                  v-model="form[fieldPropKey(field)]"
                  :disabled="readonly"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="opt in getFieldOptions(field)"
                    :key="opt"
                    :label="opt"
                    :value="opt"
                  />
                </ElSelect>
                <ElInput
                  v-else
                  v-model="form[fieldPropKey(field)]"
                  :disabled="readonly"
                  :placeholder="field.defaultValue || '请输入'"
                />
              </ElFormItem>
            </ElCol>
          </template>
        </template>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">{{ readonly ? '关闭' : '取消' }}</ElButton>
      <ElButton v-if="!readonly" type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useQcTemplateStore, type QcField, checkThreshold } from '@/store/modules/qc-template'

  defineOptions({ name: 'PcrQcDetailDialog' })

  interface Props {
    visible: boolean
    qcType: string
    formData: any
    readonly?: boolean
    projectId?: string
  }

  interface Emits {
    (e: 'update:visible', val: boolean): void
    (e: 'submit', data: any): void
  }

  const props = withDefaults(defineProps<Props>(), { readonly: false, projectId: '' })
  const emit = defineEmits<Emits>()

  const qcTemplateStore = useQcTemplateStore()

  const qcTypeToCategoryName: Record<string, string> = {
    nucleicAcid: '核酸质控',
    library: '文库质控',
    machine: '上机质控',
    bioinfo: '生信审核'
  }

  const resultFieldMap: Record<string, string> = {
    nucleicAcid: 'nucleicAcidQc',
    library: 'libraryQc',
    machine: 'machineQc',
    bioinfo: 'bioinfoAudit'
  }

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const dialogTitle = computed(() => {
    const label = qcTypeToCategoryName[props.qcType] || '质控'
    return props.readonly ? `${label}详情` : `编辑${label}`
  })

  const resultField = computed(() => resultFieldMap[props.qcType] || 'libraryQc')

  const dynamicFields = computed(() => {
    const categoryName = qcTypeToCategoryName[props.qcType]
    if (!props.projectId || !categoryName) return []
    return qcTemplateStore.getFieldsByCategory(props.projectId, categoryName)
  })

  const groupedFields = computed(() => {
    const general: QcField[] = []
    const dna: QcField[] = []
    const rna: QcField[] = []
    for (const field of dynamicFields.value) {
      const name = field.fieldName
      if (name.startsWith('DNA')) {
        dna.push(field)
      } else if (name.startsWith('RNA')) {
        rna.push(field)
      } else {
        general.push(field)
      }
    }
    return { general, dna, rna }
  })

  const fieldPropKey = (field: QcField) => {
    return `qc_field_${field.id}`
  }

  const getFieldOptions = (field: QcField): string[] => {
    if (field.fieldName === '质控结果') return ['合格', '不合格']
    if (field.defaultValue) {
      return field.defaultValue.split('/').map((s) => s.trim()).filter(Boolean)
    }
    return []
  }

  const form = reactive<any>({})

  watch(
    () => props.visible,
    (val) => {
      if (val && props.formData) {
        Object.assign(form, props.formData)
        dynamicFields.value.forEach((field) => {
          const key = fieldPropKey(field)
          if (!form[key] && field.fieldName === '质控时间') {
            form[key] = formatNow()
          }
          if (!form[key] && field.fieldName === '质控医生') {
            form[key] = '当前用户'
          }
          if (!form[key] && field.defaultValue && field.fieldType !== '下拉选择') {
            form[key] = field.defaultValue
          }
        })
      }
    }
  )

  const formatNow = () => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const handleSubmit = () => {
    // 阈值校验：检查所有数字字段是否在阈值范围内
    let allPassed = true
    for (const field of dynamicFields.value) {
      if (field.fieldType === '数字' && field.threshold) {
        const key = fieldPropKey(field)
        const value = form[key]
        if (value !== undefined && value !== '' && !checkThreshold(field.threshold, value)) {
          allPassed = false
          break
        }
      }
    }
    // 如果任意字段不满足阈值，自动设置质控结果为不合格
    if (!allPassed) {
      const resultFieldKey = dynamicFields.value.find((f) => f.fieldName === '质控结果')
      if (resultFieldKey) {
        form[fieldPropKey(resultFieldKey)] = '不合格'
      }
    }
    emit('submit', { ...form })
    dialogVisible.value = false
  }

  const handleClosed = () => {
    Object.keys(form).forEach((k) => delete form[k])
  }
</script>

<style lang="scss" scoped>
  .qc-detail-form {
    :deep(.el-form-item__label) {
      white-space: nowrap;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    padding: 12px 0 8px;
    margin-bottom: 4px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
</style>