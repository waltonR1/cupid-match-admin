<template>
  <div class="app-container option-page">
    <div class="option-layout">
      <section class="group-panel">
        <div class="panel-header">
          <span>选项分组</span>
          <el-button icon="Refresh" text @click="loadGroups" />
        </div>
        <el-table
          v-loading="groupLoading"
          :data="groups"
          highlight-current-row
          height="calc(100vh - 190px)"
          @current-change="handleGroupChange"
        >
          <el-table-column label="分组" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="group-name">{{ row.groupName }}</div>
              <div class="muted">{{ row.groupKey }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="76">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="plain">
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="value-panel">
        <el-form class="option-query-form" :inline="true">
          <el-form-item label="当前分组">
            <el-input :model-value="currentGroup?.groupKey || '-'" readonly />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="loadValues">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" icon="Plus" @click="openCreate" v-hasPermi="['cupid:options:edit']">新增</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="valueLoading" :data="values" height="calc(100vh - 235px)">
          <el-table-column label="Code" prop="optionValue" width="180" show-overflow-tooltip />
          <el-table-column label="中文" prop="labelZh" min-width="140" show-overflow-tooltip />
          <el-table-column label="Français" prop="labelFr" min-width="150" show-overflow-tooltip />
          <el-table-column label="English" prop="labelEn" min-width="150" show-overflow-tooltip />
          <el-table-column label="排序" prop="sortOrder" width="80" />
          <el-table-column label="需补充" width="82">
            <template #default="{ row }">{{ Number(row.requiresExtraText) === 1 ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="plain">
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="170">
            <template #default="{ row }">{{ parseTime(row.updatedAt) || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" icon="Edit" @click="openEdit(row)" v-hasPermi="['cupid:options:edit']">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <el-dialog v-model="editOpen" :title="editing ? '编辑选项' : '新增选项'" width="560px" append-to-body>
      <el-form ref="editRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="分组" prop="groupKey">
          <div class="readonly-display">
            <span>{{ form.groupKey }}</span>
            <span class="muted">{{ currentGroup?.groupName || editing?.groupName || '' }}</span>
          </div>
        </el-form-item>
        <el-form-item label="Code" prop="optionValue">
          <div v-if="editing" class="readonly-display">{{ form.optionValue }}</div>
          <el-input v-else v-model="form.optionValue" maxlength="80" placeholder="例如 technology 或 FR:paris" />
        </el-form-item>
        <el-form-item label="中文" prop="labelZh">
          <el-input v-model="form.labelZh" maxlength="200" />
        </el-form-item>
        <el-form-item label="Français" prop="labelFr">
          <el-input v-model="form.labelFr" maxlength="200" />
        </el-form-item>
        <el-form-item label="English" prop="labelEn">
          <el-input v-model="form.labelEn" maxlength="200" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item label="需要补充">
          <el-switch v-model="form.requiresExtraText" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editOpen = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { parseTime } from '@/utils/ruoyi'
import {
  createCupidOptionValue,
  listCupidOptionGroups,
  listCupidOptionValues,
  updateCupidOptionValue,
  type CupidOptionGroupRow,
  type CupidOptionValueRow
} from '@/api/cupid/options'

const proxy = getCurrentInstance()?.proxy as any

const groupLoading = ref(false)
const valueLoading = ref(false)
const saving = ref(false)
const groups = ref<CupidOptionGroupRow[]>([])
const values = ref<CupidOptionValueRow[]>([])
const currentGroup = ref<CupidOptionGroupRow>()
const editOpen = ref(false)
const editing = ref<CupidOptionValueRow>()
const editRef = ref<FormInstance>()

const form = reactive({
  groupKey: '',
  optionValue: '',
  labelZh: '',
  labelFr: '',
  labelEn: '',
  sortOrder: 0,
  requiresExtraText: false,
  status: 'enabled' as 'enabled' | 'disabled'
})

const rules: FormRules = {
  groupKey: [{ required: true, message: '请选择分组', trigger: 'change' }],
  optionValue: [
    { required: true, message: '请输入选项 code', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9:_-]+$/, message: '只能包含字母、数字、冒号、下划线和短横线', trigger: 'blur' }
  ],
  labelZh: [{ required: true, message: '请输入中文文案', trigger: 'blur' }],
  labelFr: [{ required: true, message: '请输入法语文案', trigger: 'blur' }],
  labelEn: [{ required: true, message: '请输入英语文案', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function statusLabel(status: string) {
  return status === 'enabled' ? '启用' : '停用'
}

function resetForm(groupKey = '') {
  editing.value = undefined
  form.groupKey = groupKey
  form.optionValue = ''
  form.labelZh = ''
  form.labelFr = ''
  form.labelEn = ''
  form.sortOrder = 0
  form.requiresExtraText = false
  form.status = 'enabled'
  editRef.value?.clearValidate()
}

async function loadGroups() {
  groupLoading.value = true
  try {
    const res = await listCupidOptionGroups()
    groups.value = res.data || []
    if (!currentGroup.value && groups.value.length > 0) {
      currentGroup.value = groups.value[0]
      await loadValues()
    }
  } finally {
    groupLoading.value = false
  }
}

async function loadValues() {
  if (!currentGroup.value) {
    values.value = []
    return
  }
  valueLoading.value = true
  try {
    const res = await listCupidOptionValues({ groupKey: currentGroup.value.groupKey })
    values.value = res.data || []
  } finally {
    valueLoading.value = false
  }
}

async function handleGroupChange(row?: CupidOptionGroupRow) {
  if (!row) return
  currentGroup.value = row
  await loadValues()
}

function openCreate() {
  if (!currentGroup.value) {
    proxy?.$modal?.msgWarning('请先选择分组')
    return
  }
  resetForm(currentGroup.value.groupKey)
  editOpen.value = true
}

function openEdit(row: CupidOptionValueRow) {
  editing.value = row
  form.groupKey = row.groupKey
  form.optionValue = row.optionValue
  form.labelZh = row.labelZh
  form.labelFr = row.labelFr
  form.labelEn = row.labelEn
  form.sortOrder = Number(row.sortOrder || 0)
  form.requiresExtraText = Number(row.requiresExtraText) === 1
  form.status = row.status
  editRef.value?.clearValidate()
  editOpen.value = true
}

async function submitEdit() {
  const valid = await editRef.value?.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      groupKey: form.groupKey,
      optionValue: form.optionValue,
      labelZh: form.labelZh,
      labelFr: form.labelFr,
      labelEn: form.labelEn,
      sortOrder: form.sortOrder,
      requiresExtraText: form.requiresExtraText,
      status: form.status
    }
    if (editing.value) {
      await updateCupidOptionValue(editing.value.id, payload)
    } else {
      await createCupidOptionValue(payload)
    }
    proxy?.$modal?.msgSuccess('保存成功')
    editOpen.value = false
    await loadValues()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.option-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 12px;
}

.group-panel,
.value-panel {
  min-width: 0;
}

.panel-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.group-name {
  font-weight: 600;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 3px;
}

.option-query-form {
  margin-bottom: 8px;
}

.option-query-form :deep(.el-input) {
  width: 280px;
}

.readonly-display {
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}
</style>
