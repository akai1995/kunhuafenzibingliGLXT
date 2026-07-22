<!-- 配置管理 -->
<template>
  <div class="config-manage art-full-height">
    <ElCard class="art-table-card">
      <ElTabs v-model="activeTab" class="config-tabs">
        <ElTabPane label="项目分类" name="category">
          <ArtTableHeader
            :loading="loading"
            @refresh="refreshData"
            :showColumnSetting="false"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" @click="handleAddCategory">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                  新增
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>
          <ArtTable
            :loading="loading"
            :data="categoryData"
            :columns="categoryColumns"
            :pagination="categoryPagination"
            @pagination:size-change="(v: number) => handleSizeChange(v, 'category')"
            @pagination:current-change="(v: number) => handleCurrentChange(v, 'category')"
          />
        </ElTabPane>

        <ElTabPane label="项目分组" name="group">
          <ArtTableHeader
            :loading="loading"
            @refresh="refreshData"
            :showColumnSetting="false"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" @click="handleAddGroup">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                  新增
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>
          <ArtTable
            :loading="loading"
            :data="groupData"
            :columns="groupColumns"
            :pagination="groupPagination"
            @pagination:size-change="(v: number) => handleSizeChange(v, 'group')"
            @pagination:current-change="(v: number) => handleCurrentChange(v, 'group')"
          />
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- 新增/编辑 弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="420px"
      :close-on-click-modal="true"
    >
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <ElFormItem :label="dialogLabel" prop="name">
          <ElInput v-model="formData.name" :placeholder="`请输入${dialogLabel}`" />
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
  import { h } from 'vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'ConfigManage' })

  const activeTab = ref('category')
  const loading = ref(false)
  const dialogVisible = ref(false)
  const formRef = ref<FormInstance>()
  const dialogMode = ref<'add' | 'edit'>('add')
  const dialogType = ref<'category' | 'group'>('category')
  const editingId = ref<number>(0)

  const formData = reactive({
    name: ''
  })

  const dialogTitle = computed(() => {
    const action = dialogMode.value === 'add' ? '新增' : '编辑'
    const type = dialogType.value === 'category' ? '项目分类' : '项目分组'
    return `${action}${type}`
  })

  const dialogLabel = computed(() =>
    dialogType.value === 'category' ? '分类名称' : '分组名称'
  )

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }

  // ===== 项目分类数据 =====
  interface CategoryItem {
    id: number
    name: string
  }

  const categoryMock: CategoryItem[] = [
    { id: 1, name: '基因突变检测' },
    { id: 2, name: '基因扩增检测' },
    { id: 3, name: '融合基因检测' },
    { id: 4, name: '高通量测序' },
    { id: 5, name: '甲基化检测' }
  ]

  const categoryAllData = ref<CategoryItem[]>([...categoryMock])
  const categoryData = ref<CategoryItem[]>([])
  const categoryPagination = reactive({ current: 1, size: 10, total: 0 })

  // ===== 项目分组数据 =====
  interface GroupItem {
    id: number
    name: string
  }

  const groupMock: GroupItem[] = [
    { id: 1, name: '靶向用药' },
    { id: 2, name: '辅助诊断' },
    { id: 3, name: '综合检测' },
    { id: 4, name: '化疗用药' }
  ]

  const groupAllData = ref<GroupItem[]>([...groupMock])
  const groupData = ref<GroupItem[]>([])
  const groupPagination = reactive({ current: 1, size: 10, total: 0 })

  // ===== 列配置 =====
  const handleDeleteCategory = (row: CategoryItem) => {
    ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      categoryAllData.value = categoryAllData.value.filter((item) => item.id !== row.id)
      fetchCategoryData()
      ElMessage.success('删除成功')
    })
  }

  const handleDeleteGroup = (row: GroupItem) => {
    ElMessageBox.confirm(`确定要删除分组「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      groupAllData.value = groupAllData.value.filter((item) => item.id !== row.id)
      fetchGroupData()
      ElMessage.success('删除成功')
    })
  }

  const categoryColumns = ref([
    { prop: 'name', label: '分类名称', minWidth: 200 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: CategoryItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditCategory(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteCategory(row)
          })
        ])
    }
  ])

  const groupColumns = ref([
    { prop: 'name', label: '分组名称', minWidth: 200 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: GroupItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditGroup(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteGroup(row)
          })
        ])
    }
  ])

  // ===== 数据获取 =====
  const fetchCategoryData = () => {
    loading.value = true
    setTimeout(() => {
      categoryPagination.total = categoryAllData.value.length
      const start = (categoryPagination.current - 1) * categoryPagination.size
      categoryData.value = categoryAllData.value.slice(start, start + categoryPagination.size)
      loading.value = false
    }, 200)
  }

  const fetchGroupData = () => {
    loading.value = true
    setTimeout(() => {
      groupPagination.total = groupAllData.value.length
      const start = (groupPagination.current - 1) * groupPagination.size
      groupData.value = groupAllData.value.slice(start, start + groupPagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => {
    if (activeTab.value === 'category') fetchCategoryData()
    else fetchGroupData()
  }

  // ===== 分页 =====
  const handleSizeChange = (val: number, type: 'category' | 'group') => {
    if (type === 'category') {
      categoryPagination.size = val
      categoryPagination.current = 1
      fetchCategoryData()
    } else {
      groupPagination.size = val
      groupPagination.current = 1
      fetchGroupData()
    }
  }

  const handleCurrentChange = (val: number, type: 'category' | 'group') => {
    if (type === 'category') {
      categoryPagination.current = val
      fetchCategoryData()
    } else {
      groupPagination.current = val
      fetchGroupData()
    }
  }

  // ===== 新增/编辑 =====
  const handleAddCategory = () => {
    dialogMode.value = 'add'
    dialogType.value = 'category'
    formData.name = ''
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleAddGroup = () => {
    dialogMode.value = 'add'
    dialogType.value = 'group'
    formData.name = ''
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleEditCategory = (row: CategoryItem) => {
    dialogMode.value = 'edit'
    dialogType.value = 'category'
    editingId.value = row.id
    formData.name = row.name
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleEditGroup = (row: GroupItem) => {
    dialogMode.value = 'edit'
    dialogType.value = 'group'
    editingId.value = row.id
    formData.name = row.name
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      if (dialogType.value === 'category') {
        if (dialogMode.value === 'add') {
          const newId = Math.max(...categoryAllData.value.map((d) => d.id), 0) + 1
          categoryAllData.value.unshift({ id: newId, name: formData.name })
          ElMessage.success('新增成功')
        } else {
          const idx = categoryAllData.value.findIndex((d) => d.id === editingId.value)
          if (idx > -1) categoryAllData.value[idx].name = formData.name
          ElMessage.success('修改成功')
        }
        fetchCategoryData()
      } else {
        if (dialogMode.value === 'add') {
          const newId = Math.max(...groupAllData.value.map((d) => d.id), 0) + 1
          groupAllData.value.unshift({ id: newId, name: formData.name })
          ElMessage.success('新增成功')
        } else {
          const idx = groupAllData.value.findIndex((d) => d.id === editingId.value)
          if (idx > -1) groupAllData.value[idx].name = formData.name
          ElMessage.success('修改成功')
        }
        fetchGroupData()
      }
      dialogVisible.value = false
    })
  }

  // 监听 tab 切换
  watch(activeTab, (val) => {
    if (val === 'category') fetchCategoryData()
    else fetchGroupData()
  })

  onMounted(() => {
    fetchCategoryData()
  })
</script>

<style lang="scss" scoped>
  .config-manage {
    .config-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 12px;
      }
    }
  }
</style>
