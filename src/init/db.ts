import mongoose from 'mongoose';
import config from '../config';
import Logger from './logger.js';

export default class DB {
	private static url: string;

	public static async connect() {
		// Проверка окружения и смена url базы данных
		this.url = config.dbUrl;

		// Подключение к базе данных
		mongoose.connect(
			this.url,
			{ useNewUrlParser: true, keepAlive: true, useCreateIndex: true },
			(err: any) => {
				if (err) {
					Logger.fatal(
						`XXX Возникла ошибка при подключении к MongoDB! Текст ошибки: \n${err.message}`
					);
					process.exit(1); // Выход из приложения
				} else {
					Logger.trace('>>> База данных подключена');
				}
			}
		);
	}
}
