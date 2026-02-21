type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

type RemoteLogEntry = {
  level: Exclude<LogLevel, 'silent'>;
  message: string;
  timestamp: string;
  correlationId?: string;
  url?: string;
  userAgent?: string;
  meta?: unknown;
};

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const SENSITIVE_KEY_PARTS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apiKey',
  'apikey',
];

const DEFAULT_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
const DEFAULT_REMOTE_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'error';
const MAX_DEPTH = 4;
const MAX_STRING_LENGTH = 500;

const REMOTE_LOGS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOGS === 'true';
const REMOTE_LOG_ENDPOINT = process.env.NEXT_PUBLIC_LOG_INGEST_URL ?? '';
const REMOTE_LOG_BATCH_SIZE = Number(process.env.NEXT_PUBLIC_REMOTE_LOG_BATCH_SIZE) || 20;
const REMOTE_LOG_FLUSH_MS = Number(process.env.NEXT_PUBLIC_REMOTE_LOG_FLUSH_MS) || 5000;
const REMOTE_LOG_MAX_QUEUE = Number(process.env.NEXT_PUBLIC_REMOTE_LOG_MAX_QUEUE) || 200;

const remoteQueue: RemoteLogEntry[] = [];
let remoteFlushTimer: ReturnType<typeof setInterval> | undefined;
let remoteFlushInProgress = false;
let remoteFlushHandlersBound = false;

function normalizeLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  if (!value) return fallback;
  const raw = value.trim().toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error' || raw === 'silent') {
    return raw;
  }
  return fallback;
}

function getLogLevel(): LogLevel {
  return normalizeLevel(process.env.NEXT_PUBLIC_LOG_LEVEL, DEFAULT_LEVEL);
}

function getRemoteLogLevel(): LogLevel {
  return normalizeLevel(process.env.NEXT_PUBLIC_REMOTE_LOG_LEVEL, DEFAULT_REMOTE_LEVEL);
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[getLogLevel()];
}

function shouldSendRemote(level: Exclude<LogLevel, 'silent'>): boolean {
  if (!REMOTE_LOGS_ENABLED || !REMOTE_LOG_ENDPOINT) return false;
  if (typeof window === 'undefined') return false;
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[getRemoteLogLevel()];
}

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => lower.includes(part.toLowerCase()));
}

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}...<truncated>`;
}

export function sanitizeForLogging(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') return truncateString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();

  if (depth >= MAX_DEPTH) {
    return '<max-depth-reached>';
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogging(item, depth + 1));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      sanitized[key] = isSensitiveKey(key) ? '***' : sanitizeForLogging(val, depth + 1);
    }
    return sanitized;
  }

  return String(value);
}

function bindRemoteFlushHandlers(): void {
  if (remoteFlushHandlersBound || typeof window === 'undefined') return;
  remoteFlushHandlersBound = true;

  window.addEventListener('beforeunload', () => {
    void flushRemoteLogs(true);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushRemoteLogs(true);
    }
  });
}

function startRemoteFlushTimer(): void {
  if (remoteFlushTimer || typeof window === 'undefined') return;
  remoteFlushTimer = setInterval(() => {
    void flushRemoteLogs(false);
  }, REMOTE_LOG_FLUSH_MS);
}

function enqueueRemoteLog(entry: RemoteLogEntry): void {
  if (!shouldSendRemote(entry.level)) return;

  if (remoteQueue.length >= REMOTE_LOG_MAX_QUEUE) {
    remoteQueue.shift();
  }
  remoteQueue.push(entry);

  bindRemoteFlushHandlers();
  startRemoteFlushTimer();
}

async function flushRemoteLogs(useBeacon: boolean): Promise<void> {
  if (remoteFlushInProgress || remoteQueue.length === 0 || !REMOTE_LOG_ENDPOINT) return;
  remoteFlushInProgress = true;

  const batch = remoteQueue.splice(0, REMOTE_LOG_BATCH_SIZE);
  const payload = JSON.stringify({ logs: batch });

  try {
    if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(REMOTE_LOG_ENDPOINT, blob);
      if (!sent) {
        remoteQueue.unshift(...batch);
      }
      return;
    }

    const response = await fetch(REMOTE_LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });

    if (!response.ok) {
      remoteQueue.unshift(...batch);
    }
  } catch {
    remoteQueue.unshift(...batch);
  } finally {
    remoteFlushInProgress = false;
  }
}

function print(level: Exclude<LogLevel, 'silent'>, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = meta === undefined ? undefined : sanitizeForLogging(meta);

  if (shouldLog(level)) {
    const payload = sanitizedMeta === undefined ? '' : ` ${JSON.stringify(sanitizedMeta)}`;
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`;

    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else if (level === 'info') {
      console.info(line);
    } else {
      console.debug(line);
    }
  }

  const metaRecord = sanitizedMeta && typeof sanitizedMeta === 'object' ? (sanitizedMeta as Record<string, unknown>) : undefined;
  enqueueRemoteLog({
    level,
    message,
    timestamp,
    correlationId:
      typeof metaRecord?.correlationId === 'string'
        ? metaRecord.correlationId
        : typeof metaRecord?.requestId === 'string'
          ? metaRecord.requestId
          : undefined,
    url: typeof window !== 'undefined' ? window.location.pathname : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    meta: sanitizedMeta,
  });
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    print('debug', message, meta);
  },
  info(message: string, meta?: unknown): void {
    print('info', message, meta);
  },
  warn(message: string, meta?: unknown): void {
    print('warn', message, meta);
  },
  error(message: string, meta?: unknown): void {
    print('error', message, meta);
  },
  flush(): Promise<void> {
    return flushRemoteLogs(false);
  },
};
