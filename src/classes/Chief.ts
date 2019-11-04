import Confirmation from '../models/confirmation';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';
import { getAdmins, getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getItemsMessage, getChiefGettingMessage, getPurchaseChiefMessage } from '../helpers/messages';

const Markup = require('telegraf/markup');

export default class Chief {
	// Public
	/**
	 * @desc Запрос на выдачу позиций работнику
	 */
	public static async requestGetting(ctx: any, table: string, username: string, days: number): Promise<void> {
		const stockmans = await getStockmans();
		if (!stockmans.length) {
			return;
		}
		/*
		 * Сообщение со всей инфой, которая
		 * будет нужна кладовщику
		 */
		const chiefGettingText = await getChiefGettingMessage(ctx.from.username, username, days);
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
				[Markup.callbackButton('✅ Выдал позиции', `approveGivingChief>${confirmationId}`)],
				[Markup.callbackButton('❌ Отклонить', `declineRequestCaption>${confirmationId}`)]
			]);

			// Отправляем сообщение кладовщику
			const message = await ctx.telegram.sendDocument(id, table, {
				caption: chiefGettingText + '\n❗️После выдачи подтвердите нажатием кнопки ниже\n',
				reply_markup: keyboard,
				parse_mode: 'Markdown'
			});

			// Добавляем сообщение в массив
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		confirmation.messages = messages;
		confirmation.text = chiefGettingText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
	}

	public static async requestPurchase(
		ctx: any,
		items: { type: ItemType; id: string; amount: number; measure: string }[],
		absent?: { name: string; amount: string; measure: string }[]
	): Promise<void> {
		if (!items.length) {
			return;
		}
		const admins = await getAdmins();
		if (!admins.length) {
			return;
		}

		const purchaseText = await getPurchaseChiefMessage(ctx.from.username, items, absent);
		const itemsText = await getItemsMessage(items, absent);
		const messages = [];

		const confirmation = new Confirmation();
		const confirmationId = confirmation._id;

		for (let admin of admins) {
			const id = await getChatId(admin.username);
			if (!id) continue;

			const keyboard = Markup.inlineKeyboard([
				[Markup.callbackButton('✅ Согласовать закупку', `approveChiefPurchase>${confirmationId}`)],
				[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]
			]);

			const message = await ctx.telegram.sendMessage(id, purchaseText, {
				reply_markup: keyboard,
				parse_mode: 'Markdown'
			});
			messages.push({
				id: message.message_id,
				chatId: id
			});
		}

		confirmation.messages = messages;
		confirmation.text = purchaseText;
		confirmation.itemsText = itemsText;
		confirmation.chatId = ctx.from.id;
		await confirmation.save();
	}
}
