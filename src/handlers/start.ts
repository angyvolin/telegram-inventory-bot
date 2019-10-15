import * as api from 'telegraf';
import { PersonType } from '../classes/Person';
import { getPersonType } from '../helpers/persons';

export default class Start {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.start(async (ctx: api.ContextMessageUpdate) => {
			const type = await getPersonType(ctx.from.username);
			const message = type ? PersonType[type] : 'Вам не назначено роли. ' + 'Пожалуйста, обратитесь к администратору';
			await ctx.reply(message);
		});
	}
}
