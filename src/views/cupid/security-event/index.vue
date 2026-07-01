<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" label-width="90px" v-show="showSearch">
      <el-form-item label="用户ID">
        <el-input v-model="queryParams.userId" placeholder="Cupid 用户ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="事件类型">
        <el-select v-model="queryParams.eventType" placeholder="全部" clearable style="width: 180px">
          <el-option
            v-for="item in eventTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="结果">
        <el-select v-model="queryParams.eventResult" placeholder="全部" clearable style="width: 140px">
          <el-option
            v-for="item in eventResultOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="queryParams.keyword"
          placeholder="用户ID / 账号名 / IP"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
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
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ parseTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="事件类型" min-width="170">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ eventTypeLabel(row.eventType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结果" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="eventResultTagType(row.eventResult)">{{ eventResultLabel(row.eventResult) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div>{{ row.accountName || '-' }}</div>
          <div class="muted">{{ row.userId || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="身份" min-width="120">
        <template #default="{ row }">{{ row.provider || '-' }}</template>
      </el-table-column>
      <el-table-column label="风险等级" width="100">
        <template #default="{ row }">{{ row.riskLevel || '-' }}</template>
      </el-table-column>
      <el-table-column label="IP" min-width="140" prop="ip" show-overflow-tooltip />
      <el-table-column label="设备ID" min-width="160" prop="deviceId" show-overflow-tooltip />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:security:event:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-drawer v-model="detailOpen" title="安全事件详情" size="860px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事件ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ parseTime(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="事件类型">{{ eventTypeLabel(detail.eventType) }}</el-descriptions-item>
          <el-descriptions-item label="结果">{{ eventResultLabel(detail.eventResult) }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ detail.accountName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detail.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="身份ID">{{ detail.identityId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="身份类型">{{ detail.provider || '-' }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">{{ detail.riskLevel || '-' }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ detail.ip || '-' }}</el-descriptions-item>
          <el-descriptions-item label="设备ID">{{ detail.deviceId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="User-Agent" :span="2">{{ detail.userAgent || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="json-section">
          <div class="json-title">Detail JSON</div>
          <pre class="json-box">{{ formatJson(detail.detailJson) }}</pre>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  getCupidSecurityEventDetail,
  listCupidSecurityEvents,
  type CupidSecurityEventDetail,
  type CupidSecurityEventListItem
} from '@/api/cupid/security-event'

const showSearch = ref(true)
const loading = ref(false)
const rows = ref<CupidSecurityEventListItem[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: '',
  eventType: '',
  eventResult: '',
  keyword: ''
})

const detailOpen = ref(false)
const detail = ref<CupidSecurityEventDetail>()

const eventTypeOptions = [
  { label: '登录成功', value: 'login_success' },
  { label: '登录失败', value: 'login_failed' },
  { label: '密码修改', value: 'password_changed' },
  { label: '密码重置', value: 'password_reset' },
  { label: '身份绑定', value: 'identity_bound' },
  { label: '身份解绑', value: 'identity_unbound' },
  { label: '会话强退', value: 'session_kicked' },
  { label: '风险命中', value: 'risk_detected' }
]

const eventResultOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '阻断', value: 'blocked' },
  { label: '命中', value: 'detected' }
]

async function getList() {
  loading.value = true
  try {
    const [dateFrom, dateTo] = dateRange.value || []
    const res = await listCupidSecurityEvents({
      ...queryParams,
      dateFrom,
      dateTo
    })
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
  queryParams.userId = ''
  queryParams.eventType = ''
  queryParams.eventResult = ''
  queryParams.keyword = ''
  dateRange.value = []
  void getList()
}

async function openDetail(id: string) {
  detail.value = (await getCupidSecurityEventDetail(id)).data
  detailOpen.value = true
}

function eventTypeLabel(value?: string) {
  return eventTypeOptions.find(item => item.value === value)?.label || value || '-'
}

function eventResultLabel(value?: string) {
  return eventResultOptions.find(item => item.value === value)?.label || value || '-'
}

function eventResultTagType(value?: string) {
  if (value === 'success') return 'success'
  if (value === 'blocked' || value === 'detected') return 'warning'
  if (value === 'failed') return 'danger'
  return 'info'
}

function formatJson(value?: string) {
  if (!value) return '-'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

onMounted(() => {
  void getList()
})
</script>

<style scoped>
.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.json-section {
  margin-top: 16px;
}

.json-title {
  margin-bottom: 8px;
  font-weight: 600;
}

.json-box {
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
</style>
