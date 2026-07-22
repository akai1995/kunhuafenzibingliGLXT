<!-- NGSA查询条件 -->
<template>
  <div class="search-wrapper">
    <ElForm :model="form" label-width="90px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="患者姓名">
            <ElInput v-model="form.patientName" placeholder="请输入患者姓名" clearable @keyup.enter="handleSearch" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="病理号">
            <ElInput v-model="form.pathologyNo" placeholder="请输入病理号" clearable @keyup.enter="handleSearch" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="检测项目">
            <ElInput v-model="form.projectName" placeholder="请输入检测项目" clearable @keyup.enter="handleSearch" />
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
            <ElInput v-model="form.sampleNo" placeholder="请输入样本编号" clearable @keyup.enter="handleSearch" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="核酸质控">
            <ElSelect v-model="form.nucleicAcidQc" placeholder="请选择" clearable @change="handleSearch">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
              <ElOption label="待质控" value="待质控" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="终文库质控">
            <ElSelect v-model="form.finalLibQc" placeholder="请选择" clearable @change="handleSearch">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
              <ElOption label="待质控" value="待质控" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="上机质控">
            <ElSelect v-model="form.seqQc" placeholder="请选择" clearable @change="handleSearch">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
              <ElOption label="待质控" value="待质控" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="生信审核">
            <ElSelect v-model="form.bioAnalysisQc" placeholder="请选择" clearable @change="handleSearch">
              <ElOption label="合格" value="合格" />
              <ElOption label="不合格" value="不合格" />
              <ElOption label="待质控" value="待质控" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow v-show="expanded" :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 18 }">
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

  defineOptions({ name: 'NgsaSearchForm' })

  interface SearchParams {
    patientName: string
    pathologyNo: string
    projectName: string
    sampleNo: string
    nucleicAcidQc: string
    finalLibQc: string
    seqQc: string
    bioAnalysisQc: string
  }

  interface Emits {
    (e: 'search', params: SearchParams): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()
  const expanded = ref(false)

  const toggleExpand = () => { expanded.value = !expanded.value }

  const form = reactive<SearchParams>({
    patientName: '', pathologyNo: '', projectName: '', sampleNo: '',
    nucleicAcidQc: '', finalLibQc: '', seqQc: '', bioAnalysisQc: ''
  })

  const handleSearch = () => emit('search', { ...form })

  const handleReset = () => {
    Object.assign(form, {
      patientName: '', pathologyNo: '', projectName: '', sampleNo: '',
      nucleicAcidQc: '', finalLibQc: '', seqQc: '', bioAnalysisQc: ''
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
