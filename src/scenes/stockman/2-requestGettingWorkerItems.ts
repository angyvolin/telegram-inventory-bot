import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { sendItemWithLimits } from '../../helpers/handlers';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGettingWorkerItems = new Scene('stockman/requestGettingWorkerItems');

requestGettingWorkerItems.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingWorkerItems.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')],
		[Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип позиций, которые вы хотите получить', keyboard);
});

// Увеличение количества позиции на получение
requestGettingWorkerItems.action(/^increase>/, sendItemWithLimits);

// Подтверждение выбора позиции
requestGettingWorkerItems.action(/^accept>/, async (ctx: any) => {
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

	await ctx.scene.enter('stockman/requestGettingWorkerMore');
});

requestGettingWorkerItems.action(/^manualCount>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	ctx.session.selectedItem = { type, id, itemAmount: amount };
	ctx.session.baseScene = ctx.scene.current.id;
	ctx.session.nextScene = 'stockman/requestGettingWorkerMore';
	ctx.session.hasLimits = true;

	await ctx.answerCbQuery();
	await ctx.scene.enter('getItemCount');
});

requestGettingWorkerItems.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')],
		[Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип позиций, которые вы хотите получить', keyboard);
});

requestGettingWorkerItems.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('stockman/requestGettingUsername');
});

export default requestGettingWorkerItems;
