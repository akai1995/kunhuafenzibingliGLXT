<!-- 癌种类型分布 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>癌种类型</h4>
        <p>{{ timeLabel }}各癌种样本分布</p>
      </div>
      <div class="flex items-center gap-2">
        <ElSelect v-model="timeRange" size="small" style="width: 120px" @change="handleTimeChange">
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
    <div class="mt-4">
      <div v-for="(item, index) in cancerTypes" :key="index" class="flex items-center mb-5 last:mb-0">
        <div class="size-10 rounded-lg flex-cc mr-4" :class="item.bgClass">
          <ArtSvgIcon :icon="item.icon" class="text-lg" :class="item.iconColor" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-g-700">{{ item.label }}</span>
            <span class="text-sm font-semibold">{{ item.count }}</span>
          </div>
          <ElProgress
            :percentage="item.percentage"
            :color="item.progressColor"
            :stroke-width="6"
            :show-text="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeCancerType' })

  interface CancerTypeItem {
    label: string
    count: number
    percentage: number
    progressColor: string
    icon: string
    bgClass: string
    iconColor: string
  }

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

  // 不同时间范围的模拟数据
  const dataMap: Record<string, CancerTypeItem[]> = {
    week: [
      { label: '肺癌', count: 12, percentage: 100, progressColor: '#409EFF', icon: 'ri:lungs-line', bgClass: 'bg-theme/10', iconColor: 'text-theme' },
      { label: '乳腺癌', count: 8, percentage: 67, progressColor: '#E6A23C', icon: 'ri:heart-pulse-line', bgClass: 'bg-warning/10', iconColor: 'text-warning' },
      { label: '结直肠癌', count: 6, percentage: 50, progressColor: '#67C23A', icon: 'ri:body-scan-line', bgClass: 'bg-success/10', iconColor: 'text-success' },
      { label: '胃癌', count: 5, percentage: 42, progressColor: '#909399', icon: 'ri:stethoscope-line', bgClass: 'bg-g-100', iconColor: 'text-g-500' },
      { label: '肝癌', count: 4, percentage: 33, progressColor: '#F56C6C', icon: 'ri:mental-health-line', bgClass: 'bg-danger/10', iconColor: 'text-danger' },
      { label: '甲状腺癌', count: 3, percentage: 25, progressColor: '#337ECC', icon: 'ri:first-aid-kit-line', bgClass: 'bg-info/10', iconColor: 'text-info' }
    ],
    month: [
      { label: '肺癌', count: 48, percentage: 100, progressColor: '#409EFF', icon: 'ri:lungs-line', bgClass: 'bg-theme/10', iconColor: 'text-theme' },
      { label: '乳腺癌', count: 35, percentage: 73, progressColor: '#E6A23C', icon: 'ri:heart-pulse-line', bgClass: 'bg-warning/10', iconColor: 'text-warning' },
      { label: '结直肠癌', count: 28, percentage: 58, progressColor: '#67C23A', icon: 'ri:body-scan-line', bgClass: 'bg-success/10', iconColor: 'text-success' },
      { label: '胃癌', count: 22, percentage: 46, progressColor: '#909399', icon: 'ri:stethoscope-line', bgClass: 'bg-g-100', iconColor: 'text-g-500' },
      { label: '肝癌', count: 18, percentage: 38, progressColor: '#F56C6C', icon: 'ri:mental-health-line', bgClass: 'bg-danger/10', iconColor: 'text-danger' },
      { label: '甲状腺癌', count: 15, percentage: 31, progressColor: '#337ECC', icon: 'ri:first-aid-kit-line', bgClass: 'bg-info/10', iconColor: 'text-info' }
    ],
    '7days': [
      { label: '肺癌', count: 15, percentage: 100, progressColor: '#409EFF', icon: 'ri:lungs-line', bgClass: 'bg-theme/10', iconColor: 'text-theme' },
      { label: '乳腺癌', count: 10, percentage: 67, progressColor: '#E6A23C', icon: 'ri:heart-pulse-line', bgClass: 'bg-warning/10', iconColor: 'text-warning' },
      { label: '结直肠癌', count: 8, percentage: 53, progressColor: '#67C23A', icon: 'ri:body-scan-line', bgClass: 'bg-success/10', iconColor: 'text-success' },
      { label: '胃癌', count: 6, percentage: 40, progressColor: '#909399', icon: 'ri:stethoscope-line', bgClass: 'bg-g-100', iconColor: 'text-g-500' },
      { label: '肝癌', count: 5, percentage: 33, progressColor: '#F56C6C', icon: 'ri:mental-health-line', bgClass: 'bg-danger/10', iconColor: 'text-danger' },
      { label: '甲状腺癌', count: 4, percentage: 27, progressColor: '#337ECC', icon: 'ri:first-aid-kit-line', bgClass: 'bg-info/10', iconColor: 'text-info' }
    ],
    '30days': [
      { label: '肺癌', count: 52, percentage: 100, progressColor: '#409EFF', icon: 'ri:lungs-line', bgClass: 'bg-theme/10', iconColor: 'text-theme' },
      { label: '乳腺癌', count: 38, percentage: 73, progressColor: '#E6A23C', icon: 'ri:heart-pulse-line', bgClass: 'bg-warning/10', iconColor: 'text-warning' },
      { label: '结直肠癌', count: 30, percentage: 58, progressColor: '#67C23A', icon: 'ri:body-scan-line', bgClass: 'bg-success/10', iconColor: 'text-success' },
      { label: '胃癌', count: 24, percentage: 46, progressColor: '#909399', icon: 'ri:stethoscope-line', bgClass: 'bg-g-100', iconColor: 'text-g-500' },
      { label: '肝癌', count: 20, percentage: 38, progressColor: '#F56C6C', icon: 'ri:mental-health-line', bgClass: 'bg-danger/10', iconColor: 'text-danger' },
      { label: '甲状腺癌', count: 16, percentage: 31, progressColor: '#337ECC', icon: 'ri:first-aid-kit-line', bgClass: 'bg-info/10', iconColor: 'text-info' }
    ],
    quarter: [
      { label: '肺癌', count: 142, percentage: 100, progressColor: '#409EFF', icon: 'ri:lungs-line', bgClass: 'bg-theme/10', iconColor: 'text-theme' },
      { label: '乳腺癌', count: 105, percentage: 74, progressColor: '#E6A23C', icon: 'ri:heart-pulse-line', bgClass: 'bg-warning/10', iconColor: 'text-warning' },
      { label: '结直肠癌', count: 86, percentage: 61, progressColor: '#67C23A', icon: 'ri:body-scan-line', bgClass: 'bg-success/10', iconColor: 'text-success' },
      { label: '胃癌', count: 68, percentage: 48, progressColor: '#909399', icon: 'ri:stethoscope-line', bgClass: 'bg-g-100', iconColor: 'text-g-500' },
      { label: '肝癌', count: 55, percentage: 39, progressColor: '#F56C6C', icon: 'ri:mental-health-line', bgClass: 'bg-danger/10', iconColor: 'text-danger' },
      { label: '甲状腺癌', count: 42, percentage: 30, progressColor: '#337ECC', icon: 'ri:first-aid-kit-line', bgClass: 'bg-info/10', iconColor: 'text-info' }
    ],
    year: [
      { label: '肺癌', count: 520, percentage: 100, progressColor: '#409EFF', icon: 'ri:lungs-line', bgClass: 'bg-theme/10', iconColor: 'text-theme' },
      { label: '乳腺癌', count: 385, percentage: 74, progressColor: '#E6A23C', icon: 'ri:heart-pulse-line', bgClass: 'bg-warning/10', iconColor: 'text-warning' },
      { label: '结直肠癌', count: 310, percentage: 60, progressColor: '#67C23A', icon: 'ri:body-scan-line', bgClass: 'bg-success/10', iconColor: 'text-success' },
      { label: '胃癌', count: 245, percentage: 47, progressColor: '#909399', icon: 'ri:stethoscope-line', bgClass: 'bg-g-100', iconColor: 'text-g-500' },
      { label: '肝癌', count: 198, percentage: 38, progressColor: '#F56C6C', icon: 'ri:mental-health-line', bgClass: 'bg-danger/10', iconColor: 'text-danger' },
      { label: '甲状腺癌', count: 156, percentage: 30, progressColor: '#337ECC', icon: 'ri:first-aid-kit-line', bgClass: 'bg-info/10', iconColor: 'text-info' }
    ]
  }

  const cancerTypes = reactive<CancerTypeItem[]>(dataMap.month)

  const handleTimeChange = () => {
    if (timeRange.value === 'custom') return
    const newData = dataMap[timeRange.value]
    cancerTypes.length = 0
    cancerTypes.push(...newData)
  }
</script>