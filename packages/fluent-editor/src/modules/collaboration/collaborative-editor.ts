import type { HocuspocusProvider } from '@hocuspocus/provider'
import type { Awareness } from 'y-protocols/awareness'
import type FluentEditor from '../../fluent-editor'
import type { YjsOptions } from './types'
import { HocuspocusProviderWebsocket } from '@hocuspocus/provider'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { setupAwareness } from './awareness/awareness'
import { setupHocuspocusProvider, setupWebsocketProvider } from './provider'

export class CollaborativeEditor {
  private ydoc: Y.Doc = new Y.Doc()
  private provider: WebsocketProvider | HocuspocusProvider
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
          this.provider = setupWebsocketProvider(providerConfig.options, this.ydoc)
        }
        else if (providerConfig.type === 'hocuspocus') {
          this.provider = new WebsocketProvider('ws://127.0.0.1:1234', 'hocuspocus-demos-quill', this.ydoc)
        }
      }
      this.provider.on('sync', () => {
        console.log('Hocuspocus 同步完成，文档内容:', this.ydoc.getText('quill').toString())
      })
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
      console.log('Provider', this.getProvider())
    }
    else {
      console.error('未能初始化协同编辑器：没有配置有效的提供者')
    }
  }

  public getAwareness(): Awareness {
    return this.awareness
  }

  public getProvider() {
    return this.provider
  }
}
