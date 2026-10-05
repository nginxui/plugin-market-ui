<script setup lang="ts">
import { Tag as ATag } from 'antdv-next'
import { useMarketText } from './i18n'
import { describePermission, permissionLabel } from './text'

const props = defineProps<{
  permissions: string[]
  /** The reason the plugin gives for a permission, by permission. */
  reasons?: Record<string, string>
  /** Permissions an installed version did not ask for, marked as new. */
  added?: string[]
  /** Addresses the network permission is limited to, none for any. */
  networkHosts?: string[]
}>()

const t = useMarketText()
</script>

<template>
  <ul v-if="props.permissions.length > 0" class="pmu-permissions">
    <li v-for="permission in props.permissions" :key="permission">
      <ATag color="warning" class="pmu-permission-tag">
        {{ permissionLabel(t, permission) }}
      </ATag>
      <div class="pmu-permission-body">
        <div class="pmu-permission-description">
          <ATag v-if="props.added?.includes(permission)" color="error" :bordered="false" class="pmu-new-tag">
            {{ t('New') }}
          </ATag>
          {{ describePermission(t, permission) }}
        </div>
        <div v-if="permission === 'network' && props.networkHosts?.length" class="pmu-permission-note">
          <span class="pmu-permission-note-label">{{ t('Only these addresses') }}</span>
          {{ props.networkHosts.join(', ') }}
        </div>
        <div v-if="props.reasons?.[permission]" class="pmu-permission-note">
          <span class="pmu-permission-note-label">{{ t('Note from the author') }}</span>
          {{ props.reasons[permission] }}
        </div>
      </div>
    </li>
  </ul>
  <p v-else class="pmu-muted">
    {{ t('This plugin needs no access beyond its own features.') }}
  </p>
</template>

<style>
.pmu-permissions {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Each row keeps its tag next to the text, the notes start under the text. */
.pmu-permissions > li {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: baseline;
  column-gap: 6px;
  padding: 6px 0;
}

.pmu-permissions > li + li {
  border-top: 1px solid var(--ant-color-split);
}

.pmu-permission-tag {
  justify-self: start;
  margin: 0;
  font-size: 12px;
}

.pmu-new-tag {
  margin-inline-end: 6px;
  font-size: 12px;
}

.pmu-permission-description {
  color: var(--ant-color-text-secondary);
}

.pmu-permission-note {
  margin-top: 6px;
  padding-inline-start: 10px;
  border-inline-start: 2px solid var(--ant-color-border);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.pmu-permission-note-label {
  margin-inline-end: 6px;
  color: var(--ant-color-text-tertiary);
}

.pmu-muted {
  margin: 0;
  color: var(--ant-color-text-secondary);
}
</style>
