<!-- 报告管理 -->
<template>
  <div class="report-manage art-page-view">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="患者姓名">
              <ElInput
                v-model="searchForm.patientName"
                placeholder="请输入患者姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="样本编号">
              <ElInput
                v-model="searchForm.sampleNo"
                placeholder="请输入样本编号"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="项目名称">
              <ElInput
                v-model="searchForm.projectName"
                placeholder="请输入项目名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-show="!searchExpanded" :xs="24" :sm="12" :lg="6">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
              <ElButton text @click="toggleSearchExpand">
                展开
                <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-0.5" />
              </ElButton>
            </div>
          </ElCol>
          <ElCol v-show="searchExpanded" :xs="24" :sm="12" :lg="6">
            <ElFormItem label="审核状态">
              <ElSelect
                v-model="searchForm.auditStatus"
                placeholder="请选择审核状态"
                clearable
                style="width: 100%"
              >
                <ElOption
                  v-for="opt in auditStatusOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow v-show="searchExpanded" :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="{ span: 6, offset: 18 }">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
              <ElButton text @click="toggleSearchExpand">
                收起
                <ArtSvgIcon icon="ri:arrow-up-s-line" class="ml-0.5" />
              </ElButton>
            </div>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <!-- 表格卡片 -->
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新增报告
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
      <ArtTable
        :loading="loading"
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #auditStatusSlot="{ row }">
          <ElTag :type="getAuditStatusType(row.auditStatus)" size="small">
            {{ getAuditStatusText(row.auditStatus) }}
          </ElTag>
        </template>
        <template #reportStatusSlot="{ row }">
          <ElTag :type="getReportStatusType(row.reportStatus)" size="small">
            {{ row.reportStatus }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 报告书写弹窗 -->
    <OrderReportDialog
      v-model:visible="reportDialogVisible"
      :order-data="currentRow"
      @draft="handleReportDraft"
      @save="handleReportSave"
      @submit="handleReportSubmit"
    />

    <!-- 报告上传弹窗 -->
    <OrderUploadDialog
      v-model:visible="uploadDialogVisible"
      :order-data="currentRow"
      @submit="handleUploadSubmit"
    />

    <!-- 新增报告弹窗 -->
    <ElDialog
      v-model="addDialogVisible"
      title="新增报告"
      width="640px"
      :close-on-click-modal="true"
    >
      <!-- 步骤条 -->
      <ElSteps :active="addStep" align-center class="mb-6">
        <ElStep title="选择报告模板" />
        <ElStep title="填写报告信息" />
      </ElSteps>

      <ElForm ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="90px">
        <!-- 第一步：选择报告模板 -->
        <div v-show="addStep === 0">
          <ElFormItem label="报告模板" prop="templateId">
            <ElSelect
              v-model="addForm.templateId"
              placeholder="请选择报告模板"
              style="width: 100%"
              @change="handleTemplateChange"
            >
              <ElOption
                v-for="tpl in templateOptions"
                :key="tpl.id"
                :label="tpl.name"
                :value="tpl.id"
              />
            </ElSelect>
          </ElFormItem>
        </div>

        <!-- 第二步：模板包含的字段 -->
        <div v-show="addStep === 1">
          <ElFormItem label="患者姓名" prop="patientName">
            <ElInput v-model="addForm.patientName" placeholder="请输入患者姓名" />
          </ElFormItem>
          <ElFormItem label="样本编号" prop="sampleNo">
            <ElInput v-model="addForm.sampleNo" placeholder="请输入样本编号" disabled />
          </ElFormItem>
          <ElFormItem label="项目名称" prop="projectName">
            <ElInput v-model="addForm.projectName" placeholder="请输入项目名称" />
          </ElFormItem>
          <ElFormItem label="病理号" prop="pathologyNo">
            <ElInput v-model="addForm.pathologyNo" placeholder="请输入病理号" />
          </ElFormItem>
          <ElFormItem label="性别" prop="gender">
            <ElRadioGroup v-model="addForm.gender">
              <ElRadio value="男">男</ElRadio>
              <ElRadio value="女">女</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem label="年龄" prop="age">
            <ElInputNumber v-model="addForm.age" :min="0" :max="150" controls-position="right" style="width: 100%" />
          </ElFormItem>
          <ElFormItem label="样本类型" prop="sampleType">
            <ElSelect v-model="addForm.sampleType" placeholder="请选择样本类型" style="width: 100%">
              <ElOption label="组织样本" value="组织样本" />
              <ElOption label="血液样本" value="血液样本" />
              <ElOption label="胸水样本" value="胸水样本" />
              <ElOption label="骨髓样本" value="骨髓样本" />
            </ElSelect>
          </ElFormItem>
        </div>
      </ElForm>
      <template #footer>
        <ElButton @click="addDialogVisible = false">取消</ElButton>
        <ElButton v-if="addStep === 1" @click="addStep = 0">上一步</ElButton>
        <ElButton v-if="addStep === 0" type="primary" @click="handleAddNext">下一步</ElButton>
        <ElButton v-if="addStep === 1" type="primary" @click="handleAddSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 编辑报告弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑报告"
      width="500px"
      :close-on-click-modal="true"
    >
      <ElForm ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="90px">
        <ElFormItem label="患者姓名" prop="patientName">
          <ElInput v-model="editForm.patientName" placeholder="请输入患者姓名" />
        </ElFormItem>
        <ElFormItem label="样本编号" prop="sampleNo">
          <ElInput v-model="editForm.sampleNo" placeholder="请输入样本编号" disabled />
        </ElFormItem>
        <ElFormItem label="性别" prop="gender">
          <ElRadioGroup v-model="editForm.gender">
            <ElRadio value="男">男</ElRadio>
            <ElRadio value="女">女</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="年龄" prop="age">
          <ElInputNumber v-model="editForm.age" :min="0" :max="150" controls-position="right" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="项目名称" prop="projectName">
          <ElInput v-model="editForm.projectName" placeholder="请输入项目名称" />
        </ElFormItem>
        <ElFormItem label="病理号" prop="pathologyNo">
          <ElInput v-model="editForm.pathologyNo" placeholder="请输入病理号" />
        </ElFormItem>
        <ElFormItem label="样本类型" prop="sampleType">
          <ElSelect v-model="editForm.sampleType" placeholder="请选择样本类型" style="width: 100%">
            <ElOption label="组织样本" value="组织样本" />
            <ElOption label="血液样本" value="血液样本" />
            <ElOption label="胸水样本" value="胸水样本" />
            <ElOption label="骨髓样本" value="骨髓样本" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEditSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 审核弹窗 -->
    <ElDialog
      v-model="auditDialogVisible"
      title="报告审核"
      width="420px"
      :close-on-click-modal="true"
    >
      <ElForm ref="auditFormRef" :model="auditForm" label-width="90px">
        <ElFormItem label="患者姓名">
          <span>{{ currentRow?.patientName }}</span>
        </ElFormItem>
        <ElFormItem label="样本编号">
          <span>{{ currentRow?.sampleNo }}</span>
        </ElFormItem>
        <ElFormItem label="审核结果" prop="auditResult">
          <ElRadioGroup v-model="auditForm.auditResult">
            <ElRadio value="pass">通过</ElRadio>
            <ElRadio value="reject">驳回</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem v-if="auditForm.auditResult === 'reject'" label="驳回原因">
          <ElInput
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入驳回原因"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="auditDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAuditSubmit">确定</ElButton>
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
  import type { ColumnOption } from '@/types'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'
  import OrderReportDialog from '@/views/reception/order-manage/modules/order-report-dialog.vue'
  import OrderUploadDialog from '@/views/reception/order-manage/modules/order-upload-dialog.vue'

  defineOptions({ name: 'ReportManage' })

  const sampleFlowStore = useSampleFlowStore()

  const loading = ref(false)
  const searchExpanded = ref(false)

  // ===== 查询条件 =====
  const searchForm = reactive({
    patientName: '',
    sampleNo: '',
    projectName: '',
    auditStatus: ''
  })

  const auditStatusOptions = [
    { label: '待审核', value: 'pending' },
    { label: '一级审核通过', value: 'level1Passed' },
    { label: '审核通过', value: 'passed' },
    { label: '已驳回', value: 'rejected' }
  ]

  const getAuditStatusText = (status: string) => {
    return auditStatusOptions.find((o) => o.value === status)?.label || status
  }

  const getAuditStatusType = (status: string) => {
    const map: Record<string, string> = {
      pending: 'warning',
      level1Passed: 'info',
      passed: 'success',
      rejected: 'danger'
    }
    return map[status] || 'info'
  }

  // ===== 报告状态 =====
  const getReportStatusType = (status: string) => {
    const map: Record<string, string> = {
      未书写: 'info',
      已书写: 'warning',
      已上传: 'success'
    }
    return map[status] || 'info'
  }

  const toggleSearchExpand = () => {
    searchExpanded.value = !searchExpanded.value
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    Object.assign(searchForm, {
      patientName: '',
      sampleNo: '',
      projectName: '',
      auditStatus: ''
    })
    pagination.current = 1
    fetchData()
  }

  // ===== Mock 数据 =====
  interface ReportItem {
    id: number
    patientName: string
    sampleNo: string
    gender: string
    age: number
    projectName: string
    pathologyNo: string
    sampleType: string
    auditStatus: string
    reportStatus: string
  }

  const mockData: ReportItem[] = [
    { id: 1, patientName: '张三', sampleNo: 'S20260701001', gender: '男', age: 58, projectName: 'EGFR基因突变检测', pathologyNo: 'P2026-0001', sampleType: '组织样本', auditStatus: 'passed', reportStatus: '已上传' },
    { id: 2, patientName: '李四', sampleNo: 'S20260701002', gender: '女', age: 45, projectName: 'KRAS基因突变检测', pathologyNo: 'P2026-0002', sampleType: '组织样本', auditStatus: 'level1Passed', reportStatus: '已上传' },
    { id: 3, patientName: '王五', sampleNo: 'S20260701003', gender: '男', age: 62, projectName: 'BRAF V600E检测', pathologyNo: 'P2026-0003', sampleType: '血液样本', auditStatus: 'pending', reportStatus: '已上传' },
    { id: 4, patientName: '赵六', sampleNo: 'S20260701004', gender: '女', age: 51, projectName: 'HER2基因扩增检测', pathologyNo: 'P2026-0004', sampleType: '组织样本', auditStatus: 'rejected', reportStatus: '已上传' },
    { id: 5, patientName: '孙七', sampleNo: 'S20260701005', gender: '男', age: 67, projectName: 'ALK融合基因检测', pathologyNo: 'P2026-0005', sampleType: '组织样本', auditStatus: 'passed', reportStatus: '已上传' },
    { id: 6, patientName: '周八', sampleNo: 'S20260701006', gender: '女', age: 39, projectName: 'ROS1融合基因检测', pathologyNo: 'P2026-0006', sampleType: '胸水样本', auditStatus: 'pending', reportStatus: '已书写' },
    { id: 7, patientName: '吴九', sampleNo: 'S20260701007', gender: '男', age: 73, projectName: 'MET外显子14跳跃检测', pathologyNo: 'P2026-0007', sampleType: '组织样本', auditStatus: 'level1Passed', reportStatus: '已上传' },
    { id: 8, patientName: '郑十', sampleNo: 'S20260701008', gender: '女', age: 48, projectName: 'PIK3CA突变检测', pathologyNo: 'P2026-0008', sampleType: '血液样本', auditStatus: 'passed', reportStatus: '已上传' },
    { id: 9, patientName: '陈十一', sampleNo: 'S20260701009', gender: '男', age: 55, projectName: 'EGFR基因突变检测', pathologyNo: 'P2026-0009', sampleType: '组织样本', auditStatus: 'pending', reportStatus: '已书写' },
    { id: 10, patientName: '林十二', sampleNo: 'S20260701010', gender: '女', age: 61, projectName: 'KRAS基因突变检测', pathologyNo: 'P2026-0010', sampleType: '组织样本', auditStatus: 'passed', reportStatus: '已上传' },
    { id: 11, patientName: '黄十三', sampleNo: 'S20260701011', gender: '男', age: 44, projectName: 'BRAF V600E检测', pathologyNo: 'P2026-0011', sampleType: '骨髓样本', auditStatus: 'rejected', reportStatus: '已上传' },
    { id: 12, patientName: '刘十四', sampleNo: 'S20260701012', gender: '女', age: 59, projectName: 'HER2基因扩增检测', pathologyNo: 'P2026-0012', sampleType: '组织样本', auditStatus: 'level1Passed', reportStatus: '未书写' }
  ]

  const allData = ref<ReportItem[]>([...mockData])
  const tableData = ref<ReportItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // ===== 列配置 =====
  const columns = ref<ColumnOption[]>([
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 150 },
    { prop: 'gender', label: '性别', width: 60, align: 'center' },
    { prop: 'age', label: '年龄', width: 60, align: 'center' },
    { prop: 'projectName', label: '项目名称', minWidth: 160 },
    { prop: 'pathologyNo', label: '病理号', width: 120 },
    { prop: 'sampleType', label: '样本类型', width: 100 },
    {
      prop: 'reportStatus',
      label: '报告状态',
      width: 100,
      useSlot: true,
      slotName: 'reportStatusSlot'
    },
    {
      prop: 'auditStatus',
      label: '审核状态',
      width: 120,
      useSlot: true,
      slotName: 'auditStatusSlot'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 234,
      fixed: 'right',
      formatter: (row: ReportItem) =>
        h('div', { class: 'flex-c' }, [
          // 1. 编辑
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEdit(row),
            disabled: row.auditStatus === 'passed'
          }),
          // 2. 审核：待审核和一级审核通过且报告已上传时可审核
          (row.auditStatus === 'pending' || row.auditStatus === 'level1Passed') &&
          row.reportStatus === '已上传' &&
            h(ArtButtonTable, {
              icon: 'ri:checkbox-circle-line',
              iconClass: 'bg-success/12 text-success',
              title: row.auditStatus === 'pending' ? '一级审核' : '二级审核',
              onClick: () => handleAudit(row)
            }),
          // 3. 取消审核：一级审核通过和审核通过后可取消
          (row.auditStatus === 'level1Passed' || row.auditStatus === 'passed') &&
            h(ArtButtonTable, {
              icon: 'ri:close-circle-line',
              iconClass: 'bg-warning/12 text-warning',
              title: '取消审核',
              onClick: () => handleCancelAudit(row)
            }),
          // 4. 打印：审核通过后可打印
          row.auditStatus === 'passed' &&
            h(ArtButtonTable, {
              icon: 'ri:printer-line',
              iconClass: 'bg-theme/12 text-theme',
              title: '打印',
              onClick: () => handlePrint(row)
            }),
          // 5. 查看
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => handleView(row)
          })
        ])
    }
  ])

  // ===== 数据获取 =====
  const fetchData = () => {
    loading.value = true
    setTimeout(() => {
      // 流程三→流程四：从Store获取技术平台质控完成的流转样本，合并到展示列表
      const flowSamples = sampleFlowStore.getSamplesForReport()
      const flowIds = new Set(flowSamples.map((fs) => fs.id))
      const existingIds = new Set(allData.value.map((d) => d.id))

      // 移除已不在报告阶段的Store样本（审核驳回后回退到流程一，不再在报告管理展示）
      allData.value = allData.value.filter((d) => {
        // Store样本且不在当前报告阶段 → 移除
        if (d.id >= 100000 && !flowIds.has(d.id)) {
          return false
        }
        // 已驳回的样本数据回退到流程一，不在报告管理展示
        if (d.auditStatus === 'rejected') {
          return false
        }
        return true
      })

      // 添加新进入报告阶段的Store样本
      flowSamples.forEach((fs) => {
        if (!existingIds.has(fs.id)) {
          allData.value.unshift({
            id: fs.id,
            patientName: fs.patientName,
            sampleNo: fs.sampleNo,
            gender: fs.gender,
            age: parseInt(fs.age) || 0,
            projectName: fs.projectName,
            pathologyNo: fs.pathologyNo,
            sampleType: fs.sampleType,
            auditStatus: 'pending',
            reportStatus: '未书写'
          })
        }
      })

      let filtered = [...allData.value]
      if (searchForm.patientName) {
        filtered = filtered.filter((d) => d.patientName.includes(searchForm.patientName))
      }
      if (searchForm.sampleNo) {
        filtered = filtered.filter((d) => d.sampleNo.includes(searchForm.sampleNo))
      }
      if (searchForm.projectName) {
        filtered = filtered.filter((d) => d.projectName.includes(searchForm.projectName))
      }
      if (searchForm.auditStatus) {
        filtered = filtered.filter((d) => d.auditStatus === searchForm.auditStatus)
      }
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      tableData.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => {
    fetchData()
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchData()
  }

  // ===== 新增报告 =====
  const addDialogVisible = ref(false)
  const addStep = ref(0)
  const addFormRef = ref<FormInstance>()
  const addForm = reactive({
    templateId: '' as string | number,
    templateName: '',
    patientName: '',
    sampleNo: '',
    projectName: '',
    pathologyNo: '',
    gender: '',
    age: 0,
    sampleType: ''
  })

  const addFormRules: FormRules = {
    templateId: [{ required: true, message: '请选择报告模板', trigger: 'change' }],
    patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    sampleNo: [{ required: true, message: '请输入样本编号', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    sampleType: [{ required: true, message: '请选择样本类型', trigger: 'change' }]
  }

  const templateOptions = [
    { id: 1, name: 'EGFR突变检测报告模板' },
    { id: 2, name: 'KRAS突变检测报告模板' },
    { id: 3, name: 'BRAF V600E检测报告模板' },
    { id: 4, name: 'HER2扩增检测报告模板' },
    { id: 5, name: 'ALK融合检测报告模板' },
    { id: 6, name: 'ROS1融合检测报告模板' },
    { id: 7, name: 'MET跳跃检测报告模板' },
    { id: 8, name: '综合病理报告模板' }
  ]

  const handleTemplateChange = (val: number) => {
    const tpl = templateOptions.find((t) => t.id === val)
    if (tpl) {
      addForm.templateName = tpl.name
      addForm.projectName = tpl.name.replace('报告模板', '')
    }
  }

  const handleAdd = () => {
    addStep.value = 0
    Object.assign(addForm, {
      templateId: '',
      templateName: '',
      patientName: '',
      sampleNo: '',
      projectName: '',
      pathologyNo: '',
      gender: '',
      age: 0,
      sampleType: ''
    })
    addDialogVisible.value = true
    nextTick(() => addFormRef.value?.clearValidate())
  }

  // 新增弹窗关闭时清除验证状态
  watch(addDialogVisible, (val) => {
    if (!val) {
      nextTick(() => addFormRef.value?.clearValidate())
    }
  })

  // 第一步→第二步：验证模板选择后进入字段填写
  const handleAddNext = async () => {
    if (!addFormRef.value) return
    await addFormRef.value.validateField('templateId', (valid) => {
      if (valid) {
        addStep.value = 1
      }
    })
  }

  const handleAddSubmit = async () => {
    if (!addFormRef.value) return
    await addFormRef.value.validate((valid) => {
      if (!valid) return
      const newId = Math.max(...allData.value.map((d) => d.id), 0) + 1
      allData.value.unshift({
        id: newId,
        patientName: addForm.patientName,
        sampleNo: addForm.sampleNo,
        gender: addForm.gender,
        age: addForm.age || 0,
        projectName: addForm.projectName,
        pathologyNo: addForm.pathologyNo || `P2026-${String(newId).padStart(4, '0')}`,
        sampleType: addForm.sampleType,
        auditStatus: 'pending',
        reportStatus: '未书写'
      })
      fetchData()
      addDialogVisible.value = false
      ElMessage.success('新增成功')
    })
  }

  // ===== 编辑 =====
  const editDialogVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const editForm = reactive({
    id: 0,
    patientName: '',
    sampleNo: '',
    gender: '',
    age: 0,
    projectName: '',
    pathologyNo: '',
    sampleType: ''
  })

  const editFormRules: FormRules = {
    patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    sampleNo: [{ required: true, message: '请输入样本编号', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
  }

  const handleEdit = (row: ReportItem) => {
    if (row.auditStatus === 'passed') {
      ElMessage.warning('已审核的报告不可编辑')
      return
    }
    Object.assign(editForm, {
      id: row.id,
      patientName: row.patientName,
      sampleNo: row.sampleNo,
      gender: row.gender,
      age: row.age,
      projectName: row.projectName,
      pathologyNo: row.pathologyNo,
      sampleType: row.sampleType
    })
    editDialogVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (!valid) return
      const idx = allData.value.findIndex((d) => d.id === editForm.id)
      if (idx > -1) {
        allData.value[idx] = { ...allData.value[idx], ...editForm }
      }
      fetchData()
      editDialogVisible.value = false
      ElMessage.success('编辑成功')
    })
  }

  // ===== 查看 =====
  const handleView = (row: ReportItem) => {
    ElMessage.info(`查看报告：${row.patientName} - ${row.sampleNo}`)
  }

  // ===== 审核 =====
  const auditDialogVisible = ref(false)
  const auditFormRef = ref<FormInstance>()
  const currentRow = ref<ReportItem | null>(null)
  const selectedRows = ref<ReportItem[]>([])
  const auditForm = reactive({
    auditResult: 'pass',
    rejectReason: ''
  })

  // ===== 工具栏：报告书写/报告上传 =====
  const handleSelectionChange = (selection: ReportItem[]) => {
    selectedRows.value = selection
  }

  // 报告书写：选中1条即可，不受审核/上传状态限制
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
    handleReportWriting(selectedRows.value[0])
  }

  const handleToolbarReportUpload = () => {
    handleReportUpload(selectedRows.value[0])
  }

  const handleAudit = (row: ReportItem) => {
    currentRow.value = row
    auditForm.auditResult = 'pass'
    auditForm.rejectReason = ''
    auditDialogVisible.value = true
  }

  const handleAuditSubmit = () => {
    if (!currentRow.value) return
    const row = currentRow.value
    if (auditForm.auditResult === 'pass') {
      if (row.auditStatus === 'pending') {
        row.auditStatus = 'level1Passed'
        // 流程四：一级审核通过，更新Store状态
        sampleFlowStore.auditReport(row.id, true)
        ElMessage.success('一级审核通过，已推送至二级审核')
      } else if (row.auditStatus === 'level1Passed') {
        row.auditStatus = 'passed'
        // 流程四：二级审核通过，更新Store状态（样本流程完成）
        sampleFlowStore.auditReport(row.id, true)
        ElMessage.success('二级审核通过')
      }
    } else {
      row.auditStatus = 'rejected'
      // 流程四：审核不成功（驳回），回退到流程一
      sampleFlowStore.auditReport(row.id, false)
      ElMessage.success('已驳回')
    }
    fetchData()
    auditDialogVisible.value = false
  }

  // ===== 取消审核 =====
  const handleCancelAudit = (row: ReportItem) => {
    ElMessageBox.confirm(
      `确定要取消「${row.patientName}」的报告审核吗？`,
      '取消审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      row.auditStatus = 'pending'
      // 取消审核，回到报告管理阶段
      sampleFlowStore.cancelAudit(row.id)
      fetchData()
      ElMessage.success('已取消审核')
    })
  }

  // ===== 打印 =====
  const handlePrint = (row: ReportItem) => {
    ElMessage.info(`打印报告：${row.patientName} - ${row.pathologyNo}`)
  }

  // ===== 报告书写 =====
  const reportDialogVisible = ref(false)

  const handleReportWriting = (row: ReportItem) => {
    currentRow.value = row
    reportDialogVisible.value = true
  }

  const handleReportDraft = () => {
    if (!currentRow.value) return
    const idx = allData.value.findIndex((d) => d.id === currentRow.value.id)
    if (idx > -1) {
      allData.value[idx].reportStatus = '已书写'
    }
    reportDialogVisible.value = false
    ElMessage.success('报告已存为草稿')
    fetchData()
  }

  const handleReportSave = () => {
    if (!currentRow.value) return
    const idx = allData.value.findIndex((d) => d.id === currentRow.value.id)
    if (idx > -1) {
      allData.value[idx].reportStatus = '已书写'
    }
    reportDialogVisible.value = false
    ElMessage.success('报告书写已保存')
    fetchData()
  }

  const handleReportSubmit = () => {
    if (!currentRow.value) return
    const idx = allData.value.findIndex((d) => d.id === currentRow.value.id)
    if (idx > -1) {
      allData.value[idx].reportStatus = '已书写'
    }
    reportDialogVisible.value = false
    ElMessage.success('报告书写已提交')
    fetchData()
  }

  // ===== 报告上传 =====
  const uploadDialogVisible = ref(false)

  const handleReportUpload = (row: ReportItem) => {
    currentRow.value = row
    uploadDialogVisible.value = true
  }

  const handleUploadSubmit = () => {
    if (!currentRow.value) return
    const idx = allData.value.findIndex((d) => d.id === currentRow.value.id)
    if (idx > -1) {
      allData.value[idx].reportStatus = '已上传'
    }
    uploadDialogVisible.value = false
    ElMessage.success('报告上传成功')
    fetchData()
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .report-manage {
    .search-wrapper {
      padding: 18px 20px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: calc(var(--custom-radius) + 4px);
      margin-bottom: 12px;

      .search-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
      }
    }

  }
</style>
