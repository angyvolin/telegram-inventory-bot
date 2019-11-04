import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { sendItemWithLimits } from '../../helpers/handlers';

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
	const keyboard = Markup.inlineKeyboard([
		[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')],
		[Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип позиций, которые вы хотите получить', keyboard);
});

// Увеличение количества позиции на получение
requestGetting.action(/^increase>/, sendItemWithLimits);

// Подтверждение выбора позиции
requestGetting.action(/^accept>/, async (ctx: any) => {
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

	await ctx.scene.enter('worker/requestMoreItems');
});

requestGetting.action(/^manualCount>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	ctx.session.selectedItem = { type, id, itemAmount: amount };
	ctx.session.baseScene = ctx.scene.current.id;
	ctx.session.nextScene = 'worker/requestMoreItems';
	ctx.session.hasLimits = true;

	await ctx.answerCbQuery();
	await ctx.scene.enter('getItemCount');
});

requestGetting.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')],
		[Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип позиций, которые вы хотите получить', keyboard);
});

requestGetting.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestGetting;
