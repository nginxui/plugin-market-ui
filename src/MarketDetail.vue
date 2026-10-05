<script setup lang="ts">
import type { MarketEntry, MarketFact } from './types'
import { GlobalOutlined, LinkOutlined } from '@antdv-next/icons'
import { Flex as AFlex, Image as AImage, ImagePreviewGroup as AImagePreviewGroup, Tooltip as ATooltip } from 'antdv-next'
import { computed } from 'vue'
import { cropOf, cropStyles, shotUrl } from './crop'
import { useMarketText } from './i18n'
import PermissionList from './PermissionList.vue'
import PluginIcon from './PluginIcon.vue'
import { capabilityText, categoryLabel, commercialPrice, commercialTerms, localizedText, permissionReasons, trustText } from './text'

// The detail of a plugin in the marketplace of Nginx UI, below the title of
// its drawer. Nginx UI fills the slots with what only a node knows, the
// developer portal with its editors.

const props = withDefaults(defineProps<{
  entry: MarketEntry
  /** The language of the texts of the entry. */
  locale: string
  dark?: boolean
  /** Facts after the id, author and license. An entry without an id, such as a draft, shows none. */
  facts?: MarketFact[]
  /** README as HTML the caller has sanitized. */
  readmeHtml?: string
  /** Permissions an installed version did not ask for. */
  addedPermissions?: string[]
  /** Parts to point out, by "description", "categories", "links", "permissions", "readme" or "shot:<id>", with a label each. */
  marks?: Record<string, string>
}>(), {
  dark: false,
  facts: () => [],
  readmeHtml: '',
  addedPermissions: () => [],
  marks: () => ({}),
})

const t = useMarketText()

const name = computed(() => localizedText(props.entry.name, props.locale) || props.entry.id)
const description = computed(() => localizedText(props.entry.description, props.locale))
const trust = computed(() => trustText(t, props.entry.trust))
const manifest = computed(() => props.entry.installable_release?.manifest)
const permissions = computed(() => manifest.value?.permissions ?? [])
const reasons = computed(() => permissionReasons(manifest.value, props.locale, props.entry.permission_reasons))
const commercial = computed(() => props.entry.commercial)

const allFacts = computed<MarketFact[]>(() => [
  ...(props.entry.id ? [{ key: 'id', label: t('ID'), value: props.entry.id, mono: true }] : []),
  ...(props.entry.author ? [{ key: 'author', label: t('Author'), value: props.entry.author }] : []),
  ...(props.entry.license ? [{ key: 'license', label: t('License'), value: props.entry.license }] : []),
  ...props.facts,
])

const links = computed(() => [
  { key: 'homepage', label: t('Homepage'), url: props.entry.homepage_url },
  { key: 'repository', label: t('Repository'), url: props.entry.repository_url },
  { key: 'release_notes', label: t('Release notes'), url: props.entry.installable_release?.release_notes_url },
].filter((link): link is { key: string, label: string, url: string } => Boolean(link.url)))

// Each shows its crop in the strip and the whole image when opened.
const screenshots = computed(() => (props.entry.screenshots ?? []).map((shot, index) => {
  const crop = cropStyles(cropOf(shot, props.dark))
  return {
    key: shot.id ?? `${index}:${shot.url}`,
    id: shot.id,
    url: shotUrl(shot, props.dark),
    caption: localizedText(shot.caption, props.locale),
    styles: 'root' in crop ? { root: { ...crop.root, width: '240px', height: '150px', borderRadius: '6px' }, image: crop.image } : undefined,
  }
}))

const mark = (key: string) => props.marks[key]
</script>

<template>
  <AFlex vertical :gap="24" class="pmu-detail">
    <div class="pmu-head">
      <PluginIcon :src="entry.icon_url" :name="name" :size="48" />
      <div class="pmu-head-main">
        <div class="pmu-pill-row pmu-head-pills">
          <ATooltip :title="trust.hint">
            <span class="pmu-pill" :class="trust.tone">{{ trust.label }}</span>
          </ATooltip>
          <span v-if="commercial" class="pmu-pill is-gold">{{ t('Commercial') }}</span>
          <span v-for="capability in entry.capabilities ?? []" :key="capability" class="pmu-pill is-accent">
            {{ capabilityText(t, capability).label }}
          </span>
          <slot name="pills" />
        </div>
        <div :class="{ 'pmu-mark': mark('description') }" :data-mark="mark('description')">
          <slot name="description" :text="description">
            <p class="pmu-description">
              {{ description || t('No description provided.') }}
            </p>
          </slot>
        </div>
      </div>
    </div>

    <slot name="alerts" />

    <div class="pmu-facts">
      <div v-for="fact in allFacts" :key="fact.key" class="pmu-fact" :class="{ 'is-wide': fact.mono }">
        <span class="pmu-fact-label">{{ fact.label }}</span>
        <span class="pmu-fact-value" :class="{ 'is-mono': fact.mono }">{{ fact.value }}</span>
      </div>
    </div>

    <dl class="pmu-rows">
      <slot name="rows" />
      <div v-if="commercial" class="pmu-row">
        <dt>{{ t('Price') }}</dt>
        <dd class="pmu-price">
          <span>{{ commercialPrice(commercial, locale) }}</span>
          <span v-for="term in commercialTerms(t, commercial)" :key="term" class="pmu-pill">{{ term }}</span>
          <a :href="commercial.purchase_url" target="_blank" rel="noopener noreferrer" class="pmu-pill is-link">
            <LinkOutlined />
            {{ t('Buy a license') }}
          </a>
        </dd>
      </div>
      <div v-if="entry.categories?.length || $slots.categories" class="pmu-row" :class="{ 'pmu-mark': mark('categories') }" :data-mark="mark('categories')">
        <dt>{{ t('Categories') }}</dt>
        <dd>
          <slot name="categories" :labels="(entry.categories ?? []).map(id => categoryLabel(t, id))">
            <span class="pmu-pill-row">
              <span v-for="item in entry.categories" :key="item" class="pmu-pill">{{ categoryLabel(t, item) }}</span>
            </span>
          </slot>
        </dd>
      </div>
      <div v-if="links.length || $slots.links" class="pmu-row" :class="{ 'pmu-mark': mark('links') }" :data-mark="mark('links')">
        <dt>{{ t('Links') }}</dt>
        <dd>
          <slot name="links" :links="links">
            <span class="pmu-pill-row">
              <a v-for="link in links" :key="link.key" :href="link.url" target="_blank" rel="noopener noreferrer" class="pmu-pill is-link">
                <GlobalOutlined v-if="link.key === 'homepage'" />
                <LinkOutlined v-else />
                {{ link.label }}
              </a>
            </span>
          </slot>
        </dd>
      </div>
    </dl>

    <section v-if="screenshots.length || $slots['screenshots-action']" class="pmu-section">
      <div class="pmu-section-head">
        <h4 class="pmu-section-title">
          {{ t('Screenshots') }}
        </h4>
        <slot name="screenshots-action" />
      </div>
      <AImagePreviewGroup>
        <div class="pmu-strip">
          <figure
            v-for="(shot, index) in screenshots"
            :key="shot.key"
            class="pmu-shot"
            :class="{ 'pmu-mark': shot.id && mark(`shot:${shot.id}`) }"
            :data-mark="shot.id ? mark(`shot:${shot.id}`) : undefined"
          >
            <AImage
              v-if="shot.url"
              :src="shot.url"
              :alt="shot.caption || name"
              :width="240"
              :height="150"
              referrerpolicy="no-referrer"
              class="pmu-shot-image"
              :styles="shot.styles"
            />
            <div v-else class="pmu-shot-missing">
              <slot name="missing" :index="index" />
            </div>
            <slot name="caption" :index="index" :caption="shot.caption">
              <figcaption v-if="shot.caption" class="pmu-caption">
                {{ shot.caption }}
              </figcaption>
            </slot>
          </figure>
        </div>
      </AImagePreviewGroup>
      <slot name="screenshots-after" />
    </section>

    <section class="pmu-section" :class="{ 'pmu-mark': mark('permissions') }" :data-mark="mark('permissions')">
      <div class="pmu-section-head">
        <h4 class="pmu-section-title">
          {{ t('Requested permissions') }}
        </h4>
        <span v-if="permissions.length" class="pmu-count">{{ permissions.length }}</span>
      </div>
      <PermissionList :permissions="permissions" :reasons="reasons" :added="addedPermissions" :network-hosts="manifest?.network_hosts" />
    </section>

    <slot name="sections" />

    <section v-if="readmeHtml || $slots.readme" class="pmu-section" :class="{ 'pmu-mark': mark('readme') }" :data-mark="mark('readme')">
      <div class="pmu-section-head">
        <h4 class="pmu-section-title">
          {{ t('Readme') }}
        </h4>
        <slot name="readme-action" />
      </div>
      <slot name="readme">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="pmu-readme" v-html="readmeHtml" />
      </slot>
    </section>
  </AFlex>
</template>

<style>
.pmu-detail {
  container-type: inline-size;
  color: var(--ant-color-text);
}

.pmu-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.pmu-head-main {
  flex: 1;
  min-width: 0;
}

.pmu-head-pills {
  margin-bottom: 8px;
}

.pmu-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ant-color-text-secondary);
  white-space: pre-line;
}

.pmu-facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@container (min-width: 600px) {
  .pmu-facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  /* Long identifiers get two columns instead of breaking mid word. */
  .pmu-fact.is-wide {
    grid-column: span 2;
  }
}

.pmu-fact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 12px 14px;
  background: var(--ant-color-fill-quaternary);
  border-radius: 12px;
}

.pmu-fact-label {
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
}

.pmu-fact-value {
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.pmu-fact-value.is-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
}

.pmu-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.pmu-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 20px;
  color: var(--ant-color-text-secondary);
  background: var(--ant-color-fill-tertiary);
  border-radius: 999px;
}

.pmu-pill.is-accent {
  color: var(--ant-color-primary);
  background: var(--ant-color-primary-bg);
}

.pmu-pill.is-success {
  color: var(--ant-color-success);
  background: var(--ant-color-success-bg);
}

.pmu-pill.is-warning {
  color: var(--ant-color-warning);
  background: var(--ant-color-warning-bg);
}

.pmu-pill.is-purple {
  color: var(--ant-color-purple, #722ed1);
  background: var(--ant-color-purple-bg, rgba(114, 46, 209, 0.1));
}

.pmu-pill.is-gold {
  color: var(--ant-gold-7, #d48806);
  background: color-mix(in srgb, var(--ant-gold-6, #faad14) 15%, transparent);
}

.pmu-pill.is-link {
  color: var(--ant-color-primary);
  background: var(--ant-color-fill-tertiary);
  text-decoration: none;
}

.pmu-pill.is-link:hover {
  background: var(--ant-color-primary-bg);
}

.pmu-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 4px 0 0;
}

.pmu-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

.pmu-row > dt {
  flex: 0 0 120px;
  font-size: 13px;
  color: var(--ant-color-text-tertiary);
}

.pmu-row > dd {
  flex: 1 1 200px;
  min-width: 0;
  margin: 0;
}

.pmu-price {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.pmu-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pmu-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pmu-section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.pmu-count {
  padding: 0 7px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
  color: var(--ant-color-text-secondary);
  background: var(--ant-color-fill-tertiary);
  border-radius: 999px;
}

.pmu-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.pmu-shot {
  flex: none;
  width: 240px;
  margin: 0;
}

.pmu-shot .pmu-shot-image {
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--ant-color-border-secondary);
}

.pmu-shot-missing {
  display: grid;
  place-items: center;
  width: 240px;
  height: 150px;
  box-sizing: border-box;
  padding: 8px;
  border: 1px dashed var(--ant-color-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
  overflow-wrap: anywhere;
}

.pmu-caption {
  margin-top: 6px;
  font-size: 12px;
  color: var(--ant-color-text-secondary);
}

.pmu-readme {
  word-break: break-word;
}

.pmu-readme img {
  max-width: 100%;
}

.pmu-readme pre {
  padding: 12px;
  overflow: auto;
  border-radius: 6px;
  background-color: var(--ant-color-fill-tertiary);
}

.pmu-readme table {
  width: 100%;
  border-collapse: collapse;
}

.pmu-readme th,
.pmu-readme td {
  padding: 6px 8px;
  border: 1px solid var(--ant-color-split);
}

/* A part pointed out, with its label above its corner. */
.pmu-mark {
  position: relative;
  border-radius: 6px;
  outline: 2px solid var(--ant-color-warning);
  outline-offset: 4px;
}

.pmu-mark::after {
  content: attr(data-mark);
  position: absolute;
  top: -14px;
  inset-inline-end: 0;
  padding: 0 6px;
  border-radius: 8px;
  background: var(--ant-color-warning);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
}
</style>
