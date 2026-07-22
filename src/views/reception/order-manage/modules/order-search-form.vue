<!-- 接诊单查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
      <!-- 第一行 -->
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="患者姓名">
            <ElInput
              v-model="form.patientName"
              placeholder="请输入患者姓名"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="住院号">
            <ElInput
              v-model="form.hospitalNo"
              placeholder="请输入住院号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="身份证号">
            <ElInput
              v-model="form.idCard"
              placeholder="请输入身份证号"
              clearable
              @keyup.enter="handleSearch"
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
          <ElFormItem label="检测项目">
            <ElAutocomplete
              v-model="form.projectName"
              :fetch-suggestions="querySearch"
              placeholder="请输入检测项目"
              clearable
              value-key="label"
              @select="handleSearch"
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 第二行（展开时显示） -->
      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="缴费状态">
            <ElSelect
              v-model="form.paymentStatus"
              placeholder="请选择"
              clearable
              @change="handleSearch"
            >
              <ElOption label="未缴费" value="未缴费" />
              <ElOption label="已缴费" value="已缴费" />
              <ElOption label="已退费" value="已退费" />
              <ElOption label="待结算" value="待结算" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="申请日期">
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
  defineOptions({ name: 'OrderSearchForm' })

  interface SearchParams {
    patientName: string
    hospitalNo: string
    idCard: string
    projectName: string
    paymentStatus: string
    dateRange: [string, string] | null
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
    patientName: '',
    hospitalNo: '',
    idCard: '',
    projectName: '',
    paymentStatus: '',
    dateRange: null
  })

  const projectSuggestions = [
    'NGSR质控',
    'NGSA质控',
    'PCR10基因质控',
    'PCR11基因质控'
  ].map((label) => ({ label }))

  const querySearch = (queryString: string, cb: (results: any[]) => void) => {
    const results = queryString
      ? projectSuggestions.filter((item) =>
          item.label.toLowerCase().includes(queryString.toLowerCase())
        )
      : projectSuggestions
    cb(results)
  }

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, {
      patientName: '',
      hospitalNo: '',
      idCard: '',
      projectName: '',
      paymentStatus: '',
      dateRange: null
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
