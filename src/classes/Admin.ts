import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import ItemType from '../enums/ItemType';
import { getChatId } from '../helpers/functions';
import { getSuppliers } from '../helpers/persons';
import { getItemsMessage, getRequestSupplyMessage } from '../helpers/messages';

const Markup = require('telegraf/markup');

export default class Admin {
	// Public
	public static async requestRemove(
		ctx: any,
		items: { type: ItemType; id: string; amount: number; measure: string }[],
		gettingId: string,
		reason: string
	): Promise<void> {
		const getting = await Getting.findById(gettingId);

		if (!getting) {
			return;
		}

		// Создаем Мар со списанными позициями
		const removedInstruments: Map<string, number> = new Map();
		const removedFurniture: Map<string, number> = new Map();
		const removedConsumables: Map<string, number> = new Map();

		items.forEach((item) => {
			const { type, id, amount } = item;
			switch (type) {
				case ItemType.INSTRUMENT: {
					// Добавляем инструмент в Мар со списанными инструментами
					removedInstruments.set(id, amount);
					// Удаляем эти инструменты с получения
					// (чтобы позднее не требовать их возврата)
					const newAmount = getting.instruments.has(id) ? getting.instruments.get(id) - amount : 0;
					if (newAmount <= 0) {
						getting.instruments.delete(id);
					} else {
						getting.instruments.set(id, newAmount);
					}
					break;
				}
				case ItemType.FURNITURE: {
					// Добавляем инструмент в Мар со списанными инструментами
					removedFurniture.set(id, amount);
					// Удаляем эти инструменты с получения
					// (чтобы позднее не требовать их возврата)
					const newAmount = getting.furniture.has(id) ? getting.furniture.get(id) - amount : 0;
					if (newAmount <= 0) {
						getting.furniture.delete(id);
					} else {
						getting.furniture.set(id, newAmount);
					}
					break;
				}
				case ItemType.CONSUMABLE: {
					// Добавляем инструмент в Мар со списанными инструментами
					removedFurniture.set(id, amount);
					// Удаляем эти инструменты с получения
					// (чтобы позднее не требовать их возврата)
					const newAmount = getting.furniture.has(id) ? getting.furniture.get(id) - amount : 0;
					if (newAmount <= 0) {
						getting.furniture.delete(id);
					} else {
						getting.furniture.set(id, newAmount);
					}
					break;
				}
			}
		});

		/*
		 * Флаг, который укажет, стало
		 * ли получение пустым
		 */
		let isEmpty = true;

		/*
		 * Проверяем получение на актуальность
		 * (остались ли позиции для возврата)
		 */
		if (getting.instruments) {
			isEmpty = getting.instruments.size === 0;
		}
		if (getting.furniture) {
			isEmpty = getting.furniture.size === 0;
		}
		if (getting.consumables) {
			isEmpty = getting.consumables.size === 0;
		}

		/*
		 * Получение стало пустым - делаем
		 * его неактивным (за ним не остается
		 * долга)
		 */
		getting.active = !isEmpty;

		// Добавляем эти Мар в получение в БД
		if (removedInstruments.size > 0) {
			getting.removedInstruments = removedInstruments;
		}
		if (removedFurniture.size > 0) {
			getting.removedFurniture = removedFurniture;
		}
		if (removedConsumables.size > 0) {
			getting.removedConsumables = removedConsumables;
		}

		// Сохраняем получение
		await getting.save();

		const text = 'Списание было подтверждено:\n' + (await getItemsMessage(items));
		await ctx.reply(text);
	}

	public static async confirmRemove(ctx: any): Promise<void> {
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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		// Удаляем подтверждение с БД
		await confirmation.remove();

		// Отправляем сообщение работнику с уведомлением о списании позиций
		const text = '✅ Списание позиций было подтверждено:\n' + confirmation.itemsText;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		// Создаем Мар со списанными позициями
		const removedInstruments: Map<string, number> = new Map();
		const removedFurniture: Map<string, number> = new Map();
		const removedConsumables: Map<string, number> = new Map();

		// Заполняем эти Мар
		if (confirmation.instruments) {
			for (const [id, amount] of confirmation.instruments) {
				// Добавляем инструмент в Мар со списанными инструментами
				removedInstruments.set(id, amount);
				// Удаляем эти инструменты с получения
				// (чтобы позднее не требовать их возврата)
				const newAmount = getting.instruments.has(id) ? getting.instruments.get(id) - amount : 0;
				if (newAmount <= 0) {
					getting.instruments.delete(id);
				} else {
					getting.instruments.set(id, newAmount);
				}
			}
		}
		if (confirmation.furniture) {
			for (const [id, amount] of confirmation.furniture) {
				// Добавляем инструмент в Мар со списанными инструментами
				removedFurniture.set(id, amount);
				// Удаляем эти инструменты с получения
				// (чтобы позднее не требовать их возврата)
				const newAmount = getting.furniture.has(id) ? getting.furniture.get(id) - amount : 0;
				if (newAmount <= 0) {
					getting.furniture.delete(id);
				} else {
					getting.furniture.set(id, newAmount);
				}
			}
		}
		if (confirmation.consumables) {
			for (const [id, amount] of confirmation.consumables) {
				// Добавляем инструмент в Мар со списанными инструментами
				removedConsumables.set(id, amount);
				// Удаляем эти инструменты с получения
				// (чтобы позднее не требовать их возврата)
				const newAmount = getting.consumables.has(id) ? getting.consumables.get(id) - amount : 0;
				if (newAmount <= 0) {
					getting.consumables.delete(id);
				} else {
					getting.consumables.set(id, newAmount);
				}
			}
		}

		/*
		 * Флаг, который укажет, стало
		 * ли получение пустым
		 */
		let isEmpty = true;

		/*
		 * Проверяем получение на актуальность
		 * (остались ли позиции для возврата)
		 */
		if (getting.instruments) {
			isEmpty = getting.instruments.size === 0;
		}
		if (getting.furniture) {
			isEmpty = getting.furniture.size === 0;
		}
		if (getting.consumables) {
			isEmpty = getting.consumables.size === 0;
		}

		/*
		 * Получение стало пустым - делаем
		 * его неактивным (за ним не остается
		 * долга)
		 */
		getting.active = !isEmpty;

		// Добавляем эти Мар в получение в БД
		if (removedInstruments.size > 0) {
			getting.removedInstruments = removedInstruments;
		}
		if (removedFurniture.size > 0) {
			getting.removedFurniture = removedFurniture;
		}
		if (removedConsumables.size > 0) {
			getting.removedConsumables = removedConsumables;
		}

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
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		// Отправляем сообщение работнику с уведомлением о списании инструментов
		const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Закупил', `confirmPurchase>${id}`)]);
		const text =
			'✅ Закупка была подтверждено:\n' +
			confirmation.itemsText +
			'\n❗️Подтвердите закупку нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};
		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
	}

	public static async confirmChiefPurchase(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);

		if (!confirmation) {
			return;
		}

		// Получаем все сообщения отправленные админам
		const messages = confirmation.messages;

		// Редактируем эти сообщения
		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
				parse_mode: 'Markdown'
			});
		}

		// Удаляем подтверждение с БД
		await confirmation.remove();

		// Получаем всех поставщиков
		const suppliers = await getSuppliers();

		// Текст поставщикам с уведомлением о закупке
		const requestSupplyText = getRequestSupplyMessage(confirmation.itemsText);

		for (let supplier of suppliers) {
			const id = await getChatId(supplier.username);
			if (!id) continue;

			await ctx.telegram.sendMessage(id, requestSupplyText);
		}

		// Отправляем сообщение работнику с уведомлением о списании инструментов
		const text =
			'✅ Закупка была согласована:\n' + confirmation.itemsText + '\nЗапрос о закупке был разослан снабженцам';
		await ctx.telegram.sendMessage(confirmation.chatId, text);
	}
}
