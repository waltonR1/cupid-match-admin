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
      <el-form-item class="review-query-select" label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="材料状态" clearable>
          <el-option v-for="item in verificationMaterialStatuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-sort" label="排序" prop="sortBy">
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
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openCreateMaterial" v-hasPermi="['cupid:verification:material:create']">补录材料</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="RefreshLeft" @click="openResetVerification" v-hasPermi="['cupid:verification:reset']">重置认证</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows" row-key="materialId">
      <el-table-column label="资料" min-width="230" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="profile-title">{{ profileTitle(row) }}</div>
          <div class="muted">{{ profileSummary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.ownerAccountName || row.ownerUserId || '-' }}</template>
      </el-table-column>
      <el-table-column label="材料" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          <div>{{ materialSummary(row) }}</div>
          <div v-if="row.reviewNote" class="muted">{{ row.reviewNote }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="verificationStatusType(row.status)">{{ labelOf(verificationMaterialStatuses, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="170">
        <template #default="{ row }">{{ parseTime(row.submittedAt) }}</template>
      </el-table-column>
      <el-table-column label="审核时间" width="170">
        <template #default="{ row }">{{ parseTime(row.reviewedAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.materialId)" v-hasPermi="['cupid:verification:query']">详情</el-button>
          <el-button link type="primary" icon="CircleCheck" :disabled="!canReviewVerification(row)" @click="openReview(row)" v-hasPermi="['cupid:verification:review']">
            {{ canReviewVerification(row) ? '审核' : '已处理' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" :title="`${materialLabel}详情`" size="620px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="材料ID">{{ detail.materialId }}</el-descriptions-item>
        <el-descriptions-item label="资料ID">{{ detail.profileId }}</el-descriptions-item>
        <el-descriptions-item label="资料">{{ profileTitle(detail) }}</el-descriptions-item>
        <el-descriptions-item label="基本信息">{{ profileSummary(detail) }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.ownerAccountName || detail.ownerUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="认证类型">{{ labelOf(verificationMaterialTypes, detail.materialType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="verificationStatusType(detail.status)">{{ labelOf(verificationMaterialStatuses, detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="安全检查">
          <el-tag :type="scanStatusType(detail.scanStatus)">{{ scanStatusLabel(detail.scanStatus) }}</el-tag>
          <span v-if="detail.scanMessage" class="scan-message">{{ detail.scanMessage }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.materialType === 'identity'" label="法定姓名">{{ detail.legalName || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.materialType === 'identity'" label="出生日期">{{ parseTime(detail.dateOfBirth, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="材料名称">{{ detail.materialName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="材料凭证">
          <div class="material-line">
            <span
              :class="['material-reference', detail.materialUrl ? 'is-clickable' : '']"
              @click="previewMaterial"
            >
              {{ materialReference(detail) }}
            </span>
            <el-button link type="primary" icon="Download" @click="downloadMaterialFile" v-hasPermi="['cupid:verification:material:download']">下载</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="提交说明">{{ detail.reviewNote || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ parseTime(detail.submittedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ detail.reviewedByUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ parseTime(detail.reviewedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因">{{ detail.rejectionReason || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <el-dialog v-model="reviewOpen" :title="`${materialLabel}审核`" width="460px" append-to-body>
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="结论">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reviewForm.status === 'rejected'" label="拒绝原因">
          <el-select v-model="rejectReason" placeholder="选择快捷原因" clearable style="width: 100%" @change="applyRejectReason">
            <el-option v-for="item in verificationRejectReasons" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="reviewForm.reason" type="textarea" maxlength="500" show-word-limit :rows="4" placeholder="请输入审核原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewOpen = false">取消</el-button>
        <el-button type="primary" :disabled="!canReviewVerification(reviewTarget)" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createOpen" :title="`补录${materialLabel}材料`" width="460px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="资料ID">
          <el-input v-model="createForm.profileId" placeholder="请输入资料ID" />
        </el-form-item>
        <el-form-item label="材料名称">
          <el-input v-model="createForm.materialName" placeholder="默认使用文件名，可手动填写" />
        </el-form-item>
        <el-form-item v-if="props.materialType === 'identity'" label="法定姓名">
          <el-input v-model="createForm.legalName" placeholder="请输入法定姓名" />
        </el-form-item>
        <el-form-item v-if="props.materialType === 'identity'" label="出生日期">
          <el-date-picker v-model="createForm.dateOfBirth" value-format="YYYY-MM-DD" type="date" placeholder="请选择出生日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="补录说明">
          <el-input v-model="createForm.reviewNote" type="textarea" maxlength="500" show-word-limit :rows="3" placeholder="说明材料来源或补录原因" />
        </el-form-item>
        <el-form-item label="材料文件">
          <el-upload
            drag
            v-model:file-list="createFileList"
            :auto-upload="false"
            :limit="1"
            :on-change="handleCreateFileChange"
            :on-remove="handleCreateFileRemove"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
          >
            <div class="el-upload__text">拖拽文件到此处，或点击上传</div>
            <template #tip>
              <div class="el-upload__tip">仅支持 PDF/JPG/JPEG/PNG/WEBP，最大 10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelCreateMaterial">取消</el-button>
        <el-button type="primary" :disabled="!canSubmitCreateMaterial" @click="submitCreateMaterial">确认补录</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resetOpen" :title="`重置${materialLabel}`" width="460px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="资料ID">
          <el-input v-model="resetForm.profileId" placeholder="请输入资料ID" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="resetForm.reason" type="textarea" maxlength="500" show-word-limit :rows="4" placeholder="请输入重置原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetOpen = false">取消</el-button>
        <el-button type="warning" @click="submitResetVerification">确定重置</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="materialPreviewOpen" title="材料预览" width="760px" append-to-body @closed="clearMaterialPreview">
      <img v-if="isImagePreview" :src="materialPreviewUrl" class="material-preview-image" alt="材料预览" />
      <iframe v-else :src="materialPreviewUrl" class="material-preview-frame" title="材料预览" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { saveAs } from 'file-saver'
import type { UploadFile, UploadUserFile } from 'element-plus'
import { createAdminVerificationMaterial, downloadVerificationMaterial, getVerification, listVerifications, previewVerificationMaterial, resetVerification, reviewVerification } from '@/api/cupid/review'
import { parseTime } from '@/utils/ruoyi'
import {
  adminReviewSortOptions,
  canReviewVerification,
  labelOf,
  profileSummary,
  profileTitle,
  verificationMaterialStatuses,
  verificationMaterialTypes
} from '../../review-utils'

const props = defineProps<{
  materialType: 'identity' | 'education' | 'income' | 'marital'
}>()

const proxy = getCurrentInstance()!.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])
const detailOpen = ref(false)
const detail = ref<any>(null)
const materialPreviewOpen = ref(false)
const materialPreviewUrl = ref('')
const materialPreviewType = ref('')
const reviewOpen = ref(false)
const reviewTarget = ref<any>(null)
const reviewForm = reactive({ status: 'approved' as 'approved' | 'rejected', reason: '' })
const rejectReason = ref('')
const createOpen = ref(false)
const createForm = reactive({ profileId: '', materialName: '', legalName: '', dateOfBirth: '', reviewNote: '' })
const createFileList = ref<UploadUserFile[]>([])
const createFile = ref<File | null>(null)
const resetOpen = ref(false)
const resetForm = reactive({ profileId: '', reason: '' })
const materialLabel = computed(() => labelOf(verificationMaterialTypes, props.materialType))
const canSubmitCreateMaterial = computed(() => {
  if (!createForm.profileId.trim() || !createForm.materialName.trim() || !createForm.reviewNote.trim() || !createFile.value) {
    return false
  }
  if (props.materialType === 'identity') {
    return Boolean(createForm.legalName.trim() && createForm.dateOfBirth)
  }
  return true
})
const verificationRejectReasons = [
  '材料不清晰，无法识别关键信息',
  '材料类型不符合认证要求',
  '材料信息与资料信息不一致',
  '材料已过期或缺少有效页',
  '疑似非本人或来源无法确认',
  '其他'
]
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  profileId: '',
  profileKeyword: '',
  userId: '',
  userKeyword: '',
  status: '',
  sortBy: 'reviewFirst'
})

function verificationStatusType(status: string): any {
  return status === 'approved' ? 'success' : status === 'pending' ? 'warning' : status === 'rejected' ? 'danger' : 'info'
}

function scanStatusType(status: string): any {
  return status === 'passed' ? 'success' : status === 'failed' ? 'danger' : 'warning'
}

function scanStatusLabel(status: string): string {
  return status === 'passed' ? '已通过' : status === 'failed' ? '未通过' : '待检查'
}

function materialSummary(row: any): string {
  if (row.materialType === 'identity') {
    return [row.legalName, parseTime(row.dateOfBirth, '{y}-{m}-{d}')].filter(Boolean).join(' / ') || '-'
  }
  return row.materialName || row.materialUrl || '-'
}

function materialReference(row: any): string {
  return row?.materialName || materialFilename(row) || '-'
}

function materialFilename(row: any): string {
  return row?.materialName || String(row?.materialUrl || 'verification-material').split('/').pop() || 'verification-material'
}

const isImagePreview = computed(() => materialPreviewType.value.startsWith('image/'))

async function previewMaterial(): Promise<void> {
  if (!detail.value?.materialId || !detail.value?.materialUrl) return
  try {
    clearMaterialPreview()
    const blob = await previewVerificationMaterial(detail.value.materialId)
    materialPreviewType.value = blob.type || ''
    materialPreviewUrl.value = URL.createObjectURL(blob)
    materialPreviewOpen.value = true
  } catch {
    proxy.$modal.msgError('材料预览失败')
  }
}

function clearMaterialPreview(): void {
  if (materialPreviewUrl.value) {
    URL.revokeObjectURL(materialPreviewUrl.value)
  }
  materialPreviewUrl.value = ''
  materialPreviewType.value = ''
}

async function downloadMaterialFile(): Promise<void> {
  if (!detail.value?.materialId) return
  const blob = await downloadVerificationMaterial(detail.value.materialId)
  saveAs(blob, materialFilename(detail.value))
}

function openCreateMaterial(): void {
  createForm.profileId = queryParams.profileId || ''
  createForm.materialName = ''
  createForm.legalName = ''
  createForm.dateOfBirth = ''
  createForm.reviewNote = ''
  createFile.value = null
  createFileList.value = []
  createOpen.value = true
}

function handleCreateFileChange(uploadFile: UploadFile): void {
  createFile.value = uploadFile.raw || null
  if (!createForm.materialName.trim() && uploadFile.name) {
    createForm.materialName = uploadFile.name
  }
}

function handleCreateFileRemove(): void {
  createFile.value = null
}

function cancelCreateMaterial(): void {
  createOpen.value = false
  createFile.value = null
  createFileList.value = []
}

async function submitCreateMaterial(): Promise<void> {
  const profileId = createForm.profileId.trim()
  if (!profileId) {
    proxy.$modal.msgWarning('请先填写资料ID')
    return
  }
  if (!createForm.materialName.trim()) {
    proxy.$modal.msgWarning('请填写材料名称')
    return
  }
  if (!createForm.reviewNote.trim()) {
    proxy.$modal.msgWarning('请填写补录说明')
    return
  }
  if (props.materialType === 'identity' && (!createForm.legalName.trim() || !createForm.dateOfBirth)) {
    proxy.$modal.msgWarning('身份认证需要填写法定姓名和出生日期')
    return
  }
  if (!createFile.value) {
    proxy.$modal.msgWarning('请选择材料文件')
    return
  }
  try {
    await createAdminVerificationMaterial({
      profileId,
      materialType: props.materialType,
      materialName: createForm.materialName.trim(),
      legalName: createForm.legalName.trim(),
      dateOfBirth: createForm.dateOfBirth,
      reviewNote: createForm.reviewNote.trim()
    }, createFile.value)
    proxy.$modal.msgSuccess('材料已补录')
    cancelCreateMaterial()
    getList()
  } catch {
    proxy.$modal.msgError('材料补录失败')
  }
}

function openResetVerification(): void {
  resetForm.profileId = queryParams.profileId || ''
  resetForm.reason = ''
  resetOpen.value = true
}

function submitResetVerification(): void {
  const profileId = resetForm.profileId.trim()
  if (!profileId) {
    proxy.$modal.msgWarning('请先填写资料ID')
    return
  }
  if (!resetForm.reason.trim()) {
    proxy.$modal.msgWarning('请填写重置原因')
    return
  }
  resetVerification({
    profileId,
    materialType: props.materialType,
    reason: resetForm.reason.trim()
  }).then(() => {
    proxy.$modal.msgSuccess('认证已重置')
    resetOpen.value = false
    getList()
  })
}

function getList(): void {
  loading.value = true
  listVerifications(buildQuery()).then((res) => {
    const data = normalizeTableResponse(res)
    rows.value = data.rows
    total.value = data.total
    if (data.total > 0 && data.rows.length === 0) {
      console.warn(`[Cupid verification:${props.materialType}] total > 0 but rows is empty`, res)
    }
  }).finally(() => loading.value = false)
}

function normalizeTableResponse(res: any): { rows: any[]; total: number } {
  if (Array.isArray(res)) {
    return { rows: res, total: res.length }
  }
  const source = res?.rows ? res : res?.data?.rows ? res.data : res?.data ?? res ?? {}
  const nextRows = Array.isArray(source.rows) ? source.rows : []
  const nextTotal = Number(source.total ?? nextRows.length)
  return { rows: nextRows, total: Number.isFinite(nextTotal) ? nextTotal : nextRows.length }
}

function buildQuery(): Record<string, any> {
  return {
    ...queryParams,
    materialType: props.materialType,
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

function openDetail(materialId: string): void {
  getVerification(materialId).then((res) => {
    detail.value = res.data
    detailOpen.value = true
  })
}

function openReview(row: any): void {
  if (!canReviewVerification(row)) {
    proxy.$modal.msgWarning('该认证材料已处理，无需重复审核')
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
  reviewVerification(reviewTarget.value.materialId, reviewForm).then(() => {
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
  width: 176px;
  flex: 0 0 176px;
}
.review-query-sort {
  width: 190px;
  flex: 0 0 190px;
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
  .review-query-date,
  .review-query-select,
  .review-query-sort {
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
.material-line {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.material-line :deep(.el-button) {
  flex: 0 0 auto;
  margin-left: 0;
  padding: 0;
}
.material-line :deep(.el-upload) {
  display: inline-flex;
}
.material-reference {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.material-reference.is-clickable {
  color: var(--el-color-primary);
  cursor: pointer;
}
.scan-message {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}
.material-preview-image {
  display: block;
  max-width: 100%;
  max-height: 72vh;
  margin: 0 auto;
}
.material-preview-frame {
  width: 100%;
  height: 72vh;
  border: 0;
}
</style>
