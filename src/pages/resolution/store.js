import { observable } from 'mobx'

class ResolutionStore {
  height = observable(window.innerHeight)
  width = observable(window.innerWidth)

  constructor() {
    window.onresize = () => {
      this.height = window.innerHeight
      this.width = window.innerWidth
    }
  }
}

export default new ResolutionStore()
