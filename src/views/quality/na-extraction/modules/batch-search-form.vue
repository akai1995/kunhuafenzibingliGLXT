<!-- 核酸提取批次查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="提取批号">
            <ElInput
              v-model="form.batchNo"
              placeholder="请输入提取批号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="提取类型">
            <ElSelect
              v-model="form.extractType"
              placeholder="请选择"
              clearable
              style="width: 100%"
              @change="handleSearch"
            >
              <ElOption label="DNA" value="DNA" />
              <ElOption label="RNA" value="RNA" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 6 }">
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
  defineOptions({ name: 'BatchSearchForm' })

  interface SearchParams {
    batchNo: string
    extractType: string
  }

  interface Emits {
    (e: 'search', params: SearchParams): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  const form = reactive<SearchParams>({
    batchNo: '',
    extractType: ''
  })

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, {
      batchNo: '',
      extractType: ''
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