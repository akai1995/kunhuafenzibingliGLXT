<!-- 试剂耗材管理-出库管理 -->
<template>
  <div class="reagent-requisition art-full-height">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="申领人">
              <ElInput
                v-model="searchForm.receiver"
                placeholder="请输入申领人"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
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
            <ElFormItem label="类型">
              <ElSelect
                v-model="searchForm.recordType"
                placeholder="请选择"
                clearable
                @change="handleSearch"
              >
                <ElOption label="试剂" value="试剂" />
                <ElOption label="耗材" value="耗材" />
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
            <ElFormItem label="出库日期">
              <ElDatePicker
                v-model="searchForm.receiveDateRange"
                type="daterange"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="w-full"
              />
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

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增出库
          </ElButton>
          <ElButton @click="handleAddReturn">
            <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />
            新增归还
          </ElButton>
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
        <template #status="{ row }">
          <ElTag :type="statusTagType(row.status)" size="small">
            {{ row.status }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新增/编辑出库抽屉 -->
    <ElDrawer
      v-model="addDrawerVisible"
      :title="drawerTitle"
      size="720px"
      :close-on-click-modal="true"
    >
      <ElForm
        ref="formRef"
        :key="drawerMode"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="requisition-form"
      >
        <!-- 出库信息 -->
        <div class="form-section">
          <div class="form-section-title">
            <ArtSvgIcon icon="ri:file-list-3-line" class="mr-1.5" />
            出库信息
          </div>
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="申领人" prop="receiver">
                <ElInput v-model="formData.receiver" placeholder="请输入申领人" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="项目/实验" prop="project">
                <ElSelect
                  v-model="formData.project"
                  placeholder="请选择"
                  class="w-full"
                  filterable
                  allow-create
                >
                  <ElOption v-for="p in projectOptions" :key="p" :label="p" :value="p" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="预计归还日期" prop="expectedReturnDate">
                <ElDatePicker
                  v-model="formData.expectedReturnDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </div>

        <!-- 出库明细 -->
        <div class="form-section">
          <div class="form-section-title">
            <ArtSvgIcon icon="ri:shopping-cart-line" class="mr-1.5" />
            出库明细
          </div>
          <div v-for="(item, index) in formData.details" :key="index" class="detail-item-card">
            <div class="detail-item-header">
              <span class="detail-item-index">明细 {{ index + 1 }}</span>
              <ElButton
                v-if="formData.details.length > 1"
                link
                type="danger"
                size="small"
                @click="removeDetailItem(index)"
              >
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-0.5" />
                删除
              </ElButton>
            </div>
            <ElRow :gutter="16">
              <ElCol :span="12">
                <ElFormItem
                  label="试剂/耗材"
                  :prop="`details.${index}.reagentName`"
                  :rules="[{ required: true, message: '请选择试剂/耗材', trigger: 'change' }]"
                >
                  <ElSelect
                    v-model="item.reagentName"
                    placeholder="请选择"
                    class="w-full"
                    filterable
                    @change="(val: string) => handleDetailReagentChange(index, val)"
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
                <ElFormItem
                  label="数量"
                  :prop="`details.${index}.quantity`"
                  :rules="[{ required: true, message: '请输入数量', trigger: 'blur' }]"
                >
                  <ElInputNumber
                    v-model="item.quantity"
                    :min="1"
                    class="w-full"
                    placeholder="请输入数量"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="8">
                <ElFormItem label="试剂盒号" :prop="`details.${index}.kitNo`">
                  <ElInput v-model="item.kitNo" placeholder="选择后带出" disabled />
                </ElFormItem>
              </ElCol>
              <ElCol :span="8">
                <ElFormItem label="规格型号" :prop="`details.${index}.spec`">
                  <ElInput v-model="item.spec" placeholder="选择后带出" disabled />
                </ElFormItem>
              </ElCol>
              <ElCol :span="8">
                <ElFormItem label="单位" :prop="`details.${index}.unit`">
                  <ElInput v-model="item.unit" placeholder="选择后带出" disabled />
                </ElFormItem>
              </ElCol>
              <ElCol :span="8">
                <ElFormItem label="类型" :prop="`details.${index}.recordType`">
                  <ElInput v-model="item.recordType" placeholder="选择后带出" disabled />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </div>
          <ElButton type="primary" size="small" @click="addDetailItem">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            添加明细
          </ElButton>
        </div>

        <!-- 备注 -->
        <div class="form-section">
          <div class="form-section-title">
            <ArtSvgIcon icon="ri:sticky-note-line" class="mr-1.5" />
            备注
          </div>
          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </ElFormItem>
        </div>
      </ElForm>
      <template #footer>
        <ElButton @click="addDrawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit"> 确定 </ElButton>
      </template>
    </ElDrawer>

    <!-- 新增归还弹窗 -->
    <ElDialog
      v-model="returnDialogVisible"
      title="新增归还"
      width="560px"
      :close-on-click-modal="true"
    >
      <ElForm
        ref="returnFormRef"
        :model="returnForm"
        :rules="returnRules"
        label-width="110px"
        class="return-form"
      >
        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem label="出库记录" prop="recordId">
              <ElSelect
                v-model="returnForm.recordId"
                placeholder="请选择出库记录"
                class="w-full"
                filterable
                :disabled="returnLockRecord"
                @change="handleReturnRecordChange"
              >
                <ElOption
                  v-for="r in returnRecordOptions"
                  :key="r.id"
                  :label="`${r.recordNo} - ${r.reagentName}（${r.receiver}）`"
                  :value="r.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="试剂/耗材">
              <ElInput :model-value="selectedReturnRecord?.reagentName || '-'" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="出库数量">
              <ElInput
                :model-value="
                  selectedReturnRecord
                    ? `${selectedReturnRecord.quantity} ${selectedReturnRecord.unit}`
                    : '-'
                "
                disabled
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="实际归还日期" prop="actualReturnDate">
              <ElDatePicker
                v-model="returnForm.actualReturnDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="归还数量" prop="returnQuantity">
              <ElInputNumber
                v-model="returnForm.returnQuantity"
                :min="1"
                :max="selectedReturnRecord?.quantity || 9999"
                class="w-full"
                placeholder="请输入归还数量"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="状态" prop="status">
              <ElSelect v-model="returnForm.status" placeholder="请选择" class="w-full">
                <ElOption label="已归还" value="已归还" />
                <ElOption label="已核销" value="已核销" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="returnDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleReturnSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ReagentRequisition' })

  interface RequisitionDetail {
    reagentName: string
    kitNo: string
    spec: string
    quantity: number
    unit: string
    recordType: string
  }

  interface RequisitionItem {
    id: number
    recordNo: string
    receiver: string
    reagentName: string
    kitNo: string
    spec: string
    quantity: number
    unit: string
    receiveDate: string
    expectedReturnDate: string
    actualReturnDate: string
    status: string
    recordType: string
    project: string
    remark: string
  }

  // 试剂/耗材目录（选择后自动带出规格、单位、类型）
  const reagentCatalog = [
    { name: 'EGFR检测试剂盒', spec: '50T', kitNo: 'KT-EGFR-001', unit: '盒', type: '试剂' },
    { name: 'KRAS检测试剂盒', spec: '100T', kitNo: 'KT-KRAS-002', unit: '盒', type: '试剂' },
    { name: 'BRAF检测试剂盒', spec: '200T', kitNo: 'KT-BRAF-003', unit: '盒', type: '试剂' },
    { name: 'DNA提取试剂盒', spec: '48测试', kitNo: 'KT-DNA-004', unit: '盒', type: '试剂' },
    { name: 'RNA提取试剂盒', spec: '96测试', kitNo: 'KT-RNA-005', unit: '盒', type: '试剂' },
    { name: 'FISH探针试剂盒', spec: '100T', kitNo: 'KT-FISH-006', unit: '盒', type: '试剂' },
    { name: 'NGS文库构建试剂盒', spec: '96测试', kitNo: 'KT-NGS-007', unit: '套', type: '试剂' },
    { name: 'PCR Master Mix', spec: '100mL', kitNo: 'KT-PCR-008', unit: '瓶', type: '试剂' },
    { name: '琼脂糖', spec: '500g', kitNo: 'HC-AGAR-001', unit: '瓶', type: '耗材' },
    { name: '蛋白酶K', spec: '100mg', kitNo: 'HC-PK-002', unit: '支', type: '试剂' }
  ]

  const receivers = ['张医生', '李医生', '王医生', '刘医生', '陈医生', '杨医生', '赵医生', '周医生', '吴医生', '郑医生']
  const projectOptions = [
    'NGSR质控',
    'NGSA质控',
    'PCR10基因质控',
    'PCR11基因质控'
  ]
  const statusList = ['待归还', '已归还', '逾期未还']

  // Mock 数据（10 条）
  const mockData: RequisitionItem[] = Array.from({ length: 10 }, (_, i) => {
    const status = statusList[i % 3]
    const catalog = reagentCatalog[i % reagentCatalog.length]
    const day = String(i * 3 + 1).padStart(2, '0')
    const expDay = String(Math.min(Number(day) + 7, 28)).padStart(2, '0')
    const actDay = String(Math.min(Number(day) + 5, 28)).padStart(2, '0')
    return {
      id: i + 1,
      recordNo: `LY202607${String(i + 1).padStart(4, '0')}`,
      receiver: receivers[i % receivers.length],
      reagentName: catalog.name,
      kitNo: catalog.kitNo,
      spec: catalog.spec,
      quantity: (i % 8) + 1,
      unit: catalog.unit,
      receiveDate: `2026-07-${day}`,
      expectedReturnDate: `2026-07-${expDay}`,
      actualReturnDate: status === '待归还' ? '' : `2026-07-${actDay}`,
      status,
      recordType: catalog.type,
      project: projectOptions[i % projectOptions.length],
      remark: ''
    }
  })

  // 查询条件
  const searchForm = reactive({
    receiver: '',
    reagentName: '',
    recordType: '',
    receiveDateRange: [] as string[]
  })

  // 状态
  const loading = ref(false)
  const data = ref<RequisitionItem[]>([])
  const selectedRows = ref<RequisitionItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // 抽屉/弹窗状态
  const addDrawerVisible = ref(false)
  const returnDialogVisible = ref(false)
  const submitting = ref(false)
  const drawerMode = ref<'add' | 'edit'>('add')
  const editId = ref(0)
  const formRef = ref<FormInstance>()
  const returnFormRef = ref<FormInstance>()

  const drawerTitle = computed(() => (drawerMode.value === 'add' ? '新增出库' : '编辑出库'))

  // 出库表单
  const createDetail = (): RequisitionDetail => ({
    reagentName: '',
    kitNo: '',
    spec: '',
    quantity: 1,
    unit: '',
    recordType: ''
  })

  const formData = reactive({
    receiver: '',
    project: '',
    expectedReturnDate: '',
    remark: '',
    details: [createDetail()]
  })

  const formRules: FormRules = {
    receiver: [{ required: true, message: '请输入申领人', trigger: 'blur' }],
    expectedReturnDate: [{ required: true, message: '请选择预计归还日期', trigger: 'change' }]
  }

  // 归还表单
  const returnLockRecord = ref(false)
  const returnRecordOptions = ref<RequisitionItem[]>([])
  const returnForm = reactive({
    recordId: null as number | null,
    actualReturnDate: '',
    returnQuantity: 1,
    status: '已归还'
  })

  const returnRules: FormRules = {
    recordId: [{ required: true, message: '请选择出库记录', trigger: 'change' }],
    actualReturnDate: [{ required: true, message: '请选择实际归还日期', trigger: 'change' }],
    returnQuantity: [{ required: true, message: '请输入归还数量', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const selectedReturnRecord = computed(() =>
    returnRecordOptions.value.find((d) => d.id === returnForm.recordId)
  )

  // 工具函数
  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 状态标签类型
  const statusTagType = (status: string) => {
    const map: Record<string, string> = {
      待归还: 'warning',
      已归还: 'success',
      已核销: 'info'
    }
    return (map[status] || 'info') as any
  }

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'reagentName', label: '试剂/耗材名称', width: 160, fixed: 'left' },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    { prop: 'recordType', label: '类型', width: 80 },
    { prop: 'receiver', label: '申领人', width: 90 },
    { prop: 'recordNo', label: '记录ID', width: 170 },
    { prop: 'spec', label: '规格型号', width: 120 },
    { prop: 'quantity', label: '数量', width: 80, sortable: true },
    { prop: 'unit', label: '单位', width: 70 },
    { prop: 'receiveDate', label: '出库日期', width: 120, sortable: true },
    { prop: 'expectedReturnDate', label: '预计归还日期', width: 130, sortable: true },
    {
      prop: 'actualReturnDate',
      label: '实际归还日期',
      width: 130,
      sortable: true,
      formatter: (row: RequisitionItem) => row.actualReturnDate || '-'
    },
    { prop: 'status', label: '核销状态', width: 100, useSlot: true },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row: RequisitionItem) => {
        const buttons: any[] = []
        if (row.status === '待归还') {
          buttons.push(h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }))
        }
        if (row.status === '待归还') {
          buttons.push(
            h(ArtButtonTable, {
              icon: 'ri:arrow-go-back-line',
              iconClass: 'bg-success/12 text-success',
              title: '归还',
              onClick: () => handleReturn(row)
            })
          )
        }
        buttons.push(h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) }))
        return h('div', { class: 'flex-c' }, buttons)
      }
    }
  ])

  // 数据获取
  const fetchData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = mockData.filter((item) => {
        if (searchForm.receiver && !item.receiver.includes(searchForm.receiver)) return false
        if (searchForm.reagentName && !item.reagentName.includes(searchForm.reagentName))
          return false
        if (searchForm.recordType && item.recordType !== searchForm.recordType) return false
        if (searchForm.receiveDateRange && searchForm.receiveDateRange.length === 2) {
          if (
            item.receiveDate < searchForm.receiveDateRange[0] ||
            item.receiveDate > searchForm.receiveDateRange[1]
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
      receiver: '',
      reagentName: '',
      recordType: '',
      receiveDateRange: []
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

  const handleSelectionChange = (selection: RequisitionItem[]) => {
    selectedRows.value = selection
  }

  // 明细操作
  const addDetailItem = () => {
    formData.details.push(createDetail())
  }

  const removeDetailItem = (index: number) => {
    formData.details.splice(index, 1)
  }

  const handleDetailReagentChange = (index: number, val: string) => {
    const target = reagentCatalog.find((r) => r.name === val)
    if (target) {
      formData.details[index].kitNo = target.kitNo
      formData.details[index].spec = target.spec
      formData.details[index].unit = target.unit
      formData.details[index].recordType = target.type
    }
  }

  // 新增/编辑出库
  const handleAdd = () => {
    drawerMode.value = 'add'
    editId.value = 0
    Object.assign(formData, {
      receiver: '',
      project: '',
      expectedReturnDate: '',
      remark: '',
      details: [createDetail()]
    })
    addDrawerVisible.value = true
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  const handleEdit = (row: RequisitionItem) => {
    drawerMode.value = 'edit'
    editId.value = row.id
    Object.assign(formData, {
      receiver: row.receiver,
      project: row.project,
      expectedReturnDate: row.expectedReturnDate,
      remark: row.remark,
      details: [
        {
          reagentName: row.reagentName,
          kitNo: row.kitNo,
          spec: row.spec,
          quantity: row.quantity,
          unit: row.unit,
          recordType: row.recordType
        }
      ]
    })
    addDrawerVisible.value = true
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  // 抽屉关闭时清除验证状态
  watch(addDrawerVisible, (val) => {
    if (!val) {
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  })

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      await new Promise((r) => setTimeout(r, 300))
      submitting.value = false
      const now = new Date()
      const dateStr = formatDate(now)
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      if (drawerMode.value === 'add') {
        const baseId = Math.max(...mockData.map((it) => it.id), 0)
        formData.details.forEach((detail, idx) => {
          const newId = baseId + 1 + idx
          const newRow: RequisitionItem = {
            id: newId,
            recordNo: `LY${y}${m}${d}${String(newId).padStart(3, '0')}`,
            receiver: formData.receiver,
            reagentName: detail.reagentName,
            kitNo: detail.kitNo,
            spec: detail.spec,
            quantity: detail.quantity,
            unit: detail.unit,
            receiveDate: dateStr,
            expectedReturnDate: formData.expectedReturnDate,
            actualReturnDate: '',
            status: '待归还',
            recordType: detail.recordType,
            project: formData.project,
            remark: formData.remark
          }
          mockData.unshift(newRow)
        })
        ElMessage.success('出库登记成功')
      } else {
        const idx = mockData.findIndex((d) => d.id === editId.value)
        if (idx > -1 && formData.details.length > 0) {
          const detail = formData.details[0]
          mockData[idx] = {
            ...mockData[idx],
            receiver: formData.receiver,
            project: formData.project,
            expectedReturnDate: formData.expectedReturnDate,
            remark: formData.remark,
            reagentName: detail.reagentName,
            kitNo: detail.kitNo,
            spec: detail.spec,
            quantity: detail.quantity,
            unit: detail.unit,
            recordType: detail.recordType
          }
        }
        ElMessage.success('出库记录修改成功')
      }
      addDrawerVisible.value = false
      fetchData()
    })
  }

  // 新增归还（按钮触发）
  const handleAddReturn = () => {
    returnLockRecord.value = false
    returnRecordOptions.value = mockData.filter((d) => d.status === '待归还')
    Object.assign(returnForm, {
      recordId: null,
      actualReturnDate: formatDate(new Date()),
      returnQuantity: 1,
      status: '已归还'
    })
    returnDialogVisible.value = true
  }

  // 归还（行内触发，锁定记录）
  const handleReturn = (row: RequisitionItem) => {
    returnLockRecord.value = true
    returnRecordOptions.value = mockData.filter((d) => d.status === '待归还')
    Object.assign(returnForm, {
      recordId: row.id,
      actualReturnDate: formatDate(new Date()),
      returnQuantity: row.quantity,
      status: '已归还'
    })
    returnDialogVisible.value = true
  }

  const handleReturnRecordChange = (val: number) => {
    const record = returnRecordOptions.value.find((d) => d.id === val)
    if (record) {
      returnForm.returnQuantity = record.quantity
    }
  }

  const handleReturnSubmit = async () => {
    if (!returnFormRef.value) return
    await returnFormRef.value.validate((valid) => {
      if (!valid) return
      const idx = mockData.findIndex((d) => d.id === returnForm.recordId)
      if (idx > -1) {
        mockData[idx].status = returnForm.status
        mockData[idx].actualReturnDate = returnForm.actualReturnDate
      }
      ElMessage.success('归还登记成功')
      returnDialogVisible.value = false
      fetchData()
    })
  }

  // 删除（二次确认）
  const handleDelete = (row: RequisitionItem) => {
    ElMessageBox.confirm(`确定要删除出库记录「${row.recordNo}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const idx = mockData.findIndex((d) => d.id === row.id)
      if (idx > -1) {
        mockData.splice(idx, 1)
      }
      ElMessage.success('删除成功')
      fetchData()
    })
  }

  // 批量导出
  const handleBatchExport = () => {
    const headers = [
      '记录ID',
      '申领人',
      '试剂/耗材名称',
      '规格型号',
      '数量',
      '单位',
      '出库日期',
      '预计归还日期',
      '实际归还日期',
      '核销状态'
    ]
    const rows = selectedRows.value.map((r) => [
      r.recordNo,
      r.receiver,
      r.reagentName,
      r.spec,
      r.quantity,
      r.unit,
      r.receiveDate,
      r.expectedReturnDate,
      r.actualReturnDate || '-',
      r.status
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `出库管理记录导出_${new Date().toISOString().slice(0, 10)}.csv`
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

  .requisition-form {
    :deep(.el-form-item__label) {
      white-space: nowrap;
    }

    .form-section {
      margin-bottom: 24px;

      .form-section-title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }

    .detail-item-card {
      padding: 16px;
      margin-bottom: 16px;
      background: var(--el-fill-color-lighter);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 6px;

      .detail-item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .detail-item-index {
          font-size: 13px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }
    }
  }

  .return-form {
    :deep(.el-form-item__label) {
      white-space: nowrap;
    }
  }
</style>
