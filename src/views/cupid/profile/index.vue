<template>
  <div class="app-container">
    <el-form ref="queryRef" class="review-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item class="review-query-id" label="资料ID" prop="profileId">
        <el-input v-model="queryParams.profileId" placeholder="资料ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-name" label="资料名称" prop="profileKeyword">
        <el-input v-model="queryParams.profileKeyword" placeholder="资料名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-id" label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-name" label="用户名称" prop="userKeyword">
        <el-input v-model="queryParams.userKeyword" placeholder="用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-select" label="类型" prop="profileType">
        <el-select v-model="queryParams.profileType" placeholder="资料类型" clearable>
          <el-option v-for="item in profileTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-select" label="状态" prop="profileStatus">
        <el-select v-model="queryParams.profileStatus" placeholder="资料状态" clearable>
          <el-option v-for="item in profileStatuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-select review-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in adminReviewSortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-date" label="更新时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item class="review-query-actions">
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
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ ownerDisplayName(row) }}</template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">{{ labelOf(profileTypes, row.profileType) }}</template>
      </el-table-column>
      <el-table-column label="基本信息" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <div>{{ profileSummaryPrimary(row) }}</div>
          <div class="muted">{{ profileSummarySecondary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">{{ row.summary || row.tags || '-' }}</template>
      </el-table-column>
      <el-table-column label="资料状态" width="110">
        <template #default="{ row }">
          <el-tag :type="profileStatusType(row.profileStatus)">{{ labelOf(profileStatuses, row.profileStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="照片" width="110">
        <template #default="{ row }">{{ photoReviewSummary(row) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ parseTime(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <div class="profile-actions">
            <el-button link type="primary" icon="View" @click="openDetail(row.profileId)" v-hasPermi="['cupid:profile:query']">详情</el-button>
            <el-button v-if="canReviewProfile(row)" link type="primary" icon="CircleCheck" @click="openReview(row)" v-hasPermi="['cupid:profile:review']">
              审核
            </el-button>
            <span v-else-if="row.profileStatus === 'draft'" class="muted-action">-</span>
            <span v-else class="muted-action">已处理</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="资料详情" size="760px">
      <el-tabs v-model="activeLocale" class="profile-locale-tabs">
        <el-tab-pane v-for="item in localeTabs" :key="item.value" :label="item.label" :name="item.value" />
      </el-tabs>

      <el-divider content-position="left">审核概览</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="资料ID" :span="2">{{ detail.profileId }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.ownerAccountName || detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="资料类型">{{ labelOf(profileTypes, detail.profileType, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="资料状态">
          <el-tag :type="profileStatusType(detail.profileStatus)">{{ labelOf(profileStatuses, detail.profileStatus, activeLocale) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detail.createdAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detail.updatedAt) || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">归属与联系</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="用户ID">{{ detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="归属关系">{{ labelOf(ownershipRelationshipOptions, detail.relationshipToProfile, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="归属权限">{{ labelOf(ownershipPermissionOptions, detail.ownershipPermission, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="归属状态">{{ labelOf(ownershipStatusOptions, detail.ownershipStatus, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="家庭可见">{{ yesNo(detail.familyVisible, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="最后活跃">{{ parseTime(detail.lastActiveAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ detail.contact?.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detail.contact?.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信">{{ detail.contact?.wechat || '-' }}</el-descriptions-item>
        <el-descriptions-item label="首选联系">{{ labelOf(contactChannelOptions, detail.contact?.preferredChannel, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="联系方式开放" :span="2">{{ labelOf(contactVisibilityOptions, detail.contact?.visibility, activeLocale) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">隐私偏好</el-divider>
      <el-descriptions v-if="detail" :column="3" border>
        <el-descriptions-item label="隐藏婚姻">{{ yesNo(detail.privacyPreferences?.hideMaritalStatus, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="隐藏子女">{{ yesNo(detail.privacyPreferences?.hideHasChildren, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="隐藏子女计划">{{ yesNo(detail.privacyPreferences?.hideChildrenPlan, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="隐藏异地">{{ yesNo(detail.privacyPreferences?.hideAcceptsLongDistance, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="隐藏吸烟">{{ yesNo(detail.privacyPreferences?.hideSmoking, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="隐藏饮酒">{{ yesNo(detail.privacyPreferences?.hideDrinking, activeLocale) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">基础资料</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="资料名称">{{ localizedFieldValue('profile_name') }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ labelOf(genders, detail.gender, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ ageOf(detail.birthYear) }}</el-descriptions-item>
        <el-descriptions-item label="身高">{{ detail.height ? `${detail.height} cm` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="国家">{{ localizedFieldValue('country', profileCodeLabel('country', detail.countryCode, activeLocale)) }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ localizedFieldValue('city', profileCodeLabel('city', detail.cityCode, activeLocale)) }}</el-descriptions-item>
        <el-descriptions-item label="国籍">{{ localizedFieldValue('nationality', profileCodeLabel('nationality', detail.nationalityCode, activeLocale)) }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ localizedFieldValue('education', profileCodeLabel('education', detail.educationCode, activeLocale)) }} / {{ labelOf(degreeLevels, detail.degreeLevel, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ localizedFieldValue('industry', profileCodeLabel('industry', detail.industryCode, activeLocale)) }}</el-descriptions-item>
        <el-descriptions-item label="职业方向">{{ localizedFieldValue('career_direction') }}</el-descriptions-item>
        <el-descriptions-item label="语言" :span="2">{{ labelsOf(languageOptions, detail.languages, activeLocale) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">婚恋与偏好</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="婚姻">{{ labelOf(maritalStatuses, detail.maritalStatus, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="子女">{{ yesNo(detail.hasChildren, activeLocale) }} / {{ labelOf(childrenPlans, detail.childrenPlan, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="交友意向">{{ labelOf(datingIntentions, detail.datingIntentionCode, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="异地">{{ yesNo(detail.acceptsLongDistance, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="关系目标">{{ localizedFieldValue('relationship_goal') }}</el-descriptions-item>
        <el-descriptions-item label="迁居">{{ labelOf(relocationOptions, detail.relocation, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="关系价值观" :span="2">{{ labelsOf(relationshipValueOptions, detail.relationshipValues, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="期望年龄">{{ preferredAgeRange(detail) }}</el-descriptions-item>
        <el-descriptions-item label="期望地区">{{ labelOf(preferredLocationOptions, detail.preferredLocation, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="期望学历">{{ localizedFieldValue('preferred_education') }}</el-descriptions-item>
        <el-descriptions-item label="居住计划">{{ localizedFieldValue('residence_plan') }}</el-descriptions-item>
        <el-descriptions-item label="不可接受项" :span="2">{{ localizedItemValue('deal_breakers') }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">生活方式</el-divider>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="吸烟">{{ labelOf(smokingOptions, detail.smoking, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="饮酒">{{ labelOf(drinkingOptions, detail.drinking, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="运动">{{ localizedFieldValue('exercise') }}</el-descriptions-item>
        <el-descriptions-item label="活跃度">{{ labelOf(activityLevels, detail.activityLevel, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="周末方式">{{ labelOf(weekendStyles, detail.weekendStyle, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="宠物">{{ labelOf(petOptions, detail.pets, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="沟通方式">{{ labelOf(communicationStyles, detail.communicationStyle, activeLocale) }}</el-descriptions-item>
        <el-descriptions-item label="家庭生活">{{ localizedFieldValue('family_life') }}</el-descriptions-item>
        <el-descriptions-item label="性格特质" :span="2">{{ localizedItemValue('personality_traits') }}</el-descriptions-item>
        <el-descriptions-item label="兴趣" :span="2">{{ localizedItemValue('interests') }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ localizedFieldValue('summary') }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">{{ localizedItemValue('tags') }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">照片审核</el-divider>
      <el-descriptions v-if="detail" :column="4" border>
        <el-descriptions-item label="全部">{{ photoStats.total }}</el-descriptions-item>
        <el-descriptions-item label="待审核">{{ photoStats.review }}</el-descriptions-item>
        <el-descriptions-item label="已通过">{{ photoStats.approved }}</el-descriptions-item>
        <el-descriptions-item label="已拒绝/隐藏">{{ photoStats.rejected + photoStats.hidden }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt12">
        <el-button type="primary" plain icon="Picture" @click="goPhotoReview">去照片审核</el-button>
      </div>
    </el-drawer>

    <el-dialog v-model="reviewOpen" title="资料审核" width="460px" append-to-body>
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="结论">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="approved">通过并开放</el-radio>
            <el-radio value="rejected">拒绝并隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reviewForm.status === 'rejected'" label="拒绝原因">
          <el-select v-model="rejectReason" placeholder="选择快捷原因" clearable style="width: 100%" @change="applyRejectReason">
            <el-option v-for="item in profileRejectReasons" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="reviewForm.reason" type="textarea" maxlength="500" show-word-limit :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewOpen = false">取消</el-button>
          <el-button type="primary" :disabled="!canReviewProfile(reviewTarget)" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getProfile, listProfiles, reviewProfile } from '@/api/cupid/review'
import {
  adminReviewSortOptions,
  activityLevels,
  ageOf,
  canReviewProfile,
  childrenPlans,
  communicationStyles,
  contactChannelOptions,
  contactVisibilityOptions,
  datingIntentions,
  degreeLevels,
  drinkingOptions,
  genders,
  labelOf,
  labelsOf,
  languageOptions,
  maritalStatuses,
  ownershipPermissionOptions,
  ownershipRelationshipOptions,
  ownershipStatusOptions,
  petOptions,
  preferredLocationOptions,
  profileCodeLabel,
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
const router = useRouter()
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])
const detailOpen = ref(false)
const detail = ref<any>(null)
const activeLocale = ref('zh')
const reviewOpen = ref(false)
const reviewTarget = ref<any>(null)
const reviewForm = reactive({ status: 'approved' as 'approved' | 'rejected', reason: '' })
const rejectReason = ref('')
const profileRejectReasons = [
  '资料信息不完整，请补充关键字段',
  '资料内容与认证信息不一致',
  '简介或标签包含不适合公开展示的内容',
  '照片或资料质量不足，暂不适合开放',
  '疑似虚假资料或信息无法确认',
  '其他'
]
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  profileId: '',
  profileKeyword: '',
  userId: '',
  userKeyword: '',
  profileType: '',
  profileStatus: 'review',
  sortBy: 'reviewFirst'
})

function profileStatusType(status: string): any {
  return status === 'open' ? 'success' : status === 'review' ? 'warning' : status === 'hidden' ? 'danger' : 'info'
}

function ownerDisplayName(row: any): string {
  return row.ownerAccountName || row.ownerUserId || '未关联用户'
}

function profileSummaryPrimary(row: any): string {
  const parts = [
    labelOf(genders, row.gender),
    ageOf(row.birthYear),
    row.cityLabel || row.cityCode
  ].filter(Boolean).filter((item) => item !== '-')
  return parts.join(' / ') || '-'
}

function profileSummarySecondary(row: any): string {
  const parts = [row.industryLabel, row.careerDirectionLabel].filter(Boolean).filter((item) => item !== '-')
  return parts.join(' / ') || '-'
}

function photoReviewSummary(row: any): string {
  const total = Number(row.photoCount || 0)
  const review = Number(row.photoReviewCount || 0)
  return `${review}/${total}`
}

function getList(): void {
  loading.value = true
  listProfiles(buildQuery()).then((res) => {
    rows.value = res.rows || []
    total.value = res.total || 0
  }).finally(() => loading.value = false)
}

function buildQuery(): Record<string, any> {
  return {
    ...queryParams,
    beginTime: dateRange.value?.[0],
    endTime: dateRange.value?.[1]
  }
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
  getProfile(id).then((res) => {
    detail.value = res.data
    activeLocale.value = defaultLocale()
    detailOpen.value = true
  })
}

const localeTabs = computed(() => {
  const locales = new Set<string>()
  ;(detail.value?.localizedFields || []).forEach((item: any) => locales.add(item.locale))
  ;(detail.value?.localizedItems || []).forEach((item: any) => locales.add(item.locale))
  const preferred = ['zh', 'fr', 'en']
  return Array.from(locales).sort((a, b) => {
    const ai = preferred.indexOf(a)
    const bi = preferred.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b)
  }).map((locale) => ({
    value: locale,
    label: locale === 'zh' ? '中文' : locale === 'fr' ? 'Français' : locale === 'en' ? 'English' : locale
  }))
})

const photoStats = computed(() => {
  const stats = { total: 0, review: 0, approved: 0, rejected: 0, hidden: 0 }
  ;(detail.value?.photos || []).forEach((photo: any) => {
    stats.total += 1
    if (Object.prototype.hasOwnProperty.call(stats, photo.status)) {
      stats[photo.status as keyof typeof stats] += 1
    }
  })
  return stats
})

function defaultLocale(): string {
  const locales = new Set<string>()
  ;(detail.value?.localizedFields || []).forEach((item: any) => locales.add(item.locale))
  ;(detail.value?.localizedItems || []).forEach((item: any) => locales.add(item.locale))
  return locales.has('zh') ? 'zh' : Array.from(locales)[0] || 'zh'
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

function preferredAgeRange(row: any): string {
  if (!row?.preferredAgeMin && !row?.preferredAgeMax) {
    return '-'
  }
  return `${row.preferredAgeMin || '-'} - ${row.preferredAgeMax || '-'}`
}

function goPhotoReview(): void {
  if (!detail.value?.profileId) {
    return
  }
  router.push({ path: '/cupid/photo', query: { profileId: detail.value.profileId } })
}

function openReview(row: any): void {
  if (!canReviewProfile(row)) {
    proxy.$modal.msgWarning('该资料已处理，无需重复审核')
    return
  }
  reviewTarget.value = row
  reviewForm.status = 'approved'
  reviewForm.reason = ''
  rejectReason.value = ''
  reviewOpen.value = true
}

function applyRejectReason(value: string): void {
  if (value && !reviewForm.reason) {
    reviewForm.reason = value
  }
}

function submitReview(): void {
  reviewProfile(reviewTarget.value.profileId, reviewForm).then(() => {
    proxy.$modal.msgSuccess('审核完成')
    reviewOpen.value = false
    getList()
  })
}

getList()
</script>

<style scoped>
.review-query-form {
  display: flex;
  gap: 14px;
  flex-wrap: nowrap;
  align-items: start;
  padding: 2px 0 6px 12px;
  border-left: 3px;
  overflow-x: auto;
}
.review-query-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 10px;
}
.review-query-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
.review-query-form :deep(.el-form-item__content) {
  min-width: 0;
}
.review-query-form :deep(.el-input),
.review-query-form :deep(.el-select),
.review-query-form :deep(.el-date-editor) {
  width: 100% !important;
}
.review-query-id {
  width: 176px;
  flex: 0 0 176px;
}
.review-query-name {
  width: 190px;
  flex: 0 0 190px;
}
.review-query-date {
  width: 264px;
  flex: 0 0 264px;
}
.review-query-select {
  width: 170px;
  flex: 0 0 170px;
}
.review-query-sort {
  width: 190px;
  flex-basis: 190px;
}
.review-query-actions {
  flex: 0 0 auto;
}
.review-query-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}
@media (max-width: 768px) {
  .review-query-form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    overflow-x: visible;
  }
  .review-query-id,
  .review-query-name,
  .review-query-date {
    width: auto;
    flex-basis: auto;
  }
  .review-query-select {
    width: auto;
    flex-basis: auto;
  }
  .review-query-actions :deep(.el-form-item__content) {
    flex-wrap: wrap;
  }
}
.profile-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.profile-locale-tabs {
  margin-bottom: 8px;
}
.profile-locale-tabs :deep(.el-tabs__header) {
  margin-bottom: 6px;
}
.profile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}
.profile-actions :deep(.el-button) {
  margin-left: 0;
  padding: 0;
}
.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
.muted-action {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.mt12 {
  margin-top: 12px;
}
</style>
