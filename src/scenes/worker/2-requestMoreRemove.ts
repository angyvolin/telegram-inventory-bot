import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestMoreRemove = new Scene('worker/requestMoreRemove');

requestMoreRemove.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestMoreRemove.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('Добавить еще', 'more'), Markup.callbackButton('Отправить запрос', 'finish')],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestMoreRemove.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemoveInstruments');
});

requestMoreRemove.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemoveList');
});

requestMoreRemove.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemoveInstruments');
});

export default requestMoreRemove;
