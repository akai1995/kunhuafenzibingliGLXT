<!-- 批量上传弹窗 - 上传本地文件到系统 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="批量上传"
    width="640px"
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <div class="batch-upload-container">
      <!-- 提示信息 -->
      <div class="batch-upload-info">
        <ArtSvgIcon icon="ri:information-line" class="info-icon" />
        <span>上传本地报告文件，上传后数据将直接提交到报告审核。支持 PDF、Word、JPG、PNG 格式。</span>
      </div>

      <!-- 上传区域 -->
      <div class="upload-area">
        <ElUpload
          ref="uploadRef"
          action="#"
          :auto-upload="false"
          :accept="'.pdf,.doc,.docx,.jpg,.jpeg,.png'"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :show-file-list="false"
          multiple
          drag
          class="batch-upload-dragger"
        >
          <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持多文件上传，单个文件不超过 10MB</div>
          </template>
        </ElUpload>
      </div>

      <!-- 已选文件列表 -->
      <div v-if="fileList.length > 0" class="file-list">
        <div class="file-list-header">
          <span class="file-count">已选择 {{ fileList.length }} 个文件</span>
          <ElButton type="danger" size="small" text @click="handleClearAll">
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-0.5" />
            清空全部
          </ElButton>
        </div>
        <div
          v-for="(file, index) in fileList"
          :key="file.uid"
          class="file-item"
        >
          <span class="file-index">{{ index + 1 }}</span>
          <ArtSvgIcon :icon="getFileIcon(file.name)" class="file-type-icon" />
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <ElButton type="danger" size="small" text @click="handleRemoveFile(index)">
            <ArtSvgIcon icon="ri:close-line" />
          </ElButton>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <ArtSvgIcon icon="ri:file-upload-line" class="empty-icon" />
        <p>暂无文件，请上传本地报告文件</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" :disabled="fileList.length === 0" @click="handleSubmit">
          确认上传
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { UploadFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'BatchUploadDialog' })

  interface UploadFileItem {
    uid: number
    name: string
    size: number
    raw: File
  }

  interface Props {
    visible: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', files: UploadFileItem[]): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const submitting = ref(false)
  const fileList = ref<UploadFileItem[]>([])
  let nextUid = 1

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (file: any) => {
    fileList.value.push({
      uid: nextUid++,
      name: file.name,
      size: file.size || 0,
      raw: file.raw
    })
  }

  const handleFileRemove = () => {
    // Element Plus Upload 的 on-remove，这里不做处理，由自定义列表管理
  }

  const handleRemoveFile = (index: number) => {
    fileList.value.splice(index, 1)
  }

  const handleClearAll = () => {
    fileList.value = []
  }

  const handleClosed = () => {
    fileList.value = []
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        fileList.value = []
        nextUid = 1
      }
    }
  )

  const handleSubmit = async () => {
    if (fileList.value.length === 0) {
      ElMessage.warning('请先上传文件')
      return
    }
    submitting.value = true
    await new Promise((r) => setTimeout(r, 500))
    submitting.value = false
    ElMessage.success(`批量上传成功，共 ${fileList.value.length} 个文件已提交到报告审核`)
    emit('submit', fileList.value)
    dialogVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .batch-upload-container {
    .batch-upload-info {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-7);
      border-radius: 6px;
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.5;

      .info-icon {
        font-size: 16px;
        color: var(--el-color-primary);
        flex-shrink: 0;
        margin-top: 1px;
      }
    }

    .upload-area {
      margin-bottom: 16px;

      .batch-upload-dragger {
        width: 100%;

        :deep(.el-upload-dragger) {
          width: 100%;
          padding: 32px 20px;
        }
      }
    }

    .file-list {
      .file-list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .file-count {
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-secondary);
        }
      }

      .file-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: var(--el-fill-color-lighter);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        transition: background 0.2s;

        & + .file-item {
          margin-top: 6px;
        }

        &:hover {
          background: var(--el-fill-color-light);
        }

        .file-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          background: var(--el-color-primary);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .file-type-icon {
          font-size: 18px;
          color: var(--el-color-primary);
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          font-size: 13px;
          color: var(--el-text-color-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          flex-shrink: 0;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 0;
      color: var(--el-text-color-placeholder);

      .empty-icon {
        font-size: 40px;
        margin-bottom: 8px;
      }

      p {
        font-size: 13px;
        margin: 0;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>