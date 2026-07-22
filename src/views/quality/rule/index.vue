<!-- 质控化模板 -->
<template>
  <div class="qc-rule art-full-height">
    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <!-- 左侧：平台 → 项目 树 -->
      <div class="flex-shrink-0 w-72 h-full max-md:w-full max-md:h-auto max-md:mb-5">
        <ElCard class="tree-card flex flex-col h-full mt-0">
          <template #header>
            <div class="tree-header">
              <b>模板结构</b>
              <ElButton type="primary" size="small" @click="handleAddPlatform">
                <ArtSvgIcon icon="ri:add-line" class="mr-0.5" />
                添加分类
              </ElButton>
            </div>
          </template>
          <ElScrollbar>
            <ElTree
              ref="treeRef"
              :data="treeData"
              :props="treeProps"
              node-key="id"
              default-expand-all
              highlight-current
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <span class="tree-node-label">
                    <ArtSvgIcon :icon="data.type === 'platform' ? 'ri:computer-line' : 'ri:file-list-3-line'" class="mr-1" style="font-size: 14px" />
                    {{ node.label }}
                  </span>
                  <span class="tree-node-actions" @click.stop>
                    <ElTooltip :content="data.type === 'platform' ? '添加项目' : '添加质控分类'" placement="top">
                      <ElIcon class="action-icon add" @click="handleAddChild(data)">
                        <ArtSvgIcon icon="ri:add-line" />
                      </ElIcon>
                    </ElTooltip>
                    <ElTooltip content="编辑" placement="top">
                      <ElIcon class="action-icon edit" @click="handleEditNode(data)">
                        <ArtSvgIcon icon="ri:pencil-line" />
                      </ElIcon>
                    </ElTooltip>
                    <ElTooltip content="删除" placement="top">
                      <ElIcon class="action-icon delete" @click="handleDeleteNode(data)">
                        <ArtSvgIcon icon="ri:delete-bin-5-line" />
                      </ElIcon>
                    </ElTooltip>
                  </span>
                </div>
              </template>
            </ElTree>
          </ElScrollbar>
        </ElCard>
      </div>

      <!-- 右侧：项目字段（按质控分类分组） -->
      <div class="flex flex-col flex-grow min-w-0 h-full">
        <ElCard class="flex flex-col h-full mt-0 field-table-card">
          <template v-if="selectedProject">
            <div class="qc-categories-wrapper">
              <!-- 每个质控分类 -->
              <div v-for="(cat, catIdx) in selectedProject.qcCategories" :key="cat.id" class="qc-category-section">
                <div class="category-header">
                  <span class="category-title" style="cursor: pointer" @click="toggleCategory(cat.id)">
                    <ArtSvgIcon
                      :icon="isCategoryExpanded(cat.id) ? 'ri:arrow-down-s-line' : 'ri:arrow-right-s-line'"
                      class="category-toggle-icon"
                    />
                    {{ cat.name }}
                  </span>
                  <div class="category-header-actions">
                    <ElButton size="small" type="primary" @click="handleAddField(cat)">
                      <ArtSvgIcon icon="ri:add-line" class="mr-0.5" />
                      新增字段
                    </ElButton>
                    <ElTooltip content="编辑分类" placement="top">
                      <ElButton size="small" type="primary" plain @click="handleEditCategory(cat, selectedProject!)">
                        <ArtSvgIcon icon="ri:pencil-line" />
                      </ElButton>
                    </ElTooltip>
                    <ElTooltip content="删除分类" placement="top">
                      <ElButton size="small" type="danger" plain @click="handleDeleteCategory(cat, selectedProject!)">
                        <ArtSvgIcon icon="ri:delete-bin-5-line" />
                      </ElButton>
                    </ElTooltip>
                  </div>
                </div>
                <div v-show="isCategoryExpanded(cat.id)" class="category-table-wrapper">
                  <ArtTable
                    :loading="false"
                    :data="cat.fields"
                    :columns="fieldColumns"
                    :pagination="false"
                    :showSelection="false"
                    :showHeader="true"
                    style="width: 100%"
                  >
                    <template #threshold="{ row }">
                      <span v-if="row.fieldType === '数字' && row.threshold">{{ getThresholdRule(row.threshold) || '-' }}</span>
                      <span v-else class="text-secondary">-</span>
                    </template>
                    <template #rule="{ row }">
                      <span>{{ row.ruleDescription || '-' }}</span>
                    </template>
                    <template #operation="{ row }">
                      <div class="flex-c">
                        <ArtButtonTable type="edit" @click="handleEditField(cat, row)" />
                        <ArtButtonTable type="delete" @click="handleDeleteField(cat, row)" />
                      </div>
                    </template>
                  </ArtTable>
                </div>
              </div>
              <!-- 无分类时提示 -->
              <div v-if="!selectedProject.qcCategories?.length" class="empty-tip">
                <ElEmpty description="请先添加质控分类" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="empty-tip">
              <ElEmpty description="请选择左侧项目节点查看字段" />
            </div>
          </template>
        </ElCard>
      </div>
    </div>

    <!-- 平台/项目 新增/编辑弹窗 -->
    <NodeEditDialog
      v-model:visible="nodeDialogVisible"
      :mode="nodeDialogMode"
      :node-type="nodeDialogType"
      :node-name="nodeDialogName"
      @submit="handleNodeSubmit"
    />

    <!-- 质控分类新增/编辑弹窗 -->
    <CategoryEditDialog
      v-model:visible="categoryDialogVisible"
      :mode="categoryDialogMode"
      :category-name="categoryDialogName"
      @submit="handleCategorySubmit"
    />

    <!-- 字段新增/编辑弹窗 -->
    <FieldEditDialog
      v-model:visible="fieldDialogVisible"
      :mode="fieldDialogMode"
      :field-data="currentField"
      @submit="handleFieldSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useQcTemplateStore, getThresholdRule } from '@/store/modules/qc-template'
  import type { TreeNode, QcCategory, QcField, NodeType } from '@/store/modules/qc-template'
  import NodeEditDialog from './modules/node-edit-dialog.vue'
  import CategoryEditDialog from './modules/category-edit-dialog.vue'
  import FieldEditDialog from './modules/field-edit-dialog.vue'

  defineOptions({ name: 'QcRule' })

  const store = useQcTemplateStore()
  const treeData = computed(() => store.treeData)

  // ===== 树相关 =====
  const treeRef = ref()
  const treeProps = { children: 'children', label: 'label' }
  const selectedProject = ref<TreeNode | null>(null)

  const handleNodeClick = (data: TreeNode) => {
    if (data.type === 'project') {
      selectedProject.value = store.getProjectById(data.id)
    } else {
      selectedProject.value = null
    }
  }

  // 分类展开状态
  const expandedCategories = ref<Set<string>>(new Set())

  const isCategoryExpanded = (catId: string) => expandedCategories.value.has(catId)

  const toggleCategory = (catId: string) => {
    if (expandedCategories.value.has(catId)) {
      expandedCategories.value.delete(catId)
    } else {
      expandedCategories.value.add(catId)
    }
  }

  // 切换项目时自动展开所有分类
  watch(selectedProject, (project) => {
    expandedCategories.value = new Set()
    if (project?.qcCategories) {
      project.qcCategories.forEach((cat) => expandedCategories.value.add(cat.id))
    }
  })

  // ===== 字段表格列配置 =====
  const fieldColumns = ref([
    { prop: 'fieldName', label: '字段名称', minWidth: 140, fixed: 'left' },
    { prop: 'fieldType', label: '字段类型', width: 100, align: 'center' },
    {
      prop: 'required',
      label: '是否必填',
      width: 90,
      align: 'center',
      formatter: (row: QcField) =>
        h('span', { class: row.required ? 'text-primary font-medium' : 'text-secondary' }, row.required ? '是' : '否')
    },
    { prop: 'threshold', label: '阈值', width: 120, align: 'center', useSlot: true },
    { prop: 'rule', label: '规则说明', width: 120, align: 'center', useSlot: true },
    { prop: 'defaultValue', label: '默认值', minWidth: 100 },
    { prop: 'remark', label: '备注', minWidth: 120 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      useSlot: true
    }
  ])

  // ===== 平台/项目 CRUD =====
  const nodeDialogVisible = ref(false)
  const nodeDialogMode = ref<'add' | 'edit'>('add')
  const nodeDialogType = ref<NodeType>('platform')
  const nodeDialogName = ref('')
  const parentNodeId = ref('')
  const editingNodeId = ref('')

  const handleAddPlatform = () => {
    parentNodeId.value = ''
    editingNodeId.value = ''
    nodeDialogMode.value = 'add'
    nodeDialogType.value = 'platform'
    nodeDialogName.value = ''
    nodeDialogVisible.value = true
  }

  const handleAddChild = (data: TreeNode) => {
    if (data.type === 'platform') {
      parentNodeId.value = data.id
      editingNodeId.value = ''
      nodeDialogMode.value = 'add'
      nodeDialogType.value = 'project'
      nodeDialogName.value = ''
      nodeDialogVisible.value = true
    } else if (data.type === 'project') {
      // 添加质控分类
      selectedProject.value = data
      categoryDialogMode.value = 'add'
      categoryDialogName.value = ''
      editingCategoryId.value = ''
      categoryDialogVisible.value = true
    }
  }

  const handleEditNode = (data: TreeNode) => {
    editingNodeId.value = data.id
    parentNodeId.value = ''
    nodeDialogMode.value = 'edit'
    nodeDialogType.value = data.type
    nodeDialogName.value = data.label
    nodeDialogVisible.value = true
  }

  const handleDeleteNode = (data: TreeNode) => {
    const typeMap = { platform: '平台', project: '项目' }
    ElMessageBox.confirm(
      `确定要删除${typeMap[data.type]}「${data.label}」吗？${data.children?.length ? '其下的子级也将一并删除。' : ''}`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
      store.deleteNode(data.id)
      if (selectedProject.value?.id === data.id) {
        selectedProject.value = null
      }
      ElMessage.success('删除成功')
    })
  }

  const handleNodeSubmit = (name: string) => {
    if (nodeDialogMode.value === 'add') {
      if (nodeDialogType.value === 'platform') {
        store.addPlatform(name)
      } else {
        store.addProject(parentNodeId.value, name)
      }
      ElMessage.success('新增成功')
    } else {
      store.updateNode(editingNodeId.value, name)
      if (selectedProject.value?.id === editingNodeId.value) {
        selectedProject.value = store.getProjectById(editingNodeId.value)
      }
      ElMessage.success('修改成功')
    }
  }

  // ===== 质控分类 CRUD =====
  const categoryDialogVisible = ref(false)
  const categoryDialogMode = ref<'add' | 'edit'>('add')
  const categoryDialogName = ref('')
  const editingCategoryId = ref('')

  const handleEditCategory = (cat: QcCategory, project: TreeNode) => {
    selectedProject.value = project
    categoryDialogMode.value = 'edit'
    categoryDialogName.value = cat.name
    editingCategoryId.value = cat.id
    categoryDialogVisible.value = true
  }

  const handleDeleteCategory = (cat: QcCategory, project: TreeNode) => {
    ElMessageBox.confirm(`确定要删除质控分类「${cat.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.deleteCategory(project.id, cat.id)
      selectedProject.value = store.getProjectById(project.id)
      ElMessage.success('删除成功')
    })
  }

  const handleCategorySubmit = (name: string) => {
    if (!selectedProject.value) return
    if (categoryDialogMode.value === 'add') {
      store.addCategory(selectedProject.value.id, name)
      ElMessage.success('新增成功')
    } else {
      store.updateCategory(selectedProject.value.id, editingCategoryId.value, name)
      ElMessage.success('修改成功')
    }
    selectedProject.value = store.getProjectById(selectedProject.value.id)
  }

  // ===== 字段 CRUD =====
  const fieldDialogVisible = ref(false)
  const fieldDialogMode = ref<'add' | 'edit'>('add')
  const currentField = ref<QcField | null>(null)
  const currentCategoryId = ref('')

  const handleAddField = (cat: QcCategory) => {
    fieldDialogMode.value = 'add'
    currentField.value = null
    currentCategoryId.value = cat.id
    fieldDialogVisible.value = true
  }

  const handleEditField = (cat: QcCategory, row: QcField) => {
    fieldDialogMode.value = 'edit'
    currentField.value = { ...row }
    currentCategoryId.value = cat.id
    fieldDialogVisible.value = true
  }

  const handleDeleteField = (cat: QcCategory, row: QcField) => {
    ElMessageBox.confirm(`确定要删除字段「${row.fieldName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      if (!selectedProject.value) return
      store.deleteField(selectedProject.value.id, cat.id, row.id)
      selectedProject.value = store.getProjectById(selectedProject.value.id)
      ElMessage.success('删除成功')
    })
  }

  const handleFieldSubmit = (data: QcField) => {
    if (!selectedProject.value) return
    if (fieldDialogMode.value === 'add') {
      store.addField(selectedProject.value.id, currentCategoryId.value, data)
      ElMessage.success('新增成功')
    } else {
      store.updateField(selectedProject.value.id, currentCategoryId.value, data)
      ElMessage.success('修改成功')
    }
    selectedProject.value = store.getProjectById(selectedProject.value.id)
  }
</script>

<style lang="scss" scoped>
  .qc-rule {
    .tree-card {
      border-radius: calc(var(--custom-radius) + 4px) !important;

      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
        padding: 10px 4px 10px 10px;
      }
    }

    .tree-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tree-node {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-right: 8px;

      .tree-node-label {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      .tree-node-actions {
        display: none;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        margin-left: 8px;

        .action-icon {
          cursor: pointer;
          font-size: 14px;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.2s;

          &.add { color: var(--el-color-primary); &:hover { background: var(--el-color-primary-light-9); } }
          &.edit { color: var(--el-color-info); &:hover { background: var(--el-color-info-light-9); } }
          &.delete { color: var(--el-color-danger); &:hover { background: var(--el-color-danger-light-9); } }
        }
      }

      &:hover .tree-node-actions {
        display: flex;
      }
    }

    .field-table-card {
      border-radius: calc(var(--custom-radius) + 4px) !important;

      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: auto;
      }
    }

    .qc-categories-wrapper {
      .qc-category-section {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--el-border-color-light);

          .category-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            display: flex;
            align-items: center;

            .category-toggle-icon {
              font-size: 16px;
              margin-right: 4px;
              transition: transform 0.2s;
            }
          }

          .category-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
        }
      }
    }

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 300px;
    }
  }
</style>