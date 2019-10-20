import Person from './Person';
import ItemType from '../enums/ItemType';
import Confirmation from '../models/confirmation';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getItem } from '../helpers/items';

const Markup = require('telegraf/markup');

type ItemRequested = { type: ItemType; id: string; amount: number };

export default class Worker extends Person {
	// Private
	private static async getGettingMessage(username: string, items: ItemRequested[]): Promise<string> {
		let message = `Работник @${username} хочет получить следующие позиции:\n`;
		for (let item of items) {
			const { id, type, amount } = item;
			const { name } = await getItem(type, id);

			message += `🔹 ${name} -> ${amount} шт.\n`;
		}
		return message;
	}

	/*
	 * Request getting
	 */
	public static async requestGetting(ctx: any, chatId: number, username: string, items: ItemRequested[], days?: number): Promise<void> {
		if (!items.length) {
			return;
		}
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}
		const messageText = await Worker.getGettingMessage(username, items);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		console.log('Confirmation ID:', confirmationId);

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`), Markup.callbackButton('✅ Подтвердить', `approveRequest>${confirmationId}`)]).extra();

			const message = await ctx.telegram.sendMessage(id, messageText, keyboard);
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		
		const instruments: Map<string, number> = new Map();
		const furniture: Map<string, number> = new Map();
		const consumables: Map<string, number> = new Map();

		items.forEach((item) => {
			switch (item.type) {
				case ItemType.INSTRUMENT: {
					instruments.set(item.id, item.amount);
					break;
				}
				case ItemType.FURNITURE: {
					furniture.set(item.id, item.amount);
					break;
				}
				case ItemType.CONSUMABLE: {
					consumables.set(item.id, item.amount);
					break;
				}
			}
		});

		if (instruments.size > 0) { confirmation.instruments = instruments; }
		if (furniture.size > 0) { confirmation.furniture = furniture; }
		if (consumables.size > 0) { confirmation.consumables = consumables; }
		if (days) { confirmation.days = days; }

		confirmation.messages = messages;
		confirmation.text = messageText;
		await confirmation.save();
	}

	// Public
	/*
	 * Confirm
	 */

	/**
	 * @param {string} gettingInfo - JSON с информацией
	 * о получении (тип получения, длительность, объекты
	 * для получения)
	 * @desc После подтверждения создаем новый Request в БД
	 * с его requestId. В зависимости от данных в gettingInfo
	 * заполняем информацию о Request в БД
	 */
	public static confirmReceipt(gettingInfo: string): void {
		//...
	}

	/**
	 * @desc После данного подтверждения возврата инструмента
	 * в БД отмечаем Request как завершенный (инструменты были
	 * возвращены)
	 */
	public static confirmReturnInstrument(requestId: number): void {
		//...
	}

	/**
	 * @desc После данного подтверждения возврата фурнитуры
	 * есть два варианта:
	 *	1.	Можем создать коллекцию Return, в которую будем писать
	 *		возвраты (как инструментов, так и фурнитуры)
	 *	2.	Можем создать новый Request с типом "Возврат", куда
	 *		напишем информацию про возврат именно фурнитуры (т.к.
	 *		про инструменты инфа хранится в первичных Request
	 *		на получение)
	 */
	public static confirmReturnFurniture(requestId: number): void {
		//...
	}

	/*
	 * Request return
	 */

	/**
	 * @desc Запрос на возврат инструмента. Аргументом передаем
	 * requestId для того, чтобы мы могли узнать, к какому запросу
	 * на получения относятся инструменты и отметить этот запрос
	 * как завершенный (инструменты были возвращены)
	 */
	public static requestReturnInstrument(requestId: number): void {
		//...
	}

	/**
	 * @desc Запрос на возврат фурнитуры. Поскольку фурнитура
	 * не обязательна для возврата, то и requestId не передается.
	 * Передаем лишь саму фурнитуру для возврата
	 */
	public static requestReturnFurniture(furniture: Map<number, number>): void {
		//...
	}

	/*
	 * Request removing
	 */

	/**
	 * @desc Запрос на списание инструмента. Первым аргументом передаем
	 * requestId для того, чтобы мы могли узнать, к какому запросу
	 * на получения относятся инструменты (чтобы не требовать их
	 * возвращения в будущем). Вторым аргументом передаем пары с
	 * инструментами и количеством
	 */
	public static requestRemovingInstrument(requestId: number, items: Map<number, number>): void {
		//...
	}
}
