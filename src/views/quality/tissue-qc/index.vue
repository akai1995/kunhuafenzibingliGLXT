<!-- 新鲜组织样本质控 -->
<template>
  <div class="tissue-qc art-full-height">
    <!-- 查询条件 -->
    <TissueQcSearchForm @search="handleSearch" @reset="handleResetSearch" />

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
    <TissueQcEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      @submit="handleEditSubmit"
    />

    <!-- 查看抽屉 -->
    <TissueQcViewDrawer
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
  import TissueQcSearchForm from './modules/tissue-qc-search-form.vue'
  import TissueQcEditDrawer from './modules/tissue-qc-edit-drawer.vue'
  import TissueQcViewDrawer from './modules/tissue-qc-view-drawer.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'TissueQc' })

  const sampleFlowStore = useSampleFlowStore()

  interface TissueQcItem {
    id: number
    patientName: string
    sampleNo: string
    hospitalNo: string
    pathologyNo: string
    testProject: string
    cellCount: string
    m0ControlWell: string
    cvValue: string
    isQualified: string
    suggestion: string
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

  // Mock data - 8条新鲜组织质控数据，来源于已确认的组织样本
  const mockData: TissueQcItem[] = [
    { id: 1, patientName: '张伟', sampleNo: 'S2026070001', hospitalNo: 'ZY100001', pathologyNo: 'BL20261001', testProject: 'EGFR基因突变检测', cellCount: '350', m0ControlWell: 'M0-01', cvValue: '2.5', isQualified: '合格', suggestion: '-', sampleType: '新鲜组织', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20264001', collectTime: '2026-07-01 08:30', collector: '张医生', collectMethod: '手术切除', storageLocation: '冰箱E-1号架-1号盒' },
    { id: 2, patientName: '王建国', sampleNo: 'S2026070003', hospitalNo: 'ZY100003', pathologyNo: 'BL20261003', testProject: 'KRAS基因突变检测', cellCount: '280', m0ControlWell: 'M0-03', cvValue: '3.1', isQualified: '合格', suggestion: '-', sampleType: '新鲜组织', sampleSource: '昆华医院-胃肠外科', barcode: 'BC20264002', collectTime: '2026-07-01 10:30', collector: '王医生', collectMethod: '手术切除', storageLocation: '冰箱E-1号架-2号盒' },
    { id: 3, patientName: '陈晓东', sampleNo: 'S2026070005', hospitalNo: 'ZY100005', pathologyNo: 'BL20261005', testProject: 'ALK融合基因检测', cellCount: '420', m0ControlWell: 'M0-05', cvValue: '1.8', isQualified: '合格', suggestion: '-', sampleType: '新鲜组织', sampleSource: '昆华医院-呼吸科', barcode: 'BC20264003', collectTime: '2026-07-02 09:30', collector: '李医生', collectMethod: '穿刺活检', storageLocation: '冰箱E-2号架-1号盒' },
    { id: 4, patientName: '刘芳', sampleNo: 'S2026070006', hospitalNo: 'ZY100006', pathologyNo: 'BL20261006', testProject: 'ROS1融合基因检测', cellCount: '310', m0ControlWell: 'M0-06', cvValue: '2.2', isQualified: '合格', suggestion: '-', sampleType: '新鲜组织', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20264004', collectTime: '2026-07-02 10:30', collector: '赵医生', collectMethod: '手术切除', storageLocation: '冰箱E-2号架-2号盒' },
    { id: 5, patientName: '吴秀英', sampleNo: 'S2026070008', hospitalNo: 'ZY100008', pathologyNo: 'BL20261008', testProject: 'MET外显子14跳跃检测', cellCount: '180', m0ControlWell: 'M0-08', cvValue: '4.5', isQualified: '不合格', suggestion: '重新采集', sampleType: '新鲜组织', sampleSource: '昆华医院-乳腺外科', barcode: 'BC20264005', collectTime: '2026-07-02 14:30', collector: '李医生', collectMethod: '手术切除', storageLocation: '冰箱E-3号架-1号盒' },
    { id: 6, patientName: '郑浩', sampleNo: 'S2026070009', hospitalNo: 'ZY100009', pathologyNo: 'BL20261009', testProject: 'PIK3CA突变检测', cellCount: '250', m0ControlWell: 'M0-09', cvValue: '2.8', isQualified: '合格', suggestion: '-', sampleType: '新鲜组织', sampleSource: '昆华医院-呼吸科', barcode: 'BC20264006', collectTime: '2026-07-03 09:30', collector: '张医生', collectMethod: '穿刺活检', storageLocation: '冰箱E-3号架-2号盒' },
    { id: 7, patientName: '马超', sampleNo: 'S2026070011', hospitalNo: 'ZY100011', pathologyNo: 'BL20261011', testProject: 'EGFR基因突变检测', cellCount: '390', m0ControlWell: 'M0-11', cvValue: '1.5', isQualified: '合格', suggestion: '-', sampleType: '新鲜组织', sampleSource: '昆华医院-肿瘤科', barcode: 'BC20264007', collectTime: '2026-07-03 11:30', collector: '赵医生', collectMethod: '手术切除', storageLocation: '冰箱E-4号架-1号盒' },
    { id: 8, patientName: '黄娟', sampleNo: 'S2026070012', hospitalNo: 'ZY100012', pathologyNo: 'BL20261012', testProject: 'NGS多基因联合检测', cellCount: '200', m0ControlWell: 'M0-12', cvValue: '5.2', isQualified: '不合格', suggestion: '退回处理', sampleType: '新鲜组织', sampleSource: '昆华医院-乳腺外科', barcode: 'BC20264008', collectTime: '2026-07-03 14:30', collector: '李医生', collectMethod: '手术切除', storageLocation: '冰箱E-4号架-2号盒' }
  ]

  const allData = ref<TissueQcItem[]>([...mockData])
  const data = ref<TissueQcItem[]>([])

  // 列配置
  const columns = ref([
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'hospitalNo', label: '住院号', width: 120 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'testProject', label: '检测项目', minWidth: 160 },
    { prop: 'cellCount', label: '细胞数', width: 90 },
    { prop: 'm0ControlWell', label: 'M0对照孔', width: 100 },
    { prop: 'cvValue', label: 'CV值', width: 80 },
    { prop: 'isQualified', label: '质控结果', width: 90, useSlot: true },
    { prop: 'suggestion', label: '处理意见', width: 100 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: TissueQcItem) =>
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
            patientName: fs.patientName,
            sampleNo: fs.sampleNo,
            hospitalNo: '',
            pathologyNo: fs.pathologyNo,
            testProject: fs.projectName,
            cellCount: '',
            m0ControlWell: '',
            cvValue: '',
            isQualified: '待质控',
            suggestion: '-',
            sampleType: fs.sampleType || '新鲜组织',
            sampleSource,
            barcode: fs.barcode || '-',
            collectTime: fs.sampleStoreTime || fs.applyTime || '-',
            collector: fs.doctor || '-',
            collectMethod: '-',
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

  const handleEdit = (row: TissueQcItem) => {
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

  const handleView = (row: TissueQcItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  onMounted(() => {
    fetchPageData()
  })
</script>
