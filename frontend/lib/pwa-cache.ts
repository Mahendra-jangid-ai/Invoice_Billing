export async function clearPwaCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return

  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  } catch {
    // Ignore cache cleanup failures
  }
}
