import { onMounted, watch, type Ref } from 'vue'

/**
 * Syncs a map of string refs to/from URL search params using `history.replaceState`.
 * Hydrates each ref from the current URL on call. On mount and on any change, rewrites
 * the URL from scratch (preserving only `view`) so stale params from other views are removed.
 * Empty values are omitted from the URL.
 */
export function useUrlParams(params: Record<string, Ref<string>>): void {
  const initial = new URLSearchParams(window.location.search)

  for (const [key, ref] of Object.entries(params)) {
    const val = initial.get(key)
    if (val !== null) ref.value = val
  }

  function writeToUrl(): void {
    const fresh = new URLSearchParams()
    const view = new URLSearchParams(window.location.search).get('view')
    if (view) fresh.set('view', view)
    for (const [key, ref] of Object.entries(params)) {
      if (ref.value) fresh.set(key, ref.value)
    }
    const qs = fresh.toString()
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }

  // Clean up stale params from the previous view as soon as this component mounts
  onMounted(writeToUrl)

  watch(Object.values(params), writeToUrl, { flush: 'post' })
}
