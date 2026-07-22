<!-- 甲状腺穿刺液质控查看抽屉 -->
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
          <ElDescriptionsItem label="穿刺液体积">{{ rowData?.punctureVolume || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控结果">
            <ElTag :type="rowData?.qcResult === '合格' ? 'success' : rowData?.qcResult === '不合格' ? 'danger' : 'info'" size="small">
              {{ rowData?.qcResult || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="处理意见">{{ rowData?.suggestion || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本去向">{{ rowData?.sampleDestination || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控人">{{ rowData?.qcPerson || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="质控时间">{{ rowData?.qcTime || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 样本信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <ArtSvgIcon icon="ri:flask-line" class="mr-1.5" />
          样本信息
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="样本类型">甲状腺穿刺液</ElDescriptionsItem>
          <ElDescriptionsItem label="性别">{{ rowData?.gender || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="年龄">{{ rowData?.age || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ThyroidQcViewDrawer' })

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