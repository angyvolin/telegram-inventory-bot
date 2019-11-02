import Chief from '../../classes/Chief';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestChiefPurchaseMore = new Scene('chief/requestChiefPurchaseMore');

requestChiefPurchaseMore.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestChiefPurchaseMore.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Добавить еще', 'more'),
											 Markup.callbackButton('Отправить запрос', 'finish')],
											[Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestChiefPurchaseMore.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchase');
});

requestChiefPurchaseMore.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await Chief.requestPurchase(ctx, ctx.session.items, ctx.session.absent);
	return KeyboardMessage.send(ctx, PersonType.CHIEF, 'Ваша заявка на закупку успешно отправлена!');
});

requestChiefPurchaseMore.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchase');
});

export default requestChiefPurchaseMore;
