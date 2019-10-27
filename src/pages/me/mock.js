import service from './service'

export const config = {
  fetch: true,
}


service.fetch = jest.fn(() => {
  if (!config.fetch) {
    throw new Error('Generic error')
  }
  return {
    id: 1,
    admin: true,
    email: 'admin@example.com',
  }
})


export default service
