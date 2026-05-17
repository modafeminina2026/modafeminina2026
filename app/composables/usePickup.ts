export function usePickup() {
  const { success, error: toastError } = useToast()

  /**
   * Calculates pickup ready date: today + 3 business days (skips weekends).
   * Mirrors the DB function calculate_pickup_ready_date().
   */
  function calculatePickupReadyDate(from = new Date()): Date {
    const date = new Date(from)
    let days = 0
    while (days < 3) {
      date.setDate(date.getDate() + 1)
      const dow = date.getDay()
      if (dow !== 0 && dow !== 6) days++ // skip Sunday (0) and Saturday (6)
    }
    date.setHours(12, 0, 0, 0)
    return date
  }

  function formatPickupDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
  }

  function formatPickupCode(code: string): string {
    // Ensure 4-digit display with leading zeros
    return code.padStart(4, '0')
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      success(`Código ${formatPickupCode(code)} copiado! 📋`)
    } catch {
      toastError('Não foi possível copiar o código')
    }
  }

  function getPickupStatusLabel(status: string | null): string {
    const labels: Record<string, string> = {
      waiting:    'Aguardando Preparo',
      ready:      'Pronto para Retirada ✅',
      picked_up:  'Retirado',
    }
    return status ? (labels[status] ?? status) : 'Aguardando'
  }

  function getPickupStatusColor(status: string | null): string {
    const colors: Record<string, string> = {
      waiting:   'text-yellow-600 bg-yellow-50',
      ready:     'text-green-600 bg-green-50',
      picked_up: 'text-gray-500 bg-gray-50',
    }
    return status ? (colors[status] ?? 'text-gray-500 bg-gray-50') : 'text-yellow-600 bg-yellow-50'
  }

  return {
    calculatePickupReadyDate,
    formatPickupDate,
    formatPickupCode,
    copyCode,
    getPickupStatusLabel,
    getPickupStatusColor,
  }
}
