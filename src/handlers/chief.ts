import * as api from 'telegraf';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isChief } from '../helpers/persons';

export default class ChiefHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		// Обработчик для "Запросить выдачу позиций работнику"
		bot.hears('Запросить выдачу позиций работнику', async (ctx: any) => {
			if (await isChief(ctx.from.username)) {
				await ctx.scene.enter('chief/requestGettingTable');
			}
		});
	}
}
