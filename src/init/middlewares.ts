import * as api from 'telegraf';
import config from '../config';
import addUsers from '../middlewares/addUsers';
import chatLogging from '../middlewares/chatLogging';
import Logger from './logger';

const { TelegrafMongoSession } = require('telegraf-session-mongodb');

export default class Middlewares {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			bot.use(addUsers); // прослойка добавления пользователя в базу
			bot.use(chatLogging); // прослойка логирования переписки

			TelegrafMongoSession.setup(bot, config.dbUrl);

			Logger.trace('>>> Прослойки инициализированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при инициализации прослоек!');
			process.exit(1); // выход из приложения
		}
	}
}
