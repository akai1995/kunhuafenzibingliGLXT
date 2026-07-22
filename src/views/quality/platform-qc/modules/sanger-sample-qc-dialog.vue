<!-- 一代测序样本质控查看弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="样本质控信息" width="500px">
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本编号">{{ rowData?.sampleNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="项目名称">{{ rowData?.projectName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本质控">
        <ElTag :type="rowData?.sampleQc === '合格' ? 'success' : 'danger'" size="small">
          {{ rowData?.sampleQc || '-' }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="质控人">{{ rowData?.sampleQcPerson || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="质控时间">{{ rowData?.sampleQcTime || '-' }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<script setup lang="ts">
  defineOptions({ name: 'SangerSampleQcDialog' })

  interface Props {
    visible: boolean
    rowData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
</script>