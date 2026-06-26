<template>
  <div class="app-container">
    <el-form ref="queryRef" class="review-query-form introduction-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="72px">
      <el-form-item class="review-query-id" label="申请ID" prop="requestId">
        <el-input v-model="queryParams.requestId" placeholder="申请ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-id" label="申请人ID" prop="requesterUserId">
        <el-input v-model="queryParams.requesterUserId" placeholder="申请人ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-name" label="申请人" prop="requesterKeyword">
        <el-input v-model="queryParams.requesterKeyword" placeholder="申请人名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-id" label="资料ID" prop="targetProfileId">
        <el-input v-model="queryParams.targetProfileId" placeholder="目标资料ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-name" label="资料名称" prop="targetKeyword">
        <el-input v-model="queryParams.targetKeyword" placeholder="目标资料名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-select" label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="介绍状态" clearable>
          <el-option v-for="item in optionsOf(introductionStatuses)" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-select review-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in introductionSortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-date" label="申请时间">
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
      <el-table-column label="申请人" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="row-title">{{ row.requesterAccountName || row.requesterUserId || '-' }}</div>
          <div class="muted">{{ row.requesterUserId || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="目标资料" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="row-title">{{ targetTitle(row) }}</div>
          <div class="muted">{{ targetSummary(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" :effect="row.status === 'requested' ? 'plain' : 'light'">{{ labelOf(introductionStatuses, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请留言" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ row.message || '-' }}</template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ parseTime(row.requestedAt) }}</template>
      </el-table-column>
      <el-table-column label="处理/冷静期" width="190">
        <template #default="{ row }">
          <div>{{ row.respondedAt ? parseTime(row.respondedAt) : '-' }}</div>
          <div v-if="row.cooldownUntil" class="muted">冷静期至 {{ parseTime(row.cooldownUntil) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.requestId)" v-hasPermi="['cupid:introduction:query']">详情</el-button>
          <el-button
            v-if="canHandle(row)"
            link
            type="primary"
            icon="CircleCheck"
            @click="openAction(row)"
            v-hasPermi="['cupid:introduction:accept', 'cupid:introduction:decline']"
          >
            处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="私人介绍详情" size="720px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="申请ID" :span="2">{{ detail.requestId }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detail.requesterAccountName || detail.requesterUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)" :effect="detail.status === 'requested' ? 'plain' : 'light'">{{ labelOf(introductionStatuses, detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标资料">{{ targetTitle(detail) }}</el-descriptions-item>
        <el-descriptions-item label="资料类型">{{ labelOf(profileTypes, detail.targetProfileType) }}</el-descriptions-item>
        <el-descriptions-item label="目标信息" :span="2">{{ targetSummary(detail) }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ parseTime(detail.requestedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ parseTime(detail.expiresAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="受理时间">{{ parseTime(detail.respondedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="冷静期至">{{ parseTime(detail.cooldownUntil) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请留言" :span="2">{{ detail.message || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理原因" :span="2">{{ detail.handledReason || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">内部备注</el-divider>
      <el-form v-if="detail" v-hasPermi="['cupid:introduction:note']">
        <el-form-item>
          <el-input v-model="noteText" type="textarea" maxlength="500" show-word-limit :rows="3" placeholder="记录内部跟进备注，不改变申请状态" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!noteText.trim()" @click="submitNote">保存备注</el-button>
        </el-form-item>
      </el-form>

      <el-divider content-position="left">处理记录</el-divider>
      <el-empty v-if="!detail?.auditLogs?.length" description="暂无记录" />
      <el-timeline v-else>
        <el-timeline-item v-for="item in detail.auditLogs" :key="item.id" :timestamp="parseTime(item.createdAt)" placement="top">
          <div class="row-title">{{ actionLabel(item.action) }}</div>
          <div class="muted">{{ item.actorName || item.actorUserId || '-' }}</div>
          <div v-if="item.reason">{{ item.reason }}</div>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>

    <el-dialog v-model="actionOpen" title="处理私人介绍" width="460px" append-to-body>
      <el-form :model="actionForm" label-width="90px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="actionMode">
            <el-radio value="accept" v-hasPermi="['cupid:introduction:accept']">受理</el-radio>
            <el-radio value="decline" v-hasPermi="['cupid:introduction:decline']">暂不受理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="actionForm.reason" type="textarea" maxlength="500" show-word-limit :rows="4" :placeholder="actionMode === 'accept' ? '可填写受理说明' : '请填写暂不受理原因'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="actionOpen = false">取消</el-button>
        <el-button :type="actionMode === 'accept' ? 'primary' : 'danger'" :disabled="actionMode === 'decline' && !actionForm.reason.trim()" @click="submitAction">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { parseTime } from '@/utils/ruoyi'
import {
  acceptIntroduction,
  declineIntroduction,
  getIntroduction,
  listIntroductions,
  noteIntroduction
} from '@/api/cupid/review'
import {
  ageOf,
  introductionSortOptions,
  introductionStatuses,
  labelOf,
  loadCupidCommonOptions,
  optionsOf,
  profileCodeLabel,
  profileTypes
} from '../review-utils'

const proxy = getCurrentInstance()!.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])
const detailOpen = ref(false)
const detail = ref<any>()
const noteText = ref('')
const actionOpen = ref(false)
const actionMode = ref<'accept' | 'decline'>('accept')
const actionTarget = ref<any>()
const actionForm = reactive({ reason: '' })

const queryParams = reactive<Record<string, any>>({
  pageNum: 1,
  pageSize: 10,
  requestId: '',
  requesterUserId: '',
  requesterKeyword: '',
  targetProfileId: '',
  targetKeyword: '',
  status: '',
  sortBy: 'pendingFirst'
})

onMounted(async () => {
  await loadCupidCommonOptions('zh')
  getList()
})

function queryWithDateRange() {
  const params = { ...queryParams }
  if (dateRange.value?.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }
  return params
}

function getList() {
  loading.value = true
  listIntroductions(queryWithDateRange()).then((response: any) => {
    rows.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

function targetTitle(row: any): string {
  return row?.targetProfileName || row?.targetProfileId || '-'
}

function targetSummary(row: any): string {
  const parts = [
    labelOf(profileTypes, row?.targetProfileType),
    labelOf({ group: 'profile.gender', values: ['male', 'female'] }, row?.targetGender),
    ageOf(row?.targetBirthYear),
    row?.targetCityLabel || profileCodeLabel('city', row?.targetCityCode),
    row?.targetIndustryLabel
  ].filter((item) => item && item !== '-')
  return parts.join(' / ') || '-'
}

function canHandle(row: any): boolean {
  return row?.status === 'requested'
}

function statusTagType(status: string) {
  if (status === 'accepted') return 'success'
  if (status === 'declined' || status === 'cooldown') return 'danger'
  if (status === 'expired' || status === 'cancelled') return 'info'
  return ''
}

function openDetail(requestId: string) {
  getIntroduction(requestId).then((response: any) => {
    detail.value = response.data
    noteText.value = ''
    detailOpen.value = true
  })
}

function openAction(row: any) {
  actionTarget.value = row
  actionMode.value = 'accept'
  actionForm.reason = ''
  actionOpen.value = true
}

function submitAction() {
  const requestId = actionTarget.value?.requestId
  if (!requestId) return
  const request = actionMode.value === 'accept' ? acceptIntroduction : declineIntroduction
  request(requestId, { reason: actionForm.reason }).then(() => {
    proxy.$modal.msgSuccess(actionMode.value === 'accept' ? '已受理' : '已暂不受理')
    actionOpen.value = false
    getList()
    if (detailOpen.value) openDetail(requestId)
  })
}

function submitNote() {
  if (!detail.value?.requestId || !noteText.value.trim()) return
  noteIntroduction(detail.value.requestId, { note: noteText.value.trim() }).then(() => {
    proxy.$modal.msgSuccess('备注已保存')
    openDetail(detail.value.requestId)
  })
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    'cupid.introduction.accept': '平台受理',
    'cupid.introduction.decline': '平台暂不受理',
    'cupid.introduction.note': '内部备注'
  }
  return map[action] || action || '-'
}
</script>

<style scoped>
.review-query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding-left: 10px;
  border-left: 2px;
}

.review-query-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

.review-query-id :deep(.el-input),
.review-query-select :deep(.el-select) {
  width: 142px;
}

.review-query-name :deep(.el-input) {
  width: 170px;
}

.review-query-sort :deep(.el-select) {
  width: 150px;
}

.review-query-date :deep(.el-date-editor) {
  width: 230px;
}

.row-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.muted {
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.el-tag.status-plain {
  background: transparent;
}
</style>
