<script setup lang="ts">
import { onMounted } from 'vue'
import { useMqNamedSend } from './composables/useMqNamedSend'
import MqMessageEditor from './components/MqMessageEditor.vue'
import MqResponseViewer from './components/MqResponseViewer.vue'

const send = useMqNamedSend()

onMounted(() => send.loadConfig())
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="flex flex-col gap-6 p-6">
      <h1 class="text-xl font-semibold text-compass-heading">MQ Named Sender</h1>

      <!-- Top: name picker (left) + message editor (right) -->
      <div class="flex gap-6 items-start">
        <!-- Left: MQ name search + list -->
        <section class="w-72 flex-shrink-0 flex flex-col gap-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-compass-muted">MQ Name</h2>

          <div
            v-if="send.configError.value"
            class="rounded border border-compass-error bg-compass-surface px-3 py-2 text-sm text-compass-error"
          >
            {{ send.configError.value }}
          </div>

          <div v-if="send.selectedName.value" class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-compass-muted">Selected:</span>
            <span
              data-testid="mq-named-sender-selected-name"
              class="rounded-full bg-compass-accent/20 px-3 py-0.5 text-sm font-medium text-compass-accent"
            >
              {{ send.selectedName.value }}
            </span>
            <button
              type="button"
              class="text-xs text-compass-muted hover:text-compass-text"
              @click="send.selectName('')"
            >
              Clear
            </button>
          </div>

          <input
            data-testid="mq-named-sender-search-input"
            v-model="send.searchQuery.value"
            type="text"
            :disabled="send.isConfigLoading.value"
            class="rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
            placeholder="Search MQ names..."
          />

          <div v-if="send.isConfigLoading.value" class="text-compass-muted text-sm">
            Loading config...
          </div>

          <ul
            v-else-if="send.filteredNames.value.length > 0"
            class="flex flex-col gap-0.5 rounded border border-compass-border bg-compass-surface p-1"
          >
            <li
              v-for="name in send.filteredNames.value"
              :key="name"
              :data-testid="`mq-named-sender-name-item-${name}`"
              class="cursor-pointer rounded px-3 py-2 text-sm text-compass-text hover:bg-compass-elevated"
              :class="{ 'bg-compass-elevated font-semibold text-compass-heading': send.selectedName.value === name }"
              @click="send.selectName(name)"
            >
              {{ name }}
            </li>
          </ul>

          <p
            v-else-if="!send.isConfigLoading.value && !send.configError.value"
            class="text-sm text-compass-muted italic"
          >
            No names match your search.
          </p>
        </section>

        <!-- Right: message editor -->
        <section class="flex-1 flex flex-col gap-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-compass-muted">Message</h2>
          <MqMessageEditor
            :message="send.message.value"
            :delimiter="send.delimiter.value"
            :is-loading="send.isLoading.value"
            @update:message="send.message.value = $event"
            @update:delimiter="send.delimiter.value = $event"
          />
        </section>
      </div>

      <button
        data-testid="mq-named-sender-send-btn"
        type="button"
        :disabled="!send.canSend.value || send.isLoading.value"
        class="self-start rounded bg-compass-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        @click="send.send()"
      >
        Send
      </button>

      <!-- Bottom: response -->
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-compass-muted">Response</h2>
        <MqResponseViewer
          :response="send.response.value"
          :is-loading="send.isLoading.value"
          :send-error="send.sendError.value"
        />
      </section>
    </div>
  </div>
</template>
