<!-- 报告审核 -->
<template>
  <div class="report-audit art-full-height">
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
          <ElCol v-show="!searchExpanded" :xs="24" :sm="12" :lg="6">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
              <ElButton text @click="toggleSearchExpand">
                展开
                <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-0.5" />
              </ElButton>
            </div>
          </ElCol>
          <ElCol v-show="searchExpanded" :xs="24" :sm="12" :lg="6">
            <ElFormItem label="审核状态">
              <ElSelect
                v-model="searchForm.auditStatus"
                placeholder="请选择审核状态"
                clearable
                style="width: 100%"
                @change="handleSearch"
              >
                <ElOption
                  v-for="opt in auditStatusOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow v-show="searchExpanded" :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 18 }">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
              <ElButton text @click="toggleSearchExpand">
                收起
                <ArtSvgIcon icon="ri:arrow-up-s-line" class="ml-0.5" />
              </ElButton>
            </div>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <!-- 表格卡片 -->
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElButton :disabled="selectedRows.length === 0" @click="handleBatchExport">
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            批量导出
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
        <template #auditStatusSlot="{ row }">
          <ElTag :type="getAuditStatusType(row.auditStatus)" size="small">
            {{ getAuditStatusText(row.auditStatus) }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 审核抽屉 -->
    <ElDrawer
      v-model="auditDrawerVisible"
      :title="auditDrawerTitle"
      size="620px"
      :close-on-click-modal="true"
      direction="rtl"
    >
      <div class="audit-drawer-body">
        <!-- Word文档样式报告信息 -->
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
            <!-- 报告数据 -->
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
      </div>
      <template #footer>
        <div class="audit-drawer-footer">
          <ElInput
            v-model="auditForm.auditRemark"
            placeholder="请输入审核意见（驳回时必填）"
            class="audit-remark-input"
          />
          <ElButton @click="auditDrawerVisible = false">取消</ElButton>
          <ElButton type="success" @click="handleAuditPass">通过</ElButton>
          <ElButton type="danger" @click="handleAuditReject">驳回</ElButton>
        </div>
      </template>
    </ElDrawer>

    <!-- 报告预览弹窗（Word文档格式） -->
    <ElDialog
      v-model="reportPreviewVisible"
      title="报告预览"
      width="800px"
      :close-on-click-modal="true"
    >
      <div class="report-preview-doc">
        <div class="doc-header">
          <h2 class="doc-title">{{ previewData?.templateName || '病理检测报告' }}</h2>
          <div class="doc-divider" />
        </div>
        <div class="doc-content">
          <table class="doc-table">
            <tbody>
              <tr>
                <td class="doc-label">患者姓名</td>
                <td class="doc-value">{{ previewData?.patientName || '-' }}</td>
                <td class="doc-label">性别</td>
                <td class="doc-value">{{ previewData?.gender || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">年龄</td>
                <td class="doc-value">{{ previewData?.age || '-' }}</td>
                <td class="doc-label">样本编号</td>
                <td class="doc-value">{{ previewData?.sampleNo || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">项目名称</td>
                <td class="doc-value">{{ previewData?.projectName || '-' }}</td>
                <td class="doc-label">病理号</td>
                <td class="doc-value">{{ previewData?.pathologyNo || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">样本类型</td>
                <td class="doc-value">{{ previewData?.sampleType || '-' }}</td>
                <td class="doc-label">报告模板</td>
                <td class="doc-value">{{ previewData?.templateName || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">创建时间</td>
                <td class="doc-value" colspan="3">{{ previewData?.createTime || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 报告数据 -->
          <template v-if="previewData?.reportData">
            <div class="doc-divider" />
            <table class="doc-table">
              <tbody>
                <tr v-for="(val, key) in (previewData.reportData as Record<string, unknown>)" :key="key">
                  <td class="doc-label">{{ key }}</td>
                  <td class="doc-value" colspan="3">{{ val || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </div>
      <template #footer>
        <ElButton @click="reportPreviewVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 报告详情弹窗 -->
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
        <ElDescriptionsItem label="审核状态">
          <ElTag
            v-if="viewData?.auditStatus"
            :type="getAuditStatusType(viewData.auditStatus)"
            size="small"
          >
            {{ getAuditStatusText(viewData.auditStatus) }}
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

      <!-- 审核记录 -->
      <div v-if="viewData?.auditRecords?.length" class="audit-records">
        <h4 class="audit-records-title">审核记录</h4>
        <div
          v-for="record in viewData.auditRecords"
          :key="record.level"
          class="audit-record-item"
        >
          <div class="audit-record-header">
            <span class="audit-record-level">
              {{ record.level === 1 ? '一级审核' : '二级审核' }}
            </span>
            <ElTag
              :type="record.result === 'pass' ? 'success' : 'danger'"
              size="small"
            >
              {{ record.result === 'pass' ? '通过' : '驳回' }}
            </ElTag>
          </div>
          <ElDescriptions :column="2" border size="small">
            <ElDescriptionsItem label="审核人">
              {{ record.auditor || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审核时间">
              {{ record.auditTime || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审核意见" :span="2">
              {{ record.auditRemark || '-' }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>
      </div>
      <div v-else class="audit-records-empty">
        <span class="text-g-500">暂无审核记录</span>
      </div>
      <template #footer>
        <ElButton @click="viewDialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleReportPreviewFromDetail">预览报告</ElButton>
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

  defineOptions({ name: 'ReportAudit' })

  const reportStore = useReportStore()

  const loading = ref(false)
  const searchExpanded = ref(false)
  const submitting = ref(false)

  // ===== 查询条件 =====
  const searchForm = reactive({
    patientName: '',
    sampleNo: '',
    projectName: '',
    auditStatus: ''
  })

  // ===== 审核状态选项 =====
  const auditStatusOptions = [
    { label: '待审核', value: 'pending' },
    { label: '一级审核通过', value: 'level1Passed' },
    { label: '审核通过', value: 'passed' },
    { label: '已驳回', value: 'rejected' }
  ]

  const getAuditStatusText = (status: string) => {
    return auditStatusOptions.find((o) => o.value === status)?.label || status
  }

  // 审核状态颜色映射（按功能文档要求）
  const getAuditStatusType = (status: string) => {
    const map: Record<string, string> = {
      pending: 'info',
      level1Passed: 'warning',
      passed: 'success',
      rejected: 'danger'
    }
    return map[status] || 'info'
  }

  const toggleSearchExpand = () => {
    searchExpanded.value = !searchExpanded.value
  }

  // ===== 状态 =====
  const tableData = ref<ReportItem[]>([])
  const selectedRows = ref<ReportItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const currentRow = ref<ReportItem | null>(null)
  const viewData = ref<ReportItem | null>(null)
  const previewData = ref<ReportItem | null>(null)

  // ===== 弹窗状态 =====
  const auditDrawerVisible = ref(false)
  const viewDialogVisible = ref(false)
  const reportPreviewVisible = ref(false)

  // ===== 审核表单 =====
  const auditForm = reactive({
    auditRemark: ''
  })

  // 审核抽屉标题：根据当前审核状态显示"一级审核"或"二级审核"
  const auditDrawerTitle = computed(() => {
    if (!currentRow.value) return '报告审核'
    return currentRow.value.auditStatus === 'pending' ? '一级审核' : '二级审核'
  })

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
      prop: 'auditStatus',
      label: '审核状态',
      width: 120,
      useSlot: true,
      slotName: 'auditStatusSlot'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 192,
      fixed: 'right',
      formatter: (row: ReportItem) =>
        h('div', { class: 'flex-c' }, [
          // 审核：待审核或一级审核通过时显示
          (row.auditStatus === 'pending' || row.auditStatus === 'level1Passed') &&
            h(ArtButtonTable, {
              icon: 'ri:checkbox-circle-line',
              iconClass: 'bg-success/12 text-success',
              title: row.auditStatus === 'pending' ? '一级审核' : '二级审核',
              onClick: () => handleAudit(row)
            }),
          // 取消审核：一级审核通过或审核通过时显示
          (row.auditStatus === 'level1Passed' || row.auditStatus === 'passed') &&
            h(ArtButtonTable, {
              icon: 'ri:close-circle-line',
              iconClass: 'bg-warning/12 text-warning',
              title: '取消审核',
              onClick: () => handleCancelAudit(row)
            }),
          // 打印：审核通过时显示
          row.auditStatus === 'passed' &&
            h(ArtButtonTable, {
              icon: 'ri:printer-line',
              iconClass: 'bg-success/12 text-success',
              title: '打印',
              onClick: () => handlePrint(row)
            }),
          // 查看：始终显示
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
      let filtered = reportStore.getAuditReports()
      if (searchForm.patientName) {
        filtered = filtered.filter((r) => r.patientName.includes(searchForm.patientName))
      }
      if (searchForm.sampleNo) {
        filtered = filtered.filter((r) => r.sampleNo.includes(searchForm.sampleNo))
      }
      if (searchForm.projectName) {
        filtered = filtered.filter((r) => r.projectName.includes(searchForm.projectName))
      }
      if (searchForm.auditStatus) {
        filtered = filtered.filter((r) => r.auditStatus === searchForm.auditStatus)
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
      projectName: '',
      auditStatus: ''
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

  // ===== 审核 =====
  const handleAudit = (row: ReportItem) => {
    currentRow.value = row
    auditForm.auditRemark = ''
    auditDrawerVisible.value = true
  }

  const handleAuditPass = () => {
    if (!currentRow.value) return
    const confirmText = currentRow.value.auditStatus === 'pending'
      ? '确认一级审核通过？通过后将推送至二级审核。'
      : '确认二级审核通过？'
    ElMessageBox.confirm(confirmText, '审核确认', {
      confirmButtonText: '确定通过',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      doAudit(true)
    })
  }

  const handleAuditReject = () => {
    if (!currentRow.value) return
    ElMessageBox.confirm('确认驳回该报告审核？驳回后报告将退回至书写阶段。', '驳回确认', {
      confirmButtonText: '确定驳回',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      if (!auditForm.auditRemark.trim()) {
        ElMessage.warning('驳回时请填写审核意见')
        return
      }
      doAudit(false)
    })
  }

  const doAudit = (passed: boolean) => {
    if (!currentRow.value) return
    submitting.value = true
    setTimeout(() => {
      submitting.value = false
      const originalStatus = currentRow.value!.auditStatus
      reportStore.auditReport(currentRow.value!.id, passed, auditForm.auditRemark)

      if (passed) {
        if (originalStatus === 'pending') {
          ElMessage.success('一级审核通过，已推送至二级审核')
        } else {
          ElMessage.success('二级审核通过')
        }
      } else {
        ElMessage.success('审核已驳回，报告已退回至书写阶段')
      }

      auditDrawerVisible.value = false
      fetchData()
    }, 300)
  }

  // ===== 取消审核 =====
  const handleCancelAudit = (row: ReportItem) => {
    ElMessageBox.confirm(
      `确定要取消「${row.patientName}」的报告审核吗？取消后需重新审核。`,
      '取消审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      reportStore.cancelAudit(row.id)
      ElMessage.success('已取消审核')
      fetchData()
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

  // ===== 预览报告 =====
  const handleReportPreview = (row: ReportItem) => {
    previewData.value = { ...row }
    reportPreviewVisible.value = true
  }

  const handleReportPreviewFromDetail = () => {
    if (viewData.value) {
      previewData.value = { ...viewData.value }
      reportPreviewVisible.value = true
    }
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
      '审核状态',
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
      getAuditStatusText(r.auditStatus),
      r.createTime
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `报告审核记录导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .report-audit {
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

    // ===== 审核抽屉 =====
    .audit-drawer-body {
      height: calc(100vh - 140px);
      overflow-y: auto;
    }

    .audit-drawer-footer {
      display: flex;
      align-items: center;
      gap: 10px;

      .audit-remark-input {
        flex: 1;
      }
    }

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

      .doc-section-title {
        font-size: 15px;
        font-weight: 600;
        margin: 12px 0 8px;
        color: #333;
        border-bottom: 1px solid #ccc;
        padding-bottom: 6px;
      }

      .audit-record-block {
        margin-bottom: 10px;
        padding: 8px 12px;
        background: #fafafa;
        border-left: 3px solid var(--el-color-primary);
        border-radius: 0 4px 4px 0;

        &:last-child {
          margin-bottom: 0;
        }

        .audit-record-line {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #555;
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }

          .record-level {
            font-weight: 600;
            color: #333;
          }
        }
      }
    }

    .audit-records {
      margin-top: 20px;

      .audit-records-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--el-border-color);
      }

      .audit-record-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .audit-record-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;

          .audit-record-level {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }
      }
    }

    .audit-records-empty {
      margin-top: 20px;
      padding: 24px 0;
      text-align: center;
      border-top: 1px solid var(--el-border-color);
    }
  }
</style>
