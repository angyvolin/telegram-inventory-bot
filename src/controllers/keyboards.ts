import * as api from 'telegraf';
import PersonType from '../enums/PersonType';

const Markup = require('telegraf/markup');

const buttons: any = {
	worker: [['Запросить получение', 'Запросить возврат инструментов'],
			 ['Запросить возврат фурнитуры / расходников', 'Запросить списание инструментов']],
	supplier: [['Запросить закупку', 'Запросить поставку в склад'],
			   ['Добавить позицию в базу']],
	stockman: [['Просмотреть ячейки', 'Отсутствующие позиции'],
			   ['Переместить позиции по складу']],
	chief: ['Запросить выдачу позиций работнику']
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
	public static async send(ctx: api.ContextMessageUpdate, type: PersonType): Promise<void> {
		switch (type) {
			case PersonType.WORKER: {
				await ctx.reply('Выберите действие', this.worker);
				break;
			}
			case PersonType.SUPPLIER: {
				await ctx.reply('Выберите действие', this.supplier);
				break;
			}
			case PersonType.STOCKMAN: {
				await ctx.reply('Выберите действие', this.stockman);
				break;
			}
			case PersonType.CHIEF: {
				await ctx.reply('Выберите действие', this.chief);
				break;
			}
		}
	}
}
