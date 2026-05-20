export function readAdminDraft(key) {
  if (typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`Failed to read admin draft ${key}:`, error);
    return null;
  }
}

export function writeAdminDraft(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write admin draft ${key}:`, error);
  }
}

export function clearAdminDraft(key) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to clear admin draft ${key}:`, error);
  }
}
