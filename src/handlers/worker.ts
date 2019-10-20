import * as api from 'telegraf';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isWorker } from '../helpers/persons';

export default class WorkerHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.command('keyboard', async (ctx: api.ContextMessageUpdate) => {
			if (await isWorker(ctx.from.username)) {
				await KeyboardMessage.send(ctx, PersonType.WORKER);
			}
		});

		// Обработчик для "Запросить получение"
		bot.hears('Запросить получение', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				await ctx.scene.enter('worker/requestGetting');
			}
		});

		// Обработчик для "Запросить возврат"
		bot.hears('Запросить возврат', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				await ctx.scene.enter('worker/requestReturn');
			}
		});

		// Обработчик для "Запросить списание инструмента"
		bot.hears('Запросить списание инструмента', async (ctx: any) => {
			if (await isWorker(ctx.from.username)) {
				await ctx.scene.enter('worker/requestRemoveInstrument');
			}
		});
	}
}
