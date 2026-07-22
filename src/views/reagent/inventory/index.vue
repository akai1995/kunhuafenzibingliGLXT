<!-- 库存查询 -->
<template>
  <div class="reagent-inventory art-full-height">
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
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="库存状态">
              <ElSelect
                v-model="searchForm.stockStatus"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption label="正常" value="正常" />
                <ElOption label="低于阈值" value="低于阈值" />
                <ElOption label="缺货" value="缺货" />
                <ElOption label="过期" value="过期" />
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
      >
        <template #stockStatus="{ row }">
          <ElTag :type="statusTagType(row.stockStatus)" size="small">
            {{ row.stockStatus }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 调整库存弹窗 -->
    <ElDialog
      v-model="adjustDialogVisible"
      title="调整库存"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm
        ref="formRef"
        :key="formKey"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="100px"
        class="adjust-form"
      >
        <ElFormItem label="名称">
          <ElInput :model-value="adjustForm.reagentName" disabled />
        </ElFormItem>
        <ElFormItem label="规格型号">
          <ElInput :model-value="adjustForm.spec" disabled />
        </ElFormItem>
        <ElFormItem label="当前库存">
          <ElInput :model-value="adjustForm.currentStock" disabled />
        </ElFormItem>
        <ElFormItem label="调整类型" prop="adjustType">
          <ElRadioGroup v-model="adjustForm.adjustType">
            <ElRadio value="增加库存">增加库存</ElRadio>
            <ElRadio value="减少库存">减少库存</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="调整数量" prop="adjustQuantity">
          <ElInputNumber
            v-model="adjustForm.adjustQuantity"
            :min="1"
            class="w-full"
            placeholder="请输入调整数量"
          />
        </ElFormItem>
        <ElFormItem label="调整原因" prop="adjustReason">
          <ElInput
            v-model="adjustForm.adjustReason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="adjustDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAdjustSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ReagentInventory' })

  interface InventoryItem {
    id: number
    reagentName: string
    kitNo: string
    type: string
    barcode: string
    spec: string
    batchNo: string
    currentStock: number
    unit: string
    storageLocation: string
    expiryDate: string
    stockStatus: string
    supplier: string
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
  const kitNos = [
    'KT-EGFR-001', 'KT-KRAS-002', 'KT-BRAF-003',
    'KT-DNA-004', 'KT-RNA-005', 'KT-FISH-006',
    'KT-NGS-007', 'KT-PCR-008', 'HC-AGAR-001', 'HC-PK-002'
  ]
  const specs = ['50T', '100T', '200T', '48测试', '96测试', '100mL', '500g', '100mg']
  const units = ['盒', '瓶', '支', '套']
  const statusList = ['正常', '低于阈值', '缺货', '过期']

  const mockData: InventoryItem[] = Array.from({ length: 10 }, (_, i) => {
    const day = String(i * 3 + 1).padStart(2, '0')
    const status = statusList[i % 4]
    const name = reagentNames[i % reagentNames.length]
    const type = ['琼脂糖'].includes(name) ? '耗材' : '试剂'
    let currentStock: number
    if (status === '正常') {
      currentStock = (i % 20) + 30
    } else if (status === '低于阈值') {
      currentStock = (i % 5) + 3
    } else if (status === '缺货') {
      currentStock = 0
    } else {
      currentStock = (i % 3) + 1
    }
    return {
      id: i + 1,
      reagentName: name,
      kitNo: kitNos[i % kitNos.length],
      type,
      barcode: `TM202607${String(i + 1).padStart(6, '0')}`,
      spec: specs[i % specs.length],
      batchNo: `B202607${String(i + 1).padStart(2, '0')}`,
      currentStock,
      unit: units[i % units.length],
      storageLocation: locationOptions[i % locationOptions.length],
      expiryDate: `2027-0${(i % 9) + 1}-${day}`,
      stockStatus: status,
      supplier: supplierOptions[i % supplierOptions.length]
    }
  })

  // 查询条件
  const searchForm = reactive({
    reagentName: '',
    barcode: '',
    supplier: '',
    batchNo: '',
    storageLocation: '',
    stockStatus: ''
  })

  // 状态
  const loading = ref(false)
  const data = ref<InventoryItem[]>([])
  const selectedRows = ref<InventoryItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // 弹窗状态
  const adjustDialogVisible = ref(false)
  const formRef = ref<FormInstance>()
  const formKey = ref(0)

  // 调整库存表单
  const adjustForm = reactive({
    id: 0,
    reagentName: '',
    spec: '',
    currentStock: 0,
    unit: '',
    adjustType: '增加库存',
    adjustQuantity: 1,
    adjustReason: ''
  })

  const adjustRules: FormRules = {
    adjustType: [
      { required: true, message: '请选择调整类型', trigger: 'change' }
    ],
    adjustQuantity: [
      { required: true, message: '请输入调整数量', trigger: 'blur' }
    ],
    adjustReason: [
      { required: true, message: '请输入调整原因', trigger: 'blur' }
    ]
  }

  // 状态标签类型
  const statusTagType = (status: string) => {
    const map: Record<string, string> = {
      正常: 'success',
      低于阈值: 'warning',
      缺货: 'danger',
      过期: 'danger'
    }
    return (map[status] || 'info') as any
  }

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'reagentName', label: '试剂/耗材名称', width: 160, fixed: 'left' },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    { prop: 'type', label: '类型', width: 80 },
    { prop: 'barcode', label: '条码', width: 130 },
    { prop: 'spec', label: '规格型号', width: 120 },
    { prop: 'batchNo', label: '批次号', width: 150 },
    { prop: 'currentStock', label: '当前库存', width: 100, sortable: true },
    { prop: 'unit', label: '单位', width: 70 },
    { prop: 'storageLocation', label: '存放位置', width: 120 },
    { prop: 'supplier', label: '供应商', width: 120 },
    { prop: 'expiryDate', label: '有效期', width: 120, sortable: true },
    { prop: 'stockStatus', label: '库存状态', width: 100, useSlot: true },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: InventoryItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            icon: 'ri:exchange-line',
            iconClass: 'bg-primary/12 text-primary',
            title: '库存调整',
            onClick: () => handleAdjust(row)
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
        if (searchForm.barcode && !item.barcode.includes(searchForm.barcode))
          return false
        if (searchForm.supplier && item.supplier !== searchForm.supplier) return false
        if (searchForm.batchNo && !item.batchNo.includes(searchForm.batchNo))
          return false
        if (
          searchForm.storageLocation &&
          item.storageLocation !== searchForm.storageLocation
        )
          return false
        if (searchForm.stockStatus && item.stockStatus !== searchForm.stockStatus)
          return false
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
      storageLocation: '',
      stockStatus: ''
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

  const handleSelectionChange = (selection: InventoryItem[]) => {
    selectedRows.value = selection
  }

  // 调整库存
  const handleAdjust = (row: InventoryItem) => {
    Object.assign(adjustForm, {
      id: row.id,
      reagentName: row.reagentName,
      spec: row.spec,
      currentStock: row.currentStock,
      unit: row.unit,
      adjustType: '增加库存',
      adjustQuantity: 1,
      adjustReason: ''
    })
    adjustDialogVisible.value = true
    formKey.value++
  }

  const handleAdjustSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      const idx = mockData.findIndex((d) => d.id === adjustForm.id)
      if (idx > -1) {
        const delta =
          adjustForm.adjustType === '增加库存'
            ? adjustForm.adjustQuantity
            : -adjustForm.adjustQuantity
        mockData[idx].currentStock = Math.max(0, mockData[idx].currentStock + delta)
        if (mockData[idx].currentStock >= 20) {
          mockData[idx].stockStatus = '正常'
        } else if (mockData[idx].currentStock >= 5) {
          mockData[idx].stockStatus = '低于阈值'
        } else {
          mockData[idx].stockStatus = '缺货'
        }
      }
      ElMessage.success('库存调整成功')
      adjustDialogVisible.value = false
      fetchData()
    })
  }

  // 批量导出
  const handleBatchExport = () => {
    const headers = [
      '试剂/耗材名称', '条码', '规格型号', '批次号', '当前库存',
      '单位', '存放位置', '供应商', '有效期', '库存状态'
    ]
    const rows = selectedRows.value.map((r) => [
      r.reagentName, r.barcode, r.spec, r.batchNo, r.currentStock,
      r.unit, r.storageLocation, r.supplier, r.expiryDate, r.stockStatus
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `库存数据导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
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

  .adjust-form {
    :deep(.el-form-item__label) {
      white-space: nowrap;
    }
  }
</style>
