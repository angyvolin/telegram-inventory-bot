import Instrument from './Instrument';
import Furniture from './Furniture';
import Consumable from './Consumable';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import { isAdmin } from '../helpers/functions';

const Markup = require('telegraf/markup');

export default class Admin {
	// Public
	public static async confirmRemoveInstruments(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const gettingId = ctx.callbackQuery.data.split('>')[2];

		const confirmation = await Confirmation.findById(id);
		const getting = await Getting.findById(gettingId);

		if (!confirmation || !getting) {
			return;
		}

		// Получаем все сообщения отправленные админам
		const messages = confirmation.messages;

		// Редактируем эти сообщения
		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		// Удаляем подтверждение с БД
		await confirmation.remove();

		// Отправляем сообщение работнику с уведомлением о списании инструментов
		const text = '✅ Списание инструментов было подтверждено:\n' +
					 confirmation.itemsText;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		// Создаем Мар со списанными инструментами
		const removed: Map<string, number> = new Map();

		// Заполняем этот Мар
		for (const [id, amount] of confirmation.instruments) {
			// Добавляем инструмент в Мар со списанными инструментами
			removed.set(id, amount);
			// Удаляем эти инструменты с получения
			// (чтобы позднее не требовать их возврата)
			const newAmount = getting.instruments.has(id) ?
							  getting.instruments.get(id) - amount : 0;
			if (newAmount === 0) {
				getting.instruments.delete(id);	
			} else {
				getting.instruments.set(id, newAmount);
			}
		}

		if (getting.instruments.size === 0) {
			getting.active = false;
		}

		// Добавляем этот Мар в получение в БД
		getting.removed = removed;

		// Сохраняем получение
		await getting.save();
	}

	public static async confirmPurchase(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);
	
		if (!confirmation) {
			return;
		}

		// Получаем все сообщения отправленные админам
		const messages = confirmation.messages;

		// Редактируем эти сообщения
		for (const message of messages) {
			const text = confirmation.text + '\n❗️Ожидание подтверждения закупки снабженца';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		// Отправляем сообщение работнику с уведомлением о списании инструментов
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Закупил', `confirmPurchase>${id}`)]);
		const text = '✅ Закупка была подтверждено:\n' +
					 confirmation.itemsText +
					 '\n❗️Подтвердите закупку нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
	}



	public static confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	public static confirmSupply(supply: string): void {
		//...
	}

	public static getAbsentInstruments(): void {
		//...
	}

	public static getDebtors(): void {
		//...
	}

	public static getCellContent(cell: string): void {
		//...
	}

	// Worker methods
	public static requestGettingInstrument(instruments: Map<number, number>): void {
		//...
	}

	public static requestGettingFurniture(furniture: Map<number, number>): void {
		//...
	}

	public static requestGettingConsumable(consumables: Map<number, number>): void {
		//...
	}

	public static requestReceipt(requestId: number): void {
		//...
	}

	public static requestReturnInstrument(requestId: number): void {
		//...
	}

	public static requestReturnFurniture(furniture: Map<number, number>): void {
		//...
	}

	public static requestRemovingInstrument(items: Map<number, number>): void {
		//...
	}

	// Chief methods
	/**
	 * @desc Get all items in the stock
	 */
	public static getAllItems(): void {
		//...
	}

	/**
	 * @param {number} chatId - chat id of a person to send the table
	 * @desc Send request to Stockman for getting some items to
	 * a specified Worker
	 */
	public static requestGetting(username: string, items: Map<number, number>): void {
		//...
	}

	/**
	 * @param {string} supply - text with items to supply
	 * @desc Supply request, it's sent to admin for confirmation
	 */
	public static requestSupply(supply: string): void {
		//...
	}

	/**
	 * @desc Add new instrument to the database
	 */
	public static addInstrument(name: string, photoId?: string): void {
		Instrument.add(name, photoId);
	}

	/**
	 * @desc Add new furniture to the database
	 */
	public static addFurniture(name: string, photoId?: string): void {
		Furniture.add(name, photoId);
	}

	/**
	 * @desc Add new consumable to the database
	 */
	public static addConsumable(name: string, photoId?: string): void {
		Consumable.add(name, photoId);
	}
}
