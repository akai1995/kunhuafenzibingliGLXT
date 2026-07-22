<!-- 首页统计卡片 -->
<template>
  <ElRow :gutter="20">
    <ElCol v-for="(item, index) in statCards" :key="index" :xs="24" :sm="12" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.label }}</span>
        <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.value" :duration="1300" />
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">{{ item.compareLabel }}</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="item.trend === 'up' ? 'text-success' : 'text-danger'"
          >
            {{ item.change }}
          </span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc"
          :class="item.bgClass"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl" :class="item.iconClass" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeStatCards' })

  interface StatCardItem {
    label: string
    value: number
    compareLabel: string
    change: string
    trend: 'up' | 'down'
    icon: string
    bgClass: string
    iconClass: string
  }

  const statCards = reactive<StatCardItem[]>([
    {
      label: '今日接诊数',
      value: 128,
      compareLabel: '较昨日',
      change: '+12%',
      trend: 'up',
      icon: 'ri:file-list-3-line',
      bgClass: 'bg-theme/10',
      iconClass: 'text-theme'
    },
    {
      label: '待质控样本',
      value: 45,
      compareLabel: '较昨日',
      change: '-5%',
      trend: 'down',
      icon: 'ri:shield-check-line',
      bgClass: 'bg-warning/10',
      iconClass: 'text-warning'
    },
    {
      label: '待审核报告',
      value: 23,
      compareLabel: '较昨日',
      change: '+8%',
      trend: 'up',
      icon: 'ri:file-text-line',
      bgClass: 'bg-info/10',
      iconClass: 'text-info'
    },
    {
      label: '试剂库存预警',
      value: 7,
      compareLabel: '较昨日',
      change: '+2',
      trend: 'up',
      icon: 'ri:alert-line',
      bgClass: 'bg-danger/10',
      iconClass: 'text-danger'
    }
  ])
</script>