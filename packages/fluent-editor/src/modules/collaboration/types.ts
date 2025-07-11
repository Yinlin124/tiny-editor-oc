export interface CollaborationOptions {
  websocketUrl: string
  roomId: string
}

export type CollaborationState = 'initializing' | 'connecting' | 'connected' | 'syncing' | 'synced' | 'offline' | 'error'