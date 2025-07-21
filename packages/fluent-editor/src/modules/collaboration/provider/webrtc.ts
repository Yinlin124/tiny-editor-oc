import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'
import type { ProviderEventHandlers } from '../types'
import type { UnifiedProvider } from './customProvider'
import { WebrtcProvider } from 'y-webrtc'

export interface WebRTCProviderOptions {
  /** Room name for the collaboration */
  roomname: string
  /** Whether to filter broadcast channel connections */
  filterBcConns?: boolean
  /** Maximum number of WebRTC connections */
  maxConns?: number
  /** Optional password for the room */
  password?: string
  /**
   * Additional peer options for simple-peer. See
   * [simple-peer](https://github.com/feross/simple-peer#api) for more details.
   */
  peerOpts?: Record<string, unknown>
  /** Optional signaling servers. Defaults to public servers if not specified */
  signaling?: string[]
}

export class WebRTCProviderWrapper implements UnifiedProvider {
  private provider: WebrtcProvider
  private _isConnected = false
  private _isSynced = false
  private doc: Y.Doc

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
    options: WebRTCProviderOptions
    awareness?: Awareness
    doc?: Y.Doc
  } & ProviderEventHandlers) {
    this.onConnect = onConnect
    this.onDisconnect = onDisconnect
    this.onError = onError
    this.onSyncChange = onSyncChange

    this.doc = doc || new Y.Doc()
    try {
      this.provider = new WebrtcProvider(options.roomname, this.doc, {
        awareness,
        filterBcConns: options.filterBcConns,
        maxConns: options.maxConns,
        password: options.password,
        peerOpts: options.peerOpts,
        signaling: options.signaling,
      })

      // Set connection status
      this.provider.on('status', (status: { connected: boolean }) => {
        const wasConnected = this._isConnected
        this._isConnected = status.connected

        if (status.connected) {
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
        else {
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
      console.warn('[yjs] Error creating WebRTC provider:', error)
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

  type: 'webrtc'

  get awareness(): Awareness {
    return this.provider!.awareness
  }

  get document() {
    return this.doc
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
}
