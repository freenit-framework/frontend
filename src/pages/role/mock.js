import service from './service'

export const config = {
  fetch: true,
  fetchAll: true,
}


service.fetch = jest.fn(() => {
  if (!config.fetch) {
    throw new Error('Generic error')
  }
  return {
    id: 1,
    name: 'role',
    description: 'General role',
    users: [],
  }
})


service.fetchAll = jest.fn(() => {
  if (!config.fetchAll) {
    throw new Error('Generic error')
  }
  return {
    data: [{
      id: 1,
      name: 'role',
      description: 'General role',
      users: [],
    }],
    pages: 1,
    total: 1,
  }
})


service.create = jest.fn(() => {
  return {
    id: 2,
    name: 'newrole',
    description: 'General role 2',
  }
})


export default service
