import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { sendItem } from '../../helpers/handlers';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestChiefPurchase = new Scene('chief/requestChiefPurchase');

requestChiefPurchase.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestChiefPurchase.enter(async (ctx: any) => {
	ctx.session.currentItem = {};
	const keyboard = Markup.inlineKeyboard([
		[
			Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i'),
			Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f')
		],
		[
			Markup.switchToCurrentChatButton('Расходники', 'incl_abs c'),
			Markup.callbackButton('Позиции нет в базе', 'absent')
		],
		[Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип позиций, которые Вы хотите закупить', keyboard);
});

// Увеличение количества позиции на закупку
requestChiefPurchase.action(/^increase>/, sendItem);

requestChiefPurchase.action(/^accept>/, async (ctx: any) => {
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

	// Такой позиции еще не было в запросе
	if (!isPresent) {
		ctx.session.currentItem = {
			type,
			id,
			amount
		};
		// Добавляем позицию в массив
		ctx.session.items.push(ctx.session.currentItem);
	}
	// Переходим на сцену запроса других
	// позиций для закупки
	return ctx.scene.enter('chief/requestChiefPurchaseMore');
});

requestChiefPurchase.action(/^manualCount>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	ctx.session.selectedItem = { type, id, itemAmount: amount };
	ctx.session.baseScene = ctx.scene.current.id;
	ctx.session.nextScene = 'chief/requestChiefPurchaseMore';
	ctx.session.hasLimits = false;

	await ctx.answerCbQuery();
	await ctx.scene.enter('getItemCount');
});

// При запросите позиции, которой нет в базе
requestChiefPurchase.action('absent', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchaseName');
});

requestChiefPurchase.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[
			Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i'),
			Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f')
		],
		[Markup.switchToCurrentChatButton('Расходники', 'incl_abs c'), Markup.callbackButton('⏪ Назад', 'exit')]
	]).extra();
	await ctx.replyWithMarkdown('Выберите тип позиций, которые Вы хотите поставить', keyboard);
});

requestChiefPurchase.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.CHIEF);
});

export default requestChiefPurchase;
