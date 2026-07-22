<!-- 操作日志查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
      <!-- 第一行 -->
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="操作人员">
            <ElAutocomplete
              v-model="form.operator"
              :fetch-suggestions="queryOperatorSearch"
              placeholder="请输入操作人员"
              clearable
              @select="handleSearch"
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="操作内容">
            <ElInput
              v-model="form.content"
              placeholder="请输入操作内容"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="操作时间">
            <ElDatePicker
              v-model="form.dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              @change="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol v-show="!expanded" :xs="24" :sm="12" :lg="6">
          <div class="search-actions">
            <ElButton @click="handleReset">重置</ElButton>
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
            <ElButton text @click="toggleExpand">
              展开
              <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-0.5" />
            </ElButton>
          </div>
        </ElCol>
        <ElCol v-show="expanded" :xs="24" :sm="12" :lg="6">
          <ElFormItem label="日志类型">
            <ElSelect
              v-model="form.logType"
              placeholder="请选择日志类型"
              clearable
              @change="handleSearch"
            >
              <ElOption
                v-for="item in logTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 第二行（展开时显示） -->
      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="操作类型">
            <ElSelect
              v-model="form.operationType"
              placeholder="请选择操作类型"
              clearable
              @change="handleSearch"
            >
              <ElOption
                v-for="item in operationTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6" />
        <ElCol :xs="24" :sm="12" :lg="6" />
        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="search-actions">
            <ElButton @click="handleReset">重置</ElButton>
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
            <ElButton text @click="toggleExpand">
              收起
              <ArtSvgIcon icon="ri:arrow-up-s-line" class="ml-0.5" />
            </ElButton>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogSearchForm' })

  interface SearchParams {
    operator: string
    content: string
    dateRange: [string, string] | null
    logType: string
    operationType: string
  }

  interface Emits {
    (e: 'search', params: SearchParams): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  const expanded = ref(false)

  const toggleExpand = () => {
    expanded.value = !expanded.value
  }

  const form = reactive<SearchParams>({
    operator: '',
    content: '',
    dateRange: null,
    logType: '',
    operationType: ''
  })

  const logTypeOptions = [
    { label: '接诊管理', value: '接诊管理' },
    { label: '样本管理', value: '样本管理' },
    { label: '质控管理', value: '质控管理' },
    { label: '报告管理', value: '报告管理' },
    { label: '试剂管理', value: '试剂管理' },
    { label: '系统管理', value: '系统管理' },
    { label: '存储管理', value: '存储管理' }
  ]

  const operationTypeOptions = [
    { label: '新增', value: '新增' },
    { label: '编辑', value: '编辑' },
    { label: '删除', value: '删除' },
    { label: '查看', value: '查看' },
    { label: '登记', value: '登记' },
    { label: '状态变更', value: '状态变更' },
    { label: '导出', value: '导出' },
    { label: '导入', value: '导入' }
  ]

  const operatorSuggestions = [
    { value: '张医生' },
    { value: '李医生' },
    { value: '王医生' },
    { value: '刘医生' },
    { value: '陈医生' },
    { value: '赵技师' },
    { value: '系统' }
  ]

  const queryOperatorSearch = (queryString: string, cb: (results: any[]) => void) => {
    const results = queryString
      ? operatorSuggestions.filter((item) => item.value.includes(queryString))
      : operatorSuggestions
    cb(results)
  }

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, {
      operator: '',
      content: '',
      dateRange: null,
      logType: '',
      operationType: ''
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