import * as api from 'telegraf';
import KeyboardMessage from '../controllers/keyboards';
import { PersonType } from '../classes/Person';
import { isChief } from '../helpers/persons';

export default class ChiefHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isChief(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.CHIEF);
			}
		});
	}
}
