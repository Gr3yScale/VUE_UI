<script setup lang="ts">
import { ref } from 'vue'
import { useMongoQuery } from './composables/useMongoQuery'
import EndpointConfig from './components/EndpointConfig.vue'
import QueryEditor from './components/QueryEditor.vue'
import PaginationBar from './components/PaginationBar.vue'
import ResultsViewer from './components/ResultsViewer.vue'
import CheatSheet from './components/CheatSheet.vue'

const query = useMongoQuery()
const showCheatSheet = ref(true)
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
          <button
            class="text-xs px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors"
            data-testid="mongo-explorer-toggle-cheatsheet-btn"
            @click="showCheatSheet = !showCheatSheet"
          >
            {{ showCheatSheet ? 'Hide' : 'Show' }} Reference
          </button>
        </div>
        <EndpointConfig
          :model-value="query.endpointUrl.value"
          @update:model-value="query.setEndpointUrl"
        />
      </header>

      <!-- Query editor -->
      <section class="flex-shrink-0 p-4 border-b border-compass-border bg-compass-surface">
        <QueryEditor
          :filter="query.editors.filter.value"
          :sort="query.editors.sort.value"
          :projection="query.editors.projection.value"
          :can-run="query.canQuery.value"
          :is-loading="query.isLoading.value"
          @update:filter="(raw) => query.updateEditor('filter', raw)"
          @update:sort="(raw) => query.updateEditor('sort', raw)"
          @update:projection="(raw) => query.updateEditor('projection', raw)"
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
  </div>
</template>
