/* eslint-disable @typescript-eslint/no-explicit-any */
const log = require('electron-log');

log.transports.file.level = 'warn';

if (process.env.NODE_ENV !== 'production') {
  log.transports.console.level = 'silly';
} else {
  log.transports.console.level = 'silly'; // TODO: make false when doing release
}

export default class LoggerWithFilePrefix {
  filenamePath: string;

  electronLog: typeof log;

  constructor(_filenamePath: string) {
    this.filenamePath = _filenamePath;
    this.electronLog = log;
  }

  error(...args: any[]) {
    this.electronLog.error(this.filenamePath, ':', ...args);
  }

  warn(...args: any[]) {
    this.electronLog.warn(this.filenamePath, ':', ...args);
  }

  info(...args: any[]) {
    this.electronLog.info(this.filenamePath, ':', ...args);
  }

  verbose(...args: any[]) {
    this.electronLog.verbose(this.filenamePath, ':', ...args);
  }

  debug(...args: any[]) {
    this.electronLog.debug(this.filenamePath, ':', ...args);
  }

  silly(...args: any[]) {
    this.electronLog.silly(this.filenamePath, ':', ...args);
  }
}
