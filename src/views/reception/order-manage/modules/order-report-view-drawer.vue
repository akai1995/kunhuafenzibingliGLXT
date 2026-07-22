<!-- 报告查看抽屉 -->
<template>
  <ElDrawer v-model="drawerVisible" title="报告详情" size="640px" :close-on-click-modal="true">
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="项目名称">{{ rowData?.projectName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本编号">{{ rowData?.sampleCode || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="检测技师">{{ reportData?.testTechnician || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="检测时间">{{ reportData?.testTime || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="复核技师">{{ reportData?.reviewTechnician || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="复核时间">{{ reportData?.reviewTime || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="报告医生">{{ reportData?.reportDoctor || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="报告时间">{{ reportData?.reportTime || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="备注">{{ reportData?.remark || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="基因检测结果解释">{{ reportData?.resultInterpretation || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="检测结果附图">
        <span v-if="reportData?.images?.length">已上传{{ reportData.images.length }}张图片</span>
        <span v-else>-</span>
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  defineOptions({ name: 'OrderReportViewDrawer' })

  interface Props {
    visible: boolean
    rowData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const rowData = computed(() => props.rowData)

  const reportData = computed(() => (rowData.value?.reportData as any) || {})
</script>