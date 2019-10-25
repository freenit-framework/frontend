import service from './service'


service.login = jest.fn(() => ({
  access: 'aaa',
  accessExpire: 900,
  refresh: 'aaa',
  refreshExpire: 2592000,
}))


service.refresh = jest.fn(() => ({
  access: 'aaa',
  accessExpire: 900,
  refreshExpire: 2592000,
}))


export default service
