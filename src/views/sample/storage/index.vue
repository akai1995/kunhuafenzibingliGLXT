<!-- 存储设备管理 -->
<template>
  <div class="storage-device">
    <!-- 查询条件 -->
    <div class="search-wrapper">
      <ElForm :model="searchForm" label-width="80px" class="search-form">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="名称">
              <ElInput
                v-model="searchForm.name"
                placeholder="请输入设备名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="编号">
              <ElInput
                v-model="searchForm.code"
                placeholder="请输入设备编号"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="状态">
              <ElSelect
                v-model="searchForm.status"
                placeholder="请选择"
                clearable
                style="width: 100%"
                @change="handleSearch"
              >
                <ElOption label="使用中" value="使用中" />
                <ElOption label="已停用" value="已停用" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <div class="search-actions">
              <ElButton @click="handleReset">重置</ElButton>
              <ElButton type="primary" @click="handleSearch">查询</ElButton>
            </div>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <ElRadioGroup v-model="deviceTypeFilter" @change="handleSearch" class="type-filter">
          <ElRadioButton value="">全部</ElRadioButton>
          <ElRadioButton value="冰箱">冰箱</ElRadioButton>
          <ElRadioButton value="超低温冰箱">超低温冰箱</ElRadioButton>
          <ElRadioButton value="液氮罐">液氮罐</ElRadioButton>
          <ElRadioButton value="冷藏柜">冷藏柜</ElRadioButton>
          <ElRadioButton value="冷冻柜">冷冻柜</ElRadioButton>
        </ElRadioGroup>
      </div>
      <div class="toolbar-right">
        <ElButton type="primary" @click="handleAdd">
          <span class="add-icon">+</span> 新增设备
        </ElButton>
      </div>
    </div>

    <!-- 设备卡片网格 -->
    <div v-loading="loading" class="device-grid">
      <TransitionGroup name="card-list" tag="div" class="card-grid-inner">
        <div
          v-for="(device, index) in data"
          :key="device.id"
          class="device-card"
          :class="[`type-${deviceTypeClass(device.type)}`, { inactive: device.status !== '使用中' }]"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="card-title-line">
              <h3 class="card-name">{{ device.name }}</h3>
              <span class="card-type" :class="typeTagClass(device.type)">{{ device.type }}</span>
              <span class="card-status" :class="device.status === '使用中' ? 'active' : 'inactive'">
                <span class="status-dot"></span>
                {{ device.status }}
              </span>
            </div>
            <div class="card-meta-line">
              <span class="card-code">{{ device.code }}</span>
              <span class="card-sample" v-if="device.differentiateSampleType">
                <i class="ri-flask-line"></i>
                {{ device.sampleType }}
              </span>
            </div>
          </div>

          <!-- 容量进度条 -->
          <div class="card-capacity">
            <div class="capacity-header">
              <span class="capacity-label">存储使用</span>
              <span class="capacity-percent">{{ getUsagePercent(device) }}%</span>
            </div>
            <div class="capacity-bar">
              <div
                class="capacity-fill"
                :style="{ width: `${getUsagePercent(device)}%` }"
                :class="getUsageLevel(device)"
              ></div>
            </div>
            <div class="capacity-detail">
              <div class="cap-item">
                <span class="cap-val">{{ device.totalCapacity }}</span>
                <span class="cap-lbl">总量</span>
              </div>
              <div class="cap-item occupied">
                <span class="cap-val">{{ device.occupied }}</span>
                <span class="cap-lbl">已用</span>
              </div>
              <div class="cap-item free">
                <span class="cap-val">{{ device.free }}</span>
                <span class="cap-lbl">空闲</span>
              </div>
            </div>
          </div>

          <!-- 卡片底部操作 - 纯文字按钮，宽度自适应 -->
          <div class="card-actions">
            <ElButton size="small" text @click="handleView(device)">查看详情</ElButton>
            <ElButton size="small" text @click="handleEdit(device)">编辑</ElButton>
            <ElButton
              size="small"
              text
              :class="device.status === '使用中' ? 'toggle-text-btn danger' : 'toggle-text-btn success'"
              @click="handleToggleStatus(device)"
            >
              {{ device.status === '使用中' ? '停用' : '启用' }}
            </ElButton>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-if="!loading && data.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="ri-hard-drive-2-line"></i>
        </div>
        <p class="empty-text">暂无存储设备</p>
        <ElButton type="primary" @click="handleAdd">新增设备</ElButton>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination-wrapper">
      <ElPagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[6, 12, 18, 24]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑抽屉 -->
    <ElDrawer
      v-model="drawerVisible"
      :title="drawerMode === 'add' ? '新增存储设备' : '编辑存储设备'"
      size="560px"
      :close-on-click-modal="true"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        class="storage-form"
      >
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入设备名称" />
        </ElFormItem>
        <ElFormItem label="编号" prop="code">
          <ElInput v-model="formData.code" placeholder="请输入设备编号" />
        </ElFormItem>
        <ElFormItem label="设备类型" prop="type">
          <ElRadioGroup v-model="formData.type">
            <ElRadio value="冰箱">冰箱</ElRadio>
            <ElRadio value="超低温冰箱">超低温冰箱</ElRadio>
            <ElRadio value="液氮罐">液氮罐</ElRadio>
            <ElRadio value="冷藏柜">冷藏柜</ElRadio>
            <ElRadio value="冷冻柜">冷冻柜</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="是否区分样本类型" prop="differentiateSampleType">
          <ElRadioGroup v-model="formData.differentiateSampleType">
            <ElRadio :value="true">是</ElRadio>
            <ElRadio :value="false">否</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem v-if="formData.differentiateSampleType" label="样本类型" prop="sampleType">
          <ElSelect v-model="formData.sampleType" placeholder="请选择样本类型" style="width: 100%">
            <ElOption label="组织样本" value="组织样本" />
            <ElOption label="血液样本" value="血液样本" />
            <ElOption label="胸水样本" value="胸水样本" />
            <ElOption label="骨髓样本" value="骨髓样本" />
            <ElOption label="尿液样本" value="尿液样本" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="冻存架数量" prop="rackCount">
          <div class="select-with-unit">
            <ElSelect v-model="formData.rackCount" placeholder="请选择" @change="onRackCountChange">
              <ElOption v-for="n in 20" :key="n" :label="String(n)" :value="n" />
            </ElSelect>
            <span class="unit-suffix">个</span>
          </div>
        </ElFormItem>
        <ElFormItem v-if="formData.rackCount > 0" label="冻存架层数" prop="rackLayers">
          <div class="select-with-unit">
            <ElSelect v-model="formData.rackLayers" placeholder="请选择" @change="onRackLayersChange">
              <ElOption v-for="n in 20" :key="n" :label="String(n)" :value="n" />
            </ElSelect>
            <span class="unit-suffix">层</span>
          </div>
        </ElFormItem>
        <ElFormItem v-if="formData.rackLayers > 0" label="每层冻存盒数" prop="boxesPerLayer">
          <div class="select-with-unit">
            <ElSelect v-model="formData.boxesPerLayer" placeholder="请选择">
              <ElOption v-for="n in 20" :key="n" :label="String(n)" :value="n" />
            </ElSelect>
            <span class="unit-suffix">个</span>
          </div>
        </ElFormItem>
        <ElFormItem v-if="formData.boxesPerLayer > 0" label="冻存盒规格" prop="boxSpec">
          <ElInput v-model="formData.boxSpec" placeholder="如：1*1" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { mockDevices, type StorageDevice } from './mock-data'

defineOptions({ name: 'SampleStorage' })

const router = useRouter()

// 设备类型 CSS class
const deviceTypeClass = (type: string) => {
  const map: Record<string, string> = {
    '冰箱': 'fridge',
    '超低温冰箱': 'ult',
    '液氮罐': 'ln2',
    '冷藏柜': 'cooler',
    '冷冻柜': 'freezer'
  }
  return map[type] || 'default'
}

// 设备类型标签样式（与详情页一致）
const typeTagClass = (type: string) => {
  const map: Record<string, string> = {
    '冰箱': 'tag-fridge',
    '超低温冰箱': 'tag-ult',
    '液氮罐': 'tag-ln2',
    '冷藏柜': 'tag-cooler',
    '冷冻柜': 'tag-freezer'
  }
  return map[type] || ''
}

// 使用率
const getUsagePercent = (device: StorageDevice) => {
  if (device.totalCapacity === 0) return 0
  return Math.round((device.occupied / device.totalCapacity) * 100)
}

const getUsageLevel = (device: StorageDevice) => {
  const pct = getUsagePercent(device)
  if (pct >= 80) return 'high'
  if (pct >= 50) return 'mid'
  return 'low'
}

const loading = ref(false)
const submitting = ref(false)
const pagination = reactive({ current: 1, size: 6, total: 0 })
const drawerVisible = ref(false)
const drawerMode = ref<'add' | 'edit'>('add')
const currentRow = ref<StorageDevice | null>(null)
const formRef = ref<FormInstance>()
const deviceTypeFilter = ref('')

// ===== 查询条件 =====
const searchForm = reactive({
  name: '',
  code: '',
  status: ''
})

const handleSearch = () => {
  pagination.current = 1
  fetchPageData()
}

const handleReset = () => {
  Object.assign(searchForm, { name: '', code: '', status: '' })
  pagination.current = 1
  fetchPageData()
}

// ===== 表单数据 =====
const getDefaultForm = () => ({
  name: '',
  code: '',
  type: '冰箱',
  differentiateSampleType: false,
  sampleType: '',
  rackCount: 0,
  rackLayers: 0,
  boxesPerLayer: 0,
  boxSpec: ''
})

const formData = reactive(getDefaultForm())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
}

const calcTotal = (d: typeof formData) => {
  return d.rackCount * d.rackLayers * d.boxesPerLayer
}

const onRackCountChange = () => {
  formData.rackLayers = 0
  formData.boxesPerLayer = 0
  formData.boxSpec = ''
}

const onRackLayersChange = () => {
  formData.boxesPerLayer = 0
  formData.boxSpec = ''
}

// ===== 数据 =====
const allData = ref<StorageDevice[]>([...mockDevices])
const data = ref<StorageDevice[]>([])

const fetchPageData = () => {
  loading.value = true
  setTimeout(() => {
    const filtered = allData.value.filter((item) => {
      const matchName = !searchForm.name || item.name.includes(searchForm.name)
      const matchCode = !searchForm.code || item.code.includes(searchForm.code)
      const matchStatus = !searchForm.status || item.status === searchForm.status
      const matchType = !deviceTypeFilter.value || item.type === deviceTypeFilter.value
      return matchName && matchCode && matchStatus && matchType
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

// ===== 新增/编辑 =====
const handleAdd = () => {
  drawerMode.value = 'add'
  Object.assign(formData, getDefaultForm())
  if (deviceTypeFilter.value) {
    formData.type = deviceTypeFilter.value
  }
  drawerVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleEdit = (row: StorageDevice) => {
  drawerMode.value = 'edit'
  Object.assign(formData, {
    name: row.name,
    code: row.code,
    type: row.type,
    differentiateSampleType: row.differentiateSampleType,
    sampleType: row.sampleType,
    rackCount: row.rackCount,
    rackLayers: row.rackLayers,
    boxesPerLayer: row.boxesPerLayer,
    boxSpec: row.boxSpec
  })
  currentRow.value = row
  drawerVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 抽屉关闭时清除验证状态
watch(drawerVisible, (val) => {
  if (!val) {
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      const total = calcTotal(formData)
      setTimeout(() => {
        if (drawerMode.value === 'add') {
          const newId = Math.max(...allData.value.map((d) => d.id), 0) + 1
          allData.value.unshift({
            id: newId,
            name: formData.name,
            code: formData.code,
            type: formData.type,
            status: '使用中',
            differentiateSampleType: formData.differentiateSampleType,
            sampleType: formData.differentiateSampleType ? formData.sampleType : '',
            rackCount: formData.rackCount,
            rackLayers: formData.rackLayers,
            boxesPerLayer: formData.boxesPerLayer,
            boxSpec: formData.boxSpec,
            totalCapacity: total,
            occupied: 0,
            free: total
          })
          ElMessage.success('新增成功')
        } else {
          const idx = allData.value.findIndex((d) => d.id === currentRow.value?.id)
          if (idx > -1) {
            const row = allData.value[idx]
            row.name = formData.name
            row.code = formData.code
            row.type = formData.type
            row.differentiateSampleType = formData.differentiateSampleType
            row.sampleType = formData.differentiateSampleType ? formData.sampleType : ''
            row.rackCount = formData.rackCount
            row.rackLayers = formData.rackLayers
            row.boxesPerLayer = formData.boxesPerLayer
            row.boxSpec = formData.boxSpec
            const newTotal = calcTotal(formData)
            row.totalCapacity = newTotal
            row.free = newTotal - row.occupied
          }
          ElMessage.success('编辑成功')
        }
        submitting.value = false
        drawerVisible.value = false
        fetchPageData()
      }, 300)
    }
  })
}

// ===== 启用/停用 =====
const handleToggleStatus = (row: StorageDevice) => {
  const action = row.status === '使用中' ? '停用' : '启用'
  ElMessageBox.confirm(`确定要${action}设备「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      row.status = action === '停用' ? '已停用' : '使用中'
      ElMessage.success(`${action}成功`)
      fetchPageData()
    })
    .catch(() => {})
}

// ===== 查看详情 → 跳转新页面 =====
const handleView = (row: StorageDevice) => {
  router.push({ name: 'StorageDeviceDetail', params: { id: row.id } })
}

onMounted(() => {
  fetchPageData()
})
</script>

<style lang="scss" scoped>
// ===== 查询条件 =====
.search-wrapper {
  margin-bottom: 16px;
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

// ===== 操作栏 =====
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.type-filter {
  :deep(.el-radio-button__inner) {
    font-size: 13px;
    padding: 6px 14px;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-icon {
  font-size: 16px;
  font-weight: 600;
  margin-right: 2px;
}

// ===== 卡片网格 =====
.device-grid {
  min-height: 200px;
}

.card-grid-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

// ===== 设备卡片 =====
.device-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: calc(var(--custom-radius) + 4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: cardEnter 0.45s ease both;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &.type-fridge::after { background: linear-gradient(90deg, #42a5f5, #90caf9); }
  &.type-ult::after { background: linear-gradient(90deg, #ef5350, #ef9a9a); }
  &.type-ln2::after { background: linear-gradient(90deg, #ff9800, #ffcc80); }
  &.type-cooler::after { background: linear-gradient(90deg, #66bb6a, #a5d6a7); }
  &.type-freezer::after { background: linear-gradient(90deg, #5c6bc0, #9fa8da); }
  &.type-default::after { background: linear-gradient(90deg, #ab47bc, #ce93d8); }

  &:hover {
    transform: translateY(-3px);

    &::after { opacity: 1; }
  }

  &.inactive {
    opacity: 0.65;

    &:hover { opacity: 0.85; }
  }
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 卡片头部
.card-header {
  margin-bottom: 16px;
}

.card-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.3;
  flex: 0 0 auto;
}

.card-meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-code {
  font-size: 11px;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 4px;
}

// 样本类型
.card-sample {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 4px;

  i { font-size: 12px; }
}

// 设备类型标签（与详情页一致）
.card-type {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: 500;

  &.tag-fridge { background: #e3f2fd; color: #1565c0; }
  &.tag-ult { background: #fce4ec; color: #c62828; }
  &.tag-ln2 { background: #fff3e0; color: #e65100; }
  &.tag-cooler { background: #e8f5e9; color: #2e7d32; }
  &.tag-freezer { background: #e8eaf6; color: #283593; }
}

// 状态标签
.card-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;

  &.active {
    color: #2e7d32;
  }
  &.inactive {
    color: #9e9e9e;
  }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

// 容量进度条
.card-capacity {
  margin-bottom: 14px;
  padding: 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
}

.capacity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.capacity-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.capacity-percent {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.capacity-bar {
  height: 6px;
  background: var(--el-border-color-light);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.capacity-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;

  &.low { background: linear-gradient(90deg, #66bb6a, #81c784); }
  &.mid { background: linear-gradient(90deg, #ffa726, #ffb74d); }
  &.high { background: linear-gradient(90deg, #ef5350, #e57373); }
}

.capacity-detail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.cap-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.cap-val {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.cap-lbl {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

// 卡片底部操作 - 纯文字按钮，宽度自适应
.card-actions {
  display: flex;
  gap: 0;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--el-border-color-light);

  :deep(.el-button) {
    flex: 1;
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    border-radius: 0;

    &:not(:last-child) {
      border-right: 1px solid var(--el-border-color-light);
    }

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .toggle-text-btn.danger:hover {
    color: #ef5350 !important;
  }

  .toggle-text-btn.success:hover {
    color: #66bb6a !important;
  }
}

// ===== 空状态 =====
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  grid-column: 1 / -1;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--el-fill-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  i {
    font-size: 36px;
    color: var(--el-text-color-disabled);
  }
}

.empty-text {
  font-size: 15px;
  color: var(--el-text-color-secondary);
  margin: 0 0 20px 0;
}

// ===== 分页 =====
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

// ===== 抽屉表单 =====
.storage-form {
  .select-with-unit {
    display: flex;
    align-items: center;
    width: 100%;

    :deep(.el-select) {
      flex: 1;
    }

    .unit-suffix {
      margin-left: 8px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      white-space: nowrap;
    }
  }
}

// ===== TransitionGroup 动画 =====
.card-list-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}
.card-list-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.card-list-move {
  transition: transform 0.35s ease;
}
</style>