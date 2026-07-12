<template>
  <div class="app-container">
    <el-form v-show="showSearch" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="关键词">
        <el-input
          v-model="queryParams.keyword"
          placeholder="线索ID / 称呼 / 联系方式 / 内容"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="咨询类型">
        <el-select v-model="queryParams.inquiryType" placeholder="全部类型" clearable style="width: 160px">
          <el-option v-for="item in inquiryTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系渠道">
        <el-select v-model="queryParams.contactChannel" placeholder="全部渠道" clearable style="width: 140px">
          <el-option v-for="item in contactChannels" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
          <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-table-column label="线索" min-width="220">
        <template #default="{ row }">
          <div class="primary-text">{{ row.name || '-' }}</div>
          <div class="muted">{{ row.id }}</div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">{{ inquiryTypeLabel(row.inquiryType) }}</template>
      </el-table-column>
      <el-table-column label="联系方式" min-width="220">
        <template #default="{ row }">
          <div>{{ contactChannelLabel(row.contactChannel) }}</div>
          <div class="muted">{{ row.contactValue }}</div>
        </template>
      </el-table-column>
      <el-table-column label="咨询内容" min-width="320" show-overflow-tooltip prop="message" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="处理人" width="140">
        <template #default="{ row }">{{ row.handlerNickName || row.handlerUserName || '-' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ parseTime(row.createdAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:contactLead:query']">详情</el-button>
          <el-button link type="success" @click="openHandle(row)" v-hasPermi="['cupid:contactLead:handle']">处理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <el-drawer v-model="detailOpen" title="联系咨询详情" size="760px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="线索ID" :span="2">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ detail.source || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
          <el-descriptions-item label="咨询类型">{{ inquiryTypeLabel(detail.inquiryType) }}</el-descriptions-item>
          <el-descriptions-item label="称呼">{{ detail.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系渠道">{{ contactChannelLabel(detail.contactChannel) }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ detail.contactValue }}</el-descriptions-item>
          <el-descriptions-item label="咨询内容" :span="2">{{ detail.message }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ detail.handlerNickName || detail.handlerUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ parseTime(detail.handledAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理备注" :span="2">{{ detail.handlerNote || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detail.createdAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(detail.updatedAt) || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>

    <el-dialog v-model="handleOpen" title="处理联系咨询" width="520px" append-to-body>
      <el-form :model="handleForm" label-width="90px">
        <el-form-item label="线索">
          <div>{{ handleTarget?.name || '-' }} / {{ inquiryTypeLabel(handleTarget?.inquiryType) }}</div>
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="handleForm.status" style="width: 100%">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="handleForm.handlerNote"
            type="textarea"
            :rows="5"
            maxlength="1000"
            show-word-limit
            placeholder="记录已联系、后续安排或忽略原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleOpen = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  getCupidContactLead,
  handleCupidContactLead,
  listCupidContactLeads,
  type CupidContactLeadItem
} from '@/api/cupid/contact-lead'

const proxy = getCurrentInstance()?.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<CupidContactLeadItem[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  inquiryType: '',
  contactChannel: '',
  status: ''
})

const inquiryTypes = [
  { label: '平台介绍', value: 'platform' },
  { label: '会员咨询', value: 'membership' },
  { label: '活动咨询', value: 'event' },
  { label: '顾问服务', value: 'advisor' },
  { label: '品牌合作', value: 'partnership' },
  { label: '投诉反馈', value: 'complaint' },
  { label: '隐私与数据', value: 'privacy' },
  { label: '其他', value: 'other' }
]
const contactChannels = [
  { label: '邮箱', value: 'email' },
  { label: '手机', value: 'phone' },
  { label: '微信', value: 'wechat' }
]
const statuses = [
  { label: '新咨询', value: 'new' },
  { label: '处理中', value: 'processing' },
  { label: '已解决', value: 'resolved' },
  { label: '已忽略', value: 'ignored' }
]

const detailOpen = ref(false)
const detail = ref<CupidContactLeadItem>()

const handleOpen = ref(false)
const handleTarget = ref<CupidContactLeadItem>()
const handleForm = reactive({
  status: 'processing',
  handlerNote: ''
})

function inquiryTypeLabel(value?: string) {
  return inquiryTypes.find(item => item.value === value)?.label || value || '-'
}

function contactChannelLabel(value?: string) {
  return contactChannels.find(item => item.value === value)?.label || value || '-'
}

function statusLabel(value?: string) {
  return statuses.find(item => item.value === value)?.label || value || '-'
}

function statusTag(value?: string) {
  if (value === 'resolved') return 'success'
  if (value === 'ignored') return 'info'
  if (value === 'processing') return 'warning'
  return 'danger'
}

async function getList() {
  loading.value = true
  try {
    const res = await listCupidContactLeads({ ...queryParams })
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
  queryParams.inquiryType = ''
  queryParams.contactChannel = ''
  queryParams.status = ''
  void getList()
}

async function openDetail(id: string) {
  detail.value = (await getCupidContactLead(id)).data
  detailOpen.value = true
}

function openHandle(row: CupidContactLeadItem) {
  handleTarget.value = row
  handleForm.status = row.status === 'new' ? 'processing' : row.status
  handleForm.handlerNote = row.handlerNote || ''
  handleOpen.value = true
}

async function submitHandle() {
  if (!handleTarget.value) return
  if ((handleForm.status === 'resolved' || handleForm.status === 'ignored') && !handleForm.handlerNote.trim()) {
    proxy?.$modal.msgWarning('完成或忽略时请填写处理备注')
    return
  }
  await handleCupidContactLead(handleTarget.value.id, {
    status: handleForm.status,
    handlerNote: handleForm.handlerNote.trim() || undefined
  })
  proxy?.$modal.msgSuccess('联系咨询已更新')
  handleOpen.value = false
  await getList()
  if (detail.value?.id === handleTarget.value.id) {
    await openDetail(handleTarget.value.id)
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
</style>
