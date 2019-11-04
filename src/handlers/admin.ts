import * as api from 'telegraf';
import Admin from '../classes/Admin';
import AdminMessage from '../controllers/admin';
import AdminsListMessage from '../controllers/adminsList';
import StatsMessage from '../controllers/stats';
import { getUsernameByChatId, isAdmin } from '../helpers/functions';
import Getting from '../models/getting';
import Person from '../models/person';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';

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

		bot.hears('Просмотреть должников', async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				const gettings = await Getting.find({active: true});

				if (!gettings.length) {
					return ctx.reply('На данный момент должников нет');
				}
				let message = '*Список должников:*\n\n';
				for (let getting of gettings) {
					let person = await Person.findOne({
						username: await getUsernameByChatId(getting.chatId)
					});

					message += `🔹 ${person.fullName}:\n`;

					if (getting.instruments) {
						for (let item of getting.instruments) {
							const {name, measure} = await Instrument.getItem(item[0]);
							message += `${name} – ${item[1]} ${measure}\n`;
						}
					}

					if (getting.furniture) {
						for (let item of getting.furniture.entries()) {
							const {name, measure} = await Furniture.getItem(item[0]);
							message += `${name} – ${item[1]} ${measure}\n`;
						}
					}

					if (getting.consumables) {
						for (let item of getting.consumables.entries()) {
							const {name, measure} = await Consumable.getItem(item[0]);
							message += `${name} – ${item[1]} ${measure}\n`;
						}
					}

					message += '\n';
				}
				await ctx.replyWithMarkdown(message);
			}
		});

		// Обработчик для перехода на страницу 1
		bot.hears(/Страница 1/, async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx);
			}
		});

		// Обработчик для перехода на страницу 1
		bot.hears(/Страница 2/, async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx, 'Выберите действие', 2);
			}
		});

		// Обработчик для перехода на страницу 1
		bot.hears(/Страница 3/, async (ctx: any) => {
			if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx, 'Выберите действие', 3);
			}
		});

		bot.action(/^approveRemove>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isAdmin(ctx.from.id)) {
				Admin.confirmRemove(ctx);
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
