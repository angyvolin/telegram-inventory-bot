import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import { dismissAdmin, isAdmin } from '../helpers/functions';
import Logger from '../init/logger';

export default class CallbackQuery {
	public static init(bot: any) {
		// Обработчик callback запроса на устранение админа
		bot.action(/^dismiss>[0-9]+$/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				try {
					await dismissAdmin(+ctx.callbackQuery.data.split('>')[1]);
					ctx.answerCbQuery();
					ctx.reply('Админ успешно отстранён ✔️', AdminMessage.keyboard);
				} catch (err) {
					Logger.error(err);
					ctx.answerCbQuery();
					ctx.reply('Не удалось отстранить админа, приносим извинения', AdminMessage.keyboard);
				}
			}
		});
	}
}
