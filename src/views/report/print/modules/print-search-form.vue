<!-- 报告打印查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="80px" class="search-form">
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
          <ElFormItem label="样本编号">
            <ElInput
              v-model="form.sampleNo"
              placeholder="请输入样本编号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="项目名称">
            <ElInput
              v-model="form.projectName"
              placeholder="请输入项目名称"
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
          <ElFormItem label="打印状态">
            <ElSelect
              v-model="form.printStatus"
              placeholder="请选择"
              clearable
              @change="handleSearch"
            >
              <ElOption label="未打印" value="unprinted" />
              <ElOption label="已打印" value="printed" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="报告状态">
            <ElSelect
              v-model="form.reportStatus"
              placeholder="请选择"
              clearable
              @change="handleSearch"
            >
              <ElOption label="未书写" value="未书写" />
              <ElOption label="书写中" value="书写中" />
              <ElOption label="已书写" value="已书写" />
              <ElOption label="已上传" value="已上传" />
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
  defineOptions({ name: 'PrintSearchForm' })

  interface SearchParams {
    patientName: string
    sampleNo: string
    projectName: string
    printStatus: string
    reportStatus: string
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
    sampleNo: '',
    projectName: '',
    printStatus: '',
    reportStatus: ''
  })

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, {
      patientName: '',
      sampleNo: '',
      projectName: '',
      printStatus: '',
      reportStatus: ''
    })
    emit('reset')
  }
</script>

<style lang="scss" scoped>
  .search-wrapper {
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
