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
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')], [Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.action(/^increase>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = parseInt(ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text);

	if (amount > counter) {
		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`), Markup.callbackButton(counter + 1, 'itemAmount'), Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)], [Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + 1}`)]]);

		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`На складе всего ${amount} позиций`, false);
	}
});

requestGetting.action(/^reduce>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	const counter = parseInt(ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].text);

	if (counter > 1) {
		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('➖', `reduce>${type}>${id}>${amount}`), Markup.callbackButton(counter - 1, 'itemAmount'), Markup.callbackButton('➕', `increase>${type}>${id}>${amount}`)], [Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter - 1}`)]]);

		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`Значение должно быть больше нуля`, false);
	}
});

requestGetting.action(/^accept>/, async (ctx: any) => {
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
	await ctx.scene.enter('worker/requestMoreItems');
});

requestGetting.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')], [Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { items } = ctx.session;

	for (let item of items) {
		if (item.type === ItemType.INSTRUMENT) {
			return ctx.scene.enter('worker/requestGettingDate');
		}
	}
	await ctx.reply('Ваша заявка успешно отправлена! Отправляйтесь на получение');
	await Worker.requestGetting(ctx, ctx.session.items);
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

requestGetting.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestGetting;
