<!-- 基因检测结果解释 -->
<template>
  <div class="gene-interpretation art-full-height">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="基因名称">
              <ElInput
                v-model="searchForm.geneName"
                placeholder="请输入基因名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 12 }">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
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
        :showColumnSetting="false"
      >
        <template #left>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <ElFormItem label="基因名称" prop="geneName">
          <ElInput v-model="formData.geneName" placeholder="请输入基因名称" />
        </ElFormItem>
        <ElFormItem label="结果解释" prop="interpretation">
          <ElInput
            v-model="formData.interpretation"
            type="textarea"
            :rows="4"
            placeholder="请输入结果解释"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { reportStore } from '../shared/report-data'
  import type { GeneItem } from '../shared/report-data'

  defineOptions({ name: 'GeneInterpretation' })

  // 查询条件
  const searchForm = reactive({ geneName: '' })

  // 状态
  const loading = ref(false)
  const data = ref<GeneItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // 列配置
  const columns = ref([
    { prop: 'geneName', label: '基因名称', width: 120 },
    { prop: 'interpretation', label: '结果解释', minWidth: 300 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: GeneItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
        ])
    }
  ])

  // 数据获取
  const fetchData = () => {
    loading.value = true
    setTimeout(() => {
      let filtered = [...reportStore.genes]
      if (searchForm.geneName)
        filtered = filtered.filter((d) =>
          d.geneName.includes(searchForm.geneName)
        )
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => fetchData()

  // 查询/重置
  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    searchForm.geneName = ''
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

  // 新增/编辑弹窗
  const dialogVisible = ref(false)
  const formRef = ref<FormInstance>()
  const dialogMode = ref<'add' | 'edit'>('add')
  const editingId = ref(0)
  const dialogTitle = computed(() =>
    dialogMode.value === 'add' ? '新增基因结果解释' : '编辑基因结果解释'
  )
  const formData = reactive({ geneName: '', interpretation: '' })
  const formRules: FormRules = {
    geneName: [{ required: true, message: '请输入基因名称', trigger: 'blur' }],
    interpretation: [
      { required: true, message: '请输入结果解释', trigger: 'blur' }
    ]
  }

  const handleAdd = () => {
    dialogMode.value = 'add'
    Object.assign(formData, { geneName: '', interpretation: '' })
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  // 弹窗关闭时清除验证状态
  watch(dialogVisible, (val) => {
    if (!val) {
      nextTick(() => formRef.value?.clearValidate())
    }
  })

  const handleEdit = (row: GeneItem) => {
    dialogMode.value = 'edit'
    editingId.value = row.id
    Object.assign(formData, {
      geneName: row.geneName,
      interpretation: row.interpretation
    })
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      if (dialogMode.value === 'add') {
        const newId = Math.max(...reportStore.genes.map((d) => d.id), 0) + 1
        reportStore.genes.unshift({ id: newId, ...formData })
        ElMessage.success('新增成功')
      } else {
        const idx = reportStore.genes.findIndex((d) => d.id === editingId.value)
        if (idx > -1) Object.assign(reportStore.genes[idx], formData)
        ElMessage.success('修改成功')
      }
      fetchData()
      dialogVisible.value = false
    })
  }

  const handleDelete = (row: GeneItem) => {
    ElMessageBox.confirm(
      `确定要删除基因「${row.geneName}」的解释吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const idx = reportStore.genes.findIndex((d) => d.id === row.id)
      if (idx > -1) reportStore.genes.splice(idx, 1)
      fetchData()
      ElMessage.success('删除成功')
    })
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
</style>
