<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" label-width="80px" v-show="showSearch">
      <el-form-item label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="用户ID / 名称 / 手机 / 邮箱" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户状态">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 160px">
          <el-option v-for="item in userStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="会员等级">
        <el-select v-model="queryParams.membershipTier" placeholder="全部等级" clearable style="width: 160px">
          <el-option v-for="item in membershipTiers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="在线状态">
        <el-select v-model="queryParams.online" placeholder="全部" clearable style="width: 140px">
          <el-option label="在线" value="1" />
          <el-option label="离线" value="0" />
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
      <el-table-column label="用户" min-width="220">
        <template #default="{ row }">
          <div class="primary-text">{{ row.accountName || '-' }}</div>
          <div class="muted">{{ row.id }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="会员" min-width="140">
        <template #default="{ row }">
          <div>{{ membershipLabel(row.membershipTier) }}</div>
          <div class="muted">{{ row.membershipStatus || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="资料摘要" min-width="160">
        <template #default="{ row }">
          <div>{{ row.profileCount || 0 }} 份资料</div>
          <div class="muted">Self: {{ profileStatusLabel(row.selfProfileStatus) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="会话" min-width="140">
        <template #default="{ row }">
          <div>{{ row.sessionCount || 0 }} 个</div>
          <div class="muted">{{ row.online ? '在线' : '离线' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="最近登录" width="170">
        <template #default="{ row }">{{ sessionTime(row.lastLoginAt) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ parseTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:user:query']">详情</el-button>
          <el-button
            v-if="row.status !== 'banned'"
            link
            type="warning"
            @click="openStatusDialog(row, 'banned')"
            v-hasPermi="['cupid:user:status']"
          >
            封禁
          </el-button>
          <el-button
            v-else
            link
            type="success"
            @click="openStatusDialog(row, 'active')"
            v-hasPermi="['cupid:user:status']"
          >
            解封
          </el-button>
          <el-button link type="danger" @click="kickAllSessions(row)" v-hasPermi="['cupid:user:session:kick']">全部会话强退</el-button>
          <el-button link type="primary" @click="openSensitiveDialog(row)" v-hasPermi="['cupid:user:sensitive']">完整敏感信息</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="App 用户详情" size="900px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="名称">{{ detail.accountName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detail.status)">{{ statusLabel(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="偏好语言">{{ detail.preferredLocale || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员">{{ membershipLabel(detail.membershipTier) }}</el-descriptions-item>
          <el-descriptions-item label="会员状态">{{ detail.membershipStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会话数">{{ detail.sessionCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="最近登录">{{ sessionTime(detail.lastLoginAt) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(detail.updatedAt) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">敏感信息（默认脱敏）</el-divider>
        <el-table :data="detail.identities" border>
          <el-table-column label="类型" width="120" prop="provider" />
          <el-table-column label="标识" min-width="220">
            <template #default="{ row }">{{ row.maskedIdentifier || '-' }}</template>
          </el-table-column>
          <el-table-column label="认证时间" min-width="180">
            <template #default="{ row }">{{ parseTime(row.verifiedAt) || '-' }}</template>
          </el-table-column>
        </el-table>
        <el-table :data="detail.profileContacts" border class="mt12">
          <el-table-column label="资料类型" width="120">
            <template #default="{ row }">{{ row.profileType }}</template>
          </el-table-column>
          <el-table-column label="手机" min-width="180" prop="phone" />
          <el-table-column label="邮箱" min-width="220" prop="email" />
          <el-table-column label="微信" min-width="160" prop="wechat" />
        </el-table>

        <el-divider content-position="left">安全与偏好</el-divider>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="MFA">{{ detail.mfaEnabled ? '已启用' : '未启用' }}</el-descriptions-item>
          <el-descriptions-item label="MFA 方式">{{ detail.mfaMethod || '-' }}</el-descriptions-item>
          <el-descriptions-item label="员工联系">{{ yesNo(detail.staffContactEnabled) }}</el-descriptions-item>
          <el-descriptions-item label="家庭协助">{{ yesNo(detail.familyAssistEnabled) }}</el-descriptions-item>
          <el-descriptions-item label="介绍更新">{{ yesNo(detail.introductionUpdatesEnabled) }}</el-descriptions-item>
          <el-descriptions-item label="活动提醒">{{ yesNo(detail.eventRemindersEnabled) }}</el-descriptions-item>
          <el-descriptions-item label="服务公告">{{ yesNo(detail.serviceAnnouncementsEnabled) }}</el-descriptions-item>
          <el-descriptions-item label="营销邮件">{{ yesNo(detail.marketingEmailsEnabled) }}</el-descriptions-item>
          <el-descriptions-item label="分析授权">{{ yesNo(detail.analyticsConsentEnabled) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">资料摘要</el-divider>
        <el-table :data="detail.profiles" border>
          <el-table-column label="资料ID" min-width="200" prop="profileId" />
          <el-table-column label="类型" width="100" prop="profileType" />
          <el-table-column label="名称" min-width="180" prop="profileName" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">{{ profileStatusLabel(row.profileStatus) }}</template>
          </el-table-column>
          <el-table-column label="更新时间" width="170">
            <template #default="{ row }">{{ parseTime(row.updatedAt) }}</template>
          </el-table-column>
        </el-table>

        <el-divider content-position="left">近期活动</el-divider>
        <el-table :data="detail.recentEvents" border>
          <el-table-column label="活动" min-width="220" prop="eventTitle" />
          <el-table-column label="状态" width="120" prop="status" />
          <el-table-column label="日期" width="120" prop="eventDate" />
          <el-table-column label="更新时间" width="170">
            <template #default="{ row }">{{ parseTime(row.updatedAt || row.requestedAt) }}</template>
          </el-table-column>
        </el-table>

        <el-divider content-position="left">当前会话</el-divider>
        <el-table :data="detail.sessions" border>
          <el-table-column label="Session ID" min-width="260" prop="sessionId" />
          <el-table-column label="登录方式" width="120" prop="provider" />
          <el-table-column label="标识" min-width="180" prop="maskedIdentifier" />
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ sessionTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="过期时间" width="170">
            <template #default="{ row }">{{ sessionTime(row.expiresAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="110" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" @click="kickOneSession(row)" v-hasPermi="['cupid:user:session:kick']">强退</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>

    <el-dialog v-model="statusDialogOpen" :title="statusForm.status === 'banned' ? '封禁用户' : '解封用户'" width="460px" append-to-body>
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="用户">
          <div>{{ statusTarget?.accountName }} ({{ statusTarget?.id }})</div>
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

    <el-dialog v-model="sensitiveDialogOpen" title="查看完整敏感信息" width="460px" append-to-body>
      <el-form :model="sensitiveForm" label-width="80px">
        <el-form-item label="用户">
          <div>{{ sensitiveTarget?.accountName }} ({{ sensitiveTarget?.id }})</div>
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="sensitiveForm.reason" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="请输入查看原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sensitiveDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submitSensitive">查看</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="sensitiveResultOpen" title="完整敏感信息" width="760px" append-to-body>
      <template v-if="sensitiveResult">
        <el-table :data="sensitiveResult.identities" border>
          <el-table-column label="类型" width="120" prop="provider" />
          <el-table-column label="完整标识" min-width="260" prop="identifier" />
          <el-table-column label="认证时间" min-width="180">
            <template #default="{ row }">{{ parseTime(row.verifiedAt) || '-' }}</template>
          </el-table-column>
        </el-table>
        <el-table :data="sensitiveResult.profileContacts" border class="mt12">
          <el-table-column label="资料类型" width="120" prop="profileType" />
          <el-table-column label="手机" min-width="180" prop="phone" />
          <el-table-column label="邮箱" min-width="220" prop="email" />
          <el-table-column label="微信" min-width="180" prop="wechat" />
          <el-table-column label="可见性" min-width="140" prop="visibility" />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  changeCupidUserStatus,
  getCupidUserDetail,
  kickAllCupidUserSessions,
  kickCupidUserSession,
  listCupidUsers,
  viewCupidUserSensitive,
  type CupidAdminSensitiveResult,
  type CupidAdminUserDetail,
  type CupidAdminUserListItem,
  type CupidAdminUserSession
} from '@/api/cupid/user'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'

const proxy = getCurrentInstance()?.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<CupidAdminUserListItem[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  membershipTier: '',
  online: ''
})

const userStatusOptions = [
  { label: '正常', value: 'active' },
  { label: '已封禁', value: 'banned' },
  { label: '已停用', value: 'deactivated' }
]
const membershipTiers = ref<Array<{ label: string; value: string }>>([])

const detailOpen = ref(false)
const detail = ref<CupidAdminUserDetail>()

const statusDialogOpen = ref(false)
const statusTarget = ref<CupidAdminUserListItem>()
const statusForm = reactive<{ status: 'active' | 'banned'; reason: string }>({ status: 'banned', reason: '' })

const sensitiveDialogOpen = ref(false)
const sensitiveResultOpen = ref(false)
const sensitiveTarget = ref<CupidAdminUserListItem>()
const sensitiveForm = reactive({ reason: '' })
const sensitiveResult = ref<CupidAdminSensitiveResult>()

function statusLabel(status?: string) {
  return userStatusOptions.find(item => item.value === status)?.label || status || '-'
}

function statusTagType(status?: string) {
  if (status === 'active') return 'success'
  if (status === 'banned') return 'danger'
  if (status === 'deactivated') return 'info'
  return 'info'
}

function membershipLabel(tier?: string) {
  return membershipTiers.value.find(item => item.value === tier)?.label || tier || '-'
}

function profileStatusLabel(status?: string) {
  const mapping: Record<string, string> = {
    draft: '草稿',
    review: '审核中',
    open: '开放',
    paused: '暂停',
    hidden: '隐藏'
  }
  return status ? (mapping[status] || status) : '-'
}

function yesNo(value?: boolean) {
  return value ? '是' : '否'
}

function sessionTime(value?: string | number | null) {
  if (!value) return '-'
  return parseTime(value as any) || '-'
}

async function getList() {
  loading.value = true
  try {
    const res = await listCupidUsers({ ...queryParams, online: queryParams.online as any })
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
  queryParams.membershipTier = ''
  queryParams.online = ''
  void getList()
}

async function openDetail(id: string) {
  detail.value = (await getCupidUserDetail(id)).data
  detailOpen.value = true
}

function openStatusDialog(row: CupidAdminUserListItem, status: 'active' | 'banned') {
  statusTarget.value = row
  statusForm.status = status
  statusForm.reason = ''
  statusDialogOpen.value = true
}

async function submitStatus() {
  if (!statusTarget.value) return
  if (!statusForm.reason.trim()) {
    proxy?.$modal.msgWarning('请填写原因')
    return
  }
  await changeCupidUserStatus(statusTarget.value.id, { ...statusForm, reason: statusForm.reason.trim() })
  proxy?.$modal.msgSuccess(statusForm.status === 'banned' ? '用户已封禁' : '用户已解封')
  statusDialogOpen.value = false
  if (detail.value?.id === statusTarget.value.id) {
    await openDetail(statusTarget.value.id)
  }
  await getList()
}

async function kickAllSessions(row: CupidAdminUserListItem) {
  await proxy?.$modal.confirm(`确认强退用户 ${row.accountName} 的全部会话吗？`)
  await kickAllCupidUserSessions(row.id)
  proxy?.$modal.msgSuccess('已强退全部会话')
  if (detail.value?.id === row.id) {
    await openDetail(row.id)
  }
  await getList()
}

async function kickOneSession(row: CupidAdminUserSession) {
  if (!detail.value) return
  await proxy?.$modal.confirm('确认强退该会话吗？')
  await kickCupidUserSession(detail.value.id, row.sessionId)
  proxy?.$modal.msgSuccess('会话已强退')
  await openDetail(detail.value.id)
  await getList()
}

function openSensitiveDialog(row: CupidAdminUserListItem) {
  sensitiveTarget.value = row
  sensitiveForm.reason = ''
  sensitiveDialogOpen.value = true
}

async function submitSensitive() {
  if (!sensitiveTarget.value) return
  if (!sensitiveForm.reason.trim()) {
    proxy?.$modal.msgWarning('请填写查看原因')
    return
  }
  sensitiveResult.value = (await viewCupidUserSensitive(sensitiveTarget.value.id, { reason: sensitiveForm.reason.trim() })).data
  sensitiveDialogOpen.value = false
  sensitiveResultOpen.value = true
}

onMounted(async () => {
  await loadCupidCommonOptions('zh')
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

.mt12 {
  margin-top: 12px;
}
</style>
