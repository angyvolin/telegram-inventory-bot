import * as api from 'telegraf';
import Confirmation from '../models/confirmation';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';
import KeyboardMessage from '../controllers/keyboards';
import { isStockman } from '../helpers/persons';

export default class StockmanHandlers {
	public static init(bot: any) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isStockman(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
			}
		});

		bot.action(/^declineRequest>/, async (ctx) => {
			if (await isStockman(ctx.from.username)) {
				const id = +ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				console.dir(messages);

				for (const message of messages) {
					const text = message.text + '\n' + '✅ Подтверждено';
					ctx.telegram.editMessageText(text, {
						chat_id: message.chatId,
						message_id: message.id
					});
				}
			}
		});

		bot.action(/^approveRequest>/, async (ctx) => {
			console.log('APPROVED =>');

			if (await isStockman(ctx.from.username)) {
				const id = +ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				console.dir(messages);

				for (const message of messages) {
					const text = message.text + '\n' + '❌ Отклонено';
					ctx.telegram.editMessageText(text, {
						chat_id: message.chatId,
						message_id: message.id
					});
				}
			}
		});
	}
}
