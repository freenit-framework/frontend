import { makeAutoObservable } from 'mobx'


export default class ResolutionStore {
  height = window.innerHeight
  width = window.innerWidth

  constructor() {
    makeAutoObservable(this)
    window.onresize = () => {
      this.height = window.innerHeight
      this.width = window.innerWidth
    }
  }
}
