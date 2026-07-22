<!-- 一代测序质控查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="100px" class="search-form">
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
          <ElFormItem label="病理号">
            <ElInput
              v-model="form.pathologyNo"
              placeholder="请输入病理号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="检测项目">
            <ElInput
              v-model="form.projectName"
              placeholder="请输入检测项目"
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
          <ElFormItem label="样本编号">
            <ElInput
              v-model="form.sampleNo"
              placeholder="请输入样本编号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="样本质控">
            <ElSelect
              v-model="form.sampleQc"
              placeholder="请选择"
              clearable
              style="width: 100%"
              @change="handleSearch"
            >
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
              <ElOption label="待质控" value="待质控" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="检测质控">
            <ElSelect
              v-model="form.detectQc"
              placeholder="请选择"
              clearable
              style="width: 100%"
              @change="handleSearch"
            >
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
              <ElOption label="风险上机" value="风险上机" />
              <ElOption label="待质控" value="待质控" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
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

  defineOptions({ name: 'SangerSearchForm' })

  interface SearchParams {
    patientName: string
    pathologyNo: string
    sampleNo: string
    projectName: string
    sampleQc: string
    detectQc: string
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
    pathologyNo: '',
    sampleNo: '',
    projectName: '',
    sampleQc: '',
    detectQc: ''
  })

  const handleSearch = () => emit('search', { ...form })

  const handleReset = () => {
    Object.assign(form, {
      patientName: '',
      pathologyNo: '',
      sampleNo: '',
      projectName: '',
      sampleQc: '',
      detectQc: ''
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