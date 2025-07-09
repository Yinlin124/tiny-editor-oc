import type FluentEditor from '../../fluent-editor'
import type { CollaborationOptions, CollaborationState } from './types'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { IndexeddbPersistence } from 'y-indexeddb'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

// 注册 cursors 模块
Quill.register('modules/cursors', QuillCursors)

export class CollaborativeEditor {
  // 核心组件
  private ydoc: Y.Doc
  private provider: WebsocketProvider | null = null
  private binding: QuillBinding | null = null
  private persistence: IndexeddbPersistence | null = null
  private cursorsModule: any = null

  // UI 容器
  private onlineUsersContainer: HTMLDivElement | null = null

  // 状态管理
  private state: CollaborationState = 'initializing'
  private isDestroyed = false
  private onlineUsers: Array<{ name: string, color: string, clientId?: number }> = []

  constructor(
    public quill: FluentEditor,
    private options: CollaborationOptions,
  ) {
    this.init()
  }

  private async init() {
    try {
      // 1. 初始化 Y.Doc
      this.ydoc = new Y.Doc()

      // 2. 创建 UI 容器
      this.createUI()

      // 3. 建立 WebSocket 连接
      await this.setupWebSocketProvider()

      // 4. 设置 IndexedDB 持久化
      this.setupPersistence()

      // 5. 绑定 Quill 编辑器
      this.setupQuillBinding()

      // 6. 设置用户感知和光标
      this.setupAwareness()

      // 7. 设置事件监听
      this.setupEventListeners()

      this.setState('connected')
    }
    catch (error) {
      this.setState('error')
      console.error('协同编辑初始化失败:', error)
      throw error
    }
  }

  private createUI() {
    // 创建在线用户列表容器
    this.onlineUsersContainer = document.createElement('div')
    this.onlineUsersContainer.className = 'ql-collaboration-users'
    this.onlineUsersContainer.innerHTML = `
      <div class="user-title">在线用户</div>
      <div class="users-list"></div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .ql-collaboration-users {
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 200px;
        padding: 16px;
        border-radius: 8px;
        background: #f5f5f5;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
      }

      .ql-collaboration-users .user-title {
        font-weight: bold;
        margin-bottom: 12px;
        font-size: 14px;
        color: #333;
      }

      .ql-collaboration-users .user-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 4px 0;
      }

      .ql-collaboration-users .user-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
        flex-shrink: 0;
      }

      .ql-collaboration-users .user-name {
        font-size: 14px;
        color: #666;
      }

      .ql-collaboration-users .user-status {
        font-size: 12px;
        color: #999;
        margin-left: auto;
      }

      /* 光标样式 */
      .ql-cursor {
        position: absolute;
        border-left: 2px solid;
        pointer-events: none;
        z-index: 100;
      }

      .ql-cursor-flag {
        position: absolute;
        top: -16px;
        left: -1px;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
        color: white;
        white-space: nowrap;
        pointer-events: none;
      }

      .ql-cursor-selection {
        position: absolute;
        pointer-events: none;
        opacity: 0.3;
      }
    `
    document.head.appendChild(style)

    // 添加到页面
    document.body.appendChild(this.onlineUsersContainer)
  }

  private async setupWebSocketProvider() {
    if (!this.options.websocketUrl || !this.options.roomId) {
      throw new Error('WebSocket URL 和 Room ID 是必需的')
    }

    this.provider = new WebsocketProvider(
      this.options.websocketUrl,
      this.options.roomId,
      this.ydoc,
    )

    // 监听连接状态
    this.provider.on('status', (event: any) => {
      console.log('WebSocket 状态:', event.status)
      if (event.status === 'connected') {
        this.setState('connected')
      }
      else if (event.status === 'disconnected') {
        this.setState('offline')
      }
    })

    this.provider.on('connection-error', (error: any) => {
      console.error('WebSocket 连接错误:', error)
      this.setState('error')
    })
  }

  private setupPersistence() {
    if (!this.options.offlineSupport) return

    this.persistence = new IndexeddbPersistence(
      this.options.roomId,
      this.ydoc,
    )

    this.persistence.once('synced', () => {
      console.log('IndexedDB 同步完成')
    })
  }

  private setupQuillBinding() {
    const ytext = this.ydoc.getText('quill')

    // 确保 Quill 支持 cursors 模块
    if (!this.quill.getModule('cursors')) {
      // 如果没有 cursors 模块，手动添加
      const cursorsModule = new QuillCursors(this.quill, {})
      this.quill.addModule('cursors', cursorsModule)
    }

    this.cursorsModule = this.quill.getModule('cursors')

    // 绑定 Y.js 和 Quill
    this.binding = new QuillBinding(
      ytext,
      this.quill,
      this.provider?.awareness,
    )
  }

  private setupAwareness() {
    if (!this.provider?.awareness) return

    const awareness = this.provider.awareness

    // 设置本地用户信息
    const userInfo = this.options.userInfo
    const userColor = userInfo.color || this.generateUserColor(userInfo.id)

    awareness.setLocalStateField('user', {
      name: userInfo.name || 'Anonymous',
      color: userColor,
      id: userInfo.id,
      cursor: null,
      selection: null,
    })

    // 监听 awareness 变化
    awareness.on('change', (changes: any) => {
      this.handleAwarenessChange(changes)
    })

    // 监听光标位置变化
    this.quill.on('selection-change', (range: any) => {
      if (range) {
        awareness.setLocalStateField('cursor', {
          index: range.index,
          length: range.length,
          timestamp: Date.now(),
        })
      }
    })
  }

  private handleAwarenessChange(changes: any) {
    const awareness = this.provider?.awareness
    if (!awareness) return

    // 更新在线用户列表
    const states = Array.from(awareness.getStates().values())
    this.onlineUsers = states
      .filter((state: any) => state.user)
      .map((state: any) => ({
        name: state.user.name,
        color: state.user.color,
        clientId: state.user.id,
      }))

    this.updateUsersUI()

    // 更新其他用户的光标
    this.updateCursors()
  }

  private updateUsersUI() {
    if (!this.onlineUsersContainer) return

    const usersList = this.onlineUsersContainer.querySelector('.users-list')
    if (!usersList) return

    usersList.innerHTML = this.onlineUsers
      .map(user => `
        <div class="user-item">
          <span class="user-dot" style="background-color: ${user.color}"></span>
          <span class="user-name">${user.name}</span>
          <span class="user-status">在线</span>
        </div>
      `)
      .join('')
  }

  private updateCursors() {
    if (!this.cursorsModule || !this.provider?.awareness) return

    const awareness = this.provider.awareness
    const states = awareness.getStates()
    const localClientId = awareness.clientID

    // 清除所有光标
    this.cursorsModule.clearCursors()

    // 添加其他用户的光标
    states.forEach((state: any, clientId: number) => {
      if (clientId === localClientId || !state.user || !state.cursor) return

      try {
        this.cursorsModule.createCursor(
          clientId.toString(),
          state.user.name,
          state.user.color,
        )

        this.cursorsModule.moveCursor(
          clientId.toString(),
          {
            index: state.cursor.index,
            length: state.cursor.length || 0,
          },
        )
      }
      catch (error) {
        console.warn('更新光标失败:', error)
      }
    })
  }

  private generateUserColor(userId: string): string {
    // 基于用户 ID 生成一致的颜色
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }

    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FECA57',
      '#FF9FF3',
      '#54A0FF',
      '#5F27CD',
      '#00D2D3',
      '#FF9F43',
      '#FF6348',
      '#2ED573',
      '#3742FA',
      '#F0932B',
      '#EB4D4B',
      '#6C5CE7',
      '#A3CB38',
      '#FFA502',
      '#FF3838',
      '#1289A7',
    ]

    return colors[Math.abs(hash) % colors.length]
  }

  private setupEventListeners() {
    // 监听文档变化
    this.quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
      if (source !== 'user') return

      // 可以在这里添加自定义逻辑
      console.log('文档内容变化:', delta)
    })

    // 监听页面卸载
    window.addEventListener('beforeunload', () => {
      this.destroy()
    })

    // 监听网络状态
    window.addEventListener('online', () => {
      console.log('网络已连接')
      this.setState('connected')
    })

    window.addEventListener('offline', () => {
      console.log('网络已断开')
      this.setState('offline')
    })
  }

  private setState(newState: CollaborationState) {
    const oldState = this.state
    this.state = newState
    console.log(`协同状态变化: ${oldState} -> ${newState}`)

    // 可以在这里添加状态变化的处理逻辑
    this.updateStatusUI()
  }

  private updateStatusUI() {
    // 更新状态指示器
    if (this.onlineUsersContainer) {
      const title = this.onlineUsersContainer.querySelector('.user-title')
      if (title) {
        const statusText = this.getStatusText()
        title.textContent = `在线用户 (${statusText})`
      }
    }
  }

  private getStatusText(): string {
    switch (this.state) {
      case 'initializing': return '初始化中'
      case 'connecting': return '连接中'
      case 'connected': return '已连接'
      case 'syncing': return '同步中'
      case 'synced': return '已同步'
      case 'offline': return '离线'
      case 'error': return '错误'
      default: return '未知'
    }
  }

  // 公共 API
  public async startCollaboration(roomId: string) {
    this.options.roomId = roomId
    await this.init()
  }

  public async stopCollaboration() {
    this.destroy()
  }

  public getUsers() {
    return this.onlineUsers
  }

  public getConnectionState() {
    return this.state
  }

  public getUserCount(): number {
    return this.onlineUsers.length
  }

  public getCurrentUser() {
    return this.options.userInfo
  }

  public setUserInfo(userInfo: Partial<typeof this.options.userInfo>) {
    this.options.userInfo = { ...this.options.userInfo, ...userInfo }

    if (this.provider?.awareness) {
      this.provider.awareness.setLocalStateField('user', {
        ...this.provider.awareness.getLocalState()?.user,
        ...userInfo,
      })
    }
  }

  public destroy() {
    if (this.isDestroyed) return

    // 清理 WebSocket 连接
    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }

    // 清理 Y.js 绑定
    if (this.binding) {
      this.binding.destroy()
      this.binding = null
    }

    // 清理 IndexedDB 持久化
    if (this.persistence) {
      this.persistence.destroy()
      this.persistence = null
    }

    // 清理 UI
    if (this.onlineUsersContainer) {
      this.onlineUsersContainer.remove()
      this.onlineUsersContainer = null
    }

    // 清理光标
    if (this.cursorsModule) {
      this.cursorsModule.clearCursors()
      this.cursorsModule = null
    }

    this.isDestroyed = true
    console.log('协同编辑器已销毁')
  }
}
