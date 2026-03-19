<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  response: unknown
  isLoading: boolean
  sendError: string | null
}>()

const copied = ref(false)

function copyResponse(): void {
  if (props.response === null) return
  navigator.clipboard.writeText(JSON.stringify(props.response, null, 2)).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  })
}
</script>

<template>
  <div class="rounded border border-compass-border bg-compass-surface p-4 min-h-[6rem]">
    <div v-if="props.isLoading" class="flex items-center gap-2 text-compass-muted text-sm">
      <span class="animate-spin inline-block w-4 h-4 border-2 border-compass-accent border-t-transparent rounded-full" />
      Sending...
    </div>

    <div v-else-if="props.sendError" class="text-compass-error text-sm">
      {{ props.sendError }}
    </div>

    <div v-else-if="props.response === null" class="text-compass-muted text-sm italic">
      No response yet. Send a message to see the result.
    </div>

    <div v-else class="flex flex-col gap-2">
      <div class="flex justify-end">
        <button
          data-testid="mq-response-viewer-copy-btn"
          type="button"
          class="text-xs text-compass-muted hover:text-compass-text px-2 py-1 rounded border border-compass-border bg-compass-elevated"
          @click="copyResponse"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <pre
        data-testid="mq-response-viewer-body"
        class="font-mono text-sm text-compass-text whitespace-pre-wrap break-all overflow-auto max-h-[24rem]"
      >{{ JSON.stringify(props.response, null, 2) }}</pre>
    </div>
  </div>
</template>
