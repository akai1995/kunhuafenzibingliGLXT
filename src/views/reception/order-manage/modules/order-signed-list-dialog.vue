<!-- 已签署文件列表弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="已签署文件列表" width="600px">
    <ElDescriptions :column="2" border class="mb-4">
      <ElDescriptionsItem label="申请编码">{{ orderData?.applyCode || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="患者姓名">{{ orderData?.patientName || '-' }}</ElDescriptionsItem>
    </ElDescriptions>
    <ElTable :data="signedList" border>
      <ElTableColumn prop="fileName" label="文件名称" min-width="250" />
      <ElTableColumn label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="handleViewFile(row)">查看</ElButton>
          <ElButton link type="success" size="small" @click="handleDownload(row)">下载</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 文件预览弹窗 -->
  <ElDialog
    v-model="previewVisible"
    :title="previewFileName"
    width="860px"
    :close-on-click-modal="true"
    top="5vh"
  >
    <div class="file-preview-container">
      <div v-if="isPdf" class="pdf-preview">
        <iframe
          :src="previewUrl"
          class="pdf-iframe"
          frameborder="0"
        />
      </div>
      <div v-else-if="isImage" class="image-preview">
        <img :src="previewUrl" :alt="previewFileName" class="preview-image" />
      </div>
      <div v-else class="unsupported-preview">
        <ElEmpty description="暂不支持预览此文件格式，请下载后查看" />
      </div>
    </div>
    <template #footer>
      <ElButton @click="previewVisible = false">关闭</ElButton>
      <ElButton type="primary" @click="handleDownloadFromPreview">下载</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage, ElEmpty } from 'element-plus'
  defineOptions({ name: 'OrderSignedListDialog' })

  interface Props {
    visible: boolean
    orderData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const signedList = ref([
    { fileName: '知情同意书.pdf' },
    { fileName: '分子病理检测送检申请单.pdf' },
    { fileName: '样本采集确认单.pdf' }
  ])

  const previewVisible = ref(false)
  const previewFileName = ref('')
  const previewUrl = ref('')
  const currentPreviewRow = ref<any>(null)

  const isPdf = computed(() => {
    const name = previewFileName.value.toLowerCase()
    return name.endsWith('.pdf')
  })

  const isImage = computed(() => {
    const name = previewFileName.value.toLowerCase()
    return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif') || name.endsWith('.webp')
  })

  // 生成模拟PDF内容的data URL
  const getMockPdfUrl = (fileName: string) => {
    // 使用一个简单的HTML内容模拟PDF预览（实际项目中应使用真实PDF文件）
    const content = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>${fileName}</title>
      <style>
        body { font-family: 'SimSun', serif; padding: 40px; color: #333; }
        h1 { text-align: center; font-size: 22px; margin-bottom: 30px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .info-table td { border: 1px solid #999; padding: 8px 12px; }
        .info-table .label { background: #f5f7fa; font-weight: 600; width: 120px; text-align: right; }
        .content { line-height: 2; text-indent: 2em; margin-top: 24px; }
        .signature { margin-top: 60px; text-align: right; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 80px; color: rgba(0,0,0,0.04); pointer-events: none; white-space: nowrap; }
      </style>
      </head>
      <body>
        <div class="watermark">昆华医院</div>
        <h1>${fileName.replace('.pdf', '')}</h1>
        <table class="info-table">
          <tr><td class="label">申请编码</td><td>${props.orderData?.applyCode || '-'}</td><td class="label">患者姓名</td><td>${props.orderData?.patientName || '-'}</td></tr>
          <tr><td class="label">性别</td><td>${props.orderData?.gender || '-'}</td><td class="label">年龄</td><td>${props.orderData?.age || '-'}</td></tr>
          <tr><td class="label">检测项目</td><td colspan="3">${props.orderData?.projectName || '-'}</td></tr>
        </table>
        <div class="content">
          <p>本文件为${fileName.replace('.pdf', '')}，由昆华医院分子病理科出具。</p>
          <p>本文件已通过电子签名系统签署，具有法律效力。任何未经授权的修改都将导致文件失效。</p>
          <p>签署日期：${new Date().toLocaleDateString('zh-CN')}</p>
        </div>
        <div class="signature">
          <p>签署人：${props.orderData?.patientName || '患者'}</p>
          <p>日期：${new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </body>
      </html>
    `
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(content)
  }

  const handleViewFile = (row: any) => {
    currentPreviewRow.value = row
    previewFileName.value = row.fileName
    previewUrl.value = getMockPdfUrl(row.fileName)
    previewVisible.value = true
  }

  const handleDownload = (row: any) => {
    // 创建下载链接
    const url = getMockPdfUrl(row.fileName)
    const link = document.createElement('a')
    link.href = url
    link.download = row.fileName
    link.click()
    ElMessage.success(`下载文件：${row.fileName}`)
  }

  const handleDownloadFromPreview = () => {
    if (currentPreviewRow.value) {
      handleDownload(currentPreviewRow.value)
    }
  }
</script>

<style lang="scss" scoped>
  .file-preview-container {
    .pdf-preview {
      height: 70vh;
    }
    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
    }
    .image-preview {
      text-align: center;
      .preview-image {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
      }
    }
    .unsupported-preview {
      padding: 40px 0;
    }
  }
</style>
