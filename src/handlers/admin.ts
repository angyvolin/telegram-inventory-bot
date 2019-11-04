import * as api from 'telegraf';
import Admin from '../classes/Admin';
import AdminMessage from '../controllers/admin';
import AdminsHelpMessage from '../controllers/adminHelp';
import AdminsListMessage from '../controllers/adminsList';
import StatsMessage from '../controllers/stats';
import { isAdmin } from '../helpers/functions';

export default class AdminHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		// Обрадотчик для "/admin"
		bot.command('admin', async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx);
			}
		});

		// Обработчик для "Рассылка"
		bot.hears('Рассылка 📡', async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await ctx.scene.enter('gsend');
			}
		});

		// Обработчик для "Статистика"
		bot.hears('Статистика 📊', async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await StatsMessage.send(ctx);
			}
		});

		// Обработчик для "Добавить позицию"
		bot.hears('Добавить позицию ➕', async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await ctx.scene.enter('addItem/getItemType');
			}
		});

		// Обработчик для "Добавить роль"
		bot.hears('Добавить роль 🤵', async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await ctx.scene.enter('addPerson/getPersonRole');
			}
		});

		// Обработчик для "Добавить админа"
		bot.hears('Добавить админа 👔', async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await ctx.scene.enter('addAdmins');
			}
		});

		// Обработчик для "Список админов"
		bot.hears('Список админов 📃', async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminsListMessage.send(ctx);
			}
		});

		// Обработчик для перехода на страницу 1
		bot.hears(/Страница 1/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx);
			}
		});

		// Обработчик для перехода на страницу 1
		bot.hears(/Страница 2/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx, 'Выберите действие', 2);
			}
		});

		// Обработчик для перехода на страницу 1
		bot.hears(/Страница 3/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx, 'Выберите действие', 3);
			}
		});

		bot.action(/^approveRemove>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isAdmin(ctx.from.id)) {
				Admin.confirmRemoveInstruments(ctx);
			}
		});

		bot.action(/^approvePurchase>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isAdmin(ctx.from.id)) {
				Admin.confirmPurchase(ctx);
			}
		});

		bot.action(/^approveChiefPurchase>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isAdmin(ctx.from.id)) {
				Admin.confirmChiefPurchase(ctx);
			}
		});
	}
}
