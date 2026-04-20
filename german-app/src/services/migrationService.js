const SCHEMA_VERSION_KEY = 'german_app_schema_version'
const CURRENT_VERSION = 1

// Keys managed by Zustand persist — cleared on breaking schema change
const PERSISTED_KEYS = [
  'german_app_v1.profile',
  'german_app_v1.gamification',
  'german_app_v1.cache',
]

function getStoredVersion() {
  const v = localStorage.getItem(SCHEMA_VERSION_KEY)
  return v ? parseInt(v, 10) : null
}

function clearPersistedStores() {
  PERSISTED_KEYS.forEach((key) => localStorage.removeItem(key))
}

// Add migration functions here as the schema evolves.
// Each entry runs when upgrading FROM that version.
const migrations = {
  // Example for future use:
  // 1: () => { /* migrate v1 → v2 */ },
}

export function runMigrations() {
  const stored = getStoredVersion()

  if (stored === null) {
    // First run — write current version, nothing to migrate
    localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_VERSION))
    return
  }

  if (stored === CURRENT_VERSION) return

  if (stored > CURRENT_VERSION) {
    // Downgrade: wipe persisted state to avoid corruption
    console.warn('[migration] Stored schema version is newer than app. Clearing persisted stores.')
    clearPersistedStores()
    localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_VERSION))
    return
  }

  // Run each migration step in order
  for (let v = stored; v < CURRENT_VERSION; v++) {
    if (migrations[v]) {
      console.info(`[migration] Running migration v${v} → v${v + 1}`)
      migrations[v]()
    }
  }

  localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_VERSION))
}
