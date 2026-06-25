<template>
  <div class="app-container">
    <el-form ref="queryRef" class="photo-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item class="photo-query-id" label="照片ID" prop="photoId">
        <el-input v-model="queryParams.photoId" placeholder="照片ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="photo-query-id" label="资料ID" prop="profileId">
        <el-input v-model="queryParams.profileId" placeholder="资料ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="photo-query-name" label="资料名称" prop="profileKeyword">
        <el-input v-model="queryParams.profileKeyword" placeholder="资料名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="photo-query-id" label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="photo-query-name" label="用户名称" prop="userKeyword">
        <el-input v-model="queryParams.userKeyword" placeholder="用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="photo-query-date" label="更新时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item class="photo-query-select" label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="照片状态" clearable>
          <el-option v-for="item in photoStatuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="photo-query-select photo-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in adminReviewSortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="photo-query-actions">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows" row-key="photoId">
      <el-table-column label="图片" width="126">
        <template #default="{ row }">
          <div class="photo-cell-wrap">
            <el-image class="photo-cell" :src="row.url" :preview-src-list="[row.url]" fit="cover" preview-teleported @mouseenter="hoverPhotoUrl = row.url" @mouseleave="hoverPhotoUrl = ''" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="资料" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="profile-title">{{ profileTitle(row) }}</div>
          <div class="muted">{{ profileSummary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.ownerAccountName || row.ownerUserId || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="photoStatusType(row.status)">{{ labelOf(photoStatuses, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="主图" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.isPrimary" type="success" effect="plain">主图</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ parseTime(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.photoId)" v-hasPermi="['cupid:photo:query']">详情</el-button>
          <el-button link type="primary" icon="CircleCheck" :disabled="!canReviewPhoto(row)" @click="openReview(row)" v-hasPermi="['cupid:photo:review']">
            {{ canReviewPhoto(row) ? '审核' : '已处理' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="照片详情" size="600px">
      <el-image v-if="detail?.url" class="photo-preview" :src="detail.url" :preview-src-list="[detail.url]" fit="contain" preview-teleported />
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="照片ID">{{ detail.photoId }}</el-descriptions-item>
        <el-descriptions-item label="资料ID">{{ detail.profileId }}</el-descriptions-item>
        <el-descriptions-item label="资料">{{ profileTitle(detail) }}</el-descriptions-item>
        <el-descriptions-item label="基本信息">{{ profileSummary(detail) }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.ownerAccountName || detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="photoStatusType(detail.status)">{{ labelOf(photoStatuses, detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="主图">
          <el-tag v-if="detail.isPrimary" type="success" effect="plain">主图</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="简介">{{ detail.summary || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detail" class="detail-review">
        <div class="profile-title">审核操作</div>
        <div v-if="canReviewPhoto(detail)" class="review-actions">
          <el-button type="success" icon="CircleCheck" @click="openReview(detail, 'approved')" v-hasPermi="['cupid:photo:review']">通过</el-button>
          <el-button type="danger" icon="CircleClose" @click="openReview(detail, 'rejected')" v-hasPermi="['cupid:photo:review']">拒绝</el-button>
        </div>
        <div v-else class="muted">该照片已处理，后续审核记录将在业务审计中查看。</div>
      </div>
    </el-drawer>

    <el-dialog v-model="reviewOpen" title="照片审核" width="460px" append-to-body>
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="结论">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reviewForm.status === 'rejected'" label="拒绝原因">
          <el-select v-model="rejectReason" placeholder="选择快捷原因" clearable style="width: 100%" @change="applyRejectReason">
            <el-option v-for="item in rejectReasons" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="reviewForm.reason" type="textarea" maxlength="500" show-word-limit :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewOpen = false">取消</el-button>
        <el-button type="primary" :disabled="!canReviewPhoto(reviewTarget)" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>

    <div v-if="hoverPhotoUrl" class="hover-preview">
      <img :src="hoverPhotoUrl" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseTime } from '@/utils/ruoyi'
import { getPhoto, listPhotos, reviewPhoto } from '@/api/cupid/review'
import {
  adminReviewSortOptions,
  canReviewPhoto,
  labelOf,
  photoStatuses,
  profileSummary,
  profileTitle
} from '../review-utils'

const proxy = getCurrentInstance()!.proxy as any
const route = useRoute()
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
const rejectReason = ref('')
const hoverPhotoUrl = ref('')
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  photoId: '',
  profileId: '',
  profileKeyword: '',
  userId: '',
  userKeyword: '',
  status: '',
  sortBy: 'reviewFirst'
})
const rejectReasons = ['图片模糊', '违规内容', '非本人', '重复上传', '其他']

if (route.query.profileId) {
  queryParams.profileId = String(route.query.profileId)
}
function photoStatusType(status: string): any {
  return status === 'approved' ? 'success' : status === 'review' ? 'warning' : status === 'rejected' ? 'danger' : 'info'
}

function getList(): void {
  loading.value = true
  listPhotos(buildQuery()).then((res) => {
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
  getPhoto(id).then((res) => {
    detail.value = res.data
    detailOpen.value = true
  })
}

function openReview(row: any, status: 'approved' | 'rejected' = 'approved'): void {
  if (!canReviewPhoto(row)) {
    proxy.$modal.msgWarning('该照片已处理，无需重复审核')
    return
  }
  reviewTarget.value = row
  reviewForm.status = status
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
  const reviewedId = reviewTarget.value?.photoId
  reviewPhoto(reviewTarget.value.photoId, reviewForm).then(() => {
    proxy.$modal.msgSuccess('审核完成')
    reviewOpen.value = false
    getList()
    if (detailOpen.value && detail.value?.photoId === reviewedId) {
      openDetail(reviewedId)
    }
  })
}

getList()
</script>

<style scoped>
.photo-query-form {
  display: flex;
  gap: 14px;
  flex-wrap: nowrap;
  align-items: start;
  padding: 2px 0 6px 12px;
  border-left: 3px;
  overflow-x: auto;
}
.photo-query-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 10px;
}
.photo-query-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
.photo-query-form :deep(.el-form-item__content) {
  min-width: 0;
}
.photo-query-form :deep(.el-input),
.photo-query-form :deep(.el-select),
.photo-query-form :deep(.el-date-editor) {
  width: 100% !important;
}
.photo-query-id {
  width: 176px;
  flex: 0 0 176px;
}
.photo-query-name {
  width: 190px;
  flex: 0 0 190px;
}
.photo-query-date {
  width: 264px;
  flex: 0 0 264px;
}
.photo-query-select {
  width: 170px;
  flex: 0 0 170px;
}
.photo-query-sort {
  width: 190px;
  flex-basis: 190px;
}
.photo-query-actions {
  flex: 0 0 auto;
}
.photo-query-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}
@media (max-width: 768px) {
  .photo-query-form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    overflow-x: visible;
  }
  .photo-query-id,
  .photo-query-name,
  .photo-query-date,
  .photo-query-select {
    width: auto;
    flex-basis: auto;
  }
  .photo-query-actions {
    margin-left: 0;
  }
  .photo-query-actions :deep(.el-form-item__content) {
    flex-wrap: wrap;
  }
}
.photo-cell {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  transform-origin: center;
}
.photo-cell:hover {
  box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
  transform: scale(1.04);
}
.photo-cell-wrap {
  display: grid;
  gap: 4px;
  width: 80px;
  overflow: visible;
}
.photo-preview {
  width: 100%;
  height: 320px;
  margin-bottom: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
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
.detail-review {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-extra-light);
}
.review-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.hover-preview {
  position: fixed;
  z-index: 3000;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(520px, 72vw);
  height: min(520px, 72vh);
  padding: 12px;
  pointer-events: none;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-dark);
  transform: translate(-50%, -50%);
}
.hover-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}
</style>
