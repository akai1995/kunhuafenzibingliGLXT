<!-- 通用操作弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" :title="title" :width="dialogWidth" :close-on-click-modal="true">
    <!-- 病理科购买切片申请：展示接诊单样式 -->
    <template v-if="actionType === 'sliceApply'">
      <div class="order-preview">
        <div class="preview-header">
          <h3>分子病理检测送检单</h3>
          <div class="preview-code">申请编码：{{ orderData?.applyCode || '-' }}</div>
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="患者姓名">{{ orderData?.patientName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="性别">{{ orderData?.gender || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="年龄">{{ orderData?.age || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="住院号">{{ orderData?.hospitalNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="门诊号">{{ orderData?.outpatientNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检医院">{{ orderData?.hospital || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检科室">{{ orderData?.department || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检医生">{{ orderData?.doctor || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="检测项目">{{ orderData?.projectName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="病理号">{{ orderData?.pathologyNo || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本类型">{{ orderData?.sampleType || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="样本编码">{{ orderData?.sampleCode || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="临床诊断" :span="2">{{ orderData?.pathologyDiagnosis || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </template>

    <!-- 知情同意书：展示同意书信息 -->
    <template v-if="actionType === 'consent'">
      <div class="consent-doc">
        <div class="consent-header">
          <h3>分子病理检测知情同意书</h3>
        </div>
        <div class="consent-body">
          <p>尊敬的患者：</p>
          <p>
            您的医生建议您进行分子病理检测（检测项目：{{ orderData?.projectName || '-' }}）。
            为了让您充分了解本次检测的相关内容，特告知如下：
          </p>
          <p><strong>一、检测目的</strong></p>
          <p>通过检测肿瘤组织或体液中的基因突变、融合、表达等信息，辅助临床医生进行精准诊断、预后评估及治疗方案选择。</p>
          <p><strong>二、检测方法</strong></p>
          <p>采用PCR扩增、测序、FISH、免疫组化或NGS高通量测序等分子生物学技术。</p>
          <p><strong>三、检测风险与局限性</strong></p>
          <p>1. 检测结果受样本质量、含量等因素影响，可能出现检测失败；</p>
          <p>2. 部分基因变异的临床意义尚不明确，可能需要进一步验证；</p>
          <p>3. 检测结果仅作为临床参考，最终诊疗方案由主治医生综合判断。</p>
          <p><strong>四、样本使用</strong></p>
          <p>本次检测所用样本将仅用于指定检测项目，检测后剩余样本按规定保存或销毁。</p>
          <p><strong>五、知情同意</strong></p>
          <p>本人已仔细阅读以上内容，充分理解检测的目的、方法、风险及局限性，同意进行本次分子病理检测。</p>
        </div>
        <div class="consent-footer">
          <div class="consent-sign">
            <span>患者/委托人签字：</span>
            <span class="sign-line"></span>
          </div>
          <div class="consent-sign">
            <span>签署日期：</span>
            <span class="sign-line"></span>
          </div>
        </div>
      </div>
    </template>

    <!-- 缴费单打印：展示缴费单信息 -->
    <template v-if="actionType === 'paymentPrint'">
      <div class="payment-doc">
        <div class="payment-header">
          <h3>分子病理检测缴费单</h3>
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="申请编码">{{ orderData?.applyCode || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="患者姓名">{{ orderData?.patientName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="检测项目">{{ orderData?.projectName || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检医院">{{ orderData?.hospital || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检科室">{{ orderData?.department || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="送检医生">{{ orderData?.doctor || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
        <div class="payment-amount">
          <span class="amount-label">检测费用：</span>
          <span class="amount-value">¥ {{ (orderData?.projectPrice || 0).toFixed(2) }}</span>
        </div>
      </div>
    </template>

    <!-- 改为待转：二次确认 -->
    <template v-if="actionType === 'statusChange'">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="申请编码">
          <ElInput v-model="formData.applyCode" disabled />
        </ElFormItem>
        <ElFormItem label="患者姓名">
          <ElInput v-model="formData.patientName" disabled />
        </ElFormItem>
        <ElFormItem label="当前状态">
          <ElTag>{{ formData.currentStatus }}</ElTag>
        </ElFormItem>
        <ElFormItem label="目标状态" prop="targetStatus">
          <ElSelect v-model="formData.targetStatus" placeholder="请选择目标状态" class="w-full">
            <ElOption label="待转" value="待转" />
            <ElOption label="正在进行" value="正在进行" />
            <ElOption label="已通知" value="已通知" />
            <ElOption label="已完成" value="已完成" />
            <ElOption label="已作废" value="已作废" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="变更原因" prop="reason">
          <ElInput v-model="formData.reason" type="textarea" :rows="2" placeholder="请输入变更原因" />
        </ElFormItem>
      </ElForm>
    </template>

    <!-- 签署文件：文件列表（可多选） -->
    <template v-if="actionType === 'signFile'">
      <div class="sign-file-section">
        <p class="sign-file-tip">请选择需要签署的文件：</p>
        <ElCheckboxGroup v-model="formData.selectedFiles">
          <div class="file-check-list">
            <div v-for="file in fileOptions" :key="file.id" class="file-check-item">
              <ElCheckbox :value="file.id">
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <ElTag size="small" type="info" class="ml-2">{{ file.type }}</ElTag>
                </div>
              </ElCheckbox>
            </div>
          </div>
        </ElCheckboxGroup>
      </div>
    </template>

    <!-- 打印条码 -->
    <template v-if="actionType === 'barcodePrint'">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="条码数量" prop="barcodeCount">
          <ElInputNumber v-model="formData.barcodeCount" :min="1" :max="10" class="w-full" />
        </ElFormItem>
        <ElFormItem label="样本编码">
          <ElInput v-model="formData.sampleCode" disabled />
        </ElFormItem>
      </ElForm>
    </template>

    <!-- 拍照上传 -->
    <template v-if="actionType === 'photoUpload'">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="上传照片" prop="photos">
          <ElUpload action="#" list-type="picture-card" :auto-upload="false" :on-change="handlePhotoChange">
            <ElIcon><Plus /></ElIcon>
          </ElUpload>
        </ElFormItem>
        <ElFormItem label="照片说明" prop="photoDesc">
          <ElInput v-model="formData.photoDesc" type="textarea" :rows="2" placeholder="请输入照片说明" />
        </ElFormItem>
      </ElForm>
    </template>

    <!-- 不良事件打印 -->
    <template v-if="actionType === 'adverseEvent'">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="事件类型" prop="eventType">
          <ElSelect v-model="formData.eventType" placeholder="请选择" class="w-full">
            <ElOption label="样本污染" value="contamination" />
            <ElOption label="样本量不足" value="insufficient" />
            <ElOption label="检测失败" value="failure" />
            <ElOption label="其他" value="other" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="事件描述" prop="eventDesc">
          <ElInput v-model="formData.eventDesc" type="textarea" :rows="3" placeholder="请输入事件描述" />
        </ElFormItem>
      </ElForm>
    </template>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton v-if="actionType === 'paymentPrint'" type="info" @click="handlePrint">
          打印
        </ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleConfirm">
          {{ confirmButtonText }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'OrderActionDialog' })

  interface Props {
    visible: boolean
    actionType: string
    orderData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'confirm', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const titleMap: Record<string, string> = {
    sliceApply: '病理科购买切片申请',
    consent: '知情同意书',
    paymentPrint: '缴费单打印',
    adverseEvent: '不良事件打印',
    barcodePrint: '打印条码',
    photoUpload: '拍照上传',
    statusChange: '改为待转',
    signFile: '签署文件',
    signedList: '已签署文件列表'
  }

  const title = computed(() => titleMap[props.actionType] || '操作')

  const dialogWidth = computed(() => {
    if (['sliceApply', 'consent', 'paymentPrint'].includes(props.actionType)) return '700px'
    return '600px'
  })

  const confirmButtonText = computed(() => {
    const map: Record<string, string> = {
      sliceApply: '提交申请',
      consent: '确认签署',
      paymentPrint: '确认',
      adverseEvent: '确认提交',
      barcodePrint: '确认打印',
      photoUpload: '确认上传',
      statusChange: '确认变更',
      signFile: '确认签署',
      signedList: '确认'
    }
    return map[props.actionType] || '确认'
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 签署文件选项
  const fileOptions = [
    { id: 'consent', name: '知情同意书', type: 'PDF' },
    { id: 'application', name: '分子病理检测送检申请单', type: 'PDF' },
    { id: 'report', name: '检测报告', type: 'PDF' },
    { id: 'sample_confirm', name: '样本采集确认单', type: 'PDF' },
    { id: 'privacy', name: '隐私保护告知书', type: 'PDF' },
    { id: 'sample_return', name: '样本返还确认书', type: 'PDF' }
  ]

  const formData = reactive({
    applyCode: '',
    patientName: '',
    projectName: '',
    sampleCode: '',
    currentStatus: '',
    selectedFiles: [] as string[],
    sliceCount: 1,
    purpose: '',
    signer: '',
    signDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentMethod: '',
    barcodeCount: 1,
    photos: [] as any[],
    photoDesc: '',
    targetStatus: '',
    reason: '',
    fileType: '',
    signMethod: 'electronic',
    eventType: '',
    eventDesc: ''
  })

  const rules: FormRules = {
    barcodeCount: [{ required: true, message: '请输入条码数量', trigger: 'blur' }],
    targetStatus: [{ required: true, message: '请选择目标状态', trigger: 'change' }],
    reason: [{ required: true, message: '请输入变更原因', trigger: 'blur' }],
    eventType: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
    eventDesc: [{ required: true, message: '请输入事件描述', trigger: 'blur' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val && props.orderData) {
        formData.applyCode = props.orderData.applyCode || ''
        formData.patientName = props.orderData.patientName || ''
        formData.projectName = props.orderData.projectName || ''
        formData.sampleCode = props.orderData.sampleCode || ''
        formData.currentStatus = props.orderData.processStatus || ''
        formData.selectedFiles = []
        formData.targetStatus = ''
        formData.reason = ''
        formData.eventType = ''
        formData.eventDesc = ''
      }
    }
  )

  const handlePhotoChange = (file: any) => {
    formData.photos.push(file)
  }

  const handlePrint = () => {
    ElMessage.success('缴费单打印成功')
  }

  const handleConfirm = async () => {
    // 签署文件：校验是否选择文件
    if (props.actionType === 'signFile') {
      if (formData.selectedFiles.length === 0) {
        ElMessage.warning('请至少选择一个文件')
        return
      }
      await doSubmit()
      return
    }

    // 改为待转：二次确认
    if (props.actionType === 'statusChange') {
      if (!formRef.value) return
      await formRef.value.validate(async (valid) => {
        if (!valid) return
        try {
          await ElMessageBox.confirm(
            `确认将状态从「${formData.currentStatus}」变更为「${formData.targetStatus}」吗？`,
            '二次确认',
            { confirmButtonText: '确认变更', cancelButtonText: '取消', type: 'warning' }
          )
          await doSubmit()
        } catch {
          // 取消
        }
      })
      return
    }

    // 其他需要表单验证的
    const needsValidate = ['barcodePrint', 'photoUpload', 'adverseEvent'].includes(props.actionType)
    if (needsValidate && formRef.value) {
      await formRef.value.validate(async (valid) => {
        if (!valid) return
        await doSubmit()
      })
    } else {
      await doSubmit()
    }
  }

  const doSubmit = async () => {
    submitting.value = true
    await new Promise((r) => setTimeout(r, 500))
    submitting.value = false
    ElMessage.success(`${title.value}操作成功`)
    emit('confirm', { actionType: props.actionType, ...formData })
    dialogVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .order-preview {
    .preview-header {
      text-align: center;
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .preview-code {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .consent-doc {
    .consent-header {
      text-align: center;
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        font-weight: 600;
      }
    }

    .consent-body {
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.9;
      color: var(--el-text-color-regular);
      max-height: 400px;
      overflow-y: auto;

      p {
        margin-bottom: 8px;
      }
    }

    .consent-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding: 0 16px;

      .consent-sign {
        display: flex;
        align-items: center;
        font-size: 14px;

        .sign-line {
          display: inline-block;
          width: 120px;
          border-bottom: 1px solid var(--el-text-color-primary);
          margin-left: 8px;
        }
      }
    }
  }

  .payment-doc {
    .payment-header {
      text-align: center;
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        font-weight: 600;
      }
    }

    .payment-amount {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 20px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 6px;

      .amount-label {
        font-size: 16px;
        font-weight: 500;
      }

      .amount-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--el-color-danger);
      }
    }
  }

  .sign-file-section {
    .sign-file-tip {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-bottom: 16px;
    }

    .file-check-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-check-item {
      padding: 10px 12px;
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      :deep(.el-checkbox) {
        width: 100%;
        height: auto;
      }

      .file-info {
        display: flex;
        align-items: center;

        .file-name {
          font-size: 14px;
        }
      }
    }
  }
</style>
