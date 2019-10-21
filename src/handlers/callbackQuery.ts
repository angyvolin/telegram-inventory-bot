import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import { dismissAdmin, isAdmin } from '../helpers/functions';
import Logger from '../init/logger';

const Markup = require('telegraf/markup');

export default class CallbackQueryHandlers {
	public static init(bot) {
		// Обработчик callback запроса на устранение админа
		bot.action(/^dismiss>[0-9]+$/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				try {
					await dismissAdmin(+ctx.callbackQuery.data.split('>')[1]);
					await ctx.answerCbQuery();
					await ctx.reply('Админ успешно отстранён ✔️', AdminMessage.keyboard);
				} catch (err) {
					Logger.error(err);
					await ctx.answerCbQuery();
					await ctx.reply('Не удалось отстранить админа, приносим извинения', AdminMessage.keyboard);
				}
			}
		});

		bot.action('itemAmount', async (ctx) => {
			await ctx.answerCbQuery();
		});
	}
}
