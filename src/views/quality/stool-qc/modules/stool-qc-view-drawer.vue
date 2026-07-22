<!-- 粪便样本质控查看抽屉 -->
<template>
  <ElDrawer v-model="drawerVisible" title="质控详情" size="680px">
    <div class="qc-detail">
      <!-- 质控信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:shield-check-line" class="mr-1.5" />
          质控信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本编号">{{ rowData?.sampleNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="检测项目">{{ rowData?.testProject || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="粪便总量">{{ rowData?.stoolAmount ? rowData.stoolAmount + 'g' : '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控结果">
            <ElTag :type="rowData?.isQualified === '合格' ? 'success' : 'danger'" size="small">
              {{ rowData?.isQualified || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="处理意见">{{ rowData?.suggestion || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="储存位置">{{ rowData?.storageLocation || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控人">{{ rowData?.qcOperator || rowData?.qcDoctor || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控时间">{{ rowData?.qcTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="rowData?.confirmer" label="确认人">{{ rowData.confirmer }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="rowData?.confirmTime" label="确认时间">{{ rowData.confirmTime }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 样本信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:flask-line" class="mr-1.5" />
          样本信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="样本类型">{{ rowData?.sampleType || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本来源">{{ rowData?.sampleSource || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="条形码">{{ rowData?.barcode || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="采集时间">{{ rowData?.collectTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="采集人">{{ rowData?.collector || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="采集方式">{{ rowData?.collectMethod || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="存储位置">{{ rowData?.storageLocation || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  defineOptions({ name: 'StoolQcViewDrawer' })

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
</script>

<style lang="scss" scoped>
  .qc-detail {
    .detail-section {
      margin-bottom: 24px;

      .detail-section-title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }
  }
</style>