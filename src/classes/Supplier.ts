import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import Confirmation from '../models/confirmation';
import ItemType from '../enums/ItemType';
import { getAdmins, getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { addItem } from '../helpers/items';
import { addToCell, getCell } from '../helpers/cells';
import { getItemsMessage, getItemsPriceMessage, getPurchaseMessage, getSupplyMessage } from '../helpers/messages';

const Markup = require('telegraf/markup');

export default class Supplier {
	// Public
	/**
	 * @desc Запрос на закупку позиций
	 * (с ценами на них)
	 */
	public static async requestPurchase(
		ctx: any,
		items: { type: ItemType; id: string; amount: number; price: string; measure: string }[],
		absent?: { name: string; amount: string; measure: string; price: string }[]
	): Promise<void> {
		if (!items.length && (!absent || !absent.length)) {
			return;
		}
		const admins = await getAdmins();
		if (!admins.length) {
			return;
		}

		const purchaseText = await getPurchaseMessage(ctx.from.username, items, absent);
		const itemsText = await getItemsPriceMessage(items, absent);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let admin of admins) {
			const id = await getChatId(admin.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([
				[Markup.callbackButton('✅ Подтвердить закупку', `approvePurchase>${confirmationId}`)],
				[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]
			]);

			const message = await ctx.telegram.sendMessage(id, purchaseText, {
				reply_markup: keyboard,
				parse_mode: 'Markdown'
			});
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		confirmation.messages = messages;
		confirmation.text = purchaseText;
		confirmation.itemsText = itemsText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
	}

	/**
	 * @desc Запрос на поставку позиций в склад
	 */
	public static async requestSupply(
		ctx: any,
		items: { type: ItemType; id: string; amount: number; measure: string }[]
	): Promise<void> {
		if (!items.length) {
			return;
		}
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}

		const supplyText = await getSupplyMessage(ctx.from.username, items);
		const itemsText = await getItemsMessage(items);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([
				[Markup.callbackButton('✅ Подтвердить получение', `approveSupply>${confirmationId}`)],
				[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]
			]);

			const message = await ctx.telegram.sendMessage(
				id,
				supplyText + `\n❗️После поставки подтвердите нажатием кнопки ниже\n`,
				{
					reply_markup: keyboard,
					parse_mode: 'Markdown'
				}
			);
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
		confirmation.text = supplyText;
		confirmation.itemsText = itemsText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
	}

	public static async confirmPurchase(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		// Удаляем подтверждаемый Confirmation
		await confirmation.remove();

		const messages = confirmation.messages;

		/**
		 * Модифицируем сообщения у всех кладовщиков,
		 * отмечаем, что работник подтвердил получение
		 */
		for (const message of messages) {
			const text = confirmation.text + '\n✅ Снабженец закупил позиции';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		/**
		 * Модифицируем сообщение у поставщика
		 * (убираем кнопки для подтверждения,
		 * отмечаем как "Подтверждено")
		 */
		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text, { parse_mode: 'Markdown' });
	}

	public static async confirmSupply(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		// Удаляем подтверждаемый Confirmation
		await confirmation.remove();

		const messages = confirmation.messages;

		/**
		 * Модифицируем сообщения у всех кладовщиков,
		 * отмечаем, что работник подтвердил получение
		 */
		for (const message of messages) {
			const text = confirmation.text + '\n✅ Снабженец подтвердил поставку';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		/*
		 * Iterate all items, add them to a
		 * database and relevant cells
		 */
		const items: { name: string; cellName: string }[] = [];
		if (confirmation.instruments) {
			for (const [id, amount] of confirmation.instruments) {
				await addItem(ItemType.INSTRUMENT, id, amount);
				const cell = await getCell(ItemType.INSTRUMENT, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Instrument.findById(id);
				items.push({ cellName, name });
				if (cell) {
					await addToCell(cell._id, ItemType.INSTRUMENT, id, amount);
				}
			}
		}
		if (confirmation.furniture) {
			for (const [id, amount] of confirmation.furniture) {
				await addItem(ItemType.FURNITURE, id, amount);
				const cell = await getCell(ItemType.FURNITURE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Furniture.findById(id);
				items.push({ cellName, name });
				if (cell) {
					await addToCell(cell._id, ItemType.FURNITURE, id, amount);
				}
			}
		}
		if (confirmation.consumables) {
			for (const [id, amount] of confirmation.consumables) {
				await addItem(ItemType.CONSUMABLE, id, amount);
				const cell = await getCell(ItemType.CONSUMABLE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Consumable.findById(id);
				items.push({ cellName, name });
				if (cell) {
					await addToCell(cell._id, ItemType.CONSUMABLE, id, amount);
				}
			}
		}

		/**
		 * Модифицируем сообщение у поставщика
		 * (убираем кнопки для подтверждения,
		 * отмечаем как "Подтверждено")
		 */
		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text, { parse_mode: 'Markdown' });
	}
}
