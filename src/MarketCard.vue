<script setup lang="ts">
import type { MarketEntry } from './types'
import { UserOutlined } from '@antdv-next/icons'
import { Tooltip as ATooltip } from 'antdv-next'
import { computed } from 'vue'
import { useMarketText } from './i18n'
import PluginIcon from './PluginIcon.vue'
import { capabilityText, commercialPrice, localizedText, trustText } from './text'

// A plugin in the marketplace list of Nginx UI. Nginx UI adds the state of
// the node and its buttons through the slots.

const props = withDefaults(defineProps<{
  entry: MarketEntry
  /** The language of the texts of the entry. */
  locale: string
  /** Opens the detail on a click, which the caller handles. */
  clickable?: boolean
}>(), {
  clickable: false,
})

const t = useMarketText()

const name = computed(() => localizedText(props.entry.name, props.locale) || props.entry.id)
const description = computed(() => localizedText(props.entry.description, props.locale))
const trust = computed(() => trustText(t, props.entry.trust))
const version = computed(() => props.entry.installable_release?.version)
</script>

<template>
  <article class="pmu-card" :class="{ 'is-clickable': clickable }">
    <div class="pmu-card-head">
      <PluginIcon :src="entry.icon_url" :name="name" :size="40" />
      <div class="pmu-card-body">
        <ATooltip :title="entry.id" placement="topLeft">
          <span class="pmu-card-name">{{ name }}</span>
        </ATooltip>
        <div class="pmu-card-sub">
          <span v-if="version" class="pmu-card-version">v{{ version }}</span>
          <span v-if="entry.author" class="pmu-card-author">
            <UserOutlined />
            {{ entry.author }}
          </span>
          <slot name="sub" />
          <ATooltip v-if="entry.commercial" :title="commercialPrice(entry.commercial, locale)">
            <span class="pmu-card-commercial">{{ t('Commercial') }}</span>
          </ATooltip>
        </div>
      </div>
      <ATooltip :title="trust.hint">
        <span class="pmu-card-trust" :class="`is-${trust.level}`">
          <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path
              v-if="trust.level === 'unsigned'"
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21A12 12 0 0 1 3.5 6A12 12 0 0 0 12 3"
            />
            <path
              v-else
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11.46 20.846A12 12 0 0 1 3.5 6A12 12 0 0 0 12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-.09 7.06M15 19l2 2l4-4"
            />
          </svg>
          {{ trust.label }}
        </span>
      </ATooltip>
    </div>

    <p class="pmu-card-description">
      {{ description || t('No description provided.') }}
    </p>

    <div class="pmu-card-facts">
      <slot name="facts">
        <span v-for="capability in entry.capabilities ?? []" :key="capability" class="pmu-card-fact">
          {{ capabilityText(t, capability).label }}
        </span>
      </slot>
    </div>

    <div v-if="$slots.foot" class="pmu-card-foot" @click.stop>
      <slot name="foot" />
    </div>
  </article>
</template>

<style>
.pmu-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: var(--ant-border-radius-lg);
  background: var(--ant-color-bg-container);
  color: var(--ant-color-text);
  transition: border-color 0.2s ease;
}

.pmu-card.is-clickable {
  cursor: pointer;
}

.pmu-card.is-clickable:hover {
  border-color: var(--ant-color-primary-border);
}

.pmu-card:focus-visible {
  outline: 2px solid var(--ant-color-primary);
  outline-offset: 2px;
}

.pmu-card-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.pmu-card-body {
  flex: 1;
  min-width: 0;
}

/* A long name wraps to a second line, then is cut. */
.pmu-card-name {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.pmu-card-sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 10px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
}

.pmu-card-version {
  font-variant-numeric: tabular-nums;
}

.pmu-card-author {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pmu-card-commercial {
  font-weight: 500;
  color: var(--ant-gold-7, #d48806);
}

.pmu-card-trust {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.pmu-card-trust.is-official {
  color: var(--ant-color-primary);
}

.pmu-card-trust.is-verified {
  color: var(--ant-color-success);
}

.pmu-card-trust.is-community {
  color: var(--ant-orange-7, #d46b08);
}

.pmu-card-trust.is-unsigned {
  color: var(--ant-color-warning);
}

.pmu-card-description {
  display: -webkit-box;
  min-height: 3.2em;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ant-color-text-secondary);
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* What the plugin provides and its memory, as quiet text. */
.pmu-card-facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  min-height: 22px;
  font-size: 13px;
  color: var(--ant-color-text-secondary);
}

.pmu-card-fact {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pmu-card-fact.is-warning {
  color: var(--ant-color-warning);
}

.pmu-card-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--ant-color-split);
}

@media (prefers-reduced-motion: reduce) {
  .pmu-card {
    transition: none;
  }
}
</style>
