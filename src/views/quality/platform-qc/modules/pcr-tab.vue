<!-- PCR平台质控 -->
<template>
  <div>
    <PcrSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton :disabled="machineExportDisabled" @click="handleMachineExport">
              <ArtSvgIcon icon="ri:upload-2-line" class="mr-1" />
              上机导出
            </ElButton>
            <ElButton :disabled="batchMachineDisabled" @click="handleBatchMachine">
              <ArtSvgIcon icon="ri:server-line" class="mr-1" />
              批量上机
            </ElButton>
            <ElButton :disabled="batchBioinfoDisabled" @click="handleBatchBioinfo">
              <ArtSvgIcon icon="ri:brain-line" class="mr-1" />
              批量生信
            </ElButton>
            <ElButton :disabled="selectedRows.length === 0" @click="handleBatchExport">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              批量导出
            </ElButton>
            
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #sampleQc="{ row }">
          <QcStatusTag :status="row.sampleQc" />
        </template>
        <template #nucleicAcidQc="{ row }">
          <QcStatusTag
            :status="row.nucleicAcidQc"
            clickable
            @click="handleQcTagClick(row, 'nucleicAcid')"
          />
        </template>
        <template #libraryQc="{ row }">
          <QcStatusTag
            :status="row.libraryQc"
            clickable
            @click="handleQcTagClick(row, 'library')"
          />
        </template>
        <template #machineQc="{ row }">
          <QcStatusTag
            :status="row.machineQc"
            clickable
            @click="handleQcTagClick(row, 'machine')"
          />
        </template>
        <template #bioinfoAudit="{ row }">
          <QcStatusTag
            :status="row.bioinfoAudit"
            clickable
            @click="handleQcTagClick(row, 'bioinfo')"
          />
        </template>
      </ArtTable>
    </ElCard>

    <!-- 编辑抽屉 -->
    <PcrEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      :sub-platform="props.subPlatform"
      @submit="handleEditSubmit"
    />

    <!-- 查看抽屉 -->
    <PcrViewDrawer v-model:visible="viewDrawerVisible" :row-data="currentRow" :sub-platform="subPlatform" />

    

    <!-- 质控详情弹窗 -->
    <PcrQcDetailDialog
      v-model:visible="qcDetailVisible"
      :qc-type="activeQcType"
      :form-data="currentRow"
      :readonly="false"
      :project-id="projectId"
      @submit="handleQcDetailSubmit"
    />

  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { ColumnOption } from '@/types'
  import PcrSearchForm from './pcr-search-form.vue'
import PcrEditDrawer from './pcr-edit-drawer.vue'
import PcrViewDrawer from './pcr-view-drawer.vue'

import PcrQcDetailDialog from './pcr-qc-detail-dialog.vue'
import QcStatusTag from './qc-status-tag.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'
  import { checkPcrQcSequence } from './qc-sequence'

  defineOptions({ name: 'PcrTab' })

  interface Props {
    subPlatform: 'pcr10' | 'pcr11'
  }

  const props = defineProps<Props>()

  const projectId = computed(() => {
    return props.subPlatform === 'pcr10' ? 'project-pcr10' : 'project-pcr11'
  })

  const machineExportDisabled = computed(() => {
    if (selectedRows.value.length === 0) return true
    return !selectedRows.value.every((r) => r.nucleicAcidQc === '合格' && r.libraryQc === '合格')
  })

  const batchMachineDisabled = computed(() => {
    if (selectedRows.value.length === 0) return true
    return !selectedRows.value.every((r) => r.nucleicAcidQc === '合格' && r.libraryQc === '合格')
  })

  const batchBioinfoDisabled = computed(() => {
    if (selectedRows.value.length === 0) return true
    return !selectedRows.value.every(
      (r) => r.nucleicAcidQc === '合格' && r.libraryQc === '合格' && r.machineQc === '合格'
    )
  })

  const sampleFlowStore = useSampleFlowStore()

  interface PcrItem {
    id: number
    sampleNo: string
    pathologyNo: string
    visitNo: string
    patientName: string
    projectName: string
    sampleQc: string
    nucleicAcidQc: string
    libraryQc: string
    machineQc: string
    bioinfoAudit: string
    kitNo: string
    // 申请信息
    applyCode: string
    // 核酸质控
    naQcDoctor: string
    naQcTime: string
    naQcResult: string
    // DNA
    dnaConc: string
    dna260280: string
    dna260230: string
    dnaVolume: string
    dnaTotal: string
    // RNA
    rnaConc: string
    rna260280: string
    rna260230: string
    rnaVolume: string
    rnaTotal: string
    // 文库质控
    libQcDoctor: string
    libQcTime: string
    libQubitConc: string
    libVolume: string
    libTotalAmount: string
    libRemark: string
    libQcResult: string
    // 上机质控
    machineQcDoctor: string
    machineQcTime: string
    machineLotNo: string
    machineClusterDensity: string
    machineClusterPass: string
    machineQ30: string
    machineEffectiveData: string
    machineRemark: string
    machineQcResult: string
    // 生信审核
    bioQcDoctor: string
    bioQcTime: string
    bioQcResult: string
  }

  const searchParams = reactive({
    patientName: '',
    pathologyNo: '',
    sampleNo: '',
    projectName: '',
    nucleicAcidQc: '',
    libraryQc: '',
    machineQc: '',
    bioinfoAudit: ''
  })

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<PcrItem[]>([])
  const editDrawerVisible = ref(false)
const viewDrawerVisible = ref(false)

const qcDetailVisible = ref(false)
const activeQcType = ref('nucleicAcid')
const currentRow = ref<any>({})

  const qcStatuses = ['合格', '不合格', '待质控']
  const names = ['张明', '李华', '王芳', '刘强', '陈静', '杨光', '赵丽', '周伟']
  const pcr10Projects = ['PCR10基因质控']
  const pcr11Projects = ['PCR11基因质控']

  const generateMockData = (tab: 'pcr10' | 'pcr11'): PcrItem[] => {
    const projects = tab === 'pcr10' ? pcr10Projects : pcr11Projects
    // PCR质控顺序：核酸质控 → 文库质控 → 上机质控 → 生信审核
    // 前序未完成时后续必须为"待质控"
    const statusGroups: Array<[string, string, string, string]> = [
      ['合格', '合格', '合格', '合格'],
      ['合格', '合格', '合格', '合格'],
      ['合格', '合格', '合格', '合格'],
      ['合格', '合格', '合格', '合格'],
      ['合格', '合格', '合格', '不合格'],
      ['合格', '合格', '合格', '不合格'],
      ['合格', '合格', '合格', '不合格'],
      ['合格', '合格', '不合格', '待质控'],
      ['合格', '合格', '不合格', '待质控'],
      ['合格', '不合格', '待质控', '待质控'],
      ['合格', '不合格', '待质控', '待质控'],
      ['合格', '不合格', '待质控', '待质控'],
      ['不合格', '待质控', '待质控', '待质控'],
      ['不合格', '待质控', '待质控', '待质控'],
      ['合格', '合格', '合格', '待质控'],
      ['合格', '合格', '合格', '待质控'],
      ['合格', '合格', '合格', '待质控'],
      ['合格', '合格', '合格', '待质控'],
      ['合格', '合格', '待质控', '待质控'],
      ['合格', '合格', '待质控', '待质控'],
      ['合格', '合格', '待质控', '待质控'],
      ['合格', '待质控', '待质控', '待质控'],
      ['合格', '待质控', '待质控', '待质控'],
      ['合格', '待质控', '待质控', '待质控'],
      ['不合格', '待质控', '待质控', '待质控']
    ]

    return Array.from({ length: 25 }, (_, i) => {
      const id = tab === 'pcr10' ? i + 1 : i + 1001
      const [naStatus, libStatus, machineStatus, bioStatus] = statusGroups[i]
      const isNaDone = naStatus !== '待质控'
      const isLibDone = libStatus !== '待质控'
      const isMachineDone = machineStatus !== '待质控'
      const isBioDone = bioStatus !== '待质控'

      return {
        id,
        sampleNo: `XS${String(20260001 + id)}`,
        pathologyNo: `BL${String(20260001 + id)}`,
        visitNo: `JZ${String(20260001 + id)}`,
        patientName: names[i % names.length],
        projectName: projects[0],
        sampleQc: '合格',
        nucleicAcidQc: naStatus,
        libraryQc: libStatus,
        machineQc: machineStatus,
        bioinfoAudit: bioStatus,
        kitNo: `KIT${String(2026001 + id)}`,
        applyCode: `BL${String(20260001 + id)}`,
        // 核酸质控
        naQcDoctor: isNaDone ? names[i % names.length] : '',
        naQcTime: isNaDone ? `2026-07-${String(3 + Math.floor(i / 4)).padStart(2, '0')} 10:00` : '',
        naQcResult: isNaDone ? naStatus : '',
        dnaConc: isNaDone ? `${(20 + i * 1.5).toFixed(1)}` : '',
        dna260280: isNaDone ? '1.85' : '',
        dna260230: isNaDone ? '2.10' : '',
        dnaVolume: isNaDone ? '50' : '',
        dnaTotal: isNaDone ? `${(1000 + i * 75).toFixed(0)}` : '',
        rnaConc: isNaDone ? `${(15 + i * 0.8).toFixed(1)}` : '',
        rna260280: isNaDone ? '2.05' : '',
        rna260230: isNaDone ? '2.15' : '',
        rnaVolume: isNaDone ? '40' : '',
        rnaTotal: isNaDone ? `${(600 + i * 32).toFixed(0)}` : '',
        // 文库质控
        libQcDoctor: isLibDone ? names[(i + 1) % names.length] : '',
        libQcTime: isLibDone ? `2026-07-${String(4 + Math.floor(i / 4)).padStart(2, '0')} 14:00` : '',
        libIndexSet: isLibDone ? `Index${(i % 6) + 1}` : '',
        libIndexWell: isLibDone ? `A${(i % 12) + 1}` : '',
        libQubitConc: isLibDone ? `${(5 + i * 0.8).toFixed(1)}` : '',
        libFragment: isLibDone ? 'Normal' : '',
        libFragmentSize: isLibDone ? '350bp' : '',
        libRemark: isLibDone ? '' : '',
        libQcResult: isLibDone ? libStatus : '',
        // 上机质控
        machineQcDoctor: isMachineDone ? names[(i + 2) % names.length] : '',
        machineQcTime: isMachineDone ? `2026-07-${String(5 + Math.floor(i / 4)).padStart(2, '0')} 09:00` : '',
        machineLotNo: isMachineDone ? `B${String((i % 3) + 1).padStart(3, '0')}` : '',
        machineClusterDensity: isMachineDone ? `${(150 + i * 10).toFixed(0)}` : '',
        machineClusterPass: isMachineDone ? `${(85 + i * 0.5).toFixed(1)}%` : '',
        machineQ30: isMachineDone ? `${(88 + i * 0.3).toFixed(1)}%` : '',
        machineEffectiveData: isMachineDone ? `${(3.5 + i * 0.2).toFixed(1)}G` : '',
        machineRemark: isMachineDone ? '' : '',
        machineQcResult: isMachineDone ? machineStatus : '',
        // 生信审核
        bioQcDoctor: isBioDone ? names[(i + 3) % names.length] : '',
        bioQcTime: isBioDone ? `2026-07-${String(6 + Math.floor(i / 4)).padStart(2, '0')} 16:00` : '',
        bioQcResult: isBioDone ? bioStatus : ''
      }
    })
  }

  // 两个tab各自维护独立数据
  const allDataMap = reactive<Record<string, PcrItem[]>>({
    pcr10: generateMockData('pcr10'),
    pcr11: generateMockData('pcr11')
  })

  const data = ref<PcrItem[]>([])

  const columns = ref<ColumnOption[]>([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'projectName', label: '检测项目', minWidth: 160 },
    { prop: 'sampleQc', label: '样本质控', width: 90, useSlot: true },
    { prop: 'nucleicAcidQc', label: '核酸质控', width: 100, useSlot: true },
    { prop: 'libraryQc', label: '文库质控', width: 100, useSlot: true },
    { prop: 'machineQc', label: '上机质控', width: 100, useSlot: true },
    { prop: 'bioinfoAudit', label: '生信审核', width: 100, useSlot: true },
    { prop: 'kitNo', label: '试剂盒号', width: 130 },
    {
      prop: 'operation',
      label: '操作',
      width: 66,
      fixed: 'right',
      formatter: (row: PcrItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) })
        ])
    }
  ])

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const currentAll = allDataMap[props.subPlatform]
      const projects = props.subPlatform === 'pcr10' ? pcr10Projects : pcr11Projects

      // 流程三：从Store获取样本质控完成的流转样本，只合并当前子平台项目的样本
      const flowSamples = sampleFlowStore.getSamplesForPlatformQc().filter((fs) =>
        projects.includes(fs.projectName)
      )
      const existingIds = new Set(currentAll.map((d) => d.id))
      flowSamples.forEach((fs) => {
        if (!existingIds.has(fs.id)) {
          const newItem: PcrItem = {
            id: fs.id,
            sampleNo: fs.sampleNo,
            pathologyNo: fs.pathologyNo,
            visitNo: fs.barcode || '',
            patientName: fs.patientName,
            projectName: fs.projectName,
            sampleQc: '合格',
            nucleicAcidQc: '待质控',
            libraryQc: '待质控',
            machineQc: '待质控',
            bioinfoAudit: '待质控',
            kitNo: '',
            applyCode: fs.pathologyNo || fs.applyCode,
            // 核酸质控
            naQcDoctor: '',
            naQcTime: '',
            naQcResult: '',
            dnaConc: '',
            dna260280: '',
            dna260230: '',
            dnaVolume: '',
            dnaTotal: '',
            rnaConc: '',
            rna260280: '',
            rna260230: '',
            rnaVolume: '',
            rnaTotal: '',
            // 文库质控
            libQcDoctor: '',
            libQcTime: '',
            libIndexSet: '',
            libIndexWell: '',
            libQubitConc: '',
            libFragment: '',
            libFragmentSize: '',
            libRemark: '',
            libQcResult: '',
            // 上机质控
            machineQcDoctor: '',
            machineQcTime: '',
            machineLotNo: '',
            machineClusterDensity: '',
            machineClusterPass: '',
            machineQ30: '',
            machineEffectiveData: '',
            machineRemark: '',
            machineQcResult: '',
            // 生信审核
            bioQcDoctor: '',
            bioQcTime: '',
            bioQcResult: ''
          }
          currentAll.unshift(newItem)
        }
      })

      const filtered = currentAll.filter((item) => {
        return (
          (!searchParams.patientName || item.patientName.includes(searchParams.patientName)) &&
          (!searchParams.pathologyNo || item.pathologyNo.includes(searchParams.pathologyNo)) &&
          (!searchParams.sampleNo || item.sampleNo.includes(searchParams.sampleNo)) &&
          (!searchParams.projectName || item.projectName.includes(searchParams.projectName)) &&
          (!searchParams.nucleicAcidQc || item.nucleicAcidQc === searchParams.nucleicAcidQc) &&
          (!searchParams.libraryQc || item.libraryQc === searchParams.libraryQc) &&
          (!searchParams.machineQc || item.machineQc === searchParams.machineQc) &&
          (!searchParams.bioinfoAudit || item.bioinfoAudit === searchParams.bioinfoAudit)
        )
      })
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchPageData()

  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchPageData()
  }

  const handleResetSearch = () => {
    Object.assign(searchParams, {
      patientName: '',
      pathologyNo: '',
      sampleNo: '',
      projectName: '',
      nucleicAcidQc: '',
      libraryQc: '',
      machineQc: '',
      bioinfoAudit: ''
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
  const handleSelectionChange = (selection: PcrItem[]) => {
    selectedRows.value = selection
  }

  // 编辑：打开编辑抽屉
  const handleEdit = (row: PcrItem) => {
    currentRow.value = { ...row }
    editDrawerVisible.value = true
  }

  // 点击质控标签：直接打开对应质控编辑弹窗
  const handleQcTagClick = (row: PcrItem, qcType: string) => {
    const { passed, message } = checkPcrQcSequence(qcType, row)
    if (!passed) {
      ElMessageBox.alert(message!, '提示', { type: 'warning', confirmButtonText: '确定', customClass: 'qc-sequence-dialog' })
      return
    }
    currentRow.value = { ...row }
    activeQcType.value = qcType
    qcDetailVisible.value = true
  }

  // 质控详情弹窗提交
  const handleQcDetailSubmit = (data: any) => {
    const currentAll = allDataMap[props.subPlatform]
    const idx = currentAll.findIndex((d) => d.id === data.id)
    if (idx > -1) {
      currentAll[idx] = {
        ...currentAll[idx],
        ...data
      }
      // 流程三：技术平台质控全部完成（所有质控均为合格），数据流转到报告管理
      const row = currentAll[idx]
      if (
        row &&
        row.sampleQc === '合格' &&
        row.nucleicAcidQc === '合格' &&
        row.libraryQc === '合格' &&
        row.machineQc === '合格' &&
        row.bioinfoAudit === '合格'
      ) {
        sampleFlowStore.completePlatformQc(data.id)
      }
    }
    fetchPageData()
  }

  // 编辑抽屉提交
  const handleEditSubmit = (submitData: any) => {
    const currentAll = allDataMap[props.subPlatform]
    const idx = currentAll.findIndex((d) => d.id === submitData.id)
    if (idx > -1) {
      currentAll[idx] = {
        ...currentAll[idx],
        ...submitData
      }
      // 流程三：技术平台质控全部完成（所有质控均为合格），数据流转到报告管理
      const row = currentAll[idx]
      if (
        row &&
        row.sampleQc === '合格' &&
        row.nucleicAcidQc === '合格' &&
        row.libraryQc === '合格' &&
        row.machineQc === '合格' &&
        row.bioinfoAudit === '合格'
      ) {
        sampleFlowStore.completePlatformQc(submitData.id)
      }
    }
    fetchPageData()
  }

  const handleView = (row: PcrItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  const handleBatchExport = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  const handleMachineExport = () => {
    ElMessage.success(`已上机导出 ${selectedRows.value.length} 条数据`)
  }

  const handleBatchMachine = () => {
    ElMessage.success(`已批量上机 ${selectedRows.value.length} 条数据`)
  }

  const handleBatchBioinfo = () => {
    ElMessage.success(`已批量生信 ${selectedRows.value.length} 条数据`)
  }

  // 切换子平台时重新加载数据
  watch(
    () => props.subPlatform,
    () => {
      pagination.current = 1
      selectedRows.value = []
      fetchPageData()
    }
  )

  onMounted(() => {
    fetchPageData()
  })
</script>

<style lang="scss" scoped></style>

<style lang="scss">
  .qc-sequence-dialog {
    .el-message-box__message {
      text-align: left;
    }
    .el-message-box__btns {
      justify-content: flex-end;
    }
  }
</style>
