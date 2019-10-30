import * as api from 'telegraf';
import CallbackQueryHandlers from '../handlers/callbackQuery';
import StartHandlers from '../handlers/start';
import Logger from './logger';
import CommonHandlers from '../handlers/common';
import AdminHandlers from '../handlers/admin';
import WorkerHandlers from '../handlers/worker';
import StockmanHandlers from '../handlers/stockman';
import SupplierHandlers from '../handlers/supplier';
import ChiefHandlers from '../handlers/chief';
import InlineQueryHandlers from '../handlers/inlineQuery';

export default class Handlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			StartHandlers.init(bot); // Обработчик для /start
			CallbackQueryHandlers.init(bot); // Обработчик для callback запросов
			InlineQueryHandlers.init(bot);
			CommonHandlers.init(bot); // Обработчик для общих запросов (для нескольких ролей)
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
