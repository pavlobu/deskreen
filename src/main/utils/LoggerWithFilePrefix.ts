/* eslint-disable @typescript-eslint/no-explicit-any */
import log from 'electron-log';

log.transports.file.level = 'warn';

if (process.env.NODE_ENV !== 'production') {
  log.transports.console.level = 'silly';
} else {
  log.transports.console.level = 'debug'; // TODO: make false when doing release
}

// configure log file rotation and size limits to prevent memory bloat
if (log.transports.file) {
	// limit individual log file size to 10MB
	log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB in bytes
	// electron-log automatically rotates and deletes old files when maxSize is exceeded
}

// periodic cleanup of log buffers to release memory
let logCleanupInterval: NodeJS.Timeout | null = null;

function cleanupLogBuffers(): void {
	try {
		// electron-log automatically handles file rotation based on maxSize
		// this function helps trigger memory cleanup

		// force garbage collection hint if available (Node.js v12.17.0+)
		if (global.gc && typeof global.gc === "function") {
			// only run GC in production to avoid performance impact in dev
			if (process.env.NODE_ENV === "production") {
				global.gc();
			}
		}
	} catch {
		// silently fail cleanup to avoid log spam
	}
}

// start periodic cleanup every 5 minutes
export function startLogBufferCleanup(): void {
	if (logCleanupInterval) {
		return; // already started
	}

	logCleanupInterval = setInterval(() => {
		cleanupLogBuffers();
	}, 5 * 60 * 1000); // every 5 minutes
}

// stop periodic cleanup (useful for testing or shutdown)
export function stopLogBufferCleanup(): void {
  if (logCleanupInterval) {
    clearInterval(logCleanupInterval);
    logCleanupInterval = null;
  }
}

export default class LoggerWithFilePrefix {
  filenamePath: string;

  electronLog: typeof log;

  constructor(_filenamePath: string) {
    this.filenamePath = _filenamePath;
    this.electronLog = log;
  }

	error(...args: any[]): void {
		this.electronLog.error(this.filenamePath, ":", ...args);
	}

	warn(...args: any[]): void {
		this.electronLog.warn(this.filenamePath, ":", ...args);
	}

	info(...args: any[]): void {
		this.electronLog.info(this.filenamePath, ":", ...args);
	}

	verbose(...args: any[]): void {
		this.electronLog.verbose(this.filenamePath, ":", ...args);
	}

	debug(...args: any[]): void {
		this.electronLog.debug(this.filenamePath, ":", ...args);
	}

	silly(...args: any[]): void {
		this.electronLog.silly(this.filenamePath, ":", ...args);
	}
}
