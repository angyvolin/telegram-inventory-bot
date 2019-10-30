import Stockman from '../classes/Stockman';
import Confirmation from '../models/confirmation';
import { isStockman, isChief } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class CommonHandlers {
	public static init(bot) {
		bot.hears('Просмотреть ячейки', async (ctx) => {
			if (await isStockman(ctx.from.username) || await isChief(ctx.from.username)) {
				await ctx.scene.enter('getAddresses');
			}
		});
	}
}
