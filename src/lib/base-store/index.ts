import AuthStore from './auth.svelte'
import RoleStore from './role.svelte'
import ThemeStore from './theme.svelte'
import UserStore from './user.svelte'

export default class BaseStore {
  prefix: string
  auth: AuthStore
  role: RoleStore
  theme: ThemeStore
  user: UserStore

  constructor(prefix='/api/v1') {
    this.prefix = prefix
    this.auth = new AuthStore(this, prefix)
    this.role = new RoleStore(this, prefix)
    this.theme = new ThemeStore(this, prefix)
    this.user = new UserStore(this, prefix)
  }
}
