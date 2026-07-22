<!-- 质控详情弹窗（编辑/查看共用） -->
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

        <!-- 核酸质控专属字段 -->
        <template v-if="qcType === 'nucleicAcid'">
          <ElCol :span="12">
            <ElFormItem label="Qubit浓度(ng/vl)">
              <ElInput v-model="form.naQubitConc" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="体积(vl)">
              <ElInput v-model="form.naVolume" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="总量ng">
              <ElInput v-model="form.naTotalAmount" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
        </template>

        <!-- 预文库质控专属字段 -->
        <template v-if="qcType === 'preLib'">
          <ElCol :span="12">
            <ElFormItem label="Qubit浓度(ng/vl)">
              <ElInput v-model="form.plQubitConc" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="体积(vl)">
              <ElInput v-model="form.plVolume" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="总量ng">
              <ElInput v-model="form.plTotalAmount" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
        </template>

        <!-- 终文库质控专属字段 -->
        <template v-if="qcType === 'finalLib'">
          <ElCol :span="12">
            <ElFormItem label="Index_Set">
              <ElSelect v-model="form.flIndexSet" :disabled="readonly" placeholder="请选择" style="width: 100%">
                <ElOption label="Set1" value="Set1" />
                <ElOption label="Set2" value="Set2" />
                <ElOption label="Set3" value="Set3" />
                <ElOption label="Set4" value="Set4" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Index_Well">
              <ElSelect v-model="form.flIndexWell" :disabled="readonly" placeholder="请选择" style="width: 100%">
                <ElOption label="A01" value="A01" />
                <ElOption label="A02" value="A02" />
                <ElOption label="B01" value="B01" />
                <ElOption label="B02" value="B02" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Qubit浓度(ng/vl)">
              <ElInput v-model="form.flQubitConc" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="片段">
              <ElInput v-model="form.flFragment" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="片段大小">
              <ElSelect v-model="form.flFragmentSize" :disabled="readonly" placeholder="请选择" style="width: 100%">
                <ElOption label="150bp" value="150bp" />
                <ElOption label="200bp" value="200bp" />
                <ElOption label="250bp" value="250bp" />
                <ElOption label="300bp" value="300bp" />
                <ElOption label="350bp" value="350bp" />
                <ElOption label="400bp" value="400bp" />
                <ElOption label="450bp" value="450bp" />
                <ElOption label="500bp" value="500bp" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="备注">
              <ElInput v-model="form.flRemark" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
        </template>

        <!-- 上机质控专属字段 -->
        <template v-if="qcType === 'seq'">
          <ElCol :span="12">
            <ElFormItem label="上机批号">
              <ElSelect v-model="form.seqBatchNo" :disabled="readonly" placeholder="请选择" style="width: 100%">
                <ElOption label="B001" value="B001" />
                <ElOption label="B002" value="B002" />
                <ElOption label="B003" value="B003" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="簇密度">
              <ElInput v-model="form.seqClusterDensity" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="簇通过率">
              <ElInput v-model="form.seqClusterPassRate" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Q30">
              <ElInput v-model="form.seqQ30" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有效数据量">
              <ElInput v-model="form.seqValidData" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="备注">
              <ElInput v-model="form.seqRemark" :disabled="readonly" placeholder="请输入" />
            </ElFormItem>
          </ElCol>
        </template>

        <!-- 公共字段：质控医生、质控时间、质控结果 -->
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
              :disabled="readonly"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="质控结果">
            <ElSelect v-model="form[resultField]" :disabled="readonly" placeholder="请选择" style="width: 100%">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">{{ readonly ? '关闭' : '取消' }}</ElButton>
      <ElButton v-if="!readonly" type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  defineOptions({ name: 'NgsrQcDetailDialog' })

  interface Props {
    visible: boolean
    qcType: string
    formData: any
    readonly?: boolean
  }

  interface Emits {
    (e: 'update:visible', val: boolean): void
    (e: 'submit', data: any): void
  }

  const props = withDefaults(defineProps<Props>(), {
    readonly: false
  })
  const emit = defineEmits<Emits>()

  const qcTypeLabelMap: Record<string, string> = {
    nucleicAcid: '核酸质控',
    preLib: '预文库质控',
    finalLib: '终文库质控',
    seq: '上机质控',
    bio: '生信审核'
  }

  const resultFieldMap: Record<string, string> = {
    nucleicAcid: 'nucleicAcidQc',
    preLib: 'preLibQc',
    finalLib: 'finalLibQc',
    seq: 'seqQc',
    bio: 'bioAnalysisQc'
  }

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const dialogTitle = computed(() => {
    const label = qcTypeLabelMap[props.qcType] || '质控'
    return props.readonly ? `${label}详情` : `编辑${label}`
  })

  const resultField = computed(() => resultFieldMap[props.qcType] || 'nucleicAcidQc')

  const form = reactive<any>({})

  watch(
    () => props.visible,
    (val) => {
      if (val && props.formData) {
        Object.assign(form, props.formData)
      }
    }
  )

  const handleSubmit = () => {
    // 阈值校验：检查数字字段是否在阈值范围内
    let allPassed = true
    if (props.qcType === 'nucleicAcid') {
      if (form.naQubitConc && Number(form.naQubitConc) <= 10) allPassed = false
      if (form.naVolume && Number(form.naVolume) <= 10) allPassed = false
      if (form.naTotalAmount && Number(form.naTotalAmount) <= 100) allPassed = false
    } else if (props.qcType === 'preLib') {
      if (form.plQubitConc && Number(form.plQubitConc) <= 5) allPassed = false
      if (form.plVolume && Number(form.plVolume) <= 5) allPassed = false
      if (form.plTotalAmount && Number(form.plTotalAmount) <= 50) allPassed = false
    }
    if (!allPassed) {
      form[resultField.value] = '不合格'
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
</style>
