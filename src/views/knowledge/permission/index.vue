<!-- 权限管理 -->
<template>
  <div class="knowledge-permission art-full-height">
    <!-- 查询条件 -->
    <PermissionSearchForm @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新增
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
        <template #strategyType="{ row }">
          <ElTag size="small" :type="strategyTypeTag(row.strategyType)" effect="plain">
            {{ strategyTypeLabel(row.strategyType) }}
          </ElTag>
        </template>
        <template #objectType="{ row }">
          <ElTag size="small" :type="objectTypeTag(row.objectType)" effect="plain">
            {{ objectTypeLabel(row.objectType) }}
          </ElTag>
        </template>
        <template #authorizationTarget="{ row }">
          <div class="tag-list">
            <ElTag
              v-for="item in getTargetLabels(row)"
              :key="item"
              size="small"
              type="primary"
              effect="plain"
            >
              {{ item }}
            </ElTag>
            <span v-if="getTargetLabels(row).length === 0" class="text-gray-400">-</span>
          </div>
        </template>
        <template #permissions="{ row }">
          <div class="tag-list">
            <ElTag
              v-for="perm in row.permissions"
              :key="perm"
              size="small"
              type="info"
              effect="plain"
            >
              {{ perm }}
            </ElTag>
            <span v-if="!row.permissions?.length" class="text-gray-400">-</span>
          </div>
        </template>
        <template #status="{ row }">
          <ElTag size="small" :type="row.status === 'enabled' ? 'success' : 'danger'" effect="plain">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <div class="flex-c">
            <ArtButtonTable type="edit" title="编辑" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" title="删除" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑权限策略' : '新增权限策略'"
      width="580px"
      :close-on-click-modal="true"
    >
      <ElForm ref="formRef" :key="formKey" :model="form" :rules="formRules" label-width="100px">
        <ElFormItem label="策略名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入策略名称" />
        </ElFormItem>
        <ElFormItem label="策略类型" prop="strategyType">
          <ElSelect v-model="form.strategyType" placeholder="请选择策略类型" style="width: 100%" @change="handleStrategyTypeChange">
            <ElOption label="全局权限（适用于所有知识）" value="global" />
            <ElOption label="分类级权限（按分类授权）" value="category" />
            <ElOption label="单知识权限（指定某篇知识）" value="single" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="form.strategyType === 'category'" label="目标分类" prop="targetCategory">
          <ElCascader
            v-model="form.targetCategory"
            :options="categoryOptions"
            :props="cascaderProps"
            placeholder="请选择知识分类"
            clearable
            filterable
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem v-if="form.strategyType === 'single'" label="目标知识" prop="targetKnowledge">
          <ElInput v-model="form.targetKnowledge" placeholder="请输入知识名称" />
        </ElFormItem>
        <ElFormItem label="对象类型" prop="objectType">
          <ElSelect v-model="form.objectType" placeholder="请选择对象类型" style="width: 100%" @change="handleObjectTypeChange">
            <ElOption label="用户" value="user" />
            <ElOption label="角色" value="role" />
            <ElOption label="科室" value="department" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="form.objectType === 'user'" label="授权用户" prop="targetUsers">
          <div>
            <ElButton @click="openUserDialog">
              <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
              选择授权用户
            </ElButton>
            <div v-if="form.targetUsers.length > 0" class="tag-list mt-3">
              <ElTag
                v-for="user in form.targetUsers"
                :key="user"
                size="small"
                type="primary"
                effect="plain"
                closable
                @close="removeUser(user)"
              >
                {{ user }}
              </ElTag>
            </div>
          </div>
        </ElFormItem>
        <ElFormItem v-if="form.objectType === 'role'" label="授权角色" prop="targetRoles">
          <ElSelect
            v-model="form.targetRoles"
            multiple
            placeholder="请选择授权角色"
            style="width: 100%"
          >
            <ElOption
              v-for="role in roleList"
              :key="role.roleCode"
              :label="role.roleName"
              :value="role.roleCode"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="form.objectType === 'department'" label="授权科室" prop="targetDepartments">
          <ElSelect
            v-model="form.targetDepartments"
            multiple
            placeholder="请选择授权科室"
            style="width: 100%"
          >
            <ElOption
              v-for="dept in departmentList"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="授予权限" prop="permissions">
          <ElCheckboxGroup v-model="form.permissions">
            <ElCheckbox label="查看" value="查看" />
            <ElCheckbox label="下载" value="下载" />
            <ElCheckbox label="编辑" value="编辑" />
            <ElCheckbox label="删除" value="删除" />
          </ElCheckboxGroup>
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="enabled">启用</ElRadio>
            <ElRadio value="disabled">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 选择授权用户弹窗 -->
    <ElDialog
      v-model="userDialogVisible"
      title="选择授权用户"
      width="650px"
      :close-on-click-modal="true"
      @close="handleUserDialogClose"
    >
      <div class="user-select-dialog">
        <div class="user-select-left">
          <div class="panel-title">科室列表</div>
          <ElScrollbar height="360px">
            <div v-for="group in deptTree" :key="group.label" class="dept-group">
              <div class="dept-group-title" @click="toggleGroup(group.label)">
                <ArtSvgIcon
                  :icon="expandedGroups.includes(group.label) ? 'ri:arrow-down-s-line' : 'ri:arrow-right-s-line'"
                  class="mr-1"
                />
                {{ group.label }}
              </div>
              <div v-show="expandedGroups.includes(group.label)" class="dept-group-children">
                <div
                  v-for="dept in group.children"
                  :key="dept.dept"
                  :class="['dept-item', { active: activeDept === dept.dept }]"
                  @click="selectDept(dept.dept)"
                >
                  {{ dept.dept }}
                </div>
              </div>
            </div>
          </ElScrollbar>
        </div>
        <div class="user-select-right">
          <div class="panel-title">
            人员列表
            <span class="text-gray-400 text-xs ml-2">
              （已选 {{ tempSelectedUsers.length }} 人）
            </span>
          </div>
          <div v-if="activeDept" class="user-list-wrapper">
            <div class="user-select-all">
              <ElCheckbox
                :model-value="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
              >
                全选
              </ElCheckbox>
            </div>
            <ElScrollbar height="270px">
              <ElCheckboxGroup v-model="tempSelectedUsers">
                <div
                  v-for="user in paginatedUsers"
                  :key="user"
                  class="user-item"
                >
                  <ElCheckbox :label="user" :value="user">{{ user }}</ElCheckbox>
                </div>
              </ElCheckboxGroup>
            </ElScrollbar>
            <div class="user-pagination">
              <ElPagination
                v-model:current-page="userPage"
                :page-size="userPageSize"
                :total="activeDeptUsers.length"
                layout="prev, pager, next"
                small
                background
              />
            </div>
          </div>
          <div v-else class="text-gray-400 text-center py-10">
            请选择左侧科室
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="userDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmUserSelect">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ROLE_LIST_DATA } from '@/mock/temp/formData'
import PermissionSearchForm from './modules/permission-search-form.vue'
import type { ColumnOption } from '@/types'

defineOptions({ name: 'KnowledgePermission' })

// 角色列表
const roleList = ref(ROLE_LIST_DATA)

// 科室列表
const departmentList = [
  '肿瘤科', '呼吸内科', '消化内科', '胸外科', '普外科',
  '泌尿外科', '妇科', '血液科', '病理科', '检验科',
  '影像科', '超声科', '心电图室', '药剂科', '急诊科'
]

// 人员列表
const userList = [
  { label: '张建国', value: 'zhang' },
  { label: '李明华', value: 'li' },
  { label: '王秀英', value: 'wang' },
  { label: '陈志强', value: 'chen' },
  { label: '刘芳', value: 'liu' },
  { label: '赵永刚', value: 'zhao' },
  { label: '孙丽华', value: 'sun' },
  { label: '周文博', value: 'zhou' },
  { label: '吴晓东', value: 'wu' },
  { label: '郑晓燕', value: 'zheng' },
  { label: '马明辉', value: 'ma' },
  { label: '黄丽萍', value: 'huang' }
]

// 科室-人员映射（树形结构）
const deptTree = [
  {
    label: '内科系统',
    children: [
      { dept: '肿瘤科', users: ['张建国', '李明华', '王秀英', '陈志强', '刘芳', '赵永刚'] },
      { dept: '呼吸内科', users: ['陈志强', '刘芳', '孙丽华', '周文博', '吴晓东'] },
      { dept: '消化内科', users: ['赵永刚', '孙丽华', '郑晓燕', '马明辉', '黄丽萍', '张建国'] },
      { dept: '血液科', users: ['李明华', '赵永刚', '王秀英', '陈志强', '刘芳', '孙丽华'] },
      { dept: '急诊科', users: ['孙丽华', '周文博', '吴晓东', '郑晓燕', '马明辉', '黄丽萍'] }
    ]
  },
  {
    label: '外科系统',
    children: [
      { dept: '胸外科', users: ['周文博', '吴晓东', '张建国', '李明华', '王秀英'] },
      { dept: '普外科', users: ['郑晓燕', '马明辉', '黄丽萍', '陈志强', '刘芳'] },
      { dept: '泌尿外科', users: ['黄丽萍', '赵永刚', '孙丽华', '周文博', '吴晓东'] },
      { dept: '妇科', users: ['张建国', '刘芳', '郑晓燕', '马明辉', '王秀英'] }
    ]
  },
  {
    label: '医技科室',
    children: [
      { dept: '病理科', users: ['王秀英', '陈志强', '孙丽华', '周文博', '吴晓东', '郑晓燕'] },
      { dept: '检验科', users: ['周文博', '吴晓东', '郑晓燕', '马明辉', '黄丽萍', '张建国'] },
      { dept: '影像科', users: ['马明辉', '黄丽萍', '李明华', '赵永刚', '孙丽华'] },
      { dept: '超声科', users: ['张建国', '刘芳', '王秀英', '陈志强'] },
      { dept: '心电图室', users: ['李明华', '赵永刚', '孙丽华', '周文博'] },
      { dept: '药剂科', users: ['王秀英', '陈志强', '刘芳', '郑晓燕'] }
    ]
  }
]

// 用户选择弹窗
const userDialogVisible = ref(false)
const activeDept = ref('')
const tempSelectedUsers = ref<string[]>([])
const userPage = ref(1)
const userPageSize = ref(5)
const expandedGroups = ref<string[]>([]) // 展开的科室分组

const activeDeptUsers = computed(() => {
  for (const group of deptTree) {
    const dept = group.children.find((d) => d.dept === activeDept.value)
    if (dept) return dept.users
  }
  return []
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (userPage.value - 1) * userPageSize.value
  return activeDeptUsers.value.slice(start, start + userPageSize.value)
})

// 当前科室所有用户是否全选
const isAllSelected = computed(() => {
  if (activeDeptUsers.value.length === 0) return false
  return activeDeptUsers.value.every((u) => tempSelectedUsers.value.includes(u))
})

// 当前科室部分选中
const isIndeterminate = computed(() => {
  const selected = activeDeptUsers.value.filter((u) => tempSelectedUsers.value.includes(u)).length
  return selected > 0 && selected < activeDeptUsers.value.length
})

// 切换全选
const handleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选当前科室
    tempSelectedUsers.value = tempSelectedUsers.value.filter(
      (u) => !activeDeptUsers.value.includes(u)
    )
  } else {
    // 全选当前科室
    const newUsers = activeDeptUsers.value.filter(
      (u) => !tempSelectedUsers.value.includes(u)
    )
    tempSelectedUsers.value.push(...newUsers)
  }
}

// 切换科室分组展开
const toggleGroup = (label: string) => {
  const idx = expandedGroups.value.indexOf(label)
  if (idx > -1) {
    expandedGroups.value.splice(idx, 1)
  } else {
    expandedGroups.value.push(label)
  }
}

// 切换科室
const selectDept = (deptName: string) => {
  activeDept.value = deptName
  userPage.value = 1
}

// 分类树（用于级联选择器）
const categoryTree: { name: string; children: string[] }[] = [
  { name: '分子病理', children: ['NGS检测', 'PCR检测', 'FISH检测', '质控规范', '实验操作规范', '样本处理'] },
  { name: 'NGS检测', children: ['NGSR', 'NGSA'] },
  { name: 'PCR检测', children: ['PCR10', 'PCR11'] },
  { name: 'FISH检测', children: ['FISH常规'] },
  { name: '质控规范', children: [] },
  { name: '实验操作规范', children: [] },
  { name: '样本处理', children: [] }
]

const categoryOptions = computed(() =>
  categoryTree.map((node) => ({
    value: node.name,
    label: node.name,
    children:
      node.children.length > 0
        ? node.children.map((child) => ({ value: child, label: child }))
        : undefined
  }))
)

const cascaderProps = {
  expandTrigger: 'hover' as const,
  checkStrictly: true
}

// 标签类型映射
const strategyTypeTag = (type: string) => {
  if (type === 'global') return ''
  if (type === 'category') return 'warning'
  return 'info'
}
const strategyTypeLabel = (type: string) => {
  if (type === 'global') return '全局'
  if (type === 'category') return '分类级'
  return '单知识'
}
const objectTypeTag = (type: string) => {
  if (type === 'user') return 'primary'
  if (type === 'role') return 'success'
  return 'warning'
}
const objectTypeLabel = (type: string) => {
  if (type === 'user') return '用户'
  if (type === 'role') return '角色'
  return '科室'
}

// 获取角色名称
const getRoleName = (code: string) => {
  const role = roleList.value.find((r) => r.roleCode === code)
  return role?.roleName || code
}

// 获取授权对象标签列表
const getTargetLabels = (row: PermissionStrategy): string[] => {
  if (row.objectType === 'user') return row.targetUsers || []
  if (row.objectType === 'role') return (row.targetRoles || []).map((code) => getRoleName(code))
  if (row.objectType === 'department') return row.targetDepartments || []
  return []
}

// 权限策略数据
interface PermissionStrategy {
  id: string
  name: string
  strategyType: string
  objectType: string
  authorizationType: string
  permissions: string[]
  targetCategory: string[]
  targetKnowledge: string
  targetUsers: string[]
  targetRoles: string[]
  targetDepartments: string[]
  status: string
}

const allData = ref<PermissionStrategy[]>([
  { id: '1', name: 'NGS检测全局权限', strategyType: 'global', objectType: 'role', authorizationType: 'allow', permissions: ['查看', '下载', '编辑'], targetCategory: [], targetKnowledge: '', targetUsers: [], targetRoles: ['R_SUPER', 'R_ADMIN'], targetDepartments: [], status: 'enabled' },
  { id: '2', name: '分子病理分类权限', strategyType: 'category', objectType: 'department', authorizationType: 'allow', permissions: ['查看', '下载'], targetCategory: ['分子病理', 'NGS检测'], targetKnowledge: '', targetUsers: [], targetRoles: [], targetDepartments: ['肿瘤科', '病理科'], status: 'enabled' },
  { id: '3', name: 'PCR检测角色权限', strategyType: 'category', objectType: 'role', authorizationType: 'allow', permissions: ['查看', '下载', '编辑', '删除'], targetCategory: ['分子病理', 'PCR检测'], targetKnowledge: '', targetUsers: [], targetRoles: ['R_SUPER', 'R_ADMIN', 'R_ANALYST'], targetDepartments: [], status: 'enabled' },
  { id: '4', name: '质控规范用户权限', strategyType: 'category', objectType: 'user', authorizationType: 'allow', permissions: ['查看', '下载'], targetCategory: ['分子病理', '质控规范'], targetKnowledge: '', targetUsers: ['张建国', '李明华'], targetRoles: [], targetDepartments: [], status: 'enabled' },
  { id: '5', name: 'NGSR核酸质控SOP权限', strategyType: 'single', objectType: 'user', authorizationType: 'allow', permissions: ['查看'], targetCategory: [], targetKnowledge: 'NGSR核酸质控SOP', targetUsers: ['王秀英', '陈志强'], targetRoles: [], targetDepartments: [], status: 'enabled' },
  { id: '6', name: 'FISH检测科室权限', strategyType: 'category', objectType: 'department', authorizationType: 'allow', permissions: ['查看', '下载', '编辑'], targetCategory: ['分子病理', 'FISH检测'], targetKnowledge: '', targetUsers: [], targetRoles: [], targetDepartments: ['肿瘤科', '病理科', '检验科'], status: 'enabled' },
  { id: '7', name: '样本处理全局拒绝', strategyType: 'global', objectType: 'user', authorizationType: 'deny', permissions: ['编辑', '删除'], targetCategory: [], targetKnowledge: '', targetUsers: ['郑晓燕', '黄丽萍'], targetRoles: [], targetDepartments: [], status: 'enabled' },
  { id: '8', name: '实验操作规范科室权限', strategyType: 'category', objectType: 'department', authorizationType: 'allow', permissions: ['查看', '下载'], targetCategory: ['分子病理', '实验操作规范'], targetKnowledge: '', targetUsers: [], targetRoles: [], targetDepartments: ['肿瘤科', '病理科', '检验科', '急诊科'], status: 'disabled' }
])

// 查询参数
const searchParams = ref({
  strategyName: '',
  strategyType: '',
  objectType: ''
})

// 表格
const loading = ref(false)
const data = ref<PermissionStrategy[]>([])
const selectedRows = ref<PermissionStrategy[]>([])

const columns: ColumnOption[] = [
  { type: 'selection', width: 50, fixed: 'left' },
  { prop: 'name', label: '策略名称', minWidth: 180 },
  { prop: 'strategyType', label: '策略类型', width: 110, align: 'center', useSlot: true },
  { prop: 'objectType', label: '对象类型', width: 90, align: 'center', useSlot: true },
  { prop: 'authorizationTarget', label: '授权对象', minWidth: 160, useSlot: true },
  { prop: 'permissions', label: '授予权限', minWidth: 180, useSlot: true },
  { prop: 'status', label: '状态', width: 80, align: 'center', useSlot: true },
  { prop: 'operation', label: '操作', width: 108, fixed: 'right', useSlot: true }
]

const pagination = reactive({ current: 1, size: 10, total: 0 })

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const formKey = ref(0)

const getDefaultForm = () => ({
  name: '',
  strategyType: '',
  objectType: '',
  permissions: [] as string[],
  targetCategory: [] as string[],
  targetKnowledge: '',
  targetUsers: [] as string[],
  targetRoles: [] as string[],
  targetDepartments: [] as string[],
  status: 'enabled'
})

const form = reactive(getDefaultForm())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  strategyType: [{ required: true, message: '请选择策略类型', trigger: 'change' }],
  objectType: [{ required: true, message: '请选择对象类型', trigger: 'change' }],
  permissions: [{ required: true, message: '请选择授予权限', trigger: 'change' }]
}

const handleStrategyTypeChange = () => {
  form.targetCategory = []
  form.targetKnowledge = ''
}

const handleObjectTypeChange = () => {
  form.targetUsers = []
  form.targetRoles = []
  form.targetDepartments = []
}

// 打开用户选择弹窗
const openUserDialog = () => {
  tempSelectedUsers.value = [...form.targetUsers]
  activeDept.value = ''
  userPage.value = 1
  expandedGroups.value = []
  userDialogVisible.value = true
}

// 移除已选用户
const removeUser = (user: string) => {
  const idx = form.targetUsers.indexOf(user)
  if (idx > -1) {
    form.targetUsers.splice(idx, 1)
  }
}

// 确认用户选择
const confirmUserSelect = () => {
  form.targetUsers = [...tempSelectedUsers.value]
  userDialogVisible.value = false
}

// 关闭用户弹窗
const handleUserDialogClose = () => {
  tempSelectedUsers.value = []
  activeDept.value = ''
  expandedGroups.value = []
  userPage.value = 1
}

// 数据过滤
const getFilteredData = (): PermissionStrategy[] => {
  let list = [...allData.value]
  const { strategyName, strategyType, objectType } = searchParams.value
  if (strategyName) {
    list = list.filter((item) => item.name.includes(strategyName))
  }
  if (strategyType) {
    list = list.filter((item) => item.strategyType === strategyType)
  }
  if (objectType) {
    list = list.filter((item) => item.objectType === objectType)
  }
  return list
}

const initData = () => {
  loading.value = true
  setTimeout(() => {
    data.value = getFilteredData()
    pagination.total = data.value.length
    pagination.current = 1
    loading.value = false
  }, 200)
}

const refreshData = () => {
  initData()
}

const handleSearch = (params: { strategyName: string; strategyType: string; objectType: string }) => {
  searchParams.value = { ...params }
  initData()
}

const handleReset = () => {
  searchParams.value = { strategyName: '', strategyType: '', objectType: '' }
  initData()
}

const handleSelectionChange = (selection: PermissionStrategy[]) => {
  selectedRows.value = selection
}

const handleSizeChange = (val: number) => {
  pagination.size = val
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  editId.value = ''
  Object.assign(form, getDefaultForm())
  formKey.value++
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: PermissionStrategy) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    strategyType: row.strategyType,
    objectType: row.objectType,
    permissions: [...row.permissions],
    targetCategory: [...row.targetCategory],
    targetKnowledge: row.targetKnowledge || '',
    targetUsers: [...row.targetUsers],
    targetRoles: [...row.targetRoles],
    targetDepartments: [...row.targetDepartments],
    status: row.status
  })
  formKey.value++
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: PermissionStrategy) => {
  ElMessageBox.confirm('确定要删除该权限策略吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const idx = allData.value.findIndex((item) => item.id === row.id)
    if (idx > -1) {
      allData.value.splice(idx, 1)
      ElMessage.success('删除成功')
      initData()
    }
  }).catch(() => {})
}

// 提交
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (isEdit.value) {
      const idx = allData.value.findIndex((item) => item.id === editId.value)
      if (idx > -1) {
        allData.value[idx] = {
          ...allData.value[idx],
          name: form.name,
          strategyType: form.strategyType,
          objectType: form.objectType,
          permissions: [...form.permissions],
          targetCategory: [...form.targetCategory],
          targetKnowledge: form.targetKnowledge,
          targetUsers: [...form.targetUsers],
          targetRoles: [...form.targetRoles],
          targetDepartments: [...form.targetDepartments],
          status: form.status
        }
      }
      ElMessage.success('编辑成功')
    } else {
      const newId = String(Date.now())
      allData.value.unshift({
        id: newId,
        name: form.name,
        strategyType: form.strategyType,
        objectType: form.objectType,
        permissions: [...form.permissions],
        targetCategory: [...form.targetCategory],
        targetKnowledge: form.targetKnowledge,
        targetUsers: [...form.targetUsers],
        targetRoles: [...form.targetRoles],
        targetDepartments: [...form.targetDepartments],
        status: form.status
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    initData()
  })
}

// 取消弹窗
const handleCancel = () => {
  dialogVisible.value = false
}

onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
.knowledge-permission {
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.user-select-dialog {
  display: flex;
  gap: 16px;

  .user-select-left {
    width: 200px;
    flex-shrink: 0;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;

    .panel-title {
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color);
    }

    .dept-group {
      .dept-group-title {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }

      .dept-group-children {
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }

    .dept-item {
      padding: 8px 12px 8px 28px;
      font-size: 13px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      &.active {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-8);
        font-weight: 500;
      }
    }
  }

  .user-select-right {
    flex: 1;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;

    .panel-title {
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color);
    }

    .user-list-wrapper {
      display: flex;
      flex-direction: column;
      height: 360px;
    }

    .user-select-all {
      padding: 8px 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .user-item {
      padding: 8px 12px;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }

    .user-pagination {
      display: flex;
      justify-content: center;
      padding: 8px 0;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}

.flex-c {
  display: flex;
  align-items: center;
}
</style>