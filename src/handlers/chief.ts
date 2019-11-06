import * as api from 'telegraf';
import Stockman from '../classes/Stockman';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isChief } from '../helpers/persons';
import { isAdmin } from '../helpers/functions';

export default class ChiefHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		// Обработчик для "Запросить выдачу позиций работнику"
		bot.hears('Запросить выдачу позиций работнику', async (ctx: any) => {
			if ((await isChief(ctx.from.username)) || (await isAdmin(ctx.from.id))) {
				await ctx.scene.enter('chief/requestGettingTable');
			}
		});

		// Обработчик для "Создать запрос на закупку"
		bot.hears('Создать запрос на закупку', async (ctx: any) => {
			if ((await isChief(ctx.from.username)) || (await isAdmin(ctx.from.id))) {
				ctx.session.items = [];
				ctx.session.absent = [];
				await ctx.scene.enter('chief/requestChiefPurchase');
			}
		});
	}
}
