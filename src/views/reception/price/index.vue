<!-- 项目价格维护 -->
<template>
  <div class="price-manage art-full-height">
    <!-- 查询条件 -->
    <PriceSearchForm @search="handleSearch" @reset="handleResetSearch" />

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
            <ElButton type="primary" @click="handleAdd">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新增
            </ElButton>
            <ElButton
              type="danger"
              :disabled="selectedRows.length === 0"
              @click="handleDisable"
            >
              <ArtSvgIcon icon="ri:forbid-line" class="mr-1" />
              停用
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
        <template #amount="{ row }">
          ¥{{ row.amount.toFixed(2) }}
        </template>
        <template #notifyDays="{ row }">
          {{ row.notifyDays }}个工作日
        </template>
        <template #status="{ row }">
          <ElTag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
            {{ row.status }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新增/编辑/查看/项目变更 抽屉 -->
    <PriceFormDrawer
      v-model:visible="formDrawerVisible"
      :mode="drawerMode"
      :edit-data="currentRow"
      @submit="handleFormSubmit"
    />

    <!-- 项目变更记录弹窗 -->
    <PriceChangeLogDialog v-model:visible="changeLogVisible" :row-data="currentRow" />

    <!-- 人员变更记录弹窗 -->
    <PricePersonLogDialog v-model:visible="personLogVisible" :row-data="currentRow" />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag, ElMessageBox, ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import PriceSearchForm from './modules/price-search-form.vue'
  import PriceFormDrawer from './modules/price-form-drawer.vue'
  import PriceChangeLogDialog from './modules/price-change-log-dialog.vue'
  import PricePersonLogDialog from './modules/price-person-log-dialog.vue'

  defineOptions({ name: 'PriceMaintain' })

  interface PriceItem {
    id: number
    projectCode: string
    projectName: string
    category: string
    amount: number
    group: string
    sampleType: string
    extractionType: string
    notifyDays: number
    status: string
    projectLeader?: string
    auditor?: string
  }

  // 搜索参数
  const searchParams = reactive({
    projectName: '',
    projectCode: ''
  })

  // 加载状态
  const loading = ref(false)

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const selectedRows = ref<PriceItem[]>([])
  const formDrawerVisible = ref(false)
  const changeLogVisible = ref(false)
  const personLogVisible = ref(false)
  const drawerMode = ref<'add' | 'edit' | 'view' | 'change'>('add')
  const currentRow = ref<any>({})

  // Mock data
  const mockData: PriceItem[] = [
    { id: 1, projectCode: 'EGFR-2026-001', projectName: 'EGFR基因突变检测', category: '基因突变检测', amount: 2800, group: '靶向用药', sampleType: '组织+血液', extractionType: 'DNA', notifyDays: 3, status: '启用', projectLeader: '陈医生', auditor: '刘主任' },
    { id: 2, projectCode: 'KRAS-2026-002', projectName: 'KRAS基因突变检测', category: '基因突变检测', amount: 2400, group: '靶向用药', sampleType: '组织', extractionType: 'DNA', notifyDays: 3, status: '启用', projectLeader: '陈医生', auditor: '刘主任' },
    { id: 3, projectCode: 'BRAF-2026-003', projectName: 'BRAF V600E突变检测', category: '基因突变检测', amount: 1800, group: '靶向用药', sampleType: '组织', extractionType: 'DNA', notifyDays: 2, status: '启用', projectLeader: '杨医生', auditor: '刘主任' },
    { id: 4, projectCode: 'HER2-2026-004', projectName: 'HER2基因扩增检测', category: '基因扩增检测', amount: 3200, group: '靶向用药', sampleType: '组织', extractionType: 'DNA', notifyDays: 4, status: '启用', projectLeader: '黄医生', auditor: '刘主任' },
    { id: 5, projectCode: 'ALK-2026-005', projectName: 'ALK融合基因检测', category: '融合基因检测', amount: 2600, group: '靶向用药', sampleType: '组织', extractionType: 'RNA', notifyDays: 3, status: '启用', projectLeader: '陈医生', auditor: '刘主任' },
    { id: 6, projectCode: 'ROS1-2026-006', projectName: 'ROS1融合基因检测', category: '融合基因检测', amount: 2600, group: '靶向用药', sampleType: '组织', extractionType: 'RNA', notifyDays: 3, status: '启用', projectLeader: '杨医生', auditor: '刘主任' },
    { id: 7, projectCode: 'MET-2026-007', projectName: 'MET外显子14跳跃检测', category: '基因突变检测', amount: 2200, group: '靶向用药', sampleType: '组织+血液', extractionType: 'RNA', notifyDays: 3, status: '启用', projectLeader: '黄医生', auditor: '刘主任' },
    { id: 8, projectCode: 'NGS-2026-008', projectName: 'NGS多基因联合检测', category: '高通量测序', amount: 6800, group: '综合检测', sampleType: '组织+血液', extractionType: 'DNA', notifyDays: 7, status: '启用', projectLeader: '陈医生', auditor: '刘主任' },
    { id: 9, projectCode: 'PIK3CA-009', projectName: 'PIK3CA突变检测', category: '基因突变检测', amount: 2000, group: '靶向用药', sampleType: '组织', extractionType: 'DNA', notifyDays: 3, status: '启用', projectLeader: '杨医生', auditor: '刘主任' },
    { id: 10, projectCode: 'TP53-2026-010', projectName: 'TP53基因突变检测', category: '基因突变检测', amount: 1800, group: '辅助诊断', sampleType: '组织', extractionType: 'DNA', notifyDays: 2, status: '启用', projectLeader: '黄医生', auditor: '刘主任' }
  ]

  const allData = ref<PriceItem[]>([...mockData])
  const data = ref<PriceItem[]>([])

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'projectName', label: '项目名称', minWidth: 180, fixed: 'left' },
    { prop: 'projectCode', label: '项目编码', width: 140 },
    { prop: 'category', label: '项目分类', width: 120 },
    { prop: 'amount', label: '金额(元)', width: 100, align: 'right', useSlot: true },
    { prop: 'group', label: '分组', width: 100 },
    { prop: 'sampleType', label: '血液/组织类型', width: 130 },
    { prop: 'extractionType', label: '核酸提取类型', width: 120 },
    { prop: 'notifyDays', label: '报告通知时间', width: 110, align: 'center', useSlot: true },
    { prop: 'status', label: '状态', width: 80, align: 'center', useSlot: true },
    {
      prop: 'operation',
      label: '操作',
      width: 192,
      fixed: 'right',
      formatter: (row: PriceItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEdit(row)
          }),
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => handleView(row)
          }),
          h(ArtButtonTable, {
            icon: 'ri:exchange-line',
            iconClass: 'bg-warning/12 text-warning',
            title: '调价',
            onClick: () => handleChange(row)
          }),
          h(
            ElDropdown,
            { trigger: 'click', onClick: () => {} },
            {
              default: () =>
                h(
                  'div',
                  {
                    class: 'inline-flex items-center justify-center min-w-8 h-8 px-2.5 mr-2.5 text-sm cursor-pointer rounded-md align-middle bg-g-300/55 dark:bg-g-300/40 text-g-700 hover:bg-g-300'
                  },
                  [h(ArtSvgIcon, { icon: 'ri:more-2-fill' })]
                ),
              dropdown: () =>
                h(ElDropdownMenu, null, {
                  default: () => [
                    h(
                      ElDropdownItem,
                      { onClick: () => handleMore('changeLog', row) },
                      { default: () => '项目变更记录' }
                    ),
                    h(
                      ElDropdownItem,
                      { onClick: () => handleMore('personLog', row) },
                      { default: () => '人员变更记录' }
                    )
                  ]
                })
            }
          )
        ])
    }
  ])

  // 获取分页数据
  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = allData.value.filter((item) => {
        const matchName = !searchParams.projectName || item.projectName.includes(searchParams.projectName)
        const matchCode = !searchParams.projectCode || item.projectCode.includes(searchParams.projectCode)
        return matchName && matchCode
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
    searchParams.projectName = ''
    searchParams.projectCode = ''
    pagination.current = 1
    fetchPageData()
  }

  const handleSelectionChange = (rows: PriceItem[]) => {
    selectedRows.value = rows
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

  const handleAdd = () => {
    drawerMode.value = 'add'
    currentRow.value = {}
    formDrawerVisible.value = true
  }

  const handleEdit = (row: PriceItem) => {
    drawerMode.value = 'edit'
    currentRow.value = { ...row }
    formDrawerVisible.value = true
  }

  const handleView = (row: PriceItem) => {
    drawerMode.value = 'view'
    currentRow.value = { ...row }
    formDrawerVisible.value = true
  }

  const handleChange = (row: PriceItem) => {
    drawerMode.value = 'change'
    currentRow.value = { ...row }
    formDrawerVisible.value = true
  }

  const handleMore = (command: string, row: PriceItem) => {
    currentRow.value = { ...row }
    if (command === 'changeLog') {
      changeLogVisible.value = true
    } else if (command === 'personLog') {
      personLogVisible.value = true
    }
  }

  const handleDisable = () => {
    ElMessageBox.confirm(
      `确定要停用选中的 ${selectedRows.value.length} 条数据吗？`,
      '停用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const ids = selectedRows.value.map((r) => r.id)
      allData.value.forEach((item) => {
        if (ids.includes(item.id)) item.status = '停用'
      })
      selectedRows.value = []
      ElMessage.success('停用成功')
      fetchPageData()
    })
  }

  const handleFormSubmit = (formData: any) => {
    if (drawerMode.value === 'add') {
      const newId = Math.max(...allData.value.map((d) => d.id), 0) + 1
      allData.value.unshift({ ...formData, id: newId, status: '启用' })
      ElMessage.success('新增成功')
    } else if (drawerMode.value === 'edit' || drawerMode.value === 'change') {
      const idx = allData.value.findIndex((d) => d.id === currentRow.value.id)
      if (idx > -1) allData.value[idx] = { ...allData.value[idx], ...formData }
      ElMessage.success(drawerMode.value === 'change' ? '项目变更成功' : '修改成功')
    }
    fetchPageData()
  }

  // 初始化
  onMounted(() => {
    fetchPageData()
  })
</script>
