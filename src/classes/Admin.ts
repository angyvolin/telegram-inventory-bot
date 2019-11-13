import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import Person from '../models/person';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import ItemType from '../enums/ItemType';
import { getUsernameByChatId, getChatId } from '../helpers/functions';
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

		const text = '✅ Списание было подтверждено:\n' + (await getItemsMessage(items));
		await ctx.reply(text);
	}

	public static async requestPurchase(
		ctx: any,
		items: { type: ItemType; id: string; amount: number; measure: string }[],
		absent?: { name: string; amount: string; measure: string }[]
	): Promise<void> {
		if (!items.length && (!absent || !absent.length)) {
			return;
		}
		// Получаем всех поставщиков
		const suppliers = await getSuppliers();
		if (!suppliers.length) {
			return;
		}

		// Текст поставщикам с уведомлением о закупке
		const itemsText = await getItemsMessage(items, absent);
		const requestSupplyText = getRequestSupplyMessage(itemsText);

		for (let supplier of suppliers) {
			const id = await getChatId(supplier.username);
			if (!id) continue;

			await ctx.telegram.sendMessage(id, requestSupplyText);
		}

		// Отправляем сообщение работнику с уведомлением о списании инструментов
		const text = '✅ Запрос о закупке был разослан снабженцам:\n' + itemsText;
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
			'✅ Закупка была подтверждена:\n' +
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

	public static async getOutdatedGettings(ctx: any): Promise<void> {
		const gettings = await Getting.find({
			active: true,
			expires: {
				$lt: new Date()
			}
		});

		if (!gettings.length) {
			return ctx.reply('На данный момент просроченных получений нет');
		}
		let message = '*Список просроченных получений:*\n\n';

		for (let getting of gettings) {
			if (!gettings.length) {
				return ctx.reply('На данный момент просрочек нет');
			}

			const person = await Person.findOne({
				username: await getUsernameByChatId(getting.chatId)
			});

			if (getting.instruments) {
				for (let item of getting.instruments) {
					const { name, measure } = await Instrument.getItem(item[0]);
					const expiration = Math.abs(
						Math.floor((getting.expires.valueOf() - new Date().valueOf()) / (60 * 60 * 24 * 1000))
					);
					message += `🔹 ${person.fullName}: ${name} – ${item[1]} ${measure} *(на ${expiration} дн.)*\n`;
				}
			}

			if (getting.furniture) {
				for (let item of getting.furniture) {
					const { name, measure } = await Furniture.getItem(item[0]);
					const expiration = Math.abs(
						Math.floor((getting.expires.valueOf() - new Date().valueOf()) / (60 * 60 * 24 * 1000))
					);
					message += `🔹 ${person.fullName}: ${name} – ${item[1]} ${measure} *(на ${expiration} дн.)*\n`;
				}
			}

			if (getting.consumables) {
				for (let item of getting.consumables) {
					const { name, measure } = await Consumable.getItem(item[0]);
					const expiration = Math.abs(
						Math.floor((getting.expires.valueOf() - new Date().valueOf()) / (60 * 60 * 24 * 1000))
					);
					message += `🔹 ${person.fullName}: ${name} – ${item[1]} ${measure} *(на ${expiration} дн.)*\n`;
				}
			}
		}
		await ctx.replyWithMarkdown(message);
	}

	public static async getDebtors(ctx: any): Promise<void> {
		const gettings = await Getting.find({ active: true }).sort('chatId');

		if (!gettings.length) {
			return ctx.reply('На данный момент должников нет');
		}
		let message = '*Список должников:*\n\n';
		let prevPerson = null;

		for (let getting of gettings) {
			const person = await Person.findOne({
				username: await getUsernameByChatId(getting.chatId)
			});

			if (prevPerson !== person.username) message += `🔹 ${person.fullName}:\n`;

			if (getting.instruments) {
				for (let item of getting.instruments) {
					const { name, measure } = await Instrument.getItem(item[0]);
					message += `${name} – ${item[1]} ${measure}\n`;
				}
			}

			if (getting.furniture) {
				for (let item of getting.furniture.entries()) {
					const { name, measure } = await Furniture.getItem(item[0]);
					message += `${name} – ${item[1]} ${measure}\n`;
				}
			}

			if (getting.consumables) {
				for (let item of getting.consumables.entries()) {
					const { name, measure } = await Consumable.getItem(item[0]);
					message += `${name} – ${item[1]} ${measure}\n`;
				}
			}

			prevPerson = person.username;
		}
		await ctx.replyWithMarkdown(message);
	}
}
