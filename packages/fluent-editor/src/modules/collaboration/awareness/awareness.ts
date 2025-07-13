import type { Awareness } from 'y-protocols/awareness'

/**
 * Awareness 用户状态接口
 * 用于定义用户在协作编辑中的状态信息
 */

export interface AwarenessState {
  /** 用户名称 */
  name?: string
  /** 用户颜色，用于区分不同用户 */
  color?: string
}

/**
 * Awareness 事件处理接口
 * 用于监听 Awareness 状态变化
 */
export interface AwarenessEvents {
  /** 状态变化事件 */
  change?: (changes: { added: number[], updated: number[], removed: number[] }, origin: any) => void
  /** 状态更新事件 */
  update?: (changes: { added: number[], updated: number[], removed: number[] }, origin: any) => void
  /** 销毁事件 */
  destroy?: (awareness: Awareness) => void
}

/**
 * Awareness 配置选项
 */
export interface AwarenessOptions {
  /** 用户初始状态 */
  state?: AwarenessState
  /** 事件处理函数 */
  events?: AwarenessEvents
  /** 状态超时时间(毫秒)，默认30000ms */
  timeout?: number | undefined
}

/**
 * 初始化并配置 Awareness
 * @param options Awareness 配置选项
 * @param defaultAwareness 传入需要构造的 awareness
 * @returns 配置好的 Awareness 实例
 */
export function setupAwareness(options?: AwarenessOptions, defaultAwareness?: Awareness): Awareness | null {
  if (!defaultAwareness) return null

  const awareness = defaultAwareness

  if (options?.state) {
    awareness.setLocalStateField('user', options.state)
  }
  if (options?.events) {
    if (options.events.change) {
      awareness.on('change', options.events.change)
    }
    if (options.events.update) {
      awareness.on('update', options.events.update)
    }
    if (options.events.destroy) {
      awareness.on('destroy', options.events.destroy)
    }
  }

  if (options?.timeout !== undefined && typeof awareness.setLocalStateField === 'function') {
    awareness.setLocalStateField('timeout', options.timeout)
  }

  return awareness
}
