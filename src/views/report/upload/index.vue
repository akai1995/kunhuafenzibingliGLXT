<!-- 报告上传 -->
<template>
  <div class="report-upload art-full-height">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="患者姓名">
              <ElInput
                v-model="searchForm.patientName"
                placeholder="请输入患者姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="样本编号">
              <ElInput
                v-model="searchForm.sampleNo"
                placeholder="请输入样本编号"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="项目名称">
              <ElInput
                v-model="searchForm.projectName"
                placeholder="请输入项目名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
            </div>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <!-- 表格卡片 -->
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton
              type="primary"
              @click="handleBatchUpload"
            >
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
              批量上传
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
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #reportStatusSlot="{ row }">
          <ElTag :type="getReportStatusType(row.reportStatus)" size="small">
            {{ getReportStatusLabel(row.reportStatus) }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 报告上传弹窗 -->
    <OrderUploadDialog
      v-model:visible="uploadDialogVisible"
      :order-data="currentRow"
      @submit="handleUploadSubmit"
    />

    <!-- 批量上传弹窗 -->
    <BatchUploadDialog
      v-model:visible="batchUploadDialogVisible"
      @submit="handleBatchUploadSubmit"
    />

    <!-- 查看详情弹窗 -->
    <ElDialog
      v-model="viewDialogVisible"
      title="报告详情"
      width="640px"
      :close-on-click-modal="true"
    >
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="患者姓名">
          {{ viewData?.patientName || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="样本编号">
          {{ viewData?.sampleNo || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="性别">
          {{ viewData?.gender || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="年龄">
          {{ viewData?.age || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="项目名称">
          {{ viewData?.projectName || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="病理号">
          {{ viewData?.pathologyNo || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="样本类型">
          {{ viewData?.sampleType || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="报告状态">
          <ElTag
            v-if="viewData?.reportStatus"
            :type="getReportStatusType(viewData.reportStatus)"
            size="small"
          >
            {{ getReportStatusLabel(viewData.reportStatus) }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="报告模板">
          {{ viewData?.templateName || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">
          {{ viewData?.createTime || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <ElButton @click="viewDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { ColumnOption } from '@/types'
  import { useReportStore, type ReportItem } from '../shared/report-data'
  import OrderUploadDialog from '@/views/reception/order-manage/modules/order-upload-dialog.vue'
  import BatchUploadDialog from './modules/batch-upload-dialog.vue'

  defineOptions({ name: 'ReportUpload' })

  const reportStore = useReportStore()

  const loading = ref(false)

  // ===== 查询条件 =====
  const searchForm = reactive({
    patientName: '',
    sampleNo: '',
    projectName: ''
  })

  // ===== 状态 =====
  const tableData = ref<ReportItem[]>([])
  const selectedRows = ref<ReportItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const currentRow = ref<ReportItem | null>(null)
  const viewData = ref<ReportItem | null>(null)

  // ===== 弹窗状态 =====
  const uploadDialogVisible = ref(false)
  const batchUploadDialogVisible = ref(false)
  const viewDialogVisible = ref(false)

  // ===== 报告状态映射 =====
  const getReportStatusType = (status: string) => {
    const map: Record<string, string> = {
      未书写: 'info',
      已书写: 'warning',
      已上传: 'success'
    }
    return map[status] || 'info'
  }

  // 报告状态显示文本（仅本模块：已书写 → 未上传，已上传 → 已上传）
  const getReportStatusLabel = (status: string) => {
    if (status === '已书写') return '未上传'
    return status
  }

  // ===== 列配置 =====
  const columns = ref<ColumnOption[]>([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 150 },
    { prop: 'gender', label: '性别', width: 60, align: 'center' },
    { prop: 'age', label: '年龄', width: 60, align: 'center' },
    { prop: 'projectName', label: '项目名称', minWidth: 160 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'sampleType', label: '样本类型', width: 100 },
    {
      prop: 'reportStatus',
      label: '报告状态',
      width: 100,
      useSlot: true,
      slotName: 'reportStatusSlot'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 192,
      fixed: 'right',
      formatter: (row: ReportItem) =>
        h('div', { class: 'flex-c' }, [
          // 报告上传：reportStatus 为 已书写 时可用
          row.reportStatus === '已书写' &&
            h(ArtButtonTable, {
              icon: 'ri:upload-2-line',
              iconClass: 'bg-theme/12 text-theme',
              title: '报告上传',
              onClick: () => handleUpload(row)
            }),
          // 撤回：reportStatus 为 已上传 且未审核或一级审核通过时可用
          row.reportStatus === '已上传' &&
            (!row.auditStatus || row.auditStatus === 'pending' || row.auditStatus === 'level1Passed') &&
            h(ArtButtonTable, {
              icon: 'ri:arrow-go-back-line',
              iconClass: 'bg-warning/12 text-warning',
              title: row.auditStatus === 'level1Passed' ? '撤回审核' : '撤回',
              onClick: () => handleCancelUpload(row)
            }),
          // 打印
          h(ArtButtonTable, {
            icon: 'ri:printer-line',
            iconClass: 'bg-success/12 text-success',
            title: '打印',
            onClick: () => handlePrint(row)
          }),
          // 查看
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => handleView(row)
          })
        ])
    }
  ])

  // ===== 数据获取 =====
  const fetchData = () => {
    loading.value = true
    setTimeout(() => {
      // 展示未上传数据（已书写）、已上传未审核、已上传一级审核通过（可撤回审核）
      let filtered = reportStore.getUploadReports().filter(
        (r) =>
          r.reportStatus === '已书写' ||
          (r.reportStatus === '已上传' &&
            (!r.auditStatus || r.auditStatus === 'pending' || r.auditStatus === 'level1Passed'))
      )
      if (searchForm.patientName) {
        filtered = filtered.filter((r) => r.patientName.includes(searchForm.patientName))
      }
      if (searchForm.sampleNo) {
        filtered = filtered.filter((r) => r.sampleNo.includes(searchForm.sampleNo))
      }
      if (searchForm.projectName) {
        filtered = filtered.filter((r) => r.projectName.includes(searchForm.projectName))
      }
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      tableData.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchData()

  // ===== 查询/重置 =====
  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    Object.assign(searchForm, {
      patientName: '',
      sampleNo: '',
      projectName: ''
    })
    pagination.current = 1
    fetchData()
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchData()
  }

  const handleSelectionChange = (selection: ReportItem[]) => {
    selectedRows.value = selection
  }

  // ===== 报告上传 =====
  const handleUpload = (row: ReportItem) => {
    currentRow.value = row
    uploadDialogVisible.value = true
  }

  const handleUploadSubmit = (data: Record<string, unknown>) => {
    if (!currentRow.value) return
    reportStore.completeUpload(currentRow.value.id, data)
    ElMessage.success('报告上传成功')
    fetchData()
  }

  // ===== 批量上传 =====
  const handleBatchUpload = () => {
    batchUploadDialogVisible.value = true
  }

  const handleBatchUploadSubmit = (fileList: any[]) => {
    fileList.forEach((file) => {
      // 根据文件名提取信息创建报告
      // 文件名格式: 患者姓名_样本编号_项目名称.pdf 或者自动生成基础信息
      const nameParts = file.name.replace(/\.[^.]+$/, '').split('_')
      const patientName = nameParts[0] || '未知'
      const sampleNo = nameParts[1] || `SP${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`
      const projectName = nameParts.slice(2).join('_') || '未知项目'

      const newId = reportStore.addReport({
        patientName,
        sampleNo,
        projectName,
        reportStatus: '已上传'
      })
      reportStore.completeUpload(newId, {
        batchUpload: true,
        fileName: file.name
      })
    })
    ElMessage.success(`批量上传完成，共 ${fileList.length} 个文件已提交到报告审核`)
    fetchData()
  }

  // ===== 撤回上传 =====
  const handleCancelUpload = (row: ReportItem) => {
    const isLevel1Passed = row.auditStatus === 'level1Passed'
    const confirmMessage = isLevel1Passed
      ? `确认撤回「${row.patientName}」的审核？撤回后报告将重新进入待审核队列。`
      : `确认撤回「${row.patientName}」的报告上传？撤回后状态将变为"未上传"。`
    const confirmTitle = isLevel1Passed ? '撤回审核确认' : '撤回确认'
    const successMessage = isLevel1Passed
      ? '审核已撤回，报告重新进入待审核队列'
      : '报告已撤回，状态变更为"未上传"'

    ElMessageBox.confirm(confirmMessage, confirmTitle, {
      confirmButtonText: '确认撤回',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const success = reportStore.cancelUpload(row.id)
      if (success) {
        ElMessage.success(successMessage)
        fetchData()
      } else {
        ElMessage.error('撤回失败，当前状态不允许撤回')
      }
    })
  }

  // ===== 打印 =====
  const handlePrint = (row: ReportItem) => {
    ElMessage.info(`打印报告：${row.patientName} - ${row.pathologyNo}`)
  }

  // ===== 查看 =====
  const handleView = (row: ReportItem) => {
    viewData.value = { ...row }
    viewDialogVisible.value = true
  }

  // ===== 批量导出 =====
  const handleBatchExport = () => {
    const headers = [
      '患者姓名',
      '样本编号',
      '性别',
      '年龄',
      '项目名称',
      '病理号',
      '样本类型',
      '报告状态',
      '创建时间'
    ]
    const rows = selectedRows.value.map((r) => [
      r.patientName,
      r.sampleNo,
      r.gender,
      r.age,
      r.projectName,
      r.pathologyNo,
      r.sampleType,
      r.reportStatus,
      r.createTime
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `报告上传记录导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .report-upload {
    .search-wrapper {
      padding: 18px 20px;
      margin-bottom: 12px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: calc(var(--custom-radius) + 4px);

      .search-form {
        :deep(.el-form-item__label) {
          white-space: nowrap;
        }

        .search-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          justify-content: flex-end;
          height: 32px;
        }
      }
    }
  }
</style>
