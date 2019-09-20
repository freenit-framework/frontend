import store from './store'
import detail from './detail'
import list from './list'


export default {
  store,
  detail,
  list,
  initial: {
    detail: {},
    list: {
      data: [],
      page: 0,
      total: 0,
    },
  },
}
