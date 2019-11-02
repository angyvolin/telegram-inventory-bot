import * as api from 'telegraf';
import Stockman from '../classes/Stockman';
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

		// Обработчик для "Согласовать закупку товара"
		bot.hears('Согласовать закупку товара', async (ctx: any) => {
			if (await isChief(ctx.from.username)) {
				ctx.session.items = [];
				ctx.session.absent = [];
				await ctx.scene.enter('chief/requestChiefPurchase');
			}
		});
	}
}
