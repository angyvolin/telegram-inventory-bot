import * as api from 'telegraf';
import Logger from './logger';

// Scenes
import gsend from '../scenes/gsend';
import addAdmin1 from '../scenes/addAdmin/addAdmin1';
import addAdmin2 from '../scenes/addAdmin/addAdmin2';
import addPerson1 from '../scenes/addPerson/addPerson1';
import addPerson2 from '../scenes/addPerson/addPerson2';
import addPerson3 from '../scenes/addPerson/addPerson3';

const Stage = require('telegraf/stage');

export default class Scenes {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			const stage = new Stage(); // создаём менеджер сцен

			stage.register(gsend); // регистрируем сцену рассылки
			stage.register(addAdmin1); // регистрируем сцену добавления админа
			stage.register(addAdmin2); // регистрируем сцену добавления админа
			stage.register(addPerson1); // регистрируем сцену добавления сотрудника
			stage.register(addPerson2); // регистрируем сцену добавления сотрудника
			stage.register(addPerson3); // регистрируем сцену добавления сотрудника

			bot.use(stage.middleware());

			Logger.trace('>>> Сцены зарегистрированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при регистрации сцен!');
			process.exit(1); // выход из приложения
		}
	}
}
