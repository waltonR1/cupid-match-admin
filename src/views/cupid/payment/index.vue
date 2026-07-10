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
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openOrderDetail(row.id)">详情</el-button>
            </template>
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
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openWebhookDetail(row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="webhookTotal > 0" :total="webhookTotal" v-model:page="webhookQuery.pageNum" v-model:limit="webhookQuery.pageSize" @pagination="getWebhookList" />
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="orderDetailVisible" title="支付订单详情" size="760px">
      <template v-if="orderDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单ID">{{ orderDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="orderStatusTag(orderDetail.status)">{{ orderStatusLabel(orderDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">{{ orderDetail.accountName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ orderDetail.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员等级">{{ membershipLabel(orderDetail.tier) }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ formatAmount(orderDetail.amountCents, orderDetail.currency) }}</el-descriptions-item>
          <el-descriptions-item label="Provider">{{ orderDetail.provider || '-' }} / {{ orderDetail.environment || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Customer">{{ orderDetail.customerId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Checkout Session" :span="2">{{ orderDetail.checkoutSessionId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Subscription" :span="2">{{ orderDetail.subscriptionId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Price" :span="2">{{ orderDetail.priceId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="订阅状态">{{ orderDetail.subscriptionStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="周期末取消">{{ truthy(orderDetail.cancelAtPeriodEnd) ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="周期开始">{{ parseTime(orderDetail.currentPeriodStartedAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="周期结束">{{ parseTime(orderDetail.currentPeriodEndsAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员ID" :span="2">{{ orderDetail.membershipId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员状态">{{ orderDetail.membershipStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员到期">{{ parseTime(orderDetail.membershipExpiresAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="失败原因" :span="2">{{ orderDetail.failureReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(orderDetail.createdAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(orderDetail.updatedAt) || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">平台操作</div>
        <el-alert
          title="取消续费与退款会直接调用 Stripe，请确认订单与用户后再操作；后续 webhook 会再次同步最终状态。"
          type="warning"
          :closable="false"
          show-icon
        />
        <div class="payment-actions">
          <el-button
            v-hasPermi="['cupid:payment:subscription:cancel']"
            :disabled="!canCancelRenewal(orderDetail)"
            :loading="cancelRenewalLoading"
            type="warning"
            plain
            @click="handleCancelRenewal"
          >
            取消自动续费
          </el-button>
          <el-button
            v-hasPermi="['cupid:payment:refund']"
            :disabled="!canRefund(orderDetail)"
            :loading="refundLoading"
            type="danger"
            plain
            @click="handleRefund"
          >
            退款
          </el-button>
        </div>

        <div class="section-title">支付流水</div>
        <el-table :data="orderDetail.payments || []" size="small">
          <el-table-column label="支付ID" prop="paymentId" min-width="180" show-overflow-tooltip />
          <el-table-column label="发票ID" prop="invoiceId" min-width="180" show-overflow-tooltip />
          <el-table-column label="Charge" prop="chargeId" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="paymentStatusTag(row.status)">{{ row.status || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">{{ formatAmount(row.amountCents, row.currency) }}</template>
          </el-table-column>
          <el-table-column label="支付时间" width="170">
            <template #default="{ row }">{{ parseTime(row.paidAt) || '-' }}</template>
          </el-table-column>
        </el-table>
      </template>
      <el-empty v-else description="暂无详情" />
    </el-drawer>

    <el-drawer v-model="webhookDetailVisible" title="支付回调详情" size="760px">
      <template v-if="webhookDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事件ID" :span="2">{{ webhookDetail.eventId }}</el-descriptions-item>
          <el-descriptions-item label="事件类型">{{ webhookDetail.eventType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="webhookStatusTag(webhookDetail.processStatus)">{{ webhookStatusLabel(webhookDetail.processStatus) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="环境">{{ webhookDetail.provider || '-' }} / {{ webhookDetail.environment || '-' }}</el-descriptions-item>
          <el-descriptions-item label="接收时间">{{ parseTime(webhookDetail.receivedAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ parseTime(webhookDetail.processedAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理信息" :span="2">{{ webhookDetail.processMessage || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="section-title">原始 Payload</div>
        <pre class="payload-preview">{{ formatPayload(webhookDetail.payloadJson) }}</pre>
      </template>
      <el-empty v-else description="暂无详情" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parseTime } from '@/utils/ruoyi'
import {
  cancelCupidPaymentOrderRenewal,
  getCupidPaymentOrder,
  getCupidPaymentWebhook,
  listCupidPaymentOrders,
  listCupidPaymentWebhooks,
  refundCupidPaymentOrder,
  type CupidPaymentOrderDetail,
  type CupidPaymentOrderItem,
  type CupidPaymentWebhookDetail,
  type CupidPaymentWebhookItem
} from '@/api/cupid/payment'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'

const showSearch = ref(true)
const activeTab = ref<'orders' | 'webhooks'>('orders')
const loading = ref(false)
const orderRows = ref<CupidPaymentOrderItem[]>([])
const webhookRows = ref<CupidPaymentWebhookItem[]>([])
const orderDetail = ref<CupidPaymentOrderDetail>()
const webhookDetail = ref<CupidPaymentWebhookDetail>()
const cancelRenewalLoading = ref(false)
const refundLoading = ref(false)
const orderDetailVisible = ref(false)
const webhookDetailVisible = ref(false)
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
  { label: '已过期', value: 'expired' },
  { label: '已退款', value: 'refunded' }
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
  if (status === 'refunded') return 'info'
  return 'info'
}

function paymentStatusTag(status?: string) {
  if (status === 'succeeded') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'refunded') return 'info'
  return 'warning'
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

function truthy(value?: boolean | number) {
  return value === true || value === 1
}

function formatPayload(value?: string) {
  if (!value) return '-'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
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

async function openOrderDetail(id: string) {
  orderDetail.value = (await getCupidPaymentOrder(id)).data
  orderDetailVisible.value = true
}

function canCancelRenewal(detail?: CupidPaymentOrderDetail) {
  return Boolean(
    detail
    && detail.subscriptionId
    && detail.localSubscriptionId
    && !truthy(detail.cancelAtPeriodEnd)
    && detail.status !== 'refunded'
  )
}

function canRefund(detail?: CupidPaymentOrderDetail) {
  return Boolean(
    detail
    && detail.status === 'paid'
    && (detail.payments || []).some(item => item.status === 'succeeded' && (item.chargeId || item.paymentId))
  )
}

async function handleCancelRenewal() {
  if (!orderDetail.value?.id) return
  await ElMessageBox.confirm('确认取消该订单对应订阅的自动续费？当前周期权益会保留到周期结束。', '取消自动续费', {
    confirmButtonText: '确认取消续费',
    cancelButtonText: '返回',
    type: 'warning'
  })
  cancelRenewalLoading.value = true
  try {
    await cancelCupidPaymentOrderRenewal(orderDetail.value.id)
    ElMessage.success('已取消自动续费')
    await refreshOrderDetail()
    await getOrderList()
  } finally {
    cancelRenewalLoading.value = false
  }
}

async function handleRefund() {
  if (!orderDetail.value?.id) return
  await ElMessageBox.confirm('确认对该订单发起退款？退款会直接提交到 Stripe，不能仅在本系统内撤销。', '确认退款', {
    confirmButtonText: '确认退款',
    cancelButtonText: '返回',
    type: 'warning'
  })
  refundLoading.value = true
  try {
    await refundCupidPaymentOrder(orderDetail.value.id)
    ElMessage.success('退款已提交')
    await refreshOrderDetail()
    await getOrderList()
  } finally {
    refundLoading.value = false
  }
}

async function refreshOrderDetail() {
  if (!orderDetail.value?.id) return
  orderDetail.value = (await getCupidPaymentOrder(orderDetail.value.id)).data
}

async function openWebhookDetail(id: string) {
  webhookDetail.value = (await getCupidPaymentWebhook(id)).data
  webhookDetailVisible.value = true
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

.section-title {
  margin: 18px 0 10px;
  font-weight: 600;
  color: #303133;
}

.payload-preview {
  max-height: 420px;
  overflow: auto;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #f8f8f9;
  color: #303133;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.payment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
</style>
