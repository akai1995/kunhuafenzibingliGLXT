<!-- 报告打印 -->
<template>
  <div class="report-print art-full-height">
    <!-- 查询条件 -->
    <PrintSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <!-- 表格卡片 -->
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElButton :disabled="selectedRows.length === 0" @click="handleBatchPrint">
            <ArtSvgIcon icon="ri:printer-line" class="mr-1" />
            批量打印
          </ElButton>
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
        <template #printStatusSlot="{ row }">
          <ElTag :type="row.printStatus === 'printed' ? 'success' : 'info'" size="small">
            {{ row.printStatus === 'printed' ? '已打印' : '未打印' }}
          </ElTag>
        </template>
        <template #reportStatusSlot="{ row }">
          <ElTag :type="getReportStatusType(row.reportStatus)" size="small">
            {{ row.reportStatus }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 报告预览弹窗 -->
    <ElDialog
      v-model="previewVisible"
      title="报告预览"
      width="800px"
      :close-on-click-modal="true"
    >
      <div class="report-preview-doc">
        <div class="doc-header">
          <h2 class="doc-title">{{ currentRow?.templateName || '病理检测报告' }}</h2>
          <div class="doc-divider" />
        </div>
        <div class="doc-content">
          <table class="doc-table">
            <tbody>
              <tr>
                <td class="doc-label">患者姓名</td>
                <td class="doc-value">{{ currentRow?.patientName || '-' }}</td>
                <td class="doc-label">性别</td>
                <td class="doc-value">{{ currentRow?.gender || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">年龄</td>
                <td class="doc-value">{{ currentRow?.age || '-' }}</td>
                <td class="doc-label">样本编号</td>
                <td class="doc-value">{{ currentRow?.sampleNo || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">项目名称</td>
                <td class="doc-value">{{ currentRow?.projectName || '-' }}</td>
                <td class="doc-label">病理号</td>
                <td class="doc-value">{{ currentRow?.pathologyNo || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">样本类型</td>
                <td class="doc-value">{{ currentRow?.sampleType || '-' }}</td>
                <td class="doc-label">报告模板</td>
                <td class="doc-value">{{ currentRow?.templateName || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">创建时间</td>
                <td class="doc-value" colspan="3">{{ currentRow?.createTime || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <template v-if="currentRow?.reportData">
            <div class="doc-divider" />
            <table class="doc-table">
              <tbody>
                <tr v-for="(val, key) in (currentRow.reportData as Record<string, unknown>)" :key="key">
                  <td class="doc-label">{{ key }}</td>
                  <td class="doc-value" colspan="3">{{ val || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </div>
      <template #footer>
        <ElButton @click="previewVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handlePrintFromPreview">
          打印
        </ElButton>
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
  import PrintSearchForm from './modules/print-search-form.vue'
  import { useReportStore, reportStore, type ReportItem } from '../shared/report-data'

  defineOptions({ name: 'ReportPrint' })

  const reportStoreUse = useReportStore()

  // ===== PrintItem 类型：在 ReportItem 基础上扩展打印状态 =====
  interface PrintItem extends ReportItem {
    printStatus: 'unprinted' | 'printed'
    printTime?: string
    printOperator?: string
  }

  const loading = ref(false)

  // ===== 查询条件 =====
  const searchParams = reactive({
    patientName: '',
    sampleNo: '',
    projectName: '',
    printStatus: '',
    reportStatus: ''
  })

  // ===== 状态 =====
  const tableData = ref<PrintItem[]>([])
  const selectedRows = ref<PrintItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const currentRow = ref<PrintItem | null>(null)
  const previewVisible = ref(false)

  // ===== 全量数据：从 reportStore 获取已上传报告（报告审核通过后才可打印）=====
  const allData = ref<PrintItem[]>([])

  const buildAllData = () => {
    // 报告打印页面：展示所有已上传报告，其中审核通过的才允许打印
    const reports = reportStore.reports.filter((r) => r.reportStatus === '已上传')
    allData.value = reports.map((r) => {
      const existing = allData.value.find((d) => d.id === r.id)
      return existing
        ? { ...r, printStatus: existing.printStatus, printTime: existing.printTime, printOperator: existing.printOperator }
        : { ...r, printStatus: 'unprinted' as const }
    })
  }

  // 报告状态颜色映射
  const getReportStatusType = (status: string) => {
    const map: Record<string, string> = {
      未书写: 'info',
      书写中: 'info',
      已书写: 'warning',
      已上传: 'success'
    }
    return map[status] || 'info'
  }

  // ===== 列配置 =====
  const columns = ref<ColumnOption[]>([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 150 },
    { prop: 'gender', label: '性别', width: 60, align: 'center' },
    { prop: 'age', label: '年龄', width: 60, align: 'center' },
    { prop: 'projectName', label: '项目名称', minWidth: 160 },
    { prop: 'sampleType', label: '样本类型', width: 100 },
    {
      prop: 'printStatus',
      label: '打印状态',
      width: 100,
      useSlot: true,
      slotName: 'printStatusSlot'
    },
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
      width: 108,
      fixed: 'right',
      formatter: (row: PrintItem) =>
        h('div', { class: 'flex-c' }, [
          // 打印：不受审核状态控制
          h(ArtButtonTable, {
            icon: 'ri:printer-line',
            iconClass: 'bg-success/12 text-success',
            title: '打印',
            onClick: () => handlePrint(row)
          }),
          // 查看：始终可用
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
      buildAllData()
      let filtered = allData.value
      if (searchParams.patientName) {
        filtered = filtered.filter((r) => r.patientName.includes(searchParams.patientName))
      }
      if (searchParams.sampleNo) {
        filtered = filtered.filter((r) => r.sampleNo.includes(searchParams.sampleNo))
      }
      if (searchParams.projectName) {
        filtered = filtered.filter((r) => r.projectName.includes(searchParams.projectName))
      }
      if (searchParams.printStatus) {
        filtered = filtered.filter((r) => r.printStatus === searchParams.printStatus)
      }
      if (searchParams.reportStatus) {
        filtered = filtered.filter((r) => r.reportStatus === searchParams.reportStatus)
      }
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      tableData.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchData()

  // ===== 查询/重置 =====
  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchData()
  }

  const handleResetSearch = () => {
    Object.assign(searchParams, {
      patientName: '',
      sampleNo: '',
      projectName: '',
      printStatus: '',
      reportStatus: ''
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

  const handleSelectionChange = (selection: PrintItem[]) => {
    selectedRows.value = selection
  }

  // ===== 单条打印 =====
  const handlePrint = (row: PrintItem) => {
    ElMessageBox.confirm(`确认打印「${row.patientName}」的报告？`, '打印确认', {
      confirmButtonText: '确定打印',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      doPrint([row])
    })
  }

  // ===== 批量打印 =====
  const handleBatchPrint = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择需要打印的报告')
      return
    }
    ElMessageBox.confirm(`确认批量打印所选 ${selectedRows.value.length} 条报告？`, '批量打印确认', {
      confirmButtonText: '确定打印',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      doPrint(selectedRows.value)
    })
  }

  const doPrint = (rows: PrintItem[]) => {
    setTimeout(() => {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const printTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      rows.forEach((row) => {
        const target = allData.value.find((d) => d.id === row.id)
        if (target) {
          target.printStatus = 'printed'
          target.printTime = printTime
        }
      })
      ElMessage.success(`已成功打印 ${rows.length} 份报告`)
      fetchData()
    }, 300)
  }

  // ===== 查看 =====
  const handleView = (row: PrintItem) => {
    currentRow.value = { ...row }
    previewVisible.value = true
  }

  // ===== 预览页打印 =====
  const handlePrintFromPreview = () => {
    if (!currentRow.value) return
    doPrint([currentRow.value])
    previewVisible.value = false
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .report-print {
    // ===== Word文档样式报告预览 =====
    .report-preview-doc {
      padding: 0;
      background: #fff;
      font-family: 'SimSun', '宋体', serif;
      font-size: 14px;
      line-height: 1.8;
      color: #333;

      .doc-header {
        text-align: center;
        margin-bottom: 16px;

        .doc-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 12px 0;
          letter-spacing: 2px;
        }
      }

      .doc-divider {
        border-bottom: 2px solid #333;
        margin: 12px 0;
      }

      .doc-content {
        padding: 0;
      }

      .doc-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;

        td {
          border: 1px solid #999;
          padding: 6px 10px;
          vertical-align: middle;
        }

        .doc-label {
          background: #f5f7fa;
          width: 100px;
          font-weight: 600;
          text-align: right;
          color: #555;
          white-space: nowrap;
        }

        .doc-value {
          min-width: 120px;
          color: #333;
        }
      }
    }
  }
</style>
