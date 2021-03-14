import { makeAutoObservable } from 'mobx'


export default class LandingStore {
  data = null

  constructor() {
    makeAutoObservable(this)
  }
}
