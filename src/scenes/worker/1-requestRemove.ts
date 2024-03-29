import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { sendItem } from '../../helpers/handlers';
import { isAdmin } from '../../helpers/functions';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestRemove = new Scene('worker/requestRemove');

requestRemove.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestRemove.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[
			Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i'),
			Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f')
		],
		[Markup.switchToCurrentChatButton('Расходники', 'incl_abs c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.reply('Выберите позиции, которые вы хотите списать', keyboard);
});

// Увеличение количества инструментов на списание
requestRemove.action(/^increase>/, sendItem);

// Подтверждение выбора инструментов
requestRemove.action(/^accept>/, async (ctx: any) => {
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

	await ctx.scene.enter('worker/requestMoreRemove');
});

requestRemove.action(/^manualCount>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	ctx.session.selectedItem = { type, id, itemAmount: amount };
	ctx.session.baseScene = ctx.scene.current.id;
	ctx.session.nextScene = 'worker/requestMoreRemove';
	ctx.session.hasLimits = false;

	await ctx.answerCbQuery();
	await ctx.scene.enter('getItemCount');
});

requestRemove.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[
			Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i'),
			Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f')
		],
		[Markup.switchToCurrentChatButton('Расходники', 'incl_abs c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.reply('Выберите позиции, которые вы хотите списать', keyboard);
});

requestRemove.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestRemove;
