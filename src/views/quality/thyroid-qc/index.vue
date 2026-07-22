<!-- 甲状腺穿刺液质控 -->
<template>
  <div class="thyroid-qc art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton :disabled="selectedRows.length === 0" @click="handleExport">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              导出
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
        <template #qcResult="{ row }">
          <ElTag :type="row.qcResult === '合格' ? 'success' : row.qcResult === '不合格' ? 'danger' : 'info'" size="small">
            {{ row.qcResult }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 编辑抽屉 -->
    <ThyroidQcEditDrawer
      v-model:visible="editDrawerVisible"
      :row-data="currentRow"
      @submit="handleEditSubmit"
    />

    <!-- 查看抽屉 -->
    <ThyroidQcViewDrawer
      v-model:visible="viewDrawerVisible"
      :row-data="currentRow"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ThyroidQcEditDrawer from './modules/thyroid-qc-edit-drawer.vue'
  import ThyroidQcViewDrawer from './modules/thyroid-qc-view-drawer.vue'

  defineOptions({ name: 'ThyroidQc' })

  interface ThyroidQcItem {
    id: number
    sampleNo: string
    patientName: string
    gender: string
    age: number
    pathologyNo: string
    testProject: string
    qcTime: string
    qcResult: string
    qcPerson: string
    punctureVolume: string
    suggestion: string
    sampleDestination: string
  }

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedRows = ref<ThyroidQcItem[]>([])
  const editDrawerVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const currentRow = ref<ThyroidQcItem | null>(null)

  const names = ['张明', '李华', '王芳', '刘强', '陈静', '杨光', '赵丽', '周伟']
  const genders = ['男', '女', '女', '男', '女', '男', '女', '男']
  const results = ['合格', '合格', '合格', '合格', '合格', '合格', '不合格', '合格', '待质控', '合格']
  const qcPersons = ['王芳', '刘强', '陈静', '杨光']
  const volumes = ['2.5', '3.0', '1.8', '2.2', '3.5', '2.0', '2.8', '1.5', '3.2', '2.1']

  const mockData: ThyroidQcItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 7001,
    sampleNo: `S${String(2026077000 + i)}`,
    patientName: names[i % names.length],
    gender: genders[i % genders.length],
    age: 25 + Math.floor(Math.random() * 40),
    pathologyNo: `BL${String(20267000 + i)}`,
    testProject: '甲状腺穿刺液质控',
    qcTime: `2026-07-${String(4 + Math.floor(i / 5)).padStart(2, '0')} 0${String((i % 5) + 1).padStart(2, '0')}:00`,
    qcResult: results[i],
    qcPerson: qcPersons[i % qcPersons.length],
    punctureVolume: volumes[i],
    suggestion: '-',
    sampleDestination: '检测中'
  }))

  const allData = ref<ThyroidQcItem[]>([...mockData])
  const data = ref<ThyroidQcItem[]>([])

  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 130 },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'gender', label: '性别', width: 60 },
    { prop: 'age', label: '年龄', width: 60 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'testProject', label: '检测项目', minWidth: 160 },
    { prop: 'punctureVolume', label: '穿刺液体积', width: 110 },
    { prop: 'qcTime', label: '质控时间', width: 160 },
    { prop: 'qcResult', label: '质控结果', width: 90, useSlot: true },
    { prop: 'qcPerson', label: '质控人', width: 90 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: ThyroidQcItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) })
        ])
    }
  ])

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      pagination.total = allData.value.length
      const start = (pagination.current - 1) * pagination.size
      data.value = allData.value.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchPageData()
  const handleSizeChange = (val: number) => { pagination.size = val; pagination.current = 1; fetchPageData() }
  const handleCurrentChange = (val: number) => { pagination.current = val; fetchPageData() }
  const handleSelectionChange = (selection: ThyroidQcItem[]) => { selectedRows.value = selection }

  const handleEdit = (row: ThyroidQcItem) => {
    currentRow.value = row
    editDrawerVisible.value = true
  }

  const handleEditSubmit = (formData: any) => {
    const target = allData.value.find((item) => item.id === currentRow.value?.id)
    if (target) {
      target.punctureVolume = formData.punctureVolume
      target.qcResult = formData.qcResult
      target.suggestion = formData.suggestion
      target.sampleDestination = formData.sampleDestination
      target.qcPerson = '当前用户'
      target.qcTime = new Date().toLocaleString('zh-CN', { hour12: false })
    }
    currentRow.value = null
    fetchPageData()
  }

  const handleView = (row: ThyroidQcItem) => {
    currentRow.value = row
    viewDrawerVisible.value = true
  }

  const handleExport = () => { ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`) }

  onMounted(() => fetchPageData())
</script>