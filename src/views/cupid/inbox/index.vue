<template>
  <div class="app-container inbox-page">
    <div class="composer-layout">
      <el-form :model="form" label-width="110px" class="publish-form">
        <el-form-item label="发布方式">
          <el-segmented v-model="publishMode" :options="publishModeOptions" />
        </el-form-item>

        <el-form-item v-if="publishMode === 'single'" label="目标用户" required>
          <el-select
            v-model="form.userId"
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userLoading"
            placeholder="按用户名或 ID 搜索"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.accountName} (${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <template v-else>
          <el-form-item label="接收范围">
            <el-select v-model="form.scope">
              <el-option label="全部有效用户" value="all_active" />
              <el-option label="指定会员等级" value="membership_tier" />
              <el-option label="手动选择用户" value="selected_users" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.scope === 'membership_tier'" label="会员等级">
            <el-select v-model="form.tier">
              <el-option v-for="item in membershipTiers" :key="item.value" v-bind="item" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.scope === 'selected_users'" label="目标用户">
            <el-select
              v-model="form.userIds"
              multiple
              filterable
              remote
              :remote-method="searchUsers"
              :loading="userLoading"
            >
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="`${user.accountName} (${user.id})`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="内容模式">
          <el-segmented
            v-model="form.mode"
            :options="[
              { label: '通知模板', value: 'template' },
              { label: '自定义正文（三语）', value: 'custom' }
            ]"
          />
        </el-form-item>

        <el-form-item v-if="form.mode === 'template'" label="通知模板" required>
          <el-select v-model="form.templateCode" filterable @change="selectTemplate">
            <el-option
              v-for="item in availableTemplates"
              :key="item.templateCode"
              :label="templateName(item)"
              :value="item.templateCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.mode === 'template'" :label="publishMode === 'single' ? '发送语言' : '预览语言'">
          <el-select v-model="form.locale">
            <el-option label="中文" value="zh" />
            <el-option label="Français" value="fr" />
            <el-option label="English" value="en" />
          </el-select>
        </el-form-item>

        <template v-if="form.mode === 'template'">
          <el-form-item v-for="name in activeVariables" :key="name" :label="variableLabels[name] || name">
            <el-input v-model="form.variables[name]" />
          </el-form-item>
        </template>

        <el-form-item v-else label="通知正文" required>
          <div class="localized-editor">
            <el-tabs v-model="form.locale">
              <el-tab-pane v-for="item in locales" :key="item.value" :label="item.label" :name="item.value">
                <el-input
                  v-model="form.localizedBodies[item.value]"
                  type="textarea"
                  :rows="6"
                  maxlength="4000"
                  show-word-limit
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-form-item>

        <el-form-item v-if="publishMode === 'single'" label="关联业务类型">
          <el-select v-model="form.subjectType" clearable>
            <el-option v-for="item in subjectTypes" :key="item.value" v-bind="item" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="publishMode === 'single' && form.subjectType" label="关联业务">
          <el-select
            v-model="form.subjectId"
            filterable
            remote
            :remote-method="searchSubjects"
            placeholder="搜索该用户的资料、活动或服务记录"
          >
            <el-option v-for="item in subjects" :key="item.id" :label="`${item.label} (${item.id})`" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button icon="View" :loading="previewing" @click="preview">预览</el-button>
          <el-button type="primary" icon="Promotion" :loading="sending" @click="send">确认发送</el-button>
        </el-form-item>
      </el-form>

      <section class="preview-panel">
        <h3>发送预览</h3>
        <template v-if="previewData">
          <el-descriptions v-if="publishMode === 'broadcast'" :column="2" border>
            <el-descriptions-item label="预计人数">{{ previewData.targetCount }}</el-descriptions-item>
            <el-descriptions-item label="样例用户">
              {{ previewData.sampleUsers?.map((item: InboxUser) => item.accountName).join('、') || '-' }}
            </el-descriptions-item>
          </el-descriptions>
          <div class="message-preview">{{ (previewData.message || previewData).body }}</div>
        </template>
        <el-empty v-else description="填写内容后预览" :image-size="72" />
      </section>
    </div>

    <div class="history-layout">
      <el-card v-if="canBroadcast" class="history-card" shadow="never">
        <template #header>
          <div class="history-card__header">
            <span>群发记录</span>
            <el-button link type="primary" @click="loadBroadcastHistory">刷新</el-button>
          </div>
        </template>

        <el-table v-loading="broadcastLoading" :data="broadcastRows" border height="320">
          <el-table-column label="时间" min-width="160">
            <template #default="{ row }">{{ row.createdAt }}</template>
          </el-table-column>
          <el-table-column label="模式" min-width="110">
            <template #default="{ row }">{{ row.mode === 'template' ? '模板' : '自定义' }}</template>
          </el-table-column>
          <el-table-column label="模板 / 范围" min-width="220">
            <template #default="{ row }">
              <div>{{ row.templateCode || '-' }}</div>
              <div class="muted">{{ scopeLabel(row.scope) }}{{ row.tier ? ` / ${row.tier}` : '' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="结果" min-width="140">
            <template #default="{ row }">{{ row.successCount }}/{{ row.targetCount }} 成功</template>
          </el-table-column>
          <el-table-column label="操作人" prop="staffUserName" min-width="120" />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openBroadcastDetail(row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="broadcastTotal > 0"
          :total="broadcastTotal"
          v-model:page="broadcastQuery.pageNum"
          v-model:limit="broadcastQuery.pageSize"
          @pagination="loadBroadcastHistory"
        />
      </el-card>

      <el-card v-if="canSend" class="history-card" shadow="never">
        <template #header>
          <div class="history-card__header">
            <span>单发记录</span>
            <el-button link type="primary" @click="loadSingleHistory">刷新</el-button>
          </div>
        </template>

        <el-table v-loading="singleLoading" :data="singleRows" border height="320">
          <el-table-column label="时间" min-width="160">
            <template #default="{ row }">{{ row.createdAt }}</template>
          </el-table-column>
          <el-table-column label="用户" min-width="180">
            <template #default="{ row }">{{ row.accountName || row.userId }}</template>
          </el-table-column>
          <el-table-column label="模式" min-width="110">
            <template #default="{ row }">{{ row.mode === 'template' ? '模板' : '自定义' }}</template>
          </el-table-column>
          <el-table-column label="模板 / 状态" min-width="220">
            <template #default="{ row }">
              <div>{{ row.templateCode || '-' }}</div>
              <div class="muted">{{ statusLabel(row.status) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作人" prop="staffUserName" min-width="120" />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openSingleDetail(row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="singleTotal > 0"
          :total="singleTotal"
          v-model:page="singleQuery.pageNum"
          v-model:limit="singleQuery.pageSize"
          @pagination="loadSingleHistory"
        />
      </el-card>
    </div>

    <el-drawer v-model="broadcastDetailVisible" title="群发详情" size="720px">
      <template v-if="broadcastDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ broadcastDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ broadcastDetail.staffUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发送模式">{{ broadcastDetail.mode === 'template' ? '模板' : '自定义' }}</el-descriptions-item>
          <el-descriptions-item label="模板">{{ broadcastDetail.templateCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="范围">{{ scopeLabel(broadcastDetail.scope) }}</el-descriptions-item>
          <el-descriptions-item label="发送结果">
            {{ broadcastDetail.successCount }}/{{ broadcastDetail.targetCount }} 成功
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ broadcastDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ broadcastDetail.updatedAt || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">请求快照</el-divider>
        <pre class="json-preview">{{ prettyJson(broadcastDetail.payloadJson) }}</pre>

        <el-divider content-position="left">目标明细</el-divider>
        <el-table :data="broadcastDetail.targets" border height="320">
          <el-table-column label="用户" min-width="180">
            <template #default="{ row }">{{ row.accountName || row.userId }}</template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">{{ statusLabel(row.status) }}</template>
          </el-table-column>
          <el-table-column label="消息ID" prop="messageId" min-width="220" />
          <el-table-column label="失败原因" prop="errorMessage" min-width="220" show-overflow-tooltip />
          <el-table-column label="重试" min-width="150">
            <template #default="{ row }">
              {{ row.retryCount || 0 }} 次
              <div v-if="row.nextRetryAt" class="muted">{{ row.nextRetryAt }}</div>
            </template>
          </el-table-column>
          <el-table-column label="时间" prop="createdAt" min-width="160" />
        </el-table>
      </template>
    </el-drawer>

    <el-drawer v-model="singleDetailVisible" title="单发详情" size="720px">
      <template v-if="singleDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ singleDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="目标用户">{{ singleDetail.accountName || singleDetail.userId }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ singleDetail.staffUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发送模式">{{ singleDetail.mode === 'template' ? '模板' : '自定义' }}</el-descriptions-item>
          <el-descriptions-item label="模板">{{ singleDetail.templateCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusLabel(singleDetail.status) }}</el-descriptions-item>
          <el-descriptions-item label="消息ID">{{ singleDetail.messageId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="关联对象">
            {{ singleDetail.subjectType || '-' }}{{ singleDetail.subjectId ? ` / ${singleDetail.subjectId}` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ singleDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ singleDetail.updatedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="重试次数">{{ singleDetail.retryCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="下次重试">{{ singleDetail.nextRetryAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="失败原因" :span="2">{{ singleDetail.errorMessage || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">请求快照</el-divider>
        <pre class="json-preview">{{ prettyJson(singleDetail.payloadJson) }}</pre>

        <el-divider content-position="left">实际消息正文</el-divider>
        <div class="message-preview">{{ singleDetail.messageBody || '-' }}</div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue'
import {
  getEnabledInboxTemplates,
  getInboxBroadcastDetail,
  getInboxSingleDetail,
  listInboxBroadcastHistory,
  listInboxSingleHistory,
  previewInboxBroadcast,
  previewInboxMessage,
  searchInboxSubjects,
  searchInboxUsers,
  sendInboxBroadcast,
  sendInboxMessage,
  type InboxBroadcastDetail,
  type InboxBroadcastHistoryItem,
  type InboxSingleDetail,
  type InboxSingleHistoryItem,
  type InboxSubject,
  type InboxTemplate,
  type InboxUser
} from '@/api/cupid/inbox'
import useUserStore from '@/store/modules/user'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'

const proxy = getCurrentInstance()?.proxy as any
const userStore = useUserStore()
const hasPermission = (permission: string) =>
  userStore.permissions.includes('*:*:*') || userStore.permissions.includes(permission)

const canBroadcast = computed(() => hasPermission('cupid:inbox:broadcast'))
const canSend = computed(() => hasPermission('cupid:inbox:send'))
const publishModeOptions = computed(() => [
  ...(canBroadcast.value ? [{ label: '群发', value: 'broadcast' as const }] : []),
  ...(canSend.value ? [{ label: '定向通知', value: 'single' as const }] : [])
])

const publishMode = ref<'single' | 'broadcast'>(canBroadcast.value ? 'broadcast' : 'single')
const userLoading = ref(false)
const previewing = ref(false)
const sending = ref(false)
const users = ref<InboxUser[]>([])
const templates = ref<InboxTemplate[]>([])
const previewData = ref<any>()
const subjects = ref<InboxSubject[]>([])
const membershipTiers = computed(() => optionsForGroup('membership.tier'))
const subjectTypes = computed(() => optionsForGroup('message.subjectType').filter(item => !['system', 'legal_document'].includes(item.value)))
const variableLabels: Record<string, string> = {
  profileName: '资料名称',
  eventTitle: '活动名称',
  status: '状态',
  reason: '原因',
  verificationType: '认证类型',
  accountName: '用户名'
}
const locales = [
  { label: '中文', value: 'zh' },
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' }
] as const

const form = reactive({
  userId: '',
  userIds: [] as string[],
  scope: 'all_active',
  tier: '',
  mode: 'template',
  templateCode: '',
  locale: 'zh',
  variables: {} as Record<string, string>,
  localizedBodies: { zh: '', fr: '', en: '' } as Record<'zh' | 'fr' | 'en', string>,
  subjectType: '',
  subjectId: ''
})

const selectedTemplate = computed(() => templates.value.find(item => item.templateCode === form.templateCode))
const availableTemplates = computed(() => (publishMode.value === 'broadcast' ? templates.value.filter(item => !item.subjectType) : templates.value))
const activeVariables = computed(() => {
  const field = selectedTemplate.value?.localizedFields?.find(item => item.locale === form.locale)
  return [...new Set(Array.from(field?.body.matchAll(/\{\{([A-Za-z][A-Za-z0-9]*)}}/g) || []).map(match => match[1]))]
})

const broadcastLoading = ref(false)
const broadcastRows = ref<InboxBroadcastHistoryItem[]>([])
const broadcastTotal = ref(0)
const broadcastQuery = reactive({ pageNum: 1, pageSize: 5 })
const broadcastDetailVisible = ref(false)
const broadcastDetail = ref<InboxBroadcastDetail>()

const singleLoading = ref(false)
const singleRows = ref<InboxSingleHistoryItem[]>([])
const singleTotal = ref(0)
const singleQuery = reactive({ pageNum: 1, pageSize: 5 })
const singleDetailVisible = ref(false)
const singleDetail = ref<InboxSingleDetail>()

function templateName(item: InboxTemplate) {
  return item.localizedFields?.find(field => field.locale === 'zh')?.name || item.templateCode
}

function scopeLabel(scope: string) {
  if (scope === 'all_active') return '全部有效用户'
  if (scope === 'membership_tier') return '指定会员等级'
  if (scope === 'selected_users') return '手动选择用户'
  return scope || '-'
}

function statusLabel(status: string) {
  if (status === 'success') return '成功'
  if (status === 'failure') return '失败'
  if (status === 'pending') return '处理中'
  if (status === 'retrying') return '等待重试'
  if (status === 'exhausted') return '重试耗尽'
  return status || '-'
}

function prettyJson(value?: string) {
  if (!value) return '-'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function payload() {
  return {
    ...form,
    subjectType: selectedTemplate.value?.subjectType || form.subjectType
  }
}

async function searchUsers(keyword: string) {
  userLoading.value = true
  try {
    users.value = (await searchInboxUsers(keyword)).data || []
  } finally {
    userLoading.value = false
  }
}

async function searchSubjects(keyword: string) {
  if (!form.userId || !form.subjectType) {
    subjects.value = []
    return
  }
  subjects.value = (await searchInboxSubjects(form.userId, form.subjectType, keyword)).data || []
}

function selectTemplate() {
  const type = selectedTemplate.value?.subjectType
  if (type) form.subjectType = type
  previewData.value = undefined
}

async function preview() {
  previewing.value = true
  try {
    previewData.value = publishMode.value === 'single'
      ? (await previewInboxMessage(payload())).data
      : (await previewInboxBroadcast(payload())).data
  } finally {
    previewing.value = false
  }
}

async function loadBroadcastHistory() {
  if (!canBroadcast.value) return
  broadcastLoading.value = true
  try {
    const res = await listInboxBroadcastHistory({ ...broadcastQuery })
    broadcastRows.value = res.rows || []
    broadcastTotal.value = res.total || 0
  } finally {
    broadcastLoading.value = false
  }
}

async function loadSingleHistory() {
  if (!canSend.value) return
  singleLoading.value = true
  try {
    const res = await listInboxSingleHistory({ ...singleQuery })
    singleRows.value = res.rows || []
    singleTotal.value = res.total || 0
  } finally {
    singleLoading.value = false
  }
}

async function openBroadcastDetail(id: string) {
  broadcastDetail.value = (await getInboxBroadcastDetail(id)).data
  broadcastDetailVisible.value = true
}

async function openSingleDetail(id: string) {
  singleDetail.value = (await getInboxSingleDetail(id)).data
  singleDetailVisible.value = true
}

async function send() {
  await proxy?.$modal.confirm(`确认${publishMode.value === 'single' ? '发送通知' : '执行群发'}吗？`)
  sending.value = true
  try {
    const res = publishMode.value === 'single' ? await sendInboxMessage(payload()) : await sendInboxBroadcast(payload())
    if (publishMode.value === 'single') {
      proxy?.$modal.msgSuccess('发送成功')
      await loadSingleHistory()
    } else {
      proxy?.$modal.msgSuccess(`群发完成：成功 ${res.data?.successCount || 0}，失败 ${res.data?.failureCount || 0}`)
      await loadBroadcastHistory()
    }
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await loadCupidCommonOptions('zh')
  templates.value = (await getEnabledInboxTemplates()).data || []
  form.templateCode = availableTemplates.value[0]?.templateCode || ''
  await Promise.all([searchUsers(''), loadBroadcastHistory(), loadSingleHistory()])
})

watch(publishMode, () => {
  if (!availableTemplates.value.some(item => item.templateCode === form.templateCode)) {
    form.templateCode = availableTemplates.value[0]?.templateCode || ''
  }
  previewData.value = undefined
})

watch(() => form.userId, userId => {
  const user = users.value.find(item => item.id === userId)
  if (user?.preferredLocale === 'zh' || user?.preferredLocale === 'fr' || user?.preferredLocale === 'en') {
    form.locale = user.preferredLocale
  }
})

watch(() => [form.userId, form.subjectType], () => {
  form.subjectId = ''
  void searchSubjects('')
})
</script>

<style scoped>
.inbox-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.composer-layout {
  display: grid;
  grid-template-columns: minmax(520px, 720px) minmax(360px, 1fr);
  gap: 24px;
}

.publish-form,
.preview-panel,
.history-card {
  min-width: 0;
}

.publish-form :deep(.el-select),
.localized-editor {
  width: 100%;
}

.preview-panel {
  border-left: 1px solid var(--el-border-color);
  padding-left: 24px;
}

.preview-panel h3 {
  margin: 0 0 18px;
}

.history-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.history-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-preview {
  margin-top: 16px;
  padding: 18px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.7;
}

.json-preview {
  margin: 0;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

@media (max-width: 1200px) {
  .composer-layout,
  .history-layout {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    border-left: 0;
    padding-left: 0;
  }
}
</style>
