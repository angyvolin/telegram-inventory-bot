import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import ItemType from '../enums/ItemType';
import { addItem } from '../helpers/items';
import { getCell, addToCell } from '../helpers/cells';
import { getCellsMessage } from '../helpers/messages';

const Markup = require('telegraf/markup');

export default class Stockman {
	// Public
	/**
	 * @desc Подтверждение выдачи позиций работнику
	 */
	public static async confirmGiving(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		// Get all messages that was sent to stockman
		const messages = confirmation.messages;

		// Edit these messages
		for (const message of messages) {
			const text = confirmation.text + '\n❗️Ожидание подтверждения получения работника';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		/*
		 * Send message to the worker with
		 * a button to confirm the getting
		 */
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Получил', `confirmGetting>${id}`)]);
		const text = '✅ Вам были выданы следующие позиции:\n' +
					 confirmation.itemsText +
					 '\n❗️Подтвердите получение нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
	}

	/**
	 * @desc Подтверждение поставки позиций
	 */
	public static async confirmSupply(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		// Get all messages that was sent to stockman
		const messages = confirmation.messages;

		// Edit these messages
		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		// Remove confirmation
		await confirmation.remove();

		/*
		 * Iterate all items, add them to a
		 * database and relevant cells
		 */
		const items: { name: string, cellName: string }[] = [];
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

		/*
		 * Send message to supplier with buttons
		 * to confirm supply
		 */
		const text = '✅ Ваша заявка на поставку была подтверждена:\n' + confirmation.itemsText;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		/*
		 * Send message to current stockman with
		 * cells of supplied items
		 */
		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await getCellsMessage(items));
		await ctx.reply(message);
	}

	/**
	 * Confirm return
	 */
	/**
	 * @desc Подтверждение возврата инструментов
	 * работником на склад
	 */
	public static async confirmReturnInstruments(ctx: any): Promise<void> {
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

		/*
		 * Send message to worker with
		 * buttons to confirm the return
		 */
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Получил', `confirmReturnInstruments>${id}>${gettingId}`)]);
		const text = '✅ Инструменты были успешно возвращены\n' +
					 confirmation.itemsText +
					 '\n❗️Подтвердите получение нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, keyboard);

		getting.active = false;
		await getting.save();

		await confirmation.remove();

		const items: { name: string, cellName: string }[] = [];

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
	 * @desc Подтверждение возврата остатков
	 * (фурнитуры / расходников) работником на склад
	 */
	public static async confirmReturnRemains(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const text = '✅ Остатки были успешно возвращены\n' + confirmation.itemsText;
		await ctx.telegram.sendMessage(confirmation.chatId, text);6

		await confirmation.remove();

		const items: { name: string, cellName: string }[] = [];
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

		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await getCellsMessage(items));
		await ctx.reply(message);
	}

	/**
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
