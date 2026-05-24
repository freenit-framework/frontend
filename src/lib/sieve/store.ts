import { writable, get } from 'svelte/store'
import type { SieveScript, SieveScriptDetail } from './types'

export const scripts = writable<SieveScript[]>([])
export const selectedScript = writable<SieveScriptDetail | null>(null)
export const sieveLoading = writable(false)
export const sieveError = writable<string | null>(null)

export async function fetchScripts(): Promise<void> {
  sieveLoading.set(true)
  sieveError.set(null)
  try {
    const response = await fetch('/api/v1/mail/sieve/scripts')
    if (!response.ok) {
      sieveError.set(response.statusText)
      return
    }
    scripts.set(await response.json())
  } catch (e) {
    sieveError.set(e instanceof Error ? e.message : 'Failed to load scripts')
  } finally {
    sieveLoading.set(false)
  }
}

export async function fetchScript(name: string): Promise<void> {
  sieveLoading.set(true)
  sieveError.set(null)
  try {
    const response = await fetch(`/api/v1/mail/sieve/scripts/${encodeURIComponent(name)}`)
    if (!response.ok) {
      sieveError.set(response.statusText)
      return
    }
    selectedScript.set(await response.json())
  } catch (e) {
    sieveError.set(e instanceof Error ? e.message : 'Failed to load script')
  } finally {
    sieveLoading.set(false)
  }
}

export async function saveScript(name: string, content: string): Promise<void> {
  sieveLoading.set(true)
  sieveError.set(null)
  try {
    const response = await fetch(`/api/v1/mail/sieve/scripts/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!response.ok) {
      sieveError.set(response.statusText)
      return
    }
    await fetchScripts()
  } catch (e) {
    sieveError.set(e instanceof Error ? e.message : 'Failed to save script')
  } finally {
    sieveLoading.set(false)
  }
}

export async function deleteScript(name: string): Promise<void> {
  sieveLoading.set(true)
  sieveError.set(null)
  try {
    const response = await fetch(`/api/v1/mail/sieve/scripts/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      sieveError.set(response.statusText)
      return
    }
    const current = get(selectedScript)
    if (current?.name === name) {
      selectedScript.set(null)
    }
    await fetchScripts()
  } catch (e) {
    sieveError.set(e instanceof Error ? e.message : 'Failed to delete script')
  } finally {
    sieveLoading.set(false)
  }
}

export async function setActive(name: string): Promise<void> {
  sieveLoading.set(true)
  sieveError.set(null)
  try {
    const response = await fetch(`/api/v1/mail/sieve/scripts/${encodeURIComponent(name)}/active`, {
      method: 'POST',
    })
    if (!response.ok) {
      sieveError.set(response.statusText)
      return
    }
    await fetchScripts()
  } catch (e) {
    sieveError.set(e instanceof Error ? e.message : 'Failed to activate script')
  } finally {
    sieveLoading.set(false)
  }
}

export async function deactivate(name: string): Promise<void> {
  sieveLoading.set(true)
  sieveError.set(null)
  try {
    const response = await fetch(`/api/v1/mail/sieve/scripts/${encodeURIComponent(name)}/active`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      sieveError.set(response.statusText)
      return
    }
    await fetchScripts()
  } catch (e) {
    sieveError.set(e instanceof Error ? e.message : 'Failed to deactivate script')
  } finally {
    sieveLoading.set(false)
  }
}

export function newScript(): void {
  selectedScript.set({ name: '', content: '', active: false })
}
