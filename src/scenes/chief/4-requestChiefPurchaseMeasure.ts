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
	/*const keyboard = Markup.keyboard([
		Markup.button('шт.'),
		Markup.button('г.'),
		Markup.button('см.'),
		Markup.button('м^2.'),
		Markup.button('м^3.'),
		Markup.button('л.'),
		Markup.button('⏪ Назад')
	], {columns: 2}).extra();*/

	await ctx.replyWithMarkdown(
		'Какая величина измерения?\nВведите ее с клавиатуры 👇' /*, keyboard*/
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

export default requestChiefPurchaseMeasure;
