import * as api from 'telegraf';
import Supplier from '../classes/Supplier';
import { isSupplier } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class SupplierHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		// Обработчик для "Запросить закупку"
		bot.hears('Запросить закупку', async (ctx: any) => {
			if (await isSupplier(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('supplier/requestPurchase');
			}
		});

		// Обработчик для "Запросить поставку в склад"
		bot.hears('Запросить поставку в склад', async (ctx: any) => {
			if (await isSupplier(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('supplier/requestSupply');
			}
		});

		// Обработчик для "Добавить позицию в базу"
		bot.hears('Добавить позицию в базу', async (ctx: any) => {
			if (await isSupplier(ctx.from.username)) {
				await ctx.scene.enter('addItem/getItemType');
			}
		});

		// Подтверждение закупки
		bot.action(/^confirmPurchase>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isSupplier(ctx.from.username)) {
				Supplier.confirmPurchase(ctx);
			}
		});

		// Подтверждение поставки в склад
		bot.action(/^confirmSupply>/, async (ctx) => {
			await ctx.answerCbQuery();
			if (await isSupplier(ctx.from.username)) {
				Supplier.confirmSupply(ctx);
			}
		});
	}
}
