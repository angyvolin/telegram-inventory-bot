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

		bot.hears('Просмотреть ячейки', async (ctx) => {
			if (await isStockman(ctx.from.username)) {
				await ctx.scene.enter('stockman/getAddresses');
			}
		});

		bot.hears('Отсутствующие позиции', async (ctx) => {
			if (await isStockman(ctx.from.username)) {
				await ctx.scene.enter('stockman/getAbsentItems');
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
				Stockman.confirmReturnInstruments(ctx);
			}
		});

		// Подтверждение возврата остатков (фурнитуры / расходников)
		bot.action(/^approveReturnRemains>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isStockman(ctx.from.username)) {
				Stockman.confirmReturnRemains(ctx);
			}
		});
	}
}
