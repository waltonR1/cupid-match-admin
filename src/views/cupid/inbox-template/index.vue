<template>
  <div class="app-container">
    <el-form :inline="true" :model="query" class="query-form">
      <el-form-item label="模板 Code"><el-input v-model="query.templateCode" clearable /></el-form-item>
      <el-form-item label="消息类型"><el-select v-model="query.messageType" clearable><el-option v-for="item in messageTypes" :key="item.value" v-bind="item" /></el-select></el-form-item>
      <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option v-for="item in statuses" :key="item.value" v-bind="item" /></el-select></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="load">搜索</el-button><el-button icon="Refresh" @click="reset">重置</el-button></el-form-item>
    </el-form>
    <el-button type="primary" plain icon="Plus" class="toolbar-button" @click="openCreate" v-hasPermi="['cupid:inboxTemplate:add']">新增模板</el-button>
    <el-table v-loading="loading" :data="rows">
      <el-table-column label="Code" prop="templateCode" min-width="210" />
      <el-table-column label="消息类型" width="130"><template #default="{ row }">{{ labelOf('inbox.messageType', row.messageType) }}</template></el-table-column>
      <el-table-column label="业务对象" width="170"><template #default="{ row }">{{ labelOf('message.subjectType', row.subjectType) || '-' }}</template></el-table-column>
      <el-table-column label="三语完整度" width="110"><template #default="{ row }">{{ row.localeCount || 0 }}/3</template></el-table-column>
      <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'enabled' ? 'success' : 'info'">{{ labelOf('inbox.templateStatus', row.status) }}</el-tag></template></el-table-column>
      <el-table-column label="更新时间" width="170"><template #default="{ row }">{{ parseTime(row.updatedAt) }}</template></el-table-column>
      <el-table-column label="操作" width="180" fixed="right"><template #default="{ row }">
        <el-button link type="primary" @click="openEdit(row)" v-hasPermi="['cupid:inboxTemplate:edit']">编辑</el-button>
        <el-button link :type="row.status === 'enabled' ? 'warning' : 'success'" @click="toggle(row)" v-hasPermi="['cupid:inboxTemplate:changeStatus']">{{ row.status === 'enabled' ? '停用' : '启用' }}</el-button>
      </template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" />
    <el-dialog v-model="dialogOpen" :title="editingId ? '编辑通知模板' : '新增通知模板'" width="760px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板 Code" prop="templateCode"><el-input v-model="form.templateCode" :disabled="!!editingId" placeholder="例如 membership_expired" /></el-form-item>
        <el-form-item label="消息类型" prop="messageType"><el-select v-model="form.messageType"><el-option v-for="item in messageTypes" :key="item.value" v-bind="item" /></el-select></el-form-item>
        <el-form-item label="关联业务类型"><el-select v-model="form.subjectType" clearable><el-option v-for="item in subjectTypes" :key="item.value" v-bind="item" /></el-select></el-form-item>
        <el-form-item label="点击动作"><el-select v-model="form.actionType" clearable><el-option v-for="item in actionTypes" :key="item.value" v-bind="item" /></el-select></el-form-item>
        <el-tabs v-model="activeLocale">
          <el-tab-pane v-for="(field, index) in form.localizedFields" :key="field.locale" :label="localeNames[field.locale]" :name="field.locale">
            <el-form-item label="后台名称" :prop="`localizedFields.${index}.name`" :rules="requiredRule"><el-input v-model="field.name" maxlength="120" /></el-form-item>
            <el-form-item label="通知正文" :prop="`localizedFields.${index}.body`" :rules="requiredRule"><el-input v-model="field.body" type="textarea" :rows="5" maxlength="4000" show-word-limit /></el-form-item>
          </el-tab-pane>
        </el-tabs>
        <el-alert type="info" :closable="false" title="可用变量：profileName、eventTitle、status、reason、verificationType、accountName、code、ttlMinutes、purpose" />
      </el-form>
      <template #footer><el-button @click="dialogOpen = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">确认</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import { loadCupidCommonOptions, optionsForGroup } from '@/views/cupid/review-utils'
import { addInboxTemplate, changeInboxTemplateStatus, getInboxTemplate, listInboxTemplates, updateInboxTemplate, type InboxTemplate } from '@/api/cupid/inbox'
const proxy = getCurrentInstance()?.proxy as any
const messageTypes = computed(() => optionsForGroup('inbox.messageType'))
const statuses = computed(() => optionsForGroup('inbox.templateStatus'))
const subjectTypes = computed(() => optionsForGroup('message.subjectType').filter(item => !['system', 'legal_document'].includes(item.value)))
const actionBySubject: Record<string, string> = { profile: 'view_profile', event: 'view_event', private_introduction_request: 'view_introduction', membership: 'view_membership' }
const localeNames = { zh: '中文', fr: 'Français', en: 'English' }
const requiredRule = { required: true, message: '该字段不能为空', trigger: 'blur' }
const loading = ref(false), saving = ref(false), dialogOpen = ref(false)
const activeLocale = ref('zh'), editingId = ref(''), total = ref(0), rows = ref<InboxTemplate[]>([]), formRef = ref<any>()
const query = reactive({ pageNum: 1, pageSize: 10, templateCode: '', messageType: '', status: '' })
const emptyFields = () => (['zh', 'fr', 'en'] as const).map(locale => ({ locale, name: '', body: '' }))
const form = reactive({ templateCode: '', messageType: 'system_notice', subjectType: '', actionType: '', localizedFields: emptyFields() })
const actionTypes = computed(() => optionsForGroup('inbox.actionType').filter(item => item.value === actionBySubject[form.subjectType]))
const rules = { templateCode: [requiredRule], messageType: [requiredRule] }
function labelOf(group: string, value?: string) { return value ? optionsForGroup(group).find(item => item.value === value)?.label || value : '' }
async function load() { loading.value = true; try { const res = await listInboxTemplates(query); rows.value = res.rows || []; total.value = res.total || 0 } finally { loading.value = false } }
function resetForm() { editingId.value = ''; Object.assign(form, { templateCode: '', messageType: 'system_notice', subjectType: '', actionType: '', localizedFields: emptyFields() }); activeLocale.value = 'zh' }
function openCreate() { resetForm(); dialogOpen.value = true }
async function openEdit(row: InboxTemplate) { const res = await getInboxTemplate(row.id); const data = res.data; if (!data) return; editingId.value = row.id; Object.assign(form, { templateCode: data.templateCode, messageType: data.messageType, subjectType: data.subjectType || '', actionType: data.actionType || '', localizedFields: data.localizedFields || emptyFields() }); dialogOpen.value = true }
async function save() { if (!await formRef.value?.validate()) return; saving.value = true; try { editingId.value ? await updateInboxTemplate(editingId.value, form) : await addInboxTemplate(form); proxy?.$modal.msgSuccess('保存成功'); dialogOpen.value = false; await load() } finally { saving.value = false } }
async function toggle(row: InboxTemplate) { await changeInboxTemplateStatus(row.id, row.status === 'enabled' ? 'disabled' : 'enabled'); await load() }
function reset() { Object.assign(query, { pageNum: 1, templateCode: '', messageType: '', status: '' }); load() }
onMounted(async () => { await loadCupidCommonOptions('zh'); await load() })
watch(() => form.subjectType, () => { if (form.actionType !== actionBySubject[form.subjectType]) form.actionType = '' })
</script>
<style scoped>.query-form{margin-bottom:12px}.toolbar-button{margin-bottom:12px}</style>
