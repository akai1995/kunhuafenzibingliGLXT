<!-- CD348质控查看详情抽屉 -->
<template>
  <ElDrawer v-model="drawerVisible" title="质控详情" size="680px">
    <div class="qc-detail">
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:shield-check-line" class="mr-1.5" />
          质控信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本编号">{{ rowData?.sampleNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控时间">{{ rowData?.qcTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="项目名称">{{ rowData?.projectName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="试剂盒号">{{ rowData?.kitNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本质控">
            <ElTag :type="rowData?.sampleQc === '合格' ? 'success' : 'danger'" size="small">
              {{ rowData?.sampleQc || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="核酸质控">
            <ElTag :type="rowData?.nucleicAcidQc === '合格' ? 'success' : rowData?.nucleicAcidQc === '不合格' ? 'danger' : 'info'" size="small">
              {{ rowData?.nucleicAcidQc || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="测序质控">
            <ElTag :type="rowData?.sequencingQc === '合格' ? 'success' : rowData?.sequencingQc === '不合格' ? 'danger' : 'info'" size="small">
              {{ rowData?.sequencingQc || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="生信审核">
            <ElTag :type="rowData?.bioAnalysisQc === '合格' ? 'success' : rowData?.bioAnalysisQc === '不合格' ? 'danger' : 'info'" size="small">
              {{ rowData?.bioAnalysisQc || '-' }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Cd348ViewDrawer' })

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
</script>

<style lang="scss" scoped>
  .qc-detail {
    .detail-section {
      margin-bottom: 20px;
      .detail-section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--el-text-color-primary);
      }
    }
  }
</style>