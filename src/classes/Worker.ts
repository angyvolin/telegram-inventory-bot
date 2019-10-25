import Person, { ItemRequested } from './Person';
import Stockman from './Stockman';
import ItemType from '../enums/ItemType';
import Getting from '../models/getting';
import Confirmation from '../models/confirmation';
import { ItemCells } from './Person';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getInstrumentsMessage, getItem, reduceItem } from '../helpers/items';
import { getCell, reduceFromCell } from '../helpers/cells';

const Markup = require('telegraf/markup');

export default class Worker extends Person {
	// Private
	private static async getGettingMessage(username: string, items: ItemRequested[], term = null): Promise<string> {
		let message = `*Работник* @${username} хочет получить следующие позиции:\n`;
		for (let item of items) {
			const { id, type, amount } = item;
			const { name } = await getItem(type, id);

			message += `🔹 ${name} -> ${amount} шт.\n`;
		}
		if (term) message += `*Срок аренды:* ${term} дней`;
		return message;
	}

	private static async getGivingMessage(username: string, items: ItemCells[]): Promise<string> {
		let message = `Выдайте *работнику* @${username} запрошенные позиции в соответствии со списком:\n`;
		message += await Stockman.getCellsMessage(items);
		return message;
	}

	// Public
	/*
	 * Request getting
	 */
	public static async requestGetting(ctx: any, items: ItemRequested[], days?: number): Promise<void> {
		if (!items.length) {
			return;
		}
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}
		const messageText = await Worker.getGettingMessage(ctx.from.username, items);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Выдал позиции', `approveGiving>${confirmationId}`)], [Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

			const message = await ctx.telegram.sendMessage(id, messageText, {
				reply_markup: keyboard,
				parse_mode: 'Markdown'
			});
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
		confirmation.chatId = ctx.from.id;
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

		await confirmation.remove();

		let insertDoc: any = {
			chatId: confirmation.chatId
		};

		if (confirmation.instruments) {
			insertDoc.active = true;
			insertDoc.instruments = confirmation.instruments;
			for (const [id, amount] of confirmation.instruments) {
				await reduceItem(ItemType.INSTRUMENT, id, amount);
				const cell = await getCell(ItemType.INSTRUMENT, id);
				if (cell) {
					await reduceFromCell(cell._id, ItemType.INSTRUMENT, id, amount);
				}
			}
		}
		if (confirmation.furniture) {
			insertDoc.furniture = confirmation.furniture;
			for (const [id, amount] of confirmation.furniture) {
				await reduceItem(ItemType.FURNITURE, id, amount);
				const cell = await getCell(ItemType.FURNITURE, id);
				if (cell) {
					await reduceFromCell(cell._id, ItemType.FURNITURE, id, amount);
				}
			}
		}
		if (confirmation.consumables) {
			insertDoc.consumables = confirmation.consumables;
			for (const [id, amount] of confirmation.consumables) {
				await reduceItem(ItemType.CONSUMABLE, id, amount);
				const cell = await getCell(ItemType.CONSUMABLE, id);
				if (cell) {
					await reduceFromCell(cell._id, ItemType.CONSUMABLE, id, amount);
				}
			}
		}
		if (confirmation.days) insertDoc.expires = new Date(Date.now() + confirmation.days * 24 * 60 * 60 * 1000);

		const getting = new Getting(insertDoc);
		await getting.save();

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n✅ Работник подтвердил получение';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}

	public static async requestReturn(ctx: any, gettingId: string): Promise<void> {
		const getting = await Getting.findById(gettingId);
		const stockmans = await getStockmans();
		if (!getting || !stockmans.length) {
			return;
		}

		const instruments = getting.instruments;

		const returnText = await getInstrumentsMessage(instruments);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Подтвердить', `approveReturn>${confirmationId}>${gettingId}`)], [Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

			const messageText = `*Работник* ${ctx.from.username} желает вернуть инструменты на склад:\n` + returnText + `\n❗️После возврата подтвердите нажатием кнопки ниже\n`;
			const message = await ctx.telegram.sendMessage(id, messageText, {
				reply_markup: keyboard,
				parse_mode: 'Markdown'
			});
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		confirmation.messages = messages;
		confirmation.text = returnText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
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
