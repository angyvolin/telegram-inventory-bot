import * as api from 'telegraf';
import Confirmation from '../models/confirmation';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';
import KeyboardMessage from '../controllers/keyboards';
import { isStockman } from '../helpers/persons';

export default class StockmanHandlers {
	public static init(bot) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isStockman(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
			}
		});

		bot.action(/^declineRequest>/, async (ctx) => {
			console.log('=> handler called');

			if (await isStockman(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n' + '❌ Отклонено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}
			}
		});

		bot.action(/^approveRequest>/, async (ctx) => {
			console.log('=> handler called');

			if (await isStockman(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n' + '✅ Подтверждено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}
			}
		});
	}
}
