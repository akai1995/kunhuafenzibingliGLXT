<!-- 首页仪表盘 -->
<template>
  <div>
    <!-- 统计卡片 -->
    <HomeStatCards />

    <!-- 接诊趋势 + 样本流程 -->
    <ElRow :gutter="20">
      <ElCol :xl="16" :lg="15" :xs="24">
        <HomeReceptionTrend />
      </ElCol>
      <ElCol :xl="8" :lg="9" :xs="24">
        <HomeSampleFlow />
      </ElCol>
    </ElRow>

    <!-- 质控统计 + 癌种类型 -->
    <ElRow :gutter="20">
      <ElCol :xl="12" :lg="12" :xs="24">
        <HomeQcStats />
      </ElCol>
      <ElCol :xl="12" :lg="12" :xs="24">
        <HomeCancerType />
      </ElCol>
    </ElRow>

    <!-- 检测项目排行 + 试剂耗材统计 -->
    <ElRow :gutter="20">
      <ElCol :xl="12" :lg="12" :xs="24">
        <HomeProjectRanking />
      </ElCol>
      <ElCol :xl="12" :lg="12" :xs="24">
        <HomeReagentStats />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import HomeStatCards from './modules/stat-cards.vue'
  import HomeReceptionTrend from './modules/reception-trend.vue'
  import HomeSampleFlow from './modules/sample-flow.vue'
  import HomeQcStats from './modules/qc-stats.vue'
import HomeCancerType from './modules/cancer-type.vue'
import HomeProjectRanking from './modules/project-ranking.vue'
  import HomeReagentStats from './modules/reagent-stats.vue'

  defineOptions({ name: 'DashboardHome' })
</script>

<style scoped>
  .el-row {
    align-items: stretch;
  }

  .el-col {
    display: flex;
  }

  :deep(.art-card) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>