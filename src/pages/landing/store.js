import { makeAutoObservable } from 'mobx'

class LandingStore {
  data = null

  constructor() {
    makeAutoObservable(this)
  }
}

export default new LandingStore()
