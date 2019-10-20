import Person from './Person';
import PersonType from '../enums/PersonType';
import Stockman from './Stockman';
import ItemType from '../enums/ItemType';
import Confirmation from '../models/confirmation';
import { ItemRequested } from './Person';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getItem } from '../helpers/items';

const Markup = require('telegraf/markup');

export default class Supplier extends Person {
	// Private
	private static async getSupplyMessage(username: string, items: ItemRequested[]): Promise<string> {
		let message = `Поставщик @${username} хочет поставить следующие позиции:\n`;
		for (let item of items) {
			const { id, type, amount } = item;
			const { name } = await getItem(type, id);

			message += `🔹 ${name} -> ${amount} шт.\n`;
		}
		return message;
	}

	// Public
	/**
	 * @param {string} purchase - text with items to
	 * buy (with their prices and amount)
	 * @desc Request purchase, it's sent to admin
	 */
	public static async requestPurchase(purchase: string): Promise<void> {
		//...
	}

	/**
	 * @param {Map<number, number>} items - pairs (id - amount) to
	 * supply to the stock
	 * @desc Supply purchased items to stock, it's
	 * sent to Stockman
	 */
	public static async requestSupply(ctx: any, chatId: number, username: string, items: ItemRequested[]): Promise<void> {
		if (!items.length) {
			return;
		}
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}

		const messageText = await Supplier.getSupplyMessage(username, items);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

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

		if (instruments.size > 0) {
			confirmation.instruments = instruments;
		}
		if (furniture.size > 0) {
			confirmation.furniture = furniture;
		}
		if (consumables.size > 0) {
			confirmation.consumables = consumables;
		}

		confirmation.messages = messages;
		confirmation.text = messageText;
		confirmation.chatId = chatId;
		await confirmation.save();
	}

	public static async confirmSupply(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}
		await confirmation.remove();

		// Тут мы вызываем Stockman.confirmSupply, где Stockman
		// выбирает ячейки для поставляемых объектов

		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}

	/**
	 * @desc Add new instrument to the database
	 */
	public static addInstrument(id: number, photo: string, name: string): void {
		//..
	}

	/**
	 * @desc Add new furniture to the database
	 */
	public static addFurniture(id: number, photo: string, name: string): void {
		//..
	}

	/**
	 * @desc Add new consumable to the database
	 */
	public static addConsumable(id: number, photo: string, name: string): void {
		//..
	}
}
