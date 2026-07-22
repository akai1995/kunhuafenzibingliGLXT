<!-- 权限管理查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="策略名称">
            <ElInput
              v-model="form.strategyName"
              placeholder="请输入策略名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="策略类型">
            <ElSelect
              v-model="form.strategyType"
              placeholder="请选择策略类型"
              clearable
              style="width: 100%"
            >
              <ElOption label="全局权限" value="global" />
              <ElOption label="分类级权限" value="category" />
              <ElOption label="单知识权限" value="single" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="对象类型">
            <ElSelect
              v-model="form.objectType"
              placeholder="请选择对象类型"
              clearable
              style="width: 100%"
            >
              <ElOption label="用户" value="user" />
              <ElOption label="角色" value="role" />
              <ElOption label="科室" value="department" />
            </ElSelect>
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
defineOptions({ name: 'PermissionSearchForm' })

interface SearchParams {
  strategyName: string
  strategyType: string
  objectType: string
}

interface Emits {
  (e: 'search', params: SearchParams): void
  (e: 'reset'): void
}

const emit = defineEmits<Emits>()

const form = reactive<SearchParams>({
  strategyName: '',
  strategyType: '',
  objectType: ''
})

const handleSearch = () => {
  emit('search', { ...form })
}

const handleReset = () => {
  Object.assign(form, {
    strategyName: '',
    strategyType: '',
    objectType: ''
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