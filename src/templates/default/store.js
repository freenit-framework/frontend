import { decorate, observable } from 'mobx'


export default decorate(
  class TitleStore {
    title = ''
  },

  { title: observable },
)
