import type { Awareness } from 'y-protocols/awareness'
import type { WebsocketProvider } from 'y-websocket'
import type * as Y from 'yjs'

export interface YjsOptions {
  // Yjs 核心配置
  ydoc?: Y.Doc
  // 提供者配置
  providers: {
    type: string
    options: WebsocketProvider | null
  }[]

  // 用户感知
  awareness?: Awareness

}
