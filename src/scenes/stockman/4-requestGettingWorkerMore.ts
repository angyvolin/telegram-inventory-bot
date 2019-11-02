import Stockman from '../../classes/Stockman';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestGettingWorkerMore = new Scene('stockman/requestGettingWorkerMore');

requestGettingWorkerMore.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingWorkerMore.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('Добавить еще', 'more'), Markup.callbackButton('Отправить запрос', 'finish')],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestGettingWorkerMore.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('stockman/requestGettingWorkerItems');
});

requestGettingWorkerMore.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;

	for (let item of items) {
		if (item.type === ItemType.INSTRUMENT) {
			return ctx.scene.enter('stockman/requestGettingWorkerDate');
		}
	}
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN, 'Получение успешно создано! Ожидайте работника');
	return Stockman.requestGetting(ctx, ctx.session.items, ctx.session.username);
});

requestGettingWorkerMore.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('stockman/requestGettingWorkerItems');
});

export default requestGettingWorkerMore;
