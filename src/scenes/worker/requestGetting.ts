import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGetting = new Scene('worker/requestGetting');

requestGetting.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestGetting.enter(async (ctx: any) => {
	ctx.session.items = [];
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')], [Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.action('back', async (ctx: any) => {
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

requestGetting.action(/^accept>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];
	const item = {
		type,
		id,
		amount
	};
	ctx.session.items.push(item);

	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Добавить еще', 'more'), Markup.callbackButton('Отправить запрос', 'finish')], [Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestGetting.action('more', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')], [Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.action('finish', async (ctx: any) => {
	await ctx.scene.leave();
	const { items } = ctx.session;

	for (let item of items) {
		if (item.type === ItemType.INSTRUMENT) {
			return ctx.scene.enter('worker/requestReturnDate');
		}
	}
	await Worker.requestGetting(ctx, ctx.from.id, ctx.from.username, ctx.session.items);
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestGetting;
