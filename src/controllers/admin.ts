import * as api from 'telegraf';

const Markup = require('telegraf/markup');

export default class AdminMessage {
	public static keyboard = Markup.keyboard([['Рассылка 📡', 'Статистика 📊'], ['Добавить роль 🤵', 'Добавить админа 👔'], ['Список админов 📃', 'Добавить позицию ➕']])
		.oneTime()
		.resize()
		.extra();

	public static async send(ctx: api.ContextMessageUpdate): Promise<void> {
		await ctx.reply('Добро пожаловать, админ!', this.keyboard);
	}
}
