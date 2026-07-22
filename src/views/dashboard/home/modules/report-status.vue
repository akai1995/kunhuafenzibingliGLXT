<!-- 报告状态分布 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>报告状态</h4>
        <p>本月报告处理概况</p>
      </div>
    </div>
    <div class="mt-4">
      <div v-for="(item, index) in reportStatuses" :key="index" class="flex items-center mb-5 last:mb-0">
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
  defineOptions({ name: 'HomeReportStatus' })

  interface ReportStatusItem {
    label: string
    count: number
    percentage: number
    progressColor: string
    icon: string
    bgClass: string
    iconColor: string
  }

  const reportStatuses = reactive<ReportStatusItem[]>([
    {
      label: '未书写',
      count: 28,
      percentage: 100,
      progressColor: '#909399',
      icon: 'ri:file-edit-line',
      bgClass: 'bg-g-100',
      iconColor: 'text-g-500'
    },
    {
      label: '已书写',
      count: 45,
      percentage: 80,
      progressColor: '#E6A23C',
      icon: 'ri:edit-box-line',
      bgClass: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      label: '已上传',
      count: 32,
      percentage: 55,
      progressColor: '#67C23A',
      icon: 'ri:upload-2-line',
      bgClass: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      label: '已审核',
      count: 89,
      percentage: 35,
      progressColor: '#409EFF',
      icon: 'ri:checkbox-circle-line',
      bgClass: 'bg-theme/10',
      iconColor: 'text-theme'
    }
  ])
</script>