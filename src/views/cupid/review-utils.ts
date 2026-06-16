export const profileTypes = [
  { label: '本人资料', value: 'self' },
  { label: '家庭代建', value: 'family' }
]

export const profileStatuses = [
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'review' },
  { label: '已开放', value: 'open' },
  { label: '已暂停', value: 'paused' },
  { label: '已隐藏', value: 'hidden' }
]

export const photoStatuses = [
  { label: '待审核', value: 'review' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已隐藏', value: 'hidden' }
]

export const reviewStatuses = [
  { label: '未审核', value: 'unreviewed' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

export const materialStatuses = [
  { label: '未认证', value: 'unverified' },
  { label: '待审核', value: 'pending' },
  { label: '已认证', value: 'verified' },
  { label: '已拒绝', value: 'rejected' }
]

export const adminReviewSortOptions = [
  { label: '待审核优先', value: 'reviewFirst' },
  { label: '更新时间最新', value: 'updatedDesc' },
  { label: '资料名称', value: 'profileNameAsc' },
  { label: '用户名称', value: 'userNameAsc' }
]

export const genders = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

export const degreeLevels = [
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'phd' },
  { label: '高中及以下', value: 'high_school' },
  { label: '大专', value: 'college' },
  { label: '博士', value: 'doctor' }
]

export const maritalStatuses = [
  { label: '未婚', value: 'never_married' },
  { label: '离异', value: 'divorced' },
  { label: '丧偶', value: 'widowed' },
  { label: '未婚', value: 'single' }
]

export const childrenPlans = [
  { label: '想要孩子', value: 'wants' },
  { label: '可沟通', value: 'open_to_discuss' },
  { label: '不想要孩子', value: 'does_not_want' },
  { label: '想要孩子', value: 'wants_children' },
  { label: '不想要孩子', value: 'no_children' },
  { label: '视情况而定', value: 'open' },
  { label: '已经有孩子', value: 'has_children' }
]

export const datingIntentions = [
  { label: '认真关系', value: 'serious' },
  { label: '婚姻导向', value: 'marriage' },
  { label: '专属关系', value: 'exclusive' },
  { label: '跨境关系', value: 'cross_border' },
  { label: '长期关系', value: 'long_term' }
]

export const relocationOptions = [
  { label: '愿意迁居', value: 'willing' },
  { label: '不考虑迁居', value: 'unwilling' },
  { label: '可沟通', value: 'open_to_discuss' },
  { label: '不考虑迁居', value: 'not_willing' },
  { label: '视情况而定', value: 'open' }
]

export const smokingOptions = [
  { label: '不吸烟', value: 'never' },
  { label: '社交场合', value: 'social' },
  { label: '经常', value: 'often' },
  { label: '偶尔', value: 'occasionally' },
  { label: '经常', value: 'regularly' }
]

export const drinkingOptions = [
  { label: '不饮酒', value: 'never' },
  { label: '社交场合', value: 'social' },
  { label: '经常', value: 'often' },
  { label: '社交场合', value: 'socially' },
  { label: '偶尔', value: 'occasionally' },
  { label: '经常', value: 'regularly' }
]

export const activityLevels = [
  { label: '较少运动', value: 'low' },
  { label: '适中', value: 'moderate' },
  { label: '活跃', value: 'high' },
  { label: '适中', value: 'medium' }
]

export const weekendStyles = [
  { label: '户外活动', value: 'outdoors' },
  { label: '安静居家', value: 'indoors' },
  { label: '社交聚会', value: 'social' },
  { label: '灵活安排', value: 'flexible' },
  { label: '安静居家', value: 'quiet_home' },
  { label: '户外活动', value: 'outdoor' },
  { label: '文化休闲', value: 'culture' }
]

export const petOptions = [
  { label: '已有宠物', value: 'has' },
  { label: '不养宠物', value: 'none' },
  { label: '喜欢宠物', value: 'likes' },
  { label: '喜欢宠物', value: 'likes_pets' },
  { label: '不养宠物', value: 'no_pets' },
  { label: '已有宠物', value: 'has_pets' }
]

export const communicationStyles = [
  { label: '直接坦诚', value: 'direct' },
  { label: '委婉含蓄', value: 'indirect' },
  { label: '平衡沟通', value: 'balanced' },
  { label: '温和体贴', value: 'gentle' },
  { label: '理性沟通', value: 'rational' },
  { label: '幽默轻松', value: 'humorous' }
]

export const relationshipValueOptions = [
  { label: '诚信', value: 'honesty' },
  { label: '信任', value: 'trust' },
  { label: '沟通', value: 'communication' },
  { label: '尊重', value: 'respect' },
  { label: '忠诚', value: 'loyalty' },
  { label: '家庭', value: 'family' },
  { label: '成长', value: 'growth' },
  { label: '支持', value: 'support' },
  { label: '幽默', value: 'humor' },
  { label: '上进心', value: 'ambition' },
  { label: '善良', value: 'kindness' },
  { label: '独立', value: 'independence' },
  { label: '浪漫', value: 'romance' },
  { label: '稳定', value: 'stability' },
  { label: '共同生活', value: 'shared_life' }
]

export const preferredLocationOptions = [
  { label: '本地', value: 'local' },
  { label: '区域', value: 'regional' },
  { label: '全国', value: 'national' },
  { label: '国际', value: 'international' }
]

export const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: '英文', value: 'en' },
  { label: '法文', value: 'fr' },
  { label: '西班牙文', value: 'es' },
  { label: '德文', value: 'de' }
]

export const localizedStatuses = [
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'ready' },
  { label: '失败', value: 'failed' }
]

export const localizedFieldLabels: Record<string, string> = {
  profile_name: '资料名称',
  city: '城市',
  country: '国家',
  nationality: '国籍',
  education: '学历',
  industry: '行业',
  career_direction: '职业方向',
  relationship_goal: '关系目标',
  residence_plan: '居住计划',
  preferred_education: '期望学历',
  family_life: '家庭生活',
  exercise: '运动习惯',
  summary: '简介',
  tags: '标签',
  interests: '兴趣',
  deal_breakers: '不可接受项',
  personality_traits: '性格特质'
}

export const localizedSourceLabels: Record<string, string> = {
  manual: '人工录入',
  generated: '自动生成',
  imported: '导入'
}

export const localizedProviderLabels: Record<string, string> = {
  human: '人工',
  libretranslate: 'LibreTranslate',
  system: '系统'
}

export function localizedOriginLabel(row: any): string {
  if (row.provider === 'human') {
    return '人工'
  }
  if (row.source === 'machine' || row.provider === 'translation_api' || row.provider === 'libretranslate') {
    return '机器翻译'
  }
  return localizedSourceLabels[row.source] || localizedProviderLabels[row.provider] || row.source || row.provider || '-'
}

export function labelOf(options: Array<{ label: string; value: string }>, value: string): string {
  if (!value) {
    return '-'
  }
  const normalizedValue = String(value).toLowerCase()
  return options.find((item) => item.value === value || item.value.toLowerCase() === normalizedValue)?.label || value
}

export function labelsOf(options: Array<{ label: string; value: string }>, values: any[]): string {
  if (!Array.isArray(values) || values.length === 0) {
    return '-'
  }
  return values.map((item) => labelOf(options, typeof item === 'string' ? item : item.valueCode || item.languageCode)).join(' / ')
}

export function ageOf(birthYear: number): string {
  return birthYear ? `${new Date().getFullYear() - Number(birthYear)}岁` : '-'
}

export function yesNo(value: boolean | number): string {
  return value ? '是' : '否'
}

export function profileTitle(row: any): string {
  return row.profileName || labelOf(profileTypes, row.profileType) || '未命名资料'
}

export function profileSummary(row: any): string {
  const parts = [
    labelOf(genders, row.gender),
    ageOf(row.birthYear),
    row.cityLabel || row.cityCode,
    row.industryLabel,
    row.careerDirectionLabel
  ].filter(Boolean).filter((item) => item !== '-')
  return parts.join(' / ') || '-'
}

export function canReviewProfile(row: any): boolean {
  return row?.profileStatus === 'review'
}

export function canReviewPhoto(row: any): boolean {
  return row?.status === 'review'
}

export function canReviewVerification(row: any): boolean {
  return row?.reviewStatus === 'pending'
}
