<!-- PCR子项目空占位页面 -->
<template>
  <ElCard class="art-table-card">
    <ElEmpty :description="pageTitle" />
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'PcrEmptyTab' })

  interface Props {
    title: string
  }

  const props = defineProps<Props>()

  const pageTitle = computed(() => `${props.title}`)
</script>
