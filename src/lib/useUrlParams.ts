import { watch, type Ref } from 'vue'

/**
 * Syncs a map of string refs to/from URL search params using `history.replaceState`.
 * Hydrates each ref from the current URL on call, then watches for changes and
 * writes back without triggering navigation. Empty values are removed from the URL.
 */
export function useUrlParams(params: Record<string, Ref<string>>): void {
  const initial = new URLSearchParams(window.location.search)

  for (const [key, ref] of Object.entries(params)) {
    const val = initial.get(key)
    if (val !== null) ref.value = val
  }

  watch(
    Object.values(params),
    () => {
      const current = new URLSearchParams(window.location.search)
      for (const [key, ref] of Object.entries(params)) {
        if (ref.value) current.set(key, ref.value)
        else current.delete(key)
      }
      const qs = current.toString()
      history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    },
    { flush: 'post' },
  )
}
