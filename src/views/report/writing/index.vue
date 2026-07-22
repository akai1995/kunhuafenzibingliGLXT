<!-- 报告书写 -->
<template>
  <div class="report-writing art-full-height">
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
            <ElFormItem label="报告状态">
              <ElSelect
                v-model="searchForm.reportStatus"
                placeholder="请选择报告状态"
                clearable
                style="width: 100%"
                @change="handleSearch"
              >
                <ElOption label="未书写" value="未书写" />
                <ElOption label="书写中" value="书写中" />
                <ElOption label="已书写" value="已书写" />
                <ElOption label="已驳回" value="已驳回" />
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
          <ElButton
            :disabled="selectedRows.length === 0"
            @click="handleBatchExport"
          >
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
        <template #reportStatusSlot="{ row }">
          <ElTag :type="getReportStatusType(row)" size="small">
            {{ row.auditStatus === 'rejected' ? '已驳回' : row.reportStatus }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 报告书写弹窗 -->
    <OrderReportDialog
      v-model:visible="reportDialogVisible"
      :order-data="currentRow"
      @draft="handleReportDraft"
      @save="handleReportSave"
      @submit="handleReportSubmit"
    />

    <!-- 报告查看抽屉 -->
    <OrderReportViewDrawer
      v-model:visible="viewDrawerVisible"
      :row-data="currentRow"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { ColumnOption } from '@/types'
  import type { ReportItem } from '../shared/report-data'
  import { useReportStore } from '../shared/report-data'
  import OrderReportDialog from '@/views/reception/order-manage/modules/order-report-dialog.vue'
  import OrderReportViewDrawer from '@/views/reception/order-manage/modules/order-report-view-drawer.vue'

  defineOptions({ name: 'ReportWriting' })

  const reportApi = useReportStore()

  const loading = ref(false)
  const searchExpanded = ref(false)

  // ===== 查询条件 =====
  const searchForm = reactive({
    patientName: '',
    sampleNo: '',
    projectName: '',
    reportStatus: ''
  })

  const toggleSearchExpand = () => {
    searchExpanded.value = !searchExpanded.value
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    Object.assign(searchForm, {
      patientName: '',
      sampleNo: '',
      projectName: '',
      reportStatus: ''
    })
    pagination.current = 1
    fetchData()
  }

  // ===== 报告状态 =====
  const getReportStatusType = (row: ReportItem) => {
    if (row.auditStatus === 'rejected') return 'danger'
    const map: Record<string, string> = {
      未书写: 'info',
      书写中: 'warning',
      已书写: 'warning',
      已上传: 'success'
    }
    return map[row.reportStatus] || 'info'
  }

  // ===== 数据 =====
  const tableData = ref<ReportItem[]>([])
  const selectedRows = ref<ReportItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

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
      width: 150,
      fixed: 'right',
      formatter: (row: ReportItem) =>
        h('div', { class: 'flex-c' }, [
          // 报告书写：未书写时显示"报告书写"，书写中显示"继续书写"
          (row.reportStatus === '未书写' || row.reportStatus === '书写中' || row.auditStatus === 'rejected') &&
            h(ArtButtonTable, {
              icon: 'ri:file-text-line',
              iconClass: 'bg-theme/12 text-theme',
              title: row.reportStatus === '书写中' ? '继续书写' : '报告书写',
              onClick: () => handleReportWriting(row)
            }),
          // 删除按钮
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDelete(row)
          }),
          // 查看按钮
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
      let filtered = [...reportApi.getWritingReports()]
      if (searchForm.patientName) {
        filtered = filtered.filter((d) => d.patientName.includes(searchForm.patientName))
      }
      if (searchForm.sampleNo) {
        filtered = filtered.filter((d) => d.sampleNo.includes(searchForm.sampleNo))
      }
      if (searchForm.projectName) {
        filtered = filtered.filter((d) => d.projectName.includes(searchForm.projectName))
      }
      if (searchForm.reportStatus) {
        if (searchForm.reportStatus === '已驳回') {
          filtered = filtered.filter((d) => d.auditStatus === 'rejected')
        } else {
          filtered = filtered.filter((d) => d.reportStatus === searchForm.reportStatus)
        }
      }
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      tableData.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchData()

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

  // ===== 报告书写 =====
  const reportDialogVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const currentRow = ref<any>(null)

  const handleReportWriting = (row: ReportItem) => {
    // 映射字段以适配 OrderReportDialog 所需的数据结构
    currentRow.value = {
      ...row,
      applyCode: row.sampleNo,
      sampleCode: row.sampleNo
    }
    reportDialogVisible.value = true
  }

  const handleView = (row: ReportItem) => {
    currentRow.value = {
      ...row,
      applyCode: row.sampleNo,
      sampleCode: row.sampleNo
    }
    viewDrawerVisible.value = true
  }

  const handleReportDraft = (data: any) => {
    if (!currentRow.value) return
    reportApi.saveWriting(currentRow.value.id, data)
    reportDialogVisible.value = false
    ElMessage.success('报告已保存，状态更新为"书写中"')
    fetchData()
  }

  const handleReportSave = (data: any) => {
    if (!currentRow.value) return
    reportApi.saveWriting(currentRow.value.id, data)
    reportDialogVisible.value = false
    ElMessage.success('报告已保存，状态更新为"书写中"')
    fetchData()
  }

  const handleReportSubmit = (data: any) => {
    if (!currentRow.value) return
    reportApi.completeWriting(currentRow.value.id, data)
    reportDialogVisible.value = false
    ElMessage.success('报告书写已完成，状态更新为"已书写"')
    fetchData()
  }

  const handleDelete = (row: ReportItem) => {
    ElMessageBox.prompt(
      `确认删除「${row.patientName}」的「${row.projectName}」报告？请输入密码确认`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        inputType: 'password',
        inputPlaceholder: '请输入删除密码',
        inputValidator: (value: string) => {
          if (!value) return '请输入密码'
          if (value !== '123456') return '密码错误'
          return true
        }
      }
    ).then(() => {
      const success = reportApi.deleteReport(row.id)
      if (success) {
        ElMessage.success('报告已删除')
        fetchData()
      } else {
        ElMessage.error('删除失败')
      }
    }).catch(() => {
      // 用户取消
    })
  }

  // ===== 批量导出 =====
  const handleBatchExport = () => {
    const headers = [
      '患者姓名', '样本编号', '性别', '年龄',
      '项目名称', '病理号', '样本类型', '报告状态'
    ]
    const rows = selectedRows.value.map((r) => [
      r.patientName, r.sampleNo, r.gender, r.age,
      r.projectName, r.pathologyNo, r.sampleType, r.reportStatus
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `报告书写导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .report-writing {
    .search-wrapper {
      padding: 18px 20px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: calc(var(--custom-radius) + 4px);
      margin-bottom: 12px;

      .search-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
      }
    }
  }
</style>
