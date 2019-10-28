import Supplier from '../../classes/Supplier';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestPurchaseMore = new Scene('supplier/requestPurchaseMore');

requestPurchaseMore.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	ctx.session = {};
});

// Точка входа в сцену
requestPurchaseMore.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Добавить еще', 'more'),
											 Markup.callbackButton('Отправить запрос', 'finish')],
											[Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestPurchaseMore.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchase');
});

requestPurchaseMore.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;
	//await ctx.reply('Ваша заявка на поставку успешно отправлена!');
	await Supplier.requestPurchase(ctx, ctx.session.items);
	return KeyboardMessage.send(ctx, PersonType.SUPPLIER, 'Ваша заявка на закупку успешно отправлена!');
});

requestPurchaseMore.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('supplier/requestPurchase');
});

export default requestPurchaseMore;
