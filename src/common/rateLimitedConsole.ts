// rate-limited console wrapper to prevent log spam and memory bloat
// this helps prevent excessive console.log calls from accumulating in memory

interface LogEntry {
	timestamp: number;
	message: string;
	count: number;
}

const logCache = new Map<string, LogEntry>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_LOGS_PER_WINDOW = 10; // max 10 identical logs per 5 seconds
const CACHE_CLEANUP_INTERVAL = 30000; // clean cache every 30 seconds

// preserve original console methods before overriding (must be first)
const originalConsole = {
	log: console.log.bind(console),
	error: console.error.bind(console),
	warn: console.warn.bind(console),
	info: console.info.bind(console),
	debug: console.debug.bind(console),
};

function getLogKey(...args: any[]): string {
	// create a key from the log message (first 100 chars to avoid huge keys)
	const message = args.map((arg) => {
		if (typeof arg === 'string') {
			return arg.substring(0, 100);
		}
		if (typeof arg === 'object') {
			try {
				return JSON.stringify(arg).substring(0, 100);
			} catch {
				return String(arg).substring(0, 100);
			}
		}
		return String(arg).substring(0, 100);
	}).join(' ');
	return message;
}

function shouldLog(key: string): boolean {
	const now = Date.now();
	const entry = logCache.get(key);

	if (!entry) {
		logCache.set(key, { timestamp: now, message: key, count: 1 });
		return true;
	}

	// if entry is older than window, reset it
	if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
		entry.timestamp = now;
		entry.count = 1;
		return true;
	}

	// increment count
	entry.count += 1;

	// if under limit, allow log
	if (entry.count <= MAX_LOGS_PER_WINDOW) {
		return true;
	}

	// if exactly at limit, log a warning about rate limiting
	if (entry.count === MAX_LOGS_PER_WINDOW + 1) {
		originalConsole.warn(
			`[Rate Limited] Log message suppressed (exceeded ${MAX_LOGS_PER_WINDOW} logs in ${RATE_LIMIT_WINDOW}ms):`,
			key.substring(0, 200),
		);
	}

	// suppress the log
	return false;
}

function cleanupCache(): void {
	const now = Date.now();
	for (const [key, entry] of logCache.entries()) {
		// remove entries older than 1 minute
		if (now - entry.timestamp > 60000) {
			logCache.delete(key);
		}
	}
}

// rate-limited console methods
const rateLimitedConsole = {
	log: (...args: any[]) => {
		const key = getLogKey(...args);
		if (shouldLog(key)) {
			// use original console.log to avoid recursion
			originalConsole.log(...args);
		}
	},
	error: (...args: any[]) => {
		// errors are never rate-limited
		originalConsole.error(...args);
	},
	warn: (...args: any[]) => {
		// warnings are never rate-limited
		originalConsole.warn(...args);
	},
	info: (...args: any[]) => {
		const key = getLogKey(...args);
		if (shouldLog(key)) {
			originalConsole.info(...args);
		}
	},
	debug: (...args: any[]) => {
		const key = getLogKey(...args);
		if (shouldLog(key)) {
			originalConsole.debug(...args);
		}
	},
};

// start periodic cache cleanup
let cleanupInterval: NodeJS.Timeout | null = null;

export function startConsoleRateLimiting(): void {
	if (cleanupInterval) {
		return; // already started
	}

	cleanupInterval = setInterval(() => {
		cleanupCache();
	}, CACHE_CLEANUP_INTERVAL);
}

export function stopConsoleRateLimiting(): void {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
	}
	logCache.clear();
}

// override global console to use rate-limited versions
export function overrideGlobalConsole(): void {
	// override console methods with rate-limited versions
	console.log = rateLimitedConsole.log;
	console.info = rateLimitedConsole.info;
	console.debug = rateLimitedConsole.debug;

	// keep errors and warnings always available (never rate-limited)
	// but use original to ensure they're always shown
	console.error = originalConsole.error;
	console.warn = originalConsole.warn;
}

