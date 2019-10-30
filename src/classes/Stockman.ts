import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import Cell from '../models/cell';
import KeyboardMessage from '../controllers/keyboards';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';
import { getChatId } from '../helpers/functions';
import { getCell } from '../helpers/cells';
import { getStockmans } from '../helpers/persons';
import { getItemsMessage,
		 getCellsMessage,
		 getGettingMessage,
		 getGettingWorkerMessage } from '../helpers/messages';
import { getItem,
		 getOutsideConsumables,
		 getOutsideFurniture,
		 getOutsideInstruments } from '../helpers/items';

const Markup = require('telegraf/markup');

export default class Stockman {
	// Public
	/**
	 * @desc Запрос на выдачу позиций работнику.
	 * Создаем новый Confirmation в БД и отсылаем
	 * уведомление работнику
	 */
	public static async requestGetting(ctx: any,
									   items: { type: ItemType;
									   			id: string;
									   			amount: number;
									   			measure: string }[],
									   username: string,
									   days?: number): Promise<void> {
		if (!items.length) {
			return;
		}

		// =====================
		// Взаимодействие с работником
		
		const id = await getChatId(username);

		if (!id) {
			return;
		}

		/*
		 * Сообщение, уведомляющее работника
		 * о выдаче ему позиций
		 */
		const gettingWorkerText = await getGettingWorkerMessage(items, days);

		// Отправляем сообщение работнику
		const message = await ctx.telegram.sendMessage(id, gettingWorkerText, {
			parse_mode: 'Markdown'
		});

		// =====================
		// Взаимодействие с кладовщиком

		const stockmans = await getStockmans();
		
		if (!stockmans.length) {
			return;
		}

		const gettingText = await getGettingMessage(username, items, days);
		/*
		 * Сообщение со списком позиций
		 * для последующего использования
		 */
		const itemsText = await getItemsMessage(items);
		/*
		 * Массив с сообщениями, которые
		 * будут отправлены кладовщикам.
		 * Будет использоваться для того,
		 * чтобы модифицировать сообщения
		 * у всех кладовщиков (не только у
		 * того, кто взаимодействует)
		 */
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Выдал позиции', `approveGiving>${confirmationId}`)],
													[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

			// Отправляем сообщение кладовщику
			const message = await ctx.telegram.sendMessage(id, gettingText, {
				reply_markup: keyboard,
				parse_mode: 'Markdown'
			});
			// Добавляем сообщение в массив
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		const instruments: Map<string, number> = new Map();
		const furniture: Map<string, number> = new Map();
		const consumables: Map<string, number> = new Map();

		/*
		 * Заполняем Map с соответствующими
		 * позициями (идентификатор - количество)
		 */
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
		confirmation.text = gettingText;
		confirmation.itemsText = itemsText;
		confirmation.chatId = id;
		await confirmation.save();
	}

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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {parse_mode: 'Markdown'});
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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {parse_mode: 'Markdown'});
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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {parse_mode: 'Markdown'});
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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {parse_mode: 'Markdown'});
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
