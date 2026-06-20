import type { ConfigRecord, ConfigRecordValue } from './types'

export function buildPayload(draft: ConfigRecord): { key: string; value: ConfigRecordValue } {
  const { group, label, description, inputType, value, required, active, validations, options, switches } = draft.value

  const out: ConfigRecordValue = { group, label, inputType, value }
  if (description) out.description = description
  if (required === true) out.required = true
  if (active === false) out.active = false
  if (validations && validations.length > 0) out.validations = validations
  if (inputType === 'select' && options) out.options = options
  if (inputType === 'switch-group' && switches) out.switches = switches

  return { key: draft.key, value: out }
}

export function syntaxHighlight(json: string): string {
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        return /:$/.test(match)
          ? `<span style="color:#9cdcfe">${match}</span>`
          : `<span style="color:#ce9178">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span style="color:#569cd6">${match}</span>`
      if (/null/.test(match)) return `<span style="color:#569cd6">${match}</span>`
      return `<span style="color:#b5cea8">${match}</span>`
    }
  )
}
