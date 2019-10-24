import * as api from 'telegraf';
import Logger from './logger';
// Scenes
import gsend from '../scenes/gsend/gsend';
import addAdmins from '../scenes/addAdmins/addAdmins';
import requestGetting from '../scenes/worker/1-requestGetting';
import requestGettingDate from '../scenes/worker/2-requestGettingDate';
import requestReturnDate from '../scenes/worker/1-requestReturnDate';
import requestReturnList from '../scenes/worker/2-requestReturnList';
import requestReturnGetting from '../scenes/worker/3-requestReturnGetting';
import requestRemoveInstrument from '../scenes/worker/requestRemoveInstrument';
import getItemType from '../scenes/addItem/1-getItemType';
import getItemName from '../scenes/addItem/2-getItemName';
import getItemPhoto from '../scenes/addItem/3-getItemPhoto';
import getPersonRole from '../scenes/addPerson/1-getPersonRole';
import getPersonName from '../scenes/addPerson/2-getPersonName';
import getPersonUsername from '../scenes/addPerson/3-getPersonUsername';
import requestPurchase from '../scenes/supplier/requestPurchase';
import requestSupply from '../scenes/supplier/requestSupply';
import requestMoreItems from '../scenes/worker/requestMoreItems';
import getMoveItem from '../scenes/stockman/getMoveItem';
import getMoveDestination from '../scenes/stockman/getMoveDestination';
import getAddresses from '../scenes/stockman/getAddresses';
import getAbsentItems from '../scenes/stockman/getAbsentItems';
import requestGettingTable from '../scenes/chief/1-requestGettingTable';
import requestGettingWorker from '../scenes/chief/2-requestGettingWorker';

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

			stage.register(getMoveItem);
			stage.register(getMoveDestination);
			stage.register(getAddresses);
			stage.register(getAbsentItems);

			// Сцены Worker
			stage.register(requestGetting); // Сцена запроса на получение
			stage.register(requestGettingDate); // Сцена запроса даты возврата инструментов
			stage.register(requestRemoveInstrument); // Сцена запроса на списание инструментов
			stage.register(requestReturnDate); // Сцена запроса на возврат, выбор даты получения
			stage.register(requestReturnList); // Сцена запроса на возврат, выбор конкретного получения
			stage.register(requestReturnGetting); // Сцена запроса на возврат, подтверждение конкретного получения
			stage.register(requestMoreItems);

			// Сцены Supplier
			stage.register(requestPurchase);
			stage.register(requestSupply);

			// Сцены Chief
			stage.register(requestGettingTable); // Сцена запроса выдачи позиций работнику
			stage.register(requestGettingWorker); // Сцена запроса выдачи позиций работнику

			bot.use(stage.middleware());

			Logger.trace('>>> Сцены зарегистрированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при регистрации сцен!');
			process.exit(1); // выход из приложения
		}
	}
}
