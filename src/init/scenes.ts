import * as api from 'telegraf';
import Logger from './logger';
// General scenes
import gsend from '../scenes/gsend/gsend';
import addAdmins from '../scenes/addAdmins/addAdmins';
// Worker scenes
import requestGetting from '../scenes/worker/1-requestGetting';
import requestGettingDate from '../scenes/worker/2-requestGettingDate';
import requestMoreItems from '../scenes/worker/3-requestMoreItems';
import requestReturnDate from '../scenes/worker/1-requestReturnDate';
import requestReturnList from '../scenes/worker/2-requestReturnList';
import requestReturnGetting from '../scenes/worker/3-requestReturnGetting';
import requestReturnRemains from '../scenes/worker/1-requestReturnRemains';
import requestMoreRemains from '../scenes/worker/2-requestMoreRemains';
import requestRemoveInstruments from '../scenes/worker/1-requestRemoveInstruments';
import requestMoreRemove from '../scenes/worker/2-requestMoreRemove';
import requestRemoveList from '../scenes/worker/3-requestRemoveList';
import requestRemoveConfirm from '../scenes/worker/4-requestRemoveConfirm';
// Admin scenes
import getItemType from '../scenes/addItem/1-getItemType';
import getItemName from '../scenes/addItem/2-getItemName';
import getItemPhoto from '../scenes/addItem/3-getItemPhoto';
import getPersonRole from '../scenes/addPerson/1-getPersonRole';
import getPersonName from '../scenes/addPerson/2-getPersonName';
import getPersonUsername from '../scenes/addPerson/3-getPersonUsername';
// Supplier scenes
import requestPurchase from '../scenes/supplier/1-requestPurchase';
import requestPurchasePrice from '../scenes/supplier/2-requestPurchasePrice';
import requestPurchaseMore from '../scenes/supplier/3-requestPurchaseMore';
import requestSupply from '../scenes/supplier/1-requestSupply';
import requestSupplyMore from '../scenes/supplier/2-requestSupplyMore';
// Stockman scenes
import getMoveItem from '../scenes/stockman/getMoveItem';
import getMoveDestination from '../scenes/stockman/getMoveDestination';
import getAddresses from '../scenes/stockman/getAddresses';
import getAbsentItems from '../scenes/stockman/getAbsentItems';
// Chief scenes
import requestGettingTable from '../scenes/chief/1-requestGettingTable';
import requestGettingWorker from '../scenes/chief/2-requestGettingWorker';
import requestGettingTerm from '../scenes/chief/3-requestGettingTerm';

const Stage = require('telegraf/stage');

export default class Scenes {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			const stage = new Stage(); // создаём менеджер сцен

			// Базовые сцены в шаблоне
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
			stage.register(requestGettingDate); // Сцена запроса даты возврата инструментов
			stage.register(requestMoreItems); // Сцена запроса на выбор еще позиций
			stage.register(requestReturnDate); // Сцена запроса на возврат, выбор даты получения
			stage.register(requestReturnList); // Сцена запроса на возврат, выбор конкретного получения
			stage.register(requestReturnGetting); // Сцена запроса на возврат, подтверждение конкретного получения
			stage.register(requestReturnRemains); // Сцена запроса на возврат остатков (фурнитуры / расходников)
			stage.register(requestMoreRemains); // Сцена запроса на выбор больших остатков
			stage.register(requestRemoveInstruments); // Сцена запроса на списание инструментов
			stage.register(requestMoreRemove); // Сцена запроса на выбор еще инструментов при списании
			stage.register(requestRemoveList); // Сцена запроса на выдачу списов активных получений при списании инструментов
			stage.register(requestRemoveConfirm); // Сцена запроса на подтверждение списания

			// Сцены Supplier
			stage.register(requestPurchase);
			stage.register(requestPurchasePrice);
			stage.register(requestPurchaseMore);
			stage.register(requestSupply);
			stage.register(requestSupplyMore);

			// Сцены Stockman
			stage.register(getMoveItem);
			stage.register(getMoveDestination);
			stage.register(getAddresses);
			stage.register(getAbsentItems);

			// Сцены Chief
			stage.register(requestGettingTable); // Сцена запроса выдачи позиций работнику
			stage.register(requestGettingWorker); // Сцена запроса выдачи позиций работнику
			stage.register(requestGettingTerm); // Сцена запроса срока выдачи инструментов

			bot.use(stage.middleware());

			Logger.trace('>>> Сцены зарегистрированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при регистрации сцен!');
			process.exit(1); // выход из приложения
		}
	}
}
