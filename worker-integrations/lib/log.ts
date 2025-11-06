import dayjs from 'dayjs';

export class Logger {
  private prefix: string;

  constructor(name: string) {
    this.prefix = name;
  }

  private formatTime(): string {
    return dayjs().format('HH:mm:ss');
  }

  info(message: string, ...args: unknown[]): void {
    console.log(`[${this.formatTime()}] ℹ️  ${this.prefix}: ${message}`, ...args);
  }

  success(message: string, ...args: unknown[]): void {
    console.log(`[${this.formatTime()}] ✅ ${this.prefix}: ${message}`, ...args);
  }

  error(message: string, error?: unknown): void {
    console.error(`[${this.formatTime()}] ❌ ${this.prefix}: ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`   Error: ${error.message}`);
        if (error.stack) {
          console.error(error.stack);
        }
      } else {
        console.error(`   Error:`, error);
      }
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.formatTime()}] ⚠️  ${this.prefix}: ${message}`, ...args);
  }

  section(title: string): void {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📊 ${title}`);
    console.log(`${'═'.repeat(50)}\n`);
  }

  subsection(title: string): void {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`  ${title}`);
    console.log(`${'─'.repeat(40)}`);
  }
}

export function createLogger(name: string): Logger {
  return new Logger(name);
}

