import * as api from 'telegraf';
import Confirmation from '../models/confirmation';
import PersonType from '../enums/PersonType';
import KeyboardMessage from '../controllers/keyboards';
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

				await ctx.telegram.sendMessage(confirmation.chatId, text);
			}
		});

		bot.action(/^approveRequest>/, async (ctx) => {
			await ctx.answerCbQuery();

			if (await isStockman(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n' + '✅ Подтверждено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}

				const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Подтвердить', `confirmGetting>${id}`)]);
				const text = '✅ Ваша заявка была подтверждена:\n\n' + confirmation.text + 'После получения подтвердите нажатием кнопки ниже';
				const options = {
					reply_markup: keyboard
				};

				await ctx.telegram.sendMessage(confirmation.chatId, text, options);
			}
		});
	}
}
