export const STORAGE_KEY = "buds-flowers-v2";

// `storage` events don't fire on the same tab that wrote the value.
// We use a custom event so the UI can refresh immediately after edits.
export const BUDS_STORAGE_UPDATED_EVENT = "buds:storage-updated";

