import type { ProviderEventHandlers } from '../types'
import type { UnifiedProvider } from './customProvider'
import { Awareness } from 'y-protocols/awareness'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

export interface WebsocketProviderOptions extends ProviderEventHandlers {
  /**
   * WebSocket server URL
   */
  serverUrl: string
  /**
   * Room name to connect to
   */
  roomname: string

  /** Whether to connect immediately */
  connect?: boolean
  /** Awareness instance for user presence */
  awareness?: any
  /** Additional URL parameters */
  params?: Record<string, string>
  /** WebSocket protocols */
  protocols?: string[]
  /** Optional WebSocket polyfill */
  WebSocketPolyfill?: typeof WebSocket
  /** Request server state interval in milliseconds */
  resyncInterval?: number
  /** Maximum reconnection backoff time */
  maxBackoffTime?: number
  /** Disable cross-tab BroadcastChannel */
  disableBc?: boolean
}

export class WebsocketProviderWrapper implements UnifiedProvider {
  private provider: WebsocketProvider

  private _isConnected = false
  private _isSynced = false
  private doc: Y.Doc

  awareness: Awareness
  document: Y.Doc
  type: 'websocket'

  private onConnect?: () => void
  private onDisconnect?: () => void
  private onError?: (error: Error) => void
  private onSyncChange?: (isSynced: boolean) => void

  constructor({
    awareness,
    doc,
    options,
    onConnect,
    onDisconnect,
    onError,
    onSyncChange,
  }: {
    options: WebsocketProviderOptions
    awareness?: Awareness
    doc?: Y.Doc
  } & ProviderEventHandlers) {
    this.onConnect = onConnect
    this.onDisconnect = onDisconnect
    this.onError = onError
    this.onSyncChange = onSyncChange

    this.doc = doc || new Y.Doc()
    this.awareness = awareness || new Awareness(this.doc)
    try {
      this.provider = new WebsocketProvider(
        options.serverUrl,
        options.roomname,
        this.doc,
        {
          awareness: this.awareness,
          connect: options.connect,
          params: options.params,
          protocols: options.protocols,
          WebSocketPolyfill: options.WebSocketPolyfill,
          resyncInterval: options.resyncInterval,
          maxBackoffTime: options.maxBackoffTime,
          disableBc: options.disableBc,
        },
      )

      // Set connection status
      this.provider.on('status', (event: { status: 'connected' | 'disconnected' | 'connecting' }) => {
        const wasConnected = this._isConnected
        this._isConnected = event.status === 'connected'

        if (event.status === 'connected') {
          // Notify about connection only if it wasn't connected before
          if (!wasConnected) {
            onConnect?.()
          }
          // Treat first connection as sync for P2P, trigger sync change if not already synced
          if (!this._isSynced) {
            this._isSynced = true
            onSyncChange?.(true)
          }
        }
        else if (event.status === 'disconnected') {
          // Handle disconnection only if it was connected before
          if (wasConnected) {
            onDisconnect?.()

            // Explicitly set synced to false on disconnect if it was true
            // This ensures onSyncChange(false) is called reliably
            if (this._isSynced) {
              this._isSynced = false
              onSyncChange?.(false)
            }
          }
        }
      })
    }
    catch (error) {
      console.warn('[yjs] Error creating WebSocket provider:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
      // Don't throw, just log the error - the provider will be null
    }
  }

  connect = () => {
    if (this.provider) {
      try {
        this.provider.connect()
      }
      catch (error) {
        console.warn('[yjs] Error connecting WebRTC provider:', error)
      }
    }
  }

  destroy = () => {
    if (this.provider) {
      try {
        this.provider.destroy()
      }
      catch (error) {
        console.warn('[yjs] Error destroying WebRTC provider:', error)
      }
    }
  }

  disconnect = () => {
    if (this.provider) {
      try {
        this.provider.disconnect()
        const wasSynced = this._isSynced

        this._isConnected = false
        this._isSynced = false

        // If we were synced, notify about sync state change
        if (wasSynced) {
          this.onSyncChange?.(false)
        }
      }
      catch (error) {
        console.warn('[yjs] Error disconnecting WebRTC provider:', error)
      }
    }
  }

  get isConnected() {
    return this._isConnected
  }

  get isSynced() {
    return this._isSynced
  }

  getProvider() {
    return this.provider
  }

  getDoc() {
    return this.doc
  }

  getAwareness() {
    return this.awareness
  }
}
