<!-- 人员变更记录弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="人员变更记录" width="900px">
    <ElDescriptions :column="2" border class="mb-4">
      <ElDescriptionsItem label="项目编码">
        {{ rowData?.projectCode || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="项目名称">
        {{ rowData?.projectName || '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
    <ElTable :data="personLogData" border>
      <ElTableColumn prop="changeTime" label="变更时间" width="170" />
      <ElTableColumn prop="operator" label="操作人" width="100" />
      <ElTableColumn prop="changeType" label="变更类型" width="140" />
      <ElTableColumn prop="before" label="变更前" min-width="120" />
      <ElTableColumn prop="after" label="变更后" min-width="120" />
      <ElTableColumn prop="remark" label="备注" min-width="150" />
    </ElTable>
    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  defineOptions({ name: 'PricePersonLogDialog' })

  interface Props {
    visible: boolean
    rowData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const personLogData = ref([
    {
      changeTime: '2026-06-28 10:30:00',
      operator: '管理员',
      changeType: '项目负责人变更',
      before: '张医生',
      after: '陈医生',
      remark: '项目负责人调整'
    },
    {
      changeTime: '2026-05-20 09:00:00',
      operator: '管理员',
      changeType: '项目审核人变更',
      before: '王主任',
      after: '刘主任',
      remark: '审核人调整'
    }
  ])
</script>
