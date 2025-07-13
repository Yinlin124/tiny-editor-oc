import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'
import type { AwarenessOptions } from './awareness'
import type { WebsocketProviderOptions } from './provider'

export interface YjsOptions {
  // Yjs 核心配置
  ydoc?: Y.Doc
  // 提供者配置
  providers: {
    type: string
    options: WebsocketProviderOptions | null
  }[]
  // 用户感知
  awareness?: AwarenessOptions

}
