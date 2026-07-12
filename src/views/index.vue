<template>
  <main class="ops-home">
    <section class="hero-card">
      <div>
        <p class="eyebrow">CUPID MATCH 后台</p>
        <h1>{{ greeting }}，{{ displayName }}</h1>
      </div>
      <div class="identity-card">
        <span>当前账号</span>
        <strong>{{ userStore.name || '-' }}</strong>
        <small>{{ roleSummary }}</small>
      </div>
    </section>

    <section class="workspace-layout">
      <div class="workbench-panel">
        <div class="section-title">
          <p class="eyebrow">WORKSPACE</p>
          <h2>常用工作区</h2>
        </div>

        <div class="module-grid">
          <article v-for="group in visibleGroups" :key="group.title" class="module-card">
            <div class="module-head">
              <div class="module-icon" :class="`module-icon--${group.tone}`">
                <svg-icon :icon-class="group.icon" />
              </div>
              <div>
                <h3>{{ group.title }}</h3>
                <p>{{ group.description }}</p>
              </div>
            </div>

            <div class="action-list">
              <button
                v-for="action in group.actions"
                :key="action.path"
                type="button"
                class="action-item"
                @click="router.push(action.path)"
              >
                <span>{{ action.label }}</span>
                <el-tag v-if="action.note" size="small" :type="action.noteType || 'info'" effect="light">
                  {{ action.note }}
                </el-tag>
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>
          </article>
        </div>
      </div>

      <aside class="side-panel">
        <section class="side-card">
          <div class="section-title compact">
            <p class="eyebrow">ACCOUNT</p>
            <h2>权限概览</h2>
          </div>
          <dl class="facts">
            <div>
              <dt>显示名称</dt>
              <dd>{{ displayName }}</dd>
            </div>
            <div>
              <dt>角色</dt>
              <dd>{{ roleSummary }}</dd>
            </div>
            <div>
              <dt>可用工作组</dt>
              <dd>{{ visibleGroups.length }} / {{ actionGroups.length }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts" name="Index">
import { ArrowRight } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'

interface QuickAction {
  label: string
  path: string
  permission: string
  note?: string
  noteType?: 'success' | 'warning' | 'info' | 'danger'
}

interface ActionGroup {
  title: string
  description: string
  icon: string
  tone: string
  actions: QuickAction[]
}

const router = useRouter()
const userStore = useUserStore()

const actionGroups: ActionGroup[] = [
  {
    title: '审核中心',
    description: '资料、照片、身份与资质材料审核。',
    icon: 'clipboard',
    tone: 'teal',
    actions: [
      { label: '资料审核', path: '/cupid/profile', permission: 'cupid:profile:list' },
      { label: '照片审核', path: '/cupid/photo', permission: 'cupid:photo:list' },
      { label: '身份认证审核', path: '/cupid/verification/identity', permission: 'cupid:verification:identity:list' },
      { label: '学历认证审核', path: '/cupid/verification/education', permission: 'cupid:verification:education:list' },
      { label: '收入认证审核', path: '/cupid/verification/income', permission: 'cupid:verification:income:list' },
      { label: '婚姻认证审核', path: '/cupid/verification/marital', permission: 'cupid:verification:marital:list' }
    ]
  },
  {
    title: '资料中心',
    description: '查看资料库，维护运营字段和内部备注。',
    icon: 'list',
    tone: 'green',
    actions: [
      { label: '资料库', path: '/profile-center/library', permission: 'cupid:profileLibrary:list' },
      { label: '资料运营', path: '/profile-center/manage', permission: 'cupid:profileManage:list' }
    ]
  },
  {
    title: '用户服务',
    description: '用户、会员、支付、通知和联系咨询。',
    icon: 'user',
    tone: 'blue',
    actions: [
      { label: 'App 用户管理', path: '/cupid-service/user', permission: 'cupid:user:list' },
      { label: '会员管理', path: '/cupid-service/membership', permission: 'cupid:membership:list' },
      { label: '支付订阅', path: '/cupid-service/payment', permission: 'cupid:payment:list', note: 'Stripe' },
      { label: '通知发布', path: '/cupid-service/inbox', permission: 'cupid:inbox:send' },
      { label: '通知模板', path: '/cupid-service/inbox-template', permission: 'cupid:inboxTemplate:list' },
      { label: '联系咨询', path: '/cupid-service/contact-lead', permission: 'cupid:contactLead:list' }
    ]
  },
  {
    title: '活动运营',
    description: '活动发布、报名审核和活动生命周期维护。',
    icon: 'date',
    tone: 'amber',
    actions: [
      { label: '活动管理', path: '/cupid-event/event', permission: 'cupid:event:list' },
      { label: '活动报名', path: '/cupid-event/registration', permission: 'cupid:eventRegistration:list' }
    ]
  },
  {
    title: '关系服务',
    description: '私人介绍、跟进事项和顾问协作。',
    icon: 'peoples',
    tone: 'coral',
    actions: [
      { label: '私人介绍', path: '/relationship-service/introduction', permission: 'cupid:introduction:list' },
      { label: '跟进事项', path: '/cupid-operation/task', permission: 'cupid:staffTask:list' }
    ]
  },
  {
    title: '安全与监控',
    description: '业务审计、安全事件、运行监控和定时任务。',
    icon: 'lock',
    tone: 'slate',
    actions: [
      { label: '业务审计', path: '/cupid-operation/audit', permission: 'cupid:audit:list' },
      { label: '安全事件', path: '/cupid-operation/security-event', permission: 'cupid:security:event:list' },
      { label: '业务监控', path: '/cupid-operation/monitor', permission: 'cupid:monitor:list' },
      { label: '定时任务', path: '/monitor/job', permission: 'monitor:job:list' }
    ]
  },
  {
    title: '配置中心',
    description: '通用选项、法律条款和外部服务配置说明。',
    icon: 'dict',
    tone: 'violet',
    actions: [
      { label: '通用选项', path: '/cupid-config/options', permission: 'cupid:options:list' },
      { label: '法律条款', path: '/cupid-config/legal', permission: 'cupid:legal:list' },
      { label: '系统配置', path: '/system/config', permission: 'system:config:list' }
    ]
  }
]

const displayName = computed(() => userStore.nickName || userStore.name || '运营人员')
const roleSummary = computed(() => userStore.roles.length ? userStore.roles.join('、') : '默认角色')
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const visibleGroups = computed(() => actionGroups
  .map((group) => ({
    ...group,
    actions: group.actions.filter((action) => hasPermission(action.permission))
  }))
  .filter((group) => group.actions.length > 0))

function hasPermission(permission: string) {
  return userStore.permissions.includes('*:*:*') || userStore.permissions.includes(permission)
}
</script>

<style scoped lang="scss">
.ops-home {
  min-height: calc(100vh - 84px);
  padding: 28px;
  color: var(--el-text-color-primary);
  background: #f0f2f5;
}

.hero-card,
.workbench-panel,
.side-card {
  border: 1px solid var(--el-border-color-light);
  background: #fff;
  box-shadow: 0 10px 30px rgba(48, 65, 86, 0.08);
}

.hero-card {
  max-width: 1440px;
  margin: 0 auto 18px;
  padding: 28px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  background:
    linear-gradient(135deg, rgba(48, 65, 86, 0.96), rgba(64, 158, 255, 0.76)),
    #304156;
  color: #fff;

  h1 {
    margin: 6px 0 10px;
    font-size: 30px;
    line-height: 1.25;
    font-weight: 650;
  }
}

.eyebrow {
  margin: 0;
  color: var(--el-color-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.hero-card .eyebrow {
  color: rgba(255, 255, 255, 0.72);
}

.identity-card {
  min-width: 220px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 6px;

  span,
  small {
    color: rgba(255, 255, 255, 0.72);
  }

  strong {
    font-size: 20px;
  }
}

.workspace-layout {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
}

.workbench-panel,
.side-card {
  padding: 24px;
}

.section-title {
  margin-bottom: 18px;

  h2 {
    margin: 4px 0 0;
    font-size: 20px;
  }

  &.compact {
    margin-bottom: 16px;
  }
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.module-card {
  border: 1px solid var(--el-border-color-lighter);
  background: #fbfcfe;
  padding: 18px;
}

.module-head {
  min-height: 72px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  margin-bottom: 16px;

  h3 {
    margin: 0 0 6px;
    font-size: 17px;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.6;
  }
}

.module-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 21px;

  &--teal { background: #1f9d8a; }
  &--green { background: #4f9d69; }
  &--blue { background: #409eff; }
  &--amber { background: #c08a2a; }
  &--coral { background: #d56a54; }
  &--slate { background: #304156; }
  &--violet { background: #7c5ac2; }
}

.action-list {
  display: grid;
  gap: 8px;
}

.action-item {
  min-height: 42px;
  border: 1px solid var(--el-border-color-light);
  background: #fff;
  color: var(--el-text-color-primary);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 16px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}

.side-panel {
  display: grid;
  gap: 18px;
  align-content: start;
}

.facts {
  margin: 0;
  display: grid;
  gap: 14px;

  div {
    display: grid;
    gap: 4px;
  }

  dt {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
  }

  dd {
    margin: 0;
    font-weight: 600;
  }
}

@media (max-width: 1180px) {
  .workspace-layout,
  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
