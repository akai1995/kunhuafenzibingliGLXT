<!-- 试剂耗材管理统计 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4 reagent-stats">
    <div class="art-card-header">
      <div class="title">
        <h4>试剂耗材统计</h4>
        <p>{{ timeLabel }}试剂耗材管理概览</p>
      </div>
      <div class="flex items-center gap-2">
        <ElSelect v-model="timeRange" size="small" style="width: 120px">
          <ElOption label="本周" value="week" />
          <ElOption label="本月" value="month" />
          <ElOption label="近7天" value="7days" />
          <ElOption label="近30天" value="30days" />
          <ElOption label="本季度" value="quarter" />
          <ElOption label="本年" value="year" />
          <ElOption label="自定义日期" value="custom" />
        </ElSelect>
        <ElDatePicker
          v-if="timeRange === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px"
          value-format="YYYY-MM-DD"
        />
      </div>
    </div>
    <div class="mt-4 stats-content">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="8">
          <div class="stat-item stat-purchase">
            <div class="stat-icon">
              <ArtSvgIcon icon="ri:shopping-cart-2-line" />
            </div>
            <div class="stat-info">
              <span class="stat-value">10</span>
              <span class="stat-label">采购登记</span>
            </div>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="8">
          <div class="stat-item stat-stock-in">
            <div class="stat-icon">
              <ArtSvgIcon icon="ri:inbox-line" />
            </div>
            <div class="stat-info">
              <span class="stat-value">10</span>
              <span class="stat-label">入库管理</span>
            </div>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="8">
          <div class="stat-item stat-inventory">
            <div class="stat-icon">
              <ArtSvgIcon icon="ri:archive-line" />
            </div>
            <div class="stat-info">
              <span class="stat-value">10</span>
              <span class="stat-label">库存查询</span>
            </div>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="8">
          <div class="stat-item stat-requisition">
            <div class="stat-icon">
              <ArtSvgIcon icon="ri:handbag-line" />
            </div>
            <div class="stat-info">
              <span class="stat-value">10</span>
              <span class="stat-label">出库管理</span>
            </div>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="8">
          <div class="stat-item stat-warning">
            <div class="stat-icon">
              <ArtSvgIcon icon="ri:error-warning-line" />
            </div>
            <div class="stat-info">
              <span class="stat-value">8</span>
              <span class="stat-label">库存预警</span>
            </div>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="8">
          <div class="stat-item stat-total">
            <div class="stat-icon">
              <ArtSvgIcon icon="ri:flask-line" />
            </div>
            <div class="stat-info">
              <span class="stat-value">48</span>
              <span class="stat-label">试剂耗材总数</span>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeReagentStats' })

  const timeRange = ref('month')
  const customDateRange = ref<[string, string]>(['', ''])

  const timeLabel = computed(() => {
    const map: Record<string, string> = {
      week: '本周',
      month: '本月',
      '7days': '近7天',
      '30days': '近30天',
      quarter: '本季度',
      year: '本年',
      custom: '自定义日期'
    }
    if (timeRange.value === 'custom' && customDateRange.value[0] && customDateRange.value[1]) {
      return `${customDateRange.value[0]} ~ ${customDateRange.value[1]}`
    }
    return map[timeRange.value] || '本月'
  })
</script>

<style lang="scss" scoped>
  .reagent-stats {
    display: flex;
    flex-direction: column;

    .stats-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      .el-row {
        flex: 1;
        align-items: stretch;
        row-gap: 20px;
      }

      :deep(.el-col) {
        display: flex;
      }
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid var(--art-card-border);
    transition: all 0.2s;
    flex: 1;

    &:hover {
      border-color: var(--el-border-color);
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      font-size: 20px;
      flex-shrink: 0;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      min-width: 0;

      .stat-value {
        font-size: 22px;
        font-weight: 600;
        line-height: 1.2;
        color: var(--el-text-color-primary);
      }

      .stat-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 2px;
      }
    }

    &.stat-purchase .stat-icon {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.stat-stock-in .stat-icon {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }

    &.stat-inventory .stat-icon {
      background: var(--el-color-info-light-9);
      color: var(--el-color-info);
    }

    &.stat-requisition .stat-icon {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }

    &.stat-warning .stat-icon {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }

    &.stat-total .stat-icon {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }
</style>