<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" label-width="90px" v-show="showSearch">
      <el-form-item label="动作码">
        <el-input v-model="queryParams.action" placeholder="例如 cupid.user.ban" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="对象类型">
        <el-input v-model="queryParams.subjectType" placeholder="user / membership / inbox_broadcast" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="对象ID">
        <el-input v-model="queryParams.subjectId" placeholder="业务对象ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人">
        <el-input v-model="queryParams.operatorKeyword" placeholder="用户ID / 用户名 / 昵称" clearable @keyup.enter="handleQuery" />
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
      <el-table-column label="动作码" min-width="220" prop="action" />
      <el-table-column label="对象" min-width="220">
        <template #default="{ row }">
          <div class="primary-text">{{ row.subjectType }}</div>
          <div class="muted">{{ row.subjectId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作人" min-width="160">
        <template #default="{ row }">
          <div>{{ row.actorDisplayName || '-' }}</div>
          <div class="muted">{{ row.actorUserId || row.actorType }}</div>
        </template>
      </el-table-column>
      <el-table-column label="原因" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ row.reason || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:audit:query']">详情</el-button>
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

    <el-drawer v-model="detailOpen" title="业务审计详情" size="860px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审计ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="动作码">{{ detail.action }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detail.actorDisplayName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="操作人ID">{{ detail.actorUserId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="对象类型">{{ detail.subjectType }}</el-descriptions-item>
          <el-descriptions-item label="对象ID">{{ detail.subjectId }}</el-descriptions-item>
          <el-descriptions-item label="原因" :span="2">{{ detail.reason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="时间" :span="2">{{ parseTime(detail.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <div class="json-section">
          <div class="json-title">Before</div>
          <pre class="json-box">{{ formatJson(detail.beforeData) }}</pre>
        </div>

        <div class="json-section">
          <div class="json-title">After</div>
          <pre class="json-box">{{ formatJson(detail.afterData) }}</pre>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import { getCupidAuditDetail, listCupidAuditLogs, type CupidAdminAuditDetail, type CupidAdminAuditListItem } from '@/api/cupid/audit'

const showSearch = ref(true)
const loading = ref(false)
const rows = ref<CupidAdminAuditListItem[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  action: '',
  subjectType: '',
  subjectId: '',
  operatorKeyword: ''
})

const detailOpen = ref(false)
const detail = ref<CupidAdminAuditDetail>()

async function getList() {
  loading.value = true
  try {
    const res = await listCupidAuditLogs({ ...queryParams })
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
  queryParams.action = ''
  queryParams.subjectType = ''
  queryParams.subjectId = ''
  queryParams.operatorKeyword = ''
  void getList()
}

async function openDetail(id: string) {
  detail.value = (await getCupidAuditDetail(id)).data
  detailOpen.value = true
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
.primary-text {
  font-weight: 600;
}

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
