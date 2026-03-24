<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useMongoQuery } from './composables/useMongoQuery'
import { useMetadata } from './composables/useMetadata'
import QueryEditor from './components/QueryEditor.vue'
import PaginationBar from './components/PaginationBar.vue'
import ResultsViewer from './components/ResultsViewer.vue'
import CheatSheet from './components/CheatSheet.vue'
import CollectionPicker from './components/CollectionPicker.vue'
import SampleQueryPicker from './components/SampleQueryPicker.vue'
import type { SampleQuery } from './types'

const query = useMongoQuery()
const meta = useMetadata()
const showCheatSheet = ref(true)
const showSamplePicker = ref(false)
const selectedSampleId = ref<string | null>(null)

// Auto-select first collection when metadata loads and none is selected
watch(meta.collections, (cols) => {
  if (cols.length > 0 && !query.collection.value) {
    query.setCollection(cols[0])
  }
})

function applySample(sample: SampleQuery): void {
  query.setCollection(sample.collection)
  query.updateEditor('filter', JSON.stringify(sample.filter, null, 2))
  query.updateEditor('sort', JSON.stringify(sample.sort, null, 2))
  query.updateEditor('projection', JSON.stringify(sample.projection, null, 2))
  selectedSampleId.value = sample.id
  showSamplePicker.value = false
  syncToUrl()
}

function syncToUrl(): void {
  const params = new URLSearchParams()
  if (query.collection.value) params.set('c', query.collection.value)
  if (selectedSampleId.value) {
    params.set('s', selectedSampleId.value)
  } else {
    params.set('f', query.editors.filter.value.raw)
    params.set('so', query.editors.sort.value.raw)
    params.set('p', query.editors.projection.value.raw)
  }
  history.replaceState(null, '', '?' + params.toString())
}

// Sync URL on state changes
watch(
  [
    query.collection,
    selectedSampleId,
    query.editors.filter,
    query.editors.sort,
    query.editors.projection,
  ],
  syncToUrl,
  { deep: true },
)

// Load metadata and restore URL state on mount
onMounted(async () => {
  // Capture URL params synchronously before any async operations; meta.load()
  // triggers reactive watchers that call syncToUrl() and overwrite the URL.
  const params = new URLSearchParams(window.location.search)
  const urlCollection = params.get('c')
  const urlSampleId = params.get('s')
  const urlFilter = params.get('f')
  const urlSort = params.get('so')
  const urlProjection = params.get('p')

  await meta.load()

  if (urlCollection) query.setCollection(urlCollection)

  if (urlSampleId) {
    const sample = meta.sampleQueries.value.find(q => q.id === urlSampleId)
    if (sample) applySample(sample)
  } else {
    if (urlFilter) query.updateEditor('filter', urlFilter)
    if (urlSort) query.updateEditor('sort', urlSort)
    if (urlProjection) query.updateEditor('projection', urlProjection)
  }
})
</script>

<template>
  <div class="flex h-full overflow-hidden bg-compass-bg">
    <!-- Cheat sheet sidebar -->
    <CheatSheet :visible="showCheatSheet" @close="showCheatSheet = false" />

    <!-- Main content -->
    <div class="flex flex-col flex-1 overflow-hidden min-w-0">
      <!-- Header -->
      <header class="flex-shrink-0 px-4 py-3 border-b border-compass-border bg-compass-surface space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="text-compass-heading font-semibold text-sm">Mongo Explorer</h2>
          <div class="flex items-center gap-2">
            <button
              class="text-xs px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors"
              data-testid="mongo-explorer-samples-btn"
              @click="showSamplePicker = true"
            >
              Samples
            </button>
            <button
              class="text-xs px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors"
              data-testid="mongo-explorer-toggle-cheatsheet-btn"
              @click="showCheatSheet = !showCheatSheet"
            >
              {{ showCheatSheet ? 'Hide' : 'Show' }} Reference
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-compass-muted">Collection:</span>
          <CollectionPicker
            :collections="meta.collections.value"
            :value="query.collection.value"
            :disabled="meta.isLoading.value"
            @input="(v) => { query.setCollection(v); selectedSampleId = null }"
          />
          <span v-if="meta.error.value" class="text-xs text-red-400">{{ meta.error.value }}</span>
        </div>
      </header>

      <!-- Query editor -->
      <section class="flex-shrink-0 p-4 border-b border-compass-border bg-compass-surface">
        <QueryEditor
          :filter="query.editors.filter.value"
          :sort="query.editors.sort.value"
          :projection="query.editors.projection.value"
          :can-run="query.canQuery.value"
          :is-loading="query.isLoading.value"
          @update:filter="(raw) => { query.updateEditor('filter', raw); selectedSampleId = null }"
          @update:sort="(raw) => { query.updateEditor('sort', raw); selectedSampleId = null }"
          @update:projection="(raw) => { query.updateEditor('projection', raw); selectedSampleId = null }"
          @run="query.runQuery"
          @reset="query.resetEditors"
        />
      </section>

      <!-- Pagination bar -->
      <PaginationBar
        :summary="query.pageSummary.value"
        :has-prev="query.pagination.value.currentPage > 0"
        :has-next="query.pagination.value.hasNext"
        :is-loading="query.isLoading.value"
        @prev="query.prevPage"
        @next="query.nextPage"
      />

      <!-- Results -->
      <ResultsViewer
        :results="query.results.value"
        :is-loading="query.isLoading.value"
        :fetch-error="query.fetchError.value"
      />
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
