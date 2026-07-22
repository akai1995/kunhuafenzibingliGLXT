<!-- PCR查看抽屉 -->
<template>
  <ElDrawer
    v-model="drawerVisible"
    title="质控详情"
    size="600px"
    :close-on-click-modal="true"
  >
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="样本编号">{{ rowData?.sampleNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="就诊号">{{ rowData?.visitNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="检测项目">{{ rowData?.projectName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="试剂盒号">{{ rowData?.kitNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本质控">
        <QcStatusTag :status="rowData?.sampleQc" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="核酸质控">
        <QcStatusTag :status="rowData?.nucleicAcidQc" clickable @click="handleQcTagClick('nucleicAcid')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="文库质控">
        <QcStatusTag :status="rowData?.libraryQc" clickable @click="handleQcTagClick('library')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="上机质控">
        <QcStatusTag :status="rowData?.machineQc" clickable @click="handleQcTagClick('machine')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="生信审核" :span="2">
        <QcStatusTag :status="rowData?.bioinfoAudit" clickable @click="handleQcTagClick('bioinfo')" />
      </ElDescriptionsItem>
    </ElDescriptions>

    <template #footer>
      <ElButton @click="drawerVisible = false">关闭</ElButton>
    </template>
  </ElDrawer>

  <!-- 质控详情弹窗（只读模式） -->
  <PcrQcDetailDialog
    v-model:visible="qcDetailVisible"
    :qc-type="activeQcType"
    :form-data="currentRow"
    :readonly="true"
    :project-id="projectId"
  />
</template>

<script setup lang="ts">
  import QcStatusTag from './qc-status-tag.vue'
  import PcrQcDetailDialog from './pcr-qc-detail-dialog.vue'
  import { checkPcrQcSequence } from './qc-sequence'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'PcrViewDrawer' })

  interface Props {
    visible: boolean
    rowData: any
    subPlatform?: 'pcr10' | 'pcr11'
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), { subPlatform: 'pcr10' })
  const emit = defineEmits<Emits>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const projectId = computed(() =>
    props.subPlatform === 'pcr11' ? 'project-pcr11' : 'project-pcr10'
  )

  const qcDetailVisible = ref(false)
  const activeQcType = ref('')
  const currentRow = ref<any>({})

  const handleQcTagClick = (qcType: string) => {
    if (!props.rowData) return
    const { passed, message } = checkPcrQcSequence(qcType, props.rowData)
    if (!passed) {
      ElMessageBox.alert(message!, '提示', { type: 'warning', center: true, confirmButtonText: '确定' })
      return
    }
    currentRow.value = { ...props.rowData }
    activeQcType.value = qcType
    qcDetailVisible.value = true
  }
</script>