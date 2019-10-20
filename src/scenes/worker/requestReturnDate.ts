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
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('❌ Отменить', 'cancel')
	]).extra();
	await ctx.replyWithMarkdown('На сколько дней Вы хотите арендовать инструмент(ы)?', keyboard);
});

requestReturnDate.on('text', async ctx => {
	const term = ctx.message.text.match(/\d+/)[0];
	console.log(term);
	// ...
});

requestReturnDate.action('cancel', async (ctx: any) => {
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestGetting');
});

export default requestReturnDate;
