<!-- RNA核酸提取 -->
<template>
  <div>
    <NaExtractionSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton :disabled="selectedRows.length === 0" @click="handleExportTemplate">
              <ArtSvgIcon icon="ri:file-download-line" class="mr-1" />
              导出模板
            </ElButton>
            <ElButton @click="handleImportTemplate">
              <ArtSvgIcon icon="ri:file-upload-line" class="mr-1" />
              模板导入
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
        <template #extractStatus="{ row }">
          <ElTag :type="row.extractStatus === '已提取' ? 'success' : 'info'" size="small">
            {{ row.extractStatus }}
          </ElTag>
        </template>
        <template #sampleQc="{ row }">
          <ElTag :type="row.sampleQc === '合格' ? 'success' : row.sampleQc === '不合格' ? 'danger' : 'info'" size="small">
            {{ row.sampleQc }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="importDialogVisible" title="模板导入" width="450px" :close-on-click-modal="false">
      <ElUpload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
      >
        <ElButton type="primary">
          <ArtSvgIcon icon="ri:upload-line" class="mr-1" />
          选择文件
        </ElButton>
        <template #tip>
          <div class="mt-2 text-xs text-gray-500">支持 .xlsx、.xls 格式文件</div>
        </template>
      </ElUpload>
      <template #footer>
        <ElButton @click="importDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="!uploadFile" @click="handleConfirmImport">确认导入</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import NaExtractionSearchForm from './na-extraction-search-form.vue'

  defineOptions({ name: 'RnaTab' })

  interface RnaItem {
    id: number
    patientName: string
    sampleNo: string
    extractStatus: string
    extractTime: string
    paraffinBlockNo: string
    gender: string
    age: number
    nation: string
    projectName: string
    sampleType: string
    sampleQc: string
    projectLeader: string
  }

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<RnaItem[]>([])
  const importDialogVisible = ref(false)
  const uploadFile = ref<UploadFile | null>(null)

  const searchParams = reactive({
    patientName: '',
    projectName: '',
    sampleNo: '',
    sampleType: '',
    extractStatus: ''
  })

  const names = ['赵丽', '周伟', '吴刚', '郑红', '孙明', '钱芳', '冯强', '蒋静', '韩光', '曹娟']
  const genders = ['男', '女']
  const nations = ['汉族', '彝族', '壮族', '苗族']
  const projects = ['肺癌10基因检测', '结直肠癌8基因检测', '乳腺癌6基因检测', '甲状腺癌5基因检测']
  const sampleTypes = ['组织样本', '血液样本', '穿刺液']
  const qcResults = ['合格', '合格', '合格', '合格', '合格', '合格', '不合格', '合格', '待质控', '合格']
  const extractStatuses = ['已提取', '已提取', '已提取', '已提取', '已提取', '已提取', '已提取', '未提取', '未提取', '已提取']
  const leaders = ['王芳', '刘强', '陈静', '杨光']

  const mockData: RnaItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 6101,
    patientName: names[i],
    sampleNo: `S${String(2026076100 + i)}`,
    extractStatus: extractStatuses[i],
    extractTime: extractStatuses[i] === '已提取' ? `2026-07-${String(5 + Math.floor(i / 5)).padStart(2, '0')} 0${String((i % 5) + 1).padStart(2, '0')}:00` : '-',
    paraffinBlockNo: `L${String(202610 + i)}`,
    gender: genders[i % 2],
    age: 25 + i * 4,
    nation: nations[i % nations.length],
    projectName: projects[i % projects.length],
    sampleType: sampleTypes[i % sampleTypes.length],
    sampleQc: qcResults[i],
    projectLeader: leaders[i % leaders.length]
  }))

  const allData = ref<RnaItem[]>([...mockData])
  const data = ref<RnaItem[]>([])

  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', minWidth: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', minWidth: 130 },
    { prop: 'extractStatus', label: '提取状态', minWidth: 90, useSlot: true },
    { prop: 'extractTime', label: '提取时间', minWidth: 160 },
    { prop: 'paraffinBlockNo', label: '蜡块号', minWidth: 120 },
    { prop: 'gender', label: '性别', minWidth: 60 },
    { prop: 'age', label: '年龄', minWidth: 60 },
    { prop: 'nation', label: '民族', minWidth: 70 },
    { prop: 'projectName', label: '项目名称', minWidth: 160 },
    { prop: 'sampleType', label: '样本类型', minWidth: 100 },
    { prop: 'sampleQc', label: '样本质控', minWidth: 90, useSlot: true },
    { prop: 'projectLeader', label: '项目负责人', minWidth: 100 }
  ])

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = allData.value.filter((item) => {
        return (
          (!searchParams.patientName || item.patientName.includes(searchParams.patientName)) &&
          (!searchParams.projectName || item.projectName.includes(searchParams.projectName)) &&
          (!searchParams.sampleNo || item.sampleNo.includes(searchParams.sampleNo)) &&
          (!searchParams.sampleType || item.sampleType.includes(searchParams.sampleType)) &&
          (!searchParams.extractStatus || item.extractStatus === searchParams.extractStatus)
        )
      })
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchPageData()
  }

  const handleResetSearch = () => {
    Object.assign(searchParams, {
      patientName: '',
      projectName: '',
      sampleNo: '',
      sampleType: '',
      extractStatus: ''
    })
    pagination.current = 1
    fetchPageData()
  }

  const refreshData = () => fetchPageData()
  const handleSizeChange = (val: number) => { pagination.size = val; pagination.current = 1; fetchPageData() }
  const handleCurrentChange = (val: number) => { pagination.current = val; fetchPageData() }
  const handleSelectionChange = (selection: RnaItem[]) => { selectedRows.value = selection }

  const handleExportTemplate = () => {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条RNA提取模板数据`)
  }

  const handleImportTemplate = () => {
    uploadFile.value = null
    importDialogVisible.value = true
  }

  const handleFileChange = (file: UploadFile) => {
    uploadFile.value = file
  }

  const handleConfirmImport = () => {
    if (!uploadFile.value) {
      ElMessage.warning('请选择文件')
      return
    }
    ElMessage.success('模板导入成功')
    importDialogVisible.value = false
  }

  onMounted(() => {
    fetchPageData()
  })
</script>