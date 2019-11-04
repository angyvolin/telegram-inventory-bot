import * as api from 'telegraf';

const Markup = require('telegraf/markup');

export default class AdminMessage {
	public static keyboard1 = Markup.keyboard([
		['Рассылка 📡', 'Статистика 📊'],
		['Добавить роль 🤵', 'Добавить админа 👔'],
		['Список админов 📃', 'Добавить позицию ➕'],
		['Страница 2 ⏩']
	])
		.oneTime()
		.resize()
		.extra();

	public static keyboard2 = Markup.keyboard([
		['Просмотреть ячейки', 'Отсутствующие позиции'],
		['Добавить фото к позиции', 'Запросить выдачу позиций работнику'],
		['Создать запрос на закупку', 'Просмотреть должников'],
		['⏪ Страница 1', 'Страница 3 ⏩']
	])
		.oneTime()
		.resize()
		.extra();

	public static keyboard3 = Markup.keyboard([
		['Запросить получение', 'Запросить возврат инструментов'],
		['Запросить возврат фурнитуры / расходников', 'Списать инструменты'],
		['⏪ Страница 2']
	])
		.oneTime()
		.resize()
		.extra();

	public static async send(ctx: api.ContextMessageUpdate,
							 message: string = 'Выберите действие',
							 page: number = 1): Promise<void> {
		switch (page) {
			case 1: {
				await ctx.reply(message, this.keyboard1);
				break;
			}
			case 2: {
				await ctx.reply(message, this.keyboard2);
				break;
			}
			case 3: {
				await ctx.reply(message, this.keyboard3);
				break;
			}
		}
	}
}
