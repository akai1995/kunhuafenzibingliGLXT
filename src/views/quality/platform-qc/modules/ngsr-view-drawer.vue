<!-- NGSR质控查看抽屉 -->
<template>
  <ElDrawer v-model="drawerVisible" title="质控详情" size="500px" :close-on-click-modal="true">
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="质控时间">{{ rowData?.qcTime || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="病理号">{{ rowData?.pathologyNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本编号">{{ rowData?.sampleNo || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="患者姓名">{{ rowData?.patientName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="检测项目">{{ rowData?.projectName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="样本质控">
        <QcStatusTag :status="rowData?.sampleQc" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="核酸质控">
        <QcStatusTag
          :status="rowData?.nucleicAcidQc"
          clickable
          @click="openQcDetail('nucleicAcid')"
        />
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="showPreLib" label="预文库质控">
        <QcStatusTag :status="rowData?.preLibQc" clickable @click="openQcDetail('preLib')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="终文库质控">
        <QcStatusTag :status="rowData?.finalLibQc" clickable @click="openQcDetail('finalLib')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="上机质控">
        <QcStatusTag :status="rowData?.seqQc" clickable @click="openQcDetail('seq')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="生信审核">
        <QcStatusTag :status="rowData?.bioAnalysisQc" clickable @click="openQcDetail('bio')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="试剂盒号">{{ rowData?.kitNo || '-' }}</ElDescriptionsItem>
    </ElDescriptions>

    <NgsrQcDetailDialog
      v-model:visible="qcDetailVisible"
      :qc-type="currentQcType"
      :form-data="rowData"
      readonly
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import QcStatusTag from './qc-status-tag.vue'
  import NgsrQcDetailDialog from './ngsr-qc-detail-dialog.vue'

  defineOptions({ name: 'NgsrViewDrawer' })

  interface Props {
    visible: boolean
    rowData: any
    showPreLib?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    showPreLib: true
  })
  const emit = defineEmits<Emits>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const rowData = computed(() => props.rowData)

  const qcDetailVisible = ref(false)
  const currentQcType = ref('')

  const openQcDetail = (qcType: string) => {
    currentQcType.value = qcType
    qcDetailVisible.value = true
  }
</script>
