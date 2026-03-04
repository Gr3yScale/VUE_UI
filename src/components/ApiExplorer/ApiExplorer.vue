<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useApiMetadata } from './composables/useApiMetadata'
import { useApiRequest } from './composables/useApiRequest'
import EndpointList from './components/EndpointList.vue'
import RequestEditor from './components/RequestEditor.vue'
import ResponseViewer from './components/ResponseViewer.vue'
import DropdownPicker from '@/components/shared/DropdownPicker.vue'
import type { ApiPreset, ContentType, HeaderEntry } from './types'

const meta = useApiMetadata()
const request = useApiRequest(meta.sources)

// Auto-select first source when metadata loads
watch(meta.sources, (sources) => {
  if (sources.length > 0 && !request.sourceId.value) {
    const first = sources[0]!
    request.setSource(first.id)
    if (first.endpoints.length > 0) {
      request.setEndpoint(first.endpoints[0]!.id)
    }
  }
})

function onSourceChange(name: string): void {
  const src = meta.sources.value.find(s => s.name === name)
  if (!src) return
  request.setSource(src.id)
  if (src.endpoints.length > 0) {
    request.setEndpoint(src.endpoints[0]!.id)
  }
}

function onEndpointSelect(id: string): void {
  request.setEndpoint(id)
}

function onContentTypeChange(ct: ContentType): void {
  request.setContentType(ct)
}

function onBodyChange(text: string): void {
  request.setBody(text)
}

function onHeadersChange(headers: HeaderEntry[]): void {
  // Sync headers array from RequestEditor (handles add/remove/update/toggle inline)
  request.headers.value = headers
}

function onApplyPreset(preset: ApiPreset): void {
  request.setBody(preset.body)
}

function syncToUrl(): void {
  const params = new URLSearchParams()
  if (request.sourceId.value) params.set('src', request.sourceId.value)
  if (request.endpointId.value) params.set('ep', request.endpointId.value)
  if (request.contentType.value !== 'none') params.set('ct', request.contentType.value)
  if (request.body.value) params.set('b', btoa(request.body.value))
  if (request.headers.value.length > 0) params.set('h', btoa(JSON.stringify(request.headers.value)))
  history.replaceState(null, '', '?' + params.toString())
}

watch(
  [request.sourceId, request.endpointId, request.body, request.contentType, request.headers],
  syncToUrl,
  { deep: true }
)

onMounted(async () => {
  await meta.load()

  const params = new URLSearchParams(window.location.search)
  const urlSrc = params.get('src')
  const urlEp = params.get('ep')
  const urlCt = params.get('ct')
  const urlB = params.get('b')
  const urlH = params.get('h')

  if (urlSrc) request.setSource(urlSrc)
  if (urlEp) request.setEndpoint(urlEp)
  if (urlCt) request.setContentType(urlCt as ContentType)
  if (urlB) {
    try { request.setBody(atob(urlB)) } catch { /* ignore */ }
  }
  if (urlH) {
    try { request.headers.value = JSON.parse(atob(urlH)) } catch { /* ignore */ }
  }
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-compass-bg">
    <!-- Header -->
    <header class="flex-shrink-0 px-4 py-3 border-b border-compass-border bg-compass-surface space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-compass-heading font-semibold text-sm">API Explorer</h2>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-compass-muted">Source:</span>
        <DropdownPicker
          :options="meta.sources.value.map(s => s.name)"
          :model-value="request.currentSource.value?.name ?? ''"
          :disabled="meta.isLoading.value"
          placeholder="Select source…"
          testid="api-source-picker"
          @update:model-value="onSourceChange"
        />
        <span v-if="meta.error.value" class="text-xs text-compass-error">{{ meta.error.value }}</span>
        <span v-if="request.currentSource.value" class="text-xs text-compass-muted ml-2">
          {{ request.currentSource.value.description }}
        </span>
      </div>
    </header>

    <!-- Main area: endpoint list + editor + response -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Endpoint list (left column, ~30%) -->
      <aside class="w-72 flex-shrink-0 border-r border-compass-border overflow-y-auto bg-compass-surface">
        <EndpointList
          :endpoints="request.currentSource.value?.endpoints ?? []"
          :selected-id="request.endpointId.value"
          @select="onEndpointSelect"
        />
      </aside>

      <!-- Right column: editor + send + response -->
      <div class="flex flex-col flex-1 overflow-hidden min-w-0">
        <!-- Request editor section -->
        <div class="flex-shrink-0 border-b border-compass-border bg-compass-surface px-4 py-4">
          <div v-if="request.currentEndpoint.value" class="mb-3">
            <p class="text-xs text-compass-muted">{{ request.currentEndpoint.value.description }}</p>
          </div>

          <RequestEditor
            v-if="request.endpointId.value"
            :body="request.body.value"
            :content-type="request.contentType.value"
            :headers="request.headers.value"
            :presets="request.currentEndpoint.value?.presets ?? []"
            :method="request.currentEndpoint.value?.method ?? 'GET'"
            @update:body="onBodyChange"
            @update:content-type="onContentTypeChange"
            @update:headers="onHeadersChange"
            @apply-preset="onApplyPreset"
          />
          <p v-else class="text-xs text-compass-muted italic">Select an endpoint to configure the request.</p>

          <!-- Send button -->
          <div class="mt-4 flex justify-end">
            <button
              data-testid="api-explorer-send-btn"
              :disabled="!request.canSend.value || request.isLoading.value"
              class="px-5 py-1.5 rounded bg-compass-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              @click="request.send()"
            >
              Send
            </button>
          </div>
        </div>

        <!-- Response viewer -->
        <div class="flex-1 overflow-hidden">
          <ResponseViewer
            :response="request.response.value"
            :is-loading="request.isLoading.value"
            :send-error="request.sendError.value"
          />
        </div>
      </div>
    </div>
  </div>
</template>
