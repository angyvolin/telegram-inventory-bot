import * as api from 'telegraf';
import KeyboardMessage from '../controllers/keyboards';
import { PersonType } from '../classes/Person';
import { isSupplier } from '../helpers/persons';

export default class SupplierHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isSupplier(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
			}
		});
	}
}
