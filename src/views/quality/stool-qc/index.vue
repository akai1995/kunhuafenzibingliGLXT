<!-- 粪便样本质控 -->
<template>
  <div class="stool-qc art-full-height">
    <!-- 查询条件 -->
    <StoolQcSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader
        :loading="loading"
        @refresh="refreshData"
        :showColumnSetting="true"
        v-model:columns="columns"
      />

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #isQualified="{ row }">
          <ElTag :type="row.isQualified === '合格' ? 'success' : row.isQualified === '不合格' ? 'danger' : 'info'" size="small">
            {{ row.isQualified }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 编辑抽屉 -->
    <StoolQcEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      @submit="handleEditSubmit"
    />

    <!-- 查看抽屉 -->
    <StoolQcViewDrawer
      v-model:visible="viewDrawerVisible"
      :row-data="currentRow"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import StoolQcSearchForm from './modules/stool-qc-search-form.vue'
  import StoolQcEditDrawer from './modules/stool-qc-edit-drawer.vue'
  import StoolQcViewDrawer from './modules/stool-qc-view-drawer.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'StoolQc' })

  const sampleFlowStore = useSampleFlowStore()

  interface StoolQcItem {
    id: number
    sampleNo: string
    patientName: string
    applyTime: string
    pathologyNo: string
    testProject: string
    stoolAmount: string
    isQualified: string
    suggestion: string
    qcDoctor: string
    // 样本信息字段
    sampleType: string
    sampleSource: string
    barcode: string
    collectTime: string
    collector: string
    collectMethod: string
    storageLocation: string
  }

  const searchParams = reactive({
    patientName: '',
    pathologyNo: '',
    projectName: '',
    sampleNo: ''
  })

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const editDrawerVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const currentRow = ref<any>({})

  // Mock data - 4条粪便质控数据，来源于已确认的粪便样本
  const mockData: StoolQcItem[] = [
    { id: 1, sampleNo: 'S2026070001', patientName: '王建国', applyTime: '2026-07-01 15:00', pathologyNo: 'BL20261003', testProject: 'KRAS基因突变检测', stoolAmount: '15', isQualified: '合格', suggestion: '-', qcDoctor: '王医生', sampleType: '粪便样本', sampleSource: '昆华医院-消化内科', barcode: 'BC20263001', collectTime: '2026-07-01 14:30', collector: '王医生', collectMethod: '自然留取', storageLocation: '冰箱D-1号架-1号盒' },
    { id: 2, sampleNo: 'S2026070002', patientName: '张伟', applyTime: '2026-07-01 14:00', pathologyNo: 'BL20261001', testProject: 'EGFR基因突变检测', stoolAmount: '8', isQualified: '不合格', suggestion: '重新采集', qcDoctor: '李医生', sampleType: '粪便样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20263002', collectTime: '2026-07-01 13:30', collector: '张医生', collectMethod: '自然留取', storageLocation: '冰箱D-1号架-2号盒' },
    { id: 3, sampleNo: 'S2026070003', patientName: '刘芳', applyTime: '2026-07-02 15:00', pathologyNo: 'BL20261006', testProject: 'ROS1融合基因检测', stoolAmount: '12', isQualified: '合格', suggestion: '-', qcDoctor: '张医生', sampleType: '粪便样本', sampleSource: '昆华医院-消化内科', barcode: 'BC20263003', collectTime: '2026-07-02 14:30', collector: '张医生', collectMethod: '自然留取', storageLocation: '冰箱D-2号架-1号盒' },
    { id: 4, sampleNo: 'S2026070004', patientName: '陈晓东', applyTime: '2026-07-02 14:00', pathologyNo: 'BL20261005', testProject: 'ALK融合基因检测', stoolAmount: '5', isQualified: '不合格', suggestion: '退回处理', qcDoctor: '陈医生', sampleType: '粪便样本', sampleSource: '昆华医院-呼吸科', barcode: 'BC20263004', collectTime: '2026-07-02 13:30', collector: '陈医生', collectMethod: '自然留取', storageLocation: '冰箱D-2号架-2号盒' }
  ]

  const allData = ref<StoolQcItem[]>([...mockData])
  const data = ref<StoolQcItem[]>([])

  // 列配置
  const columns = ref([
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'applyTime', label: '申请时间', width: 160 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'testProject', label: '检测项目', minWidth: 160 },
    { prop: 'stoolAmount', label: '粪便总量', width: 100 },
    { prop: 'isQualified', label: '质控结果', width: 90, useSlot: true },
    { prop: 'suggestion', label: '处理意见', width: 100 },
    { prop: 'qcDoctor', label: '质控医生', width: 100 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: StoolQcItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEdit(row)
          }),
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => handleView(row)
          })
        ])
    }
  ])

  // 数据获取
  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      // 流程三：从Store获取已确认的流转样本，合并到展示列表
      const flowSamples = sampleFlowStore.getSamplesForSampleQc()
      // 移除已离开sample_stored阶段的Store样本
      const flowIds = new Set(flowSamples.map((s) => s.id))
      allData.value = allData.value.filter((d) => {
        if (d.id >= 100000 && !flowIds.has(d.id)) return false
        return true
      })
      const existingIds = new Set(allData.value.map((d) => d.id))
      flowSamples.forEach((fs) => {
        const sampleSource = fs.isSelfSample === 'no' && fs.sourceHospital
          ? fs.sourceHospital
          : `${fs.hospital || '昆华医院'}-${fs.department || '-'}`
        if (!existingIds.has(fs.id)) {
          allData.value.unshift({
            id: fs.id,
            sampleNo: fs.sampleNo,
            patientName: fs.patientName,
            applyTime: fs.applyTime,
            pathologyNo: fs.pathologyNo,
            testProject: fs.projectName,
            stoolAmount: '',
            isQualified: '待质控',
            suggestion: '-',
            qcDoctor: '',
            sampleType: fs.sampleType || '粪便样本',
            sampleSource,
            barcode: fs.barcode || '-',
            collectTime: fs.sampleStoreTime || fs.applyTime || '-',
            collector: fs.doctor || '-',
            collectMethod: '自然留取',
            storageLocation: fs.storageLocation || '-',
            confirmer: fs.isSelfSample === 'no' && fs.receiveStatus === 'received' ? '接收员' : '',
            confirmTime: fs.isSelfSample === 'no' && fs.receiveStatus === 'received' ? fs.sampleStoreTime || fs.orderSubmitTime || '' : ''
          })
        }
      })

      const filtered = allData.value.filter((item) => {
        const matchName = !searchParams.patientName || item.patientName.includes(searchParams.patientName)
        const matchPathology = !searchParams.pathologyNo || item.pathologyNo.includes(searchParams.pathologyNo)
        const matchProject = !searchParams.projectName || item.testProject.includes(searchParams.projectName)
        const matchSample = !searchParams.sampleNo || item.sampleNo.includes(searchParams.sampleNo)
        return matchName && matchPathology && matchProject && matchSample
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
      patientName: '',
      pathologyNo: '',
      projectName: '',
      sampleNo: ''
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

  const handleEdit = (row: StoolQcItem) => {
    currentRow.value = { ...row }
    editDrawerVisible.value = true
  }

  const handleEditSubmit = (submitData: any) => {
    const idx = allData.value.findIndex((d) => d.id === submitData.id)
    if (idx > -1) {
      allData.value[idx] = { ...allData.value[idx], ...submitData }
    }
    // 流程三：样本质控完成（合格），数据流转到技术平台质控
    if (submitData.isQualified === '合格') {
      sampleFlowStore.completeSampleQc(submitData.id)
    }
    fetchPageData()
  }

  const handleView = (row: StoolQcItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  onMounted(() => {
    fetchPageData()
  })
</script>
