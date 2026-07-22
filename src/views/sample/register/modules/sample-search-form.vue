<!-- 样本管理查询条件 -->
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
          <ElFormItem label="身份证号">
            <ElInput
              v-model="form.idCard"
              placeholder="请输入身份证号"
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
          <ElFormItem label="样本类型">
            <ElSelect
              v-model="form.sampleType"
              placeholder="请选择"
              clearable
              @change="handleSearch"
            >
              <ElOption label="组织样本" value="组织样本" />
              <ElOption label="血液样本" value="血液样本" />
              <ElOption label="胸水样本" value="胸水样本" />
              <ElOption label="骨髓样本" value="骨髓样本" />
              <ElOption label="尿液样本" value="尿液样本" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 第二行（展开时显示） -->
      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="条码">
            <ElInput
              v-model="form.barcode"
              placeholder="请输入条码"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 12 }">
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
  defineOptions({ name: 'SampleSearchForm' })

  interface SearchParams {
    patientName: string
    idCard: string
    projectName: string
    sampleType: string
    barcode: string
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
    idCard: '',
    projectName: '',
    sampleType: '',
    barcode: ''
  })

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, {
      patientName: '',
      idCard: '',
      projectName: '',
      sampleType: '',
      barcode: ''
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
