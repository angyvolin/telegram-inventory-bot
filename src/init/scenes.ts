import * as api from 'telegraf';
import Logger from './logger';

// Scenes
import gsend from '../scenes/gsend/gsend';
import addAdmins from '../scenes/addAdmins/addAdmins';
import addPerson1 from '../scenes/addPerson/addPerson1';
import addPerson2 from '../scenes/addPerson/addPerson2';
import addPerson3 from '../scenes/addPerson/addPerson3';
import requestGetting from '../scenes/worker/requestGetting';
import requestGettingInstrument from '../scenes/worker/requestGettingInstrument';
import requestGettingFurniture from '../scenes/worker/requestGettingFurniture';
import requestGettingConsumable from '../scenes/worker/requestGettingConsumable';
import requestRemoveInstrument from '../scenes/worker/requestRemoveInstrument';
import requestReturn from '../scenes/worker/requestReturn';
import requestReturnInstrument from '../scenes/worker/requestReturnInstrument';
import requestReturnFurniture from '../scenes/worker/requestReturnFurniture';

const Stage = require('telegraf/stage');

export default class Scenes {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			const stage = new Stage(); // создаём менеджер сцен

			stage.register(gsend); // Сцена рассылки
			stage.register(addAdmins); // Сцена добавления админа
			stage.register(addPerson1); // Сцена добавления сотрудника
			stage.register(addPerson2); // Сцена добавления сотрудника
			stage.register(addPerson3); // Сцена добавления сотрудника
			stage.register(requestGetting); // Сцена запроса на получение
			stage.register(requestGettingInstrument); // Сцена запроса на получение инструментов
			stage.register(requestGettingFurniture); // Сцена запроса на получение фурнитуры
			stage.register(requestGettingConsumable); // Сцена запроса на получение расходников
			stage.register(requestRemoveInstrument); // Сцена запроса на списание инструментов
			stage.register(requestReturn); // Сцена запроса на возврат
			stage.register(requestReturnInstrument); // Сцена запроса на возврат инструментов
			stage.register(requestReturnFurniture); // Сцена запроса на возврат фурнитуры

			bot.use(stage.middleware());

			Logger.trace('>>> Сцены зарегистрированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при регистрации сцен!');
			process.exit(1); // выход из приложения
		}
	}
}
