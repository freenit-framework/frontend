export const dbtype = (data) => {
  if (!data) {
    return null
  }
  if (data.id) {
    return 'sql'
  }
  if (data.dn) {
    return 'ldap'
  }
}

export const id = (data) => {
  const dbt = dbtype(data)
  if (dbt === 'sql') {
    return data.id
  }
  if (dbt === 'ldap') {
    return data.dn
  }
}

export const uid = (data) => {
  const dbt = dbtype(data)
  if (dbt === 'sql') {
    return data.id
  }
  if (dbt === 'ldap') {
    if (data.uidNumber) {
      return data.uidNumber
    }
    if (data.gidNumber) {
      return data.gidNumber
    }
  }
}

export const name = (data) => {
  const dbt = dbtype(data)
  if (dbt === 'sql') {
    return data.name
  }
  if (dbt === 'ldap') {
    return data.cn
  }
}
