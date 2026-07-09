<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="支付订单" name="orders">
        <el-form :model="orderQuery" :inline="true" label-width="80px" v-show="showSearch">
          <el-form-item label="关键词">
            <el-input v-model="orderQuery.keyword" placeholder="订单ID / 用户ID / 昵称 / Stripe ID" clearable @keyup.enter="handleOrderQuery" />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="orderQuery.status" placeholder="全部状态" clearable style="width: 160px">
              <el-option v-for="item in orderStatuses" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="会员等级">
            <el-select v-model="orderQuery.tier" placeholder="全部等级" clearable style="width: 160px">
              <el-option v-for="item in membershipTiers" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleOrderQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetOrderQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getOrderList" />
        </el-row>

        <el-table v-loading="loading" :data="orderRows">
          <el-table-column label="订单" min-width="220">
            <template #default="{ row }">
              <div class="primary-text">{{ row.id }}</div>
              <div class="muted">{{ row.orderType || '-' }} / {{ row.provider || '-' }} / {{ row.environment || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="用户" min-width="200">
            <template #default="{ row }">
              <div class="primary-text">{{ row.accountName || '-' }}</div>
              <div class="muted">{{ row.userId }}</div>
            </template>
          </el-table-column>
          <el-table-column label="会员等级" width="120">
            <template #default="{ row }">{{ membershipLabel(row.tier) }}</template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">{{ formatAmount(row.amountCents, row.currency) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="130">
            <template #default="{ row }">
              <el-tag :type="orderStatusTag(row.status)">{{ orderStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Stripe 会话" min-width="260" show-overflow-tooltip>
            <template #default="{ row }">{{ row.checkoutSessionId || row.subscriptionId || '-' }}</template>
          </el-table-column>
          <el-table-column label="支付时间" width="170">
            <template #default="{ row }">{{ parseTime(row.paidAt) || '-' }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ parseTime(row.createdAt) }}</template>
          </el-table-column>
        </el-table>

        <pagination v-show="orderTotal > 0" :total="orderTotal" v-model:page="orderQuery.pageNum" v-model:limit="orderQuery.pageSize" @pagination="getOrderList" />
      </el-tab-pane>

      <el-tab-pane label="支付回调日志" name="webhooks">
        <el-form :model="webhookQuery" :inline="true" label-width="80px" v-show="showSearch">
          <el-form-item label="事件类型">
            <el-input v-model="webhookQuery.eventType" placeholder="checkout.session.completed" clearable @keyup.enter="handleWebhookQuery" />
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select v-model="webhookQuery.processStatus" placeholder="全部状态" clearable style="width: 160px">
              <el-option v-for="item in webhookStatuses" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleWebhookQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetWebhookQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getWebhookList" />
        </el-row>

        <el-table v-loading="loading" :data="webhookRows">
          <el-table-column label="事件ID" min-width="260" prop="eventId" show-overflow-tooltip />
          <el-table-column label="事件类型" min-width="240" prop="eventType" show-overflow-tooltip />
          <el-table-column label="环境" width="120">
            <template #default="{ row }">{{ row.provider || '-' }} / {{ row.environment || '-' }}</template>
          </el-table-column>
          <el-table-column label="处理状态" width="130">
            <template #default="{ row }">
              <el-tag :type="webhookStatusTag(row.processStatus)">{{ webhookStatusLabel(row.processStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="处理信息" min-width="260" prop="processMessage" show-overflow-tooltip />
          <el-table-column label="接收时间" width="170">
            <template #default="{ row }">{{ parseTime(row.receivedAt) }}</template>
          </el-table-column>
          <el-table-column label="处理时间" width="170">
            <template #default="{ row }">{{ parseTime(row.processedAt) || '-' }}</template>
          </el-table-column>
        </el-table>

        <pagination v-show="webhookTotal > 0" :total="webhookTotal" v-model:page="webhookQuery.pageNum" v-model:limit="webhookQuery.pageSize" @pagination="getWebhookList" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  listCupidPaymentOrders,
  listCupidPaymentWebhooks,
  type CupidPaymentOrderItem,
  type CupidPaymentWebhookItem
} from '@/api/cupid/payment'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'

const showSearch = ref(true)
const activeTab = ref<'orders' | 'webhooks'>('orders')
const loading = ref(false)
const orderRows = ref<CupidPaymentOrderItem[]>([])
const webhookRows = ref<CupidPaymentWebhookItem[]>([])
const orderTotal = ref(0)
const webhookTotal = ref(0)
const membershipTiers = ref<Array<{ label: string; value: string }>>([])

const orderQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  tier: ''
})

const webhookQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  eventType: '',
  processStatus: ''
})

const orderStatuses = [
  { label: '待创建支付', value: 'pending' },
  { label: '已创建 Checkout', value: 'checkout_created' },
  { label: '已支付', value: 'paid' },
  { label: '失败', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
  { label: '已过期', value: 'expired' }
]

const webhookStatuses = [
  { label: '已接收', value: 'received' },
  { label: '已处理', value: 'processed' },
  { label: '处理失败', value: 'failed' },
  { label: '已忽略', value: 'ignored' }
]

function membershipLabel(tier?: string) {
  return membershipTiers.value.find(item => item.value === tier)?.label || tier || '-'
}

function orderStatusLabel(status?: string) {
  return orderStatuses.find(item => item.value === status)?.label || status || '-'
}

function webhookStatusLabel(status?: string) {
  return webhookStatuses.find(item => item.value === status)?.label || status || '-'
}

function orderStatusTag(status?: string) {
  if (status === 'paid') return 'success'
  if (status === 'failed' || status === 'cancelled' || status === 'expired') return 'danger'
  if (status === 'checkout_created') return 'warning'
  return 'info'
}

function webhookStatusTag(status?: string) {
  if (status === 'processed') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'ignored') return 'info'
  return 'warning'
}

function formatAmount(amountCents?: number, currency?: string) {
  if (amountCents === undefined || amountCents === null) return '-'
  return `${(amountCents / 100).toFixed(2)} ${currency || ''}`.trim()
}

async function getOrderList() {
  loading.value = true
  try {
    const res = await listCupidPaymentOrders({ ...orderQuery })
    orderRows.value = res.rows || []
    orderTotal.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function getWebhookList() {
  loading.value = true
  try {
    const res = await listCupidPaymentWebhooks({ ...webhookQuery })
    webhookRows.value = res.rows || []
    webhookTotal.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleOrderQuery() {
  orderQuery.pageNum = 1
  void getOrderList()
}

function resetOrderQuery() {
  orderQuery.pageNum = 1
  orderQuery.keyword = ''
  orderQuery.status = ''
  orderQuery.tier = ''
  void getOrderList()
}

function handleWebhookQuery() {
  webhookQuery.pageNum = 1
  void getWebhookList()
}

function resetWebhookQuery() {
  webhookQuery.pageNum = 1
  webhookQuery.eventType = ''
  webhookQuery.processStatus = ''
  void getWebhookList()
}

function handleTabChange() {
  if (activeTab.value === 'orders') {
    void getOrderList()
  } else {
    void getWebhookList()
  }
}

onMounted(async () => {
  await loadCupidCommonOptions()
  membershipTiers.value = optionsForGroup('membership.tier')
  await getOrderList()
})
</script>

<style scoped>
.primary-text {
  font-weight: 600;
  color: #303133;
}

.muted {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
