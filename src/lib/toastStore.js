import { writable } from 'svelte/store';

export const toast = writable({
  message: '',
  type: 'info', // 'info', 'success', 'error', etc.
  show: false
});

export function showToast(message, type) {
  toast.set({
    message,
    type,
    show: true
  });

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.set({ message: '', type: 'info', show: false });
  }, 3000);
}
