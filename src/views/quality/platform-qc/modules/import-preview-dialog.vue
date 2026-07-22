<!-- 质控数据导入预览编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="`导入预览 - ${fileName}`"
    width="90%"
    top="3vh"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="sheetNames.length > 1" class="mb-4">
      <span class="text-sm text-gray-500 mr-2">工作表：</span>
      <ElSelect v-model="activeSheet" size="small" style="width: 200px" @change="handleSheetChange">
        <ElOption v-for="name in sheetNames" :key="name" :label="name" :value="name" />
      </ElSelect>
    </div>

    <div class="import-preview-table">
      <ElTable
        :data="tableData"
        border
        stripe
        max-height="50vh"
        style="width: 100%"
      >
        <ElTableColumn
          v-for="(col, colIdx) in columns"
          :key="colIdx"
          :label="col"
          :min-width="120"
          :resizable="true"
        >
          <template #default="{ row, $index }">
            <ElInput
              v-model="row[col]"
              size="small"
              :placeholder="col"
              clearable
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="mt-3 text-sm text-gray-500">
      共 {{ tableData.length }} 行数据，{{ columns.length }} 列，可直接在表格中编辑修改
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploading" @click="handleConfirmUpload">
          确认上传
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import * as XLSX from 'xlsx'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ImportPreviewDialog' })

  interface Props {
    visible: boolean
    file: File | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'confirm', data: any[][]): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const uploading = ref(false)
  const fileName = ref('')
  const sheetNames = ref<string[]>([])
  const activeSheet = ref('')
  const rawWorkbook = ref<any>(null)
  const columns = ref<string[]>([])
  const tableData = ref<Record<string, any>[]>([])

  // 解析 Excel 文件
  const parseFile = (file: File) => {
    fileName.value = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        rawWorkbook.value = workbook
        sheetNames.value = workbook.SheetNames

        if (workbook.SheetNames.length > 0) {
          activeSheet.value = workbook.SheetNames[0]
          loadSheet(workbook.SheetNames[0])
        }
      } catch {
        ElMessage.error('文件解析失败，请检查文件格式')
        dialogVisible.value = false
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // 加载指定工作表
  const loadSheet = (sheetName: string) => {
    if (!rawWorkbook.value) return
    const worksheet = rawWorkbook.value.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 })

    if (jsonData.length === 0) {
      columns.value = []
      tableData.value = []
      return
    }

    // 第一行作为列名
    const headers = jsonData[0] as string[]
    columns.value = headers.map((h, i) => h || `列${i + 1}`)

    // 剩余行作为数据
    const rows = jsonData.slice(1).filter((row: any[]) => row.some((cell: any) => cell !== undefined && cell !== null && cell !== ''))
    tableData.value = rows.map((row: any[]) => {
      const obj: Record<string, any> = {}
      columns.value.forEach((col, idx) => {
        obj[col] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]) : ''
      })
      return obj
    })
  }

  const handleSheetChange = (name: string) => {
    activeSheet.value = name
    loadSheet(name)
  }

  const handleConfirmUpload = () => {
    uploading.value = true
    // 将编辑后的数据转为二维数组
    const exportData = tableData.value.map((row) =>
      columns.value.map((col) => row[col])
    )
    emit('confirm', exportData)
    setTimeout(() => {
      uploading.value = false
    }, 300)
  }

  const handleClose = () => {
    rawWorkbook.value = null
    sheetNames.value = []
    columns.value = []
    tableData.value = []
  }

  // 监听 file 变化
  watch(
    () => props.file,
    (newFile) => {
      if (newFile) {
        parseFile(newFile)
      }
    }
  )
</script>

<style lang="scss" scoped>
  .import-preview-table {
    :deep(.el-table) {
      .el-table__cell {
        padding: 4px 0;
      }

      .el-input {
        .el-input__wrapper {
          box-shadow: none;
          background: transparent;

          &:hover,
          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }
        }
      }
    }
  }
</style>