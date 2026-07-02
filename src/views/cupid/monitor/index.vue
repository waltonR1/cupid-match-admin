<template>
  <div class="app-container monitor-page">
    <section class="monitor-hero">
      <div>
        <div class="eyebrow">CUPID OPERATIONS</div>
        <h1>业务运行监控</h1>
        <p>只读查看 Cupid 会话、验证码与风险缓存规模。</p>
      </div>
      <div class="hero-actions">
        <div class="health-pill" :class="overview.status">
          <span class="health-dot" />
          {{ overview.status === 'healthy' ? 'Redis 正常' : 'Redis 不可用' }}
        </div>
        <el-button type="primary" :loading="loading" @click="loadOverview">立即刷新</el-button>
      </div>
    </section>

    <div class="snapshot-time">数据时间：{{ parseTime(overview.checkedAt) || '-' }}</div>

    <section class="metric-grid">
      <article v-for="item in summaryMetrics" :key="item.label" class="metric-card">
        <span class="metric-label">{{ item.label }}</span>
        <strong>{{ formatCount(item.value) }}</strong>
        <small>{{ item.hint }}</small>
      </article>
    </section>

    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-heading">
          <div>
            <strong>Redis 分类明细</strong>
            <span>仅统计数量，不读取或展示 key 内容</span>
          </div>
          <el-tag type="info" effect="plain">只读</el-tag>
        </div>
      </template>

      <el-table v-loading="loading" :data="overview.redisMetrics">
        <el-table-column label="业务分类" min-width="180" prop="name" />
        <el-table-column label="匹配范围" min-width="260" prop="pattern">
          <template #default="{ row }">
            <code>{{ row.pattern }}</code>
          </template>
        </el-table-column>
        <el-table-column label="Key 数量" width="140" align="right">
          <template #default="{ row }">
            <strong class="table-count">{{ formatCount(row.count) }}</strong>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="monitor-note">
      本页面不提供删除 Key、清空缓存或修改会话的操作。会话强退仍需从 App 用户管理执行。
    </div>
  </div>
</template>

<script setup lang="ts" name="CupidBusinessMonitor">
import { computed, onMounted, reactive, ref } from 'vue'
import { getCupidMonitorOverview, type CupidMonitorOverview } from '@/api/cupid/monitor'
import { parseTime } from '@/utils/ruoyi'

const loading = ref(false)
const overview = reactive<CupidMonitorOverview>({
  checkedAt: 0,
  status: 'healthy',
  totalCupidKeys: 0,
  activeSessions: 0,
  onlineUsers: 0,
  verificationCodes: 0,
  riskCounters: 0,
  activeChallengeTokens: 0,
  redisMetrics: []
})

const summaryMetrics = computed(() => [
  { label: 'Cupid Key 总量', value: overview.totalCupidKeys, hint: '全部 cupid:* 缓存' },
  { label: '活跃会话', value: overview.activeSessions, hint: '当前有效 Session' },
  { label: '在线用户', value: overview.onlineUsers, hint: '存在会话索引的用户' },
  { label: '待验证验证码', value: overview.verificationCodes, hint: '尚未过期的验证码缓存' },
  { label: '风险计数器', value: overview.riskCounters, hint: '连续登录失败窗口' },
  { label: '安全挑战令牌', value: overview.activeChallengeTokens, hint: '数据库内有效一次性令牌' }
])

async function loadOverview() {
  loading.value = true
  try {
    const response = await getCupidMonitorOverview()
    Object.assign(overview, response.data)
  } finally {
    loading.value = false
  }
}

function formatCount(value?: number) {
  return Number(value || 0).toLocaleString()
}

onMounted(() => {
  void loadOverview()
})
</script>

<style scoped>
.monitor-page {
  --monitor-ink: #17324d;
  --monitor-muted: #6d7f90;
  --monitor-line: #dce6ee;
  --monitor-accent: #0d7c77;
  background:
    radial-gradient(circle at 92% 4%, rgb(13 124 119 / 10%), transparent 26rem),
    var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.monitor-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 28px 30px;
  color: #fff;
  background: linear-gradient(120deg, #17324d 0%, #204b62 62%, #0d7c77 140%);
  border-radius: 14px;
  box-shadow: 0 16px 38px rgb(23 50 77 / 16%);
}

.eyebrow {
  margin-bottom: 8px;
  color: #8fdbd4;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.monitor-hero h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.monitor-hero p {
  margin: 8px 0 0;
  color: rgb(255 255 255 / 68%);
}

.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.health-pill {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  color: #d9fff7;
  background: rgb(255 255 255 / 9%);
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 999px;
}

.health-dot {
  width: 8px;
  height: 8px;
  background: #52d7a4;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgb(82 215 164 / 14%);
}

.health-pill.unavailable .health-dot {
  background: #ff9e80;
  box-shadow: 0 0 0 4px rgb(255 158 128 / 14%);
}

.snapshot-time {
  margin: 14px 2px 10px;
  color: var(--monitor-muted);
  font-size: 12px;
  text-align: right;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 132px;
  padding: 20px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--monitor-line);
  border-radius: 12px;
}

.metric-card::after {
  position: absolute;
  right: -18px;
  bottom: -26px;
  width: 72px;
  height: 72px;
  content: '';
  background: rgb(13 124 119 / 7%);
  border-radius: 50%;
}

.metric-label {
  color: var(--monitor-muted);
  font-size: 13px;
}

.metric-card strong {
  margin: 10px 0 5px;
  color: var(--monitor-ink);
  font-size: 30px;
  font-variant-numeric: tabular-nums;
}

.metric-card small {
  color: #91a0ad;
  line-height: 1.4;
}

.detail-card {
  margin-top: 16px;
  border-color: var(--monitor-line);
  border-radius: 12px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-heading strong {
  display: block;
  color: var(--monitor-ink);
  font-size: 16px;
}

.card-heading span {
  display: block;
  margin-top: 4px;
  color: var(--monitor-muted);
  font-size: 12px;
}

.card-heading .el-tag {
  display: inline-flex;
  margin-top: 0;
}

code {
  color: #305f70;
  font-family: Consolas, Monaco, monospace;
}

.table-count {
  color: var(--monitor-accent);
  font-variant-numeric: tabular-nums;
}

.monitor-note {
  margin-top: 14px;
  padding: 12px 16px;
  color: var(--monitor-muted);
  font-size: 12px;
  line-height: 1.6;
  background: rgb(255 255 255 / 52%);
  border-left: 3px solid #91aaa9;
}

@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .monitor-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
