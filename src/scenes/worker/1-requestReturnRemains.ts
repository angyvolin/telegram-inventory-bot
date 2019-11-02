import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { sendItem } from '../../helpers/handlers';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnRemains = new Scene('worker/requestReturnRemains');

requestReturnRemains.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnRemains.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[
			Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f'),
			Markup.switchToCurrentChatButton('Расходники', 'incl_abs c')
		],
		[Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип предметов, которые вы хотите вернуть', keyboard);
});

requestReturnRemains.action(/^increase>/, sendItem);

requestReturnRemains.action(/^accept>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();

	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	let isPresent = false;
	ctx.session.items.forEach((item, index) => {
		if (item.type === type && item.id === id) {
			ctx.session.items[index].amount += amount;
			isPresent = true;
		}
	});

	if (!isPresent) {
		const item = {
			type,
			id,
			amount
		};
		ctx.session.items.push(item);
	}

	await ctx.scene.enter('worker/requestMoreRemains');
});

requestReturnRemains.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[
			Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f'),
			Markup.switchToCurrentChatButton('Расходники', 'incl_abs c')
		],
		[Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип предметов, которые вы хотите вернуть', keyboard);
});

requestReturnRemains.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestReturnRemains;
