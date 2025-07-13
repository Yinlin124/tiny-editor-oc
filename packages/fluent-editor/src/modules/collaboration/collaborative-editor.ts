import type { Awareness } from 'y-protocols/awareness'
import type FluentEditor from '../../fluent-editor'
import type { YjsOptions } from './types'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { setupAwareness } from './awareness/awareness'

export class CollaborativeEditor {
  private ydoc: Y.Doc = new Y.Doc()
  private provider: WebsocketProvider
  private awareness: Awareness

  constructor(
    public quill: FluentEditor,
    private options: YjsOptions,
  ) {
    // 1. 初始化 Y.Doc
    this.ydoc = this.options.ydoc || new Y.Doc()

    // 2. 建立提供者连接
    if (this.options.providers && this.options.providers.length > 0) {
      for (const providerConfig of this.options.providers) {
        if (providerConfig.type === 'websocket') {
          this.provider = new WebsocketProvider(
            providerConfig.options.serverUrl,
            providerConfig.options.roomname,
            this.ydoc,
            providerConfig.options.opts,
          )
        }
      }
    }

    // 3. 设置 Awareness
    const awareness = setupAwareness(this.options.awareness, this.provider.awareness)
    this.awareness = awareness || this.provider.awareness

    // 4. 绑定 Quill 编辑器
    if (this.provider) {
      const ytext = this.ydoc.getText('quill')
      new QuillBinding(
        ytext,
        this.quill,
        this.awareness,
      )
      console.log('在线用户列表', this.awareness.getStates())
    }
    else {
      console.error('未能初始化协同编辑器：没有配置有效的提供者')
    }
  }

  public getAwareness(): Awareness {
    return this.awareness
  }
}
