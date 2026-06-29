<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" label-width="80px" v-show="showSearch">
      <el-form-item label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="会员ID / 用户ID / 名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="会员状态">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 160px">
          <el-option v-for="item in membershipStatuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="会员等级">
        <el-select v-model="queryParams.tier" placeholder="全部等级" clearable style="width: 160px">
          <el-option v-for="item in membershipTiers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="会员ID" min-width="220" prop="id" />
      <el-table-column label="用户" min-width="220">
        <template #default="{ row }">
          <div class="primary-text">{{ row.accountName || '-' }}</div>
          <div class="muted">{{ row.userId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="等级" width="120">
        <template #default="{ row }">{{ membershipLabel(row.tier) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ membershipStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="170">
        <template #default="{ row }">{{ parseTime(row.startedAt) }}</template>
      </el-table-column>
      <el-table-column label="到期时间" width="170">
        <template #default="{ row }">{{ parseTime(row.expiresAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:membership:query']">详情</el-button>
          <el-button link type="warning" @click="openStatusDialog(row)" v-hasPermi="['cupid:membership:status']">改状态</el-button>
          <el-button link type="success" @click="openEditDialog(row)" v-hasPermi="['cupid:membership:edit']">改等级/时间</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="会员详情" size="760px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会员ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ detail.accountName || '-' }} ({{ detail.userId }})</el-descriptions-item>
          <el-descriptions-item label="用户状态">{{ detail.userStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="偏好语言">{{ detail.preferredLocale || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员等级">{{ membershipLabel(detail.tier) }}</el-descriptions-item>
          <el-descriptions-item label="会员状态">{{ membershipStatusLabel(detail.status) }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ parseTime(detail.startedAt) }}</el-descriptions-item>
          <el-descriptions-item label="到期时间">{{ parseTime(detail.expiresAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计费类型">{{ detail.billingType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计费周期">{{ detail.billingPeriod || '-' }}</el-descriptions-item>
          <el-descriptions-item label="有效月数">{{ detail.validityMonths ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="活动额度">{{ detail.eventQuota ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="私介额度">{{ detail.privateIntroductionQuota ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="客服等级">{{ detail.staffSupportLevel || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>

    <el-dialog v-model="statusDialogOpen" title="会员状态变更" width="460px" append-to-body>
      <el-form :model="statusForm" label-width="90px">
        <el-form-item label="会员">
          <div>{{ statusTarget?.accountName || '-' }} ({{ statusTarget?.id }})</div>
        </el-form-item>
        <el-form-item label="目标状态" required>
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option v-for="item in membershipStatuses" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="statusForm.reason" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="请输入原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submitStatus">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogOpen" title="会员资料编辑" width="520px" append-to-body>
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="会员">
          <div>{{ editTarget?.accountName || '-' }} ({{ editTarget?.id }})</div>
        </el-form-item>
        <el-form-item label="会员等级" required>
          <el-select v-model="editForm.tier" style="width: 100%">
            <el-option v-for="item in membershipTiers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-date-picker v-model="editForm.startedAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker v-model="editForm.expiresAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="editForm.reason" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="请输入原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  changeCupidMembershipStatus,
  editCupidMembership,
  getCupidMembershipDetail,
  listCupidMemberships,
  type CupidAdminMembershipDetail,
  type CupidAdminMembershipListItem
} from '@/api/cupid/membership'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'

const proxy = getCurrentInstance()?.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<CupidAdminMembershipListItem[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  tier: ''
})

const membershipStatuses = ref<Array<{ label: string; value: string }>>([])
const membershipTiers = ref<Array<{ label: string; value: string }>>([])

const detailOpen = ref(false)
const detail = ref<CupidAdminMembershipDetail>()

const statusDialogOpen = ref(false)
const statusTarget = ref<CupidAdminMembershipListItem>()
const statusForm = reactive({ status: '', reason: '' })

const editDialogOpen = ref(false)
const editTarget = ref<CupidAdminMembershipListItem>()
const editForm = reactive({ tier: '', startedAt: '', expiresAt: '', reason: '' })

function membershipStatusLabel(status?: string) {
  return membershipStatuses.value.find(item => item.value === status)?.label || status || '-'
}

function membershipLabel(tier?: string) {
  return membershipTiers.value.find(item => item.value === tier)?.label || tier || '-'
}

function statusTagType(status?: string) {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'info'
  if (status === 'cancelled') return 'danger'
  if (status === 'paused') return 'warning'
  return 'info'
}

async function getList() {
  loading.value = true
  try {
    const res = await listCupidMemberships({ ...queryParams })
    rows.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  void getList()
}

function resetQuery() {
  queryParams.pageNum = 1
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.tier = ''
  void getList()
}

async function openDetail(id: string) {
  detail.value = (await getCupidMembershipDetail(id)).data
  detailOpen.value = true
}

function openStatusDialog(row: CupidAdminMembershipListItem) {
  statusTarget.value = row
  statusForm.status = row.status
  statusForm.reason = ''
  statusDialogOpen.value = true
}

async function submitStatus() {
  if (!statusTarget.value) return
  if (!statusForm.reason.trim()) {
    proxy?.$modal.msgWarning('请填写原因')
    return
  }
  await changeCupidMembershipStatus(statusTarget.value.id, { status: statusForm.status, reason: statusForm.reason.trim() })
  proxy?.$modal.msgSuccess('会员状态已更新')
  statusDialogOpen.value = false
  if (detail.value?.id === statusTarget.value.id) {
    await openDetail(statusTarget.value.id)
  }
  await getList()
}

function openEditDialog(row: CupidAdminMembershipListItem) {
  editTarget.value = row
  editForm.tier = row.tier
  editForm.startedAt = row.startedAt || ''
  editForm.expiresAt = row.expiresAt || ''
  editForm.reason = ''
  editDialogOpen.value = true
}

async function submitEdit() {
  if (!editTarget.value) return
  if (!editForm.tier || !editForm.startedAt || !editForm.reason.trim()) {
    proxy?.$modal.msgWarning('请填写完整信息')
    return
  }
  await editCupidMembership(editTarget.value.id, {
    tier: editForm.tier,
    startedAt: editForm.startedAt,
    expiresAt: editForm.expiresAt || undefined,
    reason: editForm.reason.trim()
  })
  proxy?.$modal.msgSuccess('会员资料已更新')
  editDialogOpen.value = false
  if (detail.value?.id === editTarget.value.id) {
    await openDetail(editTarget.value.id)
  }
  await getList()
}

onMounted(async () => {
  await loadCupidCommonOptions('zh')
  membershipStatuses.value = optionsForGroup('membership.status')
  membershipTiers.value = optionsForGroup('membership.tier')
  await getList()
})
</script>

<style scoped>
.primary-text {
  font-weight: 600;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
