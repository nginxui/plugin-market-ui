/** A text by locale code, "en" is the fallback. */
export type Localized = Record<string, string>

/** A region of an image as shares of its width and height, from its top left corner. */
export interface MarketCrop {
  x: number
  y: number
  width: number
  height: number
}

export interface MarketScreenshot {
  /** Names the screenshot for marks, when the caller has an id for it. */
  id?: string
  url: string
  /** The same view in the dark theme; `url` stands in when it is absent. */
  dark_url?: string
  caption?: Localized
  /** The part of `url` the strip shows; opening the screenshot shows the whole image. */
  crop?: MarketCrop
  /** The part of `dark_url`, `crop` when absent. */
  dark_crop?: MarketCrop
}

/** A paid plugin: its price as text per locale, where to buy it, the trial and the license kind. */
export interface MarketCommercial {
  pricing: Localized
  purchase_url: string
  trial_days?: number
  license?: 'commercial' | 'subscription'
}

/** What a manifest says about the access a plugin asks for. */
export interface MarketManifest {
  permissions?: string[]
  /** Addresses the network permission is limited to, none for any. */
  network_hosts?: string[]
  permission_reasons?: Record<string, string>
  permission_reasons_i18n?: Record<string, Record<string, string>>
  i18n?: Record<string, { permission_reasons?: Record<string, string> }>
}

export interface MarketRelease {
  version: string
  release_notes_url?: string
  manifest?: MarketManifest
}

/** One plugin as the catalog lists it, the part the marketplace views show. */
export interface MarketEntry {
  id: string
  name?: Localized
  description?: Localized
  author?: string
  license?: string
  homepage_url?: string
  repository_url?: string
  icon_url?: string
  screenshots?: MarketScreenshot[]
  categories?: string[]
  capabilities?: string[]
  trust?: string
  commercial?: MarketCommercial
  /** Translated notes on each permission, by permission and then locale. */
  permission_reasons?: Record<string, Localized>
  /** The release the marketplace offers. */
  installable_release?: MarketRelease
}

/** A fact the detail shows in its grid. */
export interface MarketFact {
  key: string
  label: string
  value: string
  /** An identifier, shown in a monospaced font across two columns. */
  mono?: boolean
}
