import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestRemoveInstruments = new Scene('worker/requestRemoveInstruments');

requestRemoveInstruments.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestRemoveInstruments.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i')],
											[Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.reply('Выберите инструменты, которые вы хотите списать', keyboard);
});

// Увеличение количества инструментов на списание
requestRemoveInstruments.action(/^increase>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = +ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text;

	if (amount > counter) {
		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`),
												 Markup.callbackButton(counter + 1, 'itemAmount'),
												 Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)],
												[Markup.callbackButton('⏪ Назад', 'back'),
												 Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + 1}`)]]);
		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`На складе всего ${amount} позиций`, false);
	}
});

// Уменьшение количества инструментов на списание
requestRemoveInstruments.action(/^reduce>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text;

	if (counter > 1) {
		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`),
												 Markup.callbackButton(counter - 1, 'itemAmount'),
												 Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)],
												[Markup.callbackButton('⏪ Назад', 'back'),
												 Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter - 1}`)]]);
		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`Значение должно быть больше нуля`, false);
	}
});

// Подтверждение выбора инструментов
requestRemoveInstruments.action(/^accept>/, async (ctx: any) => {
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

	if (!flag) {
		const item = {
			type,
			id,
			amount
		};
		ctx.session.items.push(item);
	}
	
	await ctx.scene.enter('worker/requestMoreRemove');
});

requestRemoveInstruments.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'incl_abs i')],
											[Markup.callbackButton('Назад', 'back')]]);
	await ctx.reply('Выберите инструменты, которые вы хотите списать', keyboard);
});

requestRemoveInstruments.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestRemoveInstruments;