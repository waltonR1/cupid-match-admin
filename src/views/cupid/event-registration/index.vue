<template>
  <div class="app-container">
    <el-form ref="queryRef" class="review-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="72px">
      <el-form-item class="review-query-name" label="活动" prop="eventTitle">
        <el-input v-model="queryParams.eventTitle" placeholder="活动标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-name" label="用户" prop="userKeyword">
        <el-input v-model="queryParams.userKeyword" placeholder="用户名称或ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-select" label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="报名状态" clearable>
          <el-option v-for="item in optionsOf(eventRegStatuses)" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-date" label="申请时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item class="review-query-select review-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in registrationSortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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
      <el-table-column label="活动" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="row-title">{{ row.eventTitle || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="row-title">{{ row.userAccountName || row.userId }}</div>
          <div class="muted">{{ row.userId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="regStatusTagType(row.status)" effect="plain">{{ labelOf(eventRegStatuses, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ parseTime(row.requestedAt) }}</template>
      </el-table-column>
      <el-table-column label="处理时间" width="170">
        <template #default="{ row }">
          {{ parseTime(row.attendedAt || row.cancelledAt || row.confirmedAt || row.declinedAt || row.waitlistedAt) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.id)" v-hasPermi="['cupid:eventRegistration:query']">详情</el-button>
          <el-button
            link
            type="primary"
            icon="CircleCheck"
            @click="openReview(row)"
            v-hasPermi="['cupid:eventRegistration:review']"
          >
            处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="报名详情" size="600px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="报名ID" :span="2">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="活动">{{ detail.eventTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="regStatusTagType(detail.status)" effect="plain">{{ labelOf(eventRegStatuses, detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.userAccountName || detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ parseTime(detail.requestedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="确认时间">{{ parseTime(detail.confirmedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="候补时间">{{ parseTime(detail.waitlistedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="拒绝时间">{{ parseTime(detail.declinedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取消时间">{{ parseTime(detail.cancelledAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="参加时间">{{ parseTime(detail.attendedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="额度扣减">{{ parseTime(detail.eventQuotaConsumedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="额度释放">{{ parseTime(detail.eventQuotaReleasedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <el-dialog v-model="reviewOpen" title="纠正报名状态" width="460px">
      <el-form v-if="reviewTarget" label-width="100px">
        <el-form-item label="活动">
          <span>{{ reviewTarget.eventTitle || '-' }}</span>
        </el-form-item>
        <el-form-item label="用户">
          <span>{{ reviewTarget.userAccountName || reviewTarget.userId }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="regStatusTagType(reviewTarget.status)" effect="plain">
            {{ labelOf(eventRegStatuses, reviewTarget.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="目标状态" prop="status">
          <el-select v-model="targetStatus" placeholder="请选择目标状态">
            <el-option v-for="item in targetStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因" prop="reason">
          <el-input v-model="reviewReason" type="textarea" placeholder="请填写状态纠正原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewOpen = false">取消</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="submitReview">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listAdminRegistrations, getAdminRegistration, reviewRegistration, type RegistrationReviewPayload } from '@/api/cupid/review'
import { eventRegStatuses, registrationSortOptions, labelOf, optionsOf } from '@/views/cupid/review-utils'
import { loadCupidCommonOptions } from '@/views/cupid/review-utils'

const showSearch = ref(true)
const route = useRoute()
const loading = ref(false)
const total = ref(0)
const rows = ref<any[]>([])
const queryParams = ref<Record<string, any>>({ pageNum: 1, pageSize: 10 })
const dateRange = ref<[string, string] | null>(null)

const detailOpen = ref(false)
const detail = ref<any>(null)

const reviewOpen = ref(false)
const reviewTarget = ref<any>(null)
const targetStatus = ref('')
const reviewReason = ref('')
const reviewSubmitting = ref(false)

const targetStatusOptions = computed(() =>
  optionsOf(eventRegStatuses).filter((item) => item.value !== reviewTarget.value?.status)
)

onMounted(async () => {
  if (typeof route.query.eventId === 'string' && route.query.eventId) {
    queryParams.value.eventId = route.query.eventId
  }
  await loadCupidCommonOptions()
  getList()
})

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = null
  queryParams.value = {}
  getList()
}

async function getList() {
  loading.value = true
  try {
    const params = { ...queryParams.value }
    if (dateRange.value) {
      params.dateFrom = dateRange.value[0]
      params.dateTo = dateRange.value[1]
    }
    const res = await listAdminRegistrations(params)
    rows.value = res.rows ?? []
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  const res = await getAdminRegistration(id)
  detail.value = res.data
  detailOpen.value = true
}

function openReview(row: any) {
  reviewTarget.value = row
  targetStatus.value = ''
  reviewReason.value = ''
  reviewOpen.value = true
}

async function submitReview() {
  if (!reviewTarget.value || !targetStatus.value) return
  if (!reviewReason.value.trim()) {
    ElMessage.warning('请填写状态纠正原因')
    return
  }
  reviewSubmitting.value = true
  try {
    await reviewRegistration(reviewTarget.value.id, {
      status: targetStatus.value,
      reason: reviewReason.value
    } as RegistrationReviewPayload)
    reviewOpen.value = false
    getList()
  } finally {
    reviewSubmitting.value = false
  }
}

function regStatusTagType(status: string) {
  if (status === 'confirmed' || status === 'attended') return 'success'
  if (status === 'requested') return 'warning'
  if (status === 'declined' || status === 'cancelled') return 'danger'
  return 'info'
}
</script>
