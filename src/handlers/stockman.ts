import * as api from 'telegraf';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isStockman } from '../helpers/persons';

export default class StockmanHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isStockman(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
			}
		});
	}
}
