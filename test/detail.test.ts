import type { MarketEntry } from '../src/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { bundledText, provideMarketText } from '../src/i18n'
import MarketDetail from '../src/MarketDetail.vue'

const entry: MarketEntry = {
  id: 'com.vendor.waf',
  name: { en: 'WAF' },
  description: { en: 'Blocks attacks.', zh_CN: '拦截攻击。' },
  author: 'Vendor',
  trust: 'verified',
  categories: ['security'],
  commercial: { pricing: { en: 'From 199 USD' }, purchase_url: 'https://vendor.example/buy', trial_days: 30 },
  screenshots: [{ id: 'main', url: 'https://vendor.example/a.png', caption: { en: 'Rules' }, crop: { x: 0.1, y: 0, width: 0.8, height: 1 } }],
  installable_release: { version: '1.0.0', manifest: { permissions: ['network'], network_hosts: ['api.vendor.example'], permission_reasons: { network: 'Fetches rules.' } } },
}

describe('market detail', () => {
  it('shows the price, the addresses and the author note', () => {
    const wrapper = mount(MarketDetail, { props: { entry, locale: 'en' } })
    const text = wrapper.text()
    expect(text).toContain('Commercial')
    expect(text).toContain('From 199 USD')
    expect(text).toContain('Free trial of 30 days')
    expect(text).toContain('api.vendor.example')
    expect(text).toContain('Fetches rules.')
    expect(wrapper.find('a.is-link').attributes('href')).toBe('https://vendor.example/buy')
  })

  it('points out marked parts and takes a translator from above', () => {
    const Host = defineComponent({
      setup() {
        provideMarketText(bundledText('zh_CN'))
        return () => h(MarketDetail, { entry, locale: 'zh_CN', marks: { 'shot:main': 'Changed' } })
      },
    })
    const wrapper = mount(Host)
    expect(wrapper.text()).toContain('拦截攻击。')
    expect(wrapper.text()).not.toContain('Requested permissions')
    expect(wrapper.find('.pmu-shot.pmu-mark').attributes('data-mark')).toBe('Changed')
  })
})

describe('market card', () => {
  it('shows the version, author, trust and the commercial tag', async () => {
    const { default: MarketCard } = await import('../src/MarketCard.vue')
    const wrapper = mount(MarketCard, { props: { entry: { ...entry, installable_release: { version: '1.2.0' } }, locale: 'en' }, slots: { foot: 'Install' } })
    const text = wrapper.text()
    expect(text).toContain('v1.2.0')
    expect(text).toContain('Vendor')
    expect(text).toContain('Verified')
    expect(text).toContain('Commercial')
    expect(wrapper.find('.pmu-card-trust').classes()).toContain('is-verified')
    expect(wrapper.find('.pmu-card-foot').text()).toBe('Install')
  })
})
