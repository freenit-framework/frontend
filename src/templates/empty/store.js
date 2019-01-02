import { decorate, observable } from 'mobx'


export default decorate(
  class ErrorStore {
    message = ''

    open = false
  },

  {
    message: observable,
    open: observable,
  },
)
