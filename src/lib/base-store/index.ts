import AuthStore from './auth.svelte'
import DomainStore from './domain.svelte'
import GroupStore from './group.svelte'
import RoleStore from './role.svelte'
import ThemeStore from './theme.svelte'
import UserStore from './user.svelte'

export default class BaseStore {
  prefix: string
  auth: AuthStore
  domain: DomainStore
  group: GroupStore
  role: RoleStore
  theme: ThemeStore
  user: UserStore

  constructor(prefix = '/api/v1') {
    this.prefix = prefix
    this.auth = new AuthStore(this, prefix)
    this.domain = new DomainStore(this, prefix)
    this.group = new GroupStore(this, prefix)
    this.role = new RoleStore(this, prefix)
    this.theme = new ThemeStore(this, prefix)
    this.user = new UserStore(this, prefix)
  }
}
