import * as api from 'telegraf';
import CallbackQuery from '../handlers/callbackQuery';
import Start from '../handlers/start';
import Logger from './logger';
import AdminHandlers from '../handlers/admin';
import WorkerHandlers from '../handlers/worker';
import StockmanHandlers from '../handlers/stockman';
import SupplierHandlers from '../handlers/supplier';
import ChiefHandlers from '../handlers/chief';

export default class Handlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			Start.init(bot); // Обработчик для /start
			CallbackQuery.init(bot); // Обработчик для callback запросов
			AdminHandlers.init(bot); // Обработчик для админа
			WorkerHandlers.init(bot); // Обработчик для рабочего
			StockmanHandlers.init(bot); // Обработчик для кладовщика
			SupplierHandlers.init(bot); // Обработчик для снабженца
			ChiefHandlers.init(bot); // Обработчик для начальника цеха

			Logger.trace('>>> Обработчики инициализированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при инициализации обработчиков!');
			process.exit(1); // выход из приложения
		}
	}
}
