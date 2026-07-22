<!-- 新增接诊单抽屉 -->
<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="drawerTitle"
    size="680px"
    :close-on-click-modal="true"
  >
    <ElForm
      ref="formRef"
      :key="props.mode"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="order-form"
    >
      <!-- 送检信息 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:file-list-3-line" class="mr-1.5" />
          送检信息
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="患者类型" prop="patientType">
              <ElSelect v-model="formData.patientType" placeholder="请选择" class="w-full">
                <ElOption label="对照样本患者" value="control" />
                <ElOption label="家系样本患者" value="family" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="送检医院" prop="hospital">
              <ElSelect v-model="formData.hospital" placeholder="请选择" class="w-full">
                <ElOption label="昆华医院" value="kunhua" />
                <ElOption label="省人民医院" value="province" />
                <ElOption label="市中心医院" value="center" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="送检科室" prop="department">
              <ElSelect v-model="formData.department" placeholder="请选择" class="w-full">
                <ElOption label="呼吸内科" value="resp" />
                <ElOption label="肿瘤科" value="onco" />
                <ElOption label="胸外科" value="thoracic" />
                <ElOption label="病理科" value="pathology" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="送检医生" prop="doctor">
              <ElInput v-model="formData.doctor" placeholder="请输入送检医生" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="优惠类型" prop="discountType">
              <ElSelect v-model="formData.discountType" placeholder="请选择" class="w-full">
                <ElOption label="无优惠" value="none" />
                <ElOption label="会员折扣" value="member" />
                <ElOption label="团体优惠" value="group" />
                <ElOption label="公益减免" value="charity" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检测项目" prop="projectName">
              <ElInput v-model="formData.projectName" placeholder="请输入检测项目" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="项目价格" prop="projectPrice">
              <ElInputNumber
                v-model="formData.projectPrice"
                :min="0"
                :precision="2"
                class="w-full"
                placeholder="请输入价格"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="申请日期" prop="applyDate">
              <ElDatePicker
                v-model="formData.applyDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="办理人">
              <ElInput v-model="formData.handler" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="备注">
              <ElInput
                v-model="formData.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>

      <!-- 个人信息 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:user-3-line" class="mr-1.5" />
          个人信息
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="姓名" prop="patientName">
              <ElInput v-model="formData.patientName" placeholder="请输入姓名" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="性别" prop="gender">
              <ElRadioGroup v-model="formData.gender">
                <ElRadio value="男">男</ElRadio>
                <ElRadio value="女">女</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="年龄" prop="age">
              <ElInputNumber
                v-model="formData.age"
                :min="0"
                :max="150"
                class="w-full"
                placeholder="请输入年龄"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="身份证号" prop="idCard">
              <ElInput v-model="formData.idCard" placeholder="请输入身份证号" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="住院号" prop="hospitalNo">
              <ElInput v-model="formData.hospitalNo" placeholder="请输入住院号" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="门诊号" prop="outpatientNo">
              <ElInput v-model="formData.outpatientNo" placeholder="请输入门诊号" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="籍贯" prop="nativePlace">
              <ElInput v-model="formData.nativePlace" placeholder="请输入籍贯" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="职业" prop="occupation">
              <ElSelect v-model="formData.occupation" placeholder="请选择" class="w-full">
                <ElOption label="工人" value="worker" />
                <ElOption label="农民" value="farmer" />
                <ElOption label="教师" value="teacher" />
                <ElOption label="医务人员" value="medical" />
                <ElOption label="公务员" value="civil" />
                <ElOption label="企业职员" value="employee" />
                <ElOption label="个体经营" value="selfemployed" />
                <ElOption label="退休" value="retired" />
                <ElOption label="其他" value="other" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="民族" prop="ethnicity">
              <ElSelect v-model="formData.ethnicity" placeholder="请选择" class="w-full">
                <ElOption label="汉族" value="han" />
                <ElOption label="回族" value="hui" />
                <ElOption label="满族" value="man" />
                <ElOption label="蒙古族" value="mongol" />
                <ElOption label="藏族" value="tibetan" />
                <ElOption label="维吾尔族" value="uyghur" />
                <ElOption label="苗族" value="miao" />
                <ElOption label="彝族" value="yi" />
                <ElOption label="壮族" value="zhuang" />
                <ElOption label="其他" value="other" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="联系电话" prop="phone">
              <ElInput v-model="formData.phone" placeholder="请输入联系电话" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否重点关注" prop="isFocus">
              <ElSwitch
                v-model="formData.isFocus"
                active-text="是"
                inactive-text="否"
                inline-prompt
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否需要打印报告" prop="needPrint">
              <ElSwitch
                v-model="formData.needPrint"
                active-text="是"
                inactive-text="否"
                inline-prompt
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="标签" prop="tags" class="label-nowrap">
              <ElSelect
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入标签"
                class="w-full"
              >
                <ElOption label="VIP" value="VIP" />
                <ElOption label="高龄" value="高龄" />
                <ElOption label="儿童" value="儿童" />
                <ElOption label="急诊" value="急诊" />
                <ElOption label="外地" value="外地" />
                <ElOption label="复诊" value="复诊" />
                <ElOption label="临床试验" value="临床试验" />
                <ElOption label="科研项目" value="科研项目" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>

      <!-- 送检样本及诊断信息 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:test-tube-line" class="mr-1.5" />
          送检样本及诊断信息
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="癌种类型" prop="cancerType">
              <ElSelect v-model="formData.cancerType" placeholder="请选择" class="w-full">
                <ElOption label="肺癌" value="lung" />
                <ElOption label="结直肠癌" value="colorectal" />
                <ElOption label="乳腺癌" value="breast" />
                <ElOption label="甲状腺癌" value="thyroid" />
                <ElOption label="胃癌" value="gastric" />
                <ElOption label="肝癌" value="liver" />
                <ElOption label="其他" value="other" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="样本类型" prop="sampleSource">
              <ElSelect v-model="formData.sampleSource" multiple placeholder="请选择" class="w-full">
                <ElOption label="组织样本" value="tissue" />
                <ElOption label="血液样本" value="blood" />
                <ElOption label="胸水样本" value="pleural" />
                <ElOption label="骨髓样本" value="marrow" />
                <ElOption label="其他" value="other" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="病理号" prop="pathologyNo">
              <ElInput v-model="formData.pathologyNo" placeholder="请输入病理号" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="病理/临床诊断" prop="pathologyDiagnosis">
              <ElInput v-model="formData.pathologyDiagnosis" placeholder="请输入诊断信息" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="病理审核医生" prop="pathologyDoctor">
              <ElInput v-model="formData.pathologyDoctor" placeholder="请输入审核医生" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="样本编码" prop="sampleCode">
              <ElInput v-model="formData.sampleCode" placeholder="请输入样本编码" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="样本采集日期" prop="sampleCollectDate">
              <ElDatePicker
                v-model="formData.sampleCollectDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="样本接收日期" prop="sampleReceiveDate">
              <ElDatePicker
                v-model="formData.sampleReceiveDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否自带样本" prop="isSelfSample">
              <ElRadioGroup v-model="formData.isSelfSample" @change="handleSelfSampleChange">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="来源医院" prop="sourceHospital">
              <ElInput v-model="formData.sourceHospital" :disabled="formData.isSelfSample !== 'yes'" placeholder="请输入来源医院" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否返还" prop="isReturn">
              <ElRadioGroup v-model="formData.isReturn">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="样本数量">
              <div class="sample-quantity">
                <ElInput v-model="formData.sliceCount" placeholder="片" class="quantity-input" />
                <span class="quantity-unit">片</span>
                <ElInput v-model="formData.tubeCount" placeholder="管/块" class="quantity-input" />
                <span class="quantity-unit">管/块</span>
                <ElInput v-model="formData.mlCount" placeholder="ml" class="quantity-input" />
                <span class="quantity-unit">ml</span>
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="抽血时间" prop="bloodDrawTime">
              <ElDatePicker
                v-model="formData.bloodDrawTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>

      <!-- 个人史 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:history-line" class="mr-1.5" />
          个人史
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="是否初治" prop="isFirstTreatment">
              <ElRadioGroup v-model="formData.isFirstTreatment">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有无吸烟史" prop="smokingHistory">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.smokingHistory">
                  <ElRadio value="yes">有</ElRadio>
                  <ElRadio value="no">无</ElRadio>
                </ElRadioGroup>
                <ElInput
                  v-model="formData.smokingYears"
                  :disabled="formData.smokingHistory !== 'yes'"
                  placeholder="多少年"
                  style="width: 120px"
                />
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有无饮酒史" prop="drinkingHistory">
              <ElRadioGroup v-model="formData.drinkingHistory">
                <ElRadio value="yes">有</ElRadio>
                <ElRadio value="no">无</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有无燃煤接触史" prop="coalExposure">
              <ElRadioGroup v-model="formData.coalExposure">
                <ElRadio value="yes">有</ElRadio>
                <ElRadio value="no">无</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="既往患癌史" prop="previousCancer">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.previousCancer">
                  <ElRadio value="yes">有</ElRadio>
                  <ElRadio value="no">无</ElRadio>
                </ElRadioGroup>
                <ElInput
                  v-model="formData.previousCancerDetail"
                  :disabled="formData.previousCancer !== 'yes'"
                  placeholder="请输入"
                  style="width: 200px"
                />
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="近期化疗史" prop="recentChemo">
              <ElRadioGroup v-model="formData.recentChemo">
                <ElRadio value="yes">有</ElRadio>
                <ElRadio value="no">无</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否接受过骨髓移植" prop="boneMarrowTransplant">
              <ElRadioGroup v-model="formData.boneMarrowTransplant">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="近期是否接受过输血" prop="recentTransfusion">
              <ElRadioGroup v-model="formData.recentTransfusion">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="靶向治疗史" prop="targetedTherapy">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.targetedTherapy">
                  <ElRadio value="yes">有</ElRadio>
                  <ElRadio value="no">无</ElRadio>
                </ElRadioGroup>
                <div class="inline-fields">
                  <div class="inline-field-item">
                    <span class="inline-field-label">用药中</span>
                    <ElInput v-model="formData.targetedMedDuration" :disabled="formData.targetedTherapy !== 'yes'" placeholder="多少个月" style="width: 120px" />
                  </div>
                  <div class="inline-field-item">
                    <span class="inline-field-label">停药后</span>
                    <ElInput v-model="formData.targetedStopDuration" :disabled="formData.targetedTherapy !== 'yes'" placeholder="多少个月" style="width: 120px" />
                  </div>
                  <div class="inline-field-item">
                    <span class="inline-field-label">药物名称</span>
                    <ElInput v-model="formData.targetedDrugName" :disabled="formData.targetedTherapy !== 'yes'" placeholder="请输入" style="width: 160px" />
                  </div>
                </div>
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="慢性病史" prop="chronicDisease">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.chronicDisease">
                  <ElRadio value="yes">有</ElRadio>
                  <ElRadio value="no">无</ElRadio>
                </ElRadioGroup>
                <div class="inline-fields">
                  <div class="inline-field-item">
                    <span class="inline-field-label">何种疾病</span>
                    <ElInput v-model="formData.chronicDiseaseName" :disabled="formData.chronicDisease !== 'yes'" placeholder="请输入" style="width: 160px" />
                  </div>
                  <div class="inline-field-item">
                    <span class="inline-field-label">传染病史</span>
                    <ElInput v-model="formData.infectiousDisease" :disabled="formData.chronicDisease !== 'yes'" placeholder="请输入" style="width: 160px" />
                  </div>
                </div>
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="肿瘤家族史" prop="familyCancer">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.familyCancer">
                  <ElRadio value="yes">有</ElRadio>
                  <ElRadio value="no">无</ElRadio>
                </ElRadioGroup>
                <div class="inline-fields">
                  <div class="inline-field-item">
                    <span class="inline-field-label">与申请者关系</span>
                    <ElInput v-model="formData.familyRelation" :disabled="formData.familyCancer !== 'yes'" placeholder="请输入" style="width: 120px" />
                  </div>
                  <div class="inline-field-item">
                    <span class="inline-field-label">患何种癌</span>
                    <ElInput v-model="formData.familyCancerType" :disabled="formData.familyCancer !== 'yes'" placeholder="请输入" style="width: 120px" />
                  </div>
                  <div class="inline-field-item">
                    <span class="inline-field-label">亲属姓名</span>
                    <ElInput v-model="formData.familyMemberName" :disabled="formData.familyCancer !== 'yes'" placeholder="请输入" style="width: 100px" />
                  </div>
                  <div class="inline-field-item">
                    <span class="inline-field-label">基因检测情况</span>
                    <ElInput v-model="formData.familyGeneTest" :disabled="formData.familyCancer !== 'yes'" placeholder="请输入" style="width: 140px" />
                  </div>
                </div>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>

      <!-- 样本信息 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:flask-line" class="mr-1.5" />
          样本信息
        </div>

        <ElRow :gutter="16">
          <!-- 组织样本 -->
          <ElCol :span="24">
            <ElFormItem label="组织样本" prop="tissueSamples">
              <ElCheckboxGroup v-model="formData.tissueSamples">
                <ElCheckbox value="paraffin">石蜡块/切片</ElCheckbox>
                <ElCheckbox value="thyroid_puncture">甲状腺穿刺样本</ElCheckbox>
                <ElCheckbox value="fresh_tissue">新鲜组织</ElCheckbox>
                <ElCheckbox value="cervical_cells">宫颈脱落细胞</ElCheckbox>
                <ElCheckbox value="cytology">细胞学</ElCheckbox>
              </ElCheckboxGroup>
            </ElFormItem>
          </ElCol>

          <!-- 液体样本 -->
          <ElCol :span="24">
            <ElFormItem label="液体样本" prop="liquidSamples">
              <div class="sample-check-layout">
                <!-- 全血 + 子选项 -->
                <div class="sample-with-sub">
                  <ElCheckboxGroup v-model="formData.liquidSamples">
                    <ElCheckbox value="blood">全血</ElCheckbox>
                  </ElCheckboxGroup>
                  <div class="sub-option-row">
                    <span class="sub-option-label">是否配对样本</span>
                    <ElRadioGroup v-model="formData.bloodPaired" :disabled="!formData.liquidSamples.includes('blood')">
                      <ElRadio value="yes">是</ElRadio>
                      <ElRadio value="no">否</ElRadio>
                    </ElRadioGroup>
                  </div>
                </div>
                <!-- 恶性渗出（第一层级） -->
                <div class="sample-with-sub">
                  <ElCheckboxGroup v-model="formData.liquidSamples">
                    <ElCheckbox value="malignant_effusion">恶性渗出</ElCheckbox>
                  </ElCheckboxGroup>
                  <div class="sub-option-row">
                    <ElRadioGroup
                      v-model="formData.malignantEffusion"
                      :disabled="!formData.liquidSamples.includes('malignant_effusion')"
                    >
                      <ElRadio value="pleural_fluid">胸水</ElRadio>
                      <ElRadio value="ascites">腹水</ElRadio>
                      <ElRadio value="pericardial">心包积液</ElRadio>
                    </ElRadioGroup>
                  </div>
                </div>
                <!-- 其余选项 -->
                <ElCheckboxGroup v-model="formData.liquidSamples">
                  <ElCheckbox value="csf">脑脊液</ElCheckbox>
                  <ElCheckbox value="marrow">骨髓穿刺液</ElCheckbox>
                  <ElCheckbox value="urine">尿液</ElCheckbox>
                </ElCheckboxGroup>
              </div>
            </ElFormItem>
          </ElCol>

          <!-- 固体样本 -->
          <ElCol :span="24">
            <ElFormItem label="固体样本" prop="solidSamples">
              <div class="conditional-field">
                <ElCheckboxGroup v-model="formData.solidSamples">
                  <ElCheckbox value="stool">粪便</ElCheckbox>
                  <ElCheckbox value="other">其他</ElCheckbox>
                </ElCheckboxGroup>
                <div class="inline-fields">
                  <div class="inline-field-item">
                    <ElInput v-model="formData.solidOtherDetail" :disabled="!formData.solidSamples.includes('other')" placeholder="请输入其他内容" style="width: 240px" />
                  </div>
                </div>
              </div>
            </ElFormItem>
          </ElCol>

          <!-- 是否有备用样本 -->
          <ElCol :span="24">
            <ElFormItem label="是否有备用样本" prop="hasBackup">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.hasBackup">
                  <ElRadio value="yes">是</ElRadio>
                  <ElRadio value="no">否</ElRadio>
                </ElRadioGroup>
                <div class="inline-fields">
                  <div class="inline-field-item">
                    <span class="inline-field-label">备用样本类型</span>
                    <ElRadioGroup v-model="formData.backupTypes" :disabled="formData.hasBackup !== 'yes'">
                      <ElRadio value="blood">全血</ElRadio>
                      <ElRadio value="pleural_fluid">胸水</ElRadio>
                      <ElRadio value="ascites">腹水</ElRadio>
                    </ElRadioGroup>
                  </div>
                </div>
              </div>
            </ElFormItem>
          </ElCol>

          <!-- 对照样本 -->
          <ElCol :span="24">
            <ElFormItem label="对照样本" prop="hasControl">
              <div class="conditional-field">
                <ElRadioGroup v-model="formData.hasControl">
                  <ElRadio value="yes">是</ElRadio>
                  <ElRadio value="no">否</ElRadio>
                </ElRadioGroup>

                <div v-if="formData.hasControl === 'yes'" class="control-sample-card">
                <!-- 对照样本导入 -->
                <div class="control-sample-header">
                  <ElButton type="primary" plain size="small" @click="handleControlImport">
                    <ArtSvgIcon icon="ri:file-upload-line" class="mr-1" />
                    导入对照样本
                  </ElButton>
                </div>
                <!-- 对照-组织样本 -->
                <ElFormItem label="组织样本" label-width="120px" class="sub-form-item">
                  <ElCheckboxGroup v-model="formData.controlTissueSamples" :disabled="formData.hasControl !== 'yes'">
                    <ElCheckbox value="paraffin">石蜡块/切片</ElCheckbox>
                    <ElCheckbox value="thyroid_puncture">甲状腺穿刺样本</ElCheckbox>
                    <ElCheckbox value="fresh_tissue">新鲜组织</ElCheckbox>
                    <ElCheckbox value="cervical_cells">宫颈脱落细胞</ElCheckbox>
                    <ElCheckbox value="cytology">细胞学</ElCheckbox>
                  </ElCheckboxGroup>
                </ElFormItem>

                <!-- 对照-液体样本 -->
                <ElFormItem label="液体样本" label-width="120px" class="sub-form-item">
                  <div class="sample-check-layout">
                    <!-- 全血 + 子选项 -->
                    <div class="sample-with-sub">
                      <ElCheckboxGroup v-model="formData.controlLiquidSamples" :disabled="formData.hasControl !== 'yes'">
                        <ElCheckbox value="blood">全血</ElCheckbox>
                      </ElCheckboxGroup>
                      <div class="sub-option-row">
                        <span class="sub-option-label">是否配对样本</span>
                        <ElRadioGroup v-model="formData.controlBloodPaired" :disabled="formData.hasControl !== 'yes' || !formData.controlLiquidSamples.includes('blood')">
                          <ElRadio value="yes">是</ElRadio>
                          <ElRadio value="no">否</ElRadio>
                        </ElRadioGroup>
                      </div>
                    </div>
                    <!-- 恶性渗出（第一层级） -->
                    <div class="sample-with-sub">
                      <ElCheckboxGroup v-model="formData.controlLiquidSamples" :disabled="formData.hasControl !== 'yes'">
                        <ElCheckbox value="malignant_effusion">恶性渗出</ElCheckbox>
                      </ElCheckboxGroup>
                      <div class="sub-option-row">
                        <ElRadioGroup
                          v-model="formData.controlMalignantEffusion"
                          :disabled="formData.hasControl !== 'yes' || !formData.controlLiquidSamples.includes('malignant_effusion')"
                        >
                          <ElRadio value="pleural_fluid">胸水</ElRadio>
                          <ElRadio value="ascites">腹水</ElRadio>
                          <ElRadio value="pericardial">心包积液</ElRadio>
                        </ElRadioGroup>
                      </div>
                    </div>
                    <!-- 其余选项 -->
                    <ElCheckboxGroup v-model="formData.controlLiquidSamples" :disabled="formData.hasControl !== 'yes'">
                      <ElCheckbox value="csf">脑脊液</ElCheckbox>
                      <ElCheckbox value="marrow">骨髓穿刺液</ElCheckbox>
                      <ElCheckbox value="urine">尿液</ElCheckbox>
                    </ElCheckboxGroup>
                  </div>
                </ElFormItem>

                <!-- 对照-固体样本 -->
                <ElFormItem label="固体样本" label-width="120px" class="sub-form-item">
                  <div class="conditional-field">
                    <ElCheckboxGroup v-model="formData.controlSolidSamples" :disabled="formData.hasControl !== 'yes'">
                      <ElCheckbox value="stool">粪便</ElCheckbox>
                      <ElCheckbox value="other">其他</ElCheckbox>
                    </ElCheckboxGroup>
                    <div class="inline-fields">
                      <div class="inline-field-item">
                        <ElInput v-model="formData.controlSolidOtherDetail" :disabled="formData.hasControl !== 'yes' || !formData.controlSolidSamples.includes('other')" placeholder="请输入其他内容" style="width: 240px" />
                      </div>
                    </div>
                  </div>
                </ElFormItem>

                <!-- 对照-备用样本 -->
                <ElFormItem label="是否有备用样本" label-width="120px" class="sub-form-item">
                  <div class="conditional-field">
                    <ElRadioGroup v-model="formData.controlHasBackup" :disabled="formData.hasControl !== 'yes'">
                      <ElRadio value="yes">是</ElRadio>
                      <ElRadio value="no">否</ElRadio>
                    </ElRadioGroup>
                    <div class="inline-fields">
                      <div class="inline-field-item">
                        <span class="inline-field-label">备用样本类型</span>
                        <ElRadioGroup v-model="formData.controlBackupTypes" :disabled="formData.hasControl !== 'yes' || formData.controlHasBackup !== 'yes'">
                          <ElRadio value="blood">全血</ElRadio>
                          <ElRadio value="pleural_fluid">胸水</ElRadio>
                          <ElRadio value="ascites">腹水</ElRadio>
                        </ElRadioGroup>
                      </div>
                    </div>
                  </div>
                </ElFormItem>
              </div>
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </div>

      <!-- 家系样本 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:group-line" class="mr-1.5" />
          家系样本
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="是否有家系信息" prop="hasFamilyInfo">
              <ElRadioGroup v-model="formData.hasFamilyInfo">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <div v-show="formData.hasFamilyInfo === 'yes'">
          <div class="family-import-bar">
            <ElButton type="primary" plain size="small" @click="handleFamilyImport">
              <ArtSvgIcon icon="ri:file-upload-line" class="mr-1" />
              导入家系样本
            </ElButton>
          </div>
          <div
            v-for="(member, index) in formData.familyMembers"
            :key="index"
            class="family-member-card"
          >
            <div class="family-member-header">
              <span class="family-member-title">家系成员 {{ index + 1 }}</span>
              <ElButton
                v-if="formData.familyMembers.length > 1"
                type="danger"
                text
                size="small"
                @click="removeFamilyMember(index)"
              >
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                删除
              </ElButton>
            </div>

            <ElRow :gutter="16">
              <ElCol :span="12">
                <ElFormItem label="与先证者关系">
                  <ElSelect v-model="member.relation" placeholder="请选择" class="w-full">
                    <ElOption label="父亲" value="father" />
                    <ElOption label="母亲" value="mother" />
                    <ElOption label="兄弟" value="brother" />
                    <ElOption label="姐妹" value="sister" />
                    <ElOption label="儿子" value="son" />
                    <ElOption label="女儿" value="daughter" />
                    <ElOption label="祖父" value="grandfather" />
                    <ElOption label="祖母" value="grandmother" />
                    <ElOption label="其他亲属" value="other" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="姓名">
                  <ElInput v-model="member.name" placeholder="请输入姓名" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="性别">
                  <ElRadioGroup v-model="member.gender">
                    <ElRadio value="男">男</ElRadio>
                    <ElRadio value="女">女</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="年龄">
                  <ElInputNumber v-model="member.age" :min="0" :max="150" class="w-full" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="出生日期">
                  <ElDatePicker
                    v-model="member.birthDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    class="w-full"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="民族">
                  <ElSelect v-model="member.ethnicity" placeholder="请选择" class="w-full">
                    <ElOption label="汉族" value="han" />
                    <ElOption label="回族" value="hui" />
                    <ElOption label="满族" value="man" />
                    <ElOption label="蒙古族" value="mongol" />
                    <ElOption label="其他" value="other" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="婚姻状况">
                  <ElSelect v-model="member.marriageStatus" placeholder="请选择" class="w-full">
                    <ElOption label="未婚" value="single" />
                    <ElOption label="已婚" value="married" />
                    <ElOption label="离异" value="divorced" />
                    <ElOption label="丧偶" value="widowed" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="疾病诊断">
                  <ElSelect v-model="member.diagnosis" placeholder="请选择" filterable class="w-full">
                    <ElOption label="肺癌" value="lung" />
                    <ElOption label="结直肠癌" value="colorectal" />
                    <ElOption label="乳腺癌" value="breast" />
                    <ElOption label="甲状腺癌" value="thyroid" />
                    <ElOption label="胃癌" value="gastric" />
                    <ElOption label="健康" value="healthy" />
                    <ElOption label="其他" value="other" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="是否有样本">
                  <ElRadioGroup v-model="member.hasSample">
                    <ElRadio value="yes">是</ElRadio>
                    <ElRadio value="no">否</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="样本类型">
                  <ElSelect v-model="member.sampleType" multiple :disabled="member.hasSample !== 'yes'" placeholder="请选择" class="w-full">
                    <ElOption label="组织样本" value="tissue" />
                    <ElOption label="血液样本" value="blood" />
                    <ElOption label="胸水样本" value="pleural" />
                    <ElOption label="骨髓样本" value="marrow" />
                    <ElOption label="其他" value="other" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="生育情况">
                  <ElInput v-model="member.reproduction" placeholder="请输入生育情况" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="备注">
                  <ElInput v-model="member.remark" type="textarea" :rows="2" placeholder="请输入备注" />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </div>

          <ElButton type="primary" plain dashed class="add-member-btn" @click="addFamilyMember">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            添加家系成员
          </ElButton>
        </div>
      </div>

      <!-- 申请单质控 -->
      <div class="form-section">
        <div class="form-section-title">
          <ArtSvgIcon icon="ri:shield-check-line" class="mr-1.5" />
          申请单质控
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="申请单复核" prop="reviewResult">
              <ElSelect v-model="formData.reviewResult" placeholder="请选择" class="w-full">
                <ElOption label="通过" value="pass" />
                <ElOption label="不通过" value="fail" />
                <ElOption label="待复核" value="pending" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="复核人" prop="reviewer">
              <ElInput v-model="formData.reviewer" placeholder="请输入复核人" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="复核时间" prop="reviewTime">
              <ElDatePicker
                v-model="formData.reviewTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="申请单质控" prop="qcResult">
              <ElSelect v-model="formData.qcResult" placeholder="请选择" class="w-full">
                <ElOption label="合格" value="pass" />
                <ElOption label="不合格" value="fail" />
                <ElOption label="待处理" value="pending" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="质控备注" prop="qcRemark">
              <ElInput v-model="formData.qcRemark" type="textarea" :rows="2" placeholder="请输入质控备注" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否修订" prop="isRevised">
              <ElRadioGroup v-model="formData.isRevised">
                <ElRadio value="yes">是</ElRadio>
                <ElRadio value="no">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="修订人" prop="reviser">
              <ElInput v-model="formData.reviser" :disabled="formData.isRevised !== 'yes'" placeholder="请输入修订人" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>
    </ElForm>

    <!-- 隐藏的文件导入 -->
    <input
      ref="controlFileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleControlFileChange"
    />
    <input
      ref="familyFileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFamilyFileChange"
    />

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitButtonText }}
        </ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'OrderAddDrawer' })

  interface Props {
    visible: boolean
    mode?: 'add' | 'edit' | 'copy' | 'receive'
    editData?: any
    title?: string
    submitText?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const drawerTitle = computed(() => {
    if (props.title) return props.title
    const map = { add: '新增接诊单', edit: '编辑接诊单', copy: '复制接诊单', receive: '编辑样本' }
    return map[props.mode || 'add']
  })

  const submitButtonText = computed(() => {
    if (props.submitText) return props.submitText
    const map = { add: '确认新增', edit: '确认修改', copy: '确认复制', receive: '确认接收' }
    return map[props.mode || 'add']
  })

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const controlFileInput = ref<HTMLInputElement>()
  const familyFileInput = ref<HTMLInputElement>()

  const formData = reactive({
    // 送检信息
    patientType: '',
    hospital: '',
    department: '',
    doctor: '',
    discountType: '',
    projectName: '',
    projectPrice: undefined as number | undefined,
    applyCode: '' as string | undefined,
    applyDate: new Date().toISOString().slice(0, 10),
    handler: '当前登录用户',
    remark: '',
    // 个人信息
    patientName: '',
    gender: '男',
    age: undefined as number | undefined,
    idCard: '',
    hospitalNo: '',
    outpatientNo: '',
    nativePlace: '',
    occupation: '',
    ethnicity: 'han',
    phone: '',
    isFocus: false,
    needPrint: true,
    tags: [] as string[],
    // 送检样本及诊断信息
    cancerType: '',
    sampleSource: [] as string[],
    pathologyNo: '',
    pathologyDiagnosis: '',
    pathologyDoctor: '',
    sampleCode: '',
    sampleCollectDate: new Date().toISOString().slice(0, 10),
    sampleReceiveDate: '' as string,
    isSelfSample: 'no',
    sourceHospital: '',
    isReturn: 'no',
    sliceCount: '',
    tubeCount: '',
    mlCount: '',
    bloodDrawTime: '' as string,
    // 个人史
    isFirstTreatment: '',
    smokingHistory: '',
    smokingYears: '',
    drinkingHistory: '',
    coalExposure: '',
    previousCancer: '',
    previousCancerDetail: '',
    recentChemo: '',
    boneMarrowTransplant: '',
    recentTransfusion: '',
    targetedTherapy: '',
    targetedMedDuration: '',
    targetedStopDuration: '',
    targetedDrugName: '',
    chronicDisease: '',
    chronicDiseaseName: '',
    infectiousDisease: '',
    familyCancer: '',
    familyRelation: '',
    familyCancerType: '',
    familyMemberName: '',
    familyGeneTest: '',
    // 样本信息
    tissueSamples: [] as string[],
    liquidSamples: [] as string[],
    bloodPaired: '',
    malignantEffusion: '',
    solidSamples: [] as string[],
    solidOtherDetail: '',
    hasBackup: 'no',
    backupTypes: '' as string,
    hasControl: 'no',
    controlTissueSamples: [] as string[],
    controlLiquidSamples: [] as string[],
    controlBloodPaired: '',
    controlMalignantEffusion: '',
    controlSolidSamples: [] as string[],
    controlSolidOtherDetail: '',
    controlHasBackup: 'no',
    controlBackupTypes: '' as string,
    // 家系样本
    hasFamilyInfo: 'no',
    familyMembers: [
      {
        relation: '',
        name: '',
        gender: '男',
        age: undefined as number | undefined,
        birthDate: '',
        ethnicity: 'han',
        marriageStatus: '',
        diagnosis: '',
        hasSample: 'no',
        sampleType: [] as string[],
        reproduction: '',
        remark: ''
      }
    ] as any[],
    // 申请单质控
    reviewResult: '',
    reviewer: '',
    reviewTime: '',
    qcResult: '',
    qcRemark: '',
    isRevised: 'no',
    reviser: ''
  })

  const rules: FormRules = {
    patientType: [{ required: true, message: '请选择患者类型', trigger: 'change' }],
    hospital: [{ required: true, message: '请选择送检医院', trigger: 'change' }],
    department: [{ required: true, message: '请选择送检科室', trigger: 'change' }],
    doctor: [{ required: true, message: '请输入送检医生', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入检测项目', trigger: 'blur' }],
    patientName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    idCard: [
      { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
    ]
  }

  const handleSelfSampleChange = (val: string) => {
    if (val !== 'yes') {
      formData.sourceHospital = ''
    }
  }

  const addFamilyMember = () => {
    formData.familyMembers.push({
      relation: '',
      name: '',
      gender: '男',
      age: undefined,
      birthDate: '',
      ethnicity: 'han',
      marriageStatus: '',
      diagnosis: '',
      hasSample: 'no',
      sampleType: '',
      reproduction: '',
      remark: ''
    })
  }

  const removeFamilyMember = (index: number) => {
    formData.familyMembers.splice(index, 1)
  }

  // 对照样本导入
  const handleControlImport = () => {
    controlFileInput.value?.click()
  }

  const handleControlFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.controlTissueSamples) formData.controlTissueSamples = data.controlTissueSamples
        if (data.controlLiquidSamples) formData.controlLiquidSamples = data.controlLiquidSamples
        if (data.controlBloodPaired) formData.controlBloodPaired = data.controlBloodPaired
        if (data.controlMalignantEffusion) formData.controlMalignantEffusion = data.controlMalignantEffusion
        if (data.controlSolidSamples) formData.controlSolidSamples = data.controlSolidSamples
        if (data.controlSolidOtherDetail) formData.controlSolidOtherDetail = data.controlSolidOtherDetail
        if (data.controlHasBackup) formData.controlHasBackup = data.controlHasBackup
        if (data.controlBackupTypes) formData.controlBackupTypes = data.controlBackupTypes
        ElMessage.success('对照样本导入成功')
      } catch {
        ElMessage.error('文件格式错误，请使用JSON格式文件')
      }
    }
    reader.readAsText(file)
    input.value = ''
  }

  // 家系样本导入
  const handleFamilyImport = () => {
    familyFileInput.value?.click()
  }

  const handleFamilyFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const newMember = {
          relation: data.relation || '',
          name: data.name || '',
          gender: data.gender || '男',
          age: data.age ?? undefined,
          birthDate: data.birthDate || '',
          ethnicity: data.ethnicity || 'han',
          marriageStatus: data.marriageStatus || '',
          diagnosis: data.diagnosis || '',
          hasSample: data.hasSample || 'no',
          sampleType: data.sampleType || [],
          reproduction: data.reproduction || '',
          remark: data.remark || ''
        }
        formData.familyMembers.push(newMember)
        ElMessage.success('家系样本导入成功')
      } catch {
        ElMessage.error('文件格式错误，请使用JSON格式文件')
      }
    }
    reader.readAsText(file)
    input.value = ''
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      await new Promise((r) => setTimeout(r, 500))
      submitting.value = false
      emit('submit', { ...formData })
      drawerVisible.value = false
    })
  }

  const defaultFormData = () => ({
    patientType: '',
    hospital: '',
    department: '',
    doctor: '',
    discountType: '',
    projectName: '',
    projectPrice: undefined as number | undefined,
    applyCode: '' as string | undefined,
    applyDate: new Date().toISOString().slice(0, 10),
    handler: '当前登录用户',
    remark: '',
    patientName: '',
    gender: '男',
    age: undefined as number | undefined,
    idCard: '',
    hospitalNo: '',
    outpatientNo: '',
    nativePlace: '',
    occupation: '',
    ethnicity: 'han',
    phone: '',
    isFocus: false,
    needPrint: true,
    tags: [] as string[],
    cancerType: '',
    sampleSource: [] as string[],
    pathologyNo: '',
    pathologyDiagnosis: '',
    pathologyDoctor: '',
    sampleCode: '',
    sampleCollectDate: new Date().toISOString().slice(0, 10),
    sampleReceiveDate: '' as string,
    isSelfSample: 'no',
    sourceHospital: '',
    isReturn: 'no',
    sliceCount: '',
    tubeCount: '',
    mlCount: '',
    bloodDrawTime: '' as string,
    isFirstTreatment: '',
    smokingHistory: '',
    smokingYears: '',
    drinkingHistory: '',
    coalExposure: '',
    previousCancer: '',
    previousCancerDetail: '',
    recentChemo: '',
    boneMarrowTransplant: '',
    recentTransfusion: '',
    targetedTherapy: '',
    targetedMedDuration: '',
    targetedStopDuration: '',
    targetedDrugName: '',
    chronicDisease: '',
    chronicDiseaseName: '',
    infectiousDisease: '',
    familyCancer: '',
    familyRelation: '',
    familyCancerType: '',
    familyMemberName: '',
    familyGeneTest: '',
    tissueSamples: [] as string[],
    liquidSamples: [] as string[],
    bloodPaired: '',
    malignantEffusion: '',
    solidSamples: [] as string[],
    solidOtherDetail: '',
    hasBackup: 'no',
    backupTypes: [] as string[],
    hasControl: 'no',
    controlTissueSamples: [] as string[],
    controlLiquidSamples: [] as string[],
    controlBloodPaired: '',
    controlMalignantEffusion: '',
    controlSolidSamples: [] as string[],
    controlSolidOtherDetail: '',
    controlHasBackup: 'no',
    controlBackupTypes: [] as string[],
    hasFamilyInfo: 'no',
    familyMembers: [
      {
        relation: '',
        name: '',
        gender: '男',
        age: undefined as number | undefined,
        birthDate: '',
        ethnicity: 'han',
        marriageStatus: '',
        diagnosis: '',
        hasSample: 'no',
        sampleType: [] as string[],
        reproduction: '',
        remark: ''
      }
    ] as any[],
    reviewResult: '',
    reviewer: '',
    reviewTime: '',
    qcResult: '',
    qcRemark: '',
    isRevised: 'no',
    reviser: ''
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if ((props.mode === 'edit' || props.mode === 'copy') && props.editData) {
          // 编辑/复制模式：填充数据
          Object.assign(formData, defaultFormData(), props.editData)
          if (props.mode === 'copy') {
            // 复制模式：清空申请编码
            formData.applyCode = undefined
            formData.handler = '当前登录用户'
          }
          nextTick(() => {
            formRef.value?.clearValidate()
          })
        } else {
          // 新增模式：重置表单
          Object.assign(formData, defaultFormData())
          nextTick(() => {
            formRef.value?.clearValidate()
          })
        }
      } else {
        // 关闭抽屉时清除验证状态
        formRef.value?.clearValidate()
      }
    }
  )
</script>

<style lang="scss" scoped>
  .order-form {
    :deep(.el-form-item__label) {
      white-space: nowrap;
    }

    .form-section {
      margin-bottom: 24px;

      .form-section-title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }

    .sample-quantity {
      display: flex;
      align-items: center;
      gap: 4px;

      .quantity-input {
        width: 70px;
      }

      .quantity-unit {
        flex-shrink: 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .conditional-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .inline-fields {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;

      .inline-field-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .inline-field-label {
          flex-shrink: 0;
          font-size: 13px;
          color: var(--el-text-color-secondary);
          white-space: nowrap;
        }
      }
    }

    .sub-form-item {
      margin-left: 24px;
    }

    .family-member-card {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 6px;
      border: 1px solid var(--el-border-color-lighter);

      .family-member-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .family-member-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }

    .add-member-btn {
      width: 100%;
    }

    .control-sample-card {
      margin-top: 12px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 6px;
      border: 1px solid var(--el-border-color-lighter);

      .control-sample-header {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
    }

    .family-import-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }

    .sample-check-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .sample-with-sub {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .sub-option-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 24px;

          .sub-option-label {
            flex-shrink: 0;
            font-size: 13px;
            color: var(--el-text-color-secondary);
            white-space: nowrap;
          }
        }
      }
    }
  }
</style>
