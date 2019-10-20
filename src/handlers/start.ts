import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isAdmin } from '../helpers/functions';
import { getPersonType, isWorker, isSupplier, isChief } from '../helpers/persons';

export default class StartHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.start(async (ctx: any) => {
			ctx.session.inlineResult = { counter: 0 };
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

		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isWorker(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.WORKER);
			} else if (await isSupplier(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
			} else if (await isChief(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.CHIEF);
			}
		});
	}
}
