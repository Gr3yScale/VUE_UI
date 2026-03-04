# VUE_UI Project Guide

Component playground built with Vue 3, TypeScript, Vite, Vitest, and Tailwind CSS.
Each component in `src/components/` is self-contained and registered in the playground shell via `src/registry.ts`.

---

## How the Playground Works

`src/App.vue` renders a sidebar + main area. The sidebar lists every entry from `src/registry.ts`. The main area renders whichever component is selected.

To add a new component to the playground:
1. Create `src/components/<Name>/` using the folder structure below
2. Export a `<Name>Entry: PlaygroundEntry` from `<Name>/index.ts`
3. Add it to `src/registry.ts` — `App.vue` needs no changes

---

## Folder Structure for a Component

```
src/components/<Name>/
  index.ts              # Barrel export + PlaygroundEntry registration
  <Name>.vue            # Smart container — orchestrates composables, no logic of its own
  types.ts              # All type contracts — written BEFORE any implementation
  config.ts             # Constants (API URLs, feature flags, page sizes)
  api.ts                # All fetch calls in one place — see "API Layer" below
  composables/
    use<Feature>.ts     # Business logic as composable
    use<Feature>.test.ts
  components/
    <Child>.vue         # Presentational only — props in, emits out
    <Child>.test.ts
  data/
    <static>.ts         # Static lookup data (no fetching)
  __fakes__/
    Fake<Feature>.ts    # Test fakes implementing composable interfaces
```

---

## API Layer (`api.ts`)

**All fetch calls live in `api.ts`.** Composables never call `fetch` directly.

```ts
// api.ts — typed functions, throw on any error
export async function fetchThing(id: string): Promise<Thing> {
  const res = await fetch(`${API_BASE_URL}/things/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data: unknown = await res.json()
  if (!isThing(data)) throw new Error('Unexpected response format from server')
  return data
}
```

Rules:
- One function per endpoint, named after what it does (`fetchMetadata`, `fetchQuery`)
- Always validate response shape with a type guard before returning
- Throw `Error` on non-2xx, network failure, or bad shape — callers handle state
- The base URL lives in `config.ts`, imported by `api.ts` only
- To point at a real backend: change `API_BASE_URL` in `config.ts`

Composables call api functions and own the reactive state:
```ts
async function load(): Promise<void> {
  isLoading.value = true
  try {
    const data = await fetchThing(id)
    thing.value = data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Network error'
  } finally {
    isLoading.value = false
  }
}
```

---

## TypeScript Rules

- Define the contract (`interface`) before writing any implementation — always
- Prefer `interface` over `type` for object shapes (extendable, clearer intent)
- Use `type` only for unions, aliases, and mapped types
- No `any` — use `unknown` at boundaries, then narrow with type guards
- Export types explicitly; use barrel `index.ts` at folder boundaries
- All composable return shapes are a named `interface` (e.g. `UseThingReturn`)

```ts
// types.ts — contracts first
export interface Thing {
  id: string
  name: string
}

// composable — interface before function
export interface UseThingReturn {
  thing: Ref<Thing | null>
  isLoading: Ref<boolean>
  load(id: string): Promise<void>
}

export function useThing(): UseThingReturn { ... }
```

---

## Vue Component Rules

### Smart vs Presentational

| | Smart (container) | Presentational |
|---|---|---|
| File | `<Name>.vue` (root of folder) | `components/<Child>.vue` |
| Calls composables | Yes | Never |
| Calls api | Never | Never |
| Props | None or minimal | All data via props |
| Emits | None or minimal | All actions via emits |
| Logic | Wires composables to children | None beyond ternaries |

### Script Setup

Always use `<script setup lang="ts">`. No Options API.

```vue
<script setup lang="ts">
// 1. imports
// 2. props / emits
// 3. composable calls
// 4. local refs
// 5. computed
// 6. functions
// 7. lifecycle hooks (watch, onMounted last)
</script>
```

### Props and Emits

```ts
// Always typed — no runtime validators needed when TypeScript is strict
const props = defineProps<{
  items: Item[]
  selected: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:selected': [id: string]
  close: []
}>()
```

### No logic in templates

Extract to computed or functions. Templates should only bind, iterate, and show/hide.

```vue
<!-- Bad -->
{{ items.filter(i => i.active).length > 0 ? 'Yes' : 'No' }}

<!-- Good -->
{{ hasActiveItems ? 'Yes' : 'No' }}
```

---

## Composable Rules

- One concern per composable (`useQuery` owns query state, `usePagination` owns pages)
- Always return a named `interface` — this enables fakes in tests
- Composables orchestrate; they don't fetch directly (use `api.ts`)
- Internal helpers are plain functions outside the composable, not exported

```ts
// Pure helper — not exported, no reactivity
function validateJson(raw: string): JsonEditorState { ... }

// Composable — exported, returns reactive interface
export function useEditor(): UseEditorReturn { ... }
```

---

## Testing Rules

### Fakes over mocks

Never mock stateful dependencies (composables, services). Write a `Fake<Name>` class:

```ts
// __fakes__/FakeThing.ts
export class FakeThing implements UseThingReturn {
  thing = ref<Thing | null>(null)
  isLoading = ref(false)
  load = vi.fn(async () => {})

  // Seed helpers for test setup
  seed(t: Thing) { this.thing.value = t }
}
```

Use `vi.fn()` for fire-and-forget methods (load, reset, navigate).
Use real reactive refs for state that components read.

### Component tests

```ts
import { mount } from '@vue/test-utils'
import { FakeThing } from '../__fakes__/FakeThing'

it('shows the thing name', () => {
  const fake = new FakeThing()
  fake.seed({ id: '1', name: 'Widget' })

  const wrapper = mount(ThingCard, {
    props: { thing: fake.thing.value! },
  })

  expect(wrapper.find('[data-testid="thing-name"]').text()).toBe('Widget')
})
```

### No arbitrary waits

No `setTimeout`, `sleep`, or `tick(99999)`. Use `vi.useFakeTimers()` and advance explicitly.

---

## Test IDs

Every interactive or meaningful element gets a `data-testid`. Set it at creation time, not later.

Format: `<component>-<element>-<role>` in kebab-case.

```html
<button data-testid="query-editor-run-btn" />
<input  data-testid="login-email-input" />
<ul     data-testid="order-list">
  <li   :data-testid="`order-list-item-${order.id}`" />
</ul>
```

Never select by class, tag, or text content in tests.

---

## Tailwind / Styling

All colours use the `compass.*` palette defined in `tailwind.config.ts`. Never use raw Tailwind colour names (`blue-500`, `gray-200`) for component colours — always use semantic compass tokens.

| Token | Role |
|---|---|
| `compass-bg` | Page background |
| `compass-surface` | Card / panel background |
| `compass-elevated` | Inputs, code blocks |
| `compass-border` | All borders |
| `compass-muted` | Secondary text, labels |
| `compass-text` | Body text |
| `compass-heading` | Headings, emphasis |
| `compass-accent` | Primary action (green) |
| `compass-error` | Error states |
| `compass-string/number/boolean/key` | JSON tree colours |

Dark mode is always on (`<html class="dark">` in `index.html`). No light mode variants needed.

Typography in `<code>` / `<pre>` / editors: `font-mono` (maps to JetBrains Mono stack).

---

## JSDoc

Public interfaces and exported functions get one-line JSDoc. Implementation internals do not.

```ts
/** Manages paginated fetching for a MongoDB collection. */
export interface UseQueryReturn {
  /** Executes a fresh query, resetting pagination. */
  runQuery(): Promise<void>
}

// No doc needed — name is self-explanatory
function emptyEditorState(): JsonEditorState { ... }
```

---

## Commands

```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run server     # Stub API server → http://localhost:3001
npm run test       # Vitest watch
npm run test -- --run   # Single run
npm run typecheck  # vue-tsc check
npm run build      # Production build
```
