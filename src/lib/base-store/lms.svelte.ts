import methods from '../methods'

export default class LMSStore {
  store: any
  prefix: string

  list = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  detail = $state<any>({ id: 0, name: '', description: '', created_by_id: null })
  lectures = $state([] as any[])
  lectureDetail = $state<any>({ id: 0, course_id: 0, title: '', content: '', position: 0 })
  groups = $state([] as any[])
  groupDetail = $state<any>({ id: 0, course_id: 0, name: '', description: '', permissions: [] })
  groupMembers = $state([] as any[])

  constructor(store: any, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  // Courses

  fetchAll = async (page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/courses`, { page, perpage })
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/courses`, fields)
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
    const response = await methods.get(`${this.prefix}/courses/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/courses/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      this.list.data = this.list.data.map((item: any) => (item.id === id ? data : item))
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/courses/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.list.data = this.list.data.filter((item: any) => item.id !== id)
      this.list.total -= 1
      return { ...data, ok: true }
    }
    return response
  }

  // Lectures

  fetchLectures = async (courseId: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/courses/${courseId}/lectures`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.lectures = data.data
      return { ...data, ok: true }
    }
    return response
  }

  createLecture = async (courseId: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/courses/${courseId}/lectures`, fields)
    if (response.ok) {
      const data = await response.json()
      this.lectures.push(data)
      return { ...data, ok: true }
    }
    return response
  }

  fetchLecture = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/lectures/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.lectureDetail = data
      return { ...data, ok: true }
    }
    return response
  }

  editLecture = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/lectures/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.lectureDetail = data
      this.lectures = this.lectures.map((item: any) => (item.id === id ? data : item))
      return { ...data, ok: true }
    }
    return response
  }

  destroyLecture = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/lectures/${id}`)
    if (response.ok) {
      this.lectures = this.lectures.filter((item: any) => item.id !== id)
      return { ok: true }
    }
    return response
  }

  // Course Groups

  fetchGroups = async (courseId: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/courses/${courseId}/groups`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.groups = data.data
      return { ...data, ok: true }
    }
    return response
  }

  createGroup = async (courseId: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/courses/${courseId}/groups`, fields)
    if (response.ok) {
      const data = await response.json()
      this.groups.push(data)
      return { ...data, ok: true }
    }
    return response
  }

  fetchGroup = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/course-groups/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.groupDetail = data
      return { ...data, ok: true }
    }
    return response
  }

  editGroup = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/course-groups/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.groupDetail = data
      this.groups = this.groups.map((item: any) => (item.id === id ? data : item))
      return { ...data, ok: true }
    }
    return response
  }

  destroyGroup = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/course-groups/${id}`)
    if (response.ok) {
      this.groups = this.groups.filter((item: any) => item.id !== id)
      return { ok: true }
    }
    return response
  }

  setGroupPermissions = async (groupId: number, permissions: string[]) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/course-groups/${groupId}`, {
      permissions,
    })
    if (response.ok) {
      const data = await response.json()
      this.groupDetail = data
      this.groups = this.groups.map((group: any) => (group.id === groupId ? data : group))
      return { ...data, ok: true }
    }
    return response
  }

  // Course Group Members

  fetchGroupMembers = async (groupId: number, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/course-groups/${groupId}/members`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.groupMembers = data.data
      return { ...data, ok: true }
    }
    return response
  }

  addGroupMember = async (groupId: number, userId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/course-groups/${groupId}/members`, {
      user_id: userId,
    })
    if (response.ok) {
      const data = await response.json()
      this.groupMembers.push(data)
      return { ...data, ok: true }
    }
    return response
  }

  removeGroupMember = async (groupId: number, userId: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(
      `${this.prefix}/course-groups/${groupId}/members/${userId}`,
    )
    if (response.ok) {
      this.groupMembers = this.groupMembers.filter((member: any) => member.user_id !== userId)
      return { ok: true }
    }
    return response
  }
}
