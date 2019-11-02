import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import { getChatId } from '../helpers/functions';
import { getSuppliers } from '../helpers/persons';
import { getRequestSupplyMessage } from '../helpers/messages';

const Markup = require('telegraf/markup');

export default class Admin {
	// Public
	public static async confirmRemoveInstruments(ctx: any): Promise<void> {
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

		// Отправляем сообщение работнику с уведомлением о списании инструментов
		const text = '✅ Списание инструментов было подтверждено:\n' + confirmation.itemsText;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		// Создаем Мар со списанными инструментами
		const removed: Map<string, number> = new Map();

		// Заполняем этот Мар
		for (const [id, amount] of confirmation.instruments) {
			// Добавляем инструмент в Мар со списанными инструментами
			removed.set(id, amount);
			// Удаляем эти инструменты с получения
			// (чтобы позднее не требовать их возврата)
			const newAmount = getting.instruments.has(id) ? getting.instruments.get(id) - amount : 0;
			if (newAmount === 0) {
				getting.instruments.delete(id);
			} else {
				getting.instruments.set(id, newAmount);
			}
		}

		if (getting.instruments.size === 0) {
			getting.active = false;
		}

		// Добавляем этот Мар в получение в БД
		getting.removed = removed;

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
