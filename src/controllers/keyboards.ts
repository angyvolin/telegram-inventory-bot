import * as api from 'telegraf';
import PersonType from '../enums/PersonType';

const Markup = require('telegraf/markup');

const buttons: any = {
	worker: [['Запросить получение', 'Запросить возврат'], ['Запросить списание инструмента']],
	supplier: [],
	chief: []
};

export default class KeyboardMessage {
	private static worker = Markup.keyboard(buttons.worker)
		.oneTime()
		.resize()
		.extra();
	private static supplier = Markup.keyboard(buttons.supplier)
		.oneTime()
		.resize()
		.extra();
	private static chief = Markup.keyboard(buttons.chief)
		.oneTime()
		.resize()
		.extra();
	public static async send(ctx: api.ContextMessageUpdate, type: PersonType): Promise<void> {
		switch (type) {
			case PersonType.WORKER: {
				await ctx.reply('Добро пожаловать, работник!', this.worker);
				break;
			}
			case PersonType.SUPPLIER: {
				await ctx.reply('Добро пожаловать, поставщик!', this.supplier);
				break;
			}
			case PersonType.CHIEF: {
				await ctx.reply('Добро пожаловать, начальник!', this.chief);
				break;
			}
		}
	}
}
