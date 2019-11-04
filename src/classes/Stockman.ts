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
import { getItemsMessage, getCellsMessage, getGettingMessage, getGettingWorkerMessage } from '../helpers/messages';
import { getItem, getOutsideConsumables, getOutsideFurniture, getOutsideInstruments } from '../helpers/items';

const Markup = require('telegraf/markup');

export default class Stockman {
	// Public
	/**
	 * @desc Запрос на выдачу позиций работнику.
	 * Создаем новый Confirmation в БД и отсылаем
	 * уведомление работнику
	 */
	public static async requestGetting(
		ctx: any,
		items: { type: ItemType; id: string; amount: number; measure: string }[],
		username: string,
		days?: number
	): Promise<void> {
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

			const keyboard = Markup.inlineKeyboard([
				[Markup.callbackButton('✅ Выдал позиции', `approveGiving>${confirmationId}`)],
				[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]
			]);

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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		/*
		 * Send message to the worker with
		 * a button to confirm the getting
		 */
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Получил', `confirmGetting>${id}`)]);
		const text =
			'✅ Вам были выданы следующие позиции:\n' +
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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		/*
		 * Send message to the supplier with
		 * a button to confirm the supply
		 */
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Поставил', `confirmSupply>${id}`)]);
		const text =
			'✅ Вы поставили следующие позиции:\n' +
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
	public static async confirmReturn(ctx: any): Promise<void> {
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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		/*
		 * Send message to worker with
		 * buttons to confirm the return
		 */
		const keyboard = Markup.inlineKeyboard([
			Markup.callbackButton('✅ Вернул позиции', `confirmReturn>${id}>${gettingId}`)
		]);
		const text =
			'✅ Позиции были успешно возвращены:\n' +
			confirmation.itemsText +
			'\n❗️Подтвердите возврат нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);

		const items: { name: string; cellName: string }[] = [];
		if (getting.instruments) {
			for (const [id, amount] of getting.instruments) {
				const cell = await getCell(ItemType.INSTRUMENT, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Instrument.findById(id);
				items.push({ cellName, name });
			}
		}
		if (getting.furniture) {
			for (const [id, amount] of getting.furniture) {
				const cell = await getCell(ItemType.FURNITURE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Furniture.findById(id);
				items.push({ cellName, name });
			}
		}
		if (getting.consumables) {
			for (const [id, amount] of getting.consumables) {
				const cell = await getCell(ItemType.CONSUMABLE, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Consumable.findById(id);
				items.push({ cellName, name });
			}
		}

		const message = 'Разместите поставленные позиции в соответствии со списком:\n' + (await getCellsMessage(items));
		await ctx.reply(message);
	}
}