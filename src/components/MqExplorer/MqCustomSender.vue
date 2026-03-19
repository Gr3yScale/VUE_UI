<script setup lang="ts">
import { useMqCustomSend } from './composables/useMqCustomSend'
import MqMessageEditor from './components/MqMessageEditor.vue'
import MqResponseViewer from './components/MqResponseViewer.vue'

const send = useMqCustomSend()
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
    <h1 class="text-xl font-semibold text-compass-heading">MQ Custom Sender</h1>

    <section class="flex flex-col gap-4">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-compass-muted">Connection</h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-compass-muted">Host</label>
          <input
            data-testid="mq-custom-sender-host-input"
            v-model="send.host.value"
            type="text"
            :disabled="send.isLoading.value"
            class="rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
            placeholder="localhost"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-compass-muted">Port</label>
          <input
            data-testid="mq-custom-sender-port-input"
            v-model="send.port.value"
            type="number"
            :disabled="send.isLoading.value"
            class="rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
            placeholder="1414"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-compass-muted">Channel</label>
          <input
            data-testid="mq-custom-sender-channel-input"
            v-model="send.channel.value"
            type="text"
            :disabled="send.isLoading.value"
            class="rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
            placeholder="DEV.APP.SVRCONN"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-compass-muted">Queue Manager</label>
          <input
            data-testid="mq-custom-sender-queue-manager-input"
            v-model="send.queueManager.value"
            type="text"
            :disabled="send.isLoading.value"
            class="rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
            placeholder="QM1"
          />
        </div>

        <div class="col-span-2 flex flex-col gap-1">
          <label class="text-sm font-medium text-compass-muted">Queue Name</label>
          <input
            data-testid="mq-custom-sender-queue-name-input"
            v-model="send.queueName.value"
            type="text"
            :disabled="send.isLoading.value"
            class="rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
            placeholder="DEV.QUEUE.1"
          />
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-compass-muted">Message</h2>
      <MqMessageEditor
        :message="send.message.value"
        :delimiter="send.delimiter.value"
        :is-loading="send.isLoading.value"
        @update:message="send.message.value = $event"
        @update:delimiter="send.delimiter.value = $event"
      />
    </section>

    <button
      data-testid="mq-custom-sender-send-btn"
      type="button"
      :disabled="!send.canSend.value || send.isLoading.value"
      class="self-start rounded bg-compass-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
      @click="send.send()"
    >
      Send
    </button>

    <section class="flex flex-col gap-2">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-compass-muted">Response</h2>
      <MqResponseViewer
        :response="send.response.value"
        :is-loading="send.isLoading.value"
        :send-error="send.sendError.value"
      />
    </section>
  </div>
</template>
