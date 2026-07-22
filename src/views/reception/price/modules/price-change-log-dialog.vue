<!-- 项目变更记录弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="项目变更记录" width="900px">
    <ElDescriptions :column="2" border class="mb-4">
      <ElDescriptionsItem label="项目编码">
        {{ rowData?.projectCode || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="项目名称">
        {{ rowData?.projectName || '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
    <ElTable :data="changeLogData" border>
      <ElTableColumn prop="createTime" label="创建时间" width="170" />
      <ElTableColumn prop="creator" label="创建人" width="100" />
      <ElTableColumn prop="projectCode" label="项目编码" width="140" />
      <ElTableColumn prop="projectName" label="项目名称" min-width="160" />
      <ElTableColumn prop="category" label="项目分类" width="120" />
      <ElTableColumn prop="amount" label="金额(元)" width="100" align="right">
        <template #default="{ row }">
          ¥{{ row.amount.toFixed(2) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="group" label="分组" width="100" />
      <ElTableColumn prop="version" label="版本号" width="80" align="center" />
    </ElTable>
    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  defineOptions({ name: 'PriceChangeLogDialog' })

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

  const changeLogData = ref([
    {
      createTime: '2026-06-28 10:30:00',
      creator: '管理员',
      projectCode: 'EGFR-2026-001',
      projectName: 'EGFR基因突变检测',
      category: '基因突变检测',
      amount: 2800,
      group: '靶向用药',
      version: 'v2.0'
    },
    {
      createTime: '2026-05-15 14:20:00',
      creator: '管理员',
      projectCode: 'EGFR-2026-001',
      projectName: 'EGFR基因突变检测',
      category: '基因突变检测',
      amount: 2600,
      group: '靶向用药',
      version: 'v1.0'
    }
  ])
</script>
