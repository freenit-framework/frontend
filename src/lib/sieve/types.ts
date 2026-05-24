export interface SieveScript {
  name: string
  active: boolean
}

export interface SieveScriptDetail extends SieveScript {
  content: string
}
