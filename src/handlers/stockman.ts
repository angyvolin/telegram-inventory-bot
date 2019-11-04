import Stockman from '../classes/Stockman';
import Confirmation from '../models/confirmation';
import { isStockman } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class StockmanHandlers {
	public static init(bot) {
		bot.hears('Переместить позиции по складу', async (ctx) => {
			if (await isStockman(ctx.from.username)) {
				await ctx.scene.enter('stockman/getMoveItem');
			}
		});

		bot.hears('Создать выдачу работнику', async (ctx) => {
			if (await isStockman(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('stockman/requestGettingUsername');
			}
		});

		// Подтверждение выдачи работнику
		bot.action(/^approveGiving>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmGiving(ctx);
			}
		});

		// Подтверждение поставки в склад
		bot.action(/^approveSupply>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmSupply(ctx);
			}
		});

		// Подтверждение возврата инструментов
		bot.action(/^approveReturn>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmReturn(ctx);
			}
		});
	}
}
