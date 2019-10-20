import * as api from 'telegraf';
import Confirmation from '../models/confirmation';
import Getting from '../models/getting';
import PersonType from '../enums/PersonType';
import KeyboardMessage from '../controllers/keyboards';
import { isStockman } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class StockmanHandlers {
	public static init(bot) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isStockman(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
			}
		});

		bot.action(/^declineRequest>/, async (ctx) => {
			console.log('=> handler called');
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
			console.log('=> handler called');
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
				const text = '✅ Ваша заявка была подтверждена:\n\n' +
							 confirmation.text +
							 'После получения подтвердите нажатием кнопки ниже';
				const options = {
					reply_markup: keyboard,
				};

				await ctx.telegram.sendMessage(confirmation.chatId, text, options);
			}
		});

		bot.action(/^confirmGetting>/, async ctx => {
			const id = ctx.callbackQuery.data.split('>')[1];
			const confirmation = await Confirmation.findById(id);
			await confirmation.remove();

			let insertDoc: any = {
				chatId: confirmation.chatId
			};

			if (confirmation.instruments) insertDoc.instruments = confirmation.instruments;
			if (confirmation.furniture) insertDoc.furniture = confirmation.furniture;
			if (confirmation.consumables) insertDoc.consumables = confirmation.consumables;
			if (confirmation.days) insertDoc.expires = new Date(Date.now() + confirmation.days * 24 * 60 * 60 * 1000);

			const getting = new Getting(insertDoc);
			await getting.save();

			const text = ctx.update.callback_query.message.text + '\n\n✅ Подтверждено';
			await ctx.editMessageText(text);
		});
	}
}
