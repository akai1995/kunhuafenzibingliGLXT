<!-- 样本管理 -->
<template>
  <div class="sample-manage art-page-view">
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
            <ElFormItem label="检测项目">
              <ElInput
                v-model="searchForm.projectName"
                placeholder="请输入检测项目"
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
            <ElFormItem label="入库状态">
              <ElSelect
                v-model="searchForm.storeStatus"
                placeholder="请选择"
                clearable
                style="width: 100%"
                @change="handleSearch"
              >
                <ElOption label="已入库" value="已入库" />
                <ElOption label="待入库" value="待入库" />
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
      <ArtTableHeader :loading="loading" @refresh="refreshData" :showColumnSetting="true" v-model:columns="columns" />
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #storeStatusSlot="{ row }">
          <ElTag :type="row.storeStatus === '已入库' ? 'success' : 'warning'" size="small">
            {{ row.storeStatus }}
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 入库弹窗 -->
    <ElDialog
      v-model="storeDialogVisible"
      title="样本入库"
      width="460px"
      :close-on-click-modal="true"
    >
      <ElForm ref="storeFormRef" :key="storeFormKey" :model="storeForm" :rules="storeFormRules" label-width="90px">
        <ElFormItem label="患者姓名">
          <ElInput v-model="storeForm.patientName" disabled />
        </ElFormItem>
        <ElFormItem label="样本编号">
          <ElInput v-model="storeForm.sampleNo" disabled />
        </ElFormItem>
        <ElFormItem label="采集方式" prop="collectMethod">
          <ElSelect
            v-model="storeForm.collectMethod"
            placeholder="请选择采集方式"
            style="width: 100%"
          >
            <ElOption label="静脉采血" value="静脉采血" />
            <ElOption label="穿刺采集" value="穿刺采集" />
            <ElOption label="组织切除" value="组织切除" />
            <ElOption label="排泄物采集" value="排泄物采集" />
            <ElOption label="其他" value="其他" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="设备类型" prop="deviceType">
          <ElSelect
            v-model="storeForm.deviceType"
            placeholder="请选择设备类型"
            style="width: 100%"
            @change="onDeviceTypeChange"
          >
            <ElOption label="冰箱" value="冰箱" />
            <ElOption label="液氮罐" value="液氮罐" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="存储位置" prop="storageLocation">
          <ElCascader
            v-model="storeForm.storageLocation"
            :options="filteredStorageOptions"
            :placeholder="storeForm.deviceType ? '请选择存储位置' : '请先选择设备类型'"
            :disabled="!storeForm.deviceType"
            :props="{ expandTrigger: 'hover' }"
            filterable
            clearable
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="采集人" prop="collector">
          <ElInput v-model="storeForm.collector" placeholder="请输入采集人" />
        </ElFormItem>
        <ElFormItem label="采集时间" prop="collectTime">
          <ElDatePicker
            v-model="storeForm.collectTime"
            type="datetime"
            placeholder="请选择采集时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="storeDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleStoreSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 核收弹窗 -->
    <ElDialog
      v-model="receiveDialogVisible"
      title="样本核收"
      width="460px"
      :close-on-click-modal="true"
    >
      <ElForm ref="receiveFormRef" :key="receiveFormKey" :model="receiveForm" :rules="receiveFormRules" label-width="90px">
        <ElFormItem label="患者姓名">
          <ElInput v-model="receiveForm.patientName" disabled />
        </ElFormItem>
        <ElFormItem label="样本编号">
          <ElInput v-model="receiveForm.sampleNo" disabled />
        </ElFormItem>
        <ElFormItem label="核收结果" prop="receiveResult">
          <ElRadioGroup v-model="receiveForm.receiveResult">
            <ElRadio value="pass">通过</ElRadio>
            <ElRadio value="reject">驳回</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="receiveDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleReceiveSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 查看弹窗 -->
    <ElDialog
      v-model="viewDialogVisible"
      title="样本详情"
      width="600px"
      :close-on-click-modal="true"
    >
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="患者姓名">{{ currentRow?.patientName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="样本编号">{{ currentRow?.sampleNo || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="性别">{{ currentRow?.gender || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="年龄">{{ currentRow?.age || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="身份证号">{{ currentRow?.idCard || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="患者类型">{{ currentRow?.patientType || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="入库状态">
          <ElTag :type="currentRow?.storeStatus === '已入库' ? 'success' : 'warning'" size="small">
            {{ currentRow?.storeStatus || '-' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="送检医院">{{ currentRow?.hospital || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="送检科室">{{ currentRow?.department || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="送检医生">{{ currentRow?.doctor || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="检测项目">{{ currentRow?.projectName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="样本类型">{{ currentRow?.sampleType || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="条码">{{ currentRow?.barcode || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="存储位置">{{ formatStorageLocation(currentRow?.storageLocation) }}</ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <ElButton @click="viewDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useSampleFlowStore } from '@/store/modules/sample-flow'

  defineOptions({ name: 'SampleRegister' })

  const sampleFlowStore = useSampleFlowStore()

  interface SampleItem {
    id: number
    patientName: string
    sampleNo: string
    gender: string
    age: string
    idCard: string
    patientType: string
    storeStatus: string
    hospital: string
    department: string
    doctor: string
    projectName: string
    sampleType: string
    barcode: string
    storageLocation: string
    isExternal: boolean
    receiveStatus: string
    rejected?: boolean
  }

  const loading = ref(false)
  const searchExpanded = ref(false)
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const storeDialogVisible = ref(false)
  const receiveDialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const currentRow = ref<any>({})
  const storeFormRef = ref<FormInstance>()
  const storeFormKey = ref(0)
  const receiveFormRef = ref<FormInstance>()
  const receiveFormKey = ref(0)

  // ===== 查询条件 =====
  const searchForm = reactive({
    patientName: '',
    sampleNo: '',
    projectName: '',
    storeStatus: ''
  })

  const toggleSearchExpand = () => {
    searchExpanded.value = !searchExpanded.value
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchPageData()
  }

  const handleReset = () => {
    Object.assign(searchForm, {
      patientName: '',
      sampleNo: '',
      projectName: '',
      storeStatus: ''
    })
    pagination.current = 1
    fetchPageData()
  }

  // ===== 入库表单 =====
  const storeForm = reactive({
    patientName: '',
    sampleNo: '',
    collectMethod: '',
    deviceType: '',
    storageLocation: [] as string[],
    collector: '',
    collectTime: ''
  })

  // 存储位置级联数据（按设备类型过滤）
  const allStorageCascaderData = [
    // 冰箱
    {
      deviceType: '冰箱',
      value: '冰箱A',
      label: '冰箱A',
      children: [
        {
          value: '冻存架1',
          label: '冻存架1',
          children: [
            { value: '冻存盒1-1', label: '冻存盒1-1' },
            { value: '冻存盒1-2', label: '冻存盒1-2' },
            { value: '冻存盒1-3', label: '冻存盒1-3' }
          ]
        },
        {
          value: '冻存架2',
          label: '冻存架2',
          children: [
            { value: '冻存盒2-1', label: '冻存盒2-1' },
            { value: '冻存盒2-2', label: '冻存盒2-2' }
          ]
        }
      ]
    },
    {
      deviceType: '冰箱',
      value: '冰箱B',
      label: '冰箱B',
      children: [
        {
          value: '冻存架1',
          label: '冻存架1',
          children: [
            { value: '冻存盒1-1', label: '冻存盒1-1' },
            { value: '冻存盒1-2', label: '冻存盒1-2' }
          ]
        }
      ]
    },
    {
      deviceType: '冰箱',
      value: '冰箱C',
      label: '冰箱C',
      children: [
        {
          value: '冻存架1',
          label: '冻存架1',
          children: [
            { value: '冻存盒1-1', label: '冻存盒1-1' },
            { value: '冻存盒1-2', label: '冻存盒1-2' }
          ]
        }
      ]
    },
    // 液氮罐
    {
      deviceType: '液氮罐',
      value: '液氮罐1',
      label: '液氮罐1',
      children: [
        {
          value: '冻存架1',
          label: '冻存架1',
          children: [
            { value: '冻存盒1-1', label: '冻存盒1-1' },
            { value: '冻存盒1-2', label: '冻存盒1-2' }
          ]
        },
        {
          value: '冻存架2',
          label: '冻存架2',
          children: [{ value: '冻存盒2-1', label: '冻存盒2-1' }]
        }
      ]
    },
    {
      deviceType: '液氮罐',
      value: '液氮罐2',
      label: '液氮罐2',
      children: [
        {
          value: '冻存架1',
          label: '冻存架1',
          children: [
            { value: '冻存盒1-1', label: '冻存盒1-1' },
            { value: '冻存盒1-2', label: '冻存盒1-2' }
          ]
        },
        {
          value: '冻存架2',
          label: '冻存架2',
          children: [{ value: '冻存盒2-1', label: '冻存盒2-1' }]
        }
      ]
    }
  ]

  // 根据设备类型过滤级联数据
  const filteredStorageOptions = computed(() => {
    if (!storeForm.deviceType) return []
    return allStorageCascaderData.filter((item) => item.deviceType === storeForm.deviceType)
  })

  // 设备类型变化时清空存储位置
  const onDeviceTypeChange = () => {
    storeForm.storageLocation = []
  }

  const storeFormRules: FormRules = {
    collectMethod: [{ required: true, message: '请选择采集方式', trigger: 'change' }],
    deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    storageLocation: [{ required: true, message: '请选择存储位置', trigger: 'change' }],
    collector: [{ required: true, message: '请输入采集人', trigger: 'blur' }],
    collectTime: [{ required: true, message: '请选择采集时间', trigger: 'change' }]
  }

  // 格式化存储位置为完整路径展示
  // 存储位置以 "-" 连接三级路径（如 冰箱A-冻存架1-冻存盒1-1），
  // 仅替换前两个层级分隔符为 " / "，保留末级值中可能包含的 "-"
  const formatStorageLocation = (location: string | undefined): string => {
    if (!location) return '-'
    let count = 0
    return location.replace(/-/g, (match) => {
      count++
      return count <= 2 ? ' / ' : match
    })
  }

  // ===== 核收表单 =====
  const receiveForm = reactive({
    patientName: '',
    sampleNo: '',
    receiveResult: ''
  })

  const receiveFormRules: FormRules = {
    receiveResult: [{ required: true, message: '请选择核收结果', trigger: 'change' }]
  }

  // ===== Mock 数据 =====
  // 10条样本入库数据，来源于已提交的接诊单
  const mockData: SampleItem[] = [
    // 本院样本（已入库）
    { id: 1, patientName: '张伟', sampleNo: 'S2026070001', gender: '男', age: '45岁', idCard: '530102198103156734', patientType: '住院患者', storeStatus: '已入库', hospital: '昆华医院', department: '肿瘤科', doctor: '张医生', projectName: 'NGSR质控', sampleType: '组织样本', barcode: 'BC2026070001', storageLocation: '冰箱A-冻存架1-冻存盒1-1', isExternal: false, receiveStatus: 'received' },
    { id: 2, patientName: '李娜', sampleNo: 'S2026070002', gender: '女', age: '52岁', idCard: '530103197409128765', patientType: '住院患者', storeStatus: '已入库', hospital: '昆华医院', department: '乳腺外科', doctor: '王医生', projectName: 'NGSA质控', sampleType: '血液样本', barcode: 'BC2026070002', storageLocation: '冰箱A-冻存架1-冻存盒1-2', isExternal: false, receiveStatus: 'received' },
    { id: 3, patientName: '王建国', sampleNo: 'S2026070003', gender: '男', age: '63岁', idCard: '53010219630515213X', patientType: '门诊患者', storeStatus: '已入库', hospital: '昆华医院', department: '消化内科', doctor: '陈医生', projectName: 'PCR10基因质控', sampleType: '组织样本', barcode: 'BC2026070003', storageLocation: '液氮罐1-冻存架1-冻存盒1-1', isExternal: false, receiveStatus: 'received' },
    { id: 4, patientName: '赵敏', sampleNo: 'S2026070004', gender: '女', age: '38岁', idCard: '530104198812039876', patientType: '住院患者', storeStatus: '已入库', hospital: '昆华医院', department: '内分泌科', doctor: '杨医生', projectName: 'PCR11基因质控', sampleType: '血液样本', barcode: 'BC2026070004', storageLocation: '冰箱B-冻存架1-冻存盒1-1', isExternal: false, receiveStatus: 'received' },
    { id: 5, patientName: '陈晓东', sampleNo: 'S2026070005', gender: '男', age: '55岁', idCard: '530111197106123456', patientType: '住院患者', storeStatus: '已入库', hospital: '昆华医院', department: '肿瘤科', doctor: '张医生', projectName: 'NGSR质控', sampleType: '组织样本', barcode: 'BC2026070005', storageLocation: '液氮罐1-冻存架2-冻存盒2-1', isExternal: false, receiveStatus: 'received' },
    // 本院样本（待入库）
    { id: 6, patientName: '刘芳', sampleNo: 'S2026070006', gender: '女', age: '47岁', idCard: '530102197907081234', patientType: '住院患者', storeStatus: '待入库', hospital: '昆华医院', department: '妇科', doctor: '王医生', projectName: 'NGSA质控', sampleType: '组织样本', barcode: 'BC2026070006', storageLocation: '', isExternal: false, receiveStatus: 'received' },
    { id: 7, patientName: '周强', sampleNo: 'S2026070007', gender: '男', age: '60岁', idCard: '530103196607152345', patientType: '门诊患者', storeStatus: '已入库', hospital: '昆华医院', department: '泌尿外科', doctor: '陈医生', projectName: 'PCR10基因质控', sampleType: '血液样本', barcode: 'BC2026070007', storageLocation: '冰箱A-冻存架2-冻存盒2-1', isExternal: false, receiveStatus: 'received' },
    // 外院样本（已核收，已入库）
    { id: 8, patientName: '郑浩', sampleNo: 'S2026070009', gender: '男', age: '50岁', idCard: '530102197608151234', patientType: '门诊患者', storeStatus: '已入库', hospital: '第一人民医院', department: '皮肤科', doctor: '刘医生', projectName: 'PCR11基因质控', sampleType: '组织样本', barcode: 'BC2026070009', storageLocation: '冰箱C-冻存架1-冻存盒1-1', isExternal: true, receiveStatus: 'received' },
    // 外院样本（已核收，待入库）
    { id: 9, patientName: '孙丽华', sampleNo: 'S2026070010', gender: '女', age: '58岁', idCard: '530103196805069876', patientType: '住院患者', storeStatus: '待入库', hospital: '肿瘤医院', department: '消化内科', doctor: '外院医生', projectName: 'NGSR质控', sampleType: '血液样本', barcode: 'BC2026070010', storageLocation: '', isExternal: true, receiveStatus: 'received' },
    // 外院样本（待核收）
    { id: 10, patientName: '马超', sampleNo: 'S2026070011', gender: '男', age: '39岁', idCard: '530102198703151234', patientType: '门诊患者', storeStatus: '待入库', hospital: '中心医院', department: '神经外科', doctor: '外院医生', projectName: 'NGSA质控', sampleType: '组织样本', barcode: 'BC2026070011', storageLocation: '', isExternal: true, receiveStatus: 'pending' }
  ]

  const allData = ref<SampleItem[]>([...mockData])
  const data = ref<SampleItem[]>([])

  // ===== 列配置 =====
  const columns = ref([
    { prop: 'patientName', label: '患者姓名', width: 90, fixed: 'left' },
    { prop: 'sampleNo', label: '样本编号', width: 150 },
    { prop: 'gender', label: '性别', width: 60, align: 'center' },
    { prop: 'age', label: '年龄', width: 70, align: 'center' },
    { prop: 'idCard', label: '身份证号', width: 180 },
    { prop: 'patientType', label: '患者类型', width: 110 },
    {
      prop: 'storeStatus',
      label: '入库状态',
      width: 100,
      useSlot: true,
      slotName: 'storeStatusSlot'
    },
    { prop: 'hospital', label: '送检医院', width: 120 },
    { prop: 'department', label: '送检科室', width: 100 },
    { prop: 'doctor', label: '送检医生', width: 90 },
    { prop: 'projectName', label: '检测项目', minWidth: 160 },
    { prop: 'sampleType', label: '样本类型', width: 100 },
    { prop: 'barcode', label: '条码', width: 150 },
    { prop: 'storageLocation', label: '存储位置', width: 110 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row: SampleItem) =>
        h('div', { class: 'flex-c' }, [
          // 核收：外院样本且未核收
          ...(row.isExternal && row.receiveStatus === 'pending'
            ? [
                h(ArtButtonTable, {
                  icon: 'ri:task-line',
                  iconClass: 'bg-success/12 text-success',
                  title: '核收',
                  onClick: () => handleReceive(row)
                })
              ]
            : []),
          // 入库：待入库且（非外院或已核收）
          ...(row.storeStatus === '待入库' &&
          (!row.isExternal || row.receiveStatus === 'received')
            ? [
                h(ArtButtonTable, {
                  icon: 'ri:inbox-line',
                  iconClass: 'bg-theme/12 text-theme',
                  title: '入库',
                  onClick: () => handleStore(row)
                })
              ]
            : []),
          // 查看
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => handleView(row)
          })
        ])
    }
  ])

  // ===== 数据获取 =====
  const fetchPageData = () => {
    loading.value = true
    setTimeout(() => {
      // 流程一→流程二：从Store获取接诊单提交的流转样本
      const flowSamples = sampleFlowStore.getSamplesForSampleManage()

      // 移除已离开reception阶段的Store样本
      const flowIds = new Set(flowSamples.map((s) => s.id))
      allData.value = allData.value.filter((d) => {
        if (d.id >= 100000 && !flowIds.has(d.id)) return false
        return true
      })

      // 合并新的Store样本
      const existingIds = new Set(allData.value.map((d) => d.id))
      flowSamples.forEach((fs) => {
        if (!existingIds.has(fs.id)) {
          allData.value.unshift({
            id: fs.id,
            patientName: fs.patientName,
            sampleNo: fs.sampleNo,
            gender: fs.gender,
            age: fs.age,
            idCard: fs.idCard,
            patientType: fs.patientType,
            storeStatus: '待入库',
            hospital: fs.isSelfSample === 'no' ? fs.sourceHospital : fs.hospital,
            department: fs.department,
            doctor: fs.doctor,
            projectName: fs.projectName,
            sampleType: fs.sampleType,
            barcode: fs.barcode,
            storageLocation: '',
            isExternal: fs.isSelfSample === 'no',
            receiveStatus: fs.receiveStatus
          })
        }
      })

      const filtered = allData.value.filter((item) => {
        // 驳回的数据不在当前流程展示（回到流程一）
        if (item.rejected) return false
        const matchName =
          !searchForm.patientName || item.patientName.includes(searchForm.patientName)
        const matchNo = !searchForm.sampleNo || item.sampleNo.includes(searchForm.sampleNo)
        const matchProject =
          !searchForm.projectName || item.projectName.includes(searchForm.projectName)
        const matchStatus = !searchForm.storeStatus || item.storeStatus === searchForm.storeStatus
        return matchName && matchNo && matchProject && matchStatus
      })
      pagination.total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      data.value = filtered.slice(start, start + pagination.size)
      loading.value = false
    }, 200)
  }

  const refreshData = () => {
    fetchPageData()
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    pagination.current = 1
    fetchPageData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchPageData()
  }

  // ===== 核收操作 =====
  const handleReceive = (row: SampleItem) => {
    currentRow.value = row
    Object.assign(receiveForm, {
      patientName: row.patientName,
      sampleNo: row.sampleNo,
      receiveResult: ''
    })
    receiveDialogVisible.value = true
    receiveFormKey.value++
  }

  const handleReceiveSubmit = async () => {
    if (!receiveFormRef.value) return
    await receiveFormRef.value.validate((valid) => {
      if (valid) {
        const row = currentRow.value
        const isPass = receiveForm.receiveResult === 'pass'
        if (row.id >= 100000) {
          sampleFlowStore.receiveSample(row.id, isPass)
        } else {
          const idx = allData.value.findIndex((d) => d.id === row.id)
          if (idx > -1) {
            if (isPass) {
              allData.value[idx].receiveStatus = 'received'
            } else {
              // 核收驳回：重置所有状态，标记为已驳回（数据回到流程一展示，不在当前流程展示）
              allData.value[idx].rejected = true
              allData.value[idx].receiveStatus = 'pending'
            }
          }
        }
        receiveDialogVisible.value = false
        ElMessage.success(isPass ? '核收成功' : '已驳回')
        fetchPageData()
      }
    })
  }

  // ===== 入库操作 =====
  const nowStr = () => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const handleStore = (row: SampleItem) => {
    currentRow.value = row
    Object.assign(storeForm, {
      patientName: row.patientName,
      sampleNo: row.sampleNo,
      collectMethod: '',
      deviceType: '',
      storageLocation: [],
      collector: '系统管理员',
      collectTime: nowStr()
    })
    storeDialogVisible.value = true
    storeFormKey.value++
  }

  const handleStoreSubmit = async () => {
    if (!storeFormRef.value) return
    await storeFormRef.value.validate((valid) => {
      if (valid) {
        const row = currentRow.value
        const locationStr = storeForm.storageLocation.join('-')
        if (row.id >= 100000) {
          sampleFlowStore.storeSample(row.id, row.barcode, locationStr)
        } else {
          const idx = allData.value.findIndex((d) => d.id === row.id)
          if (idx > -1) {
            allData.value[idx].storeStatus = '已入库'
            allData.value[idx].storageLocation = locationStr
          }
        }
        storeDialogVisible.value = false
        ElMessage.success('入库成功')
        fetchPageData()
      }
    })
  }

  // ===== 查看操作 =====
  const handleView = (row: SampleItem) => {
    currentRow.value = { ...row }
    viewDialogVisible.value = true
  }

  onMounted(() => {
    fetchPageData()
  })
</script>

<style lang="scss" scoped>
  .search-wrapper {
    margin-bottom: 12px;
    padding: 18px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: calc(var(--custom-radius) + 4px);

    .search-actions {
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
      gap: 8px;
      height: 32px;
    }
  }
</style>
