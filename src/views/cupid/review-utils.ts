import useCupidOptionsStore from '@/store/modules/cupidOptions'

export type ReviewLocale = 'zh' | 'fr' | 'en'

type OptionItem = { label: string; value: string }

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

export const verificationStatuses = materialStatuses

export const verificationMaterialTypes = [
  { label: '身份认证', value: 'identity' },
  { label: '学历认证', value: 'education' },
  { label: '收入认证', value: 'income' },
  { label: '婚姻认证', value: 'marital' }
]

export const verificationMaterialStatuses = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
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
  { label: '博士', value: 'phd' }
]

export const maritalStatuses = [
  { label: '未婚', value: 'never_married' },
  { label: '离异', value: 'divorced' },
  { label: '丧偶', value: 'widowed' }
]

export const childrenPlans = [
  { label: '希望有孩子', value: 'wants' },
  { label: '愿意沟通', value: 'open_to_discuss' },
  { label: '不计划要孩子', value: 'does_not_want' }
]

export const datingIntentions = [
  { label: '认真交往', value: 'serious' },
  { label: '以婚姻为目标', value: 'marriage' },
  { label: '稳定专一关系', value: 'exclusive' },
  { label: '接受跨境发展', value: 'cross_border' }
]

export const relocationOptions = [
  { label: '愿意', value: 'willing' },
  { label: '不愿意', value: 'unwilling' },
  { label: '可以讨论', value: 'open_to_discuss' }
]

export const smokingOptions = [
  { label: '不吸烟', value: 'never' },
  { label: '社交场合', value: 'social' },
  { label: '经常', value: 'often' }
]

export const drinkingOptions = [
  { label: '不饮酒', value: 'never' },
  { label: '社交场合', value: 'social' },
  { label: '经常', value: 'often' }
]

export const activityLevels = [
  { label: '低', value: 'low' },
  { label: '中等', value: 'moderate' },
  { label: '高', value: 'high' }
]

export const weekendStyles = [
  { label: '户外', value: 'outdoors' },
  { label: '宅家', value: 'indoors' },
  { label: '社交聚会', value: 'social' },
  { label: '看心情', value: 'flexible' }
]

export const petOptions = [
  { label: '有宠物', value: 'has' },
  { label: '不养', value: 'none' },
  { label: '喜欢但不养', value: 'likes' }
]

export const communicationStyles = [
  { label: '直接', value: 'direct' },
  { label: '委婉', value: 'indirect' },
  { label: '看情况', value: 'balanced' }
]

export const relationshipValueOptions = [
  { label: '诚实', value: 'honesty' },
  { label: '信任', value: 'trust' },
  { label: '沟通', value: 'communication' },
  { label: '尊重', value: 'respect' },
  { label: '忠诚', value: 'loyalty' },
  { label: '家庭', value: 'family' },
  { label: '共同成长', value: 'growth' },
  { label: '相互支持', value: 'support' },
  { label: '幽默', value: 'humor' },
  { label: '事业心', value: 'ambition' },
  { label: '善良', value: 'kindness' },
  { label: '独立', value: 'independence' },
  { label: '浪漫', value: 'romance' },
  { label: '稳定', value: 'stability' }
]

export const preferredLocationOptions = [
  { label: '同城', value: 'local' },
  { label: '同区域', value: 'regional' },
  { label: '全国', value: 'national' },
  { label: '不限', value: 'international' }
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
  { label: '失败', value: 'failed' },
  { label: '待刷新', value: 'stale' }
]

export const contactChannelOptions = [
  { label: '手机', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '微信', value: 'wechat' }
]

export const contactVisibilityOptions = [
  { label: '介绍成功后开放', value: 'after_introduction' },
  { label: '仅管理员可见', value: 'owner_only' },
  { label: '暂不开放', value: 'disabled' }
]

export const ownershipRelationshipOptions = [
  { label: '本人', value: 'self' },
  { label: '家长', value: 'parent' },
  { label: '父亲', value: 'father' },
  { label: '母亲', value: 'mother' },
  { label: '亲属', value: 'relative' }
]

export const ownershipPermissionOptions = [
  { label: '所有者', value: 'owner' },
  { label: '管理者', value: 'manager' }
]

export const ownershipStatusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '有效', value: 'active' },
  { label: '已撤销', value: 'revoked' }
]

export const internalRecordSourceOptions = [
  { label: '本人提交', value: 'self_submitted' },
  { label: '家庭提交', value: 'family_submitted' },
  { label: '员工采集', value: 'staff_collected' }
]

const optionGroupKeys = new Map<OptionItem[], string>([
  [profileTypes, 'profile.profileType'],
  [profileStatuses, 'profile.profileStatus'],
  [photoStatuses, 'profile.photoStatus'],
  [reviewStatuses, 'profile.reviewStatus'],
  [materialStatuses, 'profile.verificationStatus'],
  [verificationStatuses, 'profile.verificationStatus'],
  [verificationMaterialTypes, 'verification.materialType'],
  [verificationMaterialStatuses, 'verification.materialStatus'],
  [genders, 'profile.gender'],
  [degreeLevels, 'profile.degreeLevel'],
  [maritalStatuses, 'profile.maritalStatus'],
  [childrenPlans, 'profile.childrenPlan'],
  [datingIntentions, 'profile.datingIntentionCode'],
  [relocationOptions, 'profile.relocation'],
  [smokingOptions, 'profile.smoking'],
  [drinkingOptions, 'profile.drinking'],
  [activityLevels, 'profile.activityLevel'],
  [weekendStyles, 'profile.weekendStyle'],
  [petOptions, 'profile.pets'],
  [communicationStyles, 'profile.communicationStyle'],
  [relationshipValueOptions, 'profile.relationshipValues'],
  [preferredLocationOptions, 'profile.preferredLocation'],
  [languageOptions, 'profile.languages'],
  [contactChannelOptions, 'profile.preferredChannel'],
  [contactVisibilityOptions, 'profile.contactVisibility'],
  [ownershipRelationshipOptions, 'profile.relationshipToProfile']
])

const profileCodeOptionGroups: Record<string, string> = {
  city: 'profile.city',
  country: 'profile.country',
  nationality: 'profile.nationality',
  education: 'profile.education',
  industry: 'profile.industry',
  relationship_goal: 'profile.relationshipGoal',
  residence_plan: 'profile.residencePlan',
  preferred_education: 'profile.preferredEducation',
  family_life: 'profile.familyLife',
  exercise: 'profile.exercise'
}

export async function loadCupidCommonOptions(locale: string = 'zh'): Promise<void> {
  await useCupidOptionsStore().ensureOptions(locale)
}

function commonOptionLabel(group: string | undefined, value: string, locale: string): string | undefined {
  const store = useCupidOptionsStore()
  const label = store.optionLabel(locale, group, value)
  if (!label) {
    void store.ensureOptions(locale)
  }
  return label
}

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
  machine: '机器生成',
  generated: '自动生成',
  imported: '导入'
}

export const localizedProviderLabels: Record<string, string> = {
  human: '人工',
  translation_api: '翻译接口',
  libretranslate: 'LibreTranslate',
  system: '系统'
}

export function localizedOriginLabel(row: any): string {
  if (row.provider === 'human') return '人工'
  if (row.source === 'machine' || row.provider === 'translation_api' || row.provider === 'libretranslate') {
    return '机器翻译'
  }
  return localizedSourceLabels[row.source] || localizedProviderLabels[row.provider] || row.source || row.provider || '-'
}

export function labelOf(options: OptionItem[], value: string, locale: string = 'zh'): string {
  if (value === undefined || value === null || value === '') return '-'
  const normalizedValue = String(value).toLowerCase()
  const option = options.find((item) => item.value === value || item.value.toLowerCase() === normalizedValue)
  return commonOptionLabel(optionGroupKeys.get(options), option?.value || value, locale) || option?.label || String(value)
}

export function labelsOf(options: OptionItem[], values: any[], locale: string = 'zh'): string {
  if (!Array.isArray(values) || values.length === 0) return '-'
  return values.map((item) => labelOf(options, typeof item === 'string' ? item : item.valueCode || item.languageCode, locale)).join(' / ')
}

export function profileCodeLabel(fieldName: string, value: string, locale: string = 'zh'): string {
  if (!value) return '-'
  const key = String(value)
  return commonOptionLabel(profileCodeOptionGroups[fieldName], key, locale) || key.replace(/[_-]+/g, ' ')
}

export function ageOf(birthYear: number): string {
  return birthYear ? `${new Date().getFullYear() - Number(birthYear)}岁` : '-'
}

export function yesNo(value: boolean | number, locale: string = 'zh'): string {
  if (locale === 'en') return value ? 'Yes' : 'No'
  if (locale === 'fr') return value ? 'Oui' : 'Non'
  return value ? '是' : '否'
}

export function profileTitle(row: any): string {
  return row.profileName || labelOf(profileTypes, row.profileType) || '未命名资料'
}

export function profileSummary(row: any): string {
  const parts = [
    labelOf(genders, row.gender),
    ageOf(row.birthYear),
    row.cityLabel || profileCodeLabel('city', row.cityCode),
    row.industryLabel || profileCodeLabel('industry', row.industryCode),
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
  return row?.status === 'pending'
}