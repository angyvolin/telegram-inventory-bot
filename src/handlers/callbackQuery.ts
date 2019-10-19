import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import { dismissAdmin, isAdmin } from '../helpers/functions';
import Logger from '../init/logger';
import { getItem } from '../helpers/items';

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

		bot.action(/^increase>/, async (ctx) => {
			const type = +ctx.callbackQuery.data.split('>')[1];
			const id = ctx.callbackQuery.data.split('>')[2];

			const counter = parseInt(ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text);
			const item = await getItem(type, id);

			if (item.amount > counter) {
				const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}`), Markup.callbackButton(counter + 1, 'itemAmount'), Markup.callbackButton('➕', `increase>${type}>${id}`)], [Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + 1}`)]]);

				await ctx.editMessageReplyMarkup(keyboard);
				await ctx.answerCbQuery();
			} else {
				// await ctx.answerCbQuery(`На складе всего ${item.amount} позиций`, true);
			}
		});

		bot.action(/^reduce>/, async (ctx: any) => {
			const type = +ctx.callbackQuery.data.split('>')[1];
			const id = ctx.callbackQuery.data.split('>')[2];

			const counter = parseInt(ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text);

			if (counter > 1) {
				const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}`), Markup.callbackButton(counter - 1, 'itemAmount'), Markup.callbackButton('➕', `increase>${type}>${id}`)], [Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter - 1}`)]]);

				await ctx.editMessageReplyMarkup(keyboard);
				await ctx.answerCbQuery();
			} else {
				// await ctx.answerCbQuery(`Значение должно быть больше нуля`, true);
			}
		});

		bot.action('itemAmount', async (ctx) => {
			await ctx.answerCbQuery();
		});
	}
}
