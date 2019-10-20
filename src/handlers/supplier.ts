import * as api from 'telegraf';
import Supplier from '../classes/Supplier';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isSupplier } from '../helpers/persons';

export default class SupplierHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		// Обработчик для "Запросить закупку"
		bot.hears('Запросить закупку', async (ctx: any) => {
			if (await isSupplier(ctx.from.username)) {
				await ctx.scene.enter('supplier/requestPurchase');
			}
		});

		// Обработчик для "Запросить поставку в склад"
		bot.hears('Запросить поставку в склад', async (ctx: any) => {
			if (await isSupplier(ctx.from.username)) {
				await ctx.scene.enter('supplier/requestSupply');
			}
		});

		bot.action(/^confirmGetting>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isSupplier(ctx.from.username)) {
				await Supplier.confirmSupply(ctx);
			}
		});
	}
}
