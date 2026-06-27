import useCupidOptionsStore from '@/store/modules/cupidOptions'

export type ReviewLocale = 'zh' | 'fr' | 'en'

type OptionItem = { label: string; value: string }
type OptionGroup = { group: string; values: string[] }

function optionGroup(group: string, values: string[]): OptionGroup {
  return { group, values }
}

export const profileTypes = optionGroup('profile.profileType', ['self', 'family'])
export const profileStatuses = optionGroup('profile.profileStatus', ['draft', 'review', 'open', 'paused', 'hidden'])
export const photoStatuses = optionGroup('profile.photoStatus', ['review', 'approved', 'rejected', 'hidden'])
export const reviewStatuses = optionGroup('profile.reviewStatus', ['unreviewed', 'pending', 'approved', 'rejected'])
export const materialStatuses = optionGroup('profile.verificationStatus', ['unverified', 'pending', 'verified', 'rejected'])
export const verificationStatuses = materialStatuses
export const verificationMaterialTypes = optionGroup('verification.materialType', ['identity', 'education', 'income', 'marital'])
export const verificationMaterialStatuses = optionGroup('verification.materialStatus', ['pending', 'approved', 'rejected'])
export const scanStatuses = optionGroup('verification.scanStatus', ['pending', 'passed', 'failed'])
export const genders = optionGroup('profile.gender', ['male', 'female'])
export const degreeLevels = optionGroup('profile.degreeLevel', ['bachelor', 'master', 'phd'])
export const maritalStatuses = optionGroup('profile.maritalStatus', ['never_married', 'divorced', 'widowed'])
export const childrenPlans = optionGroup('profile.childrenPlan', ['wants', 'open_to_discuss', 'does_not_want'])
export const datingIntentions = optionGroup('profile.datingIntentionCode', ['serious', 'marriage', 'exclusive', 'cross_border'])
export const relocationOptions = optionGroup('profile.relocation', ['willing', 'unwilling', 'open_to_discuss'])
export const smokingOptions = optionGroup('profile.smoking', ['never', 'social', 'often'])
export const drinkingOptions = optionGroup('profile.drinking', ['never', 'social', 'often'])
export const activityLevels = optionGroup('profile.activityLevel', ['low', 'moderate', 'high'])
export const weekendStyles = optionGroup('profile.weekendStyle', ['outdoors', 'indoors', 'social', 'flexible'])
export const petOptions = optionGroup('profile.pets', ['has', 'none', 'likes'])
export const communicationStyles = optionGroup('profile.communicationStyle', ['direct', 'indirect', 'balanced'])
export const relationshipValueOptions = optionGroup('profile.relationshipValues', [
  'honesty',
  'trust',
  'communication',
  'respect',
  'loyalty',
  'family',
  'growth',
  'support',
  'humor',
  'ambition',
  'kindness',
  'independence',
  'romance',
  'stability'
])
export const preferredLocationOptions = optionGroup('profile.preferredLocation', ['local', 'regional', 'national', 'international'])
export const languageOptions = optionGroup('profile.languages', ['ZH', 'EN', 'FR', 'ES', 'DE'])
export const localizedStatuses = optionGroup('localized.status', ['pending', 'ready', 'failed', 'stale'])
export const contactChannelOptions = optionGroup('profile.preferredChannel', ['phone', 'email', 'wechat'])
export const contactVisibilityOptions = optionGroup('profile.contactVisibility', ['after_introduction', 'owner_only', 'disabled'])
export const ownershipRelationshipOptions = optionGroup('profile.relationshipToProfile', ['self', 'parent', 'father', 'mother', 'relative'])
export const ownershipPermissionOptions = optionGroup('profile.ownershipPermission', ['owner', 'manager'])
export const ownershipStatusOptions = optionGroup('profile.ownershipStatus', ['pending', 'active', 'revoked'])
export const internalRecordSourceOptions = optionGroup('profile.internalRecordSource', ['self_submitted', 'family_submitted', 'staff_collected'])
export const introductionStatuses = optionGroup('introduction.status', ['requested', 'accepted', 'declined', 'cancelled', 'expired', 'cooldown'])

export const introductionSortOptions = [
  { label: '待受理优先', value: 'pendingFirst' },
  { label: '申请时间最新', value: 'requestedDesc' },
  { label: '更新时间最新', value: 'updatedDesc' },
  { label: '目标资料名称', value: 'targetProfileNameAsc' },
  { label: '申请人名称', value: 'requesterNameAsc' }
]

export const eventStatuses = optionGroup('event.status', ['draft', 'open', 'waitlist', 'closed', 'completed', 'hidden'])
export const eventVisibilityOptions = optionGroup('event.visibility', ['public', 'registered', 'member'])
export const eventAddressVisibilityOptions = optionGroup('event.addressVisibility', ['registered_only', 'confirmed_attendee_only'])
export const eventRegStatuses = optionGroup('event.registrationStatus', ['requested', 'confirmed', 'waitlist', 'declined', 'cancelled', 'attended'])

export const eventSortOptions = [
  { label: '日期最新', value: 'dateDesc' },
  { label: '创建时间最新', value: 'createdDesc' }
]

export const registrationSortOptions = [
  { label: '申请时间最新', value: 'requestedDesc' },
  { label: '更新时间最新', value: 'updatedDesc' },
  { label: '活动名称', value: 'eventTitleAsc' },
  { label: '用户名称', value: 'userNameAsc' }
]



export const adminReviewSortOptions = [
  { label: '待审核优先', value: 'reviewFirst' },
  { label: '更新时间最新', value: 'updatedDesc' },
  { label: '资料名称', value: 'profileNameAsc' },
  { label: '用户名称', value: 'userNameAsc' }
]

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
  return store.optionLabel(locale, group, value)
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

export function localizedOriginLabel(row: any, locale: string = 'zh'): string {
  if (row.provider === 'human') return commonOptionLabel('localized.provider', 'human', locale) || 'human'
  if (row.source === 'machine' || row.provider === 'translation_api' || row.provider === 'libretranslate') {
    return commonOptionLabel('localized.provider', 'translation_api', locale) || 'translation_api'
  }
  const value = row.source || row.provider
  if (!value) return '-'
  return commonOptionLabel(row.source ? 'localized.source' : 'localized.provider', value, locale) || value
}

export function labelOf(options: OptionGroup, value: string | undefined | null, locale: string = 'zh'): string {
  if (value === undefined || value === null || value === '') return '-'
  const rawValue = String(value)
  const normalizedValue = rawValue.toLowerCase()
  const optionValue = options.values.find((item) => item === rawValue || item.toLowerCase() === normalizedValue) || rawValue
  return commonOptionLabel(options.group, optionValue, locale) || rawValue
}

export function optionsOf(options: OptionGroup, locale: string = 'zh'): OptionItem[] {
  return options.values.map((value) => ({
    value,
    label: labelOf(options, value, locale)
  }))
}

export function optionsForGroup(group: string, locale: string = 'zh'): OptionItem[] {
  const store = useCupidOptionsStore()
  const groups = store.cache?.[locale as ReviewLocale]?.groups ?? {}
  return (groups[group] ?? []).map((item) => ({
    value: item.value,
    label: item.label
  }))
}

export function labelsOf(options: OptionGroup, values: any[], locale: string = 'zh'): string {
  if (!Array.isArray(values) || values.length === 0) return '-'
  return values.map((item) => labelOf(options, typeof item === 'string' ? item : item.valueCode || item.languageCode, locale)).join(' / ')
}

export function profileCodeLabel(fieldName: string, value: string, locale: string = 'zh'): string {
  if (!value) return '-'
  const key = String(value)
  return commonOptionLabel(profileCodeOptionGroups[fieldName], key, locale) || key
}

export function ageOf(birthYear: number): string {
  return birthYear ? String(new Date().getFullYear() - Number(birthYear)) + '岁' : '-'
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
