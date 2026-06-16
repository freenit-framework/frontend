import methods from '../methods'

export default class MailingListStore {
  store: any
  prefix: string
  list = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  publicList = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  detail = $state<any>({
    id: 0,
    name: '',
    address: '',
    distribution_address: '',
    archive_address: '',
    description: '',
    public: true,
    archive_enabled: true,
    moderation_enabled: false,
    created_at: '',
  })
  subscribers = $state([] as any[])
  archive = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  archiveMessage = $state<any>({})
  moderation = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  domains = $state([] as string[])

  constructor(store: any, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchDomains = async () => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/mailinglists/domains`)
    if (response.ok) {
      const data = await response.json()
      this.domains = data
      return { data, ok: true }
    }
    return response
  }

  fetchAll = async (page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/mailinglists`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchPublic = async (page = 1, perpage = 10) => {
    const response = await methods.get(`${this.prefix}/mailinglists/public`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.publicList = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/mailinglists`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list.data.push(data)
      this.list.total += 1
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/mailinglists/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/mailinglists/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/mailinglists/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.list.data = this.list.data.filter((item: any) => item.id !== id)
      this.list.total -= 1
      return { ...data, ok: true }
    }
    return response
  }

  fetchSubscribers = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/mailinglists/${id}/subscribers`)
    if (response.ok) {
      const data = await response.json()
      this.subscribers = data
      return { data, ok: true }
    }
    return response
  }

  fetchArchive = async (id: number, page = 1, perpage = 10) => {
    const response = await methods.get(`${this.prefix}/mailinglists/${id}/archive`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.archive = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchArchiveMessage = async (id: number, msgId: number) => {
    const response = await methods.get(`${this.prefix}/mailinglists/${id}/archive/${msgId}`)
    if (response.ok) {
      const data = await response.json()
      this.archiveMessage = data
      return { ...data, ok: true }
    }
    return response
  }

  subscribe = async (id: number, email: string) => {
    const response = await methods.post(`${this.prefix}/mailinglists/${id}/subscribe`, { email })
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  confirm = async (id: number, token: string) => {
    const response = await methods.get(`${this.prefix}/mailinglists/${id}/confirm/${token}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  unsubscribe = async (id: number, email: string) => {
    const response = await methods.post(`${this.prefix}/mailinglists/${id}/unsubscribe`, { email })
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  unsubscribeConfirm = async (id: number, token: string) => {
    const response = await methods.get(`${this.prefix}/mailinglists/${id}/unsubscribe/${token}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  fetchModeration = async (id: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/mailinglists/${id}/moderation`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.moderation = data
      return { ...data, ok: true }
    }
    return response
  }

  approve = async (id: number, msgId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(
      `${this.prefix}/mailinglists/${id}/moderation/${msgId}/approve`,
      {},
    )
    if (response.ok) {
      const data = await response.json()
      this.moderation.data = this.moderation.data.filter((item: any) => item.id !== msgId)
      return { ...data, ok: true }
    }
    return response
  }

  reject = async (id: number, msgId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(
      `${this.prefix}/mailinglists/${id}/moderation/${msgId}/reject`,
      {},
    )
    if (response.ok) {
      const data = await response.json()
      this.moderation.data = this.moderation.data.filter((item: any) => item.id !== msgId)
      return { ...data, ok: true }
    }
    return response
  }

  process = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/mailinglists/${id}/process`, {})
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }
}
