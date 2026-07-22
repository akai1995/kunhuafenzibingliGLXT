<!-- 操作日志 -->
<template>
  <div class="sample-log art-full-height">
    <!-- 查询条件 -->
    <LogSearchForm @search="handleSearch" @reset="handleResetSearch" />

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
            <ElButton :disabled="selectedRows.length === 0" @click="handleExport">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              批量导出
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
        <template #logType="{ row }">
          <ElTag :type="logTypeMap[row.logType] || 'info'" size="small">
            {{ row.logType }}
          </ElTag>
        </template>
        <template #operationType="{ row }">
          <ElTag :type="operationTypeMap[row.operationType] || 'info'" size="small">
            {{ row.operationType }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElTag, ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import LogSearchForm from './modules/log-search-form.vue'

  defineOptions({ name: 'SampleLog' })

  interface LogItem {
    id: number
    content: string
    operationTime: string
    operator: string
    operationType: string
    logType: string
  }

  const searchParams = reactive({
    operator: '',
    content: '',
    dateRange: null as [string, string] | null,
    logType: '',
    operationType: ''
  })

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<LogItem[]>([])

  // 日志类型样式映射
  const logTypeMap: Record<string, any> = {
    '接诊管理': '',
    '样本管理': 'success',
    '质控管理': 'warning',
    '报告管理': 'primary',
    '试剂管理': 'danger',
    '系统管理': 'info',
    '存储管理': ''
  }

  // 操作类型样式映射
  const operationTypeMap: Record<string, any> = {
    新增: 'success',
    编辑: 'primary',
    删除: 'danger',
    查看: 'info',
    登记: 'success',
    状态变更: 'warning',
    导出: 'info',
    导入: 'info'
  }

  // Mock data
  const mockData: LogItem[] = [
    // 接诊管理
    { id: 1, content: '新增接诊单 AP2026070001，患者：张伟', operationTime: '2026-07-01 08:30:15', operator: '张医生', operationType: '新增', logType: '接诊管理' },
    { id: 2, content: '提交接诊单 AP2026070002，患者：李娜', operationTime: '2026-07-01 09:00:30', operator: '王医生', operationType: '登记', logType: '接诊管理' },
    { id: 3, content: '编辑接诊单 AP2026070003，患者：王建国', operationTime: '2026-07-01 09:35:10', operator: '陈医生', operationType: '编辑', logType: '接诊管理' },
    // 样本管理
    { id: 4, content: '核收样本 BC2026070009，患者：郑浩，结果：通过', operationTime: '2026-07-03 15:00:00', operator: '李医生', operationType: '状态变更', logType: '样本管理' },
    { id: 5, content: '入库样本 BC2026070001，患者：张伟，位置：冰箱A-冻存架1-冻存盒1-1', operationTime: '2026-07-01 11:00:22', operator: '赵技师', operationType: '登记', logType: '样本管理' },
    { id: 6, content: '修改样本 BC2026070003 的存储位置为 液氮罐1-冻存架1-冻存盒1-1', operationTime: '2026-07-02 09:15:45', operator: '赵技师', operationType: '编辑', logType: '样本管理' },
    { id: 7, content: '导出样本数据列表，共 10 条', operationTime: '2026-07-03 10:30:00', operator: '刘医生', operationType: '导出', logType: '样本管理' },
    // 质控管理
    { id: 8, content: '样本确认 S2026070001，患者：张伟，结果：通过', operationTime: '2026-07-01 14:00:00', operator: '质控员A', operationType: '状态变更', logType: '质控管理' },
    { id: 9, content: '新鲜组织质控 XS2026070001，患者：张伟，结果：合格', operationTime: '2026-07-02 08:15:00', operator: '王医生', operationType: '编辑', logType: '质控管理' },
    { id: 10, content: '血液质控 S2026070002，患者：李娜，结果：合格', operationTime: '2026-07-02 10:00:00', operator: '张医生', operationType: '编辑', logType: '质控管理' },
    { id: 11, content: 'NGSR平台核酸质控 BL20261001，患者：张伟，结果：合格', operationTime: '2026-07-02 14:30:00', operator: '陈医生', operationType: '状态变更', logType: '质控管理' },
    // 报告管理
    { id: 12, content: '报告书写 BL20261001，患者：张伟', operationTime: '2026-07-03 09:00:00', operator: '陈医生', operationType: '新增', logType: '报告管理' },
    { id: 13, content: '报告上传 BL20261001，患者：张伟，EGFR检测报告', operationTime: '2026-07-03 14:00:00', operator: '陈医生', operationType: '登记', logType: '报告管理' },
    { id: 14, content: '报告一级审核 BL20261001，患者：张伟，结果：通过', operationTime: '2026-07-04 09:00:00', operator: '刘主任', operationType: '状态变更', logType: '报告管理' },
    { id: 15, content: '报告二级审核 BL20261002，患者：李娜，结果：通过', operationTime: '2026-07-04 14:00:00', operator: '刘主任', operationType: '状态变更', logType: '报告管理' },
    // 试剂管理
    { id: 16, content: '新增试剂盒 KIT2026001，品名：NGSR文库构建试剂盒', operationTime: '2026-07-01 10:00:00', operator: '系统', operationType: '新增', logType: '试剂管理' },
    { id: 17, content: '导入试剂批量数据，共 5 条', operationTime: '2026-07-02 11:00:00', operator: '刘医生', operationType: '导入', logType: '试剂管理' },
    // 系统管理
    { id: 18, content: '导出操作日志列表，共 20 条', operationTime: '2026-07-05 16:00:00', operator: '系统', operationType: '导出', logType: '系统管理' },
    { id: 19, content: '查看样本 BC2026070005 详情', operationTime: '2026-07-03 08:00:00', operator: '王医生', operationType: '查看', logType: '系统管理' },
    // 存储管理
    { id: 20, content: '新增存储设备 超低温冰箱B，编号：ULT-80C-001', operationTime: '2026-07-01 09:00:00', operator: '系统', operationType: '新增', logType: '存储管理' }
  ]

  const allData = ref<LogItem[]>([...mockData])
  const data = ref<LogItem[]>([])

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'logType', label: '日志类型', width: 110, useSlot: true },
    { prop: 'content', label: '操作内容', minWidth: 280 },
    { prop: 'operationTime', label: '操作时间', width: 180 },
    { prop: 'operator', label: '操作人员', width: 120 },
    { prop: 'operationType', label: '操作类型', width: 110, useSlot: true }
  ])

  // 数据获取
  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = allData.value.filter((item) => {
        const matchOperator = !searchParams.operator || item.operator.includes(searchParams.operator)
        const matchContent = !searchParams.content || item.content.includes(searchParams.content)
        let matchDate = true
        if (searchParams.dateRange) {
          const itemDate = item.operationTime.split(' ')[0]
          matchDate = itemDate >= searchParams.dateRange[0] && itemDate <= searchParams.dateRange[1]
        }
        const matchLogType = !searchParams.logType || item.logType === searchParams.logType
        const matchOperationType = !searchParams.operationType || item.operationType === searchParams.operationType
        return matchOperator && matchContent && matchDate && matchLogType && matchOperationType
      })
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => {
    fetchPageData()
  }

  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchPageData()
  }

  const handleResetSearch = () => {
    Object.assign(searchParams, {
      operator: '',
      content: '',
      dateRange: null,
      logType: '',
      operationType: ''
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

  const handleExport = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要导出的数据')
      return
    }
    ElMessage.success('导出成功')
  }

  const handleSelectionChange = (selection: LogItem[]) => {
    selectedRows.value = selection
  }

  onMounted(() => {
    fetchPageData()
  })
</script>