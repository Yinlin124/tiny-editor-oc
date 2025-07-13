export interface WebsocketProviderOptions {
  /**
   * WebSocket server URL
   */
  serverUrl: string
  /**
   * Room name to connect to
   */
  roomname: string
  /**
   * Additional options for WebSocket provider
   */
  opts?: {
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
}
