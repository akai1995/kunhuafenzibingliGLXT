<!-- 外院样本接收 -->
<template>
  <div class="external-sample-manage art-full-height">
    <!-- 查询条件 -->
    <ExternalSampleSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader
        :loading="loading"
        @refresh="refreshData"
        :showColumnSetting="true"
        v-model:columns="columns"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton
              :disabled="selectedRows.length === 0 || selectedRows.some(r => r.receiveStatus !== 'pending')"
              @click="handleBatchReceive"
            >
              <ArtSvgIcon icon="ri:check-double-line" class="mr-1" />
              批量接收
            </ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handleBatchReject"
            >
              <ArtSvgIcon icon="ri:close-circle-line" class="mr-1" />
              批量驳回
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #receiveStatus="{ row }">
          <ElTag :type="receiveStatusType(row.receiveStatus)" size="small">
            {{ row.receiveStatus === 'pending' ? '待接收' : '已接收' }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>
  <!-- 编辑样本抽屉 -->
    <OrderAddDrawer
      v-model:visible="editDrawerVisible"
      :mode="drawerMode"
      :title="drawerTitle"
      :submit-text="drawerSubmitText"
      :edit-data="editRowData"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ExternalSampleSearchForm from './modules/external-sample-search-form.vue'
  import OrderAddDrawer from '@/views/reception/order-manage/modules/order-add-drawer.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'ExternalSample' })

  interface ExternalSampleItem {
    id: number
    patientName: string
    applyCode: string
    gender: string
    age: string
    sampleType: string
    projectName: string
    sendHospital: string
    receiveStatus: 'pending' | 'received' | 'rejected'
    receiveTime: string
    operation: string
  }

  const sampleFlowStore = useSampleFlowStore()

  // Mock data - 外院样本数据，对应接诊单中的外院样本
  const mockData: ExternalSampleItem[] = [
    {
      id: 9,
      patientName: '郑浩',
      applyCode: 'AP2026070009',
      gender: '男',
      age: '50岁',
      sampleType: '组织样本',
      projectName: 'PIK3CA突变检测',
      sendHospital: '病理科',
      receiveStatus: 'pending',
      receiveTime: '2026-07-03 09:00:00',
      operation: ''
    },
    {
      id: 10,
      patientName: '孙丽华',
      applyCode: 'AP2026070010',
      gender: '女',
      age: '58岁',
      sampleType: '血液样本',
      projectName: 'TP53基因突变检测',
      sendHospital: '肿瘤科',
      receiveStatus: 'pending',
      receiveTime: '2026-07-03 10:00:00',
      operation: ''
    },
    {
      id: 11,
      patientName: '马超',
      applyCode: 'AP2026070011',
      gender: '男',
      age: '39岁',
      sampleType: '组织样本',
      projectName: 'EGFR基因突变检测',
      sendHospital: '检验科',
      receiveStatus: 'pending',
      receiveTime: '2026-07-03 11:00:00',
      operation: ''
    },
    {
      id: 12,
      patientName: '黄娟',
      applyCode: 'AP2026070012',
      gender: '女',
      age: '65岁',
      sampleType: '组织样本',
      projectName: 'NGS多基因联合检测',
      sendHospital: '肿瘤科',
      receiveStatus: 'pending',
      receiveTime: '2026-07-03 14:00:00',
      operation: ''
    },
    {
      id: 13,
      patientName: '张三',
      applyCode: 'AP2026070013',
      gender: '男',
      age: '45岁',
      sampleType: '组织样本',
      projectName: 'ALK融合基因检测',
      sendHospital: '内科',
      receiveStatus: 'received',
      receiveTime: '2026-07-04 08:30:00',
      operation: ''
    },
    {
      id: 14,
      patientName: '李四',
      applyCode: 'AP2026070014',
      gender: '女',
      age: '38岁',
      sampleType: '血液样本',
      projectName: 'HER2基因扩增检测',
      sendHospital: '外科',
      receiveStatus: 'received',
      receiveTime: '2026-07-04 09:30:00',
      operation: ''
    },
    {
      id: 16,
      patientName: '赵六',
      applyCode: 'AP2026070016',
      gender: '女',
      age: '48岁',
      sampleType: '新鲜组织',
      projectName: 'MET外显子14跳跃检测',
      sendHospital: '病理科',
      receiveStatus: 'pending',
      receiveTime: '2026-07-05 08:00:00',
      operation: ''
    }
  ]

  const loading = ref(false)
  const data = ref<ExternalSampleItem[]>([])
  const selectedRows = ref<ExternalSampleItem[]>([])
  const searchParams = ref<any>({})

  // 编辑接诊单抽屉
  const editDrawerVisible = ref(false)
  const editRowData = ref<any>(null)
  const drawerMode = ref<'receive' | 'edit'>('receive')
  const drawerTitle = computed(() => (drawerMode.value === 'receive' ? '接收样本' : '编辑样本'))
  const drawerSubmitText = computed(() => (drawerMode.value === 'receive' ? '确认接收' : '确认修改'))

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 根据查询条件过滤数据
  const getFilteredData = () => {
    const p = searchParams.value
    return mockData.filter((item) => {
      if (p.patientName && !item.patientName.includes(p.patientName)) return false
      if (p.applyCode && !item.applyCode.includes(p.applyCode)) return false
      if (p.projectName && !item.projectName.includes(p.projectName)) return false
      if (p.sendHospital && !item.sendHospital.includes(p.sendHospital)) return false
      if (p.receiveStatus && item.receiveStatus !== p.receiveStatus) return false
      return true
    })
  }

  const fetchData = async () => {
    loading.value = true
    await new Promise((r) => setTimeout(r, 300))
    const filtered = getFilteredData()
    const start = (pagination.current - 1) * pagination.size
    data.value = filtered.slice(start, start + pagination.size)
    pagination.total = filtered.length
    loading.value = false
  }

  const handleSearch = (params: any) => {
    searchParams.value = params
    pagination.current = 1
    fetchData()
  }

  const handleResetSearch = () => {
    searchParams.value = {}
    pagination.current = 1
    fetchData()
  }

  onMounted(() => fetchData())

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchData()
  }

  const handleSelectionChange = (selection: ExternalSampleItem[]) => {
    selectedRows.value = selection
  }

  const refreshData = async () => {
    await fetchData()
  }

  // 批量接收 - 需要二次确认
  const handleBatchReceive = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要接收的样本')
      return
    }
    const pendingCount = selectedRows.value.filter((item) => item.receiveStatus === 'pending').length
    ElMessageBox.confirm(
      `确定要接收选中的 ${selectedRows.value.length} 条数据吗？其中待接收 ${pendingCount} 条`,
      '批量接收确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      selectedRows.value.forEach((item) => {
        // 更新本地数据
        item.receiveStatus = 'received'
        // 更新流转状态 - 核收成功允许入库
        sampleFlowStore.receiveSample(item.id, true)
      })
      ElMessage.success(`已成功接收 ${selectedRows.value.length} 条外院样本`)
      fetchData()
    })
  }

  // 批量驳回 - 需要二次确认
  const handleBatchReject = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要驳回的样本')
      return
    }
    const pendingCount = selectedRows.value.filter((item) => item.receiveStatus === 'pending').length
    ElMessageBox.confirm(
      `确定要驳回选中的 ${selectedRows.value.length} 条数据吗？其中待接收 ${pendingCount} 条`,
      '批量驳回确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      selectedRows.value.forEach((item) => {
        // 从mockData中删除驳回的数据
        const idx = mockData.findIndex((m) => m.id === item.id)
        if (idx > -1) mockData.splice(idx, 1)
        sampleFlowStore.receiveSample(item.id, false)
      })
      ElMessage.success(`已成功驳回 ${selectedRows.value.length} 条外院样本`)
      fetchData()
    })
  }

  // 接收状态标签类型
  const receiveStatusType = (s: string) => {
    const map: Record<string, string> = { pending: 'warning', received: 'success' }
    return (map[s] || 'info') as any
  }

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 100 },
    { prop: 'applyCode', label: '申请编码', width: 140 },
    { prop: 'gender', label: '性别', width: 60 },
    { prop: 'age', label: '年龄', width: 70 },
    { prop: 'sampleType', label: '样本类型', width: 100 },
    { prop: 'projectName', label: '检测项目', minWidth: 150 },
    { prop: 'sendHospital', label: '科室', minWidth: 140 },
    { prop: 'receiveStatus', label: '接收状态', width: 80, useSlot: true },
    { prop: 'receiveTime', label: '接收时间', width: 160 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: ExternalSampleItem) => {
        // 待接收状态：接收+驳回
        if (row.receiveStatus === 'pending') {
          return h('div', { class: 'flex-c' }, [
            h(ArtButtonTable, {
              icon: 'ri:check-line',
              iconClass: 'bg-success/12 text-success',
              title: '接收',
              onClick: () => handleSingleReceive(row)
            }),
            h(ArtButtonTable, {
              icon: 'ri:close-line',
              iconClass: 'bg-error/12 text-error',
              title: '驳回',
              onClick: () => handleSingleReject(row)
            })
          ])
        }
        // 已接收状态：编辑
        if (row.receiveStatus === 'received') {
          return h('div', { class: 'flex-c' }, [
            h(ArtButtonTable, {
              icon: 'ri:edit-line',
              iconClass: 'bg-primary/12 text-primary',
              title: '编辑',
              onClick: () => handleSingleEdit(row)
            })
          ])
        }
        return ''
      }
    }
  ])

  // 单个接收 - 打开编辑样本页面
  const handleSingleReceive = (row: ExternalSampleItem) => {
    drawerMode.value = 'receive'
    // 将行数据映射为编辑表单所需的数据结构
    editRowData.value = {
      id: row.id,
      patientName: row.patientName,
      gender: row.gender,
      age: row.age,
      sampleType: row.sampleType,
      projectName: row.projectName,
      sendHospital: row.sendHospital,
      applyCode: row.applyCode,
      patientType: 'control',
      hospital: 'kunhua',
      department: 'pathology',
      doctor: '',
      sampleSource: 'tissue',
      pathologyNo: '',
      cancerType: '',
      pathologyDiagnosis: '',
      pathologyDoctor: '',
      sampleCode: '',
      sampleQuantity: 1,
      isSelfSample: 'no',
      sourceHospital: row.sendHospital
    }
    editDrawerVisible.value = true
  }

  // 单个编辑 - 编辑已接收样本
  const handleSingleEdit = (row: ExternalSampleItem) => {
    drawerMode.value = 'edit'
    editRowData.value = {
      id: row.id,
      patientName: row.patientName,
      gender: row.gender,
      age: row.age,
      sampleType: row.sampleType,
      projectName: row.projectName,
      sendHospital: row.sendHospital,
      applyCode: row.applyCode,
      patientType: 'control',
      hospital: 'kunhua',
      department: 'pathology',
      doctor: '',
      sampleSource: 'tissue',
      pathologyNo: '',
      cancerType: '',
      pathologyDiagnosis: '',
      pathologyDoctor: '',
      sampleCode: '',
      sampleQuantity: 1,
      isSelfSample: 'no',
      sourceHospital: row.sendHospital
    }
    editDrawerVisible.value = true
  }

  // 编辑接诊单提交
  const handleEditSubmit = () => {
    const target = mockData.find((item) => item.id === editRowData.value?.id)
    if (target) {
      if (drawerMode.value === 'receive') {
        // 接收操作：标记为已接收
        target.receiveStatus = 'received'
        sampleFlowStore.receiveSample(target.id, true)
        ElMessage.success('接收成功，样本已进入样本入库列表')
      } else {
        // 编辑操作：更新数据
        ElMessage.success('编辑成功')
      }
    }
    editRowData.value = null
    fetchData()
  }

  // 单个驳回
  const handleSingleReject = (row: ExternalSampleItem) => {
    ElMessageBox.confirm(`确定要驳回外院样本「${row.patientName}」吗？`, '驳回确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 从mockData中删除
      const idx = mockData.findIndex((item) => item.id === row.id)
      if (idx > -1) mockData.splice(idx, 1)
      sampleFlowStore.receiveSample(row.id, false)
      ElMessage.success('驳回成功，样本已回退到接诊单列表')
      fetchData()
    })
  }
</script>
