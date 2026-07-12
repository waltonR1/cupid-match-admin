<template>
  <div class="app-container legal-page">
    <el-alert
      class="mb16"
      type="warning"
      show-icon
      :closable="false"
      title="已生效和已归档版本不可直接修改。需要更新条款时，请先创建新版草稿，确认内容后再发布。"
    />

    <el-form v-show="showSearch" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="文档类型">
        <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 180px">
          <el-option v-for="item in documentTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="DocumentAdd" @click="createDraft('terms')" v-hasPermi="['cupid:legal:edit']">
          新版服务条款
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="DocumentAdd" @click="createDraft('privacy')" v-hasPermi="['cupid:legal:edit']">
          新版隐私政策
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="文档" min-width="260">
        <template #default="{ row }">
          <div class="primary-text">{{ typeLabel(row.type) }}</div>
          <div class="muted">{{ row.title || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="版本" prop="version" width="120" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="语言" width="100">
        <template #default="{ row }">{{ row.localeCount || 0 }}/3</template>
      </el-table-column>
      <el-table-column label="生效时间" width="170">
        <template #default="{ row }">{{ parseTime(row.effectiveAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ parseTime(row.updatedAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:legal:query']">
            {{ row.status === 'draft' ? '编辑' : '查看' }}
          </el-button>
          <el-button v-if="row.status === 'draft'" link type="success" @click="publishDraft(row)" v-hasPermi="['cupid:legal:edit']">
            发布
          </el-button>
          <el-button v-if="row.status === 'active'" link type="warning" @click="createDraft(row.type)" v-hasPermi="['cupid:legal:edit']">
            创建新版
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="detailOpen" :title="drawerTitle" size="1040px" destroy-on-close>
      <template v-if="detail">
        <el-alert
          v-if="!canEdit"
          class="mb16"
          type="info"
          show-icon
          :closable="false"
          title="当前版本不可修改。如需调整内容，请回到列表创建新版草稿。"
        />

        <el-form :model="form" label-width="90px">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="文档类型">
                <el-input :value="typeLabel(detail.type)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="版本">
                <el-input v-model="form.version" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态">
                <el-input :value="statusLabel(form.status)" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="生效时间">
            <el-date-picker
              v-model="form.effectiveAt"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              placeholder="选择生效时间"
              style="width: 260px"
              :disabled="!canEdit"
            />
          </el-form-item>
        </el-form>

        <el-tabs v-model="activeLocale" class="legal-tabs">
          <el-tab-pane v-for="content in form.contents" :key="content.locale" :label="localeLabel(content.locale)" :name="content.locale">
            <el-form label-width="90px">
              <el-form-item label="标题">
                <el-input v-model="content.title" maxlength="255" show-word-limit :disabled="!canEdit" />
              </el-form-item>
            </el-form>

            <div class="section-list">
              <article v-for="(section, sectionIndex) in content.sections" :key="sectionIndex" class="section-card">
                <div class="section-card__head">
                  <div class="section-title">章节 {{ sectionIndex + 1 }}</div>
                  <div v-if="canEdit" class="section-actions">
                    <el-button link type="primary" @click="addClause(section)">添加条款</el-button>
                    <el-button link type="danger" @click="removeSection(content, sectionIndex)">删除章节</el-button>
                  </div>
                </div>

                <el-form label-width="90px">
                  <el-form-item label="章节标题">
                    <el-input v-model="section.heading" :disabled="!canEdit" placeholder="例如：第一章 服务内容" />
                  </el-form-item>
                </el-form>

                <div class="clause-list">
                  <div v-for="(clause, clauseIndex) in section.clauses" :key="clauseIndex" class="clause-row">
                    <el-input
                      v-model="clause.number"
                      class="clause-number"
                      :disabled="!canEdit"
                      placeholder="编号"
                    />
                    <el-input
                      v-model="clause.body"
                      type="textarea"
                      :rows="3"
                      :disabled="!canEdit"
                      placeholder="条款内容"
                    />
                    <el-button v-if="canEdit" link type="danger" @click="removeClause(section, clauseIndex)">删除</el-button>
                  </div>
                </div>
              </article>
            </div>

            <el-empty v-if="!content.sections.length" description="暂无章节" />
            <el-button v-if="canEdit" type="primary" plain icon="Plus" @click="addSection(content)">添加章节</el-button>
          </el-tab-pane>
        </el-tabs>
      </template>

      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <el-button v-if="canEdit" type="primary" :loading="saving" @click="submit" v-hasPermi="['cupid:legal:edit']">保存草稿</el-button>
        <el-button v-if="canEdit" type="success" :loading="publishing" @click="publishCurrentDraft" v-hasPermi="['cupid:legal:edit']">
          发布为生效版本
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  createCupidLegalDraft,
  getCupidLegalDocument,
  listCupidLegalDocuments,
  publishCupidLegalDraft,
  updateCupidLegalDocument,
  type CupidLegalClause,
  type CupidLegalDocumentContent,
  type CupidLegalDocumentDetail,
  type CupidLegalDocumentItem,
  type CupidLegalDocumentStatus,
  type CupidLegalDocumentType,
  type CupidLegalLocale,
  type CupidLegalSection
} from '@/api/cupid/legal'

const proxy = getCurrentInstance()?.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const rows = ref<CupidLegalDocumentItem[]>([])
const detailOpen = ref(false)
const detail = ref<CupidLegalDocumentDetail>()
const activeLocale = ref<CupidLegalLocale>('zh')

const queryParams = reactive({
  type: ''
})

const form = reactive({
  version: '',
  status: 'active' as CupidLegalDocumentStatus,
  effectiveAt: '',
  contents: [] as CupidLegalDocumentContent[]
})

const documentTypes: Array<{ label: string; value: CupidLegalDocumentType }> = [
  { label: '服务条款', value: 'terms' },
  { label: '隐私政策', value: 'privacy' }
]

const statuses: Array<{ label: string; value: CupidLegalDocumentStatus }> = [
  { label: '草稿', value: 'draft' },
  { label: '生效中', value: 'active' },
  { label: '已归档', value: 'archived' }
]

const canEdit = computed(() => detail.value?.status === 'draft')
const drawerTitle = computed(() => {
  if (!detail.value) return '法律条款'
  return `${typeLabel(detail.value.type)} ${detail.value.version} - ${statusLabel(detail.value.status)}`
})

function typeLabel(value?: string) {
  return documentTypes.find(item => item.value === value)?.label || value || '-'
}

function localeLabel(value?: string) {
  if (value === 'zh') return '中文'
  if (value === 'en') return '英文'
  if (value === 'fr') return '法文'
  return value || '-'
}

function statusLabel(value?: string) {
  return statuses.find(item => item.value === value)?.label || value || '-'
}

function statusTag(value?: string) {
  if (value === 'active') return 'success'
  if (value === 'archived') return 'info'
  return 'warning'
}

async function getList() {
  loading.value = true
  try {
    const res = await listCupidLegalDocuments({ type: queryParams.type || undefined })
    rows.value = res.data || []
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  queryParams.type = ''
  void getList()
}

async function createDraft(type: CupidLegalDocumentType) {
  try {
    await proxy?.$modal.confirm(`确定基于当前${typeLabel(type)}创建一个递增版本草稿吗？`)
  } catch (error) {
    // 用户取消时不提示。
    return
  }

  const res = await createCupidLegalDraft(type)
  proxy?.$modal.msgSuccess('新版草稿已创建')
  await getList()
  if (res.data?.id) {
    await openDetail(res.data.id)
  }
}

async function openDetail(id: string) {
  detail.value = (await getCupidLegalDocument(id)).data
  if (!detail.value) return
  form.version = detail.value.version
  form.status = detail.value.status
  form.effectiveAt = detail.value.effectiveAt || ''
  form.contents = detail.value.contents.map(item => ({
    ...item,
    sections: normalizeSections(item.sections)
  }))
  activeLocale.value = 'zh'
  detailOpen.value = true
}

function normalizeSections(sections: CupidLegalSection[]) {
  return (sections || []).map((section, index) => ({
    heading: section.heading || '',
    sortOrder: Number(section.sortOrder || index + 1),
    clauses: (section.clauses || []).map(clause => ({
      number: clause.number || '',
      body: clause.body || ''
    }))
  }))
}

function addSection(content: CupidLegalDocumentContent) {
  content.sections.push({
    heading: '',
    sortOrder: content.sections.length + 1,
    clauses: [emptyClause()]
  })
}

function removeSection(content: CupidLegalDocumentContent, index: number) {
  content.sections.splice(index, 1)
  content.sections.forEach((section, sectionIndex) => {
    section.sortOrder = sectionIndex + 1
  })
}

function addClause(section: CupidLegalSection) {
  section.clauses.push(emptyClause())
}

function removeClause(section: CupidLegalSection, index: number) {
  section.clauses.splice(index, 1)
}

function emptyClause(): CupidLegalClause {
  return { number: '', body: '' }
}

function validateForm() {
  if (!form.effectiveAt) {
    proxy?.$modal.msgWarning('请选择生效时间')
    return false
  }
  for (const content of form.contents) {
    if (!content.title.trim()) {
      proxy?.$modal.msgWarning(`请填写${localeLabel(content.locale)}标题`)
      activeLocale.value = content.locale
      return false
    }
    if (!content.sections.length) {
      proxy?.$modal.msgWarning(`${localeLabel(content.locale)}至少需要一个章节`)
      activeLocale.value = content.locale
      return false
    }
    for (const [sectionIndex, section] of content.sections.entries()) {
      if (!section.heading.trim()) {
        proxy?.$modal.msgWarning(`${localeLabel(content.locale)}第 ${sectionIndex + 1} 个章节缺少标题`)
        activeLocale.value = content.locale
        return false
      }
      if (!section.clauses.length) {
        proxy?.$modal.msgWarning(`${localeLabel(content.locale)}第 ${sectionIndex + 1} 个章节至少需要一条条款`)
        activeLocale.value = content.locale
        return false
      }
      for (const [clauseIndex, clause] of section.clauses.entries()) {
        if (!clause.body.trim()) {
          proxy?.$modal.msgWarning(`${localeLabel(content.locale)}第 ${sectionIndex + 1} 章第 ${clauseIndex + 1} 条缺少内容`)
          activeLocale.value = content.locale
          return false
        }
      }
    }
  }
  return true
}

function normalizedPayloadContents() {
  return form.contents.map(content => ({
    ...content,
    title: content.title.trim(),
    sections: content.sections.map((section, index) => ({
      heading: section.heading.trim(),
      sortOrder: index + 1,
      clauses: section.clauses.map(clause => ({
        number: clause.number.trim(),
        body: clause.body.trim()
      }))
    }))
  }))
}

async function submit() {
  if (!detail.value || !canEdit.value || !validateForm()) return
  saving.value = true
  try {
    await updateCupidLegalDocument(detail.value.id, {
      version: form.version,
      status: form.status,
      effectiveAt: form.effectiveAt,
      contents: normalizedPayloadContents()
    })
    proxy?.$modal.msgSuccess('草稿已保存')
    await openDetail(detail.value.id)
    await getList()
  } finally {
    saving.value = false
  }
}

async function publishCurrentDraft() {
  if (!detail.value || !canEdit.value || !validateForm()) return
  await submit()
  await publishDraft(detail.value)
}

async function publishDraft(row: Pick<CupidLegalDocumentItem, 'id' | 'version' | 'type'>) {
  try {
    await proxy?.$modal.confirm(`确定发布 ${typeLabel(row.type)} ${row.version} 吗？发布后旧的生效版本会自动归档。`)
  } catch (error) {
    // 用户取消时不提示。
    return
  }

  publishing.value = true
  try {
    const effectiveAt = detail.value?.id === row.id ? form.effectiveAt || undefined : undefined
    await publishCupidLegalDraft(row.id, { effectiveAt })
    proxy?.$modal.msgSuccess('草稿已发布')
    detailOpen.value = false
    await getList()
  } finally {
    publishing.value = false
  }
}

onMounted(() => {
  void getList()
})
</script>

<style scoped lang="scss">
.legal-page {
  .mb16 {
    margin-bottom: 16px;
  }
}

.primary-text {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.legal-tabs {
  margin-top: 8px;
}

.section-list {
  display: grid;
  gap: 14px;
}

.section-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  background: #fbfcfe;
}

.section-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-actions {
  display: inline-flex;
  gap: 8px;
}

.clause-list {
  display: grid;
  gap: 10px;
}

.clause-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 48px;
  gap: 10px;
  align-items: start;
}

.clause-number {
  width: 110px;
}
</style>
