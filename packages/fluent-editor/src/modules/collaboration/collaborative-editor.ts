import type { HocuspocusProvider } from '@hocuspocus/provider'
import type { Awareness } from 'y-protocols/awareness'
import type { WebrtcProvider } from 'y-webrtc'
import type { WebsocketProvider } from 'y-websocket'
import type FluentEditor from '../../fluent-editor'
import type { WebRTCProviderOptions, WebsocketProviderOptions } from './provider'
import type { YjsOptions } from './types'
import { HocuspocusProviderWebsocket } from '@hocuspocus/provider'
import { QuillBinding } from 'y-quill'
import * as Y from 'yjs'
import { setupAwareness } from './awareness/awareness'
import { setupIndexedDB } from './awareness/y-indexeddb'
import { setupHocuspocusProvider, setupWebRTCProvider, setupWebsocketProvider } from './provider'

export class CollaborativeEditor {
  private ydoc: Y.Doc = new Y.Doc()
  private provider: WebsocketProvider | HocuspocusProvider | WebrtcProvider
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
          this.provider = setupWebsocketProvider(providerConfig.options as WebsocketProviderOptions, this.ydoc)
        }
        // else if (providerConfig.type === 'hocuspocus') {
        //   this.provider = new WebsocketProvider('ws://127.0.0.1:1234', 'hocuspocus-demos-quill', this.ydoc)
        // }
        else if (providerConfig.type === 'webrtc') {
          this.provider = setupWebRTCProvider(providerConfig.options as WebRTCProviderOptions, this.ydoc)
        }
      }
      this.provider.on('sync', () => {
        console.log('同步完成，文档内容:', this.ydoc.getText('tiny-editor').toJSON())
      })
    }

    // 3. 设置 Awareness
    const awareness = setupAwareness(this.options.awareness, this.provider.awareness)
    this.awareness = awareness || this.provider.awareness

    // 4. 绑定 Quill 编辑器
    if (this.provider) {
      const ytext = this.ydoc.getText('tiny-editor')
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
    // offline
    if (this.options.offline) {
      setupIndexedDB(this.ydoc, typeof this.options.offline === 'object' ? this.options.offline : undefined)
    }
  }

  public getAwareness(): Awareness {
    return this.awareness
  }

  public getProvider() {
    return this.provider
  }
}
