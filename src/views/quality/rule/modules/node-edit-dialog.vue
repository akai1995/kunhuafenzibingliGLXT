<!-- 节点新增/编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="420px"
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <ElFormItem :label="labelText" prop="name">
        <ElInput v-model="formData.name" :placeholder="`请输入${labelText}`" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'NodeEditDialog' })

  type NodeType = 'platform' | 'category' | 'project' | 'template'

  interface Props {
    visible: boolean
    mode: 'add' | 'edit'
    nodeType: NodeType
    nodeName?: string
  }

  interface Emits {
    (e: 'update:visible', val: boolean): void
    (e: 'submit', name: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    nodeName: ''
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const formData = reactive({ name: '' })

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const nodeTypeMap: Record<NodeType, string> = {
    platform: '平台',
    category: '分类',
    project: '项目',
    template: '模板'
  }

  const labelText = computed(() => nodeTypeMap[props.nodeType])

  const dialogTitle = computed(() => {
    const action = props.mode === 'add' ? '新增' : '编辑'
    return `${action}${nodeTypeMap[props.nodeType]}`
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        formData.name = props.mode === 'edit' ? props.nodeName : ''
        nextTick(() => formRef.value?.clearValidate())
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      emit('submit', formData.name)
      dialogVisible.value = false
    })
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }
</script>
