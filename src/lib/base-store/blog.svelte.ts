import methods from '../methods'

export default class BlogStore {
  store: any
  prefix: string

  list = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  detail = $state<any>({
    id: 0,
    title: '',
    slug: '',
    content: '',
    date: '',
    published: false,
    author_id: null,
    tags: [] as string[],
    created_at: '',
    updated_at: '',
  })
  publicList = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  publicDetail = $state<any>({
    id: 0,
    title: '',
    slug: '',
    content: '',
    date: '',
    published: false,
    author_id: null,
    tags: [] as string[],
    created_at: '',
    updated_at: '',
  })
  tagList = $state([] as any[])
  tagPosts = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })

  constructor(store: any, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  // Admin

  fetchAll = async (page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/blog`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/blog`, fields)
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
    const response = await methods.get(`${this.prefix}/blog/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/blog/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/blog/${id}`)
    if (response.ok) {
      this.list.data = this.list.data.filter((item: any) => item.id !== id)
      this.list.total -= 1
      return { ok: true }
    }
    return response
  }

  // Public

  fetchPublic = async (page = 1, perpage = 10) => {
    const response = await methods.get(`${this.prefix}/blog/public`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.publicList = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchPublicPost = async (slug: string) => {
    const response = await methods.get(`${this.prefix}/blog/public/${slug}`)
    if (response.ok) {
      const data = await response.json()
      this.publicDetail = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchTags = async () => {
    const response = await methods.get(`${this.prefix}/blog/tags`)
    if (response.ok) {
      const data = await response.json()
      this.tagList = data
      return { data, ok: true }
    }
    return response
  }

  fetchPostsByTag = async (name: string, page = 1, perpage = 10) => {
    const response = await methods.get(`${this.prefix}/blog/tags/${name}/posts`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.tagPosts = data
      return { ...data, ok: true }
    }
    return response
  }
}
