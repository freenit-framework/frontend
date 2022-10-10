import RoleStore from './role'
import AuthStore from './auth'
import ThemeStore from './theme'
import UserStore from './user'

let mystore: any = null

export default function store(prefix: string = '/api/v1') {
  if (!mystore) {
    mystore = {
      auth: new AuthStore(prefix),
      role: RoleStore(prefix),
      theme: ThemeStore(prefix),
      user: UserStore(prefix),
    }
  }
  return mystore
}
