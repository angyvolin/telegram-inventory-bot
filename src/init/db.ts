import mongoose from 'mongoose';
import config from '../config';
import Logger from './logger.js';
import Cell from '../models/cell';

export default class DB {
	private static url: string;

	public static async connect() {
		// Проверка окружения и смена url базы данных
		this.url = config.dbUrl;

		mongoose.set('useNewUrlParser', true);
		mongoose.set('useFindAndModify', false);
		mongoose.set('useCreateIndex', true);
		mongoose.set('useUnifiedTopology', true);

		// Подключение к базе данных
		mongoose.connect(this.url, async (err: any) => {
			if (err) {
				Logger.fatal(`XXX Возникла ошибка при подключении к MongoDB! Текст ошибки: \n${err.message}`);
				process.exit(1); // Выход из приложения
			} else {
				Logger.trace('>>> База данных подключена');
				const alphabet = 'АБВГДЕЖЗИ';

				// Создаём сетку ячеек
				for (let row of alphabet) {
					for (let col = 1; col <= 4; col++) {
						await Cell.findOneAndUpdate({ row, col }, { row, col }, { upsert: true });
					}
				}
			}
		});
	}
}
