<!-- 最近操作日志 -->
<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>最近操作</h4>
        <p>系统操作记录</p>
      </div>
    </div>
    <div class="mt-3">
      <ElTimeline>
        <ElTimelineItem
          v-for="(item, index) in activities"
          :key="index"
          :timestamp="item.time"
          placement="top"
          :color="item.color"
          size="small"
        >
          <div class="text-sm">
            <span class="font-medium text-g-800">{{ item.user }}</span>
            <span class="text-g-600 ml-1">{{ item.action }}</span>
          </div>
        </ElTimelineItem>
      </ElTimeline>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'HomeRecentActivity' })

  interface ActivityItem {
    user: string
    action: string
    time: string
    color: string
  }

  const activities = reactive<ActivityItem[]>([
    { user: '张医生', action: '提交了EGFR检测报告审核', time: '10分钟前', color: '#409EFF' },
    { user: '李技师', action: '完成了NGSR上机质控', time: '25分钟前', color: '#67C23A' },
    { user: '王医生', action: '新增了1份接诊单', time: '40分钟前', color: '#E6A23C' },
    { user: '赵技师', action: '入库了3份血液样本', time: '1小时前', color: '#909399' },
    { user: '陈医生', action: '审核通过了2份报告', time: '1小时前', color: '#67C23A' },
    { user: '刘技师', action: '完成了病理/组织质控', time: '2小时前', color: '#409EFF' }
  ])
</script>