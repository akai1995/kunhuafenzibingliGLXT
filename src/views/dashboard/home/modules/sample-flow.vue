<!-- 样本流程阶段分布 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>样本流程概览</h4>
        <p>{{ timeLabel }}各阶段样本数量</p>
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
    <div class="mt-3">
      <div v-for="(item, index) in flowStages" :key="index" class="mb-4 last:mb-0">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-sm text-g-700">{{ item.label }}</span>
          <span class="text-sm font-semibold" :class="item.colorClass">{{ item.count }}</span>
        </div>
        <ElProgress
          :percentage="item.percentage"
          :color="item.progressColor"
          :stroke-width="8"
          :show-text="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeSampleFlow' })

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

  interface FlowStage {
    label: string
    count: number
    percentage: number
    progressColor: string
    colorClass: string
  }

  const dataMap: Record<string, FlowStage[]> = {
    week: [
      { label: '待确认', count: 8, percentage: 100, progressColor: '#409EFF', colorClass: 'text-theme' },
      { label: '质控中', count: 12, percentage: 85, progressColor: '#E6A23C', colorClass: 'text-warning' },
      { label: '平台质控', count: 7, percentage: 60, progressColor: '#909399', colorClass: 'text-g-600' },
      { label: '报告审核中', count: 5, percentage: 40, progressColor: '#67C23A', colorClass: 'text-success' },
      { label: '已完成', count: 38, percentage: 25, progressColor: '#337ECC', colorClass: 'text-info' }
    ],
    month: [
      { label: '待确认', count: 32, percentage: 100, progressColor: '#409EFF', colorClass: 'text-theme' },
      { label: '质控中', count: 45, percentage: 85, progressColor: '#E6A23C', colorClass: 'text-warning' },
      { label: '平台质控', count: 28, percentage: 60, progressColor: '#909399', colorClass: 'text-g-600' },
      { label: '报告审核中', count: 23, percentage: 40, progressColor: '#67C23A', colorClass: 'text-success' },
      { label: '已完成', count: 156, percentage: 25, progressColor: '#337ECC', colorClass: 'text-info' }
    ],
    '7days': [
      { label: '待确认', count: 10, percentage: 100, progressColor: '#409EFF', colorClass: 'text-theme' },
      { label: '质控中', count: 14, percentage: 85, progressColor: '#E6A23C', colorClass: 'text-warning' },
      { label: '平台质控', count: 8, percentage: 60, progressColor: '#909399', colorClass: 'text-g-600' },
      { label: '报告审核中', count: 6, percentage: 40, progressColor: '#67C23A', colorClass: 'text-success' },
      { label: '已完成', count: 42, percentage: 25, progressColor: '#337ECC', colorClass: 'text-info' }
    ],
    '30days': [
      { label: '待确认', count: 35, percentage: 100, progressColor: '#409EFF', colorClass: 'text-theme' },
      { label: '质控中', count: 48, percentage: 85, progressColor: '#E6A23C', colorClass: 'text-warning' },
      { label: '平台质控', count: 30, percentage: 60, progressColor: '#909399', colorClass: 'text-g-600' },
      { label: '报告审核中', count: 25, percentage: 40, progressColor: '#67C23A', colorClass: 'text-success' },
      { label: '已完成', count: 168, percentage: 25, progressColor: '#337ECC', colorClass: 'text-info' }
    ],
    quarter: [
      { label: '待确认', count: 95, percentage: 100, progressColor: '#409EFF', colorClass: 'text-theme' },
      { label: '质控中', count: 132, percentage: 85, progressColor: '#E6A23C', colorClass: 'text-warning' },
      { label: '平台质控', count: 85, percentage: 60, progressColor: '#909399', colorClass: 'text-g-600' },
      { label: '报告审核中', count: 68, percentage: 40, progressColor: '#67C23A', colorClass: 'text-success' },
      { label: '已完成', count: 480, percentage: 25, progressColor: '#337ECC', colorClass: 'text-info' }
    ],
    year: [
      { label: '待确认', count: 380, percentage: 100, progressColor: '#409EFF', colorClass: 'text-theme' },
      { label: '质控中', count: 520, percentage: 85, progressColor: '#E6A23C', colorClass: 'text-warning' },
      { label: '平台质控', count: 340, percentage: 60, progressColor: '#909399', colorClass: 'text-g-600' },
      { label: '报告审核中', count: 275, percentage: 40, progressColor: '#67C23A', colorClass: 'text-success' },
      { label: '已完成', count: 1920, percentage: 25, progressColor: '#337ECC', colorClass: 'text-info' }
    ]
  }

  const flowStages = reactive<FlowStage[]>([...dataMap.month])

  watch(timeRange, (val) => {
    if (val === 'custom') return
    flowStages.length = 0
    flowStages.push(...dataMap[val])
  })
</script>