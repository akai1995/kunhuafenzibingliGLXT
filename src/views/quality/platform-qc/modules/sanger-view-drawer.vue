<!-- 一代测序查看详情抽屉 -->
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
          <ElDescriptionsItem label="质控时间">{{ rowData?.qcTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="性别">{{ rowData?.gender || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="年龄">{{ rowData?.age || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="民族">{{ rowData?.ethnicity || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="项目名称">{{ rowData?.projectName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本质控">
            <ElTag
              :type="rowData?.sampleQc === '合格' ? 'success' : 'danger'"
              size="small"
              class="c-p"
              @click="handleViewSampleQc"
            >
              {{ rowData?.sampleQc || '-' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="检测质控">
            <ElTag
              :type="rowData?.detectQc === '合格' ? 'success' : rowData?.detectQc === '风险上机' ? 'warning' : rowData?.detectQc === '不合格' ? 'danger' : 'info'"
              size="small"
              class="c-p"
              @click="handleEditDetectQc"
            >
              {{ rowData?.detectQc || '待质控' }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  defineOptions({ name: 'SangerViewDrawer' })

  interface Props {
    visible: boolean
    rowData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'viewSampleQc'): void
    (e: 'editDetectQc'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const handleViewSampleQc = () => {
    emit('viewSampleQc')
  }

  const handleEditDetectQc = () => {
    emit('editDetectQc')
  }
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