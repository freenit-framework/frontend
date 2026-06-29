import { page } from '$app/stores'
import store from '$lib/store'
import { chatStore } from '$lib/chat/store.svelte'
import { initMail, disconnectMailWebSocket, setMailCurrentPath } from '$lib/mail/store'

let mailStarted = false

export function initConnectivity() {
  // Keep mail/chat stores aware of the current route so notifications are
  // suppressed only while the user is actually viewing that module.
  $effect(() => {
    const unsubscribe = page.subscribe(($page) => {
      const path = $page.url.pathname
      chatStore.currentPath = path
      setMailCurrentPath(path)
    })
    return unsubscribe
  })

  // Start/stop real-time connections based on login state and enabled modules.
  $effect(() => {
    const loggedIn = store.auth.loggedin()
    const modules = store.modules
    const modulesLoaded = store.modulesLoaded
    const email = store.user.profile?.email

    if (loggedIn && modulesLoaded && modules.includes('chat') && email) {
      if (!chatStore.connected && !chatStore.connecting) {
        chatStore.connect(email)
      }
    }

    if (!loggedIn) {
      chatStore.disconnect()
    }

    if (loggedIn && modulesLoaded && modules.includes('mail')) {
      if (!mailStarted) {
        mailStarted = true
        initMail()
      }
    }

    if (!loggedIn) {
      if (mailStarted) {
        mailStarted = false
        disconnectMailWebSocket()
      }
    }
  })
}
