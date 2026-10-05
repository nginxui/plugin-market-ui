import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import bundle from './messages.json'

/** Translates a message of the marketplace, filling %{name} placeholders from params. */
export type Translate = (msgid: string, params?: Record<string, string>) => string

export function interpolate(text: string, params?: Record<string, string>): string {
  return params ? text.replace(/%\{(\w+)\}/g, (match, key: string) => params[key] ?? match) : text
}

const locales = (bundle as { locales: Record<string, Record<string, string>> }).locales

/** The locales the package carries translations for, besides English. */
export const MARKET_LOCALES = Object.keys(locales)

/**
 * A translator from the translations the package carries, which are those of
 * Nginx UI; English where a locale has none.
 */
export function bundledText(locale: string): Translate {
  const table = locales[locale] ?? locales[locale.split(/[-_]/)[0]] ?? {}
  return (msgid, params) => interpolate(table[msgid] || msgid, params)
}

const KEY: InjectionKey<Translate> = Symbol('plugin-market-text')
let fallback: Translate = bundledText('en')

/**
 * The translator of every view no ancestor gives one, for an app that
 * translates the messages itself, as Nginx UI does with its own catalogs.
 */
export function setMarketText(t: Translate) {
  fallback = t
}

/** Gives the views below a translator, for a preview in another language. */
export function provideMarketText(t: Translate) {
  provide(KEY, t)
}

export function useMarketText(): Translate {
  const provided = inject(KEY, null)
  return provided ?? ((msgid, params) => fallback(msgid, params))
}
