import * as api from 'telegraf';

export default class Start {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		bot.start(async (ctx: api.ContextMessageUpdate) => await ctx.reply('Heyyyyy'));
	}
}
