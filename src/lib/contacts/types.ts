export interface Addressbook {
  name: string
  displayName: string
}

export interface Contact {
  uid: string
  href: string // API-relative path: /card/{book}/{uid}.vcf
  etag: string
  addressbook: string
  displayName: string
  firstName: string
  lastName: string
  emails: string[]
  phones: string[]
  org: string
  note: string
}
