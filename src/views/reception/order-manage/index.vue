<!-- 接诊单管理 -->
<template>
  <div class="order-manage art-full-height">
    <!-- 查询条件 -->
    <OrderSearchForm @search="handleSearch" @reset="handleResetSearch" />

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader
        :loading="loading"
        @refresh="refreshData"
        :showColumnSetting="true"
        v-model:columns="columns"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新增
            </ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              批量删除
            </ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handleBatchExport"
            >
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              批量导出
            </ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handlePrintRecord"
            >
              <ArtSvgIcon icon="ri:printer-line" class="mr-1" />
              操作记录打印
            </ElButton>
            <ElButton
              :disabled="selectedRows.length === 0"
              @click="handleBatchDownload"
            >
              <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />
              批量下载
            </ElButton>
            <ElButton
              :disabled="!canReportWriting"
              @click="handleToolbarReportWriting"
            >
              <ArtSvgIcon icon="ri:file-text-line" class="mr-1" />
              报告书写
            </ElButton>
            <ElButton
              :disabled="!canReportUpload"
              @click="handleToolbarReportUpload"
            >
              <ArtSvgIcon icon="ri:upload-2-line" class="mr-1" />
              报告上传
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #slicePrint="{ row }">
          <ElTag :type="row.slicePrint === '已打印' ? 'success' : 'info'" size="small">
            {{ row.slicePrint }}
          </ElTag>
        </template>
        <template #paymentStatus="{ row }">
          <ElTag :type="paymentStatusType(row.paymentStatus)" size="small">
            {{ row.paymentStatus }}
          </ElTag>
        </template>
        <template #qcStatus="{ row }">
          <ElTag :type="qcStatusType(row.qcStatus)" size="small">
            {{ row.qcStatus }}
          </ElTag>
        </template>
        <template #reportStatus="{ row }">
          <ElTag :type="reportStatusType(row.reportStatus)" size="small">
            {{ row.reportStatus }}
          </ElTag>
        </template>
        <template #copyStatus="{ row }">
          <ElTag :type="row.copyStatus === '已复制' ? 'success' : 'info'" size="small">
            {{ row.copyStatus }}
          </ElTag>
        </template>
        
        <template #tags="{ row }">
          <ElSpace v-if="row.tags && row.tags.length" :size="4" wrap>
            <ElTag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              effect="plain"
              round
            >
              {{ tag }}
            </ElTag>
          </ElSpace>
          <span v-else class="text-secondary">-</span>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新增/编辑/复制接诊单抽屉 -->
    <OrderAddDrawer
      v-model:visible="addDrawerVisible"
      :mode="drawerMode"
      :edit-data="currentRow"
      @submit="handleDrawerSubmit"
    />

    <!-- 查看接诊单详情抽屉 -->
    <OrderViewDrawer
      v-model:visible="viewDrawerVisible"
      :detail-data="currentRow"
      @edit="handleViewEdit"
      @copy="handleViewCopy"
    />

    <!-- 报告书写弹窗 -->
    <OrderReportDialog
      v-model:visible="reportDialogVisible"
      :order-data="selectedRows[0]"
      @save="handleReportSave"
      @submit="handleReportSubmit"
      @draft="handleReportDraft"
    />

    <!-- 日志记录弹窗 -->
    <OrderLogDialog v-model:visible="logDialogVisible" :order-data="currentRow" />

    <!-- 通用操作弹窗 -->
    <OrderActionDialog
      v-model:visible="actionDialogVisible"
      :action-type="currentActionType"
      :order-data="currentRow"
      @confirm="handleActionConfirm"
    />

    <!-- 已签署文件列表弹窗 -->
    <OrderSignedListDialog v-model:visible="signedListDialogVisible" :order-data="currentRow" />

    <!-- 报告上传弹窗 -->
    <OrderUploadDialog
      v-model:visible="uploadDialogVisible"
      :order-data="selectedRows[0]"
      @submit="handleUploadSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag, ElMessageBox, ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import OrderAddDrawer from './modules/order-add-drawer.vue'
  import OrderViewDrawer from './modules/order-view-drawer.vue'
  import OrderSearchForm from './modules/order-search-form.vue'
  import OrderReportDialog from './modules/order-report-dialog.vue'
  import OrderLogDialog from './modules/order-log-dialog.vue'
  import OrderActionDialog from './modules/order-action-dialog.vue'
  import OrderSignedListDialog from './modules/order-signed-list-dialog.vue'
  import OrderUploadDialog from './modules/order-upload-dialog.vue'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'OrderManage' })

  const sampleFlowStore = useSampleFlowStore()

  interface OrderItem {
    id: number
    applyTime: string
    applyCode: string
    hospitalNo: string
    outpatientNo: string
    patientName: string
    gender: string
    age: string
    idCard: string
    sampleType: string
    pathologyNo: string
    projectName: string
    slicePrint: string
    paymentStatus: string
    qcStatus: string
    reportStatus: string
    auditStatus: string
    copyStatus: string
    // 送检信息扩展
    patientType?: string
    hospital?: string
    department?: string
    doctor?: string
    discountType?: string
    projectPrice?: number
    applyDate?: string
    handler?: string
    remark?: string
    // 个人信息扩展
    nativePlace?: string
    occupation?: string
    ethnicity?: string
    phone?: string
    isFocus?: boolean
    needPrint?: boolean
    tags?: string[]
    // 送检样本及诊断信息扩展
    cancerType?: string
    sampleSource?: string
    pathologyDiagnosis?: string
    pathologyDoctor?: string
    sampleCode?: string
    sampleCollectDate?: string
    sampleReceiveDate?: string
    isSelfSample?: string
    sourceHospital?: string
    isReturn?: string
    sliceCount?: string
    tubeCount?: string
    mlCount?: string
    bloodDrawTime?: string
    // 个人史扩展
    isFirstTreatment?: string
    smokingHistory?: string
    smokingYears?: string
    drinkingHistory?: string
    coalExposure?: string
    previousCancer?: string
    previousCancerDetail?: string
    recentChemo?: string
    boneMarrowTransplant?: string
    recentTransfusion?: string
    targetedTherapy?: string
    targetedMedDuration?: string
    targetedStopDuration?: string
    targetedDrugName?: string
    chronicDisease?: string
    chronicDiseaseName?: string
    infectiousDisease?: string
    familyCancer?: string
    familyRelation?: string
    familyCancerType?: string
    familyMemberName?: string
    familyGeneTest?: string
    // 样本信息扩展
    tissueSamples?: string[]
    liquidSamples?: string[]
    bloodPaired?: string
    malignantEffusion?: string
    solidSamples?: string[]
    solidOtherDetail?: string
    hasBackup?: string
    backupTypes?: string
    hasControl?: string
    controlTissueSamples?: string[]
    controlLiquidSamples?: string[]
    controlBloodPaired?: string
    controlMalignantEffusion?: string
    controlSolidSamples?: string[]
    controlSolidOtherDetail?: string
    controlHasBackup?: string
    controlBackupTypes?: string
    // 家系样本扩展
    hasFamilyInfo?: string
    familyMembers?: any[]
    // 申请单质控扩展
    reviewResult?: string
    reviewer?: string
    reviewTime?: string
    qcResult?: string
    qcRemark?: string
    isRevised?: string
    reviser?: string
  }

  // Mock data - 12条固定的接诊单数据
  // 流程规则：接诊单提交后生成条形码(BC+年份+4位序号)和样本编号(S+年月+4位序号)
  const mockData: OrderItem[] = [
    // ===== 本院接诊单（已提交，已缴费，流程推进中）=====
    {
      id: 1,
      applyTime: '2026-07-01 08:30:00',
      applyCode: 'AP2026070001',
      hospitalNo: 'ZY100001',
      outpatientNo: 'MZ200001',
      patientName: '张伟',
      gender: '男',
      age: '45岁',
      idCard: '530102198103156734',
      sampleType: '组织样本',
      pathologyNo: 'BL20261001',
      projectName: 'EGFR基因突变检测',
      slicePrint: '已打印',
      paymentStatus: '已缴费',
      qcStatus: '合格',
      reportStatus: '已上传',
      auditStatus: 'level1Passed',
      copyStatus: '已复制',
      
      patientType: '住院患者',
      hospital: '昆华医院',
      department: '肿瘤科',
      doctor: '张医生',
      discountType: '无',
      projectPrice: 2800,
      applyDate: '2026-07-01',
      handler: '系统管理员',
      remark: '患者初次就诊，肺癌疑似',
      nativePlace: '云南昆明',
      occupation: '企业职员',
      ethnicity: '汉族',
      phone: '13888101234',
      isFocus: true,
      needPrint: true,
      tags: ['VIP'],
      cancerType: '肺癌',
      sampleSource: '组织样本',
      pathologyDiagnosis: '肺腺癌',
      pathologyDoctor: '李医生',
      sampleCode: 'SP2026070001',
      sampleCollectDate: '2026-06-30',
      sampleReceiveDate: '2026-07-01',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '5',
      tubeCount: '2',
      mlCount: '10',
      bloodDrawTime: '2026-06-30 08:00',
      isFirstTreatment: 'no',
      smokingHistory: 'yes',
      smokingYears: '15',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'no',
      familyRelation: '',
      familyCancerType: '',
      familyMemberName: '',
      familyGeneTest: '',
      tissueSamples: ['paraffin'],
      liquidSamples: ['blood'],
      bloodPaired: 'yes',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员A',
      reviewTime: '2026-07-01 10:00',
      qcResult: 'pass',
      qcRemark: '申请单填写完整，样本符合要求',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 2,
      applyTime: '2026-07-01 09:00:00',
      applyCode: 'AP2026070002',
      hospitalNo: 'ZY100002',
      outpatientNo: '-',
      patientName: '李娜',
      gender: '女',
      age: '52岁',
      idCard: '530103197409128765',
      sampleType: '血液样本',
      pathologyNo: 'BL20261002',
      projectName: 'HER2基因扩增检测',
      slicePrint: '未打印',
      paymentStatus: '已缴费',
      qcStatus: '质控中',
      reportStatus: '已书写',
      auditStatus: 'level1Passed',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '昆华医院',
      department: '乳腺外科',
      doctor: '王医生',
      discountType: '无',
      projectPrice: 3200,
      applyDate: '2026-07-01',
      handler: '系统管理员',
      remark: '乳腺癌术后复查',
      nativePlace: '云南大理',
      occupation: '教师',
      ethnicity: '白族',
      phone: '13888105678',
      isFocus: false,
      needPrint: false,
      tags: ['复诊'],
      cancerType: '乳腺癌',
      sampleSource: '血液样本',
      pathologyDiagnosis: '乳腺浸润性导管癌',
      pathologyDoctor: '赵医生',
      sampleCode: 'SP2026070002',
      sampleCollectDate: '2026-06-30',
      sampleReceiveDate: '2026-07-01',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '0',
      tubeCount: '3',
      mlCount: '15',
      bloodDrawTime: '2026-06-30 09:00',
      isFirstTreatment: 'no',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'yes',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'yes',
      targetedMedDuration: '3',
      targetedStopDuration: '1',
      targetedDrugName: '曲妥珠单抗',
      chronicDisease: 'yes',
      chronicDiseaseName: '糖尿病',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '母亲',
      familyCancerType: '乳腺癌',
      familyMemberName: '赵秀英',
      familyGeneTest: 'BRCA1突变阳性',
      tissueSamples: [],
      liquidSamples: ['blood'],
      bloodPaired: 'no',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员B',
      reviewTime: '2026-07-01 11:00',
      qcResult: 'pass',
      qcRemark: '血液样本合格',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 3,
      applyTime: '2026-07-01 09:30:00',
      applyCode: 'AP2026070003',
      hospitalNo: 'ZY100003',
      outpatientNo: 'MZ200003',
      patientName: '王建国',
      gender: '男',
      age: '63岁',
      idCard: '53010219630515213X',
      sampleType: '组织样本',
      pathologyNo: 'BL20261003',
      projectName: 'KRAS基因突变检测',
      slicePrint: '已打印',
      paymentStatus: '已缴费',
      qcStatus: '合格',
      reportStatus: '已书写',
      auditStatus: 'pending',
      copyStatus: '已复制',
      
      patientType: '门诊患者',
      hospital: '昆华医院',
      department: '消化内科',
      doctor: '陈医生',
      discountType: '医保',
      projectPrice: 2400,
      applyDate: '2026-07-01',
      handler: '系统管理员',
      remark: '结肠癌术后随访',
      nativePlace: '云南曲靖',
      occupation: '退休工人',
      ethnicity: '汉族',
      phone: '13888107890',
      isFocus: false,
      needPrint: true,
      tags: ['高龄'],
      cancerType: '结肠癌',
      sampleSource: '组织样本',
      pathologyDiagnosis: '结肠腺癌',
      pathologyDoctor: '刘医生',
      sampleCode: 'SP2026070003',
      sampleCollectDate: '2026-06-29',
      sampleReceiveDate: '2026-07-01',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '3',
      tubeCount: '1',
      mlCount: '5',
      bloodDrawTime: '2026-06-29 10:00',
      isFirstTreatment: 'no',
      smokingHistory: 'yes',
      smokingYears: '30',
      drinkingHistory: 'yes',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'yes',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'yes',
      chronicDiseaseName: '高血压',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '兄长',
      familyCancerType: '结肠癌',
      familyMemberName: '王建军',
      familyGeneTest: '',
      tissueSamples: ['paraffin'],
      liquidSamples: [],
      bloodPaired: 'no',
      malignantEffusion: '',
      solidSamples: ['stool'],
      solidOtherDetail: '',
      hasBackup: 'no',
      backupTypes: [],
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员A',
      reviewTime: '2026-07-01 13:00',
      qcResult: 'pass',
      qcRemark: '组织样本充足',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 4,
      applyTime: '2026-07-01 10:00:00',
      applyCode: 'AP2026070004',
      hospitalNo: 'ZY100004',
      outpatientNo: '-',
      patientName: '赵敏',
      gender: '女',
      age: '38岁',
      idCard: '530104198812039876',
      sampleType: '血液样本',
      pathologyNo: 'BL20261004',
      projectName: 'BRAF V600E突变检测',
      slicePrint: '未打印',
      paymentStatus: '已缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '昆华医院',
      department: '内分泌科',
      doctor: '杨医生',
      discountType: '无',
      projectPrice: 1800,
      applyDate: '2026-07-01',
      handler: '系统管理员',
      remark: '甲状腺结节待查',
      nativePlace: '云南玉溪',
      occupation: '公务员',
      ethnicity: '汉族',
      phone: '13888103456',
      isFocus: true,
      needPrint: false,
      tags: ['急诊'],
      cancerType: '甲状腺癌',
      sampleSource: '血液样本',
      pathologyDiagnosis: '甲状腺乳头状癌',
      pathologyDoctor: '周医生',
      sampleCode: 'SP2026070004',
      sampleCollectDate: '2026-07-01',
      sampleReceiveDate: '2026-07-01',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '0',
      tubeCount: '2',
      mlCount: '10',
      bloodDrawTime: '2026-07-01 07:30',
      isFirstTreatment: 'yes',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'no',
      familyRelation: '',
      familyCancerType: '',
      familyMemberName: '',
      familyGeneTest: '',
      tissueSamples: [],
      liquidSamples: ['blood'],
      bloodPaired: 'no',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员B',
      reviewTime: '2026-07-01 14:00',
      qcResult: 'pass',
      qcRemark: '首次就诊，信息完整',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 5,
      applyTime: '2026-07-02 08:00:00',
      applyCode: 'AP2026070005',
      hospitalNo: 'ZY100005',
      outpatientNo: 'MZ200005',
      patientName: '陈晓东',
      gender: '男',
      age: '55岁',
      idCard: '530111197106123456',
      sampleType: '组织样本',
      pathologyNo: 'BL20261005',
      projectName: 'ALK融合基因检测',
      slicePrint: '已打印',
      paymentStatus: '已缴费',
      qcStatus: '质控中',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '昆华医院',
      department: '肿瘤科',
      doctor: '张医生',
      discountType: '无',
      projectPrice: 2600,
      applyDate: '2026-07-02',
      handler: '系统管理员',
      remark: '胃癌术后复发监测',
      nativePlace: '云南红河',
      occupation: '农民',
      ethnicity: '彝族',
      phone: '13888104567',
      isFocus: false,
      needPrint: true,
      tags: ['复诊'],
      cancerType: '胃癌',
      sampleSource: '组织样本',
      pathologyDiagnosis: '胃腺癌',
      pathologyDoctor: '李医生',
      sampleCode: 'SP2026070005',
      sampleCollectDate: '2026-07-01',
      sampleReceiveDate: '2026-07-02',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '4',
      tubeCount: '1',
      mlCount: '5',
      bloodDrawTime: '2026-07-01 08:00',
      isFirstTreatment: 'no',
      smokingHistory: 'yes',
      smokingYears: '20',
      drinkingHistory: 'yes',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'yes',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '父亲',
      familyCancerType: '胃癌',
      familyMemberName: '陈德明',
      familyGeneTest: '',
      tissueSamples: ['paraffin', 'fresh_tissue'],
      liquidSamples: ['blood'],
      bloodPaired: 'yes',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员A',
      reviewTime: '2026-07-02 10:00',
      qcResult: 'pass',
      qcRemark: '样本质量合格',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 6,
      applyTime: '2026-07-02 09:00:00',
      applyCode: 'AP2026070006',
      hospitalNo: 'ZY100006',
      outpatientNo: '-',
      patientName: '刘芳',
      gender: '女',
      age: '47岁',
      idCard: '530102197907081234',
      sampleType: '组织样本',
      pathologyNo: 'BL20261006',
      projectName: 'ROS1融合基因检测',
      slicePrint: '未打印',
      paymentStatus: '已缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '昆华医院',
      department: '妇科',
      doctor: '王医生',
      discountType: '无',
      projectPrice: 2600,
      applyDate: '2026-07-02',
      handler: '系统管理员',
      remark: '卵巢癌初诊',
      nativePlace: '云南楚雄',
      occupation: '会计',
      ethnicity: '汉族',
      phone: '13888108901',
      isFocus: true,
      needPrint: false,
      tags: [],
      cancerType: '卵巢癌',
      sampleSource: '组织样本',
      pathologyDiagnosis: '卵巢浆液性癌',
      pathologyDoctor: '赵医生',
      sampleCode: 'SP2026070006',
      sampleCollectDate: '2026-07-01',
      sampleReceiveDate: '2026-07-02',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '6',
      tubeCount: '2',
      mlCount: '10',
      bloodDrawTime: '2026-07-01 09:00',
      isFirstTreatment: 'yes',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '姐姐',
      familyCancerType: '卵巢癌',
      familyMemberName: '刘芬',
      familyGeneTest: 'BRCA2突变',
      tissueSamples: ['paraffin'],
      liquidSamples: ['blood'],
      bloodPaired: 'yes',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'yes',
      controlTissueSamples: ['paraffin'],
      controlLiquidSamples: ['blood'],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员B',
      reviewTime: '2026-07-02 11:00',
      qcResult: 'pass',
      qcRemark: '对照片已采集',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 7,
      applyTime: '2026-07-02 10:00:00',
      applyCode: 'AP2026070007',
      hospitalNo: 'ZY100007',
      outpatientNo: 'MZ200007',
      patientName: '周强',
      gender: '男',
      age: '60岁',
      idCard: '530103196607152345',
      sampleType: '血液样本',
      pathologyNo: 'BL20261007',
      projectName: 'NGS多基因联合检测',
      slicePrint: '未打印',
      paymentStatus: '已缴费',
      qcStatus: '合格',
      reportStatus: '已书写',
      auditStatus: 'level1Passed',
      copyStatus: '已复制',
      
      patientType: '门诊患者',
      hospital: '昆华医院',
      department: '泌尿外科',
      doctor: '陈医生',
      discountType: '医保',
      projectPrice: 6800,
      applyDate: '2026-07-02',
      handler: '系统管理员',
      remark: '前列腺癌综合检测',
      nativePlace: '云南昭通',
      occupation: '退休教师',
      ethnicity: '汉族',
      phone: '13888106789',
      isFocus: false,
      needPrint: true,
      tags: ['高龄'],
      cancerType: '前列腺癌',
      sampleSource: '血液样本',
      pathologyDiagnosis: '前列腺腺癌',
      pathologyDoctor: '刘医生',
      sampleCode: 'SP2026070007',
      sampleCollectDate: '2026-07-01',
      sampleReceiveDate: '2026-07-02',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '0',
      tubeCount: '3',
      mlCount: '15',
      bloodDrawTime: '2026-07-01 14:00',
      isFirstTreatment: 'no',
      smokingHistory: 'yes',
      smokingYears: '25',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'yes',
      targetedMedDuration: '6',
      targetedStopDuration: '2',
      targetedDrugName: '阿比特龙',
      chronicDisease: 'yes',
      chronicDiseaseName: '高血压、糖尿病',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '父亲',
      familyCancerType: '前列腺癌',
      familyMemberName: '周德富',
      familyGeneTest: '',
      tissueSamples: [],
      liquidSamples: ['blood'],
      bloodPaired: 'no',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员A',
      reviewTime: '2026-07-02 14:00',
      qcResult: 'pass',
      qcRemark: '综合检测项目，样本量充足',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 8,
      applyTime: '2026-07-03 08:30:00',
      applyCode: 'AP2026070008',
      hospitalNo: 'ZY100008',
      outpatientNo: '-',
      patientName: '吴秀英',
      gender: '女',
      age: '42岁',
      idCard: '530104198405056789',
      sampleType: '组织样本',
      pathologyNo: 'BL20261008',
      projectName: 'MET外显子14跳跃检测',
      slicePrint: '已打印',
      paymentStatus: '已缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '昆华医院',
      department: '血液科',
      doctor: '杨医生',
      discountType: '无',
      projectPrice: 2200,
      applyDate: '2026-07-03',
      handler: '系统管理员',
      remark: '淋巴瘤分型检测',
      nativePlace: '云南普洱',
      occupation: '护士',
      ethnicity: '傣族',
      phone: '13888102345',
      isFocus: false,
      needPrint: false,
      tags: [],
      cancerType: '淋巴瘤',
      sampleSource: '组织样本',
      pathologyDiagnosis: '弥漫大B细胞淋巴瘤',
      pathologyDoctor: '周医生',
      sampleCode: 'SP2026070008',
      sampleCollectDate: '2026-07-02',
      sampleReceiveDate: '2026-07-03',
      isSelfSample: 'yes',
      sourceHospital: '',
      isReturn: 'no',
      sliceCount: '8',
      tubeCount: '3',
      mlCount: '15',
      bloodDrawTime: '2026-07-02 08:00',
      isFirstTreatment: 'yes',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'no',
      familyRelation: '',
      familyCancerType: '',
      familyMemberName: '',
      familyGeneTest: '',
      tissueSamples: ['paraffin', 'fresh_tissue'],
      liquidSamples: ['blood'],
      bloodPaired: 'yes',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: 'pass',
      reviewer: '质控员B',
      reviewTime: '2026-07-03 10:00',
      qcResult: 'pass',
      qcRemark: '组织样本丰富',
      isRevised: 'no',
      reviser: ''
    },
    // ===== 外院接诊单（待核收）=====
    {
      id: 9,
      applyTime: '2026-07-03 09:00:00',
      applyCode: 'AP2026070009',
      hospitalNo: 'ZY100009',
      outpatientNo: 'MZ200009',
      patientName: '郑浩',
      gender: '男',
      age: '50岁',
      idCard: '530102197608151234',
      sampleType: '组织样本',
      pathologyNo: 'BL20261009',
      projectName: 'PIK3CA突变检测',
      slicePrint: '未打印',
      paymentStatus: '未缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '门诊患者',
      hospital: '第一人民医院',
      department: '皮肤科',
      doctor: '刘医生',
      discountType: '无',
      projectPrice: 2000,
      applyDate: '2026-07-03',
      handler: '系统管理员',
      remark: '黑色素瘤外院送检',
      nativePlace: '云南保山',
      occupation: '个体户',
      ethnicity: '汉族',
      phone: '13888109012',
      isFocus: false,
      needPrint: false,
      tags: ['外地'],
      cancerType: '黑色素瘤',
      sampleSource: '组织样本',
      pathologyDiagnosis: '恶性黑色素瘤',
      pathologyDoctor: '外院医生',
      sampleCode: 'SP2026070009',
      sampleCollectDate: '2026-07-01',
      sampleReceiveDate: '2026-07-03',
      isSelfSample: 'no',
      sourceHospital: '第一人民医院',
      isReturn: 'no',
      sliceCount: '3',
      tubeCount: '1',
      mlCount: '5',
      bloodDrawTime: '2026-07-01 10:00',
      isFirstTreatment: 'no',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'no',
      familyRelation: '',
      familyCancerType: '',
      familyMemberName: '',
      familyGeneTest: '',
      tissueSamples: ['paraffin'],
      liquidSamples: [],
      bloodPaired: 'no',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'no',
      backupTypes: [],
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: '',
      reviewer: '',
      reviewTime: '',
      qcResult: '',
      qcRemark: '',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 10,
      applyTime: '2026-07-03 10:00:00',
      applyCode: 'AP2026070010',
      hospitalNo: 'ZY100010',
      outpatientNo: '-',
      patientName: '孙丽华',
      gender: '女',
      age: '58岁',
      idCard: '530103196805069876',
      sampleType: '血液样本',
      pathologyNo: 'BL20261010',
      projectName: 'TP53基因突变检测',
      slicePrint: '未打印',
      paymentStatus: '未缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '肿瘤医院',
      department: '消化内科',
      doctor: '外院医生',
      discountType: '无',
      projectPrice: 1800,
      applyDate: '2026-07-03',
      handler: '系统管理员',
      remark: '胰腺癌外院送检',
      nativePlace: '云南文山',
      occupation: '退休职工',
      ethnicity: '壮族',
      phone: '13888103478',
      isFocus: true,
      needPrint: false,
      tags: ['高龄', '外地'],
      cancerType: '胰腺癌',
      sampleSource: '血液样本',
      pathologyDiagnosis: '胰腺导管腺癌',
      pathologyDoctor: '外院医生',
      sampleCode: 'SP2026070010',
      sampleCollectDate: '2026-07-02',
      sampleReceiveDate: '2026-07-03',
      isSelfSample: 'no',
      sourceHospital: '肿瘤医院',
      isReturn: 'no',
      sliceCount: '0',
      tubeCount: '2',
      mlCount: '10',
      bloodDrawTime: '2026-07-02 08:00',
      isFirstTreatment: 'no',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'yes',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'yes',
      chronicDiseaseName: '冠心病',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '母亲',
      familyCancerType: '胰腺癌',
      familyMemberName: '杨桂英',
      familyGeneTest: '',
      tissueSamples: [],
      liquidSamples: ['blood'],
      bloodPaired: 'no',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'no',
      backupTypes: [],
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: '',
      reviewer: '',
      reviewTime: '',
      qcResult: '',
      qcRemark: '',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 11,
      applyTime: '2026-07-03 11:00:00',
      applyCode: 'AP2026070011',
      hospitalNo: 'ZY100011',
      outpatientNo: 'MZ200011',
      patientName: '马超',
      gender: '男',
      age: '39岁',
      idCard: '530102198703151234',
      sampleType: '组织样本',
      pathologyNo: 'BL20261011',
      projectName: 'EGFR基因突变检测',
      slicePrint: '未打印',
      paymentStatus: '未缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '门诊患者',
      hospital: '中心医院',
      department: '神经外科',
      doctor: '外院医生',
      discountType: '无',
      projectPrice: 2800,
      applyDate: '2026-07-03',
      handler: '系统管理员',
      remark: '脑胶质瘤外院送检',
      nativePlace: '云南临沧',
      occupation: '工程师',
      ethnicity: '汉族',
      phone: '13888105678',
      isFocus: false,
      needPrint: false,
      tags: ['外地'],
      cancerType: '脑胶质瘤',
      sampleSource: '组织样本',
      pathologyDiagnosis: '胶质母细胞瘤',
      pathologyDoctor: '外院医生',
      sampleCode: 'SP2026070011',
      sampleCollectDate: '2026-07-01',
      sampleReceiveDate: '2026-07-03',
      isSelfSample: 'no',
      sourceHospital: '中心医院',
      isReturn: 'no',
      sliceCount: '5',
      tubeCount: '2',
      mlCount: '10',
      bloodDrawTime: '2026-07-01 09:00',
      isFirstTreatment: 'yes',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'no',
      chronicDiseaseName: '',
      infectiousDisease: '无',
      familyCancer: 'no',
      familyRelation: '',
      familyCancerType: '',
      familyMemberName: '',
      familyGeneTest: '',
      tissueSamples: ['paraffin', 'fresh_tissue'],
      liquidSamples: ['blood'],
      bloodPaired: 'yes',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: '',
      reviewer: '',
      reviewTime: '',
      qcResult: '',
      qcRemark: '',
      isRevised: 'no',
      reviser: ''
    },
    {
      id: 12,
      applyTime: '2026-07-03 14:00:00',
      applyCode: 'AP2026070012',
      hospitalNo: 'ZY100012',
      outpatientNo: '-',
      patientName: '黄娟',
      gender: '女',
      age: '65岁',
      idCard: '530103196105157890',
      sampleType: '组织样本',
      pathologyNo: 'BL20261012',
      projectName: 'NGS多基因联合检测',
      slicePrint: '未打印',
      paymentStatus: '未缴费',
      qcStatus: '未质控',
      reportStatus: '未书写',
      auditStatus: 'pending',
      copyStatus: '未复制',
      
      patientType: '住院患者',
      hospital: '肿瘤医院',
      department: '妇科',
      doctor: '外院医生',
      discountType: '无',
      projectPrice: 6800,
      applyDate: '2026-07-03',
      handler: '系统管理员',
      remark: '子宫内膜癌外院送检，肿瘤家族史',
      nativePlace: '云南德宏',
      occupation: '退休医生',
      ethnicity: '汉族',
      phone: '13888107890',
      isFocus: true,
      needPrint: false,
      tags: ['高龄', '外地', '临床试验'],
      cancerType: '子宫内膜癌',
      sampleSource: '组织样本',
      pathologyDiagnosis: '子宫内膜样腺癌',
      pathologyDoctor: '外院医生',
      sampleCode: 'SP2026070012',
      sampleCollectDate: '2026-07-02',
      sampleReceiveDate: '2026-07-03',
      isSelfSample: 'no',
      sourceHospital: '肿瘤医院',
      isReturn: 'no',
      sliceCount: '4',
      tubeCount: '1',
      mlCount: '5',
      bloodDrawTime: '2026-07-02 10:00',
      isFirstTreatment: 'no',
      smokingHistory: 'no',
      smokingYears: '',
      drinkingHistory: 'no',
      coalExposure: 'no',
      previousCancer: 'no',
      previousCancerDetail: '',
      recentChemo: 'no',
      boneMarrowTransplant: 'no',
      recentTransfusion: 'no',
      targetedTherapy: 'no',
      targetedMedDuration: '',
      targetedStopDuration: '',
      targetedDrugName: '',
      chronicDisease: 'yes',
      chronicDiseaseName: '高血压、糖尿病',
      infectiousDisease: '无',
      familyCancer: 'yes',
      familyRelation: '母亲',
      familyCancerType: '子宫内膜癌',
      familyMemberName: '林秀珍',
      familyGeneTest: 'MLH1突变',
      tissueSamples: ['paraffin'],
      liquidSamples: ['blood'],
      bloodPaired: 'yes',
      malignantEffusion: '',
      solidSamples: [],
      solidOtherDetail: '',
      hasBackup: 'yes',
      backupTypes: 'blood',
      hasControl: 'no',
      controlTissueSamples: [],
      controlLiquidSamples: [],
      controlBloodPaired: 'no',
      controlMalignantEffusion: '',
      controlSolidSamples: [],
      controlSolidOtherDetail: '',
      controlHasBackup: 'no',
      controlBackupTypes: [],
      hasFamilyInfo: 'no',
      familyMembers: [],
      reviewResult: '',
      reviewer: '',
      reviewTime: '',
      qcResult: '',
      qcRemark: '',
      isRevised: 'no',
      reviser: ''
    }
  ]

  const loading = ref(false)
  const data = ref<OrderItem[]>([])
  const selectedRows = ref<OrderItem[]>([])
  const searchParams = ref<any>({})

  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  // 根据查询条件过滤数据
  const getFilteredData = () => {
    const p = searchParams.value

    // 将流转Store中的样本转换为OrderItem格式
    const flowOrderItems: OrderItem[] = sampleFlowStore.flowSamples.map((fs) => {
      const reportStatusMap: Record<string, string> = {
        '': '未书写',
        pending: '未书写',
        level1Passed: '已上传',
        passed: '已上传',
        rejected: '已书写'
      }
      const auditStatusMap: Record<string, string> = {
        '': 'pending',
        pending: 'pending',
        level1Passed: 'level1Passed',
        passed: 'passed',
        rejected: 'rejected'
      }
      return {
        id: fs.sourceOrderId,
        applyTime: fs.applyTime || fs.orderSubmitTime,
        applyCode: fs.applyCode,
        hospitalNo: '-',
        outpatientNo: '-',
        patientName: fs.patientName,
        gender: fs.gender,
        age: fs.age,
        idCard: fs.idCard,
        sampleType: fs.sampleType,
        pathologyNo: fs.pathologyNo,
        projectName: fs.projectName,
        slicePrint: '未打印',
        paymentStatus: '已缴费',
        qcStatus: fs.flowStage === 'qc_platform_done' ? '合格' : '质控中',
        reportStatus: reportStatusMap[fs.reportAuditStatus] || '未书写',
        auditStatus: auditStatusMap[fs.reportAuditStatus] || 'pending',
        copyStatus: '未复制',
        patientType: fs.patientType,
        hospital: fs.hospital,
        department: fs.department || '-',
        doctor: fs.doctor || '-',
        isSelfSample: fs.isSelfSample,
        sourceHospital: fs.sourceHospital,
        sampleCode: fs.sampleNo
      } as OrderItem
    })

    // 合并mockData和流转数据，按sampleCode（样本编号）去重
    const allData = [...mockData]
    const existingSampleCodes = new Set(allData.map((item) => item.sampleCode).filter(Boolean))
    for (const flowItem of flowOrderItems) {
      if (flowItem.sampleCode && !existingSampleCodes.has(flowItem.sampleCode)) {
        allData.push(flowItem)
        existingSampleCodes.add(flowItem.sampleCode)
      }
    }

    return allData.filter((item) => {
      if (p.patientName && !item.patientName.includes(p.patientName)) return false
      if (p.hospitalNo && !item.hospitalNo.includes(p.hospitalNo)) return false
      if (p.idCard && !item.idCard.includes(p.idCard)) return false
      if (p.projectName && !item.projectName.includes(p.projectName)) return false
      if (p.paymentStatus && item.paymentStatus !== p.paymentStatus) return false
      if (p.dateRange && p.dateRange.length === 2) {
        const itemDate = item.applyTime.slice(0, 10)
        if (itemDate < p.dateRange[0] || itemDate > p.dateRange[1]) return false
      }
      return true
    })
  }

  const fetchData = async () => {
    loading.value = true
    await new Promise((r) => setTimeout(r, 300))
    const filtered = getFilteredData()
    const start = (pagination.current - 1) * pagination.size
    data.value = filtered.slice(start, start + pagination.size)
    pagination.total = filtered.length
    loading.value = false
  }

  const handleSearch = (params: any) => {
    searchParams.value = params
    pagination.current = 1
    fetchData()
  }

  const handleResetSearch = () => {
    searchParams.value = {}
    pagination.current = 1
    fetchData()
  }

  onMounted(() => fetchData())

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchData()
  }

  const handleSelectionChange = (selection: OrderItem[]) => {
    selectedRows.value = selection
  }

  const refreshData = async () => {
    await fetchData()
  }

  // Status tag type mappings
  const paymentStatusType = (s: string) => {
    const map: Record<string, string> = { '未缴费': 'danger', '已缴费': 'success', '已退费': 'info', '待结算': 'warning' }
    return (map[s] || 'info') as any
  }
  const qcStatusType = (s: string) => {
    const map: Record<string, string> = { '未质控': 'info', '质控中': 'warning', '合格': 'success', '不合格': 'danger' }
    return (map[s] || 'info') as any
  }
  const reportStatusType = (s: string) => {
    const map: Record<string, string> = { '未书写': 'info', '已书写': 'warning', '已上传': 'success' }
    return (map[s] || 'info') as any
  }
  

  // Column config
  const columns = ref([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'applyTime', label: '申请时间', width: 160, sortable: true },
    { prop: 'applyCode', label: '申请编码', width: 150 },
    { prop: 'hospitalNo', label: '住院号', width: 110 },
    { prop: 'outpatientNo', label: '门诊号', width: 110 },
    { prop: 'gender', label: '性别', width: 60 },
    { prop: 'age', label: '年龄', width: 70 },
    { prop: 'sampleType', label: '样本类型', width: 100 },
    { prop: 'pathologyNo', label: '病理号', width: 130 },
    { prop: 'projectName', label: '检测项目', width: 180 },
    { prop: 'slicePrint', label: '切片打印', width: 90, useSlot: true },
    { prop: 'paymentStatus', label: '缴费状态', width: 90, useSlot: true },
    { prop: 'qcStatus', label: '质控状态', width: 90, useSlot: true },
    { prop: 'reportStatus', label: '报告状态', width: 90, useSlot: true },
    { prop: 'copyStatus', label: '复制状态', width: 90, useSlot: true },
    
    { prop: 'tags', label: '标签', width: 160, useSlot: true },
    {
      prop: 'operation',
      label: '操作',
      width: 192,
      fixed: 'right',
      formatter: (row: OrderItem) => {
        return h('div', { class: 'flex-c' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
          h(ArtButtonTable, { icon: 'ri:file-copy-line', iconClass: 'bg-success/12 text-success', title: '复制', onClick: () => handleCopy(row) }),
          h(ArtButtonTable, { type: 'view', onClick: () => handleView(row) }),
          h(
            ElDropdown,
            { trigger: 'click' },
            {
              default: () =>
                h(ArtButtonTable, { type: 'more' }),
              dropdown: () =>
                h(ElDropdownMenu, null, {
                  default: () => [
                    '病理科购买切片申请',
                    '知情同意书',
                    '缴费单打印',
                    '不良事件打印',
                    '打印条码',
                    '拍照上传',
                    '改为待转',
                    '查看日志记录',
                    '签署文件',
                    '已签署文件列表'
                  ].map((item) =>
                    h(ElDropdownItem, { onClick: () => handleMoreAction(item, row) }, () => item)
                  )
                })
            }
          )
        ])
      }
    }
  ])

  // Action handlers
  // Drawer / Dialog visibility
  const addDrawerVisible = ref(false)
  const viewDrawerVisible = ref(false)
  const reportDialogVisible = ref(false)
  const logDialogVisible = ref(false)
  const actionDialogVisible = ref(false)
  const signedListDialogVisible = ref(false)
  const uploadDialogVisible = ref(false)
  const drawerMode = ref<'add' | 'edit' | 'copy'>('add')
  const currentRow = ref<any>({})
  const currentActionType = ref('')

  const handleAdd = () => {
    drawerMode.value = 'add'
    currentRow.value = {}
    addDrawerVisible.value = true
  }

  const handleDrawerSubmit = (formData: any) => {
    const msgMap = { add: '接诊单新增成功', edit: '接诊单修改成功', copy: '接诊单复制成功' }

    if (drawerMode.value === 'edit') {
      // 编辑模式：更新 mockData 中对应的数据
      const idx = mockData.findIndex((item) => item.id === currentRow.value.id)
      if (idx > -1) {
        mockData[idx] = { ...mockData[idx], ...formData, id: currentRow.value.id }
      }
    } else {
      // 新增/复制模式：生成新的 id 和申请编码，插入到 mockData 开头
      const newId = Math.max(...mockData.map((item) => item.id), 0) + 1
      const maxCode = Math.max(
        ...mockData.map((item) => {
          const match = item.applyCode?.match(/AP\d{6}(\d{4})/)
          return match ? parseInt(match[1]) : 0
        }),
        0
      )
      const newApplyCode = `AP202607${String(maxCode + 1).padStart(4, '0')}`
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const newRow: OrderItem = {
        id: newId,
        applyTime: timeStr,
        applyCode: newApplyCode,
        hospitalNo: formData.hospitalNo || `ZY${String(100000 + newId * 37)}`,
        outpatientNo: formData.outpatientNo || '-',
        patientName: formData.patientName || '',
        gender: formData.gender || '男',
        age: formData.age ? `${formData.age}岁` : '30岁',
        idCard: formData.idCard || '',
        sampleType: formData.sampleSource || '组织样本',
        pathologyNo: formData.pathologyNo || `BL${String(20260000 + newId * 11)}`,
        projectName: formData.projectName || '',
        slicePrint: '未打印',
        paymentStatus: '未缴费',
        qcStatus: '未质控',
        reportStatus: '未书写',
        auditStatus: 'pending',
        copyStatus: '未复制',
        
        ...formData
      }
      mockData.unshift(newRow)
      pagination.total = mockData.length

      // 流程一：接诊单提交后，将数据推送到样本流转Store
      sampleFlowStore.submitOrder({
        patientName: newRow.patientName,
        gender: newRow.gender,
        age: newRow.age,
        idCard: newRow.idCard,
        patientType: formData.patientType || '住院患者',
        hospital: formData.hospital || '昆华医院',
        department: formData.department || '',
        doctor: formData.doctor || '',
        projectName: newRow.projectName,
        sampleType: newRow.sampleType,
        pathologyNo: newRow.pathologyNo,
        applyCode: newRow.applyCode,
        applyTime: newRow.applyTime,
        isSelfSample: formData.isSelfSample || 'no',
        sourceHospital: formData.sourceHospital || '',
        sourceOrderId: newId
      })
    }

    ElMessage.success(msgMap[drawerMode.value])
    fetchData()
  }

  const handleEdit = (row: OrderItem) => {
    drawerMode.value = 'edit'
    currentRow.value = { ...row }
    addDrawerVisible.value = true
  }

  const handleCopy = (row: OrderItem) => {
    drawerMode.value = 'copy'
    currentRow.value = { ...row }
    addDrawerVisible.value = true
  }

  const handleView = (row: OrderItem) => {
    currentRow.value = { ...row }
    viewDrawerVisible.value = true
  }

  const handleViewEdit = (data: any) => {
    drawerMode.value = 'edit'
    currentRow.value = { ...data }
    addDrawerVisible.value = true
  }

  const handleViewCopy = (data: any) => {
    drawerMode.value = 'copy'
    currentRow.value = { ...data }
    addDrawerVisible.value = true
  }

  const handleDelete = (row: OrderItem) => {
    ElMessageBox.confirm(`确定要删除接诊单「${row.applyCode}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const idx = data.value.findIndex((item) => item.id === row.id)
      if (idx > -1) {
        data.value.splice(idx, 1)
        pagination.total--
      }
      ElMessage.success('删除成功')
    })
  }

  const handleMoreAction = (action: string, row: OrderItem) => {
    currentRow.value = { ...row }
    const actionMap: Record<string, string> = {
      '病理科购买切片申请': 'sliceApply',
      '知情同意书': 'consent',
      '缴费单打印': 'paymentPrint',
      '不良事件打印': 'adverseEvent',
      '打印条码': 'barcodePrint',
      '拍照上传': 'photoUpload',
      '改为待转': 'statusChange',
      '查看日志记录': 'log',
      '签署文件': 'signFile',
      '已签署文件列表': 'signedList'
    }
    const type = actionMap[action]
    if (type === 'log') {
      logDialogVisible.value = true
    } else if (type === 'signedList') {
      signedListDialogVisible.value = true
    } else {
      currentActionType.value = type || ''
      actionDialogVisible.value = true
    }
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const ids = selectedRows.value.map((r) => r.id)
      data.value = data.value.filter((item) => !ids.includes(item.id))
      pagination.total -= selectedRows.value.length
      selectedRows.value = []
      ElMessage.success('批量删除成功')
    })
  }

  const handleBatchExport = () => {
    // Simulate export
    const headers = [
      '申请编码', '患者姓名', '性别', '年龄', '住院号', '门诊号',
      '样本类型', '病理号', '检测项目', '缴费状态'
    ]
    const rows = selectedRows.value.map((r) => [
      r.applyCode, r.patientName, r.gender, r.age, r.hospitalNo, r.outpatientNo,
      r.sampleType, r.pathologyNo, r.projectName, r.paymentStatus
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `接诊单导出_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${selectedRows.value.length} 条数据`)
  }

  const handlePrintRecord = () => {
    ElMessage.info(`正在打印 ${selectedRows.value.length} 条操作记录`)
    setTimeout(() => {
      ElMessage.success('操作记录打印完成')
    }, 1000)
  }

  // ===== 工具栏：报告书写/报告上传 =====
  // 报告书写：选中1条即可，不受任何状态限制
  const canReportWriting = computed(() => {
    return selectedRows.value.length === 1
  })

  // 报告上传：选中1条且已书写（先书写才能上传），不受审核状态限制
  const canReportUpload = computed(() => {
    if (selectedRows.value.length !== 1) return false
    const row = selectedRows.value[0]
    return row.reportStatus === '已书写' || row.reportStatus === '已上传'
  })

  const handleToolbarReportWriting = () => {
    reportDialogVisible.value = true
  }

  const handleToolbarReportUpload = () => {
    uploadDialogVisible.value = true
  }

  const handleReportSave = (reportData: any) => {
    const row = data.value.find((r: OrderItem) => r.applyCode === reportData.applyCode)
    if (row) {
      row.reportStatus = '已书写'
    }
    fetchData()
  }

  const handleReportSubmit = (reportData: any) => {
    const row = data.value.find((r: OrderItem) => r.applyCode === reportData.applyCode)
    if (row) {
      row.reportStatus = '已上传'
      row.auditStatus = 'pending'
    }
    ElMessage.success('报告已提交审核')
    fetchData()
  }

  const handleReportDraft = (reportData: any) => {
    const row = data.value.find((r: OrderItem) => r.applyCode === reportData.applyCode)
    if (row) {
      row.reportStatus = '已书写'
    }
    fetchData()
  }

  const handleUploadSubmit = (uploadData: any) => {
    const row = data.value.find((r: OrderItem) => r.applyCode === uploadData.applyCode)
    if (row) {
      row.reportStatus = '已上传'
      row.auditStatus = 'pending'
    }
    ElMessage.success('报告上传成功')
    fetchData()
  }

  const handleBatchDownload = () => {
    ElMessage.info(`正在下载 ${selectedRows.value.length} 条数据`)
    setTimeout(() => {
      ElMessage.success('批量下载完成')
    }, 1000)
  }

  const handleActionConfirm = (actionData: any) => {
    // Handle status change
    if (actionData.actionType === 'statusChange' && actionData.targetStatus) {
      const row = data.value.find((r: OrderItem) => r.applyCode === actionData.applyCode)
      if (row) {
        
      }
    }
    fetchData()
  }
</script>
