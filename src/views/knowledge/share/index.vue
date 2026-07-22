<!-- 知识共享 -->
<template>
  <div class="knowledge-share art-full-height">
    <!-- 查询条件 -->
    <ShareSearchForm @search="handleSearch" @reset="handleReset" />

    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <!-- 左侧：知识分类树 -->
      <div class="flex-shrink-0 w-72 flex flex-col max-md:w-full max-md:h-auto max-md:mb-5">
        <div class="art-card flex flex-col flex-grow min-h-0 p-5 mb-5 max-sm:mb-4">
          <div class="art-card-header">
            <div class="title">
              <h4>知识分类</h4>
            </div>
            <ElButton type="primary" size="small" @click="handleAddRootCategory">
              <ArtSvgIcon icon="ri:add-line" class="mr-0.5" />
              添加分类
            </ElButton>
          </div>
          <div class="tree-card-body">
            <ElScrollbar>
            <ElTree
              ref="treeRef"
              :data="treeData"
              :props="treeProps"
              node-key="id"
              default-expand-all
              highlight-current
              :expand-on-click-node="true"
              @node-click="handleTreeNodeClick"
            >
              <template #default="{ node, data }">
                <!-- 分类节点 -->
                <div v-if="data.isCategory" class="tree-node">
                  <span class="tree-node-label">
                    <ArtSvgIcon
                      :icon="data.level === 0 ? 'ri:folder-5-line' : data.level === 1 ? 'ri:folder-3-line' : 'ri:folder-line'"
                      class="mr-1"
                      style="font-size: 14px"
                    />
                    {{ node.label }}
                  </span>
                  <span class="tree-node-actions" @click.stop>
                    <ElTooltip
                      v-if="data.level < 2"
                      content="添加子分类"
                      placement="top"
                    >
                      <ElIcon class="action-icon add" @click="handleAddChildCategory(data)">
                        <ArtSvgIcon icon="ri:add-line" />
                      </ElIcon>
                    </ElTooltip>
                    <ElTooltip content="添加文件" placement="top">
                      <ElIcon class="action-icon add" @click="handleAddFile(data)">
                        <ArtSvgIcon icon="ri:file-add-line" />
                      </ElIcon>
                    </ElTooltip>
                    <ElTooltip content="编辑" placement="top">
                      <ElIcon class="action-icon edit" @click="handleEditCategory(data)">
                        <ArtSvgIcon icon="ri:pencil-line" />
                      </ElIcon>
                    </ElTooltip>
                    <ElTooltip content="删除" placement="top">
                      <ElIcon class="action-icon delete" @click="handleDeleteCategory(data)">
                        <ArtSvgIcon icon="ri:delete-bin-5-line" />
                      </ElIcon>
                    </ElTooltip>
                  </span>
                </div>
                <!-- 文件节点 -->
                <div v-else class="tree-node tree-file-node">
                  <span class="tree-node-label">
                    <ArtSvgIcon icon="ri:file-text-line" class="mr-1" style="font-size: 14px; color: var(--el-color-primary)" />
                    {{ node.label }}
                  </span>
                </div>
              </template>
            </ElTree>
          </ElScrollbar>
          </div>
        </div>
      </div>

      <!-- 右侧：文档列表 -->
      <div class="flex flex-col flex-grow min-w-0 h-full">
        <!-- 文档列表 -->
        <div v-if="selectedFile" class="art-card flex flex-col flex-grow min-h-0 p-5 mb-5 max-sm:mb-4">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ selectedFile.name }}</h4>
            </div>
            <div class="card-header-actions">
              <ElButton type="primary" size="small" @click="handleAddDocument">
                <ArtSvgIcon icon="ri:add-line" class="mr-0.5" />
                新增文档
              </ElButton>
              <ElButton :disabled="selectedDocs.length === 0" size="small" @click="handleExportDocuments">
                <ArtSvgIcon icon="ri:download-line" class="mr-0.5" />
                导出
              </ElButton>
            </div>
          </div>
          <ArtTable
            :loading="false"
            :data="documentList"
            :columns="documentColumns"
            :pagination="pagination"
            @selection-change="handleDocSelectionChange"
            @pagination:size-change="handleDocSizeChange"
            @pagination:current-change="handleDocCurrentChange"
            style="width: 100%"
          >
            <template #operation="{ row }">
              <div class="flex-c">
                <ArtButtonTable
                  type="edit"
                  @click="handleEditDocument(row)"
                />
                <ArtButtonTable
                  icon="ri:download-line"
                  iconClass="bg-success/12 text-success"
                  title="下载"
                  @click="handleDownloadDocument(row)"
                />
                <ArtButtonTable
                  type="view"
                  @click="handleViewDocument(row)"
                />
                <ElDropdown trigger="click" @command="(cmd: string) => handleDocMoreAction(cmd, row)">
                  <ArtButtonTable
                    type="more"
                  />
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="delete">
                        <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" style="color: var(--el-color-danger)" />
                        删除
                      </ElDropdownItem>
                      <ElDropdownItem command="revision">
                        <ArtSvgIcon icon="ri:history-line" class="mr-1" style="color: var(--el-color-warning)" />
                        修订记录
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </div>
            </template>
          </ArtTable>
        </div>

        <!-- 未选择文件时的提示 -->
        <div v-else class="art-card flex flex-col flex-grow min-h-0 p-5 mb-5 max-sm:mb-4">
          <div class="empty-tip">
            <ElEmpty description="请选择左侧文件查看文档" />
          </div>
        </div>
      </div>
    </div>

    <!-- 分类编辑弹窗 -->
    <ElDialog
      v-model="categoryDialogVisible"
      :title="categoryDialogTitle"
      width="480px"
      :close-on-click-modal="true"
    >
      <ElForm :model="categoryForm" label-width="80px">
        <ElFormItem label="分类名称" required>
          <ElInput v-model="categoryForm.name" placeholder="请输入分类名称" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="categoryForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="categoryDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveCategory">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 文件编辑弹窗 -->
    <ElDialog
      v-model="fileDialogVisible"
      :title="fileDialogTitle"
      width="480px"
      :close-on-click-modal="true"
    >
      <ElForm :model="fileForm" label-width="80px">
        <ElFormItem label="文件名称" required>
          <ElInput v-model="fileForm.name" placeholder="请输入文件名称" />
        </ElFormItem>
        <ElFormItem label="所属分类">
          <ElInput :model-value="fileForm.categoryName" disabled />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="fileForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="fileDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveFile">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 文档编辑弹窗 -->
    <ElDialog
      v-model="documentDialogVisible"
      :title="documentDialogTitle"
      width="520px"
      :close-on-click-modal="true"
    >
      <ElForm :model="documentForm" label-width="80px">
        <ElFormItem label="文档名称" required>
          <ElInput v-model="documentForm.name" placeholder="请输入文档名称" />
        </ElFormItem>
        <ElFormItem label="版本">
          <ElInput v-model="documentForm.version" placeholder="请输入版本号" />
        </ElFormItem>
        <ElFormItem label="上传文件" required>
          <ElUpload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleUploadChange"
            :on-remove="handleUploadRemove"
          >
            <ElButton type="primary">
              <ArtSvgIcon icon="ri:upload-line" class="mr-0.5" />
              选择文件
            </ElButton>
          </ElUpload>
        </ElFormItem>
        <ElFormItem label="上传人">
          <ElInput v-model="documentForm.uploader" disabled />
        </ElFormItem>
        <ElFormItem label="上传备注">
          <ElInput
            v-model="documentForm.uploadRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入上传备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="documentDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveDocument">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 文档查看弹窗（Word文档样式） -->
    <ElDialog
      v-model="viewDialogVisible"
      title="文档查看"
      width="800px"
      :close-on-click-modal="true"
    >
      <div class="report-preview-doc">
        <div class="doc-header">
          <h2 class="doc-title">{{ viewDocument?.name || '文档详情' }}</h2>
          <div class="doc-divider" />
        </div>
        <div class="doc-content">
          <table class="doc-table">
            <tbody>
              <tr>
                <td class="doc-label">文档名称</td>
                <td class="doc-value">{{ viewDocument?.name || '-' }}</td>
                <td class="doc-label">版本</td>
                <td class="doc-value">{{ viewDocument?.version || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">上传人</td>
                <td class="doc-value">{{ viewDocument?.uploader || '-' }}</td>
                <td class="doc-label">上传时间</td>
                <td class="doc-value">{{ viewDocument?.uploadTime || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">上传备注</td>
                <td class="doc-value" colspan="3">{{ viewDocument?.uploadRemark || '-' }}</td>
              </tr>
              <tr>
                <td class="doc-label">上传文件</td>
                <td class="doc-value" colspan="3">
                  <span class="file-link">
                    <ArtSvgIcon icon="ri:file-word-2-line" class="mr-1" style="color: #2b579a" />
                    {{ viewDocument?.uploadFile || '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="doc-divider" />
          <div class="doc-file-preview">
            <div class="file-preview-content">
              <h3>一、文档概述</h3>
              <p>本文档为「{{ viewDocument?.name || '-' }}」的正式版本（版本号：{{ viewDocument?.version || '-' }}），由 {{ viewDocument?.uploader || '-' }} 于 {{ viewDocument?.uploadTime || '-' }} 上传。</p>
              <h3>二、文件信息</h3>
              <p>文件名：{{ viewDocument?.uploadFile || '-' }}</p>
              <p>上传备注：{{ viewDocument?.uploadRemark || '-' }}</p>
              <h3>三、文档正文</h3>
              <p style="color: #999; font-style: italic">（完整文档内容请下载后使用 Word 或 PDF 阅读器查看）</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="viewDialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleDownloadFromView">
          <ArtSvgIcon icon="ri:download-line" class="mr-0.5" />
          下载
        </ElButton>
      </template>
    </ElDialog>

    <!-- 修订记录弹窗 -->
    <ElDialog
      v-model="revisionDialogVisible"
      title="修订记录"
      width="700px"
      :close-on-click-modal="true"
    >
      <ArtTable
        :loading="false"
        :data="revisionList"
        :columns="revisionColumns"
        :pagination="false"
        :showSelection="false"
        style="width: 100%"
      >
        <template #operation="{ row }">
          <div class="flex-c">
            <ArtButtonTable
              type="view"
              title="查看"
              @click="handleRevisionView(row)"
            />
            <ArtButtonTable
              icon="ri:download-line"
              iconClass="bg-success/12 text-success"
              title="下载"
              @click="handleRevisionDownload(row)"
            />
          </div>
        </template>
      </ArtTable>
      <template #footer>
        <ElButton @click="revisionDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 导出分类弹窗 -->
    <ElDialog
      v-model="exportDialogVisible"
      title="导出数据"
      width="480px"
      :close-on-click-modal="true"
    >
      <ElForm label-width="80px">
        <ElFormItem label="导出范围">
          <ElRadioGroup v-model="exportScope">
            <ElRadio value="category">当前分类</ElRadio>
            <ElRadio value="selected">选中文档</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="exportDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmExport">确定导出</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
import ShareSearchForm from './modules/share-search-form.vue'
import type { ColumnOption } from '@/types'

  defineOptions({ name: 'KnowledgeShare' })

  // ===== 类型定义 =====
  interface CategoryNode {
    id: string
    label: string
    name: string
    level: number
    parentId: string | null
    remark: string
    children?: CategoryNode[]
    files?: FileItem[]
  }

  interface FileItem {
    id: string
    name: string
    categoryId: string
    categoryName: string
    remark: string
    createTime: string
    documents: DocumentItem[]
  }

  interface DocumentItem {
    id: string
    name: string
    version: string
    uploader: string
    uploadRemark: string
    uploadFile?: string
    uploadTime: string
    fileId: string
    revisions: RevisionItem[]
  }

  interface RevisionItem {
    id: string
    version: string
    operator: string
    operateTime: string
    remark: string
  }

  // ===== 生成ID =====
  const generateId = () => `kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // ===== 生成真实mock数据 =====
  const makeDocs = (names: string[]) =>
    names.map((name, i) => ({
      id: generateId(),
      name,
      version: `${(i + 1) * 0.1 + 1}.0`,
      uploader: ['张主任', '李医生', '王教授', '赵老师'][i % 4],
      uploadRemark: ['日常更新', '内容修订', '新增章节', '格式优化'][i % 4],
      uploadFile: `${name}.docx`,
      uploadTime: `2026-0${(i % 6) + 1}-${String((i * 3 + 1) % 28 + 1).padStart(2, '0')} 10:${String((i * 7) % 60).padStart(2, '0')}`,
      fileId: '',
      revisions: [
        {
          id: `rev_${i}_1`,
          version: `${(i + 1) * 0.1 + 1}.0`,
          operator: ['张主任', '李医生', '王教授', '赵老师'][i % 4],
          operateTime: `2026-0${(i % 6) + 1}-${String((i * 3 + 1) % 28 + 1).padStart(2, '0')} 10:${String((i * 7) % 60).padStart(2, '0')}`,
          remark: '初始创建'
        }
      ]
    }))

  const makeFiles = (names: string[], docNamesList: string[][]) =>
    names.map((name, i) => ({
      id: generateId(),
      name,
      categoryId: '',
      categoryName: '',
      remark: ['标准操作规范', '质量控制参考', '检测指南文档', '平台操作手册'][i % 4],
      createTime: `2026-0${(i % 4) + 1}-${String((i * 5 + 1) % 28 + 1).padStart(2, '0')} 09:${String((i * 11) % 60).padStart(2, '0')}`,
      documents: makeDocs(docNamesList[i] || [])
    }))

  // ===== 分类树 =====
  const treeRef = ref()
  const treeProps = { children: 'children', label: 'label' }

  const categoryTreeData = ref<CategoryNode[]>([
    {
      id: 'cat-1',
      label: '分子病理',
      name: '分子病理',
      level: 0,
      parentId: null,
      remark: '分子病理相关知识',
      children: [
        {
          id: 'cat-1-1',
          label: 'NGS检测',
          name: 'NGS检测',
          level: 1,
          parentId: 'cat-1',
          remark: 'NGS检测相关知识',
          children: [
            {
              id: 'cat-1-1-1',
              label: 'NGSR',
              name: 'NGSR',
              level: 2,
              parentId: 'cat-1-1',
              remark: 'NGSR相关知识',
              children: [],
              files: makeFiles(
                ['NGSR核酸质控SOP', 'NGSR预文库质控规范', 'NGSR上机操作指南', 'NGSR生信分析流程'],
                [
                  ['NGSR核酸质控标准操作规程v1.0', 'DNA浓度检测方法说明', 'RNA质量评估标准'],
                  ['预文库构建标准流程', '预文库质控要点汇总', 'Qubit浓度检测规范'],
                  ['上机操作安全规范', '上机参数配置指南', '上机数据质控标准'],
                  ['生信分析流程说明', '变异解读标准规范', '报告生成模板说明']
                ]
              )
            },
            {
              id: 'cat-1-1-2',
              label: 'NGSA',
              name: 'NGSA',
              level: 2,
              parentId: 'cat-1-1',
              remark: 'NGSA相关知识',
              children: [],
              files: makeFiles(
                ['NGSA核酸质控SOP', 'NGSA终文库质控规范', 'NGSA上机操作指南'],
                [
                  ['NGSA核酸质控标准操作规程v1.0', 'DNA浓度检测方法说明'],
                  ['终文库构建标准流程', '终文库质控要点汇总', 'Index_Set配置规范'],
                  ['上机操作安全规范', '上机参数配置指南']
                ]
              )
            }
          ],
          files: makeFiles(
            ['NGS检测总览', 'NGS平台通用规范'],
            [
              ['NGS检测项目总览', 'NGS检测临床意义说明', 'NGS报告解读指南'],
              ['NGS平台设备管理规范', 'NGS数据存储与备份规范']
            ]
          )
        },
        {
          id: 'cat-1-2',
          label: 'PCR检测',
          name: 'PCR检测',
          level: 1,
          parentId: 'cat-1',
          remark: 'PCR检测相关知识',
          children: [
            {
              id: 'cat-1-2-1',
              label: 'PCR10',
              name: 'PCR10',
              level: 2,
              parentId: 'cat-1-2',
              remark: 'PCR10基因质控相关知识',
              children: [],
              files: makeFiles(
                ['PCR10核酸质控SOP', 'PCR10文库质控规范', 'PCR10上机操作指南', 'PCR10生信分析流程'],
                [
                  ['PCR10核酸质控标准操作规程v1.0', 'PCR10 DNA浓度检测方法', 'PCR10 RNA质量评估标准'],
                  ['PCR10文库构建标准流程', 'PCR10文库质控要点汇总', 'PCR10文库常见问题处理'],
                  ['PCR10上机操作安全规范', 'PCR10上机参数配置指南', 'PCR10上机异常处理'],
                  ['PCR10生信分析流程说明', 'PCR10变异解读标准', 'PCR10报告规范']
                ]
              )
            },
            {
              id: 'cat-1-2-2',
              label: 'PCR11',
              name: 'PCR11',
              level: 2,
              parentId: 'cat-1-2',
              remark: 'PCR11基因质控相关知识',
              children: [],
              files: makeFiles(
                ['PCR11核酸质控SOP', 'PCR11文库质控规范', 'PCR11上机操作指南'],
                [
                  ['PCR11核酸质控标准操作规程v1.0', 'PCR11 DNA浓度检测方法', 'PCR11 RNA质量评估标准'],
                  ['PCR11文库构建标准流程', 'PCR11文库质控要点汇总'],
                  ['PCR11上机操作安全规范', 'PCR11上机参数配置指南', 'PCR11上机数据质控标准']
                ]
              )
            }
          ],
          files: makeFiles(
            ['PCR检测总览', 'PCR平台通用规范', 'PCR仪器维护手册'],
            [
              ['PCR检测项目总览', 'PCR检测临床意义说明'],
              ['PCR平台设备管理规范', 'PCR数据存储与备份规范', 'PCR试剂管理规范'],
              ['PCR仪器日常维护流程', 'PCR仪器校准标准', 'PCR仪器故障排查']
            ]
          )
        },
        {
          id: 'cat-1-3',
          label: 'FISH检测',
          name: 'FISH检测',
          level: 1,
          parentId: 'cat-1',
          remark: 'FISH检测相关知识',
          children: [
            {
              id: 'cat-1-3-1',
              label: 'FISH常规',
              name: 'FISH常规',
              level: 2,
              parentId: 'cat-1-3',
              remark: 'FISH常规检测知识',
              children: [],
              files: makeFiles(
                ['FISH样本处理规范', 'FISH杂交操作SOP', 'FISH结果判读标准'],
                [
                  ['FISH样本固定与处理标准', 'FISH样本切片制备规范'],
                  ['FISH探针杂交操作流程', 'FISH杂交后洗涤标准'],
                  ['FISH信号判读标准', 'FISH结果报告规范']
                ]
              )
            }
          ],
          files: makeFiles(
            ['FISH检测总览', 'FISH实验室管理规范'],
            [
              ['FISH检测项目总览', 'FISH检测适应症说明'],
              ['FISH实验室环境要求', 'FISH试剂存储管理']
            ]
          )
        }
      ],
      files: makeFiles(
        ['分子病理检验总则', '分子病理实验室安全管理'],
        [
          ['分子病理检验总则v3.0', '分子病理样本采集规范', '分子病理报告审核流程'],
          ['实验室生物安全管理条例', '实验室废弃物处理规范', '实验室应急预案']
        ]
      )
    },
    {
      id: 'cat-2',
      label: '质控规范',
      name: '质控规范',
      level: 0,
      parentId: null,
      remark: '质控规范相关文档',
      children: [],
      files: makeFiles(
        ['通用质控标准', '质控记录管理规范', '质控异常处理流程', '质控设备校准规范'],
        [
          ['通用质控标准v2.1', '质控指标定义与计算', '质控结果判定标准'],
          ['质控记录填写规范', '质控记录归档管理', '质控记录电子化要求'],
          ['质控异常分级标准', '质控异常上报流程', '质控异常纠正措施'],
          ['质控设备校准周期表', '质控设备校准操作流程', '质控设备校准记录模板']
        ]
      )
    },
    {
      id: 'cat-3',
      label: '实验操作规范',
      name: '实验操作规范',
      level: 0,
      parentId: null,
      remark: '实验操作规范文档',
      children: [
        {
          id: 'cat-3-1',
          label: '样本处理',
          name: '样本处理',
          level: 1,
          parentId: 'cat-3',
          remark: '样本处理相关规范',
          children: [],
          files: makeFiles(
            ['血液样本处理SOP', '组织样本处理SOP', '核酸提取操作规范'],
            [
              ['血液样本采集与保存标准', '血液样本离心分离流程', '血液样本运输规范'],
              ['组织样本取材标准', '组织样本固定流程', '组织样本包埋操作规范'],
              ['DNA提取标准操作流程', 'RNA提取标准操作流程', '核酸质量检测方法']
            ]
          )
        }
      ],
      files: makeFiles(
        ['实验室安全操作总则', '实验人员培训考核制度'],
        [
          ['实验室安全操作总则v2.0', '个人防护装备使用规范', '实验室紧急情况处理预案'],
          ['实验人员上岗培训要求', '实验人员年度考核标准', '实验人员继续教育要求']
        ]
      )
    }
  ])

  // ===== 构建树数据（分类 + 文件） =====
  const treeData = computed(() => {
    const { category, fileName, docName } = searchParams.value
    const buildTree = (nodes: CategoryNode[]): any[] => {
      const result: any[] = []
      for (const node of nodes) {
        // 文件节点过滤
        const fileNodes = (node.files || [])
          .filter((f) => {
            if (fileName && !f.name.includes(fileName)) return false
            if (docName && !(f.documents || []).some((d) => d.name.includes(docName))) return false
            return true
          })
          .map((f) => ({
            ...f,
            id: f.id,
            label: f.name,
            isCategory: false,
            children: []
          }))
        const childCategories = node.children ? buildTree(node.children) : []
        const hasChildren = fileNodes.length > 0 || childCategories.length > 0
        const matchesCategory = !category || node.name === category || nodeHasDescendant(node, category)
        if (matchesCategory && hasChildren) {
          result.push({
            ...node,
            isCategory: true,
            children: [...childCategories, ...fileNodes]
          })
        } else if (matchesCategory && !hasChildren && !category) {
          result.push({
            ...node,
            isCategory: true,
            children: [...childCategories, ...fileNodes]
          })
        }
      }
      return result
    }
    return buildTree(categoryTreeData.value)
  })

  // 检查节点是否有匹配的后代分类
  const nodeHasDescendant = (node: CategoryNode, targetName: string): boolean => {
    if (node.name === targetName) return true
    if (node.children) {
      return node.children.some((child) => nodeHasDescendant(child, targetName))
    }
    return false
  }

  // ===== 选中状态 =====
  const selectedCategory = ref<CategoryNode | null>(null)
  const selectedFile = ref<FileItem | null>(null)

  // ===== 文件列表 =====
  const fileColumns: ColumnOption[] = [
    { prop: 'name', label: '文件名称', minWidth: 180 },
    { prop: 'remark', label: '备注', minWidth: 160 },
    { prop: 'createTime', label: '创建时间', width: 160 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right'
    }
  ]

  const fileList = ref<FileItem[]>([])

  // ===== 文档列表 =====
  const documentColumns: ColumnOption[] = [
    { type: 'selection', width: 50, fixed: 'left' },
    { prop: 'name', label: '文档名称', minWidth: 150 },
    { prop: 'version', label: '版本', width: 80, align: 'center' },
    { prop: 'uploader', label: '上传人', width: 100 },
    { prop: 'uploadRemark', label: '上传备注', minWidth: 140 },
    { prop: 'uploadTime', label: '上传时间', width: 160 },
    {
      prop: 'operation',
      label: '操作',
      width: 192,
      fixed: 'right',
      useSlot: true
    }
  ]

  const documentList = ref<DocumentItem[]>([])
  const selectedDocs = ref<DocumentItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  // ===== 分类弹窗 =====
  const categoryDialogVisible = ref(false)
  const categoryDialogTitle = ref('')
  const categoryForm = reactive({ name: '', remark: '' })
  let editingCategory: CategoryNode | null = null
  let parentCategory: CategoryNode | null = null

  // ===== 文件弹窗 =====
  const fileDialogVisible = ref(false)
  const fileDialogTitle = ref('')
  const fileForm = reactive({ name: '', remark: '', categoryName: '' })
  let editingFile: FileItem | null = null

  // ===== 文档弹窗 =====
  const documentDialogVisible = ref(false)
  const documentDialogTitle = ref('')
  const uploadRef = ref()
  const uploadedFile = ref<File | null>(null)
  const documentForm = reactive({ name: '', version: '', uploader: '当前账号', uploadFile: '', uploadRemark: '' })
  let editingDocument: DocumentItem | null = null

  const handleUploadChange = (file: any) => {
    uploadedFile.value = file.raw
    documentForm.uploadFile = file.name
  }

  const handleUploadRemove = () => {
    uploadedFile.value = null
    documentForm.uploadFile = ''
  }

  // ===== 文档查看弹窗 =====
  const viewDialogVisible = ref(false)
  const viewDocument = ref<DocumentItem | null>(null)

  // ===== 修订记录弹窗 =====
  const revisionDialogVisible = ref(false)
  const revisionList = ref<RevisionItem[]>([])
  const revisionColumns: ColumnOption[] = [
    { prop: 'version', label: '版本', width: 80, align: 'center' },
    { prop: 'operator', label: '修订人', minWidth: 120 },
    { prop: 'operateTime', label: '修订时间', minWidth: 180 },
    { prop: 'operation', label: '操作', width: 108, useSlot: true }
  ]

  // ===== 导出弹窗 =====
  const exportDialogVisible = ref(false)
  const exportScope = ref('category')

  // ===== 递归查找全部分类 =====
  const findCategoryById = (
    nodes: CategoryNode[],
    id: string
  ): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findCategoryById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  // ===== 根节点CRUD =====
  const handleAddRootCategory = () => {
    editingCategory = null
    parentCategory = null
    categoryDialogTitle.value = '添加分类'
    categoryForm.name = ''
    categoryForm.remark = ''
    categoryDialogVisible.value = true
  }

  const handleAddChildCategory = (data: CategoryNode) => {
    editingCategory = null
    parentCategory = data
    categoryDialogTitle.value = '添加子分类'
    categoryForm.name = ''
    categoryForm.remark = ''
    categoryDialogVisible.value = true
  }

  const handleEditCategory = (data: CategoryNode) => {
    editingCategory = data
    parentCategory = null
    categoryDialogTitle.value = '编辑分类'
    categoryForm.name = data.name
    categoryForm.remark = data.remark
    categoryDialogVisible.value = true
  }

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      ElMessage.warning('请输入分类名称')
      return
    }
    if (editingCategory) {
      editingCategory.name = categoryForm.name
      editingCategory.label = categoryForm.name
      editingCategory.remark = categoryForm.remark
      ElMessage.success('分类已更新')
    } else {
      const newNode: CategoryNode = {
        id: generateId(),
        label: categoryForm.name,
        name: categoryForm.name,
        level: parentCategory ? parentCategory.level + 1 : 0,
        parentId: parentCategory?.id ?? null,
        remark: categoryForm.remark,
        children: [],
        files: []
      }
      if (parentCategory) {
        if (!parentCategory.children) parentCategory.children = []
        parentCategory.children.push(newNode)
      } else {
        categoryTreeData.value.push(newNode)
      }
      ElMessage.success('分类已添加')
    }
    categoryDialogVisible.value = false
  }

  const handleDeleteCategory = (data: CategoryNode) => {
    ElMessageBox.confirm(`确定删除分类「${data.label}」吗？该操作不可恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const removeFromTree = (nodes: CategoryNode[], id: string): boolean => {
        const idx = nodes.findIndex((n) => n.id === id)
        if (idx > -1) {
          nodes.splice(idx, 1)
          return true
        }
        for (const node of nodes) {
          if (node.children?.length && removeFromTree(node.children, id)) return true
        }
        return false
      }
      removeFromTree(categoryTreeData.value, data.id)
      if (selectedCategory.value?.id === data.id) {
        selectedCategory.value = null
        selectedFile.value = null
        fileList.value = []
        documentList.value = []
      }
      ElMessage.success('分类已删除')
    })
  }

  // ===== 树节点点击 =====
  const handleNodeClick = (data: CategoryNode) => {
    selectedCategory.value = data
    selectedFile.value = null
    fileList.value = data.files || []
    // 聚合该分类下所有文件的所有文档
    const allFiles = data.files || []
    documentList.value = allFiles.flatMap((f) =>
      (f.documents || []).map((d) => ({ ...d, fileId: f.id }))
    )
    pagination.current = 1
    pagination.total = documentList.value.length
  }

  // 树节点点击（分类不可选，仅文件可选）
  const handleTreeNodeClick = (data: any) => {
    if (data.isCategory) return
    // 文件节点：展示文档
    selectedFile.value = data
    selectedCategory.value = findCategoryContainingFile(categoryTreeData.value, data.id)
    documentList.value = data.documents || []
    pagination.current = 1
    pagination.total = documentList.value.length
  }

  // 查找包含指定文件的分类
  const findCategoryContainingFile = (nodes: CategoryNode[], fileId: string): CategoryNode | null => {
    for (const node of nodes) {
      if (node.files?.some((f) => f.id === fileId)) return node
      if (node.children?.length) {
        const found = findCategoryContainingFile(node.children, fileId)
        if (found) return found
      }
    }
    return null
  }

  // 添加文件到分类（改为添加文档到分类下的第一个文件）
  const handleAddFileToCategory = (data: any) => {
    if (data.files && data.files.length > 0) {
      selectedCategory.value = data
      selectedFile.value = data.files[0]
      documentList.value = data.files[0].documents || []
      handleAddDocument()
    } else {
      ElMessage.warning('请先添加文件')
    }
  }

  // ===== 文件CRUD =====
  const handleAddFile = (data: CategoryNode) => {
    editingFile = null
    fileDialogTitle.value = '添加文件'
    fileForm.name = ''
    fileForm.remark = ''
    fileForm.categoryName = data.name
    // 临时存储分类引用
    ;(fileForm as any)._category = data
    fileDialogVisible.value = true
  }

  const handleEditFile = (row: FileItem) => {
    editingFile = row
    fileDialogTitle.value = '编辑文件'
    fileForm.name = row.name
    fileForm.remark = row.remark
    fileForm.categoryName = row.categoryName
    fileDialogVisible.value = true
  }

  const handleSaveFile = () => {
    if (!fileForm.name.trim()) {
      ElMessage.warning('请输入文件名称')
      return
    }
    const targetCategory = (fileForm as any)._category || selectedCategory.value
    if (!targetCategory) {
      ElMessage.warning('未选择分类')
      return
    }
    if (editingFile) {
      editingFile.name = fileForm.name
      editingFile.remark = fileForm.remark
      ElMessage.success('文件已更新')
    } else {
      const newFile: FileItem = {
        id: generateId(),
        name: fileForm.name,
        categoryId: targetCategory.id,
        categoryName: targetCategory.name,
        remark: fileForm.remark,
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        documents: []
      }
      if (!targetCategory.files) targetCategory.files = []
      targetCategory.files.push(newFile)
      ElMessage.success('文件已添加')
    }
    fileList.value = [...(targetCategory.files || [])]
    delete (fileForm as any)._category
    fileDialogVisible.value = false
  }

  const handleDeleteFile = (row: FileItem) => {
    ElMessageBox.confirm(`确定删除文件「${row.name}」吗？该操作不可恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      if (selectedCategory.value?.files) {
        const idx = selectedCategory.value.files.findIndex((f) => f.id === row.id)
        if (idx > -1) selectedCategory.value.files.splice(idx, 1)
        fileList.value = [...selectedCategory.value.files]
        if (selectedFile.value?.id === row.id) {
          selectedFile.value = null
          documentList.value = []
        }
      }
      ElMessage.success('文件已删除')
    })
  }

  const handleDownloadFile = (row: FileItem) => {
    ElMessage.success(`正在下载文件：${row.name}`)
  }

  // ===== 文件行点击 =====
  const handleFileRowClick = (row: FileItem) => {
    selectedFile.value = row
    documentList.value = row.documents || []
    pagination.current = 1
    pagination.total = documentList.value.length
  }

  // ===== 文档CRUD =====
  const handleAddDocument = () => {
    if (!selectedCategory.value) {
      ElMessage.warning('请先选择分类')
      return
    }
    editingDocument = null
    documentDialogTitle.value = '新增文档'
    documentForm.name = ''
    documentForm.version = ''
    documentForm.uploader = '当前账号'
    documentForm.uploadFile = ''
    documentForm.uploadRemark = ''
    uploadedFile.value = null
    uploadRef.value?.clearFiles()
    documentDialogVisible.value = true
  }

  const handleEditDocument = (row: DocumentItem) => {
    editingDocument = row
    documentDialogTitle.value = '编辑文档'
    documentForm.name = row.name
    documentForm.version = row.version
    documentForm.uploader = row.uploader
    documentForm.uploadFile = (row as any).uploadFile || ''
    documentForm.uploadRemark = row.uploadRemark
    documentDialogVisible.value = true
  }

  const handleSaveDocument = () => {
    if (!documentForm.name.trim()) {
      ElMessage.warning('请输入文档名称')
      return
    }
    if (!documentForm.uploadFile.trim()) {
      ElMessage.warning('请选择上传文件')
      return
    }
    const targetFile = selectedFile.value
    if (!targetFile) {
      if (editingDocument) {
        editingDocument.name = documentForm.name
        editingDocument.version = documentForm.version
        editingDocument.uploader = documentForm.uploader
        editingDocument.uploadRemark = documentForm.uploadRemark
        ;(editingDocument as any).uploadFile = documentForm.uploadFile
        ElMessage.success('文档已更新')
      } else {
        ElMessage.warning('请先选择文件')
        return
      }
    } else {
      if (editingDocument) {
        editingDocument.name = documentForm.name
        editingDocument.version = documentForm.version
        editingDocument.uploader = documentForm.uploader
        editingDocument.uploadRemark = documentForm.uploadRemark
        ;(editingDocument as any).uploadFile = documentForm.uploadFile
        ElMessage.success('文档已更新')
      } else {
        const newDoc: DocumentItem = {
          id: generateId(),
          name: documentForm.name,
          version: documentForm.version || '1.0',
          uploader: documentForm.uploader || '当前用户',
          uploadRemark: documentForm.uploadRemark,
          uploadFile: documentForm.uploadFile,
          uploadTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
          fileId: targetFile.id,
          revisions: [
            {
              id: generateId(),
              version: documentForm.version || '1.0',
              operator: documentForm.uploader || '当前用户',
              operateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              remark: '初始创建'
            }
          ]
        }
        if (!targetFile.documents) targetFile.documents = []
        targetFile.documents.push(newDoc)
        ElMessage.success('文档已添加')
      }
      documentList.value = [...(targetFile.documents || [])]
      pagination.total = documentList.value.length
    }
    documentDialogVisible.value = false
  }

  const handleDeleteDocument = (row: DocumentItem) => {
    ElMessageBox.confirm(`确定删除文档「${row.name}」吗？该操作不可恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      if (selectedFile.value?.documents) {
        const idx = selectedFile.value.documents.findIndex((d) => d.id === row.id)
        if (idx > -1) selectedFile.value.documents.splice(idx, 1)
        documentList.value = [...selectedFile.value.documents]
        pagination.total = documentList.value.length
      }
      ElMessage.success('文档已删除')
    })
  }

  const handleDownloadDocument = (row: DocumentItem) => {
    ElMessage.success(`正在下载文档: ${row.name}`)
  }

  const handleViewDocument = (row: DocumentItem) => {
    viewDocument.value = { ...row }
    viewDialogVisible.value = true
  }

  const handleDownloadFromView = () => {
    if (viewDocument.value) {
      ElMessage.success(`正在下载文档: ${viewDocument.value.name}`)
      viewDialogVisible.value = false
    }
  }

  const handleDocMoreAction = (cmd: string, row: DocumentItem) => {
    if (cmd === 'delete') {
      handleDeleteDocument(row)
    } else if (cmd === 'revision') {
      handleRevisionHistory(row)
    }
  }

  // ===== 修订记录 =====
  const currentRevisionDoc = ref<DocumentItem | null>(null)

  const handleRevisionHistory = (row: DocumentItem) => {
    currentRevisionDoc.value = row
    revisionList.value = row.revisions || []
    revisionDialogVisible.value = true
  }

  const handleRevisionView = (row: RevisionItem) => {
    // 打开文档查看弹窗，展示上传的文件
    if (currentRevisionDoc.value) {
      viewDocument.value = { ...currentRevisionDoc.value }
      viewDialogVisible.value = true
    }
  }

  const handleRevisionDownload = (row: RevisionItem) => {
    ElMessage.success(`下载修订版本: ${row.version}`)
  }

  // ===== 文档选择 =====
  const handleDocSelectionChange = (selection: DocumentItem[]) => {
    selectedDocs.value = selection
  }

  const handleDocSizeChange = (val: number) => {
    pagination.size = val
  }

  const handleDocCurrentChange = (val: number) => {
    pagination.current = val
  }

  // ===== 导出 =====
  const handleExportDocuments = () => {
    exportDialogVisible.value = true
    exportScope.value = 'category'
  }

  const handleConfirmExport = () => {
    if (exportScope.value === 'category') {
      const docs = documentList.value
      if (docs.length === 0) {
        ElMessage.warning('当前分类下无文档可导出')
        return
      }
      exportToCSV(docs, `知识库导出_${selectedCategory.value?.name || '全部'}`)
    } else {
      if (selectedDocs.value.length === 0) {
        ElMessage.warning('请先选择要导出的文档')
        return
      }
      exportToCSV(selectedDocs.value, '知识库导出_选中')
    }
    exportDialogVisible.value = false
  }

  const exportToCSV = (docs: DocumentItem[], filename: string) => {
    const headers = ['文档名称', '版本', '上传人', '上传备注', '上传时间']
    const rows = docs.map((d) => [d.name, d.version, d.uploader, d.uploadRemark, d.uploadTime])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    ElMessage.success(`已导出 ${docs.length} 条数据`)
  }

  // ===== 搜索 =====
  const searchParams = ref({ category: '', fileName: '', docName: '' })

  const handleSearch = (params: { category: string; fileName: string; docName: string }) => {
    searchParams.value = { ...params }
  }

  const handleReset = () => {
    searchParams.value = { category: '', fileName: '', docName: '' }
  }
</script>

<style lang="scss" scoped>
  .knowledge-share {
    .tree-card-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .tree-node {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 4px;

      .tree-node-label {
        flex: 1;
        display: flex;
        align-items: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tree-node-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;

        .action-icon {
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          font-size: 18px;
          transition: all 0.2s;

          &.add {
            color: var(--el-color-primary);
          }
          &.edit {
            color: var(--el-color-warning);
          }
          &.delete {
            color: var(--el-color-danger);
          }

          &:hover {
            background: var(--el-fill-color-light);
          }
        }
      }
    }

    .tree-file-node {
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.2s;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }

    .card-header-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 300px;
    }

    // ===== Word文档样式文档预览 =====
    .report-preview-doc {
      padding: 0;
      background: #fff;
      font-family: 'SimSun', '宋体', serif;
      font-size: 14px;
      line-height: 1.8;
      color: #333;

      .doc-header {
        text-align: center;
        margin-bottom: 16px;

        .doc-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 12px 0;
          letter-spacing: 2px;
        }
      }

      .doc-divider {
        border-bottom: 2px solid #333;
        margin: 12px 0;
      }

      .doc-content {
        padding: 0;
      }

      .doc-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;

        td {
          border: 1px solid #999;
          padding: 6px 10px;
          vertical-align: middle;
        }

        .doc-label {
          background: #f5f7fa;
          width: 100px;
          font-weight: 600;
          text-align: right;
          color: #555;
          white-space: nowrap;
        }

        .doc-value {
          min-width: 120px;
        }
      }

      .doc-content-body {
        padding: 20px 0;
        min-height: 200px;
        text-align: center;
        color: #666;
        line-height: 2;
      }

      .file-link {
        display: inline-flex;
        align-items: center;
        color: var(--el-color-primary);
        cursor: pointer;
      }

      .doc-file-preview {
        .file-preview-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
        }

        .file-preview-info {
          .file-preview-name {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin: 0 0 4px 0;
          }

          .file-preview-hint {
            font-size: 12px;
            color: #999;
            margin: 0;
          }
        }

        .file-preview-content {
          padding: 8px 0;

          h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 12px 0 6px;
            color: #333;
          }

          p {
            font-size: 14px;
            line-height: 1.8;
            color: #555;
            margin: 0 0 4px;
            text-indent: 2em;
          }
        }
      }
    }
  }
</style>