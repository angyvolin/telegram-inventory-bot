import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestChiefPurchaseName = new Scene('chief/requestChiefPurchaseName');

requestChiefPurchaseName.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestChiefPurchaseName.enter(async (ctx: any) => {
	ctx.session.currentItem = {};
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'exit')]).extra();
	await ctx.reply('Введите название позиции', keyboard);
});

requestChiefPurchaseName.on('text', async (ctx: any) => {
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
		return ctx.scene.enter('chief/requestChiefPurchaseMeasure');	
	}
	await ctx.scene.enter('chief/requestChiefPurchaseAmount');
});

requestChiefPurchaseName.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchase');
});

export default requestChiefPurchaseName;
