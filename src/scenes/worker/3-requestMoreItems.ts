import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestMoreItems = new Scene('worker/requestMoreItems');

requestMoreItems.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestMoreItems.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('Добавить еще', 'more'), Markup.callbackButton('Отправить запрос', 'finish')],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestMoreItems.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestGetting');
});

requestMoreItems.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;

	for (let item of items) {
		if (item.type === ItemType.INSTRUMENT) {
			return ctx.scene.enter('worker/requestGettingDate');
		}
	}
	//await ctx.reply('Ваша заявка успешно отправлена! Отправляйтесь на получение');
	await Worker.requestGetting(ctx, ctx.session.items);
	return KeyboardMessage.send(ctx, PersonType.WORKER, 'Ваша заявка успешно отправлена! Отправляйтесь на получение');
});

requestMoreItems.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestGetting');
});

export default requestMoreItems;
