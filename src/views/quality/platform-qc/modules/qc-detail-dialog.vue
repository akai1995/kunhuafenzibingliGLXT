<!-- 质控详情查看弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" :title="`${qcStepName} - 质控详情`" width="500px">
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本编号">{{ rowData?.sampleNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="质控步骤">{{ qcStepName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="质控结果">
        <ElTag
          :type="qcStatus === '合格' ? 'success' : qcStatus === '不合格' ? 'danger' : 'info'"
          size="small"
        >
          {{ qcStatus || '-' }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="质控人">{{ qcPerson || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="质控时间">{{ qcTime || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="备注" :span="2">{{ qcRemark || '-' }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<script setup lang="ts">
  defineOptions({ name: 'QcDetailDialog' })

  interface Props {
    visible: boolean
    rowData?: any
    qcStepName?: string
    qcStatus?: string
    qcPerson?: string
    qcTime?: string
    qcRemark?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    rowData: undefined,
    qcStepName: '',
    qcStatus: '',
    qcPerson: '',
    qcTime: '',
    qcRemark: ''
  })
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
</script>