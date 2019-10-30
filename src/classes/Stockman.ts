import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import Cell from '../models/cell';
import KeyboardMessage from '../controllers/keyboards';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';
import { getCell } from '../helpers/cells';
import { getCellsMessage } from '../helpers/messages';
import { getItem, getOutsideConsumables, getOutsideFurniture, getOutsideInstruments } from '../helpers/items';

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
			const text = confirmation.text + '\n❗️Ожидание подтверждения поставки снабженца';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		/*
		 * Send message to the supplier with
		 * a button to confirm the supply
		 */
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Поставил', `confirmSupply>${id}`)]);
		const text = '✅ Вы поставили следующие позиции:\n' +
					 confirmation.itemsText +
					 '\n❗️Подтвердите поставку нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
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

		if (!confirmation) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n❗️Ожидание подтверждения возврата работника';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		/*
		 * Send message to worker with
		 * buttons to confirm the return
		 */
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Вернул инструменты', `confirmReturn>${id}>${gettingId}`)]);
		const text = '✅ Инструменты были успешно возвращены:\n' +
					 confirmation.itemsText +
					 '\n❗️Подтвердите получение нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);

		const items: { name: string, cellName: string }[] = [];
		for (const [id, amount] of getting.instruments) {
			const cell = await getCell(ItemType.INSTRUMENT, id);
			const cellName = cell ? cell.row + cell.col : null;
			const { name } = await Instrument.findById(id);
			items.push({ cellName, name });
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
			const text = confirmation.text + '\n❗️Ожидание подтверждения возврата работника';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Вернул остатки', `confirmReturnRemains>${id}`)]);
		const text = '✅ Остатки были успешно возвращены:\n' +
					 confirmation.itemsText +
					 '\n❗️Подтвердите получение нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);

		const items: { name: string, cellName: string }[] = [];
		if (confirmation.furniture) {
			for (const [id, amount] of confirmation.furniture.entries()) {
				const cell = await getCell(ItemType.FURNITURE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Furniture.findById(id);
				items.push({ cellName, name });
			}
		}
		if (confirmation.consumables) {
			for (const [id, amount] of confirmation.consumables.entries()) {
				const cell = await getCell(ItemType.CONSUMABLE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Consumable.findById(id);
				items.push({ cellName, name });
			}
		}

		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await getCellsMessage(items));
		await ctx.reply(message);
	}

	public static async viewCell(ctx: any): Promise<void> {
		const cellId = ctx.callbackQuery.data.split('>')[1];
		const cell = await Cell.findById(cellId);

		if (!cell.instruments && !cell.furniture && !cell.consumables) {
			await ctx.answerCbQuery();
			await ctx.scene.leave();
			return ctx.reply('Позиций в этой ячейке не найдено', KeyboardMessage.stockman);
		}

		let itemsCount = 0;
		if (cell.instruments) itemsCount += cell.instruments.size;
		if (cell.furniture) itemsCount += cell.furniture.size;
		if (cell.consumables) itemsCount += cell.consumables.size;

		let ending = 'й';
		const lastDigit = itemsCount % 10;

		switch (lastDigit) {
			case 1:
				ending = 'я';
				break;
			case 2:
			case 3:
			case 4:
				ending = 'и';
				break;
		}

		let message = `В ячейке *${cell.row + cell.col}* находится ${itemsCount} позици${ending}\n\n`;

		console.log('=> LOG');

		if (cell.instruments) {
			message += '*Инструменты*\n';

			for (let instrument of cell.instruments) {
				const item = await getItem(ItemType.INSTRUMENT, instrument[0]);
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
			message += '\n';
		}

		if (cell.furniture) {
			message += '*Фурнитура*\n';

			for (let furniture of cell.furniture) {
				const item = await getItem(ItemType.FURNITURE, furniture[0]);
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}

			message += '\n';
		}

		if (cell.consumables) {
			message += '*Расходники*\n';

			for (let consumable of cell.consumables) {
				const item = await getItem(ItemType.CONSUMABLE, consumable[0]);
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
		}

		await ctx.telegram.sendMessage(ctx.from.id, message, {parse_mode: 'Markdown'});

		await ctx.answerCbQuery();
		await ctx.scene.leave();
		await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
	}

	public static async viewOutside(ctx: any): Promise<void> {
		const instruments = await getOutsideInstruments();
		const furniture = await getOutsideFurniture();
		const consumables = await getOutsideConsumables();

		if (!instruments && !furniture && !consumables) {
			await ctx.answerCbQuery();
			await ctx.scene.leave();
			return ctx.reply('Позиций вне ячеек не найдено', KeyboardMessage.stockman);
		}

		let itemsCount = 0;
		if (instruments) itemsCount += instruments.length;
		if (furniture) itemsCount += furniture.length;
		if (consumables) itemsCount += consumables.length;

		let ending = 'й';
		const lastDigit = itemsCount % 10;

		switch (lastDigit) {
			case 1:
				ending = 'я';
				break;
			case 2:
			case 3:
			case 4:
				ending = 'и';
				break;
		}

		let message = `Вне ячеек находится ${itemsCount} позици${ending}\n\n`;

		if (instruments.length) {
			message += '*Инструменты*\n';

			for (let item of instruments) {
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
			message += '\n';
		}

		if (furniture.length) {
			message += '*Фурнитура*\n';

			for (let item of furniture) {
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}

			message += '\n';
		}

		if (consumables.length) {
			message += '*Расходники*\n';

			for (let item of consumables) {
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
		}

		await ctx.telegram.sendMessage(ctx.from.id, message, {parse_mode: 'Markdown'});

		await ctx.answerCbQuery();
		await ctx.scene.leave();
		await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
	}
}
