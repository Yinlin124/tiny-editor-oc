import type * as Y from 'yjs'
import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider'

export interface HocuspocusProviderOptions {
  /**
   * The URL of the Hocuspocus server
   */
  serverUrl: string
  /**
   * The name of the document
   */
  roomname: string
  /**
   * Additional options for Hocuspocus provider
   */
  /** An authentication token that will be passed to the server */
  token?: string | (() => string) | (() => Promise<string>)
  /** Awareness object */
  awareness?: any
  /** Ask the server every x ms for updates */
  forceSyncInterval?: number | false
  /** An instance of HocuspocusProviderWebsocket */
  websocketProvider?: HocuspocusProviderWebsocket
  /** WebSocket polyfill for Node.js */
  WebSocketPolyfill?: typeof WebSocket
  /** Timeout in milliseconds */
  timeout?: number
  /** Factor to grow delay exponentially */
  factor?: number
  /** Maximum number of attempts */
  maxAttempts?: number
  /** Lower bound of delay when jitter is enabled */
  minDelay?: number
  /** Upper bound for delay when factor is enabled */
  maxDelay?: number
  /** Random delay between minDelay and calculated delay */
  jitter?: boolean
  /** Close connection when no message received after timeout */
  messageReconnectTimeout?: number
  /** Delay between each attempt in milliseconds */
  delay?: number
  /** Amount of time to wait before making first attempt */
  initialDelay?: number
}

export function setupHocuspocusProvider(options: HocuspocusProviderOptions, ydoc: Y.Doc) {
  const websocketProvider = new HocuspocusProviderWebsocket({
    url: options.serverUrl,
    timeout: options.timeout || 0,
    factor: options.factor || 2,
    maxAttempts: options.maxAttempts || 0,
    minDelay: options.minDelay || 1000,
    maxDelay: options.maxDelay || 30000,
    jitter: options.jitter !== false,
    messageReconnectTimeout: options.messageReconnectTimeout || 30000,
    delay: options.delay || 1000,
    initialDelay: options.initialDelay || 0,
  })

  return new HocuspocusProvider({
    url: options.serverUrl,
    name: options.roomname,
    document: ydoc,
    websocketProvider,
    ...(options.token && { token: options.token }),
    ...(options.awareness && { awareness: options.awareness }),
    ...(options.forceSyncInterval !== undefined && { forceSyncInterval: options.forceSyncInterval }),
  })
}
