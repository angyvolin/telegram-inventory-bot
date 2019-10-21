import * as api from 'telegraf';
import Logger from './logger';
// Scenes
import gsend from '../scenes/gsend/gsend';
import addAdmins from '../scenes/addAdmins/addAdmins';
import requestGetting from '../scenes/worker/requestGetting';
import requestRemoveInstrument from '../scenes/worker/requestRemoveInstrument';
import requestReturn from '../scenes/worker/requestReturn';
import requestReturnInstrument from '../scenes/worker/requestReturnInstrument';
import requestReturnFurniture from '../scenes/worker/requestReturnFurniture';
import getItemType from '../scenes/addItem/1-getItemType';
import getItemName from '../scenes/addItem/2-getItemName';
import getItemPhoto from '../scenes/addItem/3-getItemPhoto';
import getPersonRole from '../scenes/addPerson/1-getPersonRole';
import getPersonName from '../scenes/addPerson/2-getPersonName';
import getPersonUsername from '../scenes/addPerson/3-getPersonUsername';
import requestReturnDate from '../scenes/worker/requestReturnDate';
import requestPurchase from '../scenes/supplier/requestPurchase';
import requestSupply from '../scenes/supplier/requestSupply';
import requestMoreItems from '../scenes/worker/requestMoreItems';

const Stage = require('telegraf/stage');

export default class Scenes {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			const stage = new Stage(); // создаём менеджер сцен

			stage.register(gsend); // Сцена рассылки
			stage.register(addAdmins); // Сцена добавления админа

			// Сцена добавления товара
			stage.register(getItemType);
			stage.register(getItemName);
			stage.register(getItemPhoto);

			// Сцена добавления сотрудника
			stage.register(getPersonRole);
			stage.register(getPersonName);
			stage.register(getPersonUsername);

			// Сцены Worker
			stage.register(requestGetting); // Сцена запроса на получение
			stage.register(requestRemoveInstrument); // Сцена запроса на списание инструментов
			stage.register(requestReturn); // Сцена запроса на возврат
			stage.register(requestReturnInstrument); // Сцена запроса на возврат инструментов
			stage.register(requestReturnFurniture); // Сцена запроса на возврат фурнитуры
			stage.register(requestReturnDate);
			stage.register(requestMoreItems);

			// Сцены Supplier
			stage.register(requestPurchase);
			stage.register(requestSupply);

			bot.use(stage.middleware());

			Logger.trace('>>> Сцены зарегистрированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при регистрации сцен!');
			process.exit(1); // выход из приложения
		}
	}
}
