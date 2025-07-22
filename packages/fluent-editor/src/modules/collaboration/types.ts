import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'
import type { AwarenessOptions, IndexedDBOptions } from './awareness'
import type { HocuspocusProviderOptions, WebRTCProviderOptions, WebsocketProviderOptions } from './provider'
import type { UnifiedProvider } from './provider/customProvider'

// Provider 事件回调处理函数
export interface ProviderEventHandlers {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onSyncChange?: (isSynced: boolean) => void
}
export interface BaseYjsProviderConfig extends ProviderEventHandlers {
  options: Record<string, any>
  type: string
}

// 原配 Provider 配置
export type WebRTCProviderConfig = BaseYjsProviderConfig & {
  options: WebRTCProviderOptions
  type: 'webrtc'
}
export type WebsocketProviderConfig = BaseYjsProviderConfig & {
  options: WebsocketProviderOptions
  type: 'websocket'
}

export interface YjsOptions {
  id?: string
  // Yjs 核心配置
  ydoc?: Y.Doc
  // 提供者配置
  provider: (WebRTCProviderConfig | WebsocketProviderConfig | UnifiedProvider)
  // 用户感知
  awareness?: AwarenessOptions
  offline?: boolean | IndexedDBOptions

  // 事件回调
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error) => void
  onSyncChange?: (isSynced: boolean) => void
}
