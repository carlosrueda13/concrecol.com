import { NextRequest } from 'next/server'

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  userId?: string
  adminId?: string
  requestId?: string
  path?: string
  method?: string
  [key: string]: any
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
      env: process.env.NODE_ENV
    })
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatLog(LogLevel.ERROR, message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog(LogLevel.WARN, message, context))
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatLog(LogLevel.INFO, message, context))
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog(LogLevel.DEBUG, message, context))
    }
  }
}

export const logger = new Logger()