<!-- 核酸提取批次 -->
<template>
  <div>
    <BatchSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns" />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import BatchSearchForm from './batch-search-form.vue'

  defineOptions({ name: 'BatchTab' })

  interface BatchItem {
    id: number
    batchNo: string
    extractType: string
    extractTime: string
  }

  const loading = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  const searchParams = reactive({
    batchNo: '',
    extractType: ''
  })

  const extractTypes = ['DNA', 'RNA', 'DNA', 'RNA', 'DNA', 'RNA', 'DNA', 'RNA', 'DNA', 'RNA']

  const mockData: BatchItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 6201,
    batchNo: `NA${String(2026076200 + i)}`,
    extractType: extractTypes[i],
    extractTime: `2026-07-${String(5 + Math.floor(i / 5)).padStart(2, '0')} ${String(8 + i).padStart(2, '0')}:00`
  }))

  const allData = ref<BatchItem[]>([...mockData])
  const data = ref<BatchItem[]>([])

  const columns = ref([
    { prop: 'batchNo', label: '提取批号', minWidth: 160 },
    { prop: 'extractType', label: '提取类型', minWidth: 120 },
    { prop: 'extractTime', label: '提取时间', minWidth: 180 }
  ])

  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = allData.value.filter((item) => {
        return (
          (!searchParams.batchNo || item.batchNo.includes(searchParams.batchNo)) &&
          (!searchParams.extractType || item.extractType === searchParams.extractType)
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
      batchNo: '',
      extractType: ''
    })
    pagination.current = 1
    fetchPageData()
  }

  const refreshData = () => fetchPageData()
  const handleSizeChange = (val: number) => { pagination.size = val; pagination.current = 1; fetchPageData() }
  const handleCurrentChange = (val: number) => { pagination.current = val; fetchPageData() }

  onMounted(() => {
    fetchPageData()
  })
</script>