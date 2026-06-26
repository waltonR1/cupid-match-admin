import { getCupidCommonOptions, type CupidCommonOptionGroups } from '@/api/cupid/options'
import cache from '@/plugins/cache'

export type CupidOptionLocale = 'zh' | 'fr' | 'en'

interface CupidOptionsStateItem {
  version: string
  groups: CupidCommonOptionGroups
  labelGroups: CupidCommonOptionGroups
}

const PERSIST_KEY = 'cupid-common-options'

function loadPersistedCache() {
  return cache.local.getJSON(PERSIST_KEY) || {}
}

function savePersistedCache(value: Partial<Record<CupidOptionLocale, CupidOptionsStateItem>>) {
  cache.local.setJSON(PERSIST_KEY, value)
}

function normalizeLocale(locale: string): CupidOptionLocale {
  if (locale === 'fr' || locale === 'en') return locale
  return 'zh'
}

const useCupidOptionsStore = defineStore('cupidOptions', {
  state: () => ({
    cache: loadPersistedCache() as Partial<Record<CupidOptionLocale, CupidOptionsStateItem>>,
    loading: {} as Partial<Record<CupidOptionLocale, boolean>>
  }),
  actions: {
    async ensureOptions(locale: string = 'zh') {
      const loc = normalizeLocale(locale)
      if (this.loading[loc]) return this.cache[loc]?.groups ?? {}

      this.loading[loc] = true
      try {
        const current = this.cache[loc]
        const res: any = await getCupidCommonOptions({ lang: loc, version: current?.labelGroups ? current.version : undefined })
        const data = res?.data
        if (!data?.unchanged && data?.groups) {
          this.cache[loc] = {
            version: data.version,
            groups: data.groups,
            labelGroups: data.labelGroups ?? data.groups
          }
          savePersistedCache(this.cache)
        }
        return this.cache[loc]?.groups ?? {}
      } finally {
        this.loading[loc] = false
      }
    },
    optionLabel(locale: string, group: string | undefined, value: string | undefined | null) {
      if (!group || value === undefined || value === null || value === '') return undefined
      const loc = normalizeLocale(locale)
      const normalizedValue = String(value).toLowerCase()
      const option = this.cache[loc]?.labelGroups?.[group]?.find((item) =>
        item.value === value || item.value.toLowerCase() === normalizedValue
      )
      return option?.label
    }
  }
})

export default useCupidOptionsStore
