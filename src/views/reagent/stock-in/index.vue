<!-- 入库管理 -->
<template>
  <div class="reagent-stock-in art-full-height">
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
            <ElFormItem label="条码">
              <ElInput
                v-model="searchForm.barcode"
                placeholder="请输入条码"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="供应商">
              <ElSelect
                v-model="searchForm.supplier"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption
                  v-for="s in supplierOptions"
                  :key="s"
                  :label="s"
                  :value="s"
                />
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
            <ElFormItem label="批次号">
              <ElInput
                v-model="searchForm.batchNo"
                placeholder="请输入批次号"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow v-show="searchExpanded" :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="入库时间">
              <ElDatePicker
                v-model="searchForm.stockInDateRange"
                type="daterange"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="w-full"
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
                <ElOption
                  v-for="l in locationOptions"
                  :key="l"
                  :label="l"
                  :value="l"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 6 }">
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

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader
        :loading="loading"
        @refresh="refreshData"
        :showColumnSetting="true"
        v-model:columns="columns"
      >
        <template #left>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            手动入库
          </ElButton>
          <ElButton
            :disabled="selectedRows.length === 0"
            @click="handleBatchExport"
          >
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
      />
    </ElCard>

    <!-- 手动入库抽屉 -->
    <ElDrawer
      v-model="addDrawerVisible"
      title="手动入库"
      size="600px"
      :close-on-click-modal="true"
    >
      <ElForm
        ref="formRef"
        :key="formKey"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="stock-in-form"
      >
        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem label="扫描条码" prop="barcode">
              <ElInput v-model="formData.barcode" placeholder="请扫描或输入条码">
                <template #append>
                  <ElButton @click="handleScan">
                    <ArtSvgIcon icon="ri:barcode-line" class="mr-0.5" />
                    扫描
                  </ElButton>
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="试剂/耗材名称" prop="reagentName">
              <ElSelect
                v-model="formData.reagentName"
                placeholder="请选择"
                class="w-full"
                filterable
                @change="(val: string) => handleReagentChange(val)"
              >
                <ElOption
                  v-for="r in reagentCatalog"
                  :key="r.name"
                  :label="r.name"
                  :value="r.name"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="规格型号">
              <ElInput v-model="formData.spec" placeholder="选择试剂/耗材后自动带出" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="试剂盒号">
              <ElInput v-model="formData.kitNo" placeholder="选择试剂/耗材后自动带出" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="批次号" prop="batchNo">
              <ElInput v-model="formData.batchNo" placeholder="请输入批次号" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="供应商" prop="supplier">
              <ElSelect
                v-model="formData.supplier"
                placeholder="请选择"
                class="w-full"
                filterable
              >
                <ElOption
                  v-for="s in supplierOptions"
                  :key="s"
                  :label="s"
                  :value="s"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="存放位置" prop="storageLocation">
              <ElSelect
                v-model="formData.storageLocation"
                placeholder="请选择"
                class="w-full"
              >
                <ElOption
                  v-for="l in locationOptions"
                  :key="l"
                  :label="l"
                  :value="l"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="生产日期" prop="productionDate">
              <ElDatePicker
                v-model="formData.productionDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有效期至" prop="expiryDate">
              <ElDatePicker
                v-model="formData.expiryDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="入库数量" prop="quantity">
              <ElInputNumber
                v-model="formData.quantity"
                :min="1"
                class="w-full"
                placeholder="请输入数量"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="addDrawerVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          确定
        </ElButton>
      </template>
    </ElDrawer>

    <!-- 查看详情抽屉 -->
    <ElDrawer
      v-model="viewDrawerVisible"
      title="入库详情"
      size="500px"
      :close-on-click-modal="true"
    >
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="试剂/耗材名称">
          {{ viewData?.reagentName || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="试剂盒号">
          {{ viewData?.kitNo || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="类型">
          {{ viewData?.type || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="规格型号">
          {{ viewData?.spec || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="入库单号">
          {{ viewData?.stockInNo || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="条码">
          {{ viewData?.barcode || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="批次号">
          {{ viewData?.batchNo || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="数量">
          {{ viewData?.quantity || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="供应商">
          {{ viewData?.supplier || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="有效期">
          {{ viewData?.expiryDate || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="存放位置">
          {{ viewData?.storageLocation || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="入库时间">
          {{ viewData?.stockInTime || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="操作员">
          {{ viewData?.operator || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ReagentStockIn' })

  interface StockInItem {
    id: number
    reagentName: string
    kitNo: string
    type: string
    spec: string
    stockInNo: string
    barcode: string
    batchNo: string
    quantity: string
    supplier: string
    expiryDate: string
    storageLocation: string
    stockInTime: string
    operator: string
  }

  // 选项数据
  const supplierOptions = [
    '赛默飞', '罗氏诊断', '凯杰', 'Illumina', '安捷伦'
  ]
  const locationOptions = [
    '冰箱A-1层-1盒', '冰箱A-1层-2盒', '冰箱A-2层-1盒',
    '冰箱A-2层-3盒', '冰箱B-1层-1盒', '冰箱B-1层-2盒',
    '冰箱B-2层-1盒', '冰箱B-2层-2盒', '常温柜C-1层',
    '常温柜C-2层'
  ]

  // Mock 数据
  const reagentNames = [
    'EGFR检测试剂盒', 'KRAS检测试剂盒', 'BRAF检测试剂盒',
    'DNA提取试剂盒', 'RNA提取试剂盒', 'FISH探针试剂盒',
    'NGS文库构建试剂盒', 'PCR Master Mix', '琼脂糖', '蛋白酶K'
  ]
  const reagentCatalog = [
    { name: 'EGFR检测试剂盒', spec: '50T', kitNo: 'KT-EGFR-001', type: '试剂' },
    { name: 'KRAS检测试剂盒', spec: '100T', kitNo: 'KT-KRAS-002', type: '试剂' },
    { name: 'BRAF检测试剂盒', spec: '200T', kitNo: 'KT-BRAF-003', type: '试剂' },
    { name: 'DNA提取试剂盒', spec: '48测试', kitNo: 'KT-DNA-004', type: '试剂' },
    { name: 'RNA提取试剂盒', spec: '96测试', kitNo: 'KT-RNA-005', type: '试剂' },
    { name: 'FISH探针试剂盒', spec: '100T', kitNo: 'KT-FISH-006', type: '试剂' },
    { name: 'NGS文库构建试剂盒', spec: '96测试', kitNo: 'KT-NGS-007', type: '试剂' },
    { name: 'PCR Master Mix', spec: '100mL', kitNo: 'KT-PCR-008', type: '试剂' },
    { name: '琼脂糖', spec: '500g', kitNo: 'HC-AGAR-001', type: '耗材' },
    { name: '蛋白酶K', spec: '100mg', kitNo: 'HC-PK-002', type: '试剂' }
  ]
  const operators = [
    '陈建国', '刘志强', '杨秀英', '赵文博', '黄丽华',
    '周明辉', '吴晓峰', '孙海燕'
  ]
  const specs = ['50T', '100T', '200T', '48测试', '96测试', '100mL', '500g', '100mg']

  const mockData: StockInItem[] = Array.from({ length: 10 }, (_, i) => {
    const day = String(i * 3 + 1).padStart(2, '0')
    const hour = String((i + 8) % 24).padStart(2, '0')
    const minute = String((i * 7) % 60).padStart(2, '0')
    const catalog = reagentCatalog[i % reagentCatalog.length]
    return {
      id: i + 1,
      reagentName: catalog.name,
      kitNo: catalog.kitNo,
      type: catalog.type,
      spec: catalog.spec,
      stockInNo: `RK202607${String(i + 1).padStart(4, '0')}`,
      barcode: `TM202607${String(i + 1).padStart(6, '0')}`,
      batchNo: `B202607${String(i + 1).padStart(2, '0')}`,
      quantity: `${(i % 10) + 3}${i % 3 === 0 ? '盒' : i % 3 === 1 ? '瓶' : '支'}`,
      supplier: supplierOptions[i % supplierOptions.length],
      expiryDate: `2027-0${(i % 9) + 1}-${day}`,
      storageLocation: locationOptions[i % locationOptions.length],
      stockInTime: `2026-07-${day} ${hour}:${minute}`,
      operator: operators[i % operators.length]
    }
  })

  // 查询条件
  const searchForm = reactive({
    reagentName: '',
    barcode: '',
    supplier: '',
    batchNo: '',
    stockInDateRange: [] as string[],
    storageLocation: ''
  })

  // 状态
  const loading = ref(false)
  const data = ref<StockInItem[]>([])
  const selectedRows = ref<StockInItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // 弹窗/抽屉状态
  const addDrawerVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const formKey = ref(0)
  const viewData = ref<any>({})

  // 表单数据
  const formData = reactive({
    barcode: '',
    reagentName: '',
    kitNo: '',
    spec: '',
    batchNo: '',
    supplier: '',
    productionDate: '',
    expiryDate: '',
    quantity: 1,
    storageLocation: ''
  })

  const formRules: FormRules = {
    barcode: [{ required: true, message: '请扫描或输入条码', trigger: 'blur' }],
    reagentName: [{ required: true, message: '请选择试剂/耗材名称', trigger: 'change' }],
    batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
    supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    productionDate: [
      { required: true, message: '请选择生产日期', trigger: 'change' }
    ],
    expiryDate: [{ required: true, message: '请选择有效期', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    storageLocation: [
      { required: true, message: '请选择存放位置', trigger: 'change' }
    ]
  }

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'reagentName', label: '试剂/耗材名称', width: 160, fixed: 'left' },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    { prop: 'type', label: '类型', width: 80 },
    { prop: 'spec', label: '规格型号', width: 120 },
    { prop: 'stockInNo', label: '入库单号', width: 170 },
    { prop: 'barcode', label: '条码', width: 130 },
    { prop: 'batchNo', label: '批次号', width: 150 },
    { prop: 'quantity', label: '数量', width: 90 },
    { prop: 'supplier', label: '供应商', width: 120 },
    { prop: 'expiryDate', label: '有效期', width: 120, sortable: true },
    { prop: 'storageLocation', label: '存放位置', width: 120 },
    { prop: 'stockInTime', label: '入库时间', width: 160, sortable: true },
    { prop: 'operator', label: '操作员', width: 90 },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: StockInItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) })
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
        if (searchForm.barcode && !item.barcode.includes(searchForm.barcode))
          return false
        if (searchForm.supplier && item.supplier !== searchForm.supplier) return false
        if (searchForm.batchNo && !item.batchNo.includes(searchForm.batchNo))
          return false
        if (searchForm.storageLocation && item.storageLocation !== searchForm.storageLocation)
          return false
        if (
          searchForm.stockInDateRange &&
          searchForm.stockInDateRange.length === 2
        ) {
          const itemDate = item.stockInTime.slice(0, 10)
          if (
            itemDate < searchForm.stockInDateRange[0] ||
            itemDate > searchForm.stockInDateRange[1]
          )
            return false
        }
        return true
      })
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
      barcode: '',
      supplier: '',
      batchNo: '',
      stockInDateRange: [],
      storageLocation: ''
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

  const handleSelectionChange = (selection: StockInItem[]) => {
    selectedRows.value = selection
  }

  // 手动入库
  const handleAdd = () => {
    Object.assign(formData, {
      barcode: '',
      reagentName: '',
      spec: '',
      batchNo: '',
      supplier: '',
      productionDate: '',
      expiryDate: '',
      quantity: 1,
      storageLocation: ''
    })
    addDrawerVisible.value = true
    formKey.value++
  }

  const handleScan = () => {
    const randomCode = `BC${String(Date.now()).slice(-9)}`
    formData.barcode = randomCode
    ElMessage.success('扫描成功')
  }

  const handleReagentChange = (val: string) => {
    const target = reagentCatalog.find((r) => r.name === val)
    formData.spec = target ? target.spec : ''
    formData.kitNo = target ? target.kitNo : ''
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      await new Promise((r) => setTimeout(r, 300))
      submitting.value = false
      const newId = Math.max(...mockData.map((d) => d.id), 0) + 1
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const y = now.getFullYear()
      const m = pad(now.getMonth() + 1)
      const d = pad(now.getDate())
      const timeStr = `${y}-${m}-${d} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      const newRow: StockInItem = {
        id: newId,
        reagentName: formData.reagentName,
        spec: formData.spec,
        stockInNo: `RK${y}${m}${d}${String(newId).padStart(3, '0')}`,
        barcode: formData.barcode,
        batchNo: formData.batchNo,
        quantity: `${formData.quantity}个`,
        supplier: formData.supplier,
        expiryDate: formData.expiryDate,
        storageLocation: formData.storageLocation,
        stockInTime: timeStr,
        operator: '当前登录用户'
      }
      mockData.unshift(newRow)
      ElMessage.success('入库成功')
      addDrawerVisible.value = false
      fetchData()
    })
  }

  // 批量导出
  const handleBatchExport = () => {
    const headers = [
      '试剂/耗材名称', '规格型号', '入库单号', '条码', '批次号', '数量',
      '供应商', '有效期', '存放位置', '入库时间', '操作员'
    ]
    const rows = selectedRows.value.map((r) => [
      r.reagentName, r.spec, r.stockInNo, r.barcode, r.batchNo, r.quantity,
      r.supplier, r.expiryDate, r.storageLocation, r.stockInTime, r.operator
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `入库记录导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  // 查看
  const handleView = (row: StockInItem) => {
    viewData.value = { ...row }
    viewDrawerVisible.value = true
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .search-wrapper {
    margin-bottom: 12px;
    padding: 18px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: calc(var(--custom-radius) + 4px);

    .search-form {
      :deep(.el-form-item__label) {
        white-space: nowrap;
      }

      .search-actions {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        gap: 8px;
        height: 32px;
      }
    }
  }

  .stock-in-form {
    :deep(.el-form-item__label) {
      white-space: nowrap;
    }
  }
</style>
