import { CollaborativeEditor } from './collaborative-editor'

// 导出主要类和接口
export { CollaborativeEditor }
// export * from './api'
// export * from './awareness'

// export * from './communication'
// export * from './config'
// // 导出子模块
// export * from './core'
// export * from './events'
// export * from './persistence'
// export * from './types'
// export * from './ui'
// export * from './utils'

// 模块配置
export const collaborationModule = {
  name: 'collaboration',
  component: CollaborativeEditor,
  // defaultOptions: CollaborationConfig.DEFAULT_OPTIONS,
}

export default CollaborativeEditor
