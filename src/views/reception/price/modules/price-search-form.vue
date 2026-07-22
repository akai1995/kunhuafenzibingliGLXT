<!-- 项目价格维护查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="8">
          <ElFormItem label="项目名称">
            <ElInput
              v-model="form.projectName"
              placeholder="请输入项目名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="8">
          <ElFormItem label="项目编码">
            <ElInput
              v-model="form.projectCode"
              placeholder="请输入项目编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="8">
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
  defineOptions({ name: 'PriceSearchForm' })

  interface SearchParams {
    projectName: string
    projectCode: string
  }

  interface Emits {
    (e: 'search', params: SearchParams): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  const form = reactive<SearchParams>({
    projectName: '',
    projectCode: ''
  })

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, {
      projectName: '',
      projectCode: ''
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
