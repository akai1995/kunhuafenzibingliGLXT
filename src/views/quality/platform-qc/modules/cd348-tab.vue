<!-- CD348平台质控 -->
<template>
  <div>
    <Cd348SearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton :disabled="selectedRows.length === 0" @click="handleBatchExport">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              批量导出
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #sampleQc="{ row }">
          <QcStatusTag :status="row.sampleQc" clickable @click="handleQcClick(row, '样本质控', row.sampleQc)" />
        </template>
        <template #nucleicAcidQc="{ row }">
          <QcStatusTag :status="row.nucleicAcidQc" clickable @click="handleQcClick(row, '核酸质控', row.nucleicAcidQc)" />
        </template>
        <template #sequencingQc="{ row }">
          <QcStatusTag :status="row.sequencingQc" clickable @click="handleQcClick(row, '测序质控', row.sequencingQc)" />
        </template>
        <template #bioAnalysisQc="{ row }">
          <QcStatusTag :status="row.bioAnalysisQc" clickable @click="handleQcClick(row, '生信审核', row.bioAnalysisQc)" />
        </template>
      </ArtTable>
    </ElCard>

    <!-- 查看详情抽屉 -->
    <Cd348ViewDrawer
      v-model:visible="viewDrawerVisible"
      :row-data="currentRow"
    />

    <!-- 质控详情弹窗 -->
    <QcDetailDialog
      v-model:visible="qcDialogVisible"
      :row-data="currentRow"
      :qc-step-name="qcStepName"
      :qc-status="qcStatus"
      :qc-person="qcPerson"
      :qc-time="qcTime"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import QcStatusTag from './qc-status-tag.vue'
  import Cd348SearchForm from './cd348-search-form.vue'
  import Cd348ViewDrawer from './cd348-view-drawer.vue'
  import QcDetailDialog from './qc-detail-dialog.vue'

  defineOptions({ name: 'Cd348Tab' })

  interface Cd348Item {
    id: number
    qcTime: string
    pathologyNo: string
    sampleNo: string
    patientName: string
    projectName: string
    sampleQc: string
    nucleicAcidQc: string
    sequencingQc: string
    bioAnalysisQc: string
    kitNo: string
  }

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<Cd348Item[]>([])
  const viewDrawerVisible = ref(false)
  const currentRow = ref<Cd348Item | null>(null)
  const qcDialogVisible = ref(false)
  const qcStepName = ref('')
  const qcStatus = ref('')
  const qcPerson = ref('')
  const qcTime = ref('')

  const names = ['张明', '李华', '王芳', '刘强', '陈静', '杨光', '赵丽', '周伟']

  const statusGroups: Array<[string, string, string, string]> = [
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '不合格'],
    ['合格', '合格', '不合格', '待质控'],
    ['合格', '不合格', '待质控', '待质控'],
    ['不合格', '待质控', '待质控', '待质控'],
    ['合格', '合格', '合格', '待质控'],
    ['合格', '合格', '待质控', '待质控'],
    ['合格', '待质控', '待质控', '待质控']
  ]

  const mockData: Cd348Item[] = Array.from({ length: 10 }, (_, i) => {
    const id = i + 4001
    const [na, seq, bio] = [statusGroups[i][1], statusGroups[i][2], statusGroups[i][3]]
    return {
      id,
      qcTime: `2026-07-${String(4 + Math.floor(i / 5)).padStart(2, '0')} 0${String((i % 5) + 1).padStart(2, '0')}:00`,
      pathologyNo: `BL${String(20264000 + id)}`,
      sampleNo: `S${String(2026074000 + id)}`,
      patientName: names[i % names.length],
      projectName: 'CD348质控',
      sampleQc: '合格',
      nucleicAcidQc: na,
      sequencingQc: seq,
      bioAnalysisQc: bio,
      kitNo: `KIT${String(2026400 + id)}`
    }
  })

  const searchParams = reactive({
    patientName: '',
    pathologyNo: '',
    sampleNo: '',
    projectName: '',
    nucleicAcidQc: '',
    sequencingQc: '',
    bioAnalysisQc: ''
  })

  const allData = ref<Cd348Item[]>([...mockData])
  const data = ref<Cd348Item[]>([])

  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'qcTime', label: '质控时间', width: 160 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'projectName', label: '检测项目', minWidth: 160 },
    { prop: 'sampleQc', label: '样本质控', width: 90, useSlot: true },
    { prop: 'nucleicAcidQc', label: '核酸质控', width: 90, useSlot: true },
    { prop: 'sequencingQc', label: '测序质控', width: 90, useSlot: true },
    { prop: 'bioAnalysisQc', label: '生信审核', width: 90, useSlot: true },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: Cd348Item) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) })
        ])
    }
  ])

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = allData.value.filter((item) => {
        return (
          (!searchParams.patientName || item.patientName.includes(searchParams.patientName)) &&
          (!searchParams.pathologyNo || item.pathologyNo.includes(searchParams.pathologyNo)) &&
          (!searchParams.sampleNo || item.sampleNo.includes(searchParams.sampleNo)) &&
          (!searchParams.projectName || item.projectName.includes(searchParams.projectName)) &&
          (!searchParams.nucleicAcidQc || item.nucleicAcidQc === searchParams.nucleicAcidQc) &&
          (!searchParams.sequencingQc || item.sequencingQc === searchParams.sequencingQc) &&
          (!searchParams.bioAnalysisQc || item.bioAnalysisQc === searchParams.bioAnalysisQc)
        )
      })
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchPageData()
  }

  const handleResetSearch = () => {
    Object.assign(searchParams, {
      patientName: '',
      pathologyNo: '',
      sampleNo: '',
      projectName: '',
      nucleicAcidQc: '',
      sequencingQc: '',
      bioAnalysisQc: ''
    })
    pagination.current = 1
    fetchPageData()
  }

  const refreshData = () => fetchPageData()

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchPageData()
  }
  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchPageData()
  }
  const handleSelectionChange = (selection: Cd348Item[]) => {
    selectedRows.value = selection
  }

  const handleView = (row: Cd348Item) => {
    currentRow.value = row
    viewDrawerVisible.value = true
  }

  const handleQcClick = (row: Cd348Item, stepName: string, status: string) => {
    currentRow.value = row
    qcStepName.value = stepName
    qcStatus.value = status
    qcPerson.value = '当前用户'
    qcTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
    qcDialogVisible.value = true
  }

  const handleBatchExport = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchPageData()
  })
</script>