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
		'Какая величина измерения?\nЕсли нужной единицы нет в списке, введите ее с клавиатуры 👇' /*, keyboard*/
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

export default requestPurchaseMeasure;
