import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const requestPurchasePrice = new Scene('supplier/requestPurchasePrice');

requestPurchasePrice.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	ctx.session = {};
});

// Точка входа в сцену
requestPurchasePrice.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите цену за одну единицу (с валютой)', keyboard);
});

requestPurchasePrice.on('text', async (ctx: any) => {
	// Записываем цену за единицу в
	// объект с текущей позицией
	ctx.session.currentItem.price = ctx.message.text;
	// Пушим эту позицию
	if (ctx.session.currentItem.id) {
		ctx.session.items.push(ctx.session.currentItem);		
	} else {	
		ctx.session.absent.push(ctx.session.currentItem);
	}
	// Очищаем текущую позицию в сессии
	ctx.session.currentItem = {};
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchaseMore');
});

requestPurchasePrice.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchase');
});

export default requestPurchasePrice;
