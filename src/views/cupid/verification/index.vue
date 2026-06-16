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
      <el-form-item class="review-query-select" label="审核状态" prop="reviewStatus">
        <el-select v-model="queryParams.reviewStatus" placeholder="审核状态" clearable>
          <el-option v-for="item in reviewStatuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-select" label="身份状态" prop="identityStatus">
        <el-select v-model="queryParams.identityStatus" placeholder="身份状态" clearable>
          <el-option v-for="item in materialStatuses" :key="item.value" :label="item.label" :value="item.value" />
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

    <el-table v-loading="loading" :data="rows" row-key="profileId">
      <el-table-column label="资料" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="profile-title">{{ profileTitle(row) }}</div>
          <div class="muted">{{ profileSummary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ row.ownerAccountName || row.ownerUserId || '-' }}</template>
      </el-table-column>
      <el-table-column label="姓名" prop="legalName" min-width="140" show-overflow-tooltip />
      <el-table-column label="审核状态" width="110">
        <template #default="{ row }">
          <el-tag :type="reviewStatusType(row.reviewStatus)">{{ labelOf(reviewStatuses, row.reviewStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="身份" width="100">
        <template #default="{ row }"><el-tag :type="materialStatusType(row.identityStatus)">{{ labelOf(materialStatuses, row.identityStatus) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="学历" width="100">
        <template #default="{ row }"><el-tag :type="materialStatusType(row.educationStatus)">{{ labelOf(materialStatuses, row.educationStatus) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="收入" width="100">
        <template #default="{ row }"><el-tag :type="materialStatusType(row.incomeStatus)">{{ labelOf(materialStatuses, row.incomeStatus) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="婚姻" width="100">
        <template #default="{ row }"><el-tag :type="materialStatusType(row.maritalVerificationStatus)">{{ labelOf(materialStatuses, row.maritalVerificationStatus) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ parseTime(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.profileId)" v-hasPermi="['cupid:verification:query']">详情</el-button>
          <el-button link type="primary" icon="CircleCheck" :disabled="!canReviewVerification(row)" @click="openReview(row)" v-hasPermi="['cupid:verification:review']">
            {{ canReviewVerification(row) ? '审核' : '已处理' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="认证详情" size="560px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="资料ID">{{ detail.profileId }}</el-descriptions-item>
        <el-descriptions-item label="资料">{{ profileTitle(detail) }}</el-descriptions-item>
        <el-descriptions-item label="基本信息">{{ profileSummary(detail) }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.ownerAccountName || detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="法定姓名">{{ detail.legalName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ parseTime(detail.dateOfBirth, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ labelOf(reviewStatuses, detail.reviewStatus) }}</el-descriptions-item>
        <el-descriptions-item label="身份状态">{{ labelOf(materialStatuses, detail.identityStatus) }}</el-descriptions-item>
        <el-descriptions-item label="学历状态">{{ labelOf(materialStatuses, detail.educationStatus) }}</el-descriptions-item>
        <el-descriptions-item label="收入状态">{{ labelOf(materialStatuses, detail.incomeStatus) }}</el-descriptions-item>
        <el-descriptions-item label="婚姻状态">{{ labelOf(materialStatuses, detail.maritalVerificationStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ detail.verifiedByUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ parseTime(detail.verifiedAt) || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-alert class="mt12" type="warning" show-icon :closable="false" title="当前数据库只保存认证状态和基础身份信息，没有独立的材料附件或分项审核记录；因此本页暂时只能做整体验证结论。" />
    </el-drawer>

    <el-dialog v-model="reviewOpen" title="认证审核" width="460px" append-to-body>
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="结论">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="reviewForm.reason" type="textarea" maxlength="500" show-word-limit :rows="4" placeholder="请输入审核原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewOpen = false">取消</el-button>
        <el-button type="primary" :disabled="!canReviewVerification(reviewTarget)" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getVerification, listVerifications, reviewVerification } from '@/api/cupid/review'
import {
  adminReviewSortOptions,
  canReviewVerification,
  labelOf,
  materialStatuses,
  profileSummary,
  profileTitle,
  reviewStatuses
} from '../review-utils'

const { proxy } = getCurrentInstance()
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])
const detailOpen = ref(false)
const detail = ref<any>(null)
const reviewOpen = ref(false)
const reviewTarget = ref<any>(null)
const reviewForm = reactive({ status: 'approved' as 'approved' | 'rejected', reason: '' })
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  profileId: '',
  profileKeyword: '',
  userId: '',
  userKeyword: '',
  reviewStatus: '',
  identityStatus: '',
  sortBy: 'reviewFirst'
})
function reviewStatusType(status: string): any {
  return status === 'approved' ? 'success' : status === 'pending' ? 'warning' : status === 'rejected' ? 'danger' : 'info'
}

function materialStatusType(status: string): any {
  return status === 'verified' ? 'success' : status === 'pending' ? 'warning' : status === 'rejected' ? 'danger' : 'info'
}

function getList(): void {
  loading.value = true
  listVerifications(buildQuery()).then((res) => {
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

function openDetail(profileId: string): void {
  getVerification(profileId).then((res) => {
    detail.value = res.data
    detailOpen.value = true
  })
}

function openReview(row: any): void {
  if (!canReviewVerification(row)) {
    proxy.$modal.msgWarning('该认证已处理，无需重复审核')
    return
  }
  reviewTarget.value = row
  reviewForm.status = 'approved'
  reviewForm.reason = ''
  reviewOpen.value = true
}

function submitReview(): void {
  reviewVerification(reviewTarget.value.profileId, reviewForm).then(() => {
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
  width: 186px;
  flex: 0 0 186px;
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
.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
.mt12 {
  margin-top: 12px;
}
</style>
