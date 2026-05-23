const API = '/api/v1'

export interface MultiResponse {
  href: string
  props: Record<string, string>
  status: number
}

export async function davRequest(
  method: string,
  path: string,
  options: {
    body?: string
    contentType?: string
    depth?: string
    headers?: Record<string, string>
  } = {},
): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = {
    'Content-Type': options.contentType ?? 'application/xml; charset=utf-8',
    ...options.headers,
  }
  if (options.depth !== undefined) headers['Depth'] = options.depth

  const resp = await fetch(`${API}${path}`, {
    method,
    headers,
    body: options.body,
    credentials: 'include',
  })
  return { status: resp.status, text: await resp.text() }
}

function byLocalName(root: Document | Element, name: string): Element[] {
  return Array.from(root.getElementsByTagName('*')).filter(
    (el) => el.localName.toLowerCase() === name.toLowerCase(),
  )
}

export function parseMultiStatus(xml: string): MultiResponse[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return byLocalName(doc, 'response').map((resp) => {
    const href = byLocalName(resp, 'href')[0]?.textContent?.trim() ?? ''
    const statusText = byLocalName(resp, 'status')[0]?.textContent?.trim() ?? ''
    const status = parseInt(statusText.split(' ')[1] ?? '200', 10)
    const props: Record<string, string> = {}

    byLocalName(resp, 'prop').forEach((propEl) => {
      Array.from(propEl.children).forEach((child) => {
        if (child.localName === 'resourcetype') {
          props['resourcetype'] = Array.from(child.children)
            .map((c) => c.localName)
            .join('|')
        } else {
          props[child.localName] = child.textContent?.trim() ?? ''
        }
      })
    })

    return { href, props, status }
  })
}

// Extract the path segment within a collection from a Stalwart-internal href.
// e.g. /dav/cal/user@host.com/Personal/event.ics → Personal/event.ics
export function extractRelPath(href: string, type: 'cal' | 'card' | 'file'): string {
  const m = href.match(new RegExp(`/dav/${type}/[^/]+/(.*)`))
  return m?.[1] ?? ''
}
