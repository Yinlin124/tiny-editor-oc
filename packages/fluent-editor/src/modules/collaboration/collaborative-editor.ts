import type FluentEditor from '../../fluent-editor'
import type { CollaborationOptions } from './types'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

export class CollaborativeEditor {
  // 核心组件
  private ydoc: Y.Doc
  private provider: WebsocketProvider | null = null
  private binding: QuillBinding | null = null

  constructor(
    public quill: FluentEditor,
    private options: CollaborationOptions,
  ) {
    this.init()
  }

  private init() {
    // 1. 初始化 Y.Doc
    this.ydoc = new Y.Doc()

    // 2. 建立 WebSocket 连接
    if (!this.options.websocketUrl || !this.options.roomId) {
      throw new Error('WebSocket URL 和 Room ID 是必需的')
    }
    this.provider = new WebsocketProvider(
      this.options.websocketUrl,
      this.options.roomId,
      this.ydoc,
    )

    // 3. 绑定 Quill 编辑器
    const ytext = this.ydoc.getText('quill')
    this.binding = new QuillBinding(
      ytext,
      this.quill,
      this.provider.awareness,
    )
    console.log('协同编辑器已初始化', { ydoc: this.ydoc, provider: this.provider, binding: this.binding })

    // 输出当前连接用户信息
    console.log('当前连接用户:', this.provider.awareness.getStates())
  }

  public destroy() {
    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }
    if (this.binding) {
      this.binding.destroy()
      this.binding = null
    }
  }
}
