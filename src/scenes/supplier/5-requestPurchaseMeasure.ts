import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestPurchaseMeasure = new Scene('supplier/requestPurchaseMeasure');

requestPurchaseMeasure.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	ctx.session = {};
});

requestPurchaseMeasure.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('шт.', 'шт.'),
		Markup.callbackButton('г.', 'г.'),
		Markup.callbackButton('см.', 'см.'),
		Markup.callbackButton('м^2.', 'м^2'),
		Markup.callbackButton('м^3.', 'м^3'),
		Markup.callbackButton('л.', 'л.'),
		Markup.callbackButton('⏪ Назад', 'back')
	], { columns: 2 }).extra();

	await ctx.replyWithMarkdown(
		'Какая величина измерения?\nВведите ее с клавиатуры или выберите из списка', keyboard
	);
});

requestPurchaseMeasure.on('text', async (ctx: any) => {
	ctx.session.currentItem.measure = ctx.message.text;
	await ctx.scene.leave();
	// await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	await ctx.scene.enter('supplier/requestPurchaseAmount');
});

requestPurchaseMeasure.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchaseName');
});

requestPurchaseMeasure.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	ctx.session.currentItem.measure = ctx.callbackQuery.data;
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchaseAmount');
});

export default requestPurchaseMeasure;
