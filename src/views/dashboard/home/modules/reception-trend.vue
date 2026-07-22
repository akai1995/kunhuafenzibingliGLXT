<!-- 接诊趋势图 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>接诊趋势</h4>
        <p>{{ timeLabel }}<span class="text-success">+15%</span></p>
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
    <ArtLineChart
      height="260px"
      :data="chartData"
      :xAxisData="xAxisData"
      :showLegend="true"
      :showAreaColor="true"
      :showAxisLine="false"
      :showSplitLine="true"
    />
  </div>
</template>

<script setup lang="ts">
  import type { LineDataItem } from '@/types/component/chart'

  defineOptions({ name: 'HomeReceptionTrend' })

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

  // 不同时间范围的x轴数据（最近N天）
  const xAxisData = computed(() => {
    const presetDays: Record<string, number> = { week: 7, month: 30, '7days': 7, '30days': 30, quarter: 13, year: 12 }
    let days = presetDays[timeRange.value] || 30
    // 自定义日期：计算日期区间天数
    if (timeRange.value === 'custom' && customDateRange.value[0] && customDateRange.value[1]) {
      const start = new Date(customDateRange.value[0])
      const end = new Date(customDateRange.value[1])
      days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      days = Math.min(Math.max(days, 1), 90) // 限制在1-90天
    }
    const result: string[] = []
    const today = new Date()
    if (timeRange.value === 'custom' && customDateRange.value[0] && customDateRange.value[1]) {
      const start = new Date(customDateRange.value[0])
      for (let i = 0; i < days; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        result.push(`${d.getMonth() + 1}/${d.getDate()}`)
      }
    } else {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        result.push(`${d.getMonth() + 1}/${d.getDate()}`)
      }
    }
    return result
  })

  const chartData = computed<LineDataItem[]>(() => {
    const days = xAxisData.value.length
    const receptionData: number[] = []
    const doneData: number[] = []
    const baseReception = 30 + Math.floor(Math.random() * 20)
    const baseDone = 25 + Math.floor(Math.random() * 15)
    for (let i = 0; i < days; i++) {
      receptionData.push(baseReception + Math.floor(Math.random() * 30))
      doneData.push(Math.floor(receptionData[i] * (0.7 + Math.random() * 0.25)))
    }
    return [
      {
        name: '接诊数',
        data: receptionData,
        areaStyle: { startOpacity: 0.12, endOpacity: 0 }
      },
      {
        name: '完成数',
        data: doneData,
        areaStyle: { startOpacity: 0.08, endOpacity: 0 }
      }
    ]
  })
</script>