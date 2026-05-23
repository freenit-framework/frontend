import { writable } from 'svelte/store'
import { davRequest, parseMultiStatus, extractRelPath } from '$lib/dav'

export interface FileEntry {
  name: string
  href: string        // API-relative path: /file/path/to/name
  isDir: boolean
  size: string
  modified: string
  contentType: string
}

export const currentPath = writable('/')
export const entries = writable<FileEntry[]>([])
export const filesLoading = writable(false)
export const filesError = writable('')

const PROPFIND_BODY = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:">
  <D:prop>
    <D:resourcetype/>
    <D:getcontenttype/>
    <D:getcontentlength/>
    <D:getlastmodified/>
    <D:displayname/>
  </D:prop>
</D:propfind>`

export async function listDirectory(path: string) {
  filesLoading.set(true)
  filesError.set('')
  currentPath.set(path)

  const apiPath = `/file${path === '/' ? '' : path}`
  const { status, text } = await davRequest('PROPFIND', apiPath || '/file', {
    body: PROPFIND_BODY,
    depth: '1',
  })

  if (status !== 207) {
    filesError.set(`Failed to list directory: HTTP ${status}`)
    filesLoading.set(false)
    return
  }

  const results = parseMultiStatus(text)
    .map((r): FileEntry | null => {
      const rel = extractRelPath(r.href, 'file')
      if (rel === undefined) return null

      const isDir = r.props['resourcetype']?.includes('collection') ?? false
      const name = rel.split('/').filter(Boolean).pop() ?? rel
      const normalizedRel = rel.endsWith('/') ? rel.slice(0, -1) : rel

      // Skip the directory entry for the current directory itself
      const currentRel = path === '/' ? '' : path.replace(/^\//, '').replace(/\/$/, '')
      if (normalizedRel === currentRel) return null

      return {
        name: name || '/',
        href: `/file/${rel}`,
        isDir,
        size: r.props['getcontentlength'] ?? '',
        modified: r.props['getlastmodified'] ?? '',
        contentType: r.props['getcontenttype'] ?? '',
      }
    })
    .filter((e): e is FileEntry => e !== null)
    .sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  entries.set(results)
  filesLoading.set(false)
}

export async function createFolder(path: string, name: string) {
  const href = `/file${path === '/' ? '' : path}/${name}`
  const { status } = await davRequest('MKCOL', href)
  if (status >= 400) throw new Error(`Failed to create folder: HTTP ${status}`)
  await listDirectory(path)
}

export async function deleteEntry(entry: FileEntry, currentDir: string) {
  const { status } = await davRequest('DELETE', entry.href)
  if (status >= 400) throw new Error(`Failed to delete: HTTP ${status}`)
  await listDirectory(currentDir)
}

export async function uploadFile(path: string, file: File) {
  const href = `/file${path === '/' ? '' : path}/${file.name}`
  const resp = await fetch(`/api/v1${href}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
    credentials: 'include',
  })
  if (resp.status >= 400) throw new Error(`Upload failed: HTTP ${resp.status}`)
  await listDirectory(path)
}

export function downloadUrl(entry: FileEntry): string {
  return `/api/v1${entry.href}`
}

export function formatSize(bytes: string): string {
  const n = parseInt(bytes, 10)
  if (isNaN(n)) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}
