import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import KeyboardMessage from '../controllers/keyboards';
import { getPersonType } from '../helpers/persons';
import { isAdmin } from '../helpers/functions';

export default class StartHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.start(async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				// Админ
				await AdminMessage.send(ctx);
				return;
			}
			const type = await getPersonType(ctx.from.username);
			if (type == null) {
				// Нету типа сотрудника
				await ctx.reply('Вам не назначено роли. Пожалуйста, обратитесь к администратору');
				return;
			}
			await KeyboardMessage.send(ctx, type);
		});
	}
}
