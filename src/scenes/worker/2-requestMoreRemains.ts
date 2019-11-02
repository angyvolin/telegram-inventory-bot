import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestMoreRemains = new Scene('worker/requestMoreRemains');

requestMoreRemains.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestMoreRemains.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('Добавить еще', 'more'), Markup.callbackButton('Отправить запрос', 'finish')],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestMoreRemains.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnRemains');
});

requestMoreRemains.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;
	//await ctx.reply('Ваша заявка успешно отправлена! Отправляйтесь на возврат');
	await Worker.requestReturnRemains(ctx, ctx.session.items);
	return KeyboardMessage.send(ctx, PersonType.WORKER, 'Ваша заявка успешно отправлена! Отправляйтесь на возврат');
});

requestMoreRemains.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnRemains');
});

export default requestMoreRemains;
