export const renderTemplate = (tpl: string, vars: Record<string, any>) => {
  const map = Object.entries(vars || {}).reduce((acc, [k, v]) => {
    acc[String(k)] = v === null || v === undefined ? '' : String(v)
    return acc
  }, {} as Record<string, string>)
  return String(tpl || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return map[key] ?? ''
  })
}

