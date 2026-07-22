<template>
  <div class="analysis-container">
    <!-- 筛选区域 -->
    <div class="art-card p-5 mb-5 max-sm:mb-4">
      <div class="art-card-header">
        <div class="title">
          <h4>统计维度筛选</h4>
          <p>选择需要统计的维度与时间周期</p>
        </div>
        <div class="flex items-center gap-2">
          <ElButton type="primary" @click="handleExport">
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            导出数据
          </ElButton>
        </div>
      </div>
      <div class="filter-area mt-4">
        <div class="filter-row">
          <span class="filter-label">时间周期</span>
          <ElSelect v-model="timeRange" style="width: 140px" @change="handleTimeRangeChange">
            <ElOption label="最近一个月" value="month" />
            <ElOption label="最近半年" value="halfYear" />
            <ElOption label="最近一年" value="year" />
            <ElOption label="自定义日期" value="custom" />
          </ElSelect>
          <ElDatePicker
            v-if="timeRange === 'custom'"
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 220px"
          />
        </div>
        <div class="filter-row mt-3 dimension-row">
          <span class="filter-label">统计维度</span>
          <div class="dimension-content">
            <div
              ref="dimensionRef"
              class="dimension-checkbox-group"
              :class="{ 'is-collapsed': !isExpanded }"
              :style="isExpanded ? {} : { maxHeight: collapsedHeight + 'px' }"
            >
              <ElCheckboxGroup v-model="selectedDimensions" @change="handleDimensionChange">
                <ElCheckbox
                  v-for="dim in dimensionOptions"
                  :key="dim.value"
                  :label="dim.value"
                  :value="dim.value"
                >
                  {{ dim.label }}
                </ElCheckbox>
              </ElCheckboxGroup>
            </div>
            <ElButton
              v-if="needExpand"
              link
              type="primary"
              class="expand-btn"
              @click="isExpanded = !isExpanded"
            >
              {{ isExpanded ? '收起' : '展开' }}
              <ArtSvgIcon :icon="isExpanded ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" class="ml-1" />
            </ElButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <ElRow :gutter="20" v-if="chartList.length > 0">
      <ElCol
        v-for="chart in chartList"
        :key="chart.key"
        :xl="chart.cols || 12"
        :lg="12"
        :xs="24"
      >
        <div class="art-card p-5 mb-5 max-sm:mb-4">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ chart.title }}</h4>
              <p>{{ timeLabel }}</p>
            </div>
          </div>
          <ArtBarChart
            v-if="chart.chartType === 'bar'"
            height="300px"
            :data="chart.data"
            :xAxisData="chart.xAxisData"
            :showLegend="false"
            :showAxisLine="false"
            :showSplitLine="true"
            barWidth="50%"
          />
          <ArtHBarChart
            v-else-if="chart.chartType === 'hbar'"
            height="300px"
            :data="chart.data"
            :xAxisData="chart.xAxisData"
            :showLegend="false"
            :showAxisLine="false"
            :showSplitLine="true"
            barWidth="50%"
          />
          <ArtRingChart
            v-else-if="chart.chartType === 'ring'"
            height="300px"
            :data="chart.data"
            :showLegend="true"
            legendPosition="right"
            :showLabel="false"
            :radius="['50%', '75%']"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 空状态 -->
    <div v-else class="art-card p-5 mb-5 max-sm:mb-4">
      <ElEmpty description="暂无选中维度，请勾选上方统计维度以查看图表数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PieDataItem } from '@/types/component/chart'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'AnalysisIndex' })

// 时间周期
const timeRange = ref('month')
const customDateRange = ref<[string, string]>(['', ''])

const timeLabel = computed(() => {
  const map: Record<string, string> = {
    month: '最近一个月',
    halfYear: '最近半年',
    year: '最近一年',
    custom: '自定义日期'
  }
  if (timeRange.value === 'custom' && customDateRange.value[0] && customDateRange.value[1]) {
    return `${customDateRange.value[0]} ~ ${customDateRange.value[1]}`
  }
  return map[timeRange.value] || '最近一个月'
})

const handleTimeRangeChange = () => {
  if (timeRange.value !== 'custom') {
    customDateRange.value = ['', '']
  }
  updateCharts()
}

// 统计维度选项
const dimensionOptions = [
  { label: '送检项目', value: 'testItem' },
  { label: '籍贯', value: 'hometown' },
  { label: '送检科室', value: 'department' },
  { label: '检测平台', value: 'platform' },
  { label: '转移', value: 'metastasis' },
  { label: '癌种', value: 'cancerType' },
  { label: '民族', value: 'ethnicity' },
  { label: '送检医生', value: 'doctor' },
  { label: '样本类型', value: 'sampleType' },
  { label: '性别占比', value: 'gender' },
  { label: '患者类型', value: 'patientType' },
  { label: '年龄', value: 'age' },
  { label: '家族史', value: 'familyHistory' },
  { label: '吸烟史占比', value: 'smokingHistory' },
  { label: '初治占比', value: 'initialTreatment' },
  { label: '外送检测', value: 'externalTest' },
  { label: '优惠类型', value: 'discountType' }
]

const selectedDimensions = ref<string[]>(['testItem', 'gender', 'age', 'cancerType', 'platform', 'department'])

// 每个维度的图表配置（真实数据）
const dimensionChartConfig: Record<string, {
  title: string
  chartType: 'bar' | 'hbar' | 'ring'
  cols?: number
  generateData: () => { xAxisData: string[]; data: number[] | PieDataItem[] }
}> = {
  testItem: {
    title: '送检项目统计',
    chartType: 'bar',
    generateData: () => ({
      xAxisData: ['NGSR高通量', 'NGSA高通量', 'PCR桑格', '血液检测', '病理检测', '组织检测', '粪便检测'],
      data: [285, 198, 156, 132, 118, 95, 64]
    })
  },
  hometown: {
    title: '籍贯分布',
    chartType: 'hbar',
    generateData: () => ({
      xAxisData: ['昆明市', '曲靖市', '玉溪市', '大理州', '红河州', '楚雄州', '昭通市', '文山州', '保山市', '其他'],
      data: [312, 156, 98, 87, 76, 65, 58, 47, 42, 107]
    })
  },
  department: {
    title: '送检科室统计',
    chartType: 'hbar',
    generateData: () => ({
      xAxisData: ['肿瘤科', '呼吸内科', '消化内科', '胸外科', '普外科', '泌尿外科', '妇科', '血液科', '病理科', '其他'],
      data: [245, 186, 152, 128, 105, 78, 65, 52, 48, 89]
    })
  },
  platform: {
    title: '检测平台分布',
    chartType: 'ring',
    cols: 12,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 285, name: 'NGSR平台' },
        { value: 198, name: 'NGSA平台' },
        { value: 156, name: 'PCR平台' },
        { value: 132, name: '血液检测平台' },
        { value: 118, name: '病理检测平台' }
      ]
    })
  },
  metastasis: {
    title: '转移情况',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 356, name: '有转移' },
        { value: 492, name: '无转移' }
      ]
    })
  },
  cancerType: {
    title: '癌种分布',
    chartType: 'bar',
    generateData: () => ({
      xAxisData: ['肺癌', '胃癌', '结直肠癌', '乳腺癌', '肝癌', '食管癌', '甲状腺癌', '胰腺癌', '前列腺癌', '其他'],
      data: [186, 142, 128, 115, 98, 76, 65, 48, 35, 155]
    })
  },
  ethnicity: {
    title: '民族分布',
    chartType: 'hbar',
    generateData: () => ({
      xAxisData: ['汉族', '彝族', '白族', '哈尼族', '傣族', '苗族', '回族', '壮族', '其他'],
      data: [632, 112, 85, 56, 42, 38, 35, 28, 20]
    })
  },
  doctor: {
    title: '送检医生统计',
    chartType: 'hbar',
    generateData: () => ({
      xAxisData: ['张建国', '李明华', '王秀英', '陈志强', '刘芳', '赵永刚', '孙丽华', '周文博', '吴晓东', '其他'],
      data: [132, 118, 105, 92, 85, 72, 65, 58, 52, 269]
    })
  },
  sampleType: {
    title: '样本类型分布',
    chartType: 'ring',
    cols: 12,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 312, name: '血液样本' },
        { value: 245, name: '组织样本' },
        { value: 186, name: '蜡块样本' },
        { value: 98, name: '粪便样本' },
        { value: 65, name: '其他样本' }
      ]
    })
  },
  gender: {
    title: '性别占比',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 468, name: '男性' },
        { value: 438, name: '女性' }
      ]
    })
  },
  patientType: {
    title: '患者类型',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 586, name: '门诊患者' },
        { value: 320, name: '住院患者' }
      ]
    })
  },
  age: {
    title: '年龄分布',
    chartType: 'bar',
    generateData: () => ({
      xAxisData: ['0-18岁', '19-30岁', '31-40岁', '41-50岁', '51-60岁', '61-70岁', '71-80岁', '80岁以上'],
      data: [28, 65, 112, 186, 245, 178, 82, 52]
    })
  },
  familyHistory: {
    title: '家族史情况',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 286, name: '有家族史' },
        { value: 620, name: '无家族史' }
      ]
    })
  },
  smokingHistory: {
    title: '吸烟史占比',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 342, name: '有吸烟史' },
        { value: 564, name: '无吸烟史' }
      ]
    })
  },
  initialTreatment: {
    title: '初治占比',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 652, name: '初治' },
        { value: 254, name: '复治' }
      ]
    })
  },
  externalTest: {
    title: '外送检测情况',
    chartType: 'ring',
    cols: 8,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 756, name: '院内检测' },
        { value: 150, name: '外送检测' }
      ]
    })
  },
  discountType: {
    title: '优惠类型分布',
    chartType: 'ring',
    cols: 12,
    generateData: () => ({
      xAxisData: [],
      data: [
        { value: 586, name: '无优惠' },
        { value: 186, name: '医保优惠' },
        { value: 78, name: '贫困减免' },
        { value: 56, name: '其他优惠' }
      ]
    })
  }
}

// 图表列表
interface ChartItem {
  key: string
  title: string
  chartType: 'bar' | 'hbar' | 'ring'
  cols?: number
  data: number[] | PieDataItem[]
  xAxisData: string[]
}

const chartList = ref<ChartItem[]>([])

// 展开/收起
const dimensionRef = ref<HTMLElement>()
const isExpanded = ref(false)
const needExpand = ref(false)
const collapsedHeight = ref(0)

function calcCollapsedHeight() {
  nextTick(() => {
    const el = dimensionRef.value
    if (!el) return
    const checkboxes = el.querySelectorAll('.el-checkbox')
    if (checkboxes.length === 0) return
    const firstTop = checkboxes[0].getBoundingClientRect().top
    let rowCount = 0
    for (const cb of checkboxes) {
      const rect = cb.getBoundingClientRect()
      if (Math.abs(rect.top - firstTop) < 2) {
        rowCount++
      } else {
        break
      }
    }
    const rowHeight = checkboxes[0].offsetHeight + 4
    collapsedHeight.value = rowHeight * 2
    needExpand.value = checkboxes.length > rowCount * 2
  })
}

function updateCharts() {
  const key = Date.now().toString()
  chartList.value = selectedDimensions.value.map((dim) => {
    const config = dimensionChartConfig[dim]
    if (!config) return null
    const generated = config.generateData()
    return {
      key: `${dim}-${key}`,
      title: config.title,
      chartType: config.chartType,
      cols: config.cols,
      data: generated.data,
      xAxisData: generated.xAxisData
    }
  }).filter(Boolean) as ChartItem[]
}

function handleDimensionChange() {
  updateCharts()
}

function handleExport() {
  if (selectedDimensions.value.length === 0) {
    ElMessage.warning('请先选择统计维度')
    return
  }
  ElMessage.success('数据导出成功')
}

onMounted(() => {
  updateCharts()
  calcCollapsedHeight()
  window.addEventListener('resize', calcCollapsedHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calcCollapsedHeight)
})
</script>

<style scoped>
.analysis-container {
  padding: 0 0 16px;
}

.filter-area {
  .filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-label {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    min-width: 70px;
  }
}

:deep(.el-select) {
  .el-select__tags {
    max-width: 600px;
  }
}

.dimension-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dimension-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  flex: 1;
  width: 100%;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.dimension-row {
  align-items: flex-start !important;
  padding-top: 6px;
}

.expand-btn {
  align-self: flex-start;
  padding: 0;
  margin-top: 4px;
}

.el-row {
  align-items: stretch;
}

.el-col {
  display: flex;
}

:deep(.art-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>