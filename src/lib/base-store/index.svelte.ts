import methods from '../methods'
import AuthStore from './auth.svelte'
import BlogStore from './blog.svelte'
import DomainStore from './domain.svelte'
import GitStore from './git.svelte'
import GroupStore from './group.svelte'
import LMSStore from './lms.svelte'
import MailingListStore from './mailinglist.svelte'
import ProjectStore from './project.svelte'
import RoleStore from './role.svelte'
import UserStore from './user.svelte'

export default class BaseStore {
  prefix: string
  // The auth stack is always present; optional modules are discovered at runtime.
  modules: string[] = $state(['auth', 'user', 'role'])
  modulesLoaded: boolean = $state(false)
  auth: AuthStore
  blog: BlogStore
  domain: DomainStore
  git: GitStore
  group: GroupStore
  lms: LMSStore
  mailinglist: MailingListStore
  project: ProjectStore
  role: RoleStore
  user: UserStore

  constructor(prefix = '/api/v1') {
    this.prefix = prefix
    this.auth = new AuthStore(this, prefix)
    this.blog = new BlogStore(this, prefix)
    this.domain = new DomainStore(this, prefix)
    this.git = new GitStore(this, prefix)
    this.group = new GroupStore(this, prefix)
    this.lms = new LMSStore(this, prefix)
    this.mailinglist = new MailingListStore(this, prefix)
    this.project = new ProjectStore(this, prefix)
    this.role = new RoleStore(this, prefix)
    this.user = new UserStore(this, prefix)
  }

  hasModule = (name: string): boolean => {
    return this.modules.includes(name)
  }

  loadModules = async (): Promise<void> => {
    if (this.modulesLoaded) return
    const response = await methods.get(`${this.prefix}/`)
    if (response.ok) {
      const data = await response.json()
      this.modules = data.modules || []
    } else {
      this.modules = []
    }
    this.modulesLoaded = true
  }
}
