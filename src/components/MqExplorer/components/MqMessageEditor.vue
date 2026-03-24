<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  message: string
  delimiter: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:message', value: string): void
  (e: 'update:delimiter', value: string): void
}>()

const fileInputEl = ref<HTMLInputElement | null>(null)

function triggerFileUpload(): void {
  fileInputEl.value?.click()
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    emit('update:message', reader.result as string)
  }
  reader.readAsText(file)
  input.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-compass-muted">Message</label>
      <textarea
        data-testid="mq-message-editor-textarea"
        :value="props.message"
        :disabled="props.isLoading"
        class="min-h-[10rem] resize-y rounded border border-compass-border bg-compass-elevated px-3 py-2 font-mono text-sm text-compass-text placeholder-compass-muted focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
        placeholder="Enter message body..."
        @input="emit('update:message', $event.target.value)"
      />
    </div>

    <div class="flex items-center gap-3">
      <button
        data-testid="mq-message-editor-upload-btn"
        type="button"
        :disabled="props.isLoading"
        class="rounded border border-compass-border bg-compass-surface px-3 py-1.5 text-sm text-compass-text hover:bg-compass-elevated disabled:opacity-50"
        @click="triggerFileUpload"
      >
        Load from file
      </button>
      <input
        ref="fileInputEl"
        type="file"
        class="hidden"
        accept=".txt,.json,.xml,.csv,text/*"
        @change="onFileChange"
      />

      <div class="flex items-center gap-2 ml-auto">
        <label class="text-sm text-compass-muted whitespace-nowrap">Delimiter (optional)</label>
        <input
          data-testid="mq-message-editor-delimiter-input"
          type="text"
          :value="props.delimiter"
          :disabled="props.isLoading"
          class="w-24 rounded border border-compass-border bg-compass-elevated px-2 py-1.5 font-mono text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
          placeholder="e.g. |"
          @input="emit('update:delimiter', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>
