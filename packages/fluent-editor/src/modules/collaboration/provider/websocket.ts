import type * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export interface WebsocketProviderOptions {
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
export function setupWebsocketProvider(options: WebsocketProviderOptions, ydoc: Y.Doc) {
  return new WebsocketProvider(
    options.serverUrl,
    options.roomname,
    ydoc,
    options,
  )
}
