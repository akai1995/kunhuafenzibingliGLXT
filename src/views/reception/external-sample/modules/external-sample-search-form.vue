<!-- 外院样本接收查询条件 -->
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
          <ElFormItem label="申请编码">
            <ElInput
              v-model="form.applyCode"
              placeholder="请输入申请编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
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
          <ElFormItem label="科室">
            <ElInput
              v-model="form.sendHospital"
              placeholder="请输入科室"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 第二行（展开时显示） -->
      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="接收状态">
            <ElSelect
              v-model="form.receiveStatus"
              placeholder="请选择"
              clearable
              @change="handleSearch"
            >
              <ElOption label="待接收" value="pending" />
              <ElOption label="已接收" value="received" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="12" />
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
  defineOptions({ name: 'ExternalSampleSearchForm' })

  interface SearchParams {
    patientName: string
    applyCode: string
    projectName: string
    sendHospital: string
    receiveStatus: string
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
    applyCode: '',
    projectName: '',
    sendHospital: '',
    receiveStatus: ''
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
      applyCode: '',
      projectName: '',
      sendHospital: '',
      receiveStatus: ''
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
