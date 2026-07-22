<!-- 一代测序平台质控 -->
<template>
  <div>
    <!-- 查询条件 -->
    <SangerSearchForm @search="handleSearch" @reset="handleResetSearch" />

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
          <ElTag
            :type="row.sampleQc === '合格' ? 'success' : 'danger'"
            size="small"
            class="c-p"
            @click="handleViewSampleQc(row)"
          >
            {{ row.sampleQc }}
          </ElTag>
        </template>
        <template #detectQc="{ row }">
          <ElTag
            :type="row.detectQc === '合格' ? 'success' : row.detectQc === '风险上机' ? 'warning' : row.detectQc === '不合格' ? 'danger' : 'info'"
            size="small"
            class="c-p"
            @click="handleEditDetectQc(row)"
          >
            {{ row.detectQc || '待质控' }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 查看详情抽屉 -->
    <SangerViewDrawer
      v-model:visible="viewDrawerVisible"
      :row-data="currentRow"
      @viewSampleQc="handleViewSampleQcFromDrawer"
      @editDetectQc="handleEditDetectQcFromDrawer"
    />

    <!-- 样本质控查看弹窗 -->
    <SangerSampleQcDialog
      v-model:visible="sampleQcDialogVisible"
      :row-data="currentRow"
    />

    <!-- 检测质控编辑弹窗 -->
    <SangerDetectQcDialog
      v-model:visible="detectQcDialogVisible"
      :row-data="currentRow"
      @submit="handleDetectQcSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import SangerSearchForm from './sanger-search-form.vue'
  import SangerViewDrawer from './sanger-view-drawer.vue'
  import SangerSampleQcDialog from './sanger-sample-qc-dialog.vue'
  import SangerDetectQcDialog from './sanger-detect-qc-dialog.vue'

  defineOptions({ name: 'SangerTab' })

  interface SangerItem {
    id: number
    patientName: string
    sampleNo: string
    qcTime: string
    pathologyNo: string
    gender: string
    age: number
    ethnicity: string
    projectName: string
    sampleQc: string
    sampleQcPerson: string
    sampleQcTime: string
    detectQc: string
    detectQcPerson: string
    detectQcTime: string
    detectBatchNo: string
    detectNegativeControl: string
    detectPositiveControl: string
    detectBlankControl: string
  }

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<SangerItem[]>([])
  const viewDrawerVisible = ref(false)
  const sampleQcDialogVisible = ref(false)
  const detectQcDialogVisible = ref(false)
  const currentRow = ref<SangerItem | null>(null)
  const searchParams = ref<any>({})

  const names = ['张明', '李华', '王芳', '刘强', '陈静', '杨光', '赵丽', '周伟']
  const genders = ['男', '女', '女', '男', '女', '男', '女', '男']
  const ethnicities = ['汉族', '汉族', '汉族', '回族', '汉族', '汉族', '汉族', '汉族', '汉族', '汉族']
  const sampleResults = ['合格', '合格', '合格', '合格', '合格', '合格', '不合格', '合格', '合格', '合格']
  const detectResults = ['合格', '合格', '合格', '合格', '待质控', '待质控', '待质控', '合格', '不合格', '风险上机']

  const mockData: SangerItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 8001,
    patientName: names[i % names.length],
    sampleNo: `S${String(2026078000 + i)}`,
    qcTime: `2026-07-${String(4 + Math.floor(i / 5)).padStart(2, '0')} 0${String((i % 5) + 1).padStart(2, '0')}:00`,
    pathologyNo: `BL${String(20268000 + i)}`,
    gender: genders[i % genders.length],
    age: 25 + Math.floor(Math.random() * 40),
    ethnicity: ethnicities[i],
    projectName: '一代测序检测',
    sampleQc: sampleResults[i],
    sampleQcPerson: '王芳',
    sampleQcTime: `2026-07-${String(4 + Math.floor(i / 5)).padStart(2, '0')} 08:00`,
    detectQc: detectResults[i],
    detectQcPerson: detectResults[i] !== '待质控' ? '刘强' : '',
    detectQcTime: detectResults[i] !== '待质控' ? `2026-07-${String(4 + Math.floor(i / 5)).padStart(2, '0')} 10:00` : '',
    detectBatchNo: detectResults[i] !== '待质控' ? `BATCH${String(2026800 + i)}` : '',
    detectNegativeControl: detectResults[i] !== '待质控' ? '在控' : '',
    detectPositiveControl: detectResults[i] !== '待质控' ? '在控' : '',
    detectBlankControl: detectResults[i] !== '待质控' ? '在控' : ''
  }))

  const allData = ref<SangerItem[]>([...mockData])
  const data = ref<SangerItem[]>([])

  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'qcTime', label: '质控时间', width: 160 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'gender', label: '性别', width: 60 },
    { prop: 'age', label: '年龄', width: 60 },
    { prop: 'ethnicity', label: '民族', width: 70 },
    { prop: 'projectName', label: '项目名称', minWidth: 140 },
    { prop: 'sampleQc', label: '样本质控', width: 90, useSlot: true },
    { prop: 'detectQc', label: '检测质控', width: 90, useSlot: true },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: SangerItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) })
        ])
    }
  ])

  const filterData = () => {
    let filtered = [...mockData]
    const p = searchParams.value
    if (p.patientName) filtered = filtered.filter((d) => d.patientName.includes(p.patientName))
    if (p.pathologyNo) filtered = filtered.filter((d) => d.pathologyNo.includes(p.pathologyNo))
    if (p.projectName) filtered = filtered.filter((d) => d.projectName.includes(p.projectName))
    if (p.sampleNo) filtered = filtered.filter((d) => d.sampleNo.includes(p.sampleNo))
    if (p.sampleQc) filtered = filtered.filter((d) => d.sampleQc === p.sampleQc)
    if (p.detectQc) filtered = filtered.filter((d) => d.detectQc === p.detectQc)
    return filtered
  }

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = filterData()
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
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
  const handleSelectionChange = (selection: SangerItem[]) => {
    selectedRows.value = selection
  }

  const handleSearch = (params: any) => {
    searchParams.value = params
    pagination.current = 1
    fetchPageData()
  }

  const handleResetSearch = () => {
    searchParams.value = {}
    pagination.current = 1
    fetchPageData()
  }

  const handleView = (row: SangerItem) => {
    currentRow.value = row
    viewDrawerVisible.value = true
  }

  // 查看样本质控（从列表点击）
  const handleViewSampleQc = (row: SangerItem) => {
    currentRow.value = row
    sampleQcDialogVisible.value = true
  }

  // 查看样本质控（从详情抽屉点击）
  const handleViewSampleQcFromDrawer = () => {
    sampleQcDialogVisible.value = true
  }

  // 编辑检测质控（从列表点击）
  const handleEditDetectQc = (row: SangerItem) => {
    currentRow.value = row
    detectQcDialogVisible.value = true
  }

  // 编辑检测质控（从详情抽屉点击）
  const handleEditDetectQcFromDrawer = () => {
    detectQcDialogVisible.value = true
  }

  // 检测质控提交
  const handleDetectQcSubmit = (formData: any) => {
    const target = allData.value.find((item) => item.id === currentRow.value?.id)
    if (target) {
      target.detectQc = formData.qcResult
      target.detectQcPerson = formData.qcDoctor
      target.detectQcTime = formData.qcTime
      target.detectBatchNo = formData.batchNo
      target.detectNegativeControl = formData.negativeControl
      target.detectPositiveControl = formData.positiveControl
      target.detectBlankControl = formData.blankControl
    }
    currentRow.value = null
    fetchPageData()
  }

  const handleBatchExport = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchPageData()
  })
</script>