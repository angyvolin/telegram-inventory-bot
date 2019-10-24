import * as api from 'telegraf';
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

		// Обработчик для "Справка админа"
		bot.hears('Справка админа 💡', async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminsHelpMessage.send(ctx);
			}
		});
	}
}
