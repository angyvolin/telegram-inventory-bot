import * as api from 'telegraf';
import Worker from '../classes/Worker';
import Confirmation from '../models/confirmation';
import { isWorker } from '../helpers/persons';

const Markup = require('telegraf/markup');

export default class WorkerHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		// Обработчик для "Запросить получение"
		bot.hears('Запросить получение', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('worker/requestGetting');
			}
		});

		// Обработчик для "Запросить возврат инструментов"
		bot.hears('Запросить возврат инструментов', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('worker/requestReturnDate');
			}
		});

		// Обработчик для "Запросить возврат фурнитуры / расходников"
		bot.hears('Запросить возврат фурнитуры / расходников', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('worker/requestReturnRemains');
			}
		});

		// Обработчик для "Запросить списание инструментов"
		bot.hears('Запросить списание инструментов', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				ctx.session.items = [];
				await ctx.scene.enter('worker/requestRemoveInstrument');
			}
		});

		bot.action(/^declineGetting>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isWorker(ctx.from.username)) {
				const id = ctx.callbackQuery.data.split('>')[1];
				const confirmation = await Confirmation.findById(id);

				await confirmation.remove();

				const text = ctx.update.callback_query.message.text + '\n\n❌ Отклонено';
				await ctx.editMessageText(text);
			}
		});

		bot.action(/^confirmGetting>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isWorker(ctx.from.username)) {
				await Worker.confirmGetting(ctx);
			}
		});

		bot.action(/^confirmReturn>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isWorker(ctx.from.username)) {
				await Worker.confirmReturnInstruments(ctx);
			}
		});

		bot.action(/^confirmReturnRemains>/, async (ctx: any) => {
			await ctx.answerCbQuery();
			if (await isWorker(ctx.from.username)) {
				await Worker.confirmReturnRemains(ctx);
			}
		});
	}
}
