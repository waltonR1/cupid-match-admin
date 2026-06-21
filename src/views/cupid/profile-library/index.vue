<template>
  <div class="app-container">
    <el-form ref="queryRef" class="library-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item class="library-query-id" label="资料ID" prop="profileId">
        <el-input v-model="queryParams.profileId" placeholder="资料ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="library-query-name" label="资料名称" prop="profileKeyword">
        <el-input v-model="queryParams.profileKeyword" placeholder="资料名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="library-query-id" label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="library-query-name" label="用户名称" prop="userKeyword">
        <el-input v-model="queryParams.userKeyword" placeholder="用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="library-query-select" label="类型" prop="profileType">
        <el-select v-model="queryParams.profileType" placeholder="资料类型" clearable>
          <el-option v-for="item in profileTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="library-query-select" label="状态" prop="profileStatus">
        <el-select v-model="queryParams.profileStatus" placeholder="资料状态" clearable>
          <el-option v-for="item in profileStatuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="library-query-select library-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in librarySortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="library-query-date" label="更新时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item class="library-query-actions">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="资料" min-width="280" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="profile-title">{{ profileTitle(row) }}</div>
          <div class="muted">{{ profileSummary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.ownerAccountName || row.ownerUserId || '-' }}</template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">{{ labelOf(profileTypes, row.profileType) }}</template>
      </el-table-column>
      <el-table-column label="资料状态" width="110">
        <template #default="{ row }">
          <el-tag :type="profileStatusType(row.profileStatus)">{{ labelOf(profileStatuses, row.profileStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">{{ row.summary || row.tags || '-' }}</template>
      </el-table-column>
      <el-table-column label="照片" width="90">
        <template #default="{ row }">{{ Number(row.photoCount || 0) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ parseTime(row.updatedAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.profileId)" v-hasPermi="['cupid:profileLibrary:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="资料详情" size="820px">
      <el-tabs v-model="activeLocale" class="profile-locale-tabs">
        <el-tab-pane v-for="item in localeTabs" :key="item.value" :label="item.label" :name="item.value" />
      </el-tabs>

      <el-divider content-position="left">资料概览</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="资料ID" :span="2">{{ detail.profileId }}</el-descriptions-item>
        <el-descriptions-item label="资料名称">{{ localizedFieldValue('profile_name') }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.ownerAccountName || detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="资料类型">{{ labelOf(profileTypes, detail.profileType) }}</el-descriptions-item>
        <el-descriptions-item label="资料状态">
          <el-tag :type="profileStatusType(detail.profileStatus)">{{ labelOf(profileStatuses, detail.profileStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detail.createdAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detail.updatedAt) || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">基础资料</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="性别">{{ labelOf(genders, detail.gender) }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ ageOf(detail.birthYear) }}</el-descriptions-item>
        <el-descriptions-item label="身高">{{ detail.height ? `${detail.height} cm` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="国家">{{ localizedFieldValue('country', detail.countryCode) }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ localizedFieldValue('city', detail.cityCode) }}</el-descriptions-item>
        <el-descriptions-item label="国籍">{{ localizedFieldValue('nationality', detail.nationalityCode) }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ localizedFieldValue('education', detail.educationCode) }} / {{ labelOf(degreeLevels, detail.degreeLevel) }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ localizedFieldValue('industry', detail.industryCode) }}</el-descriptions-item>
        <el-descriptions-item label="职业方向">{{ localizedFieldValue('career_direction') }}</el-descriptions-item>
        <el-descriptions-item label="语言" :span="2">{{ labelsOf(languageOptions, detail.languages) }}</el-descriptions-item>
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

      <el-divider content-position="left">内部资料</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="精选状态">
          <el-tag v-if="Number(detail.internalRecord?.isFeatured || 0) === 1" type="success" effect="plain">精选</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="运营更新">{{ parseTime(detail.internalRecord?.updatedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ detail.internalRecord?.internalUpdatedByUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="记录来源">{{ detail.internalRecord?.source || '-' }}</el-descriptions-item>
        <el-descriptions-item label="雇主信息">{{ internalFieldValue('employer') }}</el-descriptions-item>
        <el-descriptions-item label="收入范围">{{ internalFieldValue('income_range') }}</el-descriptions-item>
        <el-descriptions-item label="内部备注" :span="2">{{ internalFieldValue('staff_notes') }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { getProfileLibrary, listProfileLibrary } from '@/api/cupid/profile-library'
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
  profileSummary,
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
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  profileId: '',
  profileKeyword: '',
  userId: '',
  userKeyword: '',
  profileType: '',
  profileStatus: '',
  sortBy: 'updatedDesc'
})
const localeTabs = [
  { label: '中文', value: 'zh' },
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' }
]
const librarySortOptions = [
  { label: '更新时间最新', value: 'updatedDesc' },
  { label: '资料名称', value: 'profileNameAsc' },
  { label: '用户名称', value: 'userNameAsc' }
]

const approvedPhotos = computed(() => detail.value?.photos || [])

const approvedPhotoUrls = computed(() => approvedPhotos.value.map((photo: any) => photo.url).filter(Boolean))

function getList(): void {
  loading.value = true
  listProfileLibrary(buildQuery()).then((res) => {
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
  getProfileLibrary(id).then((res) => {
    detail.value = res.data
    activeLocale.value = 'zh'
    detailOpen.value = true
  })
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
.library-query-form {
  padding-left: 8px;
}

.library-query-form :deep(.el-form-item) {
  margin-right: 14px;
  margin-bottom: 14px;
}

.library-query-id :deep(.el-input) {
  width: 128px;
}

.library-query-name :deep(.el-input) {
  width: 150px;
}

.library-query-select :deep(.el-select) {
  width: 132px;
}

.library-query-sort :deep(.el-select) {
  width: 150px;
}

.library-query-date :deep(.el-date-editor) {
  width: 220px;
}

.library-query-actions :deep(.el-form-item__content) {
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
