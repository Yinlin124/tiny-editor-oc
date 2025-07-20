import type { Doc } from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

export interface IndexedDBOptions {
  dbName: string
}
/**
  Setup IndexedDB persistence for Y.js document
 */
export function setupIndexedDB(doc: Doc, options?: IndexedDBOptions) {
  const dbName = options?.dbName || 'document'
  // Create a new IndexedDB persistence with combined name and document
  return new IndexeddbPersistence(`tiny-editor-${dbName}`, doc)
}
