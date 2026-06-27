<template>
  <div class="app-container">
    <el-form ref="queryRef" class="review-query-form" :model="queryParams" :inline="true" v-show="showSearch" label-width="72px">
      <el-form-item class="review-query-name" label="活动" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="活动标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item class="review-query-select" label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="活动状态" clearable>
          <el-option v-for="item in optionsOf(eventStatuses)" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-select" label="城市" prop="city">
        <el-select v-model="queryParams.city" placeholder="城市" clearable>
          <el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-date" label="日期">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item class="review-query-select review-query-sort" label="排序" prop="sortBy">
        <el-select v-model="queryParams.sortBy" placeholder="排序方式">
          <el-option v-for="item in eventSortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="review-query-actions">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openCreateDialog" v-hasPermi="['cupid:event:add']">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="活动" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="row-title">{{ row.title || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="eventStatusTagType(row.status)" effect="plain">{{ labelOf(eventStatuses, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可见范围" width="110">
        <template #default="{ row }">
          <el-tag :type="row.visibility === 'public' ? 'info' : 'warning'" effect="plain">{{ labelOf(eventVisibilityOptions, row.visibility) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="城市" width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ labelOf(cityOptionGroup, row.cityCode) }}</template>
      </el-table-column>
      <el-table-column label="日期" width="120">
        <template #default="{ row }">{{ parseTime(row.eventDate, '{y}-{m}-{d}') }}</template>
      </el-table-column>
      <el-table-column label="时段" width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.startTime }} – {{ row.endTime }}</template>
      </el-table-column>
      <el-table-column label="名额" width="80" align="center">
        <template #default="{ row }">{{ row.occupiedCount ?? row.registeredCount ?? '-' }} / {{ row.capacity }}</template>
      </el-table-column>
      <el-table-column label="操作" width="270" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="View" @click="openDetail(row.id)" v-hasPermi="['cupid:event:query']">详情</el-button>
          <el-button link type="primary" icon="Tickets" @click="openRegistrations(row)" v-hasPermi="['cupid:eventRegistration:list']">报名</el-button>
          <el-button v-if="row.status === 'draft'" link type="primary" icon="EditPen" @click="openEditDialog(row)" v-hasPermi="['cupid:event:edit']">编辑</el-button>
          <el-button v-if="row.status !== 'draft'" link type="primary" icon="Edit" @click="openStatusDialog(row)" v-hasPermi="['cupid:event:changeStatus']">状态</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-drawer v-model="detailOpen" title="活动详情" size="680px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="活动ID" :span="2">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detail.title || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="eventStatusTagType(detail.status)" effect="plain">{{ labelOf(eventStatuses, detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="可见范围">{{ labelOf(eventVisibilityOptions, detail.visibility) }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ labelOf(cityOptionGroup, detail.cityCode) }}</el-descriptions-item>
        <el-descriptions-item label="活动语言">{{ labelsOf(languageOptions, detail.languageCodes || []) }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ parseTime(detail.eventDate, '{y}-{m}-{d}') }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ detail.startTime }} – {{ detail.endTime }}</el-descriptions-item>
        <el-descriptions-item label="名额">{{ detail.occupiedCount ?? '-' }} / {{ detail.capacity }}</el-descriptions-item>
        <el-descriptions-item label="已确认">{{ detail.confirmedCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="已出席">{{ detail.attendedCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="候补">{{ detail.waitlistCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="占用活动额度">{{ detail.consumesMembershipQuota != null && detail.consumesMembershipQuota !== 0 ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="地址可见性">{{ labelOf(eventAddressVisibilityOptions, detail.addressVisibility) }}</el-descriptions-item>
        <el-descriptions-item label="活动说明" :span="2">{{ detail.summary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="场地">{{ detail.venue || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ detail.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="活动形式">{{ detail.format || '-' }}</el-descriptions-item>
        <el-descriptions-item label="适合人群">{{ detail.audience || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关系主题" :span="2">{{ Array.isArray(detail.relationshipFocus) && detail.relationshipFocus.length ? detail.relationshipFocus.join(' / ') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ parseTime(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ parseTime(detail.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
      <el-table v-if="detail?.noteItems?.length" class="mt16" :data="detail.noteItems" size="small">
        <el-table-column label="说明标题" prop="title" width="180" show-overflow-tooltip />
        <el-table-column label="说明内容" prop="description" show-overflow-tooltip />
      </el-table>
      <el-table v-if="detail?.agendaItems?.length" class="mt16" :data="detail.agendaItems" size="small">
        <el-table-column label="时间" prop="time" width="120" />
        <el-table-column label="流程" prop="title" width="180" show-overflow-tooltip />
        <el-table-column label="说明" prop="description" show-overflow-tooltip />
      </el-table>
    </el-drawer>

    <el-dialog v-model="createOpen" :title="eventDialogTitle" width="760px">
      <el-form :model="createForm" label-width="110px">
        <el-form-item label="活动标题">
          <el-input v-model="createForm.title" placeholder="用于后台和 C 端展示" />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="createForm.status" placeholder="活动状态">
            <el-option v-for="item in optionsOf(eventWritableStatuses)" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见范围">
          <el-select v-model="createForm.visibility" placeholder="可见范围">
            <el-option v-for="item in optionsOf(eventVisibilityOptions)" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="createForm.cityCode" placeholder="城市" filterable>
            <el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动语言">
          <el-select v-model="createForm.languageCodes" multiple placeholder="活动语言">
            <el-option v-for="item in optionsOf(languageOptions)" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址可见性">
          <el-select v-model="createForm.addressVisibility" placeholder="地址可见性">
            <el-option v-for="item in optionsOf(eventAddressVisibilityOptions)" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动日期">
          <el-date-picker v-model="createForm.eventDate" value-format="YYYY-MM-DD" type="date" placeholder="活动日期" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="createForm.startTime" value-format="HH:mm" format="HH:mm" placeholder="开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="createForm.endTime" value-format="HH:mm" format="HH:mm" placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="活动名额">
          <el-input-number v-model="createForm.capacity" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="占用活动额度">
          <el-switch v-model="createForm.consumesMembershipQuota" />
        </el-form-item>
        <el-form-item label="活动封面">
          <el-upload :show-file-list="false" :http-request="uploadCover" accept=".jpg,.jpeg,.png,.webp">
            <el-button icon="Upload">上传封面</el-button>
          </el-upload>
          <el-image v-if="createForm.coverImageUrl" class="cover-preview" :src="createForm.coverImageUrl" fit="cover" />
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="createForm.summary" type="textarea" :rows="3" placeholder="展示在 C 端活动卡片和详情中" />
        </el-form-item>
        <el-form-item label="场地">
          <el-input v-model="createForm.venue" placeholder="例如 左岸私享沙龙" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="createForm.address" placeholder="根据地址可见性控制展示" />
        </el-form-item>
        <el-form-item label="活动形式">
          <el-input v-model="createForm.format" placeholder="例如 12人主题沙龙" />
        </el-form-item>
        <el-form-item label="适合人群">
          <el-input v-model="createForm.audience" placeholder="例如 适合希望稳定发展的会员" />
        </el-form-item>
        <el-form-item label="关系主题">
          <el-input v-model="relationshipFocusText" type="textarea" :rows="3" placeholder="每行一条，例如：跨文化沟通" />
        </el-form-item>
        <el-form-item label="活动说明">
          <div class="agenda-editor">
            <div v-for="(item, index) in createForm.noteItems" :key="index" class="agenda-row">
              <el-input v-model="item.title" class="note-title" placeholder="说明标题" />
              <el-input v-model="item.description" class="agenda-desc" placeholder="说明内容" />
              <el-button link type="danger" icon="Delete" @click="removeNoteItem(index)">删除</el-button>
            </div>
            <el-button plain icon="Plus" @click="addNoteItem">新增说明</el-button>
          </div>
        </el-form-item>
        <el-form-item label="活动流程">
          <div class="agenda-editor">
            <div v-for="(item, index) in createForm.agendaItems" :key="index" class="agenda-row">
              <el-time-picker
                v-model="item.time"
                class="agenda-time"
                value-format="HH:mm"
                format="HH:mm"
                placeholder="时间"
              />
              <el-input v-model="item.title" class="agenda-title" placeholder="流程标题" />
              <el-input v-model="item.description" class="agenda-desc" placeholder="流程说明" />
              <el-button link type="danger" icon="Delete" @click="removeAgendaItem(index)">删除</el-button>
            </div>
            <el-button plain icon="Plus" @click="addAgendaItem">新增流程</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createOpen = false">取消</el-button>
        <el-button type="primary" :loading="createSubmitting" @click="submitCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogOpen" title="变更活动状态" width="460px">
      <el-form v-if="statusTarget" label-width="100px">
        <el-form-item label="活动">
          <span>{{ statusTarget.title || '-' }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="eventStatusTagType(statusTarget.status)" effect="plain">{{ labelOf(eventStatuses, statusTarget.status) }}</el-tag>
        </el-form-item>
        <el-form-item label="目标状态" prop="targetStatus">
          <el-select v-model="targetStatus" placeholder="请选择目标状态">
            <el-option v-for="item in allowedTransitions(statusTarget.status)" :key="item" :label="labelOf(eventStatuses, item)" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因" prop="reason">
          <el-input v-model="statusReason" type="textarea" placeholder="变更原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="statusSubmitting" @click="submitStatusChange">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  listAdminEvents,
  getAdminEvent,
  createAdminEvent,
  updateAdminEvent,
  changeEventStatus,
  uploadCommonFile,
  type EventCreatePayload,
  type EventStatusPayload
} from '@/api/cupid/review'
import {
  eventStatuses,
  eventVisibilityOptions,
  eventAddressVisibilityOptions,
  eventSortOptions,
  labelOf,
  labelsOf,
  languageOptions,
  optionsForGroup,
  optionsOf
} from '@/views/cupid/review-utils'
import { loadCupidCommonOptions } from '@/views/cupid/review-utils'

const showSearch = ref(true)
const router = useRouter()
const loading = ref(false)
const total = ref(0)
const rows = ref<any[]>([])
const queryParams = ref<Record<string, any>>({ pageNum: 1, pageSize: 10 })
const dateRange = ref<[string, string] | null>(null)

const detailOpen = ref(false)
const detail = ref<any>(null)

const statusDialogOpen = ref(false)
const statusTarget = ref<any>(null)
const targetStatus = ref('')
const statusReason = ref('')
const statusSubmitting = ref(false)

const cityOptionGroup = { group: 'profile.city', values: [] as string[] }
const cityOptions = ref<Array<{ label: string; value: string }>>([])
const eventWritableStatuses = { group: 'event.status', values: ['draft', 'open'] }

const createOpen = ref(false)
const createSubmitting = ref(false)
const editingEventId = ref('')
const createForm = ref<EventCreatePayload>(defaultCreateForm())
const relationshipFocusText = ref('')

const eventDialogTitle = computed(() => editingEventId.value ? '编辑活动' : '新增活动')

onMounted(async () => {
  await loadCupidCommonOptions()
  cityOptions.value = optionsForGroup('profile.city')
  getList()
})

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = null
  queryParams.value = {}
  getList()
}

async function getList() {
  loading.value = true
  try {
    const params = { ...queryParams.value }
    if (dateRange.value) {
      params.dateFrom = dateRange.value[0]
      params.dateTo = dateRange.value[1]
    }
    const res = await listAdminEvents(params)
    rows.value = res.rows ?? []
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  const res = await getAdminEvent(id)
  detail.value = res.data
  detailOpen.value = true
}

function openStatusDialog(row: any) {
  statusTarget.value = row
  targetStatus.value = ''
  statusReason.value = ''
  statusDialogOpen.value = true
}

function openRegistrations(row: any) {
  router.push({
    path: '/cupid-event/registration',
    query: { eventId: row.id }
  })
}

function defaultCreateForm(): EventCreatePayload {
  return {
    title: '',
    status: 'draft',
    visibility: 'registered',
    consumesMembershipQuota: false,
    cityCode: '',
    languageCodes: [],
    addressVisibility: 'registered_only',
    eventDate: '',
    startTime: '',
    endTime: '',
    capacity: 12,
    coverImageUrl: '',
    summary: '',
    venue: '',
    address: '',
    format: '',
    audience: '',
    noteItems: [],
    agendaItems: []
  }
}

function openCreateDialog() {
  editingEventId.value = ''
  createForm.value = defaultCreateForm()
  relationshipFocusText.value = ''
  createOpen.value = true
}

async function openEditDialog(row: any) {
  const res = await getAdminEvent(row.id)
  const data = res.data || {}
  editingEventId.value = row.id
  createForm.value = {
    title: data.title || '',
    status: data.status || 'draft',
    visibility: data.visibility || 'registered',
    consumesMembershipQuota: Boolean(data.consumesMembershipQuota),
    cityCode: data.cityCode || '',
    languageCodes: Array.isArray(data.languageCodes) ? data.languageCodes : [],
    addressVisibility: data.addressVisibility || 'registered_only',
    eventDate: normalizeDate(data.eventDate),
    startTime: data.startTime || '',
    endTime: data.endTime || '',
    capacity: Number(data.capacity || 12),
    coverImageUrl: data.coverImageUrl || '',
    summary: data.summary || '',
    venue: data.venue || '',
    address: data.address || '',
    format: data.format || '',
    audience: data.audience || '',
    noteItems: Array.isArray(data.noteItems)
      ? data.noteItems.map((item: any) => ({
          title: item.title || '',
          description: item.description || ''
        }))
      : [],
    agendaItems: Array.isArray(data.agendaItems)
      ? data.agendaItems.map((item: any) => ({
          time: item.time || '',
          title: item.title || '',
          description: item.description || ''
        }))
      : []
  }
  relationshipFocusText.value = Array.isArray(data.relationshipFocus) ? data.relationshipFocus.join('\n') : ''
  createOpen.value = true
}

async function uploadCover(options: any) {
  const file = options.file as File
  if (!file) return
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    ElMessage.warning('仅支持 JPG、PNG、WEBP 图片')
    return
  }
  const formData = new FormData()
  formData.append('file', file)
  const res = await uploadCommonFile(formData)
  createForm.value.coverImageUrl = (res as any).url || (res as any).data?.url || ''
}

function addAgendaItem() {
  createForm.value.agendaItems = createForm.value.agendaItems || []
  createForm.value.agendaItems.push({ time: '', title: '', description: '' })
}

function removeAgendaItem(index: number) {
  createForm.value.agendaItems?.splice(index, 1)
}

function addNoteItem() {
  createForm.value.noteItems = createForm.value.noteItems || []
  createForm.value.noteItems.push({ title: '', description: '' })
}

function removeNoteItem(index: number) {
  createForm.value.noteItems?.splice(index, 1)
}

function normalizeDate(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function validateCreateForm() {
  const form = createForm.value
  if (!form.title || !form.cityCode || !form.eventDate || !form.startTime || !form.endTime || !form.capacity) {
    ElMessage.warning('请填写活动标题、城市、日期、时间和活动名额')
    return false
  }
  if (form.status === 'open') {
    const missingText = !form.coverImageUrl || !form.summary || !form.venue || !form.address || !form.format || !form.audience
    const missingLanguages = !Array.isArray(form.languageCodes) || form.languageCodes.length === 0
    const missingFocus = splitLines(relationshipFocusText.value).length === 0
    const hasCompleteNote = Array.isArray(form.noteItems)
      && form.noteItems.length > 0
      && form.noteItems.every((item) => item.title && item.description)
    const hasCompleteAgenda = Array.isArray(form.agendaItems)
      && form.agendaItems.length > 0
      && form.agendaItems.every((item) => item.time && item.title && item.description)
    if (missingText || missingLanguages || missingFocus || !hasCompleteNote || !hasCompleteAgenda) {
      ElMessage.warning('改为报名中前，请补齐封面、语言、说明、场地、地址、形式、人群、关系主题、活动说明和活动流程')
      return false
    }
  }
  return true
}

async function submitCreate() {
  if (!validateCreateForm()) return
  createSubmitting.value = true
  try {
    const payload: EventCreatePayload = {
      ...createForm.value,
      relationshipFocus: splitLines(relationshipFocusText.value)
    }
    if (editingEventId.value) {
      await updateAdminEvent(editingEventId.value, payload)
      ElMessage.success('活动已更新')
    } else {
      await createAdminEvent(payload)
      ElMessage.success('活动已创建')
    }
    createOpen.value = false
    getList()
  } finally {
    createSubmitting.value = false
  }
}

function allowedTransitions(currentStatus: string): string[] {
  if (currentStatus === 'draft') return ['open']
  if (currentStatus === 'open') return ['waitlist', 'closed', 'completed', 'hidden']
  if (currentStatus === 'waitlist') return ['closed', 'completed', 'hidden']
  if (currentStatus === 'closed') return ['open', 'completed', 'hidden']
  if (currentStatus === 'completed') return ['hidden']
  if (currentStatus === 'hidden') return ['open', 'waitlist', 'closed', 'completed']
  return []
}

async function submitStatusChange() {
  if (!statusTarget.value || !targetStatus.value) return
  if (!statusReason.value.trim()) {
    ElMessage.warning('请填写状态变更原因')
    return
  }
  statusSubmitting.value = true
  try {
    await changeEventStatus(statusTarget.value.id, {
      status: targetStatus.value,
      reason: statusReason.value
    } as EventStatusPayload)
    statusDialogOpen.value = false
    getList()
  } finally {
    statusSubmitting.value = false
  }
}

function eventStatusTagType(status: string) {
  if (status === 'open') return 'success'
  if (status === 'draft' || status === 'hidden') return 'info'
  if (status === 'completed') return ''
  return 'warning'
}
</script>

<style scoped>
.mt16 {
  margin-top: 16px;
}

.cover-preview {
  display: block;
  width: 160px;
  height: 90px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}

.agenda-editor {
  width: 100%;
}

.agenda-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.agenda-time {
  width: 110px;
  flex: none;
}

.agenda-title {
  width: 160px;
  flex: none;
}

.note-title {
  width: 180px;
  flex: none;
}

.agenda-desc {
  flex: 1;
}
</style>

