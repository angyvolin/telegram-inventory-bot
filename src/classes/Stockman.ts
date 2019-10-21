import Person from './Person';
import ItemType from '../enums/ItemType';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import { ItemCells } from './Person';
import { addItem, getItem, reduceItem } from '../helpers/items';
import { addToCell, getCell, reduceFromCell } from '../helpers/cells';

const Markup = require('telegraf/markup');

export default class Stockman extends Person {
	// Public
	public static async getCellsMessage(items: ItemCells[]) {
		let message = '';
		for (const item of items) {
			if (!item.cellName) {
				message += `🔸 ${item.name} -> вне ячейки\n`;
			} else {
				message += `🔸 ${item.name} -> ${item.cellName}\n`;
			}
		}
		return message;
	}

	public static async confirmGetting(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Я на получении', `confirmGetting>${id}`)], [Markup.callbackButton('❌ Отклонить получение', `declineGetting>${id}`)]]);
		const text = '✅ Ваша заявка на получение была подтверждена:\n\n' + confirmation.text + '\n❗️При получении на складе подтвердите нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};

		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
	}

	public static async confirmGiving(ctx: any): Promise<void> {
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

		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}

	public static async confirmSupply(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		confirmation.remove();

		const items: ItemCells[] = [];
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

		const text = '✅ Ваша заявка на поставку была подтверждена:\n\n' + confirmation.text;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		/*
		 * Тут нам нужно заполнять соответствующие ячейки
		 */

		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await Stockman.getCellsMessage(items));
		await ctx.reply(message);
	}

	/**
	 * Confirm return
	 * @desc
	 * Смс Worker с подтверждением о возможности вернуть
	 * инструменты, а также кнопкой для подтверждения
	 * возврата
	 */
	public static confirmReturnInstrument(requestId: number): void {
		//...
	}

	public static confirmReturnFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm removing
	 * @desc Запрос на списание инструмента.
	 * Пересылается Admin на согласование
	 */
	public static confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm receipt
	 */
	public static confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
