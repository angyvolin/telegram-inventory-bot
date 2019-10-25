import Person from './Person';
import ItemType from '../enums/ItemType';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import { ItemCells } from './Person';
import { addItem, getItem, reduceItem } from '../helpers/items';
import { getCell, addToCell, reduceFromCell, getCellsMessage } from '../helpers/cells';

const Markup = require('telegraf/markup');

export default class Stockman extends Person {
	// Public
	public static async confirmGiving(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n❗️Ожидание подтверждения получения работника';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Получил', `confirmGetting>${id}`)]);
		const text = '✅ Вам были выданы следующие позиции:\n' + confirmation.itemsText + '\n❗️Подтвердите получение нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};

		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
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

		await confirmation.remove();

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

		const text = '✅ Ваша заявка на поставку была подтверждена:\n' + confirmation.itemsText;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		/*
		 * Тут нам нужно заполнять соответствующие ячейки
		 */

		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await getCellsMessage(items));
		await ctx.reply(message);
	}

	/**
	 * Confirm return
	 */
	public static async confirmReturn(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const gettingId = ctx.callbackQuery.data.split('>')[2];

		const confirmation = await Confirmation.findById(id);
		const getting = await Getting.findById(gettingId);

		if (!confirmation || !getting) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const text = '✅ Инструменты были успешно возвращены';
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		getting.active = false;
		await getting.save();

		await confirmation.remove();

		const items: ItemCells[] = [];

		for (const [id, amount] of getting.instruments) {
			await addItem(ItemType.INSTRUMENT, id, amount);
			const cell = await getCell(ItemType.INSTRUMENT, id);
			const cellName = cell ? cell.row + cell.col : null;
			const { name } = await Instrument.findById(id);
			items.push({ cellName, name });
			if (cell) {
				await addToCell(cell._id, ItemType.INSTRUMENT, id, amount);
			}
		}

		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await getCellsMessage(items));
		await ctx.reply(message);
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
