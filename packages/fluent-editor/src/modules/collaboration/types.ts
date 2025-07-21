import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'
import type { AwarenessOptions, IndexedDBOptions } from './awareness'
import type { HocuspocusProviderOptions, WebRTCProviderOptions, WebsocketProviderOptions } from './provider'

// Provider 事件处理函数
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

// Provider 构造函数
export type ProviderConstructor<T = any> = new (
  props: ProviderConstructorProps<T>
) => UnifiedProvider

// Provider 构造函数参数
export type ProviderConstructorProps<T = any> = {
  options: T
  awareness?: Awareness
  doc?: Y.Doc
} & ProviderEventHandlers

// Provider 统一格式
export interface UnifiedProvider {
  awareness: Awareness
  document: Y.Doc
  type: string
  connect: () => void
  destroy: () => void
  disconnect: () => void
  isConnected: boolean
  isSynced: boolean
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
  providers: (WebRTCProviderConfig | WebsocketProviderConfig | BaseYjsProviderConfig)[]
  // 用户感知
  awareness?: AwarenessOptions
  offline?: boolean | IndexedDBOptions
}
