import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import Supplier from '../../classes/Supplier';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestPurchase = new Scene('supplier/requestPurchase');

requestPurchase.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	ctx.session = {};
});

// Точка входа в сцену
requestPurchase.enter(async (ctx: any) => {
	ctx.session.currentItem = {};
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f')],
											[Markup.switchToCurrentChatButton('Расходники', 'incl_abs c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые Вы хотите закупить', keyboard);
});

requestPurchase.action(/^increase>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = parseInt(ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text);

	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`),
											 Markup.callbackButton(counter + 1, 'itemAmount'),
											 Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)],
											[Markup.callbackButton('⏪ Назад', 'back'),
											 Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + 1}`)]]);

	await ctx.editMessageReplyMarkup(keyboard);
	await ctx.answerCbQuery();
});

requestPurchase.action(/^reduce>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = parseInt(ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text);

	if (counter > 1) {
		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`),
												 Markup.callbackButton(counter - 1, 'itemAmount'),
												 Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)],
												[Markup.callbackButton('⏪ Назад', 'back'),
												 Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + 1}`)]]);

		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`Значение должно быть больше нуля`, false);
	}
});

requestPurchase.action(/^accept>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();

	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	let flag = false;
	ctx.session.items.forEach((item, index) => {
		if (item.type === type && item.id === id) {
			ctx.session.items[index].amount += amount;
			flag = true;
		}
	});

	// Такой позиции еще не было в запросе
	if (!flag) {
		ctx.session.currentItem = {
			type,
			id,
			amount
		};
		// Переходим на сцену запроса цены позиции
		return ctx.scene.enter('supplier/requestPurchasePrice');
	}

	// Такая позиция уже была в запросе,
	// переходим на сцену запроса других
	// позиций для закупки
	return ctx.scene.enter('supplier/requestPurchaseMore');
});

requestPurchase.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'incl_abs f')],
											[Markup.switchToCurrentChatButton('Расходники', 'incl_abs c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые Вы хотите поставить', keyboard);
});

requestPurchase.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.SUPPLIER);
});

export default requestPurchase;
