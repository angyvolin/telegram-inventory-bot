import * as api from 'telegraf';
import Common from '../classes/Common';
import Confirmation from '../models/confirmation';
import AdminMessage from '../controllers/admin';
import Logger from '../init/logger';
import { isChief, isStockman } from '../helpers/persons';
import { dismissAdmin, isAdmin } from '../helpers/functions';

const Markup = require('telegraf/markup');

export default class CallbackQueryHandlers {
	public static init(bot) {
		// Обработчик callback запроса на устранение админа
		bot.action(/^dismiss>[0-9]+$/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				try {
					await dismissAdmin(+ctx.callbackQuery.data.split('>')[1]);
					await ctx.answerCbQuery();
					await ctx.reply('Админ успешно отстранён ✔️', AdminMessage.keyboard1);
				} catch (err) {
					Logger.error(err);
					await ctx.answerCbQuery();
					await ctx.reply('Не удалось отстранить админа, приносим извинения', AdminMessage.keyboard1);
				}
			}
		});

		bot.action(/^itemAmount>/, async ctx => {
			await ctx.answerCbQuery();
		});

		// Отклонение запроса
		bot.action(/^declineRequest>/, async (ctx) => {
			await ctx.answerCbQuery();
			if ((await isStockman(ctx.from.username)) || (await isAdmin(ctx.from.id))) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);

				if (!confirmation) {
					return;
				}

				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n' + '❌ Отклонено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text, {
						parse_mode: 'Markdown'
					});
				}

				const message = confirmation.itemsText ? confirmation.itemsText : confirmation.text;
				const text = '❌ Ваша заявка была отклонена:\n\n' + message;

				await confirmation.remove();
				await ctx.telegram.sendMessage(confirmation.chatId, text, { parse_mode: 'Markdown' });
			}
		});

		bot.action(/^viewCell>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if ((await isStockman(ctx.from.username)) || (await isChief(ctx.from.username))) {
				Common.viewCell(ctx);
			}
		});

		bot.action('viewOutside', async (ctx: any) => {
			await ctx.answerCbQuery();
			if ((await isStockman(ctx.from.username)) || (await isChief(ctx.from.username))) {
				Common.viewOutside(ctx);
			}
		});
	}
}
