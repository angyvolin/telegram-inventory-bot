import Chief from '../../classes/Chief';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса кол-ва дней аренды инструмента
 */
const requestGettingTerm = new Scene('chief/requestGettingTerm');

requestGettingTerm.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingTerm.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back'),
											Markup.callbackButton('❌ В выдаче нет инструментов', 'finish')]).extra();
	await ctx.replyWithMarkdown('На сколько дней Вы хотите выдать инструмент(ы)?', keyboard);
});

requestGettingTerm.on('text', async (ctx) => {
	const term = ctx.message.text.match(/\d+/);
	if (!term) {
		return ctx.reply('Вы ввели неверное количество дней. Попробуйте еще раз');
	}
	const days = term[0];
	await ctx.scene.leave();
	await Chief.requestGetting(ctx, ctx.session.table, ctx.session.username, days);
	return KeyboardMessage.send(ctx, PersonType.CHIEF, 'Ваша заявка успешно отправлена! Ожидайте подтверждения выдачи кладовщика');
});

requestGettingTerm.action('finish', async (ctx: any) => {
	await ctx.scene.leave();
	await Chief.requestGetting(ctx, ctx.session.table, ctx.session.username);
	return KeyboardMessage.send(ctx, PersonType.CHIEF, 'Ваша заявка успешно отправлена! Ожидайте подтверждения выдачи кладовщика');
});

requestGettingTerm.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingWorker');
});


export default requestGettingTerm;
