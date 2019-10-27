import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import Supplier from '../../classes/Supplier';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestSupply = new Scene('supplier/requestSupply');

requestSupply.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.SUPPLIER);
	ctx.session = {};
});

// Точка входа в сцену
requestSupply.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'f')],
											[Markup.switchToCurrentChatButton('Расходники', 'c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые Вы хотите поставить', keyboard);
});

requestSupply.action(/^increase>/, async (ctx: any) => {
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

requestSupply.action(/^reduce>/, async (ctx: any) => {
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

requestSupply.action(/^accept>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];
	const item = {
		type,
		id,
		amount
	};
	ctx.session.items.push(item);
	await ctx.answerCbQuery();

	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Добавить еще', 'more'),
											 Markup.callbackButton('Отправить запрос', 'finish')],
											[Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в поставку?', keyboard);
});

requestSupply.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'f')],
											[Markup.switchToCurrentChatButton('Расходники', 'c'),
											 Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые Вы хотите поставить', keyboard);
});

requestSupply.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;

	await ctx.reply('Ваша заявка успешно отправлена! Ожидайте подтверждения от кладовщика');
	await Supplier.requestSupply(ctx, ctx.from.id, ctx.from.username, items);
	return KeyboardMessage.send(ctx, PersonType.SUPPLIER);
});

requestSupply.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'f')],
											[Markup.switchToCurrentChatButton('Расходники', 'c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые Вы хотите поставить', keyboard);
});

requestSupply.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.SUPPLIER);
});

export default requestSupply;
