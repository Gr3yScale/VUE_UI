<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { sql, PostgreSQL, MySQL, SQLite, StandardSQL } from '@codemirror/lang-sql'
import { Compartment, EditorState } from '@codemirror/state'
import type { SqlFlavor } from '../types'

const props = defineProps<{
  value: string
  flavor: SqlFlavor
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: string): void
}>()

const container = ref<HTMLElement | null>(null)
let view: EditorView | null = null
let isUpdatingFromParent = false

const dialectCompartment = new Compartment()
const editableCompartment = new Compartment()

const FLAVOR_MAP = {
  PostgreSQL,
  MySQL,
  SQLite,
  'Standard SQL': StandardSQL,
}

function buildTheme() {
  return EditorView.theme({
    '&': {
      backgroundColor: '#1a1f2e',
      color: '#c9d1d9',
      fontSize: '13px',
      fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#58a6ff',
      padding: '8px 0',
    },
    '.cm-cursor': { borderLeftColor: '#58a6ff' },
    '.cm-gutters': {
      backgroundColor: '#161b27',
      color: '#6e7681',
      border: 'none',
      borderRight: '1px solid #30363d',
    },
    '.cm-activeLineGutter': { backgroundColor: '#1f2640' },
    '.cm-activeLine': { backgroundColor: '#1f2640' },
    '.cm-selectionBackground': { backgroundColor: '#264f78 !important' },
    '&.cm-focused .cm-selectionBackground': { backgroundColor: '#264f78 !important' },
    '.cm-matchingBracket': { backgroundColor: '#264f78', color: '#c9d1d9 !important' },
    '.cm-tooltip': { backgroundColor: '#1e2533', border: '1px solid #30363d' },
    '.cm-tooltip-autocomplete': { backgroundColor: '#1e2533' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#264f78' },
  }, { dark: true })
}

onMounted(() => {
  if (!container.value) return

  const dialect = FLAVOR_MAP[props.flavor] ?? PostgreSQL

  view = new EditorView({
    state: EditorState.create({
      doc: props.value,
      extensions: [
        basicSetup,
        dialectCompartment.of(sql({ dialect })),
        buildTheme(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isUpdatingFromParent) {
            emit('input', update.state.doc.toString())
          }
        }),
        editableCompartment.of(EditorView.editable.of(!props.disabled)),
      ],
    }),
    parent: container.value,
  })
})

onUnmounted(() => {
  view?.destroy()
  view = null
})

watch(() => props.flavor, (newFlavor) => {
  if (!view) return
  const dialect = FLAVOR_MAP[newFlavor] ?? PostgreSQL
  view.dispatch({ effects: dialectCompartment.reconfigure(sql({ dialect })) })
})

watch(() => props.value, (newVal) => {
  if (!view) return
  const current = view.state.doc.toString()
  if (current === newVal) return
  isUpdatingFromParent = true
  view.dispatch({
    changes: { from: 0, to: current.length, insert: newVal },
  })
  isUpdatingFromParent = false
})

watch(() => props.disabled, (disabled) => {
  if (!view) return
  view.dispatch({ effects: editableCompartment.reconfigure(EditorView.editable.of(!disabled)) })
})
</script>

<template>
  <div
    ref="container"
    data-testid="sql-editor-container"
    class="h-full w-full overflow-auto rounded border border-compass-border"
  />
</template>
