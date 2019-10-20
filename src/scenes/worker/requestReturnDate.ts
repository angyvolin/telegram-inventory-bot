import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса кол-ва дней аренды инструмента
 */
const requestReturnDate = new Scene('worker/requestReturnDate');

requestReturnDate.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnDate.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('На сколько дней Вы хотите арендовать инструмент(ы)?', keyboard);
});

requestReturnDate.on('text', async (ctx) => {
	const term = ctx.message.text.match(/\d+/);
	if (!term) {
		return ctx.reply('Вы ввели неверное количество дней. Попробуйте еще раз');
	}
	await ctx.scene.leave();
	const days = term[0];
	await Worker.requestGetting(ctx, ctx.from.id, ctx.from.username, ctx.session.items, days);
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

requestReturnDate.action('back', async (ctx: any) => {
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestGetting');
});

export default requestReturnDate;
