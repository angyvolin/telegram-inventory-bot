import Person, { ItemRequested } from './Person';
import Stockman from './Stockman';
import ItemType from '../enums/ItemType';
import Getting from '../models/getting';
import Confirmation from '../models/confirmation';
import { ItemCells } from './Person';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getItem, reduceItem } from '../helpers/items';
import { getCell } from '../helpers/cells';

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

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Подтвердить', `approveRequestGetting>${confirmationId}`)], [Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

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

		const confirmationId = confirmation._id;

		const items: ItemCells[] = [];
		if (confirmation.instruments) {
			for (const [id, amount] of confirmation.instruments) {
				const instrument = await getItem(ItemType.INSTRUMENT, id);
				const currAmount = instrument.amount;
				if (amount > currAmount) {
					const text = ctx.update.callback_query.message.text + `\n\n🔴 К сожалению, Ваша заявка не может быть выполнена.\n*Причина:* недостаточно позиций на складе`;
					return ctx.editMessageText(text);
				}
				const cell = await getCell(ItemType.INSTRUMENT, id);
				const cellName = cell ? cell.row + cell.col : null;
				const name = instrument.name;
				items.push({ cellName, name });
			}
		}
		if (confirmation.furniture) {
			for (const [id, amount] of confirmation.furniture) {
				const furniture = await getItem(ItemType.FURNITURE, id);
				const currAmount = furniture.amount;
				if (amount > currAmount) {
					const text = ctx.update.callback_query.message.text + `\n\n🔴 К сожалению, Ваша заявка не может быть выполнена.\n*Причина:* недостаточно позиций на складе`;
					return ctx.editMessageText(text);
				}
				const cell = await getCell(ItemType.FURNITURE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const name = furniture.name;
				items.push({ cellName, name });
			}
		}
		if (confirmation.consumables) {
			for (const [id, amount] of confirmation.consumables) {
				const consumable = await getItem(ItemType.CONSUMABLE, id);
				const currAmount = consumable.amount;
				if (amount > currAmount) {
					const text = ctx.update.callback_query.message.text + `\n\n🔴 К сожалению, Ваша заявка не может быть выполнена.\n*Причина:* недостаточно позиций на складе`;
					return ctx.editMessageText(text);
				}
				const cell = await getCell(ItemType.CONSUMABLE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const name = consumable.name;
				items.push({ cellName, name });

			}
		}

		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}

		const messageText = await Worker.getGivingMessage(ctx.from.username, items);
		const messages = [];

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Подтвердить', `approveGiving>${confirmationId}`)], [Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

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
		await confirmation.save();

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
