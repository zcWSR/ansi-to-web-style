import { consoleLogAnsiParams } from './index.mjs'

// 检查全局对象
const globalObj = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : {})

// 保存原始的 console 对象
const originalConsole = globalObj.console || {}

// 创建支持 ANSI 的 console 方法
const createAnsiConsoleMethod = (methodName, fallbackMethod = 'log') => {
  const originalMethod = originalConsole[methodName] || originalConsole[fallbackMethod] || (() => {})
  
  return function(...args) {
    if (args.length === 0) {
      return originalMethod.call(this)
    }
    
    const formattedParams = consoleLogAnsiParams(...args)
    return originalMethod.call(this, ...formattedParams)
  }
}

// 创建增强的 console 对象
const enhancedConsole = {
  // 基础日志方法（支持 ANSI）
  log: createAnsiConsoleMethod('log'),
  info: createAnsiConsoleMethod('info', 'log'),
  warn: createAnsiConsoleMethod('warn', 'log'),
  error: createAnsiConsoleMethod('error', 'log'),
  debug: createAnsiConsoleMethod('debug', 'log'),
  trace: createAnsiConsoleMethod('trace', 'log'),
}

Object.assign(globalObj.console, enhancedConsole)