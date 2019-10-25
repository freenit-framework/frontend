import service from './service'

export const config = {
  login: true,
}


service.login = jest.fn(() => {
  if (!config.login) {
    throw new Error('Generic error')
  }
  return {
    access: 'aaa',
    accessExpire: 900,
    refresh: 'aaa',
    refreshExpire: 2592000,
  }
})


service.refresh = jest.fn(() => ({
  access: 'aaa',
  accessExpire: 900,
  refreshExpire: 2592000,
}))


service.register = jest.fn(() => ({
  active: false,
  admin: false,
  confirmed_at: null,
  email: "user@example.com",
  id: 1,
}))


export default service
