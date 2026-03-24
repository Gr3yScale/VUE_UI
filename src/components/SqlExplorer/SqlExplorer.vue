<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSqlMetadata } from './composables/useSqlMetadata'
import { useSqlQuery } from './composables/useSqlQuery'
import SqlEditor from './components/SqlEditor.vue'
import SqlResultsTable from './components/SqlResultsTable.vue'
import SqlCheatSheet from './components/SqlCheatSheet.vue'
import SampleQueryPicker from './components/SampleQueryPicker.vue'
import DropdownPicker from '@/components/shared/DropdownPicker.vue'
import type { SqlSampleQuery } from './types'

const meta = useSqlMetadata()
const query = useSqlQuery()

const showCheatSheet = ref(true)
const showSamplePicker = ref(false)
const selectedSampleId = ref<string | null>(null)

// Auto-select first source when metadata loads and none is selected
watch(meta.sources, (sources) => {
  if (sources.length > 0 && !query.source.value) {
    query.setSource(sources[0]!.id)
  }
})

function applySample(sample: SqlSampleQuery): void {
  query.setSource(sample.source)
  query.setSql(sample.sql)
  selectedSampleId.value = sample.id
  showSamplePicker.value = false
  syncToUrl()
}

function syncToUrl(): void {
  const params = new URLSearchParams()
  if (query.source.value) params.set('src', query.source.value)
  if (query.sql.value) params.set('q', query.sql.value)
  history.replaceState(null, '', '?' + params.toString())
}

watch([query.source, query.sql], syncToUrl)

onMounted(async () => {
  await meta.load()

  const params = new URLSearchParams(window.location.search)
  const urlSource = params.get('src')
  const urlSql = params.get('q')

  if (urlSource) query.setSource(urlSource)
  if (urlSql) query.setSql(urlSql)
})
</script>

<template>
  <div class="flex h-full overflow-hidden bg-compass-bg">
    <!-- SQL cheat sheet sidebar -->
    <SqlCheatSheet
      :visible="showCheatSheet"
      :flavor="meta.flavor.value"
      @close="showCheatSheet = false"
    />

    <!-- Main content -->
    <div class="flex flex-col flex-1 overflow-hidden min-w-0">
      <!-- Header -->
      <header class="flex-shrink-0 px-4 py-3 border-b border-compass-border bg-compass-surface space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="text-compass-heading font-semibold text-sm">SQL Explorer</h2>
          <div class="flex items-center gap-2">
            <button
              class="text-xs px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors"
              data-testid="sql-explorer-samples-btn"
              @click="showSamplePicker = true"
            >
              Samples
            </button>
            <button
              class="text-xs px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors"
              data-testid="sql-explorer-toggle-cheatsheet-btn"
              @click="showCheatSheet = !showCheatSheet"
            >
              {{ showCheatSheet ? 'Hide' : 'Show' }} Reference
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-compass-muted">Source:</span>
          <DropdownPicker
            :options="meta.sources.value.map(s => s.id)"
            :value="query.source.value"
            :disabled="meta.isLoading.value"
            placeholder="Select source…"
            testid="sql-source-picker"
            @input="(v) => { query.setSource(v); selectedSampleId = null }"
          />
          <span v-if="meta.error.value" class="text-xs text-compass-error">{{ meta.error.value }}</span>
          <span v-if="query.rowCount.value > 0" class="text-xs text-compass-muted ml-auto">
            {{ query.rowCount.value }} rows loaded
          </span>
        </div>
      </header>

      <!-- SQL editor section -->
      <section class="flex-shrink-0 border-b border-compass-border bg-compass-surface" style="height: 200px;">
        <div class="h-full flex flex-col">
          <div class="flex items-center justify-between px-3 py-1.5 border-b border-compass-border">
            <span class="text-xs text-compass-muted font-mono">SQL</span>
            <button
              class="text-xs px-3 py-1 rounded bg-compass-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="sql-explorer-run-btn"
              :disabled="!query.canQuery.value || query.isLoading.value"
              @click="query.runQuery()"
            >
              Run
            </button>
          </div>
          <div class="flex-1 min-h-0">
            <SqlEditor
              :value="query.sql.value"
              :flavor="meta.flavor.value"
              :disabled="query.isLoading.value"
              @input="(v) => { query.setSql(v); selectedSampleId = null }"
            />
          </div>
        </div>
      </section>

      <!-- Results -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <SqlResultsTable
          :columns="query.columns.value"
          :rows="query.rows.value"
          :is-loading="query.isLoading.value"
          :has-more="query.hasMore.value"
          :fetch-error="query.fetchError.value"
          @load-more="query.loadMore()"
        />
      </div>
    </div>

    <!-- Sample query picker -->
    <SampleQueryPicker
      :visible="showSamplePicker"
      :queries="meta.sampleQueries.value"
      :selected-id="selectedSampleId"
      @close="showSamplePicker = false"
      @apply="applySample"
    />
  </div>
</template>
