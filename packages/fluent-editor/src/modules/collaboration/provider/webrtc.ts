import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

export interface WebRTCProviderOptions {
  /** Room name for the collaboration */
  roomName: string
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

export function setupWebRTCProvider(options: WebRTCProviderOptions, ydoc: Y.Doc) {
  return new WebrtcProvider(options.roomName, ydoc, options)
}
