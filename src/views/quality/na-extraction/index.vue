<!-- 核酸提取 -->
<template>
  <div class="na-extraction art-full-height">
    <DnaTab v-if="subType === 'dna'" />
    <RnaTab v-else-if="subType === 'rna'" />
    <BatchTab v-else-if="subType === 'batch'" />
  </div>
</template>

<script setup lang="ts">
  import DnaTab from './modules/dna-tab.vue'
  import RnaTab from './modules/rna-tab.vue'
  import BatchTab from './modules/batch-tab.vue'

  defineOptions({ name: 'NaExtraction' })

  const route = useRoute()

  const subType = computed(() => {
    const name = route.name as string
    if (name === 'DnaQc') return 'dna'
    if (name === 'RnaQc') return 'rna'
    if (name === 'NaBatchQc') return 'batch'
    return 'dna'
  })
</script>