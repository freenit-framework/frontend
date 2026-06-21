import methods from '../methods'

export default class GitStore {
  store: any
  prefix: string
  list = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  publicList = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  detail = $state<any>({
    id: 0,
    project_id: 0,
    name: '',
    path: '',
    description: '',
    public: false,
    default_branch: 'main',
    tests_enabled: false,
    test_command: '',
    created_at: '',
    updated_at: '',
  })
  permissions = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  pushLog = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  hooks = $state<Record<string, string>>({})
  refs = $state([] as any[])
  commits = $state([] as any[])
  tree = $state([] as any[])
  blob = $state<any>(null)
  readme = $state<any>(null)
  cloneUrl = $state('')

  constructor(store: any, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchAll = async (page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchPublic = async (page = 1, perpage = 10) => {
    const response = await methods.get(`${this.prefix}/git/repos/public`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.publicList = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/git/repos`, fields)
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
    const response = await methods.get(`${this.prefix}/git/repos/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/git/repos/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/git/repos/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.list.data = this.list.data.filter((item: any) => item.id !== id)
      this.list.total -= 1
      return { ...data, ok: true }
    }
    return response
  }

  fetchPermissions = async (id: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/permissions`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.permissions = data
      return { ...data, ok: true }
    }
    return response
  }

  addPermission = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/git/repos/${id}/permissions`, fields)
    if (response.ok) {
      const data = await response.json()
      this.permissions.data.push(data)
      this.permissions.total += 1
      return { ...data, ok: true }
    }
    return response
  }

  removePermission = async (id: number, permId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/git/repos/${id}/permissions/${permId}`)
    if (response.ok) {
      const data = await response.json()
      this.permissions.data = this.permissions.data.filter((item: any) => item.id !== permId)
      this.permissions.total -= 1
      return { ...data, ok: true }
    }
    return response
  }

  fetchPushLog = async (id: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/push-log`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.pushLog = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchHooks = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/hooks`)
    if (response.ok) {
      const data = await response.json()
      this.hooks = data
      return { data, ok: true }
    }
    return response
  }

  fetchRefs = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/refs`)
    if (response.ok) {
      const data = await response.json()
      this.refs = data
      return { data, ok: true }
    }
    return response
  }

  fetchCommits = async (id: number, ref = 'main', page = 1, perpage = 20) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/commits?ref=${ref}`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.commits = data
      return { data, ok: true }
    }
    return response
  }

  fetchTree = async (id: number, ref = 'main', path = '') => {
    await this.store.auth.refresh_token()
    const query = path ? `&path=${encodeURIComponent(path)}` : ''
    const response = await methods.get(`${this.prefix}/git/repos/${id}/tree?ref=${ref}${query}`)
    if (response.ok) {
      const data = await response.json()
      this.tree = data
      return { data, ok: true }
    }
    return response
  }

  fetchBlob = async (id: number, ref = 'main', path = '') => {
    await this.store.auth.refresh_token()
    const response = await methods.get(
      `${this.prefix}/git/repos/${id}/blob?ref=${ref}&path=${encodeURIComponent(path)}`,
    )
    if (response.ok) {
      const data = await response.json()
      this.blob = data
      return { data, ok: true }
    }
    return response
  }

  fetchReadme = async (id: number, ref = 'main') => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/readme?ref=${ref}`)
    if (response.ok) {
      const data = await response.json()
      this.readme = data
      return { data, ok: true }
    }
    return response
  }

  fetchCloneUrl = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/git/repos/${id}/clone-url`)
    if (response.ok) {
      const data = await response.json()
      this.cloneUrl = data.clone_url
      return { data, ok: true }
    }
    return response
  }
}
