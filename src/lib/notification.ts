import { toast } from '@zerodevx/svelte-toast'

export function notification(message: string) {
  toast.push(message)
}

export function error(message: string) {
  const style = getComputedStyle(document.body)
  const background = style.getPropertyValue('--color-error')
  toast.push(message, {
    theme: {
      '--toastColor': 'mintcream',
      '--toastBackground': background,
      '--toastBarBackground': '#880000',
    },
  })
}

export function success(message: string) {
  const style = getComputedStyle(document.body)
  const background = style.getPropertyValue('--color-primary')
  toast.push(message, {
    theme: {
      '--toastColor': 'mintcream',
      '--toastBackground': background,
      '--toastBarBackground': '#004400',
    },
  })
}
