<!-- 技术平台质控 -->
<template>
  <div class="platform-qc art-full-height">
    <NgsrTab v-if="platform === 'ngsr'" />
    <NgsaTab v-else-if="platform === 'ngsa'" />
    <PcrTab v-else-if="platform === 'pcr10' || platform === 'pcr11'" :sub-platform="platform" />
    <FishTab v-else-if="platform === 'fish'" />
    <SangerTab v-else-if="platform === 'sanger'" />
    <Cd348Tab v-else-if="platform === 'cd348'" />
    <E6e7Tab v-else-if="platform === 'e6e7'" />
  </div>
</template>

<script setup lang="ts">
  import NgsrTab from './modules/ngsr-tab.vue'
  import NgsaTab from './modules/ngsa-tab.vue'
  import PcrTab from './modules/pcr-tab.vue'
  import FishTab from './modules/fish-tab.vue'
  import SangerTab from './modules/sanger-tab.vue'
  import Cd348Tab from './modules/cd348-tab.vue'
  import E6e7Tab from './modules/e6e7-tab.vue'

  defineOptions({ name: 'PlatformQc' })

  const route = useRoute()

  const platform = computed(() => {
    const name = route.name as string
    if (name === 'NgsrQc') return 'ngsr'
    if (name === 'NgsaQc') return 'ngsa'
    if (name === 'Pcr10Qc') return 'pcr10'
    if (name === 'Pcr11Qc') return 'pcr11'
    if (name === 'FishQc') return 'fish'
    if (name === 'SangerQc') return 'sanger'
    if (name === 'Cd348Qc') return 'cd348'
    if (name === 'E6e7Qc') return 'e6e7'
    return 'ngsr'
  })
</script>

<style lang="scss" scoped>
  .platform-qc {
    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }
</style>
