import AuthStore from './auth.svelte.ts'
import RoleStore from './role.svelte.ts'
import ThemeStore from './theme.svelte.ts'
import UserStore from './user.svelte.ts'


export const store = {}


export function create_store(prefix: str = '/api/v1') {
  store.auth = new AuthStore(prefix)
  store.role = new RoleStore(prefix)
  store.theme = new ThemeStore(prefix)
  store.user = new UserStore(prefix)
}
