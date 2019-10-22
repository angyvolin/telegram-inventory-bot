import Stockman from '../classes/Stockman';
import Confirmation from '../models/confirmation';
import { isStockman } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class StockmanHandlers {
	public static init(bot) {
		bot.action(/^declineRequest>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n' + '❌ Отклонено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}

				const text = '❌ Ваша заявка была отклонена:\n\n' + confirmation.text;

				await confirmation.remove();
				await ctx.telegram.sendMessage(confirmation.chatId, text, {parse_mode: 'Markdown'});
			}
		});

		// Подтверждение выдачи позиций работнику
		bot.action(/^approveRequestGetting>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmGetting(ctx);
			}
		});


		bot.action(/^approveGiving>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmGiving(ctx);
			}
		});

		// Подтверждение поставки в склад
		bot.action(/^approveRequestSupply>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmSupply(ctx);
			}
		});
	}
}
