import Stockman from '../classes/Stockman';
import Confirmation from '../models/confirmation';
import { isAdmin } from '../helpers/functions';
import { isStockman, isSupplier, isChief } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class CommonHandlers {
	public static init(bot) {
		bot.hears('Просмотреть ячейки', async (ctx) => {
			if (
				(await isStockman(ctx.from.username)) ||
				(await isChief(ctx.from.username)) ||
				(await isAdmin(ctx.from.id))
			) {
				await ctx.scene.enter('getAddresses');
			}
		});

		bot.hears('Отсутствующие позиции', async (ctx) => {
			if ((await isStockman(ctx.from.username)) || (await isAdmin(ctx.from.id))) {
				await ctx.scene.enter('getAbsentItems');
			}
		});

		bot.hears('Добавить фото к позиции', async (ctx) => {
			if (
				(await isStockman(ctx.from.username)) ||
				(await isSupplier(ctx.from.username)) ||
				(await isAdmin(ctx.from.id))
			) {
				await ctx.scene.enter('addPhoto/getItem');
			}
		});
	}
}
