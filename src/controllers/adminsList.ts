import * as api from 'telegraf';
import { getAdmins } from '../helpers/functions';
import AdminMessage from './admin';

const Markup = require('telegraf/markup');

export default class AdminsListMessage {
	public static async send(ctx: api.ContextMessageUpdate): Promise<void> {
		let admins = await getAdmins();

		for (const admin of admins) {
			let name = admin.name;
			let chatId = admin.chatId;
			let username =
				admin.username !== undefined ? admin.username : 'не указано';

			let keyboard = Markup.inlineKeyboard([
				Markup.callbackButton('Отстранить ❌ ', `dismiss>${chatId}`)
			]).extra();

			await ctx.replyWithMarkdown(
				`*Имя*: ${name}\n*Юзернейм*: @${username}\n*ChatId*: ${chatId}`,
				keyboard
			);
		}
		await AdminMessage.send(ctx);
	}
}
