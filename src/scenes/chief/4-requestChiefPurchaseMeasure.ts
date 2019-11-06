import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestChiefPurchaseMeasure = new Scene('chief/requestChiefPurchaseMeasure');

requestChiefPurchaseMeasure.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

requestChiefPurchaseMeasure.enter(async (ctx: any) => {
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

requestChiefPurchaseMeasure.on('text', async (ctx: any) => {
	ctx.session.currentItem.measure = ctx.message.text;
	await ctx.scene.leave();
	// await KeyboardMessage.send(ctx, PersonType.CHIEF);
	await ctx.scene.enter('chief/requestChiefPurchaseAmount');
});

requestChiefPurchaseMeasure.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchaseName');
});

requestChiefPurchaseMeasure.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	ctx.session.addItem.itemMeasure = ctx.callbackQuery.data;
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchaseAmount');
});

export default requestChiefPurchaseMeasure;
