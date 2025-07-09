import type { CollaborationOptions } from './types'

export const CollaborationConfig = {
  // 默认配置
  DEFAULT_OPTIONS: {
    enabled: false,
    roomId: '',
    userInfo: {
      id: '',
      name: 'Anonymous',
      color: '#000000',
      role: 'editor',
      permissions: ['read', 'write'],
      status: 'online',
      lastActiveAt: Date.now(),
      joinedAt: Date.now(),
    },
    websocketUrl: '',
    showCursors: true,
    showSelections: true,
    showUserList: true,
    cursorTimeout: 30000,
    offlineSupport: true,
    syncDebounce: 300,
    colorStrategy: 'hash',
    toolbarPosition: 'top',
    conflictResolution: {
      autoResolve: true,
      notificationMethod: 'toast',
      historyRetentionDays: 7,
    },
    reconnect: {
      maxRetries: 5,
      retryDelay: 1000,
      exponentialBackoff: true,
    },
  } as CollaborationOptions,

  // 事件常量
  EVENTS: {
    STATE_CHANGED: 'collaboration:state-changed',
    USER_JOINED: 'collaboration:user-joined',
    USER_LEFT: 'collaboration:user-left',
    CURSOR_MOVED: 'collaboration:cursor-moved',
    CONFLICT_DETECTED: 'collaboration:conflict-detected',
    CONNECTION_CHANGED: 'collaboration:connection-changed',
  },

  // CSS 类名
  CSS_CLASSES: {
    CONTAINER: 'ql-collaboration',
    STATUS: 'ql-collaboration-status',
    USERS: 'ql-collaboration-users',
    CURSOR: 'ql-collaboration-cursor',
    SELECTION: 'ql-collaboration-selection',
    CONFLICT: 'ql-collaboration-conflict',
  },

  // 颜色配置
  COLORS: {
    DEFAULT_PALETTE: [
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
    ],
  },
}
