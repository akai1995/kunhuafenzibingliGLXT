<!-- 病理/组织质控 -->
<template>
  <div class="pathology-qc art-full-height">
    <!-- 查询条件 -->
    <PathologyQcSearchForm @search="handleSearch" @reset="handleResetSearch" />

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
              导出
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
        <template #isQualified="{ row }">
          <ElTag :type="row.isQualified === '合格' ? 'success' : row.isQualified === '不合格' ? 'danger' : 'info'" size="small">
            {{ row.isQualified }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 编辑抽屉 -->
    <PathologyQcEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      @submit="handleEditSubmit"
    />

    <!-- 查看抽屉 -->
    <PathologyQcViewDrawer
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
  import PathologyQcSearchForm from './modules/pathology-qc-search-form.vue'
  import PathologyQcEditDrawer from './modules/pathology-qc-edit-drawer.vue'
  import PathologyQcViewDrawer from './modules/pathology-qc-view-drawer.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'PathologyQc' })

  const sampleFlowStore = useSampleFlowStore()

  interface PathologyQcItem {
    id: number
    sampleNo: string
    applyTime: string
    patientName: string
    pathologyNo: string
    paraffinBlockNo: string
    testProject: string
    pathology: string
    tumorCellCount: string
    tumorCellRatio: string
    sampleSize: string
    necrosis: string
    hemorrhage: string
    sampleCategory: string
    isQualified: string
    suggestion: string
    reBorrowPathologyNo: string
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
  const selectedRows = ref<PathologyQcItem[]>([])
  const editDrawerVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const currentRow = ref<any>({})

  // Mock data - 8条病理/组织质控数据，来源于已确认的病理样本
  const mockData: PathologyQcItem[] = [
    { id: 1, sampleNo: 'S202607001', applyTime: '2026-07-01 14:00', patientName: '张伟', pathologyNo: 'BL20261001', paraffinBlockNo: 'W10001', testProject: 'EGFR基因突变检测', pathology: '腺癌1级', tumorCellCount: '充足', tumorCellRatio: '75', sampleSize: '大', necrosis: '无', hemorrhage: '无', sampleCategory: '石蜡块', isQualified: '合格', suggestion: '-', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20261001', collectTime: '2026-07-01 13:30', collector: '张医生', collectMethod: '手术切除', storageLocation: '冰箱A-1号架-1号盒' },
    { id: 2, sampleNo: 'S202607002', applyTime: '2026-07-01 15:00', patientName: '王建国', pathologyNo: 'BL20261003', paraffinBlockNo: 'W10003', testProject: 'KRAS基因突变检测', pathology: '腺癌2级', tumorCellCount: '中等', tumorCellRatio: '55', sampleSize: '中', necrosis: '无', hemorrhage: '有', sampleCategory: '石蜡块', isQualified: '合格', suggestion: '-', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-胃肠外科', barcode: 'BC20261003', collectTime: '2026-07-01 14:30', collector: '王医生', collectMethod: '手术切除', storageLocation: '冰箱A-2号架-2号盒' },
    { id: 3, sampleNo: 'S202607003', applyTime: '2026-07-02 14:00', patientName: '陈晓东', pathologyNo: 'BL20261005', paraffinBlockNo: '', testProject: 'ALK融合基因检测', pathology: '', tumorCellCount: '少量', tumorCellRatio: '30', sampleSize: '小', necrosis: '有', hemorrhage: '无', sampleCategory: '新鲜组织', isQualified: '不合格', suggestion: '补充取材', reBorrowPathologyNo: 'BL20260205', sampleType: '组织样本', sampleSource: '昆华医院-呼吸科', barcode: 'BC20261005', collectTime: '2026-07-02 13:30', collector: '李医生', collectMethod: '穿刺活检', storageLocation: '冰箱B-1号架-3号盒' },
    { id: 4, sampleNo: 'S202607004', applyTime: '2026-07-02 15:00', patientName: '刘芳', pathologyNo: 'BL20261006', paraffinBlockNo: 'W10006', testProject: 'ROS1融合基因检测', pathology: '腺癌3级', tumorCellCount: '充足', tumorCellRatio: '80', sampleSize: '中', necrosis: '无', hemorrhage: '无', sampleCategory: '石蜡块', isQualified: '合格', suggestion: '-', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20261006', collectTime: '2026-07-02 14:30', collector: '赵医生', collectMethod: '手术切除', storageLocation: '冰箱B-2号架-1号盒' },
    { id: 5, sampleNo: 'S202607005', applyTime: '2026-07-03 10:00', patientName: '吴秀英', pathologyNo: 'BL20261008', paraffinBlockNo: 'W10008', testProject: 'MET外显子14跳跃检测', pathology: '腺癌2级', tumorCellCount: '中等', tumorCellRatio: '60', sampleSize: '大', necrosis: '有', hemorrhage: '有', sampleCategory: '石蜡块', isQualified: '合格', suggestion: '-', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-乳腺外科', barcode: 'BC20261008', collectTime: '2026-07-03 09:30', collector: '李医生', collectMethod: '手术切除', storageLocation: '冰箱C-1号架-2号盒' },
    { id: 6, sampleNo: 'S202607006', applyTime: '2026-07-03 16:00', patientName: '郑浩', pathologyNo: 'BL20261009', paraffinBlockNo: '', testProject: 'PIK3CA突变检测', pathology: '', tumorCellCount: '极少', tumorCellRatio: '15', sampleSize: '小', necrosis: '有', hemorrhage: '无', sampleCategory: '切片', isQualified: '不合格', suggestion: '重新切片', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-呼吸科', barcode: 'BC20261009', collectTime: '2026-07-03 15:30', collector: '张医生', collectMethod: '穿刺活检', storageLocation: '冰箱C-2号架-3号盒' },
    { id: 7, sampleNo: 'S202607007', applyTime: '2026-07-03 12:00', patientName: '马超', pathologyNo: 'BL20261011', paraffinBlockNo: 'W10011', testProject: 'EGFR基因突变检测', pathology: '腺癌1级', tumorCellCount: '充足', tumorCellRatio: '70', sampleSize: '中', necrosis: '无', hemorrhage: '无', sampleCategory: '新鲜组织', isQualified: '合格', suggestion: '-', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20261011', collectTime: '2026-07-03 11:30', collector: '赵医生', collectMethod: '手术切除', storageLocation: '冰箱A-3号架-1号盒' },
    { id: 8, sampleNo: 'S202607008', applyTime: '2026-07-03 14:00', patientName: '黄娟', pathologyNo: 'BL20261012', paraffinBlockNo: 'W10012', testProject: 'NGS多基因联合检测', pathology: '腺癌2级', tumorCellCount: '中等', tumorCellRatio: '50', sampleSize: '大', necrosis: '无', hemorrhage: '有', sampleCategory: '石蜡块', isQualified: '合格', suggestion: '-', reBorrowPathologyNo: '', sampleType: '组织样本', sampleSource: '昆华医院-乳腺外科', barcode: 'BC20261012', collectTime: '2026-07-03 13:30', collector: '李医生', collectMethod: '手术切除', storageLocation: '冰箱B-4号架-2号盒' }
  ]

  const allData = ref<PathologyQcItem[]>([...mockData])
  const data = ref<PathologyQcItem[]>([])

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 120 },
    { prop: 'applyTime', label: '申请时间', width: 160 },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'paraffinBlockNo', label: '蜡块号', width: 100 },
    { prop: 'testProject', label: '检测项目', minWidth: 160 },
    { prop: 'pathology', label: '病理', width: 100 },
    { prop: 'tumorCellCount', label: '肿瘤细胞数量', width: 120 },
    { prop: 'tumorCellRatio', label: '肿瘤细胞比例', width: 120 },
    { prop: 'sampleSize', label: '样本大小', width: 90 },
    { prop: 'necrosis', label: '有无坏死', width: 90 },
    { prop: 'hemorrhage', label: '有无出血', width: 90 },
    { prop: 'sampleCategory', label: '样本种类', width: 130 },
    { prop: 'isQualified', label: '质控结果', width: 90, useSlot: true },
    { prop: 'suggestion', label: '处理意见', width: 100 },
    { prop: 'reBorrowPathologyNo', label: '重借病理号', width: 120 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row: PathologyQcItem) =>
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
            applyTime: fs.applyTime,
            patientName: fs.patientName,
            pathologyNo: fs.pathologyNo,
            paraffinBlockNo: '-',
            testProject: fs.projectName,
            pathology: '-',
            tumorCellCount: '-',
            tumorCellRatio: '-',
            sampleSize: '-',
            necrosis: '无',
            hemorrhage: '无',
            sampleCategory: fs.sampleType,
            isQualified: '-',
            suggestion: '-',
            reBorrowPathologyNo: '-',
            sampleType: fs.sampleType || '组织样本',
            sampleSource,
            barcode: fs.barcode || '-',
            collectTime: fs.sampleStoreTime || fs.applyTime || '-',
            collector: fs.doctor || '-',
            collectMethod: '-',
            storageLocation: fs.storageLocation || '-',
            confirmer: fs.isSelfSample === 'no' && fs.receiveStatus === 'received' ? '接收员' : '',
            confirmTime: fs.isSelfSample === 'no' && fs.receiveStatus === 'received' ? fs.sampleStoreTime || fs.orderSubmitTime || '' : ''
          })
        } else {
          // 已存在的样本（如mock数据），刷新为Store中的最新状态
          const idx = allData.value.findIndex((d) => d.id === fs.id)
          if (idx > -1) {
            allData.value[idx].rejected = false
            allData.value[idx].sampleNo = fs.sampleNo
            allData.value[idx].applyTime = fs.applyTime
            allData.value[idx].patientName = fs.patientName
            allData.value[idx].pathologyNo = fs.pathologyNo
            allData.value[idx].testProject = fs.projectName
            allData.value[idx].sampleCategory = fs.sampleType
            allData.value[idx].paraffinBlockNo = '-'
            allData.value[idx].pathology = '-'
            allData.value[idx].tumorCellCount = '-'
            allData.value[idx].tumorCellRatio = '-'
            allData.value[idx].sampleSize = '-'
            allData.value[idx].isQualified = '-'
            allData.value[idx].suggestion = '-'
            allData.value[idx].reBorrowPathologyNo = '-'
            allData.value[idx].sampleType = fs.sampleType || '组织样本'
            allData.value[idx].sampleSource = sampleSource
            allData.value[idx].barcode = fs.barcode || '-'
            allData.value[idx].collectTime = fs.sampleStoreTime || fs.applyTime || '-'
            allData.value[idx].collector = fs.doctor || '-'
            allData.value[idx].storageLocation = fs.storageLocation || '-'
          }
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

  const handleSelectionChange = (selection: PathologyQcItem[]) => {
    selectedRows.value = selection
  }

  const handleEdit = (row: PathologyQcItem) => {
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

  const handlePrint = (row: PathologyQcItem) => {
    ElMessage.success(`已打印 ${row.pathologyNo} 的凭条`)
  }

  const handleView = (row: PathologyQcItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  const handleExport = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  onMounted(() => {
    fetchPageData()
  })
</script>
