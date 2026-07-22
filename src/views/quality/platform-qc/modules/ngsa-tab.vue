<!-- NGSA平台质控 -->
<template>
  <div>
    <NgsaSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton :disabled="selectedRows.length === 0" @click="handleImportData">
              <ArtSvgIcon icon="ri:upload-2-line" class="mr-1" />
              质控数据导入
            </ElButton>
            <ElButton :disabled="exportSeqDisabled" @click="handleExportSeq">
              <ArtSvgIcon icon="ri:upload-cloud-line" class="mr-1" />
              上机导出
            </ElButton>
            <ElButton :disabled="batchSeqDisabled" @click="handleBatchSeq">
              <ArtSvgIcon icon="ri:rocket-line" class="mr-1" />
              批量上机
            </ElButton>
            <ElButton :disabled="batchBioDisabled" @click="handleBatchBio">
              <ArtSvgIcon icon="ri:bar-chart-grouped-line" class="mr-1" />
              批量生信
            </ElButton>
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
          <QcStatusTag :status="row.sampleQc" />
        </template>
        <template #nucleicAcidQc="{ row }">
          <QcStatusTag
            :status="row.nucleicAcidQc"
            clickable
            @click="handleQcClick(row, 'nucleicAcid')"
          />
        </template>
        <template #finalLibQc="{ row }">
          <QcStatusTag :status="row.finalLibQc" clickable @click="handleQcClick(row, 'finalLib')" />
        </template>
        <template #seqQc="{ row }">
          <QcStatusTag :status="row.seqQc" clickable @click="handleQcClick(row, 'seq')" />
        </template>
        <template #bioAnalysisQc="{ row }">
          <QcStatusTag :status="row.bioAnalysisQc" clickable @click="handleQcClick(row, 'bio')" />
        </template>
      </ArtTable>
    </ElCard>

    <!-- 编辑抽屉 -->
    <NgsrEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      :qc-type="currentQcType"
      :show-pre-lib="false"
      @submit="handleEditSubmit"
    />

    <!-- 质控详情弹窗 -->
    <NgsrQcDetailDialog
      v-model:visible="qcDialogVisible"
      :qc-type="currentQcType"
      :form-data="currentRow"
      :readonly="false"
      @submit="handleQcSubmit"
    />

    <!-- 查看抽屉 -->
    <NgsaViewDrawer v-model:visible="viewDrawerVisible" :row-data="currentRow" />

    <!-- 批量上机弹窗 -->
    <NgsrBatchSeqDialog
      v-model:visible="batchSeqVisible"
      :rows="selectedRows"
      @submit="handleBatchSubmit"
    />

    <!-- 批量生信弹窗 -->
    <NgsrBatchBioDialog
      v-model:visible="batchBioVisible"
      :rows="selectedRows"
      @submit="handleBatchSubmit"
    />

    

    <!-- 质控数据导入文件选择 -->
    <input
      ref="importFileInput"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleImportFileChange"
    />

    <!-- 导入预览编辑弹窗 -->
    <ImportPreviewDialog
      v-model:visible="importPreviewVisible"
      :file="importFile"
      @confirm="handleImportConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import NgsaSearchForm from './ngsa-search-form.vue'
  import NgsrEditDrawer from './ngsr-edit-drawer.vue'
  import NgsrQcDetailDialog from './ngsr-qc-detail-dialog.vue'
  import NgsaViewDrawer from './ngsa-view-drawer.vue'
  import NgsrBatchSeqDialog from './ngsr-batch-seq-dialog.vue'
  import NgsrBatchBioDialog from './ngsr-batch-bio-dialog.vue'
  
  import QcStatusTag from './qc-status-tag.vue'
  import ImportPreviewDialog from './import-preview-dialog.vue'
  import { checkQcSequence } from './qc-sequence'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'NgsaTab' })

  const sampleFlowStore = useSampleFlowStore()

  const exportSeqDisabled = computed(() => {
    if (selectedRows.value.length === 0) return true
    return !selectedRows.value.every(
      (r) =>
        r.nucleicAcidQc === '合格' &&
        r.finalLibQc === '合格'
    )
  })

  const batchSeqDisabled = computed(() => {
    if (selectedRows.value.length === 0) return true
    return !selectedRows.value.every(
      (r) =>
        r.nucleicAcidQc === '合格' &&
        r.finalLibQc === '合格'
    )
  })

  const batchBioDisabled = computed(() => {
    if (selectedRows.value.length === 0) return true
    return !selectedRows.value.every(
      (r) =>
        r.nucleicAcidQc === '合格' &&
        r.finalLibQc === '合格' &&
        r.seqQc === '合格'
    )
  })

  interface NgsaItem {
    id: number
    qcTime: string
    pathologyNo: string
    sampleNo: string
    patientName: string
    projectName: string
    sampleQc: string
    nucleicAcidQc: string
    finalLibQc: string
    seqQc: string
    bioAnalysisQc: string
    kitNo: string
  }

  const searchParams = reactive({
    patientName: '',
    pathologyNo: '',
    projectName: '',
    sampleNo: '',
    nucleicAcidQc: '',
    finalLibQc: '',
    seqQc: '',
    bioAnalysisQc: ''
  })

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<NgsaItem[]>([])
  const editDrawerVisible = ref(false)
  const qcDialogVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const batchSeqVisible = ref(false)
  const batchBioVisible = ref(false)
  
  const currentRow = ref<any>({})
  const currentQcType = ref('')
  const importFileInput = ref<HTMLInputElement | null>(null)
  const importPreviewVisible = ref(false)
  const importFile = ref<File | null>(null)

  const qcStatuses = ['合格', '不合格', '待质控']
  const names = ['张明', '李华', '王芳', '刘强', '陈静', '杨光', '赵丽', '周伟']
  const ngsaProjects = ['NGSA质控']
  const projects = ngsaProjects

  const formatTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const formatNow = () => formatTime(new Date())

  // NGSA质控顺序：核酸质控 → 终文库质控 → 上机质控 → 生信审核
  const statusGroups: Array<[string, string, string, string]> = [
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '合格'],
    ['合格', '合格', '合格', '不合格'],
    ['合格', '合格', '合格', '不合格'],
    ['合格', '合格', '合格', '不合格'],
    ['合格', '合格', '不合格', '待质控'],
    ['合格', '合格', '不合格', '待质控'],
    ['合格', '不合格', '待质控', '待质控'],
    ['合格', '不合格', '待质控', '待质控'],
    ['合格', '不合格', '待质控', '待质控'],
    ['不合格', '待质控', '待质控', '待质控'],
    ['不合格', '待质控', '待质控', '待质控'],
    ['合格', '合格', '合格', '待质控'],
    ['合格', '合格', '合格', '待质控'],
    ['合格', '合格', '合格', '待质控'],
    ['合格', '合格', '待质控', '待质控'],
    ['合格', '合格', '待质控', '待质控'],
    ['合格', '不合格', '待质控', '待质控'],
    ['合格', '待质控', '待质控', '待质控'],
    ['合格', '待质控', '待质控', '待质控'],
    ['合格', '待质控', '待质控', '待质控'],
    ['合格', '待质控', '待质控', '待质控']
  ]

  const mockData: NgsaItem[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 501
    const [na, finalLib, seq, bio] = statusGroups[i]
    return {
      id,
      qcTime: `2026-07-${String(3 + Math.floor(i / 5)).padStart(2, '0')} 0${String((i % 5) + 1).padStart(2, '0')}:00`,
      pathologyNo: `BL${String(20261000 + id)}`,
      sampleNo: `S${String(2026070500 + id)}`,
      patientName: names[i % names.length],
      projectName: 'NGSA质控',
      sampleQc: '合格',
      nucleicAcidQc: na,
      finalLibQc: finalLib,
      seqQc: seq,
      bioAnalysisQc: bio,
      kitNo: `KIT${String(2026001 + id)}`
    }
  })

  const allData = ref<NgsaItem[]>([...mockData])
  const data = ref<NgsaItem[]>([])

  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'qcTime', label: '质控时间', width: 160 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'projectName', label: '检测项目', minWidth: 160 },
    { prop: 'sampleQc', label: '样本质控', width: 90, useSlot: true },
    { prop: 'nucleicAcidQc', label: '核酸质控', width: 90, useSlot: true },
    { prop: 'finalLibQc', label: '终文库质控', width: 100, useSlot: true },
    { prop: 'seqQc', label: '上机质控', width: 90, useSlot: true },
    { prop: 'bioAnalysisQc', label: '生信审核', width: 90, useSlot: true },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: NgsaItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) })
        ])
    }
  ])

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      // 流程三：从Store获取样本质控完成的流转样本，只合并NGSA项目的样本
      const flowSamples = sampleFlowStore.getSamplesForPlatformQc().filter((fs) =>
        ngsaProjects.includes(fs.projectName)
      )
      const existingIds = new Set(allData.value.map((d) => d.id))
      flowSamples.forEach((fs) => {
        if (!existingIds.has(fs.id)) {
          allData.value.unshift({
            id: fs.id,
            qcTime: fs.orderSubmitTime,
            pathologyNo: fs.pathologyNo,
            sampleNo: fs.sampleNo,
            patientName: fs.patientName,
            projectName: fs.projectName,
            sampleQc: '合格',
            nucleicAcidQc: '待质控',
            finalLibQc: '待质控',
            seqQc: '待质控',
            bioAnalysisQc: '待质控',
            kitNo: ''
          })
        }
      })

      const filtered = allData.value.filter((item) => {
        return (
          (!searchParams.patientName || item.patientName.includes(searchParams.patientName)) &&
          (!searchParams.pathologyNo || item.pathologyNo.includes(searchParams.pathologyNo)) &&
          (!searchParams.projectName || item.projectName.includes(searchParams.projectName)) &&
          (!searchParams.sampleNo || item.sampleNo.includes(searchParams.sampleNo)) &&
          (!searchParams.nucleicAcidQc || item.nucleicAcidQc === searchParams.nucleicAcidQc) &&
          (!searchParams.finalLibQc || item.finalLibQc === searchParams.finalLibQc) &&
          (!searchParams.seqQc || item.seqQc === searchParams.seqQc) &&
          (!searchParams.bioAnalysisQc || item.bioAnalysisQc === searchParams.bioAnalysisQc)
        )
      })
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchPageData()

  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchPageData()
  }

  const handleResetSearch = () => {
    Object.assign(searchParams, {
      patientName: '',
      pathologyNo: '',
      projectName: '',
      sampleNo: '',
      nucleicAcidQc: '',
      finalLibQc: '',
      seqQc: '',
      bioAnalysisQc: ''
    })
    pagination.current = 1
    fetchPageData()
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchPageData()
  }
  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchPageData()
  }
  const handleSelectionChange = (selection: NgsaItem[]) => {
    selectedRows.value = selection
  }

  const handleEdit = (row: NgsaItem) => {
    currentRow.value = { ...row }
    currentQcType.value = ''
    editDrawerVisible.value = true
  }

  const handleQcClick = (row: NgsaItem, qcType: string) => {
    const { passed, message } = checkQcSequence(qcType, row, false)
    if (!passed) {
      ElMessageBox.alert(message!, '提示', { type: 'warning', confirmButtonText: '确定', customClass: 'qc-sequence-dialog' })
      return
    }
    currentRow.value = {
      ...row,
      applyCode: row.pathologyNo || (row as any).applyCode || '',
      qcDoctor: '当前用户',
      qcTime: row.qcTime || formatNow()
    }
    currentQcType.value = qcType
    qcDialogVisible.value = true
  }

  const handleQcSubmit = (data: any) => {
    const idx = allData.value.findIndex((d) => d.id === data.id)
    if (idx > -1) {
      allData.value[idx] = { ...allData.value[idx], ...data }
      // 流程三：技术平台质控全部完成（所有质控均为合格），数据流转到报告管理
      const row = allData.value[idx]
      if (
        row &&
        row.sampleQc === '合格' &&
        row.nucleicAcidQc === '合格' &&
        row.finalLibQc === '合格' &&
        row.seqQc === '合格' &&
        row.bioAnalysisQc === '合格'
      ) {
        sampleFlowStore.completePlatformQc(data.id)
      }
    }
    fetchPageData()
  }

  const handleEditSubmit = (submitData: any) => {
    const idx = allData.value.findIndex((d) => d.id === submitData.id)
    if (idx > -1) {
      allData.value[idx] = { ...allData.value[idx], ...submitData }
    }
    // 流程三：技术平台质控全部完成（所有质控均为合格），数据流转到报告管理
    const row = allData.value[idx]
    if (
      row &&
      row.sampleQc === '合格' &&
      row.nucleicAcidQc === '合格' &&
      row.finalLibQc === '合格' &&
      row.seqQc === '合格' &&
      row.bioAnalysisQc === '合格'
    ) {
      sampleFlowStore.completePlatformQc(submitData.id)
    }
    fetchPageData()
  }

  const handleView = (row: NgsaItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  const handleExportSeq = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条上机数据`)
  }

  const handleBatchSeq = () => {
    batchSeqVisible.value = true
  }
  const handleBatchBio = () => {
    batchBioVisible.value = true
  }
  

  const handleBatchExport = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  const handleBatchSubmit = () => {
    fetchPageData()
  }

  const handleImportData = () => {
    importFileInput.value?.click()
  }

  const handleImportFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls'].includes(fileExt || '')) {
      ElMessage.error('请选择Excel文件（.xlsx 或 .xls）')
      input.value = ''
      return
    }
    importFile.value = file
    importPreviewVisible.value = true
    input.value = ''
  }

  const handleImportConfirm = (data: any[][]) => {
    ElMessage.success(`已成功导入 ${data.length} 条质控数据`)
    importPreviewVisible.value = false
    importFile.value = null
    fetchPageData()
  }

  onMounted(() => {
    fetchPageData()
  })
</script>

<style lang="scss">
  .qc-sequence-dialog {
    .el-message-box__message {
      text-align: left;
    }
    .el-message-box__btns {
      justify-content: flex-end;
    }
  }
</style>
