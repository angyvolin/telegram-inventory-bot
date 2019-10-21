import * as api from 'telegraf';
import Confirmation from '../models/confirmation';
import PersonType from '../enums/PersonType';
import ItemType from '../enums/ItemType';
import KeyboardMessage from '../controllers/keyboards';
import { isStockman } from '../helpers/persons';
import { addItem } from '../helpers/items';

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
				await ctx.telegram.sendMessage(confirmation.chatId, text);
			}
		});

		bot.action(/^approveRequestGetting>/, async (ctx) => {
			await ctx.answerCbQuery();

			if (await isStockman(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n✅ Подтверждено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}

				const keyboard = Markup.inlineKeyboard([Markup.callbackButton('✅ Получил', `confirmGetting>${id}`), Markup.callbackButton('❌ Отклонить получение', `declineGetting>${id}`)]);
				const text = '✅ Ваша заявка на получение была подтверждена:\n\n' + confirmation.text + '\n❗️После получения подтвердите нажатием кнопки ниже:';
				const options = {
					reply_markup: keyboard
				};

				await confirmation.save();
				await ctx.telegram.sendMessage(confirmation.chatId, text, options);
			}
		});

		bot.action(/^approveRequestSupply>/, async (ctx) => {
			await ctx.answerCbQuery();

			if (await isStockman(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n✅ Подтверждено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}

				await confirmation.remove();

				if (confirmation.instruments) {
					confirmation.instruments.forEach((amount, id) => {
						addItem(ItemType.INSTRUMENT, id, amount);
					});
				}
				if (confirmation.furniture) {
					confirmation.furniture.forEach((amount, id) => {
						addItem(ItemType.FURNITURE, id, amount);
					});
				}
				if (confirmation.consumables) {
					confirmation.consumables.forEach((amount, id) => {
						addItem(ItemType.CONSUMABLE, id, amount);
					});
				}

				const text = '✅ Ваша заявка на поставку была подтверждена:\n\n' + confirmation.text;

				await ctx.telegram.sendMessage(confirmation.chatId, text);
			}
		});
	}
}
