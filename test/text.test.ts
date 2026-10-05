import { describe, expect, it } from 'vitest'
import { bundledText } from '../src/i18n'
import { commercialTerms, localizedText, permissionLabel, permissionReasons, sortCategories, trustText } from '../src/text'

const en = bundledText('en')

describe('wording', () => {
  it('fills placeholders and falls back to English', () => {
    expect(permissionLabel(en, 'credentials.read:dns')).toBe('Stored dns credentials')
    expect(permissionLabel(bundledText('xx_XX'), 'network')).toBe('Network')
    expect(permissionLabel(bundledText('zh_CN'), 'network')).not.toBe('Network')
  })

  it('counts a missing or unknown trust level as community', () => {
    expect(trustText(en, undefined).level).toBe('community')
    expect(trustText(en, 'verified')).toMatchObject({ level: 'verified', tone: 'is-success' })
  })

  it('picks the locale, its base language, then English', () => {
    expect(localizedText({ en: 'A', zh: 'B' }, 'zh_CN')).toBe('B')
    expect(localizedText({ en: 'A' }, 'de_DE')).toBe('A')
    expect(localizedText({ ja_JP: 'C' }, 'de_DE')).toBe('C')
  })

  it('lets the catalog notes win over the manifest translations', () => {
    const reasons = permissionReasons(
      { permission_reasons: { network: 'Fetches lists.' }, i18n: { zh_CN: { permission_reasons: { network: '下载列表。' } } } },
      'zh_CN',
      { network: { zh_CN: '下载更新的列表。' } },
    )
    expect(reasons).toEqual({ network: '下载更新的列表。' })
    expect(permissionReasons({ permission_reasons: { network: 'Fetches lists.' } }, 'de_DE')).toEqual({ network: 'Fetches lists.' })
  })

  it('orders known categories first', () => {
    expect(sortCategories(['tools', 'zzz', 'dns'])).toEqual(['dns', 'tools', 'zzz'])
  })

  it('names the license kind and the trial', () => {
    expect(commercialTerms(en, { pricing: { en: '9 USD' }, purchase_url: 'https://x', license: 'subscription', trial_days: 14 })).toEqual(['Subscription', 'Free trial of 14 days'])
  })
})
