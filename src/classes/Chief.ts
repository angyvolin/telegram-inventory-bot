import Confirmation from '../models/confirmation';
import PersonType from '../enums/PersonType';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';
import { getChiefGettingMessage } from '../helpers/messages'

const Markup = require('telegraf/markup');

export default class Chief {
	// Public
	/**
	 * @desc Запрос на выдачу позиций работнику
	 */
	public static async requestGetting(ctx: any, table: string, username: string, days?: number): Promise<void> {
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

			const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Выдал позиции', `approveGivingChief>${confirmationId}`)],
													[Markup.callbackButton('❌ Отклонить', `declineRequest>${confirmationId}`)]]);

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



	/**
	 * @desc Get all items in the stock
	 */
	public static getAllItems(): void {
		//...
	}

	/**
	 * @param {number} chatId - chat id of a person to send the table
	 * @desc Send request to Stockman for getting some items to
	 * a specified Worker
	 */
	/*public static requestGetting(username: string, items: Map<number, number>): void {
		//...
	}*/

	/**
	 * @param {string} supply - text with items to supply
	 * @desc Supply request, it's sent to admin for confirmation
	 */
	public static requestSupply(supply: string): void {
		//...
	}
}
