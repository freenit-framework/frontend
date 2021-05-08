import { action, makeAutoObservable } from 'mobx'

class ResolutionStore {
  height = window.innerHeight
  width = window.innerWidth

  constructor() {
    makeAutoObservable(this)
    window.onresize = this.resize
  }

  resize = action(() => {
    this.height = window.innerHeight
    this.width = window.innerWidth
  })
}

export default new ResolutionStore()
