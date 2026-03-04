type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    
    // In production, output JSON; in dev, output human-readable
    if (process.env.NODE_ENV === 'production') {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(entry));
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${entry.level.toUpperCase()}] ${entry.message}`, context || '');
    }
  }
  
  debug(msg: string, ctx?: Record<string, unknown>) { 
    this.log('debug', msg, ctx); 
  }
  
  info(msg: string, ctx?: Record<string, unknown>) { 
    this.log('info', msg, ctx); 
  }
  
  warn(msg: string, ctx?: Record<string, unknown>) { 
    this.log('warn', msg, ctx); 
  }
  
  error(msg: string, ctx?: Record<string, unknown>) { 
    this.log('error', msg, ctx); 
  }
}

export const logger = new Logger();