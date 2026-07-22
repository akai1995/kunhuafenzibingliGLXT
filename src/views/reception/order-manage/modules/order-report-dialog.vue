<!-- 报告书写弹窗 -->
<template>
  <ElDrawer v-model="dialogVisible" :title="viewMode ? '查看报告' : '报告书写'" size="900px" :close-on-click-modal="true">
    <!-- 步骤条 -->
    <ElSteps :active="currentStep" align-center class="mb-6">
      <ElStep title="选择报告模板" />
      <ElStep title="检测报告" />
    </ElSteps>

    <!-- 订单基本信息 -->
    <ElDescriptions :column="3" border class="mb-4">
      <ElDescriptionsItem label="患者姓名">{{ formData.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="检测项目">{{ formData.projectName || '-' }}</ElDescriptionsItem>
    </ElDescriptions>

    <!-- 第一步：选择报告模板 -->
    <div v-show="currentStep === 0">
      <div class="template-search mb-4">
        <ElInput v-model="templateSearch" placeholder="输入模板名称、项目编码或项目分类搜索" clearable size="default">
          <template #append>
            <ElButton :icon="Search">搜索</ElButton>
          </template>
        </ElInput>
      </div>
      <ElRadioGroup v-model="formData.templateId" class="w-full">
        <div class="template-list">
          <div
            v-for="item in filteredTemplateList"
            :key="item.id"
            class="template-item"
            :class="{ 'is-active': formData.templateId === item.id }"
          >
            <ElRadio :value="item.id" class="w-full">
              <div class="template-card">
                <div class="template-name">{{ item.name }}</div>
                <div class="template-info">
                  <span class="info-label">项目编码：</span>
                  <span class="info-value">{{ item.projectCode }}</span>
                </div>
                <div class="template-info">
                  <span class="info-label">项目分类：</span>
                  <ElTag size="small" type="info">{{ item.category }}</ElTag>
                </div>
              </div>
            </ElRadio>
          </div>
        </div>
      </ElRadioGroup>
      <ElEmpty v-if="filteredTemplateList.length === 0" description="未找到匹配的模板" />
    </div>

    <!-- 第二步：检测报告 -->
    <div v-show="currentStep === 1">
      <ElForm ref="formRef" :model="formData" label-width="120px">
        <!-- 主要质控模块（表格，数据由模板带入） -->
        <div class="report-module">
          <div class="report-module-header">
            <span class="report-module-title">主要质控</span>
          </div>
          <ElTable :data="formData.qcTableData" border class="w-full" max-height="360">
            <ElTableColumn label="名称" min-width="120" prop="name" />
            <ElTableColumn label="质量参数" min-width="140">
              <template #default="{ row }">
                <ElSelect v-model="row.qualityParam" placeholder="请选择" size="small" class="w-full">
                  <ElOption label="D260/280比值" value="d260_280" />
                  <ElOption label="D260/230比值" value="d260_230" />
                  <ElOption label="DNA浓度" value="dna_conc" />
                  <ElOption label="RNA浓度" value="rna_conc" />
                  <ElOption label="片段大小" value="fragment_size" />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="结果" min-width="100">
              <template #default="{ row }">
                <ElSelect v-model="row.qualityResult" placeholder="请选择" size="small" class="w-full">
                  <ElOption label="合格" value="pass" />
                  <ElOption label="不合格" value="fail" />
                  <ElOption label="临界" value="borderline" />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="质控标准" min-width="120" prop="qcStandard" />
            <ElTableColumn label="判读" min-width="110">
              <template #default="{ row }">
                <ElSelect v-model="row.judgment" placeholder="请选择" size="small" class="w-full">
                  <ElOption label="阳性" value="positive" />
                  <ElOption label="阴性" value="negative" />
                  <ElOption label="弱阳性" value="weak_positive" />
                  <ElOption label="未检出" value="not_detected" />
                </ElSelect>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <!-- 其他检测信息模块（独立表单） -->
        <div class="report-module">
          <div class="report-module-header">
            <span class="report-module-title">检测信息</span>
          </div>
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="样本编号" prop="sampleCode">
                <ElInput v-model="formData.sampleCode" placeholder="请输入样本编号" disabled />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="检测结果附图">
                <ElUpload
                  v-if="!viewMode"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleImageChange"
                  :on-remove="handleImageRemove"
                >
                  <ElButton>
                    <ElIcon class="mr-1"><Plus /></ElIcon>
                    {{ formData.images?.length ? `已上传${formData.images.length}张` : '上传图片' }}
                  </ElButton>
                </ElUpload>
                <span v-else class="text-sm text-g-600">{{ formData.images?.length ? `已上传${formData.images.length}张图片` : '-' }}</span>
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" :disabled="viewMode" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="基因检测结果解释" prop="resultInterpretation">
                <ElInput
                  v-model="formData.resultInterpretation"
                  placeholder="请选择检测结果解释"
                  readonly
                  :disabled="viewMode"
                  :class="viewMode ? '' : 'cursor-pointer'"
                  @click="!viewMode && openInterpretationDialog()"
                >
                  <template v-if="!viewMode" #append>
                    <ElButton @click="openInterpretationDialog()">选择</ElButton>
                  </template>
                </ElInput>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="检测技师" prop="testTechnician">
                <ElSelect v-model="formData.testTechnician" placeholder="请选择检测技师" class="w-full" filterable :disabled="viewMode">
                  <ElOption label="张技师" value="tech_01" />
                  <ElOption label="李技师" value="tech_02" />
                  <ElOption label="王技师" value="tech_03" />
                  <ElOption label="赵技师" value="tech_04" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="检测时间" prop="testTime">
                <ElDatePicker
                  v-model="formData.testTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  class="w-full"
                  :disabled="viewMode"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="复核技师" prop="reviewTechnician">
                <ElSelect v-model="formData.reviewTechnician" placeholder="请选择复核技师" class="w-full" filterable :disabled="viewMode">
                  <ElOption label="张技师" value="tech_01" />
                  <ElOption label="李技师" value="tech_02" />
                  <ElOption label="王技师" value="tech_03" />
                  <ElOption label="赵技师" value="tech_04" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="复核时间" prop="reviewTime">
                <ElDatePicker
                  v-model="formData.reviewTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  class="w-full"
                  :disabled="viewMode"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="报告医生" prop="reportDoctor">
                <ElSelect v-model="formData.reportDoctor" placeholder="请选择报告医生" class="w-full" filterable :disabled="viewMode">
                  <ElOption label="陈医生" value="doc_01" />
                  <ElOption label="刘医生" value="doc_02" />
                  <ElOption label="杨医生" value="doc_03" />
                  <ElOption label="黄医生" value="doc_04" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="报告时间" prop="reportTime">
                <ElDatePicker
                  v-model="formData.reportTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  class="w-full"
                  :disabled="viewMode"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </div>
      </ElForm>
    </div>

    <!-- 检测结果解释选择弹窗 -->
    <ElDialog
      v-model="interpretationDialogVisible"
      title="选择基因检测结果解释"
      width="650px"
      append-to-body
    >
      <div class="interpretation-search mb-3">
        <ElInput v-model="interpretationSearch" placeholder="输入基因名称或结果解释关键词搜索" clearable>
          <template #append>
            <ElButton>搜索</ElButton>
          </template>
        </ElInput>
      </div>
      <ElTable
        :data="filteredInterpretationList"
        highlight-current-row
        max-height="360"
        @current-change="handleInterpretationSelect"
      >
        <ElTableColumn prop="geneName" label="基因名称" width="140" />
        <ElTableColumn prop="explanation" label="结果解释" />
        <ElTableColumn label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="confirmInterpretation(row)">选择</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <template #footer>
        <ElButton @click="interpretationDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 查看报告弹窗（Word文档样式，支持增删改查） -->
    <ElDialog
      v-model="reportPreviewVisible"
      title="报告预览"
      width="860px"
      :close-on-click-modal="true"
      @closed="handleReportPreviewClosed"
    >
      <div class="report-preview-doc">
        <div class="doc-header">
          <h2 class="doc-title">病理检测报告</h2>
          <div class="doc-divider" />
        </div>

        <!-- 患者信息表 -->
        <table class="doc-table">
          <tbody>
            <tr>
              <td class="doc-label">患者姓名</td>
              <td class="doc-value">
                <ElInput v-model="previewData.patientName" size="small" class="doc-input" />
              </td>
              <td class="doc-label">样本编号</td>
              <td class="doc-value">
                <ElInput v-model="previewData.sampleCode" size="small" class="doc-input" disabled />
              </td>
            </tr>
            <tr>
              <td class="doc-label">检测项目</td>
              <td class="doc-value">
                <ElInput v-model="previewData.projectName" size="small" class="doc-input" disabled />
              </td>
              <td class="doc-label">报告模板</td>
              <td class="doc-value">
                <ElInput v-model="previewData.templateName" size="small" class="doc-input" disabled />
              </td>
            </tr>
            <tr>
              <td class="doc-label">检测技师</td>
              <td class="doc-value">
                <ElSelect v-model="previewData.testTechnician" size="small" class="w-full" filterable>
                  <ElOption label="张技师" value="tech_01" />
                  <ElOption label="李技师" value="tech_02" />
                  <ElOption label="王技师" value="tech_03" />
                  <ElOption label="赵技师" value="tech_04" />
                </ElSelect>
              </td>
              <td class="doc-label">检测时间</td>
              <td class="doc-value">
                <ElDatePicker
                  v-model="previewData.testTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  size="small"
                  class="w-full"
                />
              </td>
            </tr>
            <tr>
              <td class="doc-label">复核技师</td>
              <td class="doc-value">
                <ElSelect v-model="previewData.reviewTechnician" size="small" class="w-full" filterable>
                  <ElOption label="张技师" value="tech_01" />
                  <ElOption label="李技师" value="tech_02" />
                  <ElOption label="王技师" value="tech_03" />
                  <ElOption label="赵技师" value="tech_04" />
                </ElSelect>
              </td>
              <td class="doc-label">复核时间</td>
              <td class="doc-value">
                <ElDatePicker
                  v-model="previewData.reviewTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  size="small"
                  class="w-full"
                />
              </td>
            </tr>
            <tr>
              <td class="doc-label">报告医生</td>
              <td class="doc-value">
                <ElSelect v-model="previewData.reportDoctor" size="small" class="w-full" filterable>
                  <ElOption label="陈医生" value="doc_01" />
                  <ElOption label="刘医生" value="doc_02" />
                  <ElOption label="杨医生" value="doc_03" />
                  <ElOption label="黄医生" value="doc_04" />
                </ElSelect>
              </td>
              <td class="doc-label">报告时间</td>
              <td class="doc-value">
                <ElDatePicker
                  v-model="previewData.reportTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  size="small"
                  class="w-full"
                />
              </td>
            </tr>
            <tr>
              <td class="doc-label">备注</td>
              <td class="doc-value" colspan="3">
                <ElInput v-model="previewData.remark" size="small" type="textarea" :rows="2" class="doc-input" />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="doc-divider" />

        <!-- 主要质控表格 -->
        <div class="doc-section">
          <div class="doc-section-header">
            <span class="doc-section-title">主要质控</span>
            <ElButton size="small" type="primary" text @click="addPreviewQcRow">
              <ArtSvgIcon icon="ri:add-line" class="mr-0.5" />
              添加行
            </ElButton>
          </div>
          <ElTable :data="previewData.qcTableData" border class="w-full" max-height="300" size="small">
            <ElTableColumn label="名称" min-width="100">
              <template #default="{ row, $index }">
                <ElInput v-model="row.name" size="small" placeholder="名称" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="质量参数" min-width="120">
              <template #default="{ row, $index }">
                <ElSelect v-model="row.qualityParam" size="small" placeholder="请选择" class="w-full">
                  <ElOption label="D260/280比值" value="d260_280" />
                  <ElOption label="D260/230比值" value="d260_230" />
                  <ElOption label="DNA浓度" value="dna_conc" />
                  <ElOption label="RNA浓度" value="rna_conc" />
                  <ElOption label="片段大小" value="fragment_size" />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="结果" min-width="90">
              <template #default="{ row, $index }">
                <ElSelect v-model="row.qualityResult" size="small" placeholder="请选择" class="w-full">
                  <ElOption label="合格" value="pass" />
                  <ElOption label="不合格" value="fail" />
                  <ElOption label="临界" value="borderline" />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="质控标准" min-width="110">
              <template #default="{ row, $index }">
                <ElInput v-model="row.qcStandard" size="small" placeholder="质控标准" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="判读" min-width="100">
              <template #default="{ row, $index }">
                <ElSelect v-model="row.judgment" size="small" placeholder="请选择" class="w-full">
                  <ElOption label="阳性" value="positive" />
                  <ElOption label="阴性" value="negative" />
                  <ElOption label="弱阳性" value="weak_positive" />
                  <ElOption label="未检出" value="not_detected" />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="70" fixed="right" align="center">
              <template #default="{ $index }">
                <ElButton link type="danger" size="small" @click="removePreviewQcRow($index)">
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="doc-divider" />

        <!-- 基因检测结果解释 -->
        <div class="doc-section">
          <div class="doc-section-title mb-2">基因检测结果解释</div>
          <ElInput
            v-model="previewData.resultInterpretation"
            type="textarea"
            :rows="3"
            placeholder="基因检测结果解释"
            class="doc-input"
          />
        </div>
      </div>
      <template #footer>
        <ElButton @click="reportPreviewVisible = false">关闭</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSaveFromPreview">保存</ElButton>
      </template>
    </ElDialog>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="viewMode">
          <ElButton @click="dialogVisible = false">关闭</ElButton>
        </template>
        <template v-else>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton v-if="currentStep === 1" @click="currentStep = 0">上一步</ElButton>
          <ElButton v-if="currentStep === 0" type="primary" @click="handleNext">下一步</ElButton>
          <ElButton v-if="currentStep === 1" type="warning" :loading="submitting" @click="handleViewReport">查看报告</ElButton>
          <ElButton v-if="currentStep === 1" type="primary" :loading="submitting" @click="handleSave">保存</ElButton>
          <ElButton v-if="currentStep === 1" type="success" :loading="submitting" @click="handleSubmit">提交审核</ElButton>
        </template>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { Plus, Search } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'OrderReportDialog' })

  interface Props {
    visible: boolean
    orderData?: any
    viewMode?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'save', data: any): void
    (e: 'submit', data: any): void
    (e: 'draft', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const currentStep = ref(0)

  // 报告模板列表
  const templateList = [
    {
      id: 'tpl_egfr',
      name: 'EGFR基因突变检测报告模板',
      projectCode: 'EGFR-2026-001',
      category: '基因突变检测',
      qcData: [
        { name: 'DNA浓度', qualityParam: 'dna_conc', qualityResult: '', qcStandard: '≥10ng/μL', judgment: '' },
        { name: 'D260/280比值', qualityParam: 'd260_280', qualityResult: '', qcStandard: '1.8-2.0', judgment: '' },
        { name: 'D260/230比值', qualityParam: 'd260_230', qualityResult: '', qcStandard: '≥1.5', judgment: '' }
      ]
    },
    {
      id: 'tpl_kras',
      name: 'KRAS基因突变检测报告模板',
      projectCode: 'KRAS-2026-002',
      category: '基因突变检测',
      qcData: [
        { name: 'DNA浓度', qualityParam: 'dna_conc', qualityResult: '', qcStandard: '≥5ng/μL', judgment: '' },
        { name: 'D260/280比值', qualityParam: 'd260_280', qualityResult: '', qcStandard: '1.8-2.0', judgment: '' }
      ]
    },
    {
      id: 'tpl_braf',
      name: 'BRAF V600E突变检测报告模板',
      projectCode: 'BRAF-2026-003',
      category: '基因突变检测',
      qcData: [
        { name: 'DNA浓度', qualityParam: 'dna_conc', qualityResult: '', qcStandard: '≥10ng/μL', judgment: '' },
        { name: '片段大小', qualityParam: 'fragment_size', qualityResult: '', qcStandard: '≥200bp', judgment: '' }
      ]
    },
    {
      id: 'tpl_her2',
      name: 'HER2基因扩增检测报告模板',
      projectCode: 'HER2-2026-004',
      category: '基因扩增检测',
      qcData: [
        { name: 'DNA浓度', qualityParam: 'dna_conc', qualityResult: '', qcStandard: '≥20ng/μL', judgment: '' },
        { name: 'D260/280比值', qualityParam: 'd260_280', qualityResult: '', qcStandard: '1.8-2.0', judgment: '' },
        { name: 'D260/230比值', qualityParam: 'd260_230', qualityResult: '', qcStandard: '≥1.8', judgment: '' }
      ]
    },
    {
      id: 'tpl_alk',
      name: 'ALK融合基因检测报告模板',
      projectCode: 'ALK-2026-005',
      category: '融合基因检测',
      qcData: [
        { name: 'RNA浓度', qualityParam: 'rna_conc', qualityResult: '', qcStandard: '≥20ng/μL', judgment: '' },
        { name: 'D260/280比值', qualityParam: 'd260_280', qualityResult: '', qcStandard: '1.9-2.1', judgment: '' }
      ]
    },
    {
      id: 'tpl_ngs',
      name: 'NGS多基因检测报告模板',
      projectCode: 'NGS-2026-006',
      category: '高通量测序',
      qcData: [
        { name: 'DNA浓度', qualityParam: 'dna_conc', qualityResult: '', qcStandard: '≥10ng/μL', judgment: '' },
        { name: 'D260/280比值', qualityParam: 'd260_280', qualityResult: '', qcStandard: '1.8-2.0', judgment: '' },
        { name: 'D260/230比值', qualityParam: 'd260_230', qualityResult: '', qcStandard: '≥1.5', judgment: '' },
        { name: '片段大小', qualityParam: 'fragment_size', qualityResult: '', qcStandard: '150-300bp', judgment: '' }
      ]
    }
  ]

  // 模板搜索
  const templateSearch = ref('')
  const filteredTemplateList = computed(() => {
    if (!templateSearch.value) return templateList
    const keyword = templateSearch.value.toLowerCase()
    return templateList.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.projectCode.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    )
  })

  const formData = reactive({
    patientName: '',
    projectName: '',
    pathologyNo: '',
    templateId: '',
    // 主要质控表格数据
    qcTableData: [createQcRow()],
    // 检测信息
    sampleCode: '',
    images: [] as any[],
    remark: '',
    resultInterpretation: '',
    testTechnician: '',
    testTime: '',
    reviewTechnician: '',
    reviewTime: '',
    reportDoctor: '',
    reportTime: '',
    reportStatus: '未书写'
  })

  // 创建质控行
  function createQcRow() {
    return {
      name: '',
      qualityParam: '',
      qualityResult: '',
      qcStandard: '',
      judgment: ''
    }
  }

  // 添加质控行
  const addQcRow = () => {
    formData.qcTableData.push(createQcRow())
  }

  // 删除质控行
  const removeQcRow = (index: number) => {
    if (formData.qcTableData.length <= 1) {
      ElMessage.warning('至少保留一条数据')
      return
    }
    formData.qcTableData.splice(index, 1)
  }

  const rules: FormRules = {
    sampleCode: [{ required: true, message: '请输入样本编号', trigger: 'blur' }],
    resultInterpretation: [{ required: true, message: '请选择基因检测结果解释', trigger: 'change' }],
    testTechnician: [{ required: true, message: '请选择检测技师', trigger: 'change' }],
    testTime: [{ required: true, message: '请选择检测时间', trigger: 'change' }],
    reportDoctor: [{ required: true, message: '请选择报告医生', trigger: 'change' }],
    reportTime: [{ required: true, message: '请选择报告时间', trigger: 'change' }]
  }

  // 检测结果解释弹窗
  const interpretationDialogVisible = ref(false)
  const interpretationSearch = ref('')

  const interpretationList = [
    { geneName: 'EGFR', explanation: '检测到第21外显子L858R突变，提示对EGFR-TKI靶向治疗敏感' },
    { geneName: 'EGFR', explanation: '检测到第19外显子缺失突变，提示对EGFR-TKI靶向治疗敏感' },
    { geneName: 'EGFR', explanation: '检测到T790M耐药突变，建议更换三代EGFR-TKI' },
    { geneName: 'EGFR', explanation: '未检测到EGFR基因突变' },
    { geneName: 'KRAS', explanation: '检测到G12C突变，提示对EGFR抑制剂不敏感' },
    { geneName: 'KRAS', explanation: '未检测到KRAS基因突变' },
    { geneName: 'BRAF', explanation: '检测到V600E突变，提示可考虑使用BRAF抑制剂' },
    { geneName: 'BRAF', explanation: '未检测到BRAF V600E突变' },
    { geneName: 'HER2', explanation: '检测到HER2基因扩增，阳性' },
    { geneName: 'HER2', explanation: '未检测到HER2基因扩增，阴性' },
    { geneName: 'ALK', explanation: '检测到ALK基因融合，阳性' },
    { geneName: 'ALK', explanation: '未检测到ALK基因融合，阴性' },
    { geneName: 'ROS1', explanation: '检测到ROS1基因融合，阳性' },
    { geneName: 'MET', explanation: '检测到MET外显子14跳跃突变' },
    { geneName: 'PIK3CA', explanation: '检测到PIK3CA H1047R突变' },
    { geneName: 'TP53', explanation: '检测到TP53 R175H突变' }
  ]

  const filteredInterpretationList = computed(() => {
    if (!interpretationSearch.value) return interpretationList
    const keyword = interpretationSearch.value.toLowerCase()
    return interpretationList.filter(
      (item) =>
        item.geneName.toLowerCase().includes(keyword) ||
        item.explanation.toLowerCase().includes(keyword)
    )
  })

  let selectedInterpretation: any = null

  const openInterpretationDialog = () => {
    interpretationDialogVisible.value = true
    interpretationSearch.value = ''
    selectedInterpretation = null
  }

  const handleInterpretationSelect = (row: any) => {
    selectedInterpretation = row
  }

  const confirmInterpretation = (row: any) => {
    formData.resultInterpretation = `${row.geneName}：${row.explanation}`
    interpretationDialogVisible.value = false
  }

  const handleImageChange = (file: any) => {
    formData.images.push(file)
  }

  const handleImageRemove = (file: any) => {
    const idx = formData.images.findIndex((f: any) => f.uid === file.uid)
    if (idx > -1) formData.images.splice(idx, 1)
  }

  // ===== 查看报告弹窗（Word文档样式，支持增删改查） =====
  const reportPreviewVisible = ref(false)

  const previewData = reactive({
    patientName: '',
    sampleCode: '',
    projectName: '',
    templateName: '',
    testTechnician: '',
    testTime: '',
    reviewTechnician: '',
    reviewTime: '',
    reportDoctor: '',
    reportTime: '',
    remark: '',
    resultInterpretation: '',
    qcTableData: [] as any[]
  })

  const handleViewReport = () => {
    // 获取选中的模板名称
    const tpl = templateList.find((t) => t.id === formData.templateId)
    // 将表单数据同步到预览数据
    previewData.patientName = formData.patientName
    previewData.sampleCode = formData.sampleCode
    previewData.projectName = formData.projectName
    previewData.templateName = tpl?.name || ''
    previewData.testTechnician = formData.testTechnician
    previewData.testTime = formData.testTime
    previewData.reviewTechnician = formData.reviewTechnician
    previewData.reviewTime = formData.reviewTime
    previewData.reportDoctor = formData.reportDoctor
    previewData.reportTime = formData.reportTime
    previewData.remark = formData.remark
    previewData.resultInterpretation = formData.resultInterpretation
    previewData.qcTableData = formData.qcTableData.map((item: any) => ({ ...item }))
    reportPreviewVisible.value = true
  }

  const addPreviewQcRow = () => {
    previewData.qcTableData.push(createQcRow())
  }

  const removePreviewQcRow = (index: number) => {
    if (previewData.qcTableData.length <= 1) {
      ElMessage.warning('至少保留一条数据')
      return
    }
    previewData.qcTableData.splice(index, 1)
  }

  const handleSaveFromPreview = () => {
    // 将预览数据同步回表单
    formData.patientName = previewData.patientName
    formData.sampleCode = previewData.sampleCode
    formData.testTechnician = previewData.testTechnician
    formData.testTime = previewData.testTime
    formData.reviewTechnician = previewData.reviewTechnician
    formData.reviewTime = previewData.reviewTime
    formData.reportDoctor = previewData.reportDoctor
    formData.reportTime = previewData.reportTime
    formData.remark = previewData.remark
    formData.resultInterpretation = previewData.resultInterpretation
    formData.qcTableData = previewData.qcTableData.map((item: any) => ({ ...item }))
    reportPreviewVisible.value = false
    ElMessage.success('报告已保存')
  }

  const handleReportPreviewClosed = () => {
    // 关闭时不做保存，预览数据丢弃
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        currentStep.value = props.viewMode ? 1 : 0
        formData.qcTableData = [createQcRow()]
        if (props.orderData) {
          formData.patientName = props.orderData.patientName || ''
          formData.projectName = props.orderData.projectName || ''
          formData.pathologyNo = props.orderData.pathologyNo || ''
          formData.reportStatus = props.orderData.reportStatus || '未书写'
          formData.sampleCode = props.orderData.sampleCode || ''
          // 如果是"书写中"状态或查看模式，恢复之前保存的表单数据
          if ((props.orderData.reportStatus === '书写中' || props.viewMode) && props.orderData.reportData) {
            const saved = props.orderData.reportData as any
            formData.patientName = saved.patientName || props.orderData.patientName || ''
            formData.projectName = saved.projectName || props.orderData.projectName || ''
            formData.pathologyNo = saved.pathologyNo || props.orderData.pathologyNo || ''
            formData.sampleCode = saved.sampleCode || props.orderData.sampleCode || ''
            formData.templateId = saved.templateId || ''
            formData.testTechnician = saved.testTechnician || ''
            formData.testTime = saved.testTime || ''
            formData.reviewTechnician = saved.reviewTechnician || ''
            formData.reviewTime = saved.reviewTime || ''
            formData.reportDoctor = saved.reportDoctor || ''
            formData.reportTime = saved.reportTime || ''
            formData.remark = saved.remark || ''
            formData.resultInterpretation = saved.resultInterpretation || ''
            if (saved.qcTableData && saved.qcTableData.length > 0) {
              formData.qcTableData = saved.qcTableData.map((item: any) => ({ ...item }))
            }
            // 如果已有模板ID，直接跳到第二步
            if (formData.templateId) {
              currentStep.value = 1
            }
          }
        }
      }
    }
  )

  const handleNext = () => {
    if (!formData.templateId) {
      ElMessage.warning('请选择报告模板')
      return
    }
    // 根据所选模板带入质控数据
    const tpl = templateList.find((t) => t.id === formData.templateId)
    if (tpl && tpl.qcData) {
      formData.qcTableData = tpl.qcData.map((item) => ({ ...item }))
    }
    currentStep.value = 1
  }

  // 存为草稿（两个步骤都可以，不校验必填项）
  const handleSaveDraft = async () => {
    submitting.value = true
    await new Promise((r) => setTimeout(r, 500))
    submitting.value = false
    formData.reportStatus = '草稿'
    ElMessage.success('已存为草稿')
    emit('draft', { ...formData, currentStep: currentStep.value })
    dialogVisible.value = false
  }

  const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      await new Promise((r) => setTimeout(r, 500))
      submitting.value = false
      ElMessage.success('报告保存成功')
      emit('save', { ...formData })
      dialogVisible.value = false
    })
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      await new Promise((r) => setTimeout(r, 500))
      submitting.value = false
      formData.reportStatus = '待审核'
      ElMessage.success('报告已提交审核')
      emit('submit', { ...formData })
      dialogVisible.value = false
    })
  }
</script>

<style lang="scss" scoped>
  .template-list {
    display: flex; 
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  }

  .template-item {
    width: calc(50% - 6px);
    padding: 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &.is-active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    :deep(.el-radio) {
      width: 100%;
      height: auto;
      align-items: flex-start;
    }

    :deep(.el-radio__label) {
      width: 100%;
    }
  }

  .template-card {
    .template-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 6px;
    }

    .template-info {
      display: flex;
      align-items: center;
      font-size: 13px;
      line-height: 1.8;

      .info-label {
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }

      .info-value {
        color: var(--el-text-color-regular);
      }
    }
  }

  .template-search {
    :deep(.el-input-group__append) {
      padding: 0 10px;
    }

    :deep(.el-input__wrapper) {
      width: 100%;
    }
  }

  .report-module {
    margin-bottom: 20px;

    .report-module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .report-module-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    :deep(.el-table) {
      .el-form-item {
        margin-bottom: 0;
      }

      .el-form-item__error {
        position: relative;
      }
    }
  }

  // ===== Word文档样式报告预览 =====
  .report-preview-doc {
    padding: 0;
    background: #fff;
    font-family: 'SimSun', '宋体', serif;
    font-size: 14px;
    line-height: 1.8;
    color: #333;

    .doc-header {
      text-align: center;
      margin-bottom: 16px;

      .doc-title {
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 12px 0;
        letter-spacing: 2px;
      }
    }

    .doc-divider {
      border-bottom: 2px solid #333;
      margin: 12px 0;
    }

    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;

      td {
        border: 1px solid #999;
        padding: 4px 8px;
        vertical-align: middle;
      }

      .doc-label {
        background: #f5f7fa;
        width: 90px;
        font-weight: 600;
        text-align: right;
        color: #555;
        white-space: nowrap;
      }

      .doc-value {
        min-width: 120px;
      }
    }

    .doc-input {
      :deep(.el-input__wrapper) {
        border: none;
        box-shadow: none;
        background: transparent;
      }

      :deep(.el-textarea__inner) {
        border: none;
        box-shadow: none;
        background: transparent;
        resize: none;
      }
    }

    .doc-section {
      margin-bottom: 12px;

      .doc-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .doc-section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
</style>
