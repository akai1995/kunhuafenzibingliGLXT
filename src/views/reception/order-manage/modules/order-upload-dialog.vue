<!-- 报告上传弹窗 -->
<template>
  <ElDrawer v-model="dialogVisible" title="报告上传" size="720px" :close-on-click-modal="true">
    <!-- 订单基本信息 -->
    <div class="upload-info-bar">
      <div class="info-item">
        <span class="info-label">检测项目</span>
        <span class="info-value">{{ formData.projectName || '-' }}</span>
      </div>
    </div>

    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="130px" class="upload-form">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="患者姓名" prop="patientName">
            <ElInput v-model="formData.patientName" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否需要打印报告" prop="needPrint" label-width="150px">
            <ElRadioGroup v-model="formData.needPrint">
              <ElRadio value="yes">是</ElRadio>
              <ElRadio value="no">否</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="上传人">
            <ElInput v-model="formData.uploader" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="上传时间">
            <ElInput v-model="formData.uploadTime" disabled />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="有无胚系" prop="hasGermline">
            <ElRadioGroup v-model="formData.hasGermline">
              <ElRadio value="yes">有</ElRadio>
              <ElRadio value="no">无</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="有无补充报告" prop="hasSupplementary">
            <ElRadioGroup v-model="formData.hasSupplementary">
              <ElRadio value="yes">有</ElRadio>
              <ElRadio value="no">无</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="报告单" prop="reportFile">
            <div class="report-file-section">
              <ElUpload
                action="#"
                :auto-upload="false"
                :limit="1"
                :accept="'.pdf,.doc,.docx,.jpg,.jpeg,.png'"
                :on-change="handleReportFileChange"
                :on-remove="handleReportFileRemove"
                :show-file-list="false"
                drag
                class="report-upload-dragger"
              >
                <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
                <div class="el-upload__text">将报告单拖到此处，或<em>点击上传</em></div>
                <template #tip>
                  <div class="el-upload__tip">支持 PDF、Word、JPG、PNG 格式，单个文件不超过 10MB</div>
                </template>
              </ElUpload>
              <!-- 已上传文件展示 -->
              <div v-if="formData.reportFile" class="uploaded-file-item">
                <span class="file-item-name">
                  <ArtSvgIcon :icon="getFileIconByExtension(getFileExtension(formData.reportFile.name))" class="mr-1" />
                  {{ formData.reportFile.name }}
                </span>
                <div class="file-item-actions">
                  <ElButton type="primary" size="small" text @click="handlePreviewFile('report', 0)">
                    <ArtSvgIcon icon="ri:file-search-line" class="mr-0.5" />
                    查看报告
                  </ElButton>
                  <ElButton type="danger" size="small" text @click="handleReportFileRemove">
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-0.5" />
                    删除
                  </ElButton>
                </div>
              </div>
            </div>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="formData.hasSupplementary === 'yes'" :span="24">
          <ElFormItem label="补充报告单">
            <div class="supplementary-section">
              <ElUpload
                action="#"
                :auto-upload="false"
                :accept="'.pdf,.doc,.docx,.jpg,.jpeg,.png'"
                :on-change="handleSupplementaryFileChange"
                :on-remove="handleSupplementaryFileRemove"
                :show-file-list="false"
                multiple
              >
                <ElButton>
                  <ElIcon class="mr-1"><Paperclip /></ElIcon>
                  {{ formData.supplementaryFiles?.length ? `已上传${formData.supplementaryFiles.length}个文件` : '上传补充报告单' }}
                </ElButton>
                <template #tip>
                  <div class="el-upload__tip">支持 PDF、Word、JPG、PNG 格式，可上传多个文件</div>
                </template>
              </ElUpload>
              <!-- 每个补充报告文件单独展示，可单独查看和删除 -->
              <div v-if="formData.supplementaryFiles?.length" class="supplementary-file-list">
                <div
                  v-for="(file, idx) in formData.supplementaryFiles"
                  :key="file.uid"
                  class="uploaded-file-item"
                >
                  <span class="file-item-name">
                    <ArtSvgIcon :icon="getFileIconByExtension(getFileExtension(file.name))" class="mr-1" />
                    {{ file.name }}
                  </span>
                  <div class="file-item-actions">
                    <ElButton type="primary" size="small" text @click="handlePreviewFile('supplementary', idx)">
                      <ArtSvgIcon icon="ri:file-search-line" class="mr-0.5" />
                      查看报告
                    </ElButton>
                    <ElButton type="danger" size="small" text @click="handleRemoveSupplementaryByIndex(idx)">
                      <ArtSvgIcon icon="ri:delete-bin-line" class="mr-0.5" />
                      删除
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="formData.hasSupplementary === 'yes'" :span="24">
          <ElFormItem label="补充报告备注" prop="supplementaryRemark">
            <ElInput
              v-model="formData.supplementaryRemark"
              type="textarea"
              :rows="2"
              placeholder="请输入补充报告备注"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确认上传</ElButton>
      </div>
    </template>
  </ElDrawer>

  <!-- 文件预览/编辑弹窗 -->
  <ElDialog
    v-model="previewDialogVisible"
    :title="previewTitle"
    width="860px"
    :close-on-click-modal="true"
    @closed="handlePreviewClosed"
  >
    <div class="file-preview-container">
      <!-- 文件信息 -->
      <div class="preview-file-info">
        <ArtSvgIcon :icon="previewFileIcon" style="font-size: 32px; color: #2b579a" />
        <div class="preview-file-detail">
          <p class="preview-file-name">{{ previewFileName }}</p>
          <p class="preview-file-type">{{ previewFileType }}</p>
        </div>
      </div>

      <div class="preview-divider" />

      <!-- 图片预览 -->
      <div v-if="isImageFile" class="image-preview-area">
        <ElImage :src="previewImageUrl" fit="contain" class="preview-image" />
      </div>

      <!-- PDF/Word 在线编辑 -->
      <div v-else class="doc-editor-area">
        <div class="editor-toolbar">
          <ElButton size="small" @click="applyBold" :type="isBold ? 'primary' : 'default'">
            <strong>B</strong>
          </ElButton>
          <ElButton size="small" @click="applyItalic" :type="isItalic ? 'primary' : 'default'">
            <em>I</em>
          </ElButton>
          <ElButton size="small" @click="applyUnderline" :type="isUnderline ? 'primary' : 'default'">
            <u>U</u>
          </ElButton>
          <ElDivider direction="vertical" />
          <ElButton size="small" @click="applyHeading">标题</ElButton>
          <ElButton size="small" @click="applyParagraph">正文</ElButton>
          <ElDivider direction="vertical" />
          <ElButton size="small" @click="insertTable">插入表格</ElButton>
        </div>
        <div class="editor-content">
          <textarea
            v-model="editableContent"
            class="doc-editor-textarea"
            placeholder="在此编辑文档内容..."
          />
        </div>
      </div>
    </div>
    <template #footer>
      <ElButton @click="previewDialogVisible = false">关闭</ElButton>
      <ElButton type="primary" :loading="savingEdit" @click="handleSaveEdit">
        <ArtSvgIcon icon="ri:save-line" class="mr-0.5" />
        保存编辑
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { UploadFilled, Paperclip } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'OrderUploadDialog' })

  interface Props {
    visible: boolean
    orderData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const formatNow = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  }

  const formData = reactive({
    projectName: '',
    patientName: '',
    needPrint: 'no',
    uploader: '当前登录用户',
    uploadTime: formatNow(),
    hasGermline: 'no',
    hasSupplementary: 'no',
    supplementaryRemark: '',
    reportFile: null as any,
    supplementaryFiles: [] as any[]
  })

  // 文件列表（用于展示已上传文件）
  const reportFileList = ref<any[]>([])
  const supplementaryFileList = ref<any[]>([])

  // ===== 文件预览/编辑弹窗 =====
  const previewDialogVisible = ref(false)
  const previewTitle = ref('')
  const previewFileName = ref('')
  const previewFileType = ref('')
  const previewFileIcon = ref('ri:file-word-2-line')
  const previewImageUrl = ref('')
  const isImageFile = ref(false)
  const savingEdit = ref(false)
  const editableContent = ref('')
  const previewSource = ref<'report' | 'supplementary'>('report')
  const previewFileIndex = ref(0)

  // 编辑器状态
  const isBold = ref(false)
  const isItalic = ref(false)
  const isUnderline = ref(false)

  // 渲染后的内容
  const renderedContent = computed(() => {
    let content = editableContent.value
    if (!content) return '<p style="color:#999">暂无内容</p>'
    // 转义HTML
    content = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    // 按段落分割
    const paragraphs = content.split('\n').filter(Boolean)
    return paragraphs.map((p) => `<p>${p}</p>`).join('')
  })

  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
  }

  const getFileIconByExtension = (ext: string): string => {
    const iconMap: Record<string, string> = {
      pdf: 'ri:file-pdf-2-line',
      doc: 'ri:file-word-2-line',
      docx: 'ri:file-word-2-line',
      jpg: 'ri:image-line',
      jpeg: 'ri:image-line',
      png: 'ri:image-line'
    }
    return iconMap[ext] || 'ri:file-line'
  }

  const getFileTypeLabel = (ext: string): string => {
    const labelMap: Record<string, string> = {
      pdf: 'PDF 文档',
      doc: 'Word 文档',
      docx: 'Word 文档',
      jpg: '图片文件',
      jpeg: '图片文件',
      png: '图片文件'
    }
    return labelMap[ext] || '未知类型'
  }

  const handlePreviewFile = (source: 'report' | 'supplementary', index: number) => {
    previewSource.value = source
    previewFileIndex.value = index
    if (source === 'report') {
      const file = formData.reportFile
      if (!file) return
      const ext = getFileExtension(file.name)
      previewFileName.value = file.name
      previewFileType.value = getFileTypeLabel(ext)
      previewFileIcon.value = getFileIconByExtension(ext)
      isImageFile.value = ['jpg', 'jpeg', 'png'].includes(ext)
      if (isImageFile.value) {
        previewImageUrl.value = URL.createObjectURL(file.raw)
      } else {
        editableContent.value = `病理检测报告\n\n患者姓名：${formData.patientName}\n检测项目：${formData.projectName}\n\n检测结果概述：\n本次检测已完成，详细结果请参见报告正文。\n\n报告医生：${formData.uploader}\n报告时间：${formData.uploadTime}`
      }
      previewTitle.value = `查看报告单 - ${file.name}`
    } else {
      const files = formData.supplementaryFiles
      if (!files || !files[index]) return
      const file = files[index]
      const ext = getFileExtension(file.name)
      previewFileName.value = file.name
      previewFileType.value = getFileTypeLabel(ext)
      previewFileIcon.value = getFileIconByExtension(ext)
      isImageFile.value = ['jpg', 'jpeg', 'png'].includes(ext)
      if (isImageFile.value) {
        previewImageUrl.value = URL.createObjectURL(file.raw)
      } else {
        editableContent.value = `补充报告\n\n患者姓名：${formData.patientName}\n检测项目：${formData.projectName}\n\n补充说明：\n${formData.supplementaryRemark || '暂无补充说明'}`
      }
      previewTitle.value = `查看补充报告单 - ${file.name}`
    }
    previewDialogVisible.value = true
  }

  const handlePreviewClosed = () => {
    if (previewImageUrl.value) {
      URL.revokeObjectURL(previewImageUrl.value)
      previewImageUrl.value = ''
    }
  }

  // ===== 编辑器操作 =====
  const applyBold = () => { isBold.value = !isBold.value }
  const applyItalic = () => { isItalic.value = !isItalic.value }
  const applyUnderline = () => { isUnderline.value = !isUnderline.value }

  const applyHeading = () => {
    editableContent.value += '\n## 标题\n'
  }

  const applyParagraph = () => {
    editableContent.value += '\n正文内容...\n'
  }

  const insertTable = () => {
    editableContent.value += '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 数据 | 数据 | 数据 |\n'
  }

  const handleSaveEdit = async () => {
    savingEdit.value = true
    await new Promise((r) => setTimeout(r, 500))
    savingEdit.value = false
    ElMessage.success('文件编辑已保存')
    previewDialogVisible.value = false
  }

  const rules: FormRules = {
    needPrint: [{ required: true, message: '请选择', trigger: 'change' }],
    hasGermline: [{ required: true, message: '请选择', trigger: 'change' }],
    hasSupplementary: [{ required: true, message: '请选择', trigger: 'change' }],
    supplementaryRemark: [{ required: true, message: '请输入补充报告备注', trigger: 'blur' }]
  }

  const handleReportFileChange = (file: any) => {
    formData.reportFile = file
    reportFileList.value = [file]
  }

  const handleReportFileRemove = () => {
    formData.reportFile = null
    reportFileList.value = []
  }

  const handleSupplementaryFileChange = (file: any) => {
    formData.supplementaryFiles.push(file)
    supplementaryFileList.value.push(file)
  }

  const handleSupplementaryFileRemove = (file: any) => {
    const idx = formData.supplementaryFiles.findIndex((f: any) => f.uid === file.uid)
    if (idx > -1) formData.supplementaryFiles.splice(idx, 1)
    const listIdx = supplementaryFileList.value.findIndex((f: any) => f.uid === file.uid)
    if (listIdx > -1) supplementaryFileList.value.splice(listIdx, 1)
  }

  // 按索引删除补充报告文件
  const handleRemoveSupplementaryByIndex = (index: number) => {
    const file = formData.supplementaryFiles[index]
    if (file) {
      formData.supplementaryFiles.splice(index, 1)
      const listIdx = supplementaryFileList.value.findIndex((f: any) => f.uid === file.uid)
      if (listIdx > -1) supplementaryFileList.value.splice(listIdx, 1)
    }
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        formData.uploadTime = formatNow()
        formData.uploader = '当前登录用户'
        if (props.orderData) {
          formData.patientName = props.orderData.patientName || ''
          formData.projectName = props.orderData.projectName || ''
          formData.needPrint = props.orderData.needPrint ? 'yes' : 'no'
        }
        formData.hasGermline = 'no'
        formData.hasSupplementary = 'no'
        formData.supplementaryRemark = ''
        formData.reportFile = null
        formData.supplementaryFiles = []
        reportFileList.value = []
        supplementaryFileList.value = []
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      await new Promise((r) => setTimeout(r, 500))
      submitting.value = false
      ElMessage.success('报告上传成功')
      emit('submit', { ...formData })
      dialogVisible.value = false
    })
  }
</script>

<style lang="scss" scoped>
  .upload-info-bar {
    display: flex;
    gap: 32px;
    padding: 12px 16px;
    margin-bottom: 20px;
    background: var(--el-fill-color-light);
    border-radius: 6px;

    .info-item {
      display: flex;
      align-items: center;

      .info-label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin-right: 8px;
        white-space: nowrap;
      }

      .info-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }

  .upload-form {
    :deep(.report-upload-dragger) {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
        padding: 20px;
      }
    }
  }

  // ===== 文件上传区域 =====
  .report-file-section {
    width: 100%;

    .report-upload-dragger {
      width: 100%;
    }
  }

  // ===== 统一上传文件展示项 =====
  .uploaded-file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    margin-top: 12px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    .file-item-name {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: var(--el-text-color-primary);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 12px;
    }

    .file-item-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
  }

  // ===== 补充报告文件列表 =====
  .supplementary-section {
    width: 100%;

    .supplementary-file-list {
      .uploaded-file-item {
        &:first-child {
          margin-top: 12px;
        }
      }
    }
  }

  // ===== 文件预览弹窗 =====
  .file-preview-container {
    .preview-file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;

      .preview-file-detail {
        .preview-file-name {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin: 0 0 2px 0;
        }

        .preview-file-type {
          font-size: 12px;
          color: #999;
          margin: 0;
        }
      }
    }

    .preview-divider {
      border-bottom: 1px solid var(--el-border-color-lighter);
      margin: 12px 0;
    }

    .image-preview-area {
      text-align: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 6px;
      min-height: 300px;

      .preview-image {
        max-height: 500px;
      }
    }

    .doc-editor-area {
      .editor-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: #f5f7fa;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px 4px 0 0;
        flex-wrap: wrap;
      }

      .editor-content {
        .doc-editor-textarea {
          width: 100%;
          min-height: 400px;
          padding: 12px;
          border: 1px solid var(--el-border-color-lighter);
          border-top: none;
          font-family: 'SimSun', '宋体', serif;
          font-size: 14px;
          line-height: 1.8;
          resize: vertical;
          outline: none;

          &:focus {
            border-color: var(--el-color-primary);
          }
        }
      }
    }
  }
</style>
