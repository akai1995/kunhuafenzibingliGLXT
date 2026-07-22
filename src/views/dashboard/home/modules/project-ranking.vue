<!-- 检测项目排行 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>检测项目排行</h4>
        <p>{{ timeLabel }}样本数量TOP5</p>
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
      <div v-for="(item, index) in projectRankings" :key="index" class="flex items-center mb-3 last:mb-0">
        <span
          class="w-5 h-5 rounded-full flex-cc text-xs font-semibold mr-3"
          :class="index < 3 ? 'bg-theme text-white' : 'bg-g-100 text-g-600'"
        >
          {{ index + 1 }}
        </span>
        <span class="flex-1 text-sm text-g-700 truncate">{{ item.name }}</span>
        <span class="text-sm font-semibold text-g-800 ml-2">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeProjectRanking' })

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

  interface ProjectRankingItem {
    name: string
    count: number
  }

  const dataMap: Record<string, ProjectRankingItem[]> = {
    week: [
      { name: 'EGFR基因突变检测', count: 22 },
      { name: 'KRAS基因突变检测', count: 18 },
      { name: 'BRAF V600E检测', count: 14 },
      { name: 'HER2基因扩增检测', count: 12 },
      { name: 'ALK融合基因检测', count: 10 }
    ],
    month: [
      { name: 'EGFR基因突变检测', count: 86 },
      { name: 'KRAS基因突变检测', count: 72 },
      { name: 'BRAF V600E检测', count: 58 },
      { name: 'HER2基因扩增检测', count: 48 },
      { name: 'ALK融合基因检测', count: 42 }
    ],
    '7days': [
      { name: 'EGFR基因突变检测', count: 25 },
      { name: 'KRAS基因突变检测', count: 20 },
      { name: 'BRAF V600E检测', count: 16 },
      { name: 'HER2基因扩增检测', count: 14 },
      { name: 'ALK融合基因检测', count: 12 }
    ],
    '30days': [
      { name: 'EGFR基因突变检测', count: 92 },
      { name: 'KRAS基因突变检测', count: 78 },
      { name: 'BRAF V600E检测', count: 62 },
      { name: 'HER2基因扩增检测', count: 52 },
      { name: 'ALK融合基因检测', count: 45 }
    ],
    quarter: [
      { name: 'EGFR基因突变检测', count: 260 },
      { name: 'KRAS基因突变检测', count: 215 },
      { name: 'BRAF V600E检测', count: 175 },
      { name: 'HER2基因扩增检测', count: 145 },
      { name: 'ALK融合基因检测', count: 128 }
    ],
    year: [
      { name: 'EGFR基因突变检测', count: 1050 },
      { name: 'KRAS基因突变检测', count: 860 },
      { name: 'BRAF V600E检测', count: 700 },
      { name: 'HER2基因扩增检测', count: 580 },
      { name: 'ALK融合基因检测', count: 510 }
    ]
  }

  const projectRankings = reactive<ProjectRankingItem[]>([...dataMap.month])

  watch(timeRange, (val) => {
    if (val === 'custom') return
    projectRankings.length = 0
    projectRankings.push(...dataMap[val])
  })
</script>