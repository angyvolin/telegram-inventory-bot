import Person from './Person';
import PersonType from '../enums/PersonType';
import ItemType from '../enums/ItemType';
import Getting from '../models/getting';
import Confirmation from '../models/confirmation';
import { ItemRequested } from './Person';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getItem } from '../helpers/items';

const Markup = require('telegraf/markup');

export default class Worker extends Person {
	// Private
	private static async getGettingMessage(username: string, items: ItemRequested[], term = null): Promise<string> {
		let message = `Работник @${username} хочет получить следующие позиции:\n`;
		for (let item of items) {
			const { id, type, amount } = item;
			const { name } = await getItem(type, id);

			message += `🔹 ${name} -> ${amount} шт.\n`;
		}
		if (term) message += `*Срок аренды:* ${term} дней`;
		return message;
	}

	// Public
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

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Подтвердить', `approveRequestGetting>${confirmationId}`)], [Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]).extra();

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

		if (instruments.size > 0) {
			confirmation.instruments = instruments;
		}
		if (furniture.size > 0) {
			confirmation.furniture = furniture;
		}
		if (consumables.size > 0) {
			confirmation.consumables = consumables;
		}
		if (days) {
			confirmation.days = days;
		}

		confirmation.messages = messages;
		confirmation.text = messageText;
		confirmation.chatId = chatId;
		await confirmation.save();
	}

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
	public static async confirmGetting(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}
		confirmation.remove();

		let insertDoc: any = {
			chatId: confirmation.chatId
		};

		if (confirmation.instruments) insertDoc.instruments = confirmation.instruments;
		if (confirmation.furniture) insertDoc.furniture = confirmation.furniture;
		if (confirmation.consumables) insertDoc.consumables = confirmation.consumables;
		if (confirmation.days) insertDoc.expires = new Date(Date.now() + confirmation.days * 24 * 60 * 60 * 1000);

		const getting = new Getting(insertDoc);
		await getting.save();

		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}

	/**
	 * @desc После данного подтверждения возврата инструмента
	 * в БД отмечаем Request как завершенный (инструменты были
	 * возвращены)
	 */
	public static confirmReturn(requestId: number): void {
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
