import * as api from 'telegraf';
import Admin from '../classes/Admin';
import Confirmation from '../models/confirmation';
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

		// Отклонение запроса
		bot.action(/^declineRequest>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isAdmin(ctx.from.id)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);
				const messages = confirmation.messages;

				for (const message of messages) {
					const text = confirmation.text + '\n' + '❌ Отклонено';
					await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
				}

				const message = confirmation.itemsText ? confirmation.itemsText : confirmation.text;
				const text = '❌ Ваша заявка была отклонена:\n\n' + message;

				await confirmation.remove();
				await ctx.telegram.sendMessage(confirmation.chatId, text, { parse_mode: 'Markdown' });
			}
		});

		bot.action(/^approveRemove>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isAdmin(ctx.from.id)) {
				Admin.confirmRemoveInstruments(ctx);
			}
		});
	}
}
