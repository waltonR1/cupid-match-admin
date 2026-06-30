<template>
  <div class="app-container">
    <el-form v-show="showSearch" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="关键词">
        <el-input
          v-model="queryParams.keyword"
          placeholder="对象ID / 跟进说明 / 负责人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="queryParams.subjectType" placeholder="全部" clearable style="width: 180px">
          <el-option v-for="item in subjectTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="queryParams.priority" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="item in priorities" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人">
        <el-select
          v-model="queryParams.assigneeSysUserId"
          placeholder="全部"
          clearable
          filterable
          style="width: 180px"
        >
          <el-option
            v-for="item in assignees"
            :key="item.userId"
            :label="assigneeLabel(item)"
            :value="String(item.userId)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openCreateDialog" v-hasPermi="['cupid:staffTask:add']">
          新增事项
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="事项ID" min-width="220" prop="id" />
      <el-table-column label="对象" min-width="220">
        <template #default="{ row }">
          <div class="primary-text">{{ subjectTypeLabel(row.subjectType) }}</div>
          <div class="muted">{{ row.subjectId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="跟进说明" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">{{ row.noteZh || row.noteFr || row.noteEn || '-' }}</template>
      </el-table-column>
      <el-table-column label="负责人" min-width="160">
        <template #default="{ row }">{{ row.assigneeNickName || row.assigneeUserName || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="100">
        <template #default="{ row }">
          <el-tag :type="priorityTagType(row.priority)">{{ priorityLabel(row.priority) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="截止时间" width="170">
        <template #default="{ row }">{{ parseTime(row.dueAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ parseTime(row.updatedAt) || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)" v-hasPermi="['cupid:staffTask:query']">
            详情
          </el-button>
          <el-button link type="success" @click="openEditDialog(row.id)" v-hasPermi="['cupid:staffTask:edit']">
            处理
          </el-button>
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

    <el-drawer v-model="detailOpen" title="跟进事项详情" size="760px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事项ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="负责人">
            {{ detail.assigneeNickName || detail.assigneeUserName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="对象类型">{{ subjectTypeLabel(detail.subjectType) }}</el-descriptions-item>
          <el-descriptions-item label="对象ID">{{ detail.subjectId }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ priorityLabel(detail.priority) }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ parseTime(detail.dueAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ parseTime(detail.completedAt) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="说明(zh)" :span="2">{{ detail.noteZh || '-' }}</el-descriptions-item>
          <el-descriptions-item label="说明(fr)" :span="2">{{ detail.noteFr || '-' }}</el-descriptions-item>
          <el-descriptions-item label="说明(en)" :span="2">{{ detail.noteEn || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>

    <el-dialog
      v-model="dialogOpen"
      :title="dialogMode === 'create' ? '新增跟进事项' : '处理跟进事项'"
      width="620px"
      append-to-body
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="对象类型" required>
          <el-select v-model="form.subjectType" :disabled="dialogMode === 'edit'" style="width: 100%">
            <el-option v-for="item in subjectTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象ID" required>
          <el-input
            v-model="form.subjectId"
            :disabled="dialogMode === 'edit'"
            placeholder="请输入业务对象ID"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="form.assigneeSysUserId" :disabled="!canManage" clearable filterable style="width: 100%">
            <el-option v-for="item in assignees" :key="item.userId" :label="assigneeLabel(item)" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-select v-model="form.priority" :disabled="!canManage" style="width: 100%">
            <el-option v-for="item in priorities" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="form.dueAt"
            :disabled="!canManage"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-alert
          v-if="!canManage"
          type="info"
          :closable="false"
          title="你只能处理自己负责的事项，不能修改负责人、优先级和截止时间。"
          class="mb16"
        />
        <el-form-item label="说明(zh)" required>
          <el-input
            v-model="form.noteZh"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请填写中文跟进说明"
          />
        </el-form-item>
        <el-form-item label="说明(fr)">
          <el-input v-model="form.noteFr" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="说明(en)">
          <el-input v-model="form.noteEn" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  createCupidStaffTask,
  editCupidStaffTask,
  getCupidStaffTaskDetail,
  listCupidStaffTaskAssignees,
  listCupidStaffTasks,
  type CupidAdminStaffTaskAssignee,
  type CupidAdminStaffTaskDetail,
  type CupidAdminStaffTaskListItem
} from '@/api/cupid/staff-task'

const proxy = getCurrentInstance()?.proxy as any
const showSearch = ref(true)
const loading = ref(false)
const rows = ref<CupidAdminStaffTaskListItem[]>([])
const total = ref(0)
const assignees = ref<CupidAdminStaffTaskAssignee[]>([])

const canManage = computed(() => proxy?.$auth?.hasPermi?.('cupid:staffTask:add') ?? false)

const subjectTypes = [
  { label: '用户', value: 'user' },
  { label: '资料', value: 'profile' },
  { label: '私介申请', value: 'private_introduction_request' },
  { label: '活动', value: 'event' }
]
const statuses = [
  { label: '待跟进', value: 'open' },
  { label: '已完成', value: 'done' },
  { label: '暂缓', value: 'snoozed' }
]
const priorities = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' }
]

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  subjectType: '',
  status: '',
  priority: '',
  assigneeSysUserId: ''
})

const detailOpen = ref(false)
const detail = ref<CupidAdminStaffTaskDetail>()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingId = ref('')
const form = reactive({
  subjectType: 'profile',
  subjectId: '',
  assigneeSysUserId: undefined as number | undefined,
  status: 'open',
  priority: 'normal',
  dueAt: '',
  noteZh: '',
  noteFr: '',
  noteEn: ''
})

function assigneeLabel(item: CupidAdminStaffTaskAssignee) {
  return item.nickName ? `${item.nickName} (${item.userName})` : item.userName
}

function subjectTypeLabel(value?: string) {
  return subjectTypes.find(item => item.value === value)?.label || value || '-'
}

function statusLabel(value?: string) {
  return statuses.find(item => item.value === value)?.label || value || '-'
}

function priorityLabel(value?: string) {
  return priorities.find(item => item.value === value)?.label || value || '-'
}

function statusTagType(value?: string) {
  if (value === 'done') return 'success'
  if (value === 'snoozed') return 'warning'
  return 'info'
}

function priorityTagType(value?: string) {
  if (value === 'high') return 'danger'
  if (value === 'normal') return 'warning'
  return 'info'
}

async function loadAssignees() {
  assignees.value = (await listCupidStaffTaskAssignees()).data || []
}

async function getList() {
  loading.value = true
  try {
    const res = await listCupidStaffTasks({ ...queryParams })
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
  queryParams.subjectType = ''
  queryParams.status = ''
  queryParams.priority = ''
  queryParams.assigneeSysUserId = ''
  void getList()
}

async function openDetail(id: string) {
  detail.value = (await getCupidStaffTaskDetail(id)).data
  detailOpen.value = true
}

function resetForm() {
  form.subjectType = 'profile'
  form.subjectId = ''
  form.assigneeSysUserId = undefined
  form.status = 'open'
  form.priority = 'normal'
  form.dueAt = ''
  form.noteZh = ''
  form.noteFr = ''
  form.noteEn = ''
}

function openCreateDialog() {
  dialogMode.value = 'create'
  editingId.value = ''
  resetForm()
  dialogOpen.value = true
}

async function openEditDialog(id: string) {
  const res = await getCupidStaffTaskDetail(id)
  const task = res.data
  if (!task) return
  dialogMode.value = 'edit'
  editingId.value = id
  form.subjectType = task.subjectType
  form.subjectId = task.subjectId
  form.assigneeSysUserId = task.assigneeSysUserId
  form.status = task.status
  form.priority = task.priority
  form.dueAt = task.dueAt || ''
  form.noteZh = task.noteZh || ''
  form.noteFr = task.noteFr || ''
  form.noteEn = task.noteEn || ''
  dialogOpen.value = true
}

async function submitForm() {
  if (!form.subjectType || !form.subjectId.trim()) {
    proxy?.$modal.msgWarning('请填写完整事项对象')
    return
  }
  if (!form.noteZh.trim() && !form.noteFr.trim() && !form.noteEn.trim()) {
    proxy?.$modal.msgWarning('请至少填写一种语言的跟进说明')
    return
  }
  const payload = {
    subjectType: form.subjectType,
    subjectId: form.subjectId.trim(),
    assigneeSysUserId: form.assigneeSysUserId,
    status: form.status,
    priority: form.priority,
    dueAt: form.dueAt || undefined,
    noteZh: form.noteZh.trim() || undefined,
    noteFr: form.noteFr.trim() || undefined,
    noteEn: form.noteEn.trim() || undefined
  }
  if (dialogMode.value === 'create') {
    await createCupidStaffTask(payload)
    proxy?.$modal.msgSuccess('跟进事项已创建')
  } else {
    await editCupidStaffTask(editingId.value, payload)
    proxy?.$modal.msgSuccess('跟进事项已更新')
  }
  dialogOpen.value = false
  if (detail.value?.id === editingId.value) {
    await openDetail(editingId.value)
  }
  await getList()
}

onMounted(async () => {
  await loadAssignees()
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

.mb16 {
  margin-bottom: 16px;
}
</style>
