import * as api from 'telegraf';
import PersonType from '../enums/PersonType';

const Markup = require('telegraf/markup');

const buttons: any = {
	worker: [['Запросить получение', 'Запросить возврат'], ['Запросить списание']],
	supplier: [
		['Запросить закупку товара', 'Запросить поставку в склад'],
		['Добавить позицию в базу', 'Добавить фото к позиции']
	],
	stockman: [
		['Просмотреть ячейки', 'Отсутствующие позиции'],
		['Переместить позиции по складу', 'Создать выдачу работнику'],
		['Добавить фото к позиции']
	],
	chief: [['Просмотреть ячейки', 'Запросить выдачу позиций работнику'], ['Создать запрос на закупку']]
};

export default class KeyboardMessage {
	public static worker = Markup.keyboard(buttons.worker)
		.oneTime()
		.resize()
		.extra();
	public static supplier = Markup.keyboard(buttons.supplier)
		.oneTime()
		.resize()
		.extra();
	public static stockman = Markup.keyboard(buttons.stockman)
		.oneTime()
		.resize()
		.extra();
	public static chief = Markup.keyboard(buttons.chief)
		.oneTime()
		.resize()
		.extra();
	public static async send(
		ctx: api.ContextMessageUpdate,
		type: PersonType,
		message: string = 'Выберите действие'
	): Promise<void> {
		switch (type) {
			case PersonType.WORKER: {
				await ctx.replyWithMarkdown(message, this.worker);
				break;
			}
			case PersonType.SUPPLIER: {
				await ctx.replyWithMarkdown(message, this.supplier);
				break;
			}
			case PersonType.STOCKMAN: {
				await ctx.replyWithMarkdown(message, this.stockman);
				break;
			}
			case PersonType.CHIEF: {
				await ctx.replyWithMarkdown(message, this.chief);
				break;
			}
		}
	}
}
