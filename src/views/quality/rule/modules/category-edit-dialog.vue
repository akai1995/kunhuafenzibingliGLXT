<!-- 质控分类新增/编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="420px"
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <ElFormItem label="分类名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入分类名称" />
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

  defineOptions({ name: 'CategoryEditDialog' })

  interface Props {
    visible: boolean
    mode: 'add' | 'edit'
    categoryName?: string
  }

  interface Emits {
    (e: 'update:visible', val: boolean): void
    (e: 'submit', name: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    categoryName: ''
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const formData = reactive({ name: '' })

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const dialogTitle = computed(() => {
    const action = props.mode === 'add' ? '新增' : '编辑'
    return `${action}质控分类`
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        formData.name = props.mode === 'edit' ? props.categoryName : ''
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