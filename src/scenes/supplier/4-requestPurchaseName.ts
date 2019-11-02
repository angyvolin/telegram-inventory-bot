import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestPurchaseName = new Scene('supplier/requestPurchaseName');

requestPurchaseName.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	ctx.session = {};
});

// Точка входа в сцену
requestPurchaseName.enter(async (ctx: any) => {
	ctx.session.currentItem = {};
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'exit')]).extra();
	await ctx.reply('Введите название позиции', keyboard);
});

requestPurchaseName.on('text', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session.currentItem.name = ctx.message.text;
	let isPresent = false;
	ctx.session.absent.forEach((item, index) => {
		if (item.name === ctx.session.currentItem.name) {
			isPresent = true;
		}
	});
	// Такая позиция уже есть в запросе,
	// переходим сразу к количеству
	if (!isPresent) {
		return ctx.scene.enter('supplier/requestPurchaseMeasure');
	}
	await ctx.scene.enter('supplier/requestPurchaseAmount');
});

requestPurchaseName.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchase');
});

export default requestPurchaseName;
