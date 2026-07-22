<!-- 报告模板 -->
<template>
  <div class="report-template art-full-height">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="模板名称">
              <ElInput
                v-model="searchForm.name"
                placeholder="请输入模板名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="模板类型">
              <ElSelect
                v-model="searchForm.type"
                placeholder="请选择模板类型"
                clearable
                style="width: 100%"
              >
                <ElOption label="基因检测" value="gene" />
                <ElOption label="病理检测" value="pathology" />
                <ElOption label="综合报告" value="comprehensive" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="模板分类">
              <ElSelect
                v-model="searchForm.category"
                placeholder="请选择模板分类"
                clearable
                style="width: 100%"
              >
                <ElOption label="突变检测" value="mutation" />
                <ElOption label="融合检测" value="fusion" />
                <ElOption label="扩增检测" value="amplification" />
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
            <ElFormItem label="模板编码">
              <ElInput
                v-model="searchForm.code"
                placeholder="请输入模板编码"
                clearable
                @keyup.enter="handleSearch"
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
      <ArtTableHeader
        :loading="loading"
        @refresh="refreshData"
        :showColumnSetting="false"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新增
            </ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handleExport"
            >
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
      />
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm ref="formRef" :key="dialogMode" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem label="模板名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入模板名称" />
        </ElFormItem>
        <ElFormItem label="模板类型" prop="type">
          <ElSelect v-model="formData.type" placeholder="请选择模板类型" style="width: 100%">
            <ElOption label="基因检测" value="gene" />
            <ElOption label="病理检测" value="pathology" />
            <ElOption label="综合报告" value="comprehensive" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="模板分类" prop="category">
          <ElSelect v-model="formData.category" placeholder="请选择模板分类" style="width: 100%">
            <ElOption label="突变检测" value="mutation" />
            <ElOption label="融合检测" value="fusion" />
            <ElOption label="扩增检测" value="amplification" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="模板路径" prop="path">
          <ElInput v-model="formData.path" placeholder="请输入模板路径" />
        </ElFormItem>
        <ElFormItem label="关联项目" prop="projectName">
          <ElSelect
            v-model="formData.projectName"
            placeholder="请选择关联项目"
            filterable
            style="width: 100%"
            @change="handleProjectChange"
          >
            <ElOption
              v-for="p in reportStore.priceProjects"
              :key="p.id"
              :label="p.projectName"
              :value="p.projectName"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="项目编码" prop="projectCode">
          <ElInput v-model="formData.projectCode" placeholder="选择关联项目后自动带出" disabled />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 查看弹窗 -->
    <ElDialog
      v-model="viewDialogVisible"
      title="模板详情"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="模板名称">
          {{ viewData?.name || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="模板类型">
          {{ getTplTypeText(viewData?.type || '') }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="项目名称">
          {{ viewData?.projectName || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="项目编码">
          {{ viewData?.projectCode || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="模板分类">
          {{ getTplCategoryText(viewData?.category || '') }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="模板编码">
          {{ viewData?.code || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="模板路径">
          {{ viewData?.path || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { reportStore } from '../shared/report-data'
  import type { TemplateItem } from '../shared/report-data'

  defineOptions({ name: 'ReportTemplate' })

  // 查询条件
  const searchForm = reactive({
    name: '',
    type: '',
    category: '',
    code: ''
  })

  // 状态
  const loading = ref(false)
  const data = ref<TemplateItem[]>([])
  const selectedRows = ref<TemplateItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const searchExpanded = ref(false)

  const toggleSearchExpand = () => {
    searchExpanded.value = !searchExpanded.value
  }

  // 类型/分类映射
  const getTplTypeText = (type: string) => {
    const map: Record<string, string> = {
      gene: '基因检测',
      pathology: '病理检测',
      comprehensive: '综合报告'
    }
    return map[type] || type
  }

  const getTplCategoryText = (category: string) => {
    const map: Record<string, string> = {
      mutation: '突变检测',
      fusion: '融合检测',
      amplification: '扩增检测'
    }
    return map[category] || category
  }

  // 列配置
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'name', label: '模板名称', minWidth: 180 },
    {
      prop: 'type',
      label: '模板类型',
      width: 100,
      formatter: (row: TemplateItem) => getTplTypeText(row.type)
    },
    {
      prop: 'projectName',
      label: '项目名称',
      minWidth: 160
    },
    { prop: 'projectCode', label: '项目编码', width: 150 },
    {
      prop: 'category',
      label: '模板分类',
      width: 100,
      formatter: (row: TemplateItem) => getTplCategoryText(row.category)
    },
    { prop: 'code', label: '模板编码', width: 140 },
    { prop: 'path', label: '模板路径', minWidth: 200 },
    {
      prop: 'operation',
      label: '操作',
      width: 192,
      fixed: 'right',
      formatter: (row: TemplateItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) }),
          h(ArtButtonTable, {
            icon: 'ri:download-line',
            title: '下载模板',
            onClick: () => handleDownload(row)
          }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
        ])
    }
  ])

  // 数据获取
  const fetchData = () => {
    loading.value = true
    setTimeout(() => {
      let filtered = [...reportStore.templates]
      if (searchForm.name)
        filtered = filtered.filter((d) => d.name.includes(searchForm.name))
      if (searchForm.type)
        filtered = filtered.filter((d) => d.type === searchForm.type)
      if (searchForm.category)
        filtered = filtered.filter((d) => d.category === searchForm.category)
      if (searchForm.code)
        filtered = filtered.filter((d) => d.code.includes(searchForm.code))
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
    Object.assign(searchForm, { name: '', type: '', category: '', code: '' })
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

  const handleSelectionChange = (selection: TemplateItem[]) => {
    selectedRows.value = selection
  }

  // 导出
  const handleExport = () => {
    const headers = [
      '模板名称', '模板类型', '项目名称', '项目编码', '模板分类', '模板编码', '模板路径'
    ]
    const rows = selectedRows.value.map((r) => [
      r.name,
      getTplTypeText(r.type),
      r.projectName,
      r.projectCode,
      getTplCategoryText(r.category),
      r.code,
      r.path
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `报告模板导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条模板数据`)
  }

  // 下载模板
  const handleDownload = (row: TemplateItem) => {
    ElMessage.success(`下载模板：${row.name}`)
  }

  // 新增/编辑弹窗
  const dialogVisible = ref(false)
  const formRef = ref<FormInstance>()
  const dialogMode = ref<'add' | 'edit'>('add')
  const editingId = ref(0)
  const dialogTitle = computed(() =>
    dialogMode.value === 'add' ? '新增报告模板' : '编辑报告模板'
  )
  const formData = reactive({
    name: '',
    type: '',
    category: '',
    code: '',
    path: '',
    projectName: '',
    projectCode: ''
  })
  const formRules: FormRules = {
    name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
    category: [{ required: true, message: '请选择模板分类', trigger: 'change' }],
    path: [{ required: true, message: '请输入模板路径', trigger: 'blur' }],
    projectName: [{ required: true, message: '请选择关联项目', trigger: 'change' }]
  }

  // 选择关联项目时自动带出项目编码
  const handleProjectChange = (projectName: string) => {
    const project = reportStore.priceProjects.find((p) => p.projectName === projectName)
    formData.projectCode = project ? project.projectCode : ''
  }

  const handleAdd = () => {
    dialogMode.value = 'add'
    Object.assign(formData, {
      name: '',
      type: '',
      category: '',
      code: '',
      path: '',
      projectName: '',
      projectCode: ''
    })
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  // 弹窗关闭时清除验证状态
  watch(dialogVisible, (val) => {
    if (!val) {
      nextTick(() => formRef.value?.clearValidate())
    }
  })

  const handleEdit = (row: TemplateItem) => {
    dialogMode.value = 'edit'
    editingId.value = row.id
    Object.assign(formData, {
      name: row.name,
      type: row.type,
      category: row.category,
      code: row.code,
      path: row.path,
      projectName: row.projectName || '',
      projectCode: row.projectCode
    })
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      if (dialogMode.value === 'add') {
        const newId = Math.max(...reportStore.templates.map((d) => d.id), 0) + 1
        const autoCode = `TPL-${String(newId).padStart(3, '0')}`
        reportStore.templates.unshift({ id: newId, ...formData, code: autoCode })
        ElMessage.success('新增成功')
      } else {
        const idx = reportStore.templates.findIndex((d) => d.id === editingId.value)
        if (idx > -1) Object.assign(reportStore.templates[idx], formData)
        ElMessage.success('修改成功')
      }
      fetchData()
      dialogVisible.value = false
    })
  }

  const handleDelete = (row: TemplateItem) => {
    ElMessageBox.confirm(`确定要删除模板「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const idx = reportStore.templates.findIndex((d) => d.id === row.id)
      if (idx > -1) reportStore.templates.splice(idx, 1)
      fetchData()
      ElMessage.success('删除成功')
    })
  }

  // 查看弹窗
  const viewDialogVisible = ref(false)
  const viewData = ref<TemplateItem | null>(null)

  const handleView = (row: TemplateItem) => {
    viewData.value = { ...row }
    viewDialogVisible.value = true
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
