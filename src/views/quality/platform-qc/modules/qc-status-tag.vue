<!-- 质控状态标签 -->
<template>
  <ElTag :type="tagType" :class="{ clickable }" size="small" @click="handleClick">
    {{ status || '-' }}
  </ElTag>
</template>

<script setup lang="ts">
  defineOptions({ name: 'QcStatusTag' })

  interface Props {
    status?: string
    clickable?: boolean
  }

  interface Emits {
    (e: 'click'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    status: '',
    clickable: false
  })
  const emit = defineEmits<Emits>()

  const tagType = computed(() => {
    switch (props.status) {
      case '合格':
        return 'success'
      case '不合格':
        return 'danger'
      case '待质控':
        return 'info'
      default:
        return 'info'
    }
  })

  const handleClick = () => {
    if (props.clickable) emit('click')
  }
</script>

<style lang="scss" scoped>
  .clickable {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
</style>
