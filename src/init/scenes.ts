import * as api from 'telegraf';
import Logger from './logger';
// General scenes
import gsend from '../scenes/gsend/gsend';
import addAdmins from '../scenes/addAdmins/addAdmins';
import addPhotoGetItem from '../scenes/addPhoto/1-getItem';
import addPhotoGetPhoto from '../scenes/addPhoto/2-getPhoto';
import getAddresses from '../scenes/common/getAddresses';
import getItemCount from '../scenes/common/getItemCount';
// Worker scenes
import requestGetting from '../scenes/worker/1-requestGetting';
import requestGettingDate from '../scenes/worker/2-requestGettingDate';
import requestMoreItems from '../scenes/worker/3-requestMoreItems';
import requestReturnDate from '../scenes/worker/1-requestReturnDate';
import requestReturnList from '../scenes/worker/2-requestReturnList';
import requestReturnGetting from '../scenes/worker/3-requestReturnGetting';
import requestRemove from '../scenes/worker/1-requestRemove';
import requestMoreRemove from '../scenes/worker/2-requestMoreRemove';
import requestRemoveReason from '../scenes/worker/3-requestRemoveReason';
import requestRemoveOrder from '../scenes/worker/4-requestRemoveOrder';
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
import requestPurchaseName from '../scenes/supplier/4-requestPurchaseName';
import requestPurchaseMeasure from '../scenes/supplier/5-requestPurchaseMeasure';
import requestPurchaseAmount from '../scenes/supplier/6-requestPurchaseAmount';
import requestSupply from '../scenes/supplier/1-requestSupply';
import requestSupplyMore from '../scenes/supplier/2-requestSupplyMore';
// Stockman scenes
import getMoveItem from '../scenes/stockman/getMoveItem';
import getMoveDestination from '../scenes/stockman/getMoveDestination';
import getAbsentItems from '../scenes/common/getAbsentItems';
import requestGettingUsername from '../scenes/stockman/1-requestGettingUsername';
import requestGettingWorkerItems from '../scenes/stockman/2-requestGettingWorkerItems';
import requestGettingWorkerDate from '../scenes/stockman/3-requestGettingWorkerDate';
import requestGettingWorkerMore from '../scenes/stockman/4-requestGettingWorkerMore';
// Chief scenes
import requestGettingTable from '../scenes/chief/1-requestGettingTable';
import requestGettingWorker from '../scenes/chief/2-requestGettingWorker';
import requestGettingTerm from '../scenes/chief/3-requestGettingTerm';
import requestChiefPurchase from '../scenes/chief/1-requestChiefPurchase';
import requestChiefPurchaseMore from '../scenes/chief/2-requestChiefPurchaseMore';
import requestChiefPurchaseName from '../scenes/chief/3-requestChiefPurchaseName';
import requestChiefPurchaseMeasure from '../scenes/chief/4-requestChiefPurchaseMeasure';
import requestChiefPurchaseAmount from '../scenes/chief/5-requestChiefPurchaseAmount';
import getItemMeasure from '../scenes/addItem/4-getItemMeasure';
import getItemDesc from '../scenes/addItem/5-getItemDesc';

const Stage = require('telegraf/stage');

export default class Scenes {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
		try {
			const stage = new Stage(); // создаём менеджер сцен

			// Базовые сцены в шаблоне
			stage.register(gsend); // Сцена рассылки
			stage.register(addAdmins); // Сцена добавления админа
			stage.register(addPhotoGetItem); // Сцена добавления админа
			stage.register(addPhotoGetPhoto); // Сцена добавления админа
			stage.register(getAddresses);

			// Сцена добавления товара
			stage.register(getItemType);
			stage.register(getItemName);
			stage.register(getItemPhoto);
			stage.register(getItemMeasure);
			stage.register(getItemDesc);
			stage.register(getItemCount);

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
			stage.register(requestRemove); // Сцена запроса на списание инструментов
			stage.register(requestMoreRemove); // Сцена запроса на выбор еще инструментов при списании
			stage.register(requestRemoveReason); // Сцена запроса на причину списания
			stage.register(requestRemoveOrder); // Сцена запроса на номер заказа для списания

			// Сцены Supplier
			stage.register(requestPurchase);
			stage.register(requestPurchasePrice);
			stage.register(requestPurchaseMore);
			stage.register(requestPurchaseName);
			stage.register(requestPurchaseMeasure);
			stage.register(requestPurchaseAmount);
			stage.register(requestSupply);
			stage.register(requestSupplyMore);

			// Сцены Stockman
			stage.register(getMoveItem);
			stage.register(getMoveDestination);
			stage.register(getAbsentItems);
			stage.register(requestGettingUsername);
			stage.register(requestGettingWorkerItems);
			stage.register(requestGettingWorkerDate);
			stage.register(requestGettingWorkerMore);

			// Сцены Chief
			stage.register(requestGettingTable); // Сцена запроса выдачи позиций работнику
			stage.register(requestGettingWorker); // Сцена запроса выдачи позиций работнику
			stage.register(requestGettingTerm); // Сцена запроса срока выдачи инструментов
			stage.register(requestChiefPurchase); // Сцена запроса на закупку админу
			stage.register(requestChiefPurchaseMore); // Сцена запроса на закупку админу еще позиций
			stage.register(requestChiefPurchaseName); // Сцена запроса на закупку админу названия
			stage.register(requestChiefPurchaseMeasure); // Сцена запроса на закупку админу единицы измерения
			stage.register(requestChiefPurchaseAmount); // Сцена запроса на закупку админу количества

			bot.use(stage.middleware());

			Logger.trace('>>> Сцены зарегистрированы');
		} catch {
			Logger.trace('XXX Произошла ошибка при регистрации сцен!');
			process.exit(1); // выход из приложения
		}
	}
}
