import Stockman from './Stockman';
import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import ItemType from '../enums/ItemType';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { addItem, reduceItem } from '../helpers/items';
import { getCell, addToCell, reduceFromCell } from '../helpers/cells';
import { getItemsMessage, getGettingMessage, getReturnMessage } from '../helpers/messages'; 

const Markup = require('telegraf/markup');

export default class Worker {
	// Public
	/*
	 * Request getting
	 */

	/**
	 * @desc Запрос на получение позиций работником.
	 * Создаем новый Confirmation в БД и рассылаем
	 * запрос кладовщикам
	 */
	public static async requestGetting(ctx: any,
									   items: { type: ItemType; id: string; amount: number }[],
									   days?: number): Promise<void> {
		if (!items.length) {
			return;
		}
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}
		/*
		 * Сообщение со всей инфой, которая
		 * будет нужна кладовщику
		 */
		const gettingText = await getGettingMessage(ctx.from.username, items, days);
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
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
	}

	/**
	 * @desc Запрос на возврат инструментов
	 * работника кладовщику
	 */
	public static async requestReturnInstruments(ctx: any, gettingId: string): Promise<void> {
		const getting = await Getting.findById(gettingId);
		const stockmans = await getStockmans();
		if (!getting || !stockmans.length) {
			return;
		}

		const instruments = [];
		for (const [id, amount] of getting.instruments.entries()) {
			instruments.push({
				type: ItemType.INSTRUMENT,
				id: id.toString(),
				amount: amount
			});
		}

		const returnText = await getReturnMessage(ctx.from.username, instruments);
		const itemsText = await getItemsMessage(instruments);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Получил позиции обратно', `approveReturn>${confirmationId}>${gettingId}`)],
													[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

			// Отправляем сообщение кладовщику
			const message = await ctx.telegram.sendMessage(id, returnText + '\n❗️После возврата подтвердите нажатием кнопки ниже\n',
				{
					reply_markup: keyboard,
					parse_mode: 'Markdown'
				}
			);

			// Добавление сообщения в массив
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		confirmation.messages = messages;
		confirmation.text = returnText;
		confirmation.itemsText = itemsText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
	}

	/**
	 * @desc Запрос на возврат остатков
	 * (фурнитуры / расходников) работника кладовщику
	 */
	public static async requestReturnRemains(ctx: any,
									   		 items: { type: ItemType; id: string; amount: number }[]): Promise<void> {
		if (!items.length) {
			return;
		}
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}

		const returnText = await getReturnMessage(ctx.from.username, items);
		const itemsText = await getItemsMessage(items);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let stockman of stockmans) {
			const id = await getChatId(stockman.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Получил позиции обратно', `approveReturnRemains>${confirmationId}`)],
													[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

			// Отправляем сообщение кладовщику
			const message = await ctx.telegram.sendMessage(id, returnText + '\n❗️После возврата подтвердите нажатием кнопки ниже\n',
				{
					reply_markup: keyboard,
					parse_mode: 'Markdown'
				}
			);
			// Добавление сообщения в массив
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		const furniture: Map<string, number> = new Map();
		const consumables: Map<string, number> = new Map();

		/*
		 * Заполняем Map с соответствующими
		 * позициями (идентификатор - количество)
		 */
		items.forEach((item) => {
			switch (item.type) {
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

		if (furniture.size > 0) {
			confirmation.furniture = furniture;
		}
		if (consumables.size > 0) {
			confirmation.consumables = consumables;
		}

		confirmation.messages = messages;
		confirmation.text = returnText;
		confirmation.itemsText = itemsText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
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

	/*
	 * Confirm
	 */

	/**
	 * @desc Подтверждение получения позиций работником.
	 * После подтверждения удаляем Confirmation и создаем
	 * новый Getting в БД
	 */
	public static async confirmGetting(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		// Удаляем подтверждаемый Confirmation
		await confirmation.remove();

		// Объект для заполнения нового Getting
		let insertDoc: any = {
			chatId: confirmation.chatId
		};

		// Заполняем инструменты
		if (confirmation.instruments) {
			/*
			 * Делаем Getting активным. Это значит,
			 * что он содержит в себе инструменты, которые
			 * нужно будет вернуть
			 */
			insertDoc.active = true;
			// Добавляем инструменты в insertDoc
			insertDoc.instruments = confirmation.instruments;
			// Перебираем все инструменты в подтверждении
			for (const [id, amount] of confirmation.instruments) {
				// Уменьшаем количество инструмента в базе
				await reduceItem(ItemType.INSTRUMENT, id, amount);
				// Получаем ячейку, в которой находится инструмент
				const cell = await getCell(ItemType.INSTRUMENT, id);
				if (cell) { // Инструмент находится в ячейке
					// Уменьшаем количество инструмента в ячейке
					await reduceFromCell(cell._id, ItemType.INSTRUMENT, id, amount);
				}
			}
		}
		// Заполняем фурнитуру
		if (confirmation.furniture) {
			// Добавляем фурнитуру в insertDoc
			insertDoc.furniture = confirmation.furniture;
			// Перебираем всю фурнитуру в подтверждении
			for (const [id, amount] of confirmation.furniture) {
				// Уменьшаем количество фурнитуры в базе
				await reduceItem(ItemType.FURNITURE, id, amount);
				// Получаем ячейку, в которой находится фурнитура
				const cell = await getCell(ItemType.FURNITURE, id);
				if (cell) { // Фурнитура находится в ячейке
					// Уменьшаем количество фурнитуры в ячейке
					await reduceFromCell(cell._id, ItemType.FURNITURE, id, amount);
				}
			}
		}
		// Заполняем расходники
		if (confirmation.consumables) {
			// Добавляем расходники в insertDoc
			insertDoc.consumables = confirmation.consumables;
			// Перебираем все расходники в подтверждении
			for (const [id, amount] of confirmation.consumables) {
				// Уменьшаем количество расходников в базе
				await reduceItem(ItemType.CONSUMABLE, id, amount);
				// Получаем ячейку, в которой находится расходник
				const cell = await getCell(ItemType.CONSUMABLE, id);
				if (cell) { // Расходник находится в ячейке
					// Уменьшаем количество расходников в ячейке
					await reduceFromCell(cell._id, ItemType.CONSUMABLE, id, amount);
				}
			}
		}
		if (confirmation.days) { // У подтверждения есть срок
			// Вычисляем дату возврата инструментов
			insertDoc.expires = new Date(Date.now() + confirmation.days * 24 * 60 * 60 * 1000);
		}

		/** Создаем новый Getting в БД и
		 *заполняем его данными из insertDoc
		 */
		const getting = new Getting(insertDoc);
		await getting.save();

		const messages = confirmation.messages;

		/**
		 * Модифицируем сообщения у всех кладовщиков,
		 * отмечаем, что работник подтвердил получение
		 */
		for (const message of messages) {
			const text = confirmation.text + '\n\n✅ Работник подтвердил получение';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		/**
		 * Модифицируем сообщение у работника
		 * (убираем кнопки для подтверждения,
		 * отмечаем как "Подтверждено")
		 */
		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}

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
			const text = confirmation.text + '\n✅ Работник подтвердил возврат';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		getting.active = false;
		await getting.save();

		await confirmation.remove();

		for (const [id, amount] of getting.instruments) {
			await addItem(ItemType.INSTRUMENT, id, amount);
			const cell = await getCell(ItemType.INSTRUMENT, id);
			if (cell) {
				await addToCell(cell._id, ItemType.INSTRUMENT, id, amount);
			}
		}

		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}

	public static async confirmReturnRemains(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		console.log(id);
		console.dir(confirmation);

		if (!confirmation) {
			return;
		}

		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n✅ Работник подтвердил возврат';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		await confirmation.remove();

		if (confirmation.instruments) {
			for (const [id, amount] of confirmation.instruments) {
				await addItem(ItemType.INSTRUMENT, id, amount);
				const cell = await getCell(ItemType.INSTRUMENT, id);
				const cellName = cell ? cell.row + cell.col : null;
				const { name } = await Instrument.findById(id);
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
				if (cell) {
					await addToCell(cell._id, ItemType.CONSUMABLE, id, amount);
				}
			}
		}

		const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
		await ctx.editMessageText(text);
	}
}
