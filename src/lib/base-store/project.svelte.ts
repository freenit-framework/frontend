import methods from '../methods'

export default class ProjectStore {
  store: any
  prefix: string

  list = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  detail = $state<any>({ id: 0, name: '', description: '', created_by_id: null })

  boardList = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  boardDetail = $state<any>({ id: 0, project_id: 0, name: '', description: '' })

  columns = $state([] as any[])
  tasks = $state([] as any[])

  constructor(store: any, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  // Projects

  fetchAll = async (page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/projects`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/projects`, fields)
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
    const response = await methods.get(`${this.prefix}/projects/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/projects/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/projects/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.list.data = this.list.data.filter((item: any) => item.id !== id)
      this.list.total -= 1
      return { ...data, ok: true }
    }
    return response
  }

  // Boards

  fetchBoards = async (projectId: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/projects/${projectId}/boards`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.boardList = data
      return { ...data, ok: true }
    }
    return response
  }

  createBoard = async (projectId: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/projects/${projectId}/boards`, fields)
    if (response.ok) {
      const data = await response.json()
      this.boardList.data.push(data)
      this.boardList.total += 1
      return { ...data, ok: true }
    }
    return response
  }

  fetchBoard = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/boards/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.boardDetail = data
      return { ...data, ok: true }
    }
    return response
  }

  editBoard = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/boards/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.boardDetail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroyBoard = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/boards/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.boardList.data = this.boardList.data.filter((item: any) => item.id !== id)
      this.boardList.total -= 1
      return { ...data, ok: true }
    }
    return response
  }

  // Columns

  fetchColumns = async (boardId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/boards/${boardId}/columns`)
    if (response.ok) {
      const data = await response.json()
      this.columns = data.data
      return { ...data, ok: true }
    }
    return response
  }

  createColumn = async (boardId: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/boards/${boardId}/columns`, fields)
    if (response.ok) {
      const data = await response.json()
      this.columns.push(data)
      return { ...data, ok: true }
    }
    return response
  }

  editColumn = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/columns/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.columns = this.columns.map((column: any) => (column.id === id ? data : column))
      return { ...data, ok: true }
    }
    return response
  }

  destroyColumn = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/columns/${id}`)
    if (response.ok) {
      this.columns = this.columns.filter((column: any) => column.id !== id)
      this.tasks = this.tasks.filter((task: any) => task.column_id !== id)
      return { ok: true }
    }
    return response
  }

  // Tasks

  fetchTasks = async (columnId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/columns/${columnId}/tasks`)
    if (response.ok) {
      const data = await response.json()
      const existing = this.tasks.filter((task: any) => task.column_id !== columnId)
      this.tasks = [...existing, ...data.data]
      return { ...data, ok: true }
    }
    return response
  }

  createTask = async (columnId: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/columns/${columnId}/tasks`, fields)
    if (response.ok) {
      const data = await response.json()
      this.tasks.push(data)
      return { ...data, ok: true }
    }
    return response
  }

  editTask = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/tasks/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.tasks = this.tasks.map((task: any) => (task.id === id ? data : task))
      return { ...data, ok: true }
    }
    return response
  }

  destroyTask = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/tasks/${id}`)
    if (response.ok) {
      this.tasks = this.tasks.filter((task: any) => task.id !== id)
      return { ok: true }
    }
    return response
  }
}
