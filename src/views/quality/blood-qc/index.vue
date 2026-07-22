<!-- 血液样本质控 -->
<template>
  <div class="blood-qc art-full-height">
    <!-- 查询条件 -->
    <BloodQcSearchForm @search="handleSearch" @reset="handleResetSearch" />

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
    <BloodQcEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      @submit="handleEditSubmit"
    />

    <!-- 查看抽屉 -->
    <BloodQcViewDrawer
      v-model:visible="viewDrawerVisible"
      :row-data="currentRow"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BloodQcSearchForm from './modules/blood-qc-search-form.vue'
  import BloodQcEditDrawer from './modules/blood-qc-edit-drawer.vue'
  import BloodQcViewDrawer from './modules/blood-qc-view-drawer.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'BloodQc' })

  const sampleFlowStore = useSampleFlowStore()

  interface BloodQcItem {
    id: number
    sampleNo: string
    bloodDrawTime: string
    patientName: string
    pathologyNo: string
    testProject: string
    isCentrifuged: string
    volume: string
    wholeBloodVolume: string
    plasmaVolume: string
    hemolysis: string
    lipidemia: string
    coagulation: string
    isQualified: string
    suggestion: string
    sampleDestination: string
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

  // Mock data - 6条血液质控数据，来源于已确认的血液样本
  const mockData: BloodQcItem[] = [
    { id: 1, sampleNo: 'S2026070001', bloodDrawTime: '2026-06-30 09:00', patientName: '李娜', pathologyNo: 'BL20261001', testProject: 'HER2基因扩增检测', isCentrifuged: '是', volume: '8ml', wholeBloodVolume: '10ml', plasmaVolume: '6ml', hemolysis: '无', lipidemia: '无', coagulation: '无', isQualified: '合格', suggestion: '-', sampleDestination: '检测中', sampleType: '血液样本', sampleSource: '昆华医院-乳腺外科', barcode: 'BC20262001', collectTime: '2026-06-30 09:00', collector: '王医生', collectMethod: '静脉采血', storageLocation: '冰箱A-2号架-3号盒' },
    { id: 2, sampleNo: 'S2026070002', bloodDrawTime: '2026-07-01 07:30', patientName: '赵敏', pathologyNo: 'BL20261002', testProject: 'BRAF V600E突变检测', isCentrifuged: '是', volume: '5ml', wholeBloodVolume: '8ml', plasmaVolume: '4ml', hemolysis: '无', lipidemia: '有', coagulation: '无', isQualified: '合格', suggestion: '-', sampleDestination: '已入库', sampleType: '血液样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20262002', collectTime: '2026-07-01 07:30', collector: '张医生', collectMethod: '静脉采血', storageLocation: '冰箱B-1号架-2号盒' },
    { id: 3, sampleNo: 'S2026070003', bloodDrawTime: '2026-07-01 14:00', patientName: '周强', pathologyNo: 'BL20261003', testProject: 'NGS多基因联合检测', isCentrifuged: '是', volume: '10ml', wholeBloodVolume: '15ml', plasmaVolume: '7ml', hemolysis: '无', lipidemia: '无', coagulation: '无', isQualified: '合格', suggestion: '-', sampleDestination: '检测中', sampleType: '血液样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20262003', collectTime: '2026-07-01 14:00', collector: '李医生', collectMethod: '静脉采血', storageLocation: '冰箱C-1号架-1号盒' },
    { id: 4, sampleNo: 'S2026070004', bloodDrawTime: '2026-07-01 08:00', patientName: '陈晓东', pathologyNo: 'BL20261004', testProject: 'ALK融合基因检测', isCentrifuged: '否', volume: '3ml', wholeBloodVolume: '5ml', plasmaVolume: '2ml', hemolysis: '有', lipidemia: '无', coagulation: '有', isQualified: '不合格', suggestion: '重新采集', sampleDestination: '已销毁', sampleType: '血液样本', sampleSource: '昆华医院-呼吸科', barcode: 'BC20262004', collectTime: '2026-07-01 08:00', collector: '王医生', collectMethod: '静脉采血', storageLocation: '冰箱C-2号架-4号盒' },
    { id: 5, sampleNo: 'S2026070005', bloodDrawTime: '2026-07-02 08:00', patientName: '孙丽华', pathologyNo: 'BL20261005', testProject: 'TP53基因突变检测', isCentrifuged: '是', volume: '6ml', wholeBloodVolume: '10ml', plasmaVolume: '5ml', hemolysis: '无', lipidemia: '无', coagulation: '无', isQualified: '合格', suggestion: '-', sampleDestination: '检测中', sampleType: '血液样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20262005', collectTime: '2026-07-02 08:00', collector: '张医生', collectMethod: '静脉采血', storageLocation: '冰箱A-3号架-2号盒' },
    { id: 6, sampleNo: 'S2026070006', bloodDrawTime: '2026-07-02 10:00', patientName: '黄娟', pathologyNo: 'BL20261006', testProject: 'NGS多基因联合检测', isCentrifuged: '是', volume: '7ml', wholeBloodVolume: '10ml', plasmaVolume: '5ml', hemolysis: '无', lipidemia: '无', coagulation: '无', isQualified: '合格', suggestion: '-', sampleDestination: '检测中', sampleType: '血液样本', sampleSource: '昆华医院-乳腺外科', barcode: 'BC20262006', collectTime: '2026-07-02 10:00', collector: '李医生', collectMethod: '静脉采血', storageLocation: '冰箱B-3号架-1号盒' }
  ]

  const allData = ref<BloodQcItem[]>([...mockData])
  const data = ref<BloodQcItem[]>([])

  // 列配置
  const columns = ref([
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'bloodDrawTime', label: '抽血时间', width: 160 },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'testProject', label: '检测项目', minWidth: 160 },
    { prop: 'isCentrifuged', label: '是否离心', width: 90 },
    { prop: 'volume', label: '体积', width: 80 },
    { prop: 'wholeBloodVolume', label: '全血体积', width: 100 },
    { prop: 'plasmaVolume', label: '血浆体积', width: 100 },
    { prop: 'hemolysis', label: '有无溶血', width: 90 },
    { prop: 'lipidemia', label: '有无脂血', width: 90 },
    { prop: 'coagulation', label: '有无凝血', width: 90 },
    { prop: 'isQualified', label: '质控结果', width: 90, useSlot: true },
    { prop: 'suggestion', label: '处理意见', width: 100 },
    { prop: 'sampleDestination', label: '样本去向', width: 100 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row: BloodQcItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEdit(row)
          }),
          h(ArtButtonTable, {
            icon: 'ri:printer-line',
            iconClass: 'bg-primary/12 text-primary',
            title: '打印',
            onClick: () => handlePrint(row)
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
            bloodDrawTime: fs.orderSubmitTime,
            patientName: fs.patientName,
            pathologyNo: fs.pathologyNo,
            testProject: fs.projectName,
            isCentrifuged: '否',
            volume: '',
            wholeBloodVolume: '',
            plasmaVolume: '',
            hemolysis: '无',
            lipidemia: '无',
            coagulation: '无',
            isQualified: '待质控',
            suggestion: '-',
            sampleDestination: '检测中',
            sampleType: fs.sampleType || '血液样本',
            sampleSource,
            barcode: fs.barcode || '-',
            collectTime: fs.sampleStoreTime || fs.applyTime || '-',
            collector: fs.doctor || '-',
            collectMethod: '静脉采血',
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

  const handleEdit = (row: BloodQcItem) => {
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

  const handlePrint = (row: BloodQcItem) => {
    ElMessage.success(`已打印 ${row.patientName} 的凭条`)
  }

  const handleView = (row: BloodQcItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  onMounted(() => {
    fetchPageData()
  })
</script>
