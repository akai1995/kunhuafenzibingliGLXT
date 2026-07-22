<!-- 日志记录弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="操作日志记录" width="800px">
    <ElDescriptions :column="2" border class="mb-4">
      <ElDescriptionsItem label="申请编码">{{ orderData?.applyCode || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="患者姓名">{{ orderData?.patientName || '-' }}</ElDescriptionsItem>
    </ElDescriptions>
    <ElTable :data="logData" border v-loading="loading">
      <ElTableColumn prop="operator" label="操作人" width="100" />
      <ElTableColumn prop="time" label="操作时间" width="170" />
      <ElTableColumn prop="operationType" label="操作类型" width="110">
        <template #default="{ row }">
          <ElTag :type="operationTypeMap[row.operationType] || 'info'" size="small">
            {{ row.operationType }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="description" label="操作描述" min-width="220" />
      <ElTableColumn label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="handleViewDetail(row)">详情</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleExport">导出日志</ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 日志详情弹窗 -->
  <ElDialog v-model="detailVisible" title="日志详情" width="600px" :close-on-click-modal="true">
    <ElDescriptions v-if="detailRow" :column="1" border>
      <ElDescriptionsItem label="操作人">{{ detailRow.operator }}</ElDescriptionsItem>
      <ElDescriptionsItem label="操作时间">{{ detailRow.time }}</ElDescriptionsItem>
      <ElDescriptionsItem label="操作类型">
        <ElTag :type="operationTypeMap[detailRow.operationType] || 'info'" size="small">
          {{ detailRow.operationType }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作描述">{{ detailRow.description }}</ElDescriptionsItem>
      <ElDescriptionsItem label="申请编码">{{ orderData?.applyCode || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="患者姓名">{{ orderData?.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="IP地址">{{ detailRow.ip || '192.168.1.100' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="操作终端">{{ detailRow.terminal || 'Web端' }}</ElDescriptionsItem>
    </ElDescriptions>
    <template #footer>
      <ElButton @click="detailVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  defineOptions({ name: 'OrderLogDialog' })

  interface Props {
    visible: boolean
    orderData?: any
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

  const loading = ref(false)
  const detailVisible = ref(false)
  const detailRow = ref<any>(null)

  const operationTypeMap: Record<string, any> = {
    '新增': 'success',
    '编辑': 'primary',
    '删除': 'danger',
    '查看': 'info',
    '复制': 'warning',
    '报告书写': 'primary',
    '报告上传': 'success',
    '打印': 'info',
    '导出': 'info',
    '状态变更': 'warning'
  }

  const logData = ref<any[]>([])

  const generateLogData = () => {
    if (!props.orderData) return []
    const baseTime = new Date()
    return [
      {
        operator: '系统',
        time: formatTime(baseTime),
        operationType: '新增',
        description: `创建接诊单 ${props.orderData.applyCode}`
      },
      {
        operator: '张医生',
        time: formatTime(new Date(baseTime.getTime() + 60000)),
        operationType: '编辑',
        description: '修改患者联系方式'
      },
      {
        operator: '李医生',
        time: formatTime(new Date(baseTime.getTime() + 300000)),
        operationType: '状态变更',
        description: `缴费状态变更为${props.orderData.paymentStatus}`
      },
      {
        operator: '王技师',
        time: formatTime(new Date(baseTime.getTime() + 600000)),
        operationType: '状态变更',
        description: `质控状态变更为${props.orderData.qcStatus}`
      },
      {
        operator: '赵医生',
        time: formatTime(new Date(baseTime.getTime() + 900000)),
        operationType: '报告书写',
        description: `书写报告：${props.orderData.projectName}`
      },
      {
        operator: '系统',
        time: formatTime(new Date(baseTime.getTime() + 1200000)),
        operationType: '打印',
        description: '打印条码'
      },
      {
        operator: '钱医生',
        time: formatTime(new Date(baseTime.getTime() + 1500000)),
        operationType: '报告上传',
        description: '上传检测报告'
      }
    ]
  }

  const formatTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        loading.value = true
        setTimeout(() => {
          logData.value = generateLogData()
          loading.value = false
        }, 300)
      }
    }
  )

  const handleViewDetail = (row: any) => {
    detailRow.value = row
    detailVisible.value = true
  }

  const handleExport = () => {
    ElMessage.success('日志导出成功')
  }
</script>
