import RoleStore from './role'
import AuthStore from './auth'
import ThemeStore from './theme'
import UserStore from './user'

let global_store: any = null

export default function store(prefix: string = '/api/v1') {
  if (!global_store) {
    global_store = {
      auth: new AuthStore(prefix),
      role: RoleStore(prefix),
      theme: ThemeStore(prefix),
      user: UserStore(prefix),
    }
  }
  return global_store
}
