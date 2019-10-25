import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

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
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Фурнитура', 'f'),
											 Markup.switchToCurrentChatButton('Расходники', 'c')],
											[Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип предметов, которые вы хотите вернуть', keyboard);
});

requestReturnRemains.action(/^increase>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = +ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text;

	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`),
											 Markup.callbackButton(counter + 1, 'itemAmount'),
											 Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)],
											[Markup.callbackButton('⏪ Назад', 'back'),
											 Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + 1}`)]]);
	await ctx.editMessageReplyMarkup(keyboard);
	await ctx.answerCbQuery();
});

requestReturnRemains.action(/^reduce>/, async (ctx: any) => {
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

requestReturnRemains.action(/^accept>/, async (ctx: any) => {
	await ctx.answerCbQuery();

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

	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestMoreRemains');
});

requestReturnRemains.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;

	await ctx.reply('Ваша заявка успешно отправлена! Отправляйтесь на возврат');
	await Worker.requestReturnRemains(ctx, ctx.session.items);
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

requestReturnRemains.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestReturnRemains;
