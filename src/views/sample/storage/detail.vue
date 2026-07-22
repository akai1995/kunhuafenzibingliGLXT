<!-- 存储设备详情 -->
<template>
  <div class="storage-detail">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        <ArtSvgIcon icon="ri:arrow-left-line" />
        <span>返回设备列表</span>
      </button>
      <div class="header-info">
        <h1 class="device-name">{{ device?.name || '-' }}</h1>
        <span class="header-type-tag" :class="typeTagClass">{{ device?.type || '-' }}</span>
        <span class="header-code">{{ device?.code || '-' }}</span>
        <span class="header-status" :class="device?.status === '使用中' ? 'active' : 'inactive'">
          <span class="status-dot"></span>
          {{ device?.status || '-' }}
        </span>
      </div>
    </div>

    <!-- 设备指标卡片 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon total-icon">
          <ArtSvgIcon icon="ri:archive-stack-line" />
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ device?.totalCapacity || 0 }}</span>
          <span class="metric-label">存储总量</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon occupied-icon">
          <ArtSvgIcon icon="ri:checkbox-circle-line" />
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ device?.occupied || 0 }}</span>
          <span class="metric-label">已占用</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon free-icon">
          <ArtSvgIcon icon="ri:checkbox-blank-circle-line" />
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ device?.free || 0 }}</span>
          <span class="metric-label">空闲</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon usage-icon">
          <ArtSvgIcon icon="ri:donut-chart-line" />
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ usagePercent }}%</span>
          <span class="metric-label">使用率</span>
        </div>
        <div class="progress-ring">
          <svg viewBox="0 0 48 48" class="ring-svg">
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--el-border-color-light)" stroke-width="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              :stroke="usageColor"
              stroke-width="4"
              stroke-linecap="round"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="ringOffset"
              transform="rotate(-90 24 24)"
              class="ring-progress"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- 设备详细信息 -->
    <div class="info-section">
      <div class="section-title">
        <ArtSvgIcon icon="ri:information-line" />
        <span>设备信息</span>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">设备名称</span>
          <span class="info-value">{{ device?.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">设备编号</span>
          <span class="info-value">{{ device?.code || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">设备类型</span>
          <span class="info-value">{{ device?.type || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">运行状态</span>
          <span class="info-value">
            <span class="status-tag-inline" :class="device?.status === '使用中' ? 'active' : 'inactive'">
              {{ device?.status || '-' }}
            </span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">区分样本类型</span>
          <span class="info-value">{{ device?.differentiateSampleType ? '是' : '否' }}</span>
        </div>
        <div class="info-item" v-if="device?.differentiateSampleType">
          <span class="info-label">样本类型</span>
          <span class="info-value">{{ device?.sampleType || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">冻存架数量</span>
          <span class="info-value">{{ device?.rackCount || 0 }} 个</span>
        </div>
        <div class="info-item">
          <span class="info-label">冻存架层数</span>
          <span class="info-value">{{ device?.rackLayers || 0 }} 层</span>
        </div>
        <div class="info-item">
          <span class="info-label">每层冻存盒数</span>
          <span class="info-value">{{ device?.boxesPerLayer || 0 }} 个</span>
        </div>
        <div class="info-item">
          <span class="info-label">冻存盒规格</span>
          <span class="info-value">{{ device?.boxSpec || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 冻存盒状态 -->
    <div class="box-grid-section" v-if="device && device.totalCapacity > 0">
      <div class="section-title">
        <ArtSvgIcon icon="ri:grid-line" />
        <span>冻存盒状态</span>
        <div class="box-legend">
          <span class="legend-item">
            <span class="legend-dot free"></span> 空闲
          </span>
          <span class="legend-item">
            <span class="legend-dot occupied"></span> 已占用
          </span>
        </div>
      </div>

      <div class="box-rack-grid">
        <div
          v-for="(rack, ri) in boxGrid"
          :key="ri"
          class="rack-card"
          :style="{ animationDelay: `${ri * 60}ms` }"
        >
          <div class="rack-header">
            <span class="rack-label">冻存架 {{ ri + 1 }}</span>
            <span class="rack-stats">
              {{ countRackOccupied(rack) }}/{{ countRackTotal(rack) }}
            </span>
          </div>
          <div class="rack-layers">
            <div
              v-for="(layer, li) in rack"
              :key="li"
              class="layer-row"
            >
              <span class="layer-label">L{{ li + 1 }}</span>
              <div class="box-cells">
                <div
                  v-for="(box, bi) in layer"
                  :key="bi"
                  class="box-cell"
                  :class="box.occupied ? 'occupied' : 'free'"
                  :title="`冻存盒 ${bi + 1} — ${box.occupied ? '已占用' : '空闲'}`"
                >
                  {{ bi + 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-if="!device" class="empty-state">
      <i class="ri-error-warning-line"></i>
      <p>未找到设备信息</p>
      <ElButton type="primary" @click="goBack">返回列表</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDeviceById, type StorageDevice, type BoxItem } from './mock-data'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

defineOptions({ name: 'StorageDeviceDetail' })

const route = useRoute()
const router = useRouter()

const deviceId = computed(() => Number(route.params.id))
const device = ref<StorageDevice | undefined>(undefined)

// 设备类型标签样式
const typeTagClass = computed(() => {
  const map: Record<string, string> = {
    '冰箱': 'tag-fridge',
    '超低温冰箱': 'tag-ult',
    '液氮罐': 'tag-ln2',
    '冷藏柜': 'tag-cooler',
    '冷冻柜': 'tag-freezer'
  }
  return map[device.value?.type || ''] || ''
})

// 使用率计算
const usagePercent = computed(() => {
  if (!device.value || device.value.totalCapacity === 0) return 0
  return Math.round((device.value.occupied / device.value.totalCapacity) * 100)
})

const ringCircumference = 2 * Math.PI * 20 // ~125.66
const ringOffset = computed(() => {
  return ringCircumference - (usagePercent.value / 100) * ringCircumference
})

const usageColor = computed(() => {
  if (usagePercent.value >= 80) return '#e57373'
  if (usagePercent.value >= 50) return '#ffb74d'
  return '#66bb6a'
})

// 冻存盒网格
const boxGrid = computed<BoxItem[][][]>(() => {
  if (!device.value || device.value.totalCapacity === 0) return []
  const { rackCount, rackLayers, boxesPerLayer, occupied } = device.value
  const grid: BoxItem[][][] = []
  let occupiedCount = 0
  for (let r = 0; r < rackCount; r++) {
    const rack: BoxItem[][] = []
    for (let l = 0; l < rackLayers; l++) {
      const layer: BoxItem[] = []
      for (let b = 0; b < boxesPerLayer; b++) {
        const isOccupied = occupiedCount < occupied
        layer.push({ occupied: isOccupied })
        if (isOccupied) occupiedCount++
      }
      rack.push(layer)
    }
    grid.push(rack)
  }
  return grid
})

function countRackTotal(rack: BoxItem[][]) {
  return rack.reduce((sum, layer) => sum + layer.length, 0)
}

function countRackOccupied(rack: BoxItem[][]) {
  return rack.reduce((sum, layer) => sum + layer.filter((b) => b.occupied).length, 0)
}

function goBack() {
  router.push({ name: 'SampleStorage' })
}

onMounted(() => {
  device.value = getDeviceById(deviceId.value)
})
</script>

<style lang="scss" scoped>
.storage-detail {
  padding: 0;
  min-height: 100%;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

// ===== 顶部导航 =====
.detail-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: calc(var(--custom-radius) + 4px);

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }

  :deep(.art-svg-icon) {
    font-size: 18px;
  }
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;

  @media (max-width: 767px) {
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.device-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.3px;
  flex: 0 0 auto;
}

.header-type-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
  flex: 0 0 auto;

  &.tag-fridge { background: #e3f2fd; color: #1565c0; }
  &.tag-ult { background: #fce4ec; color: #c62828; }
  &.tag-ln2 { background: #fff3e0; color: #e65100; }
  &.tag-cooler { background: #e8f5e9; color: #2e7d32; }
  &.tag-freezer { background: #e8eaf6; color: #283593; }
}

.header-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  flex: 0 0 auto;
}

.header-status {
  display: flex;
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

  @media (max-width: 767px) {
    margin-left: 0;
  }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

// ===== 指标卡片行 =====
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: calc(var(--custom-radius) + 4px);
  transition: all 0.25s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    border-radius: 3px 0 0 3px;
  }

  &:nth-child(1)::before { background: #42a5f5; }
  &:nth-child(2)::before { background: #ef5350; }
  &:nth-child(3)::before { background: #66bb6a; }
  &:nth-child(4)::before { background: #ffa726; }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }
}

.metric-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;

  &.total-icon { background: #e3f2fd; color: #1565c0; }
  &.occupied-icon { background: #fce4ec; color: #c62828; }
  &.free-icon { background: #e8f5e9; color: #2e7d32; }
  &.usage-icon { background: #fff3e0; color: #e65100; }
}

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.metric-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

// 进度环
.progress-ring {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.ring-svg {
  width: 48px;
  height: 48px;
}

.ring-progress {
  transition: stroke-dashoffset 0.8s ease;
}

// ===== 设备信息 =====
.info-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: calc(var(--custom-radius) + 4px);
  padding: 20px 24px;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);

  i {
    font-size: 18px;
    color: var(--el-color-primary);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.status-tag-inline {
  display: inline-block;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: 500;

  &.active {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.inactive {
    background: #fafafa;
    color: #9e9e9e;
  }
}

// ===== 冻存盒状态 =====
.box-grid-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: calc(var(--custom-radius) + 4px);
  padding: 20px 24px;
  margin-bottom: 20px;

  .section-title {
    margin-bottom: 20px;

    .box-legend {
      display: flex;
      gap: 16px;
      margin-left: auto;
      font-size: 12px;
      font-weight: 400;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--el-text-color-secondary);
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      border: 1px solid;

      &.free {
        background: #e8f5e9;
        border-color: #81c784;
      }
      &.occupied {
        background: #ffebee;
        border-color: #e57373;
      }
    }
  }
}

.box-rack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.rack-card {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 16px;
  background: var(--el-fill-color-blank);
  animation: rackSlideIn 0.4s ease both;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
}

@keyframes rackSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.rack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.rack-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.rack-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  background: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 4px;
}

.rack-layers {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.layer-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  width: 24px;
  flex-shrink: 0;
  text-align: right;
}

.box-cells {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.box-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: default;
  transition: all 0.15s ease;

  &:hover {
    transform: scale(1.15);
    z-index: 1;
  }

  &.free {
    background: #e8f5e9;
    border: 1px solid #a5d6a7;
    color: #2e7d32;
  }

  &.occupied {
    background: #ffebee;
    border: 1px solid #ef9a9a;
    color: #c62828;
  }
}

// ===== 空状态 =====
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--el-text-color-secondary);

  i {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--el-border-color);
  }

  p {
    font-size: 15px;
    margin-bottom: 20px;
  }
}
</style>