<template>
  <main class="operations-home">
    <header class="workspace-header">
      <div>
        <p class="eyebrow">CUPID MATCH OPERATIONS</p>
        <h1>{{ greeting }}，{{ displayName }}</h1>
        <p class="workspace-summary">
          这里汇总当前后台已经接入的运营能力。日常处理从左侧菜单进入，常用入口可从下方快速打开。
        </p>
      </div>
      <div class="workspace-identity">
        <span class="identity-label">当前身份</span>
        <strong>{{ primaryRole }}</strong>
        <span>{{ userStore.name || '-' }}</span>
      </div>
    </header>

    <section class="metrics-strip" aria-label="后台状态">
      <div class="metric-item">
        <span>已授权角色</span>
        <strong>{{ userStore.roles.length }}</strong>
      </div>
      <div class="metric-item">
        <span>权限标识</span>
        <strong>{{ permissionCount }}</strong>
      </div>
      <div class="metric-item">
        <span>可见导航</span>
        <strong>{{ navigationCount }}</strong>
      </div>
      <div class="metric-item metric-status">
        <span>后台状态</span>
        <strong><i></i>正常</strong>
      </div>
    </section>

    <section class="workspace-grid">
      <div class="workspace-main">
        <div class="section-heading">
          <div>
            <p class="section-kicker">WORKSPACE</p>
            <h2>业务工作区</h2>
          </div>
        </div>

        <div class="module-list">
          <article v-for="module in modules" :key="module.name" class="module-row">
            <div class="module-icon" :class="`module-icon--${module.tone}`">
              <svg-icon :icon-class="module.icon" />
            </div>
            <div class="module-copy">
              <h3>{{ module.name }}</h3>
              <p>{{ module.scope }}</p>
            </div>
            <el-tag :type="module.tagType" effect="light">{{ module.state }}</el-tag>
          </article>
        </div>
      </div>

      <aside class="workspace-side">
        <section class="side-section">
          <div class="section-heading compact">
            <div>
              <p class="section-kicker">ACCESS</p>
              <h2>快捷入口</h2>
            </div>
          </div>

          <div v-if="quickActions.length" class="quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.path"
              type="button"
              class="quick-action"
              @click="router.push(action.path)"
            >
              <svg-icon :icon-class="action.icon" />
              <span>{{ action.label }}</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
          <el-empty v-else :image-size="72" description="当前账号暂无可用快捷入口" />
        </section>

        <section class="side-section account-section">
          <div class="section-heading compact">
            <div>
              <p class="section-kicker">ACCOUNT</p>
              <h2>权限概览</h2>
            </div>
          </div>
          <dl class="account-facts">
            <div>
              <dt>登录账号</dt>
              <dd>{{ userStore.name || '-' }}</dd>
            </div>
            <div>
              <dt>显示名称</dt>
              <dd>{{ displayName }}</dd>
            </div>
            <div>
              <dt>角色</dt>
              <dd>{{ roleSummary }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts" name="Index">
import { ArrowRight } from '@element-plus/icons-vue'
import usePermissionStore from '@/store/modules/permission'
import useUserStore from '@/store/modules/user'

interface QuickAction {
  label: string
  path: string
  icon: string
  permission: string
}

const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const modules = [
  { name: '审核中心', scope: '资料、照片、身份/学历/收入/婚姻认证审核', icon: 'clipboard', tone: 'teal', state: '已接入', tagType: 'success' },
  { name: '用户服务', scope: 'App 用户、会员、支付订阅、通知发布与联系咨询', icon: 'user', tone: 'blue', state: '已接入', tagType: 'success' },
  { name: '活动运营', scope: '活动管理、报名审核、活动生命周期自动化', icon: 'date', tone: 'amber', state: '已接入', tagType: 'success' },
  { name: '关系服务', scope: '私人介绍、跟进事项与顾问协作', icon: 'peoples', tone: 'coral', state: '已接入', tagType: 'success' },
  { name: '安全与监控', scope: '业务审计、安全事件、业务监控和定时任务', icon: 'lock', tone: 'slate', state: '已接入', tagType: 'success' },
  { name: '配置中心', scope: '通用选项、法律条款、短信/邮件/支付等部署配置', icon: 'dict', tone: 'violet', state: '需维护', tagType: 'warning' }
] as const

const actionCandidates: QuickAction[] = [
  { label: '联系咨询', path: '/cupid-service/contact-lead', icon: 'message', permission: 'cupid:contactLead:list' },
  { label: '支付订阅', path: '/cupid-service/payment', icon: 'money', permission: 'cupid:payment:list' },
  { label: '会员管理', path: '/cupid-service/membership', icon: 'money', permission: 'cupid:membership:list' },
  { label: '活动管理', path: '/cupid-event/event', icon: 'date', permission: 'cupid:event:list' },
  { label: '跟进事项', path: '/cupid-operation/task', icon: 'list', permission: 'cupid:staffTask:list' },
  { label: '法律条款', path: '/cupid-config/legal', icon: 'documentation', permission: 'cupid:legal:list' },
  { label: '业务监控', path: '/cupid-operation/monitor', icon: 'monitor', permission: 'cupid:monitor:list' },
  { label: '安全事件', path: '/cupid-operation/security-event', icon: 'lock', permission: 'cupid:security:event:list' }
]

const permissionCount = computed(() => userStore.permissions.includes('*:*:*')
  ? '全部'
  : userStore.permissions.length)

const navigationCount = computed(() => countVisibleRoutes(permissionStore.sidebarRouters))
const displayName = computed(() => userStore.nickName || userStore.name || '运营人员')
const roleSummary = computed(() => userStore.roles.length ? userStore.roles.join('、') : '默认角色')
const primaryRole = computed(() => userStore.roles.includes('admin') ? '平台管理员' : roleSummary.value)
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const quickActions = computed(() => actionCandidates.filter((action) =>
  userStore.permissions.includes('*:*:*') || userStore.permissions.includes(action.permission)
))

function countVisibleRoutes(routes: any[]): number {
  return routes.reduce((count, route) => {
    const current = route.hidden ? 0 : 1
    const children = Array.isArray(route.children) ? countVisibleRoutes(route.children) : 0
    return count + current + children
  }, 0)
}
</script>

<style scoped lang="scss">
.operations-home {
  min-height: calc(100vh - 84px);
  padding: 28px;
  color: var(--el-text-color-primary);
  background:
    linear-gradient(rgba(64, 158, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.035) 1px, transparent 1px),
    #f0f2f5;
  background-size: 32px 32px;
}

.workspace-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto 24px;
  padding: 8px 0 22px;
  border-bottom: 1px solid var(--el-border-color);

  h1 {
    margin: 4px 0 8px;
    font-size: 30px;
    line-height: 1.25;
    font-weight: 650;
    letter-spacing: 0;
  }
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--el-color-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.workspace-summary {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.workspace-identity {
  min-width: 180px;
  padding-left: 18px;
  border-left: 3px solid var(--el-color-primary);
  display: grid;
  gap: 3px;

  strong {
    font-size: 16px;
  }

  span:last-child {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.identity-label {
  color: var(--el-text-color-placeholder);
  font-size: 11px;
}

.metrics-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  max-width: 1440px;
  margin: 0 auto 24px;
  background: #304156;
  color: #ffffff;
}

.metric-item {
  min-height: 88px;
  padding: 18px 22px;
  border-right: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:last-child {
    border-right: 0;
  }

  span {
    color: #c8d0da;
    font-size: 13px;
  }

  strong {
    font-size: 24px;
  }
}

.metric-status strong {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--el-color-success);
    box-shadow: 0 0 0 5px rgba(103, 194, 58, 0.16);
  }
}

.workspace-grid {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
}

.workspace-main,
.side-section {
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 10px 30px rgba(48, 65, 86, 0.08);
}

.workspace-main {
  padding: 26px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;

  h2 {
    margin: 4px 0 0;
    font-size: 20px;
  }

  &.compact {
    margin-bottom: 16px;
  }
}

.module-list {
  display: grid;
  gap: 12px;
}

.module-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--el-border-color-lighter);
  background: #fbfcfe;
}

.module-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 22px;

  &--teal { background: #1f9d8a; }
  &--blue { background: #409eff; }
  &--amber { background: #c08a2a; }
  &--coral { background: #d56a54; }
  &--slate { background: #304156; }
  &--violet { background: #7c5ac2; }
}

.module-copy {
  h3 {
    margin: 0 0 6px;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

.workspace-side {
  display: grid;
  gap: 18px;
  align-content: start;
}

.side-section {
  padding: 22px;
}

.quick-actions {
  display: grid;
  gap: 10px;
}

.quick-action {
  width: 100%;
  min-height: 48px;
  border: 1px solid var(--el-border-color-light);
  background: #f8fafc;
  color: var(--el-text-color-primary);
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}

.account-facts {
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
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
