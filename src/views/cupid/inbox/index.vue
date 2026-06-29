<template>
  <div class="app-container inbox-page">
    <el-form :model="form" label-width="110px" class="publish-form">
      <el-form-item label="发布方式"><el-segmented v-model="publishMode" :options="publishModeOptions" /></el-form-item>
      <el-form-item v-if="publishMode === 'single'" label="目标用户" required>
        <el-select v-model="form.userId" filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="按用户名称或 ID 搜索">
          <el-option v-for="user in users" :key="user.id" :label="`${user.accountName} (${user.id})`" :value="user.id" />
        </el-select>
      </el-form-item>
      <template v-else>
        <el-form-item label="接收范围"><el-select v-model="form.scope"><el-option label="全部有效用户" value="all_active" /><el-option label="指定会员等级" value="membership_tier" /><el-option label="手工选择用户" value="selected_users" /></el-select></el-form-item>
        <el-form-item v-if="form.scope === 'membership_tier'" label="会员等级"><el-select v-model="form.tier"><el-option v-for="item in membershipTiers" :key="item.value" v-bind="item" /></el-select></el-form-item>
        <el-form-item v-if="form.scope === 'selected_users'" label="目标用户"><el-select v-model="form.userIds" multiple filterable remote :remote-method="searchUsers" :loading="userLoading"><el-option v-for="user in users" :key="user.id" :label="`${user.accountName} (${user.id})`" :value="user.id" /></el-select></el-form-item>
      </template>
      <el-form-item label="内容模式"><el-segmented v-model="form.mode" :options="[{ label: '通知模板', value: 'template' }, { label: '自定义正文（三语）', value: 'custom' }]" /></el-form-item>
      <el-form-item v-if="form.mode === 'template'" label="通知模板" required><el-select v-model="form.templateCode" filterable @change="selectTemplate"><el-option v-for="item in availableTemplates" :key="item.templateCode" :label="templateName(item)" :value="item.templateCode" /></el-select></el-form-item>
      <el-form-item v-if="form.mode === 'template'" :label="publishMode === 'single' ? '发送语言' : '预览语言'"><el-select v-model="form.locale"><el-option label="中文" value="zh" /><el-option label="Français" value="fr" /><el-option label="English" value="en" /></el-select></el-form-item>
      <template v-if="form.mode === 'template'">
        <el-form-item v-for="name in activeVariables" :key="name" :label="variableLabels[name] || name"><el-input v-model="form.variables[name]" /></el-form-item>
      </template>
      <el-form-item v-else label="通知正文" required>
        <div class="localized-editor">
          <el-tabs v-model="form.locale">
            <el-tab-pane v-for="item in locales" :key="item.value" :label="item.label" :name="item.value">
              <el-input v-model="form.localizedBodies[item.value]" type="textarea" :rows="6" maxlength="4000" show-word-limit />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form-item>
      <el-form-item v-if="publishMode === 'single'" label="关联业务类型"><el-select v-model="form.subjectType" clearable><el-option v-for="item in subjectTypes" :key="item.value" v-bind="item" /></el-select></el-form-item>
      <el-form-item v-if="publishMode === 'single' && form.subjectType" label="关联业务"><el-select v-model="form.subjectId" filterable remote :remote-method="searchSubjects" placeholder="搜索该用户的资料、活动或服务记录"><el-option v-for="item in subjects" :key="item.id" :label="`${item.label} (${item.id})`" :value="item.id" /></el-select></el-form-item>
      <el-form-item><el-button icon="View" :loading="previewing" @click="preview">预览</el-button><el-button type="primary" icon="Promotion" :loading="sending" @click="send">确认发送</el-button></el-form-item>
    </el-form>
    <section class="preview-panel">
      <h3>发送预览</h3>
      <template v-if="previewData">
        <el-descriptions v-if="publishMode === 'broadcast'" :column="2" border><el-descriptions-item label="预计人数">{{ previewData.targetCount }}</el-descriptions-item><el-descriptions-item label="样例用户">{{ previewData.sampleUsers?.map((item: InboxUser) => item.accountName).join('、') || '-' }}</el-descriptions-item></el-descriptions>
        <div class="message-preview">{{ (previewData.message || previewData).body }}</div>
      </template>
      <el-empty v-else description="填写内容后预览" :image-size="72" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'
import { getEnabledInboxTemplates, previewInboxBroadcast, previewInboxMessage, searchInboxSubjects, searchInboxUsers, sendInboxBroadcast, sendInboxMessage, type InboxSubject, type InboxTemplate, type InboxUser } from '@/api/cupid/inbox'
import useUserStore from '@/store/modules/user'
const proxy = getCurrentInstance()?.proxy as any
const userStore = useUserStore()
const hasPermission = (permission: string) => userStore.permissions.includes('*:*:*') || userStore.permissions.includes(permission)
const canBroadcast = computed(() => hasPermission('cupid:inbox:broadcast'))
const canSend = computed(() => hasPermission('cupid:inbox:send'))
const publishModeOptions = computed(() => [
  ...(canBroadcast.value ? [{ label: '群发', value: 'broadcast' as const }] : []),
  ...(canSend.value ? [{ label: '定向通知', value: 'single' as const }] : [])
])
const publishMode = ref<'single' | 'broadcast'>(canBroadcast.value ? 'broadcast' : 'single'), userLoading = ref(false), previewing = ref(false), sending = ref(false)
const users = ref<InboxUser[]>([]), templates = ref<InboxTemplate[]>([]), previewData = ref<any>()
const subjects = ref<InboxSubject[]>([])
const membershipTiers = computed(() => optionsForGroup('membership.tier'))
const subjectTypes = computed(() => optionsForGroup('message.subjectType').filter(item => !['system', 'legal_document'].includes(item.value)))
const variableLabels: Record<string, string> = { profileName: '资料名称', eventTitle: '活动名称', status: '状态', reason: '原因', verificationType: '认证类型', accountName: '用户名称' }
const locales = [{ label: '中文', value: 'zh' }, { label: 'Français', value: 'fr' }, { label: 'English', value: 'en' }] as const
const form = reactive({ userId: '', userIds: [] as string[], scope: 'all_active', tier: '', mode: 'template', templateCode: '', locale: 'zh', variables: {} as Record<string, string>, localizedBodies: { zh: '', fr: '', en: '' } as Record<'zh' | 'fr' | 'en', string>, subjectType: '', subjectId: '' })
const selectedTemplate = computed(() => templates.value.find(item => item.templateCode === form.templateCode))
const availableTemplates = computed(() => publishMode.value === 'broadcast' ? templates.value.filter(item => !item.subjectType) : templates.value)
const activeVariables = computed(() => { const field = selectedTemplate.value?.localizedFields?.find(item => item.locale === form.locale); return [...new Set(Array.from(field?.body.matchAll(/\{\{([A-Za-z][A-Za-z0-9]*)}}/g) || []).map(match => match[1]))] })
function templateName(item: InboxTemplate) { return item.localizedFields?.find(field => field.locale === 'zh')?.name || item.templateCode }
function payload() { return { ...form, subjectType: selectedTemplate.value?.subjectType || form.subjectType } }
async function searchUsers(keyword: string) { userLoading.value = true; try { users.value = (await searchInboxUsers(keyword)).data || [] } finally { userLoading.value = false } }
async function searchSubjects(keyword: string) { if (!form.userId || !form.subjectType) { subjects.value = []; return }; subjects.value = (await searchInboxSubjects(form.userId, form.subjectType, keyword)).data || [] }
function selectTemplate() { const type = selectedTemplate.value?.subjectType; if (type) form.subjectType = type; previewData.value = undefined }
async function preview() { previewing.value = true; try { previewData.value = publishMode.value === 'single' ? (await previewInboxMessage(payload())).data : (await previewInboxBroadcast(payload())).data } finally { previewing.value = false } }
async function send() { await proxy?.$modal.confirm(`确认${publishMode.value === 'single' ? '发送通知' : '执行群发'}吗？`); sending.value = true; try { const res = publishMode.value === 'single' ? await sendInboxMessage(payload()) : await sendInboxBroadcast(payload()); proxy?.$modal.msgSuccess(publishMode.value === 'single' ? '发送成功' : `群发完成：成功 ${res.data?.successCount || 0}，失败 ${res.data?.failureCount || 0}`) } finally { sending.value = false } }
onMounted(async () => { await loadCupidCommonOptions('zh'); templates.value = (await getEnabledInboxTemplates()).data || []; form.templateCode = availableTemplates.value[0]?.templateCode || ''; await searchUsers('') })
watch(publishMode, () => { if (!availableTemplates.value.some(item => item.templateCode === form.templateCode)) form.templateCode = availableTemplates.value[0]?.templateCode || ''; previewData.value = undefined })
watch(() => form.userId, (userId) => { const user = users.value.find(item => item.id === userId); if (user?.preferredLocale === 'zh' || user?.preferredLocale === 'fr' || user?.preferredLocale === 'en') form.locale = user.preferredLocale })
watch(() => [form.userId, form.subjectType], () => { form.subjectId = ''; void searchSubjects('') })
</script>

<style scoped>
.inbox-page{display:grid;grid-template-columns:minmax(520px,720px) minmax(360px,1fr);gap:24px}.publish-form,.preview-panel{min-width:0}.publish-form :deep(.el-select),.localized-editor{width:100%}.preview-panel{border-left:1px solid var(--el-border-color);padding-left:24px}.preview-panel h3{margin:0 0 18px}.message-preview{margin-top:16px;padding:18px;border:1px solid var(--el-border-color);white-space:pre-wrap;line-height:1.7}@media(max-width:1100px){.inbox-page{grid-template-columns:1fr}.preview-panel{border-left:0;padding-left:0}}
</style>
