<!-- 质控类型统计 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>质控类型分布</h4>
        <p>{{ timeLabel }}各类型质控样本数</p>
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
    <ArtBarChart
      height="260px"
      :data="chartData"
      :xAxisData="xAxisData"
      :showLegend="false"
      :showAxisLine="false"
      :showSplitLine="true"
      barWidth="50%"
    />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeQcStats' })

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

  const xAxisData = ['病理/组织', '血液', '新鲜组织', '粪便', 'NGSR', 'NGSA', 'PCR']

  const dataMap: Record<string, number[]> = {
    week: [22, 18, 14, 8, 12, 10, 14],
    month: [86, 72, 58, 35, 48, 42, 55],
    '7days': [25, 20, 16, 10, 14, 12, 16],
    '30days': [92, 78, 62, 38, 52, 45, 58],
    quarter: [260, 215, 175, 105, 145, 128, 168],
    year: [1050, 860, 700, 420, 580, 510, 660]
  }

  const chartData = computed(() => {
    if (timeRange.value === 'custom') return dataMap.month
    return dataMap[timeRange.value] || dataMap.month
  })
</script>