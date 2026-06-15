<template>
  <main class="operations-home">
    <header class="workspace-header">
      <div>
        <p class="eyebrow">OPERATIONS CONSOLE</p>
        <h1>{{ greeting }}，{{ displayName }}</h1>
        <p class="workspace-summary">当前工作台仅展示真实的账号与权限状态，业务数据将在对应运营模块完成后接入。</p>
      </div>
      <div class="workspace-identity">
        <span class="identity-label">当前身份</span>
        <strong>{{ primaryRole }}</strong>
        <span>{{ userStore.name }}</span>
      </div>
    </header>

    <section class="metrics-strip" aria-label="当前访问状态">
      <div class="metric-item">
        <span>已授予角色</span>
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
            <span class="module-state">待接入</span>
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
          <el-empty v-else :image-size="72" description="当前账号暂无管理入口" />
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
  { name: '审核中心', scope: 'Profile、Photo 与 Verification', icon: 'clipboard', tone: 'teal' },
  { name: '关系服务', scope: '私人介绍申请与处理', icon: 'peoples', tone: 'blue' },
  { name: '活动运营', scope: '活动与报名审核', icon: 'date', tone: 'amber' },
  { name: '用户服务', scope: 'App 用户与系统通知', icon: 'user', tone: 'coral' },
  { name: '运营协作', scope: 'Staff Task 与业务审计', icon: 'log', tone: 'slate' }
]

const actionCandidates: QuickAction[] = [
  { label: '后台用户', path: '/system/user', icon: 'user', permission: 'system:user:list' },
  { label: '角色权限', path: '/system/role', icon: 'peoples', permission: 'system:role:list' },
  { label: '菜单配置', path: '/system/menu', icon: 'tree-table', permission: 'system:menu:list' },
  { label: '操作日志', path: '/monitor/operlog', icon: 'form', permission: 'monitor:operlog:list' }
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
  letter-spacing: 0;
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
    font-size: 12px;
  }

  strong {
    font-size: 23px;
    font-weight: 600;
  }
}

.metric-status strong {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;

  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--el-color-success);
    box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.16);
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.8fr);
  gap: 20px;
  max-width: 1440px;
  margin: 0 auto;
}

.workspace-main,
.side-section {
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);
}

.workspace-main {
  padding: 24px;
}

.workspace-side {
  display: grid;
  align-content: start;
  gap: 20px;
}

.side-section {
  padding: 22px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  h2 {
    margin: 3px 0 0;
    font-size: 18px;
    font-weight: 650;
  }

  &.compact {
    margin-bottom: 14px;
  }
}

.module-list {
  border-top: 1px solid var(--el-border-color-lighter);
}

.module-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 78px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h3 {
    margin: 0 0 4px;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.module-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  font-size: 18px;

  &--teal { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &--blue { color: #337ecc; background: #ecf5ff; }
  &--amber { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--coral { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
  &--slate { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}

.module-state {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.quick-actions {
  display: grid;
}

.quick-action {
  width: 100%;
  min-height: 48px;
  padding: 0 4px;
  border: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: transparent;
  color: var(--el-text-color-primary);
  display: grid;
  grid-template-columns: 24px 1fr 20px;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.account-facts {
  margin: 0;

  div {
    display: grid;
    grid-template-columns: 84px 1fr;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  div:last-child {
    border-bottom: 0;
  }

  dt {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
    font-size: 13px;
  }
}

:global(html.dark) {
  .operations-home {
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
  }

  .workspace-main,
  .side-section {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }

  .workspace-header,
  .module-list,
  .module-row,
  .quick-action,
  .account-facts div {
    border-color: var(--el-border-color);
  }
}

@media (max-width: 900px) {
  .operations-home {
    padding: 18px;
  }

  .workspace-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-item:nth-child(2) {
    border-right: 0;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .workspace-header h1 {
    font-size: 24px;
  }

  .metrics-strip {
    grid-template-columns: 1fr;
  }

  .metric-item {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  }
}
</style>
