import AuthStore from './auth.svelte.js'
import RoleStore from './role.svelte.js'
import ThemeStore from './theme.svelte.js'
import UserStore from './user.svelte.js'


export const store = {}


export function create_store(prefix = '/api/v1') {
  store.auth = new AuthStore(prefix)
  store.role = new RoleStore(prefix)
  store.theme = new ThemeStore(prefix)
  store.user = new UserStore(prefix)
}
