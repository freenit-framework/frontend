export { default as LeftPane } from './LeftPane.svelte'
export { default as Login } from './Login.svelte'
export { default as Modal } from './Modal.svelte'
export { default as Register } from './Register.svelte'
export { default as Role } from './Role.svelte'
export { default as Roles } from './Roles.svelte'
export { default as Spinner } from './Spinner.svelte'
export { default as Theme } from './Theme.svelte'
export { default as Themes } from './Themes.svelte'
export { default as User } from './User.svelte'
export { default as Users } from './Users.svelte'

export { default as methods } from './methods'
export * as notification from './notification'

import AuthStore from './auth.svelte.js'
import RoleStore from './role.svelte.js'
import ThemeStore from './theme.svelte.js'
import UserStore from './user.svelte.js'


export interface Store {
  auth: AuthStore
  role: RoleStore
  theme: ThemeStore
  user: UserStore
}


export const store: Store = {}


export function create_store(prefix = '/api/v1') {
  if (store.auth === undefined) {
    new AuthStore(prefix)
    new RoleStore(prefix)
    new ThemeStore(prefix)
    new UserStore(prefix)
  }
  return store
}
