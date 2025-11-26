const isDev = process.env.NODE_ENV === "development"

interface DebugLogger {
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  group: (label: string) => void
  groupEnd: () => void
  time: (label: string) => void
  timeEnd: (label: string) => void
}

export const debug: DebugLogger = {
  log: (...args) => {
    if (isDev) console.log("[TMT]", ...args)
  },
  error: (...args) => {
    // Always log errors
    console.error("[TMT Error]", ...args)
  },
  warn: (...args) => {
    if (isDev) console.warn("[TMT Warn]", ...args)
  },
  info: (...args) => {
    if (isDev) console.info("[TMT Info]", ...args)
  },
  group: (label) => {
    if (isDev) console.group(`[TMT] ${label}`)
  },
  groupEnd: () => {
    if (isDev) console.groupEnd()
  },
  time: (label) => {
    if (isDev) console.time(`[TMT] ${label}`)
  },
  timeEnd: (label) => {
    if (isDev) console.timeEnd(`[TMT] ${label}`)
  },
}

export default debug
