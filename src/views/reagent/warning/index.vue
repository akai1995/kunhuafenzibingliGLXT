<!-- 库存预警 -->
<template>
  <div class="reagent-warning art-full-height">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="名称">
              <ElInput
                v-model="searchForm.reagentName"
                placeholder="请输入试剂/耗材名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="存放位置">
              <ElSelect
                v-model="searchForm.storageLocation"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption v-for="l in locationOptions" :key="l" :label="l" :value="l" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="库存状态">
              <ElSelect
                v-model="searchForm.stockStatus"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption label="低于阈值" value="低于阈值" />
                <ElOption label="严重缺货" value="严重缺货" />
                <ElOption label="即将过期" value="即将过期" />
                <ElOption label="已过期" value="已过期" />
              </ElSelect>
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
            <ElFormItem label="类型">
              <ElSelect
                v-model="searchForm.category"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption label="试剂" value="试剂" />
                <ElOption label="耗材" value="耗材" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow v-show="searchExpanded" :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="供应商">
              <ElSelect
                v-model="searchForm.supplier"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption v-for="s in supplierOptions" :key="s" :label="s" :value="s" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 12 }">
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

    <!-- 统计卡片 -->
    <ElRow :gutter="12">
      <ElCol :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon bg-primary/12 text-primary">
            <ArtSvgIcon icon="ri:alarm-warning-line" />
          </div>
          <div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">预警总数</div>
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon bg-warning/12 text-warning">
            <ArtSvgIcon icon="ri:arrow-down-double-line" />
          </div>
          <div>
            <div class="stat-value">{{ stats.lowThreshold }}</div>
            <div class="stat-label">低于阈值</div>
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon bg-danger/12 text-danger">
            <ArtSvgIcon icon="ri:error-warning-line" />
          </div>
          <div>
            <div class="stat-value">{{ stats.severeShortage }}</div>
            <div class="stat-label">严重缺货</div>
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon bg-info/12 text-info">
            <ArtSvgIcon icon="ri:calendar-close-line" />
          </div>
          <div>
            <div class="stat-value">{{ stats.expiring }}</div>
            <div class="stat-label">即将/已过期</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElButton :disabled="selectedRows.length === 0" @click="handleBatchExport">
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            批量导出
          </ElButton>
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
        <template #stockStatus="{ row }">
          <ElTag :type="statusTagType(row.stockStatus)" size="small">
            {{ row.stockStatus }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ReagentWarning' })

  interface WarningItem {
    id: number
    reagentName: string
    kitNo: string
    category: string
    spec: string
    currentStock: number
    threshold: number
    unit: string
    shortage: number
    suggestedPurchase: number
    supplier: string
    storageLocation: string
    lastPurchaseDate: string
    expiryDate: string
    stockStatus: string
  }

  // 选项数据
  const supplierOptions = [
    '赛默飞',
    '罗氏诊断',
    '凯杰',
    'Illumina',
    '安捷伦'
  ]
  const locationOptions = [
    '冰箱A-1层-1盒',
    '冰箱A-1层-2盒',
    '冰箱A-2层-1盒',
    '冰箱A-2层-3盒',
    '冰箱B-1层-1盒',
    '冰箱B-1层-2盒',
    '冰箱B-2层-1盒',
    '冰箱B-2层-2盒'
  ]

  // 日期工具
  const today = new Date('2026-07-06')
  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  // Mock 数据（8 条预警记录）
  // 库存状态分布：低于阈值 3条、严重缺货 2条、即将过期 1条、已过期 2条
  const reagentNames = [
    'EGFR检测试剂盒',
    'KRAS检测试剂盒',
    'BRAF检测试剂盒',
    'DNA提取试剂盒',
    'RNA提取试剂盒',
    'FISH探针试剂盒',
    'NGS文库构建试剂盒',
    'PCR Master Mix'
  ]
  const specs = ['50T', '100T', '200T', '48测试', '96测试', '100mL', '500g', '100mg']
  const units = ['盒', '盒', '盒', '盒', '盒', '盒', '套', '瓶']
  const categories = ['试剂', '试剂', '试剂', '试剂', '试剂', '试剂', '试剂', '试剂']

  const mockData: WarningItem[] = [
    {
      id: 1,
      reagentName: 'EGFR检测试剂盒',
      kitNo: 'KT-EGFR-001',
      category: '试剂',
      spec: '50T',
      currentStock: 3,
      threshold: 10,
      unit: '盒',
      shortage: 7,
      suggestedPurchase: 15,
      supplier: '赛默飞',
      storageLocation: '冰箱A-1层-1盒',
      lastPurchaseDate: '2026-06-15',
      expiryDate: '2027-03-20',
      stockStatus: '低于阈值'
    },
    {
      id: 2,
      reagentName: 'KRAS检测试剂盒',
      kitNo: 'KT-KRAS-002',
      category: '试剂',
      spec: '100T',
      currentStock: 2,
      threshold: 10,
      unit: '盒',
      shortage: 8,
      suggestedPurchase: 15,
      supplier: '罗氏诊断',
      storageLocation: '冰箱A-1层-2盒',
      lastPurchaseDate: '2026-05-20',
      expiryDate: '2027-06-15',
      stockStatus: '低于阈值'
    },
    {
      id: 3,
      reagentName: 'BRAF检测试剂盒',
      kitNo: 'KT-BRAF-003',
      category: '试剂',
      spec: '200T',
      currentStock: 4,
      threshold: 10,
      unit: '盒',
      shortage: 6,
      suggestedPurchase: 15,
      supplier: '凯杰',
      storageLocation: '冰箱A-2层-1盒',
      lastPurchaseDate: '2026-06-01',
      expiryDate: '2027-08-30',
      stockStatus: '低于阈值'
    },
    {
      id: 4,
      reagentName: 'DNA提取试剂盒',
      kitNo: 'KT-DNA-004',
      category: '试剂',
      spec: '48测试',
      currentStock: 0,
      threshold: 10,
      unit: '盒',
      shortage: 10,
      suggestedPurchase: 20,
      supplier: 'Illumina',
      storageLocation: '冰箱A-2层-3盒',
      lastPurchaseDate: '2026-06-10',
      expiryDate: '2027-05-25',
      stockStatus: '严重缺货'
    },
    {
      id: 5,
      reagentName: 'RNA提取试剂盒',
      kitNo: 'KT-RNA-005',
      category: '试剂',
      spec: '96测试',
      currentStock: 1,
      threshold: 8,
      unit: '盒',
      shortage: 7,
      suggestedPurchase: 16,
      supplier: '安捷伦',
      storageLocation: '冰箱B-1层-1盒',
      lastPurchaseDate: '2026-06-20',
      expiryDate: '2027-02-10',
      stockStatus: '严重缺货'
    },
    {
      id: 6,
      reagentName: 'FISH探针试剂盒',
      kitNo: 'KT-FISH-006',
      category: '试剂',
      spec: '100mL',
      currentStock: 12,
      threshold: 10,
      unit: '盒',
      shortage: 0,
      suggestedPurchase: 12,
      supplier: '赛默飞',
      storageLocation: '冰箱B-1层-2盒',
      lastPurchaseDate: '2026-04-15',
      expiryDate: '2026-07-15',
      stockStatus: '即将过期'
    },
    {
      id: 7,
      reagentName: 'NGS文库构建试剂盒',
      kitNo: 'KT-NGS-007',
      category: '试剂',
      spec: '500g',
      currentStock: 5,
      threshold: 10,
      unit: '套',
      shortage: 0,
      suggestedPurchase: 5,
      supplier: '罗氏诊断',
      storageLocation: '冰箱B-2层-1盒',
      lastPurchaseDate: '2026-03-10',
      expiryDate: '2026-06-20',
      stockStatus: '已过期'
    },
    {
      id: 8,
      reagentName: 'PCR Master Mix',
      kitNo: 'KT-PCR-008',
      category: '试剂',
      spec: '100mg',
      currentStock: 3,
      threshold: 10,
      unit: '瓶',
      shortage: 0,
      suggestedPurchase: 3,
      supplier: '凯杰',
      storageLocation: '冰箱B-2层-2盒',
      lastPurchaseDate: '2026-02-25',
      expiryDate: '2026-05-30',
      stockStatus: '已过期'
    }
  ]

  // 查询条件
  const searchForm = reactive({
    reagentName: '',
    storageLocation: '',
    stockStatus: '',
    category: '',
    supplier: ''
  })

  // 状态
  const loading = ref(false)
  const data = ref<WarningItem[]>([])
  const filteredData = ref<WarningItem[]>([])
  const selectedRows = ref<WarningItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // 统计数据
  const stats = computed(() => ({
    total: filteredData.value.length,
    lowThreshold: filteredData.value.filter((d) => d.stockStatus === '低于阈值').length,
    severeShortage: filteredData.value.filter((d) => d.stockStatus === '严重缺货').length,
    expiring: filteredData.value.filter(
      (d) => d.stockStatus === '即将过期' || d.stockStatus === '已过期'
    ).length
  }))

  // 状态标签类型
  const statusTagType = (status: string) => {
    const map: Record<string, string> = {
      低于阈值: 'warning',
      严重缺货: 'danger',
      即将过期: 'info',
      已过期: 'danger'
    }
    return (map[status] || 'info') as any
  }

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'reagentName', label: '试剂/耗材名称', width: 160, fixed: 'left' },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    { prop: 'category', label: '类型', width: 80 },
    { prop: 'spec', label: '规格型号', width: 120 },
    {
      prop: 'currentStock',
      label: '当前库存',
      width: 100,
      sortable: true,
      formatter: (row: WarningItem) => `${row.currentStock} ${row.unit}`
    },
    {
      prop: 'threshold',
      label: '阈值',
      width: 90,
      formatter: (row: WarningItem) => `${row.threshold} ${row.unit}`
    },
    {
      prop: 'shortage',
      label: '缺货数量',
      width: 100,
      formatter: (row: WarningItem) => (row.shortage > 0 ? `${row.shortage} ${row.unit}` : '-')
    },
    {
      prop: 'suggestedPurchase',
      label: '建议采购量',
      width: 110,
      formatter: (row: WarningItem) => `${row.suggestedPurchase} ${row.unit}`
    },
    { prop: 'supplier', label: '供应商', width: 120 },
    { prop: 'storageLocation', label: '存放位置', width: 120 },
    {
      prop: 'lastPurchaseDate',
      label: '最后采购日期',
      width: 130,
      sortable: true
    },
    { prop: 'expiryDate', label: '有效期', width: 120, sortable: true },
    { prop: 'stockStatus', label: '库存状态', width: 110, useSlot: true },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: WarningItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            icon: 'ri:shopping-cart-2-line',
            iconClass: 'bg-primary/12 text-primary',
            title: '生成采购',
            onClick: () => handleGeneratePurchase(row)
          })
        ])
    }
  ])

  // 数据获取
  const fetchData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = mockData.filter((item) => {
        if (searchForm.reagentName && !item.reagentName.includes(searchForm.reagentName))
          return false
        if (searchForm.storageLocation && item.storageLocation !== searchForm.storageLocation)
          return false
        if (searchForm.stockStatus && item.stockStatus !== searchForm.stockStatus) return false
        if (searchForm.category && item.category !== searchForm.category) return false
        if (searchForm.supplier && item.supplier !== searchForm.supplier) return false
        return true
      })
      filteredData.value = filtered
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchData()

  // 查询/重置
  const searchExpanded = ref(false)
  const toggleSearchExpand = () => {
    searchExpanded.value = !searchExpanded.value
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    Object.assign(searchForm, {
      reagentName: '',
      storageLocation: '',
      stockStatus: '',
      category: '',
      supplier: ''
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

  const handleSelectionChange = (selection: WarningItem[]) => {
    selectedRows.value = selection
  }

  // 一键生成采购申请
  const handleGeneratePurchase = (row: WarningItem) => {
    ElMessageBox.confirm(
      `确定要为「${row.reagentName}」生成采购申请吗？建议采购量：${row.suggestedPurchase} ${row.unit}`,
      '生成采购申请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      ElMessage.success('已生成采购申请')
    }).catch(() => {})
  }

  // 批量导出
  const handleBatchExport = () => {
    const headers = [
      '试剂/耗材名称',
      '类型',
      '规格型号',
      '当前库存',
      '阈值',
      '缺货数量',
      '建议采购量',
      '供应商',
      '存放位置',
      '最后采购日期',
      '有效期',
      '库存状态'
    ]
    const rows = selectedRows.value.map((r) => [
      r.reagentName,
      r.category,
      r.spec,
      r.currentStock,
      r.threshold,
      r.shortage,
      r.suggestedPurchase,
      r.supplier,
      r.storageLocation,
      r.lastPurchaseDate,
      r.expiryDate,
      r.stockStatus
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `库存预警数据导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
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

  .stat-card {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: calc(var(--custom-radius) + 4px);

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      margin-right: 16px;
      font-size: 22px;
      border-radius: 10px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
    }

    .stat-label {
      margin-top: 4px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
