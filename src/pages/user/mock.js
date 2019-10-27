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
    email: 'admin@example.com',
    admin: true,
    roles: [],
  }
})


service.fetchAll = jest.fn(() => {
  if (!config.fetchAll) {
    throw new Error('Generic error')
  }
  return {
    data: [{
      id: 1,
      email: 'admin@example.com',
      admin: true,
      roles: [],
    }],
    pages: 1,
    total: 1,
  }
})


export default service
