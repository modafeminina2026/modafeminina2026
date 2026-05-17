export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

export function useToast() {
  // useState INSIDE the function — required by Nuxt 4
  const toasts = useState<Toast[]>('toasts', () => [])

  function add(message: string, type: ToastType = 'info', duration = 4000) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, type, message, duration })

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (msg: string, duration?: number) => add(msg, 'success', duration)
  const error   = (msg: string, duration?: number) => add(msg, 'error', duration)
  const warning = (msg: string, duration?: number) => add(msg, 'warning', duration)
  const info    = (msg: string, duration?: number) => add(msg, 'info', duration)

  return { toasts, add, remove, success, error, warning, info }
}
