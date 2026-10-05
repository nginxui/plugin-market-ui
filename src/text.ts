import type { Translate } from './i18n'
import type { Localized, MarketCommercial, MarketManifest } from './types'

// The wording of the marketplace: permissions, capabilities, categories and
// trust levels in plain words, never their raw ids. Each message id is the
// one Nginx UI translates, so the translations carry over.

/**
 * Picks the value for a language: the exact locale, then its base language,
 * then English, then the fallback, then any other translation.
 */
export function localizedText(values: Localized | undefined, language: string, fallback = ''): string {
  const base = language.split(/[-_]/)[0]
  for (const candidate of [language, base, 'en']) {
    const value = values?.[candidate]
    if (value)
      return value
  }
  if (fallback)
    return fallback
  return Object.values(values ?? {}).find(Boolean) ?? ''
}

/** What granting a permission allows, in plain words. */
export function describePermission(t: Translate, permission: string): string {
  if (permission.startsWith('credentials.read:')) {
    return t('Read stored %{kind} credentials, including their secrets.', {
      kind: permission.slice('credentials.read:'.length) || t('unknown'),
    })
  }

  switch (permission) {
    case 'kv':
      return t('Keep its own data inside Nginx UI.')
    case 'network':
      return t('Connect to other servers over the network.')
    case 'cron':
      return t('Run tasks on a regular schedule.')
    case 'notify':
      return t('Send notifications through the Nginx UI notification channels.')
    case 'metrics.read':
      return t('Read CPU, memory, network and Nginx status metrics of this node.')
    case 'core_api':
      return t('Manage Nginx UI with your permissions.')
    case 'mcp':
      return t('Offer actions that AI assistants connected to Nginx UI can run.')
    case 'cert.deploy':
      return t('Receive issued certificates, including the parts that must stay secret, to push them to other services.')
    case 'log.read':
      return t('Receive every access log entry while it is on, including visitor addresses and requested URLs.')
    case 'log.files':
      return t('Read the Nginx log files of this node, including visitor addresses and requested URLs.')
    case 'nginx.snippet':
      return t('Add Nginx configuration of its own. It takes effect only where you include it, and Nginx UI applies it only when the configuration remains valid.')
    case 'nginx.config.read':
      return t('Read the Nginx configuration files of this node.')
    case 'sites.read':
      return t('See the sites of this node and their addresses.')
    case 'certs.read':
      return t('See the certificates and when they expire, without the parts that must stay secret.')
    default:
      return t('Unknown permission. Only grant it if you trust the plugin author.')
  }
}

/** Short name of a permission. */
export function permissionLabel(t: Translate, permission: string): string {
  if (permission.startsWith('credentials.read:')) {
    return t('Stored %{kind} credentials', {
      kind: permission.slice('credentials.read:'.length) || t('unknown'),
    })
  }

  switch (permission) {
    case 'kv':
      return t('Own data storage')
    case 'network':
      return t('Network')
    case 'cron':
      return t('Scheduled tasks')
    case 'notify':
      return t('Notifications')
    case 'metrics.read':
      return t('Server metrics')
    case 'core_api':
      return t('Nginx UI management')
    case 'mcp':
      return t('AI assistant tools')
    case 'cert.deploy':
      return t('Certificates')
    case 'log.read':
      return t('Access logs')
    case 'log.files':
      return t('Log files')
    case 'nginx.snippet':
      return t('Nginx configuration snippets')
    case 'nginx.config.read':
      return t('Nginx configuration')
    case 'sites.read':
      return t('Sites')
    case 'certs.read':
      return t('Certificate list')
    default:
      return t('Unknown permission')
  }
}

/** A manifest or an installed plugin, whichever carries the reasons. */
export type PermissionReasonSource = Pick<MarketManifest, 'permission_reasons' | 'permission_reasons_i18n' | 'i18n'>

/**
 * The reason a plugin gives for each permission, in the given language. An
 * empty reason counts as none, and an empty translation falls back. notes are
 * the translations a catalog lists for the plugin, by permission and then
 * locale, which win over the ones of the manifest.
 */
export function permissionReasons(source: PermissionReasonSource | undefined, language: string, notes?: Record<string, Localized>): Record<string, string> {
  const byLocale: Record<string, Record<string, string>> = { ...source?.permission_reasons_i18n }
  for (const [locale, translated] of Object.entries(source?.i18n ?? {})) {
    if (translated?.permission_reasons)
      byLocale[locale] = { ...byLocale[locale], ...translated.permission_reasons }
  }
  for (const [name, translations] of Object.entries(notes ?? {})) {
    for (const [locale, text] of Object.entries(translations ?? {})) {
      if (text?.trim())
        byLocale[locale] = { ...byLocale[locale], [name]: text }
    }
  }

  const names = new Set(Object.keys(source?.permission_reasons ?? {}))
  for (const translated of Object.values(byLocale))
    Object.keys(translated).forEach(name => names.add(name))

  const reasons: Record<string, string> = {}
  for (const name of names) {
    const translations: Record<string, string> = {}
    for (const [locale, translated] of Object.entries(byLocale)) {
      if (translated[name]?.trim())
        translations[locale] = translated[name]
    }
    const text = localizedText(translations, language, source?.permission_reasons?.[name] ?? '').trim()
    if (text)
      reasons[name] = text
  }
  return reasons
}

/** Short name and one line description of a capability, generic for one the host does not know. */
export function capabilityText(t: Translate, capability: string): { label: string, description: string } {
  switch (capability) {
    case 'dns01':
      return { label: t('Certificate DNS validation'), description: t('Validates domains through DNS records when certificates are issued or renewed.') }
    case 'http':
      return { label: t('Web pages and API'), description: t('Serves its own pages and API inside Nginx UI.') }
    case 'notify':
      return { label: t('External notifications'), description: t('Delivers Nginx UI notifications to other services.') }
    case 'probe':
      return { label: t('Health checks'), description: t('Adds more ways to check whether sites and services are reachable.') }
    case 'mcp':
      return { label: t('AI assistant tools'), description: t('Offers actions that AI assistants connected to Nginx UI can run.') }
    case 'storage':
      return { label: t('Backup storage'), description: t('Stores backups and other files in external storage.') }
    case 'cert.deploy':
      return { label: t('Certificate deployment'), description: t('Pushes issued certificates to other services and devices.') }
    case 'security.blocklist':
      return { label: t('Blocklists'), description: t('Keeps lists of addresses that are denied access up to date.') }
    case 'upstream.discovery':
      return { label: t('Service discovery'), description: t('Finds backend servers automatically and keeps upstreams up to date.') }
    case 'log.sink':
      return { label: t('Access log forwarding'), description: t('Receives access log entries as they are written, for example to forward or analyse them.') }
    default:
      return { label: t('Other feature'), description: t('A feature this version of Nginx UI does not describe.') }
  }
}

/** The catalog categories in the order the marketplace offers them. */
export const CATEGORY_ORDER = ['certificates', 'dns', 'security', 'traffic', 'monitoring', 'logs', 'analytics', 'notifications', 'backup', 'ai', 'templates', 'languages', 'integrations', 'tools']

/** Plain name of a category; one the host does not know shows its id. */
export function categoryLabel(t: Translate, id: string): string {
  switch (id) {
    case 'certificates': return t('Certificates')
    case 'dns': return t('DNS')
    case 'security': return t('Security')
    case 'traffic': return t('Traffic and upstreams')
    case 'monitoring': return t('Monitoring')
    case 'logs': return t('Logs')
    case 'analytics': return t('Analytics')
    case 'notifications': return t('Notifications')
    case 'backup': return t('Backup and storage')
    case 'ai': return t('AI')
    case 'templates': return t('Config templates')
    case 'languages': return t('Language packs')
    case 'integrations': return t('Integrations')
    case 'tools': return t('Tools')
    default: return id
  }
}

/** Known categories in their order, any other after them by id. */
export function sortCategories(ids: Iterable<string>): string[] {
  const used = new Set(ids)
  const known = CATEGORY_ORDER.filter(id => used.has(id))
  return [...known, ...[...used].filter(id => !CATEGORY_ORDER.includes(id)).sort()]
}

export type TrustLevel = 'official' | 'verified' | 'community' | 'unsigned'

/** Name, explanation and pill tone of a trust level; a missing or unknown level counts as community. */
export function trustText(t: Translate, trust: string | undefined): { level: TrustLevel, label: string, hint: string, tone: string } {
  switch (trust) {
    case 'official':
      return { level: 'official', label: t('Official'), hint: t('Published by the Nginx UI project.'), tone: 'is-accent' }
    case 'verified':
      return { level: 'verified', label: t('Verified'), hint: t('Published by a partner of the Nginx UI project.'), tone: 'is-success' }
    case 'unsigned':
      return { level: 'unsigned', label: t('Unsigned'), hint: t('Not signed, so its publisher cannot be confirmed. Installing it requires developer mode.'), tone: '' }
    default:
      return { level: 'community', label: t('Community'), hint: t('Published by a third party and not reviewed. It runs with the permissions you grant it, so only install it if you trust the author.'), tone: 'is-warning' }
  }
}

/** The price text of a paid plugin in the given language, English as fallback. */
export function commercialPrice(commercial: MarketCommercial, language: string): string {
  return localizedText(commercial.pricing, language)
}

/** The license kind and the trial of a paid plugin, as short phrases. */
export function commercialTerms(t: Translate, commercial: MarketCommercial): string[] {
  const terms: string[] = []
  if (commercial.license === 'subscription')
    terms.push(t('Subscription'))
  else if (commercial.license === 'commercial')
    terms.push(t('Paid license'))
  if (commercial.trial_days)
    terms.push(t('Free trial of %{days} days', { days: String(commercial.trial_days) }))
  return terms
}
