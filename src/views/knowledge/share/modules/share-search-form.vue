<!-- 文件管理查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="分类名称">
            <ElCascader
              v-model="form.categoryPath"
              :options="categoryOptions"
              :props="cascaderProps"
              placeholder="请输入分类名称"
              clearable
              filterable
              style="width: 100%"
              @change="handleCategoryChange"
            >
              <template #default="{ data }">
                <span>{{ data.label }}</span>
              </template>
            </ElCascader>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="文件名称">
            <ElInput
              v-model="form.fileName"
              placeholder="请输入文件名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="文档名称">
            <ElInput
              v-model="form.docName"
              placeholder="请输入文档名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="search-actions">
            <ElButton @click="handleReset">重置</ElButton>
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ShareSearchForm' })

interface SearchParams {
  category: string
  fileName: string
  docName: string
}

interface Emits {
  (e: 'search', params: SearchParams): void
  (e: 'reset'): void
}

const emit = defineEmits<Emits>()

// 一级分类与二级分类的层级关系（与权限管理保持一致）
const categoryTree: { name: string; children: string[] }[] = [
  { name: '分子病理', children: ['NGS检测', 'PCR检测', 'FISH检测', '质控规范', '实验操作规范', '样本处理'] },
  { name: 'NGS检测', children: ['NGSR', 'NGSA'] },
  { name: 'PCR检测', children: ['PCR10', 'PCR11'] },
  { name: 'FISH检测', children: ['FISH常规'] },
  { name: '质控规范', children: [] },
  { name: '实验操作规范', children: [] },
  { name: '样本处理', children: [] }
]

// 级联选择器 options：一级分类 → 二级分类
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

// 级联选择器配置
const cascaderProps = {
  expandTrigger: 'hover' as const,
  checkStrictly: true // 允许只选一级分类
}

const form = reactive<SearchParams & { categoryPath: string[] }>({
  category: '',
  fileName: '',
  docName: '',
  categoryPath: []
})

// 级联选择变化时同步分类字段
const handleCategoryChange = (value: string[]) => {
  if (!value || value.length === 0) {
    form.category = ''
  } else {
    // 选了哪一级就用哪一级的名称作为筛选条件
    form.category = value[value.length - 1]
  }
}

const handleSearch = () => {
  emit('search', {
    category: form.category,
    fileName: form.fileName,
    docName: form.docName
  })
}

const handleReset = () => {
  Object.assign(form, {
    category: '',
    fileName: '',
    docName: '',
    categoryPath: []
  })
  emit('reset')
}
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 12px;
  padding: 18px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: calc(var(--custom-radius) + 4px);

  .search-form {
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
