<!-- 表格按钮 -->
<template>
  <span class="inline-block align-middle">
    <div
      ref="triggerRef"
      :class="[
        'inline-flex items-center justify-center min-w-8 h-8 px-2.5 mr-2.5 text-sm rounded-md align-middle',
        buttonClass,
        disabled ? 'opacity-50 cursor-not-allowed' : 'c-p'
      ]"
      :style="{ backgroundColor: buttonBgColor, color: iconColor }"
      @click="handleClick"
      @mouseenter="tooltipVisible = true"
      @mouseleave="tooltipVisible = false"
    >
      <ArtSvgIcon :icon="iconContent" />
    </div>
    <ElTooltip
      v-if="tooltipContent"
      v-model:visible="tooltipVisible"
      :content="tooltipContent"
      placement="top"
      :virtual-triggering="true"
      :virtual-ref="triggerRef"
      :show-after="300"
      :popper-options="{
        strategy: 'fixed'
      }"
    />
  </span>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'

  defineOptions({ name: 'ArtButtonTable', inheritAttrs: false })

  interface Props {
    /** 按钮类型 */
    type?: 'add' | 'edit' | 'delete' | 'more' | 'view'
    /** 按钮图标 */
    icon?: string
    /** 按钮样式类 */
    iconClass?: string
    /** icon 颜色 */
    iconColor?: string
    /** 按钮背景色 */
    buttonBgColor?: string
    /** tooltip 提示文本 */
    title?: string
    /** 禁用状态 */
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false
  })

  const emit = defineEmits<{
    (e: 'click'): void
  }>()

  // 触发元素引用
  const triggerRef: Ref<HTMLElement | null> = ref(null)
  const tooltipVisible = ref(false)

  // 默认按钮配置
  const defaultButtons = {
    add: { icon: 'ri:add-fill', class: 'bg-theme/12 text-theme', title: '新增' },
    edit: { icon: 'ri:pencil-line', class: 'bg-secondary/12 text-secondary', title: '编辑' },
    delete: { icon: 'ri:delete-bin-5-line', class: 'bg-error/12 text-error', title: '删除' },
    view: { icon: 'ri:eye-line', class: 'bg-info/12 text-info', title: '查看' },
    more: { icon: 'ri:more-2-fill', class: 'bg-g-300/55 dark:bg-g-300/40 text-g-700', title: '更多' }
  } as const

  // 获取图标内容
  const iconContent = computed(() => {
    return props.icon || (props.type ? defaultButtons[props.type]?.icon : '') || ''
  })

  // 获取按钮样式类
  const buttonClass = computed(() => {
    return props.iconClass || (props.type ? defaultButtons[props.type]?.class : '') || ''
  })

  // tooltip 内容：优先使用 title prop，否则根据 type 自动生成
  const tooltipContent = computed(() => {
    if (props.title) return props.title
    if (props.type) return defaultButtons[props.type]?.title || ''
    return ''
  })

  const handleClick = () => {
    if (props.disabled) return
    emit('click')
  }
</script>
