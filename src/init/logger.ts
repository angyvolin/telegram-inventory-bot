import path from 'path';

export default class Logger {
	public static logger = require('simple-node-logger').createSimpleLogger(path.join(__dirname, '../../', 'logs/logfile.log'));

	public static trace(data: any): void {
		this.logger.log('trace', data);
	}

	public static debug(data: any): void {
		this.logger.log('debug', data);
	}

	public static error(data: any): void {
		this.logger.log('error', data);
	}

	public static warn(data: any): void {
		this.logger.log('warn', data);
	}

	public static fatal(data: any): void {
		this.logger.log('fatal', data);
	}

	public static notify(data: any): void {
		this.logger.info(data);
	}
}
