<!-- 报告中心 -->
<template>
  <div class="report-center art-full-height">
    <ElCard class="art-table-card">
      <ElTabs v-model="activeTab" class="center-tabs">
        <!-- Tab 1: 报告模板 -->
        <ElTabPane label="报告模板" name="template">
          <div class="tab-search-wrapper">
            <ElForm :model="tplSearch" label-width="80px" class="search-form">
              <ElRow :gutter="20">
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="模板名称">
                    <ElInput
                      v-model="tplSearch.name"
                      placeholder="请输入模板名称"
                      clearable
                      @keyup.enter="fetchTemplateData"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="模板类型">
                    <ElSelect
                      v-model="tplSearch.type"
                      placeholder="请选择模板类型"
                      clearable
                      style="width: 100%"
                    >
                      <ElOption label="基因检测" value="gene" />
                      <ElOption label="病理检测" value="pathology" />
                      <ElOption label="综合报告" value="comprehensive" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="模板分类">
                    <ElSelect
                      v-model="tplSearch.category"
                      placeholder="请选择模板分类"
                      clearable
                      style="width: 100%"
                    >
                      <ElOption label="突变检测" value="mutation" />
                      <ElOption label="融合检测" value="fusion" />
                      <ElOption label="扩增检测" value="amplification" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol v-show="!tplSearchExpanded" :xs="24" :sm="12" :lg="6">
                  <div class="search-actions">
                    <ElButton @click="handleTplReset">重置</ElButton>
                    <ElButton type="primary" @click="fetchTemplateData">查询</ElButton>
                    <ElButton text @click="tplSearchExpanded = true">
                      展开
                      <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-0.5" />
                    </ElButton>
                  </div>
                </ElCol>
                <ElCol v-show="tplSearchExpanded" :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="模板编码">
                    <ElInput
                      v-model="tplSearch.code"
                      placeholder="请输入模板编码"
                      clearable
                      @keyup.enter="fetchTemplateData"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow v-show="tplSearchExpanded" :gutter="20">
                <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 18 }">
                  <div class="search-actions">
                    <ElButton @click="handleTplReset">重置</ElButton>
                    <ElButton type="primary" @click="fetchTemplateData">查询</ElButton>
                    <ElButton text @click="tplSearchExpanded = false">
                      收起
                      <ArtSvgIcon icon="ri:arrow-up-s-line" class="ml-0.5" />
                    </ElButton>
                  </div>
                </ElCol>
              </ElRow>
            </ElForm>
          </div>
          <ArtTableHeader
            :loading="loading"
            @refresh="refreshData"
            :showColumnSetting="false"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" @click="handleAddTemplate">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                  新增
                </ElButton>
                <ElButton
                  :disabled="selectedTemplates.length === 0"
                  @click="handleExportTemplate"
                >
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  导出
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>
          <ArtTable
            :loading="loading"
            :data="templateData"
            :columns="templateColumns"
            :pagination="templatePagination"
            @selection-change="handleTemplateSelectionChange"
            @pagination:size-change="(v: number) => handleSizeChange(v, 'template')"
            @pagination:current-change="(v: number) => handleCurrentChange(v, 'template')"
          />
        </ElTabPane>

        <!-- Tab 2: 项目关联模板 -->
        <ElTabPane label="项目关联模板" name="project">
          <div class="tab-search-wrapper">
            <ElForm :model="projSearch" label-width="80px" class="search-form">
              <ElRow :gutter="20">
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="项目名称">
                    <ElInput
                      v-model="projSearch.projectName"
                      placeholder="请输入项目名称"
                      clearable
                      @keyup.enter="fetchProjectData"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="项目编码">
                    <ElInput
                      v-model="projSearch.projectCode"
                      placeholder="请输入项目编码"
                      clearable
                      @keyup.enter="fetchProjectData"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="模板名称">
                    <ElInput
                      v-model="projSearch.templateName"
                      placeholder="请输入模板名称"
                      clearable
                      @keyup.enter="fetchProjectData"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :lg="6">
                  <div class="search-actions">
                    <ElButton @click="handleProjReset">重置</ElButton>
                    <ElButton type="primary" @click="fetchProjectData">查询</ElButton>
                  </div>
                </ElCol>
              </ElRow>
            </ElForm>
          </div>
          <ArtTableHeader
            :loading="loading"
            @refresh="refreshData"
            :showColumnSetting="false"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" @click="handleAddProject">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                  新增
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>
          <ArtTable
            :loading="loading"
            :data="projectData"
            :columns="projectColumns"
            :pagination="projectPagination"
            @pagination:size-change="(v: number) => handleSizeChange(v, 'project')"
            @pagination:current-change="(v: number) => handleCurrentChange(v, 'project')"
          />
        </ElTabPane>

        <!-- Tab 3: 基因检测结果解释 -->
        <ElTabPane label="基因检测结果解释" name="gene">
          <div class="tab-search-wrapper">
            <ElForm :model="geneSearch" label-width="80px" class="search-form">
              <ElRow :gutter="20">
                <ElCol :xs="24" :sm="12" :lg="6">
                  <ElFormItem label="基因名称">
                    <ElInput
                      v-model="geneSearch.geneName"
                      placeholder="请输入基因名称"
                      clearable
                      @keyup.enter="fetchGeneData"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 12 }">
                  <div class="search-actions">
                    <ElButton @click="handleGeneReset">重置</ElButton>
                    <ElButton type="primary" @click="fetchGeneData">查询</ElButton>
                  </div>
                </ElCol>
              </ElRow>
            </ElForm>
          </div>
          <ArtTableHeader
            :loading="loading"
            @refresh="refreshData"
            :showColumnSetting="false"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" @click="handleAddGene">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                  新增
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>
          <ArtTable
            :loading="loading"
            :data="geneData"
            :columns="geneColumns"
            :pagination="genePagination"
            @pagination:size-change="(v: number) => handleSizeChange(v, 'gene')"
            @pagination:current-change="(v: number) => handleCurrentChange(v, 'gene')"
          />
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- 报告模板 弹窗 -->
    <ElDialog
      v-model="tplDialogVisible"
      :title="tplDialogTitle"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm ref="tplFormRef" :model="tplForm" :rules="tplFormRules" label-width="90px">
        <ElFormItem label="模板名称" prop="name">
          <ElInput v-model="tplForm.name" placeholder="请输入模板名称" />
        </ElFormItem>
        <ElFormItem label="模板类型" prop="type">
          <ElSelect v-model="tplForm.type" placeholder="请选择模板类型" style="width: 100%">
            <ElOption label="基因检测" value="gene" />
            <ElOption label="病理检测" value="pathology" />
            <ElOption label="综合报告" value="comprehensive" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="模板分类" prop="category">
          <ElSelect v-model="tplForm.category" placeholder="请选择模板分类" style="width: 100%">
            <ElOption label="突变检测" value="mutation" />
            <ElOption label="融合检测" value="fusion" />
            <ElOption label="扩增检测" value="amplification" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="模板编码" prop="code">
          <ElInput v-model="tplForm.code" placeholder="请输入模板编码" />
        </ElFormItem>
        <ElFormItem label="模板路径" prop="path">
          <ElInput v-model="tplForm.path" placeholder="请输入模板路径" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="tplDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleTplSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 项目关联模板 弹窗 -->
    <ElDialog
      v-model="projDialogVisible"
      :title="projDialogTitle"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm ref="projFormRef" :model="projForm" :rules="projFormRules" label-width="90px">
        <ElFormItem label="项目名称" prop="projectName">
          <ElInput v-model="projForm.projectName" placeholder="请输入项目名称" />
        </ElFormItem>
        <ElFormItem label="项目编码" prop="projectCode">
          <ElInput v-model="projForm.projectCode" placeholder="请输入项目编码" />
        </ElFormItem>
        <ElFormItem label="模板" prop="templateId">
          <ElSelect
            v-model="projForm.templateId"
            placeholder="请选择模板"
            style="width: 100%"
            @change="handleProjTemplateChange"
          >
            <ElOption
              v-for="tpl in templateAllData"
              :key="tpl.id"
              :label="tpl.name"
              :value="tpl.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="模板编码">
          <ElInput v-model="projForm.templateCode" placeholder="选择模板后自动填充" disabled />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="projDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleProjSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 基因检测结果解释 弹窗 -->
    <ElDialog
      v-model="geneDialogVisible"
      :title="geneDialogTitle"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm ref="geneFormRef" :model="geneForm" :rules="geneFormRules" label-width="90px">
        <ElFormItem label="基因名称" prop="geneName">
          <ElInput v-model="geneForm.geneName" placeholder="请输入基因名称" />
        </ElFormItem>
        <ElFormItem label="结果解释" prop="interpretation">
          <ElInput
            v-model="geneForm.interpretation"
            type="textarea"
            :rows="4"
            placeholder="请输入结果解释"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="geneDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleGeneSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'ReportCenter' })

  const activeTab = ref('template')
  const loading = ref(false)

  // 查询展开状态
  const tplSearchExpanded = ref(false)

  const handleTplReset = () => {
    Object.assign(tplSearch, { name: '', type: '', category: '', code: '' })
    templatePagination.current = 1
    fetchTemplateData()
  }

  // ===== Tab 1: 报告模板 =====
  interface TemplateItem {
    id: number
    name: string
    type: string
    category: string
    code: string
    path: string
  }

  const templateMock: TemplateItem[] = [
    { id: 1, name: 'EGFR突变检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-EGFR-001', path: '/templates/egfr_mutation.docx' },
    { id: 2, name: 'KRAS突变检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-KRAS-001', path: '/templates/kras_mutation.docx' },
    { id: 3, name: 'BRAF V600E检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-BRAF-001', path: '/templates/braf_v600e.docx' },
    { id: 4, name: 'ALK融合检测报告模板', type: 'gene', category: 'fusion', code: 'TPL-ALK-001', path: '/templates/alk_fusion.docx' },
    { id: 5, name: 'HER2扩增检测报告模板', type: 'gene', category: 'amplification', code: 'TPL-HER2-001', path: '/templates/her2_amp.docx' },
    { id: 6, name: 'ROS1融合检测报告模板', type: 'gene', category: 'fusion', code: 'TPL-ROS1-001', path: '/templates/ros1_fusion.docx' },
    { id: 7, name: '综合病理报告模板', type: 'comprehensive', category: 'mutation', code: 'TPL-PATH-001', path: '/templates/comprehensive_path.docx' },
    { id: 8, name: 'MET跳跃检测报告模板', type: 'gene', category: 'mutation', code: 'TPL-MET-001', path: '/templates/met_exon14.docx' }
  ]

  const templateAllData = ref<TemplateItem[]>([...templateMock])
  const templateData = ref<TemplateItem[]>([])
  const templatePagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedTemplates = ref<TemplateItem[]>([])
  const tplSearch = reactive({ name: '', type: '', category: '', code: '' })

  const getTplTypeText = (type: string) => {
    const map: Record<string, string> = { gene: '基因检测', pathology: '病理检测', comprehensive: '综合报告' }
    return map[type] || type
  }

  const getTplCategoryText = (category: string) => {
    const map: Record<string, string> = { mutation: '突变检测', fusion: '融合检测', amplification: '扩增检测' }
    return map[category] || category
  }

  const templateColumns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'name', label: '模板名称', minWidth: 180 },
    { prop: 'type', label: '模板类型', width: 100, formatter: (row: TemplateItem) => getTplTypeText(row.type) },
    { prop: 'category', label: '模板分类', width: 100, formatter: (row: TemplateItem) => getTplCategoryText(row.category) },
    { prop: 'code', label: '模板编码', width: 140 },
    { prop: 'path', label: '模板路径', minWidth: 200 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row: TemplateItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEditTemplate(row) }),
          h(ArtButtonTable, { icon: 'ri:download-line', title: '下载', onClick: () => handleDownloadTemplate(row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDeleteTemplate(row) })
        ])
    }
  ])

  const fetchTemplateData = () => {
    loading.value = true
    setTimeout(() => {
      let filtered = [...templateAllData.value]
      if (tplSearch.name) filtered = filtered.filter((d) => d.name.includes(tplSearch.name))
      if (tplSearch.type) filtered = filtered.filter((d) => d.type === tplSearch.type)
      if (tplSearch.category) filtered = filtered.filter((d) => d.category === tplSearch.category)
      if (tplSearch.code) filtered = filtered.filter((d) => d.code.includes(tplSearch.code))
      templatePagination.total = filtered.length
      const start = (templatePagination.current - 1) * templatePagination.size
      templateData.value = filtered.slice(start, start + templatePagination.size)
      loading.value = false
    }, 200)
  }

  const handleTemplateSelectionChange = (selection: TemplateItem[]) => {
    selectedTemplates.value = selection
  }

  const handleExportTemplate = () => {
    ElMessage.success(`已导出 ${selectedTemplates.value.length} 条模板数据`)
  }

  // 模板弹窗
  const tplDialogVisible = ref(false)
  const tplFormRef = ref<FormInstance>()
  const tplDialogMode = ref<'add' | 'edit'>('add')
  const tplEditingId = ref(0)
  const tplDialogTitle = computed(() => tplDialogMode.value === 'add' ? '新增报告模板' : '编辑报告模板')
  const tplForm = reactive({ name: '', type: '', category: '', code: '', path: '' })
  const tplFormRules: FormRules = {
    name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
    category: [{ required: true, message: '请选择模板分类', trigger: 'change' }],
    code: [{ required: true, message: '请输入模板编码', trigger: 'blur' }],
    path: [{ required: true, message: '请输入模板路径', trigger: 'blur' }]
  }

  const handleAddTemplate = () => {
    tplDialogMode.value = 'add'
    Object.assign(tplForm, { name: '', type: '', category: '', code: '', path: '' })
    tplDialogVisible.value = true
    nextTick(() => tplFormRef.value?.clearValidate())
  }

  // 模板弹窗关闭时清除验证状态
  watch(tplDialogVisible, (val) => {
    if (!val) {
      nextTick(() => tplFormRef.value?.clearValidate())
    }
  })

  const handleEditTemplate = (row: TemplateItem) => {
    tplDialogMode.value = 'edit'
    tplEditingId.value = row.id
    Object.assign(tplForm, { name: row.name, type: row.type, category: row.category, code: row.code, path: row.path })
    tplDialogVisible.value = true
    nextTick(() => tplFormRef.value?.clearValidate())
  }

  const handleDownloadTemplate = (row: TemplateItem) => {
    ElMessage.success(`下载模板：${row.name}`)
  }

  const handleDeleteTemplate = (row: TemplateItem) => {
    ElMessageBox.confirm(`确定要删除模板「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      templateAllData.value = templateAllData.value.filter((d) => d.id !== row.id)
      fetchTemplateData()
      ElMessage.success('删除成功')
    })
  }

  const handleTplSubmit = async () => {
    if (!tplFormRef.value) return
    await tplFormRef.value.validate((valid) => {
      if (!valid) return
      if (tplDialogMode.value === 'add') {
        const newId = Math.max(...templateAllData.value.map((d) => d.id), 0) + 1
        templateAllData.value.unshift({ id: newId, ...tplForm })
        ElMessage.success('新增成功')
      } else {
        const idx = templateAllData.value.findIndex((d) => d.id === tplEditingId.value)
        if (idx > -1) Object.assign(templateAllData.value[idx], tplForm)
        ElMessage.success('修改成功')
      }
      fetchTemplateData()
      tplDialogVisible.value = false
    })
  }

  // ===== Tab 2: 项目关联模板 =====
  interface ProjectItem {
    id: number
    projectName: string
    projectCode: string
    templateName: string
    templateCode: string
  }

  const projectMock: ProjectItem[] = [
    { id: 1, projectName: 'EGFR基因突变检测', projectCode: 'PROJ-EGFR-001', templateName: 'EGFR突变检测报告模板', templateCode: 'TPL-EGFR-001' },
    { id: 2, projectName: 'KRAS基因突变检测', projectCode: 'PROJ-KRAS-001', templateName: 'KRAS突变检测报告模板', templateCode: 'TPL-KRAS-001' },
    { id: 3, projectName: 'BRAF V600E检测', projectCode: 'PROJ-BRAF-001', templateName: 'BRAF V600E检测报告模板', templateCode: 'TPL-BRAF-001' },
    { id: 4, projectName: 'HER2基因扩增检测', projectCode: 'PROJ-HER2-001', templateName: 'HER2扩增检测报告模板', templateCode: 'TPL-HER2-001' },
    { id: 5, projectName: 'ALK融合基因检测', projectCode: 'PROJ-ALK-001', templateName: 'ALK融合检测报告模板', templateCode: 'TPL-ALK-001' },
    { id: 6, projectName: 'ROS1融合基因检测', projectCode: 'PROJ-ROS1-001', templateName: 'ROS1融合检测报告模板', templateCode: 'TPL-ROS1-001' },
    { id: 7, projectName: 'MET外显子14跳跃检测', projectCode: 'PROJ-MET-001', templateName: 'MET跳跃检测报告模板', templateCode: 'TPL-MET-001' }
  ]

  const projectAllData = ref<ProjectItem[]>([...projectMock])
  const projectData = ref<ProjectItem[]>([])
  const projectPagination = reactive({ current: 1, size: 10, total: 0 })
  const projSearch = reactive({ projectName: '', projectCode: '', templateName: '' })

  const handleProjReset = () => {
    Object.assign(projSearch, { projectName: '', projectCode: '', templateName: '' })
    projectPagination.current = 1
    fetchProjectData()
  }

  const projectColumns = ref([
    { prop: 'projectName', label: '项目名称', minWidth: 180 },
    { prop: 'projectCode', label: '项目编码', width: 150 },
    { prop: 'templateName', label: '模板名称', minWidth: 180 },
    { prop: 'templateCode', label: '模板编码', width: 140 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: ProjectItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEditProject(row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDeleteProject(row) })
        ])
    }
  ])

  const fetchProjectData = () => {
    loading.value = true
    setTimeout(() => {
      let filtered = [...projectAllData.value]
      if (projSearch.projectName) filtered = filtered.filter((d) => d.projectName.includes(projSearch.projectName))
      if (projSearch.projectCode) filtered = filtered.filter((d) => d.projectCode.includes(projSearch.projectCode))
      if (projSearch.templateName) filtered = filtered.filter((d) => d.templateName.includes(projSearch.templateName))
      projectPagination.total = filtered.length
      const start = (projectPagination.current - 1) * projectPagination.size
      projectData.value = filtered.slice(start, start + projectPagination.size)
      loading.value = false
    }, 200)
  }

  // 项目关联弹窗
  const projDialogVisible = ref(false)
  const projFormRef = ref<FormInstance>()
  const projDialogMode = ref<'add' | 'edit'>('add')
  const projEditingId = ref(0)
  const projDialogTitle = computed(() => projDialogMode.value === 'add' ? '新增项目关联' : '编辑项目关联')
  const projForm = reactive({ projectName: '', projectCode: '', templateId: '' as string | number, templateCode: '' })
  const projFormRules: FormRules = {
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    projectCode: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
    templateId: [{ required: true, message: '请选择模板', trigger: 'change' }]
  }

  const handleProjTemplateChange = (val: number) => {
    const tpl = templateAllData.value.find((t) => t.id === val)
    projForm.templateCode = tpl?.code || ''
  }

  const handleAddProject = () => {
    projDialogMode.value = 'add'
    Object.assign(projForm, { projectName: '', projectCode: '', templateId: '', templateCode: '' })
    projDialogVisible.value = true
    nextTick(() => projFormRef.value?.clearValidate())
  }

  // 项目弹窗关闭时清除验证状态
  watch(projDialogVisible, (val) => {
    if (!val) {
      nextTick(() => projFormRef.value?.clearValidate())
    }
  })

  const handleEditProject = (row: ProjectItem) => {
    projDialogMode.value = 'edit'
    projEditingId.value = row.id
    const tpl = templateAllData.value.find((t) => t.code === row.templateCode)
    Object.assign(projForm, {
      projectName: row.projectName,
      projectCode: row.projectCode,
      templateId: tpl?.id || '',
      templateCode: row.templateCode
    })
    projDialogVisible.value = true
    nextTick(() => projFormRef.value?.clearValidate())
  }

  const handleDeleteProject = (row: ProjectItem) => {
    ElMessageBox.confirm(`确定要删除「${row.projectName}」的关联吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      projectAllData.value = projectAllData.value.filter((d) => d.id !== row.id)
      fetchProjectData()
      ElMessage.success('删除成功')
    })
  }

  const handleProjSubmit = async () => {
    if (!projFormRef.value) return
    await projFormRef.value.validate((valid) => {
      if (!valid) return
      const tpl = templateAllData.value.find((t) => t.id === projForm.templateId)
      if (projDialogMode.value === 'add') {
        const newId = Math.max(...projectAllData.value.map((d) => d.id), 0) + 1
        projectAllData.value.unshift({
          id: newId,
          projectName: projForm.projectName,
          projectCode: projForm.projectCode,
          templateName: tpl?.name || '',
          templateCode: projForm.templateCode
        })
        ElMessage.success('新增成功')
      } else {
        const idx = projectAllData.value.findIndex((d) => d.id === projEditingId.value)
        if (idx > -1) {
          projectAllData.value[idx] = {
            ...projectAllData.value[idx],
            projectName: projForm.projectName,
            projectCode: projForm.projectCode,
            templateName: tpl?.name || '',
            templateCode: projForm.templateCode
          }
        }
        ElMessage.success('修改成功')
      }
      fetchProjectData()
      projDialogVisible.value = false
    })
  }

  // ===== Tab 3: 基因检测结果解释 =====
  interface GeneItem {
    id: number
    geneName: string
    interpretation: string
  }

  const geneMock: GeneItem[] = [
    { id: 1, geneName: 'EGFR', interpretation: 'EGFR基因突变提示对酪氨酸激酶抑制剂（TKI）治疗敏感，常见突变如L858R、19del等。' },
    { id: 2, geneName: 'KRAS', interpretation: 'KRAS基因突变通常提示对抗EGFR治疗耐药，常见突变位点在密码子12、13。' },
    { id: 3, geneName: 'BRAF', interpretation: 'BRAF V600E突变提示可使用BRAF抑制剂治疗，常见于黑色素瘤和甲状腺癌。' },
    { id: 4, geneName: 'HER2', interpretation: 'HER2基因扩增提示可使用抗HER2靶向药物治疗，如曲妥珠单抗。' },
    { id: 5, geneName: 'ALK', interpretation: 'ALK融合基因阳性提示可使用ALK抑制剂治疗，如克唑替尼、阿来替尼等。' },
    { id: 6, geneName: 'ROS1', interpretation: 'ROS1融合基因阳性提示可使用ROS1抑制剂治疗，如克唑替尼、恩曲替尼等。' },
    { id: 7, geneName: 'MET', interpretation: 'MET外显子14跳跃突变提示可使用MET抑制剂治疗，如赛沃替尼、卡马替尼等。' },
    { id: 8, geneName: 'PIK3CA', interpretation: 'PIK3CA突变可能与靶向治疗耐药相关，常见于乳腺癌和结直肠癌。' }
  ]

  const geneAllData = ref<GeneItem[]>([...geneMock])
  const geneData = ref<GeneItem[]>([])
  const genePagination = reactive({ current: 1, size: 10, total: 0 })
  const geneSearch = reactive({ geneName: '' })

  const handleGeneReset = () => {
    geneSearch.geneName = ''
    genePagination.current = 1
    fetchGeneData()
  }

  const geneColumns = ref([
    { prop: 'geneName', label: '基因名称', width: 120 },
    { prop: 'interpretation', label: '结果解释', minWidth: 300 },
    {
      prop: 'operation',
      label: '操作',
      width: 108,
      fixed: 'right',
      formatter: (row: GeneItem) =>
        h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEditGene(row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDeleteGene(row) })
        ])
    }
  ])

  const fetchGeneData = () => {
    loading.value = true
    setTimeout(() => {
      let filtered = [...geneAllData.value]
      if (geneSearch.geneName) filtered = filtered.filter((d) => d.geneName.includes(geneSearch.geneName))
      genePagination.total = filtered.length
      const start = (genePagination.current - 1) * genePagination.size
      geneData.value = filtered.slice(start, start + genePagination.size)
      loading.value = false
    }, 200)
  }

  // 基因解释弹窗
  const geneDialogVisible = ref(false)
  const geneFormRef = ref<FormInstance>()
  const geneDialogMode = ref<'add' | 'edit'>('add')
  const geneEditingId = ref(0)
  const geneDialogTitle = computed(() => geneDialogMode.value === 'add' ? '新增基因结果解释' : '编辑基因结果解释')
  const geneForm = reactive({ geneName: '', interpretation: '' })
  const geneFormRules: FormRules = {
    geneName: [{ required: true, message: '请输入基因名称', trigger: 'blur' }],
    interpretation: [{ required: true, message: '请输入结果解释', trigger: 'blur' }]
  }

  const handleAddGene = () => {
    geneDialogMode.value = 'add'
    Object.assign(geneForm, { geneName: '', interpretation: '' })
    geneDialogVisible.value = true
    nextTick(() => geneFormRef.value?.clearValidate())
  }

  // 基因弹窗关闭时清除验证状态
  watch(geneDialogVisible, (val) => {
    if (!val) {
      nextTick(() => geneFormRef.value?.clearValidate())
    }
  })

  const handleEditGene = (row: GeneItem) => {
    geneDialogMode.value = 'edit'
    geneEditingId.value = row.id
    Object.assign(geneForm, { geneName: row.geneName, interpretation: row.interpretation })
    geneDialogVisible.value = true
    nextTick(() => geneFormRef.value?.clearValidate())
  }

  const handleDeleteGene = (row: GeneItem) => {
    ElMessageBox.confirm(`确定要删除基因「${row.geneName}」的解释吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      geneAllData.value = geneAllData.value.filter((d) => d.id !== row.id)
      fetchGeneData()
      ElMessage.success('删除成功')
    })
  }

  const handleGeneSubmit = async () => {
    if (!geneFormRef.value) return
    await geneFormRef.value.validate((valid) => {
      if (!valid) return
      if (geneDialogMode.value === 'add') {
        const newId = Math.max(...geneAllData.value.map((d) => d.id), 0) + 1
        geneAllData.value.unshift({ id: newId, ...geneForm })
        ElMessage.success('新增成功')
      } else {
        const idx = geneAllData.value.findIndex((d) => d.id === geneEditingId.value)
        if (idx > -1) Object.assign(geneAllData.value[idx], geneForm)
        ElMessage.success('修改成功')
      }
      fetchGeneData()
      geneDialogVisible.value = false
    })
  }

  // ===== 通用方法 =====
  const refreshData = () => {
    if (activeTab.value === 'template') fetchTemplateData()
    else if (activeTab.value === 'project') fetchProjectData()
    else fetchGeneData()
  }

  const handleSizeChange = (val: number, type: string) => {
    if (type === 'template') {
      templatePagination.size = val
      templatePagination.current = 1
      fetchTemplateData()
    } else if (type === 'project') {
      projectPagination.size = val
      projectPagination.current = 1
      fetchProjectData()
    } else {
      genePagination.size = val
      genePagination.current = 1
      fetchGeneData()
    }
  }

  const handleCurrentChange = (val: number, type: string) => {
    if (type === 'template') {
      templatePagination.current = val
      fetchTemplateData()
    } else if (type === 'project') {
      projectPagination.current = val
      fetchProjectData()
    } else {
      genePagination.current = val
      fetchGeneData()
    }
  }

  // 监听 tab 切换
  watch(activeTab, (val) => {
    if (val === 'template') fetchTemplateData()
    else if (val === 'project') fetchProjectData()
    else fetchGeneData()
  })

  onMounted(() => {
    fetchTemplateData()
  })
</script>

<style lang="scss" scoped>
  .report-center {
    .center-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 12px;
      }
    }

    .tab-search-wrapper {
      padding: 16px 20px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: calc(var(--custom-radius) + 4px);
      margin-bottom: 12px;

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
