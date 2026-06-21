<template>
  <div class="app-container">
    <el-form ref="queryRef" class="manage-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item class="manage-query-id" label="资料ID" prop="profileId">
        <el-input v-model="queryParams.profileId" placeholder="资料ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="manage-query-name" label="资料名称" prop="profileKeyword">
        <el-input v-model="queryParams.profileKeyword" placeholder="资料名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="manage-query-id" label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="manage-query-name" label="用户名称" prop="userKeyword">
        <el-input v-model="queryParams.userKeyword" placeholder="用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="manage-query-select" label="类型" prop="profileType">
        <el-select v-model="queryParams.profileType" placeholder="资料类型" clearable>
          <el-option v-for="item in profileTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="manage-query-select" label="精选" prop="featured">
        <el-select v-model="queryParams.featured" placeholder="精选状态" clearable>
          <el-option label="精选" value="1" />
          <el-option label="未精选" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item class="manage-query-select manage-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in manageSortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="manage-query-date" label="更新时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item class="manage-query-actions">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="资料" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="profile-title">{{ profileTitle(row) }}</div>
          <div class="muted">{{ profileSummary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.ownerAccountName || row.ownerUserId || '-' }}</template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">{{ labelOf(profileTypes, row.profileType) }}</template>
      </el-table-column>
      <el-table-column label="精选" width="90">
        <template #default="{ row }">
          <el-tag v-if="Number(row.isFeatured) === 1" type="success" effect="plain">精选</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="雇主信息" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.employer || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="收入范围" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.incomeRange || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="内部备注" width="100">
        <template #default="{ row }">{{ notesState(row) }}</template>
      </el-table-column>
      <el-table-column label="运营更新" width="190">
        <template #default="{ row }">
          <div>{{ parseTime(row.internalUpdatedAt) || '-' }}</div>
          <div class="muted">{{ row.internalUpdatedByName || row.internalUpdatedByUserId || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.profileId)" v-hasPermi="['cupid:profileManage:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="资料运营管理" size="860px">
      <el-tabs v-model="activeLocale" class="profile-locale-tabs">
        <el-tab-pane v-for="item in localeTabs" :key="item.value" :label="item.label" :name="item.value" />
      </el-tabs>

      <el-divider content-position="left">资料概览</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="资料ID" :span="2">{{ detail.profileId }}</el-descriptions-item>
        <el-descriptions-item label="资料名称">{{ profileTitle(detail) }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.ownerAccountName || detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="资料类型">{{ labelOf(profileTypes, detail.profileType) }}</el-descriptions-item>
        <el-descriptions-item label="资料状态">
          <el-tag :type="profileStatusType(detail.profileStatus)">{{ labelOf(profileStatuses, detail.profileStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detail.createdAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detail.updatedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="运营更新时间">{{ parseTime(detail.internalUpdatedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="运营更新人">{{ detail.internalUpdatedByUserId || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">基础资料</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="性别">{{ labelOf(genders, detail.gender) }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ ageOf(detail.birthYear) }}</el-descriptions-item>
        <el-descriptions-item label="身高">{{ detail.height ? `${detail.height} cm` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ localizedFieldValue('city', detail.cityCode) }}</el-descriptions-item>
        <el-descriptions-item label="国家">{{ localizedFieldValue('country', detail.countryCode) }}</el-descriptions-item>
        <el-descriptions-item label="国籍">{{ localizedFieldValue('nationality', detail.nationalityCode) }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ localizedFieldValue('education', detail.educationCode) }} / {{ labelOf(degreeLevels, detail.degreeLevel) }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ localizedFieldValue('industry', detail.industryCode) }}</el-descriptions-item>
        <el-descriptions-item label="职业方向">{{ localizedFieldValue('career_direction') }}</el-descriptions-item>
        <el-descriptions-item label="语言">{{ labelsOf(languageOptions, detail.languages) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">婚恋与偏好</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="婚姻">{{ labelOf(maritalStatuses, detail.maritalStatus) }}</el-descriptions-item>
        <el-descriptions-item label="子女">{{ yesNo(detail.hasChildren) }} / {{ labelOf(childrenPlans, detail.childrenPlan) }}</el-descriptions-item>
        <el-descriptions-item label="交友意向">{{ labelOf(datingIntentions, detail.datingIntentionCode) }}</el-descriptions-item>
        <el-descriptions-item label="异地">{{ yesNo(detail.acceptsLongDistance) }}</el-descriptions-item>
        <el-descriptions-item label="关系目标">{{ localizedFieldValue('relationship_goal') }}</el-descriptions-item>
        <el-descriptions-item label="迁居">{{ labelOf(relocationOptions, detail.relocation) }}</el-descriptions-item>
        <el-descriptions-item label="关系价值观" :span="2">{{ labelsOf(relationshipValueOptions, detail.relationshipValues) }}</el-descriptions-item>
        <el-descriptions-item label="期望年龄">{{ preferredAgeRange(detail) }}</el-descriptions-item>
        <el-descriptions-item label="期望地区">{{ labelOf(preferredLocationOptions, detail.preferredLocation) }}</el-descriptions-item>
        <el-descriptions-item label="期望学历">{{ localizedFieldValue('preferred_education') }}</el-descriptions-item>
        <el-descriptions-item label="居住计划">{{ localizedFieldValue('residence_plan') }}</el-descriptions-item>
        <el-descriptions-item label="不可接受项" :span="2">{{ localizedItemValue('deal_breakers') }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">生活方式</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="吸烟">{{ labelOf(smokingOptions, detail.smoking) }}</el-descriptions-item>
        <el-descriptions-item label="饮酒">{{ labelOf(drinkingOptions, detail.drinking) }}</el-descriptions-item>
        <el-descriptions-item label="运动">{{ localizedFieldValue('exercise') }}</el-descriptions-item>
        <el-descriptions-item label="活跃度">{{ labelOf(activityLevels, detail.activityLevel) }}</el-descriptions-item>
        <el-descriptions-item label="周末方式">{{ labelOf(weekendStyles, detail.weekendStyle) }}</el-descriptions-item>
        <el-descriptions-item label="宠物">{{ labelOf(petOptions, detail.pets) }}</el-descriptions-item>
        <el-descriptions-item label="沟通方式">{{ labelOf(communicationStyles, detail.communicationStyle) }}</el-descriptions-item>
        <el-descriptions-item label="家庭生活">{{ localizedFieldValue('family_life') }}</el-descriptions-item>
        <el-descriptions-item label="性格特质" :span="2">{{ localizedItemValue('personality_traits') }}</el-descriptions-item>
        <el-descriptions-item label="兴趣" :span="2">{{ localizedItemValue('interests') }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ localizedFieldValue('summary') }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">{{ localizedItemValue('tags') }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">已通过照片</el-divider>
      <div v-if="approvedPhotos.length > 0" class="approved-photo-grid">
        <el-image
          v-for="photo in approvedPhotos"
          :key="photo.id"
          class="approved-photo"
          :src="photo.url"
          :preview-src-list="approvedPhotoUrls"
          fit="cover"
          preview-teleported
        />
      </div>
      <el-empty v-else description="暂无已通过照片" :image-size="80" />

      <el-divider content-position="left">运营控制</el-divider>
      <el-form v-if="detail" :model="internalForm" label-width="90px">
        <el-form-item label="精选状态">
          <el-switch
            v-model="internalForm.isFeatured"
            active-text="精选"
            inactive-text="未精选"
            :disabled="!canEditInternal || internalSaving"
            :loading="internalSaving"
            @change="submitInternal"
          />
        </el-form-item>
      </el-form>

      <el-divider content-position="left">认证参考</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="雇主信息">{{ internalFieldValue('employer') }}</el-descriptions-item>
        <el-descriptions-item label="收入范围">{{ internalFieldValue('income_range') }}</el-descriptions-item>
      </el-descriptions>

      <template v-if="canViewNotes">
        <el-divider content-position="left">内部备注</el-divider>
        <div class="notes-actions">
          <el-button plain icon="Document" @click="loadNotes">加载内部备注</el-button>
        </div>
        <el-form v-if="notesLoaded" :model="notesForm" label-width="90px" class="notes-form">
          <el-form-item label="编辑语言">
            <el-radio-group v-model="notesLocale">
              <el-radio-button v-for="item in localeTabs" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注内容">
            <el-input v-model="notesForm.fields.staff_notes[notesLocale]" type="textarea" :rows="5" maxlength="1000" show-word-limit :disabled="!canEditNotes" />
          </el-form-item>
          <el-form-item v-if="canEditNotes">
            <el-button type="primary" icon="Check" @click="submitNotes">保存内部备注</el-button>
          </el-form-item>
        </el-form>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  getProfileManage,
  getProfileManageNotes,
  listProfileManage,
  updateProfileManageInternal,
  updateProfileManageNotes
} from '@/api/cupid/profile-manage'
import { checkPermi } from '@/utils/permission'
import {
  activityLevels,
  ageOf,
  childrenPlans,
  communicationStyles,
  datingIntentions,
  degreeLevels,
  drinkingOptions,
  genders,
  labelOf,
  labelsOf,
  languageOptions,
  maritalStatuses,
  petOptions,
  preferredLocationOptions,
  profileStatuses,
  profileTitle,
  profileTypes,
  relationshipValueOptions,
  relocationOptions,
  smokingOptions,
  weekendStyles,
  yesNo
} from '../review-utils'

const { proxy } = getCurrentInstance()
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])
const detailOpen = ref(false)
const detail = ref<any>(null)
const activeLocale = ref('zh')
const notesLocale = ref('zh')
const notesLoaded = ref(false)
const internalSaving = ref(false)
const canEditInternal = computed(() => checkPermi(['cupid:profileManage:edit']))
const canViewNotes = computed(() => checkPermi(['cupid:profileManage:notes']))
const canEditNotes = computed(() => checkPermi(['cupid:profileManage:editNotes']))
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  profileId: '',
  profileKeyword: '',
  userId: '',
  userKeyword: '',
  profileType: '',
  featured: '',
  sortBy: 'internalUpdatedDesc'
})
const internalForm = reactive({
  isFeatured: false
})
const notesForm = reactive({
  fields: {
    staff_notes: { zh: '', fr: '', en: '' }
  }
})
const localeTabs = [
  { label: '中文', value: 'zh' },
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' }
]
const manageSortOptions = [
  { label: '运营更新时间', value: 'internalUpdatedDesc' },
  { label: '精选优先', value: 'featuredFirst' },
  { label: '资料名称', value: 'profileNameAsc' },
  { label: '用户名称', value: 'userNameAsc' }
]

const approvedPhotos = computed(() => (detail.value?.photos || []).filter((photo: any) => !photo.status || photo.status === 'approved'))

const approvedPhotoUrls = computed(() => approvedPhotos.value.map((photo: any) => photo.url).filter(Boolean))

function getList(): void {
  loading.value = true
  listProfileManage(buildQuery()).then((res) => {
    rows.value = res.rows || []
    total.value = res.total || 0
  }).finally(() => loading.value = false)
}

function buildQuery(): Record<string, any> {
  const query = { ...queryParams } as Record<string, any>
  if (dateRange.value?.length === 2) {
    query.beginTime = dateRange.value[0]
    query.endTime = dateRange.value[1]
  }
  return query
}

function handleQuery(): void {
  queryParams.pageNum = 1
  getList()
}

function resetQuery(): void {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

function openDetail(id: string): void {
  getProfileManage(id).then((res) => {
    detail.value = res.data
    hydrateInternalForm(res.data)
    clearNotesForm()
    notesLocale.value = 'zh'
    notesLoaded.value = false
    detailOpen.value = true
  })
}

function hydrateInternalForm(row: any): void {
  internalForm.isFeatured = Number(row?.isFeatured) === 1
}

function clearNotesForm(): void {
  localeTabs.forEach((item) => notesForm.fields.staff_notes[item.value] = '')
}

function loadNotes(): void {
  if (!detail.value?.profileId) {
    return
  }
  getProfileManageNotes(detail.value.profileId).then((res) => {
    clearNotesForm()
    ;(res.data || []).forEach((item: any) => {
      if (item.fieldName === 'staff_notes' && notesForm.fields.staff_notes[item.locale] !== undefined) {
        notesForm.fields.staff_notes[item.locale] = item.value || ''
      }
    })
    notesLoaded.value = true
  })
}

function submitInternal(): void {
  const profileId = detail.value?.profileId
  if (!profileId) {
    return
  }
  internalSaving.value = true
  updateProfileManageInternal(profileId, {
    isFeatured: internalForm.isFeatured
  }).then(() => {
    proxy.$modal.msgSuccess('精选状态已保存')
    openDetail(profileId)
    getList()
  }).finally(() => internalSaving.value = false)
}

function submitNotes(): void {
  const profileId = detail.value?.profileId
  if (!profileId) {
    return
  }
  updateProfileManageNotes(profileId, {
    localizedFields: buildLocalizedPayload(['staff_notes'], notesForm.fields, notesLocale.value)
  }).then(() => {
    proxy.$modal.msgSuccess('内部备注已保存')
    loadNotes()
  })
}

function buildLocalizedPayload(fieldNames: string[], fields: Record<string, any>, locale: string): any[] {
  return fieldNames.map((fieldName) => ({
    fieldName,
    locale,
    value: fields[fieldName][locale] || ''
  }))
}

function profileSummary(row: any): string {
  const parts = [
    labelOf(genders, row.gender),
    ageOf(row.birthYear),
    row.cityLabel || row.cityCode,
    row.industryLabel,
    row.careerDirectionLabel
  ].filter(Boolean).filter((item) => item !== '-')
  return parts.join(' / ') || '-'
}

function profileStatusType(status: string): any {
  if (status === 'review') {
    return 'warning'
  }
  if (status === 'open') {
    return 'success'
  }
  if (status === 'hidden') {
    return 'danger'
  }
  return 'info'
}

function notesState(row: any): string {
  return Number(row.staffNotesLocaleCount || 0) > 0 ? '已有' : '无'
}

function localizedFieldValue(fieldName: string, fallback = ''): string {
  const fields = (detail.value?.localizedFields || []).filter((item: any) => item.fieldName === fieldName)
  const preferred = fields.find((item: any) => item.locale === activeLocale.value)
    || fields.find((item: any) => item.locale === 'zh')
    || fields[0]
  return preferred?.value || fallback || '-'
}

function localizedItemValue(fieldName: string): string {
  const items = (detail.value?.localizedItems || [])
    .filter((item: any) => item.fieldName === fieldName)
    .filter((item: any) => item.locale === activeLocale.value)
  const fallbackItems = items.length > 0 ? items : (detail.value?.localizedItems || [])
    .filter((item: any) => item.fieldName === fieldName)
    .filter((item: any) => item.locale === 'zh')
  const values = (fallbackItems.length > 0 ? fallbackItems : (detail.value?.localizedItems || [])
    .filter((item: any) => item.fieldName === fieldName))
    .sort((a: any, b: any) => Number(a.itemOrder || 0) - Number(b.itemOrder || 0))
    .map((item: any) => item.value)
  return values.length > 0 ? values.join(' / ') : '-'
}

function internalFieldValue(fieldName: string): string {
  const fields = (detail.value?.internalFields || []).filter((item: any) => item.fieldName === fieldName)
  const preferred = fields.find((item: any) => item.locale === activeLocale.value)
    || fields.find((item: any) => item.locale === 'zh')
    || fields[0]
  return preferred?.value || '-'
}

function preferredAgeRange(row: any): string {
  if (!row?.preferredAgeMin && !row?.preferredAgeMax) {
    return '-'
  }
  return `${row.preferredAgeMin || '-'} - ${row.preferredAgeMax || '-'}`
}

getList()
</script>

<style scoped>
.manage-query-form {
  padding-left: 8px;
}

.manage-query-form :deep(.el-form-item) {
  margin-right: 14px;
  margin-bottom: 14px;
}

.manage-query-id :deep(.el-input) {
  width: 128px;
}

.manage-query-name :deep(.el-input) {
  width: 150px;
}

.manage-query-select :deep(.el-select) {
  width: 132px;
}

.manage-query-sort :deep(.el-select) {
  width: 150px;
}

.manage-query-date :deep(.el-date-editor) {
  width: 220px;
}

.manage-query-actions :deep(.el-form-item__content) {
  gap: 10px;
}

.profile-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.muted {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.notes-actions {
  margin-bottom: 12px;
}

.notes-form {
  margin-top: 8px;
}

.approved-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.approved-photo {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>
