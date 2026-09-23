<!-- 技术平台质控 -->
<template>
  <div class="platform-qc art-full-height">
    <NgsrTab v-if="platform === 'ngsr'" />
    <NgsaTab v-else-if="platform === 'ngsa'" />
    <PcrTab v-else-if="platform === 'pcr10' || platform === 'pcr11'" :sub-platform="platform" />
    <PcrEmptyTab v-else-if="platform === 'pcr-empty'" :title="pcrEmptyTitle" />
    <PcrEmptyTab v-else-if="platform === 'empty'" :title="emptyTitle" />
    <SangerTab v-else-if="platform === 'sanger'" />
    <Cd348Tab v-else-if="platform === 'cd348'" />
    <E6e7Tab v-else-if="platform === 'e6e7'" />
  </div>
</template>

<script setup lang="ts">
  import NgsrTab from './modules/ngsr-tab.vue'
  import NgsaTab from './modules/ngsa-tab.vue'
  import PcrTab from './modules/pcr-tab.vue'
  import PcrEmptyTab from './modules/pcr-empty-tab.vue'
  import SangerTab from './modules/sanger-tab.vue'
  import Cd348Tab from './modules/cd348-tab.vue'
  import E6e7Tab from './modules/e6e7-tab.vue'

  defineOptions({ name: 'PlatformQc' })

  const route = useRoute()

  const pcrEmptyTitleMap: Record<string, string> = {
    Lung3plus8Qc: '肺癌3+8',
    BrafQc: 'BRAF',
    CdPcrQc: 'CD',
    CmvQc: 'CMV',
    PcrE6e7Qc: 'E6E7',
    MsiQc: 'MSI',
    Pik3caQc: 'PIK3CA',
    ColonKnpbQc: '肠癌KNPB',
    GeneRearrangeBtQc: '基因重排B+T',
    ThyroidMultiGeneQc: '甲癌多基因',
    ThyroidThreeGeneQc: '甲癌三基因',
    TuberculosisQc: '结核'
  }

  const emptyTitleMap: Record<string, string> = {
    Her2Qc: 'HER2',
    Mdm2Qc: 'MDM2',
    LymphomaQc: '淋巴瘤',
    SoftTissueQc: '软组织'
  }

  const platform = computed(() => {
    const name = route.name as string
    if (name === 'NgsrQc') return 'ngsr'
    if (name === 'NgsaQc') return 'ngsa'
    if (name === 'Pcr10Qc') return 'pcr10'
    if (name === 'Pcr11Qc') return 'pcr11'
    if (pcrEmptyTitleMap[name]) return 'pcr-empty'
    if (emptyTitleMap[name]) return 'empty'
    if (name === 'SangerQc') return 'sanger'
    if (name === 'Cd348Qc') return 'cd348'
    if (name === 'E6e7Qc') return 'e6e7'
    return 'ngsr'
  })

  const pcrEmptyTitle = computed(() => {
    return pcrEmptyTitleMap[route.name as string] || ''
  })

  const emptyTitle = computed(() => {
    return emptyTitleMap[route.name as string] || ''
  })
</script>

<style lang="scss" scoped>
  .platform-qc {
    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }
</style>
