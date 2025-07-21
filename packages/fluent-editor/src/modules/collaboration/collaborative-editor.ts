import type { HocuspocusProvider } from '@hocuspocus/provider'
import type { Awareness } from 'y-protocols/awareness'
import type { WebrtcProvider } from 'y-webrtc'
import type { WebsocketProvider } from 'y-websocket'
import type FluentEditor from '../../fluent-editor'
import type { WebRTCProviderOptions, WebsocketProviderOptions } from './provider'
import type { ProviderConstructor, YjsOptions } from './types'
import { HocuspocusProviderWebsocket } from '@hocuspocus/provider'
import { QuillBinding } from 'y-quill'
import * as Y from 'yjs'
import { setupAwareness } from './awareness/awareness'
import { setupIndexedDB } from './awareness/y-indexeddb'
import { createProvider } from './provider/customProvider'

export class CollaborativeEditor {
  private ydoc: Y.Doc = new Y.Doc()
  private provider: any
  private awareness: Awareness
  private _isConnected = false
  private _isSynced = false

  constructor(
    public quill: FluentEditor,
    private options: YjsOptions,
  ) {
    // 1. 初始化 Y.Doc
    this.ydoc = this.options.ydoc || new Y.Doc()

    // 2. 建立提供者连接
    if (this.options.provider) {
      const providerConfig = this.options.provider
      try {
        // Create provider with shared handlers, Y.Doc, and Awareness
        const provider = createProvider({
          doc: this.ydoc,
          options: 'options' in providerConfig ? providerConfig.options : {},
          type: providerConfig.type,
          onConnect: () => {
            this._isConnected = true
            providerConfig.onConnect?.()
          },
          onDisconnect: () => {
            this._isConnected = false
            providerConfig.onDisconnect?.()
          },
          onError: (error) => {
            providerConfig.onError?.(error)
          },
          onSyncChange: (isSynced) => {
            this._isSynced = isSynced
            providerConfig.onSyncChange?.(isSynced)
          },
        })
        this.provider = provider
        console.log('this provider', this.provider)
        // 3. 设置 Awareness - 在 provider 创建后
        const awareness = setupAwareness(this.options.awareness, this.provider.awareness)
        this.awareness = awareness || this.provider.awareness
      }
      catch (error) {
        console.warn(
          `[yjs] Error creating provider of type ${item.type}:`,
          error,
        )
      }
    }

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
