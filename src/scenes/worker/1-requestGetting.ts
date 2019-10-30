import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

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
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'f')],
											[Markup.switchToCurrentChatButton('Расходники', 'c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

// Увеличение количества позиции на получение
requestGetting.action(/^increase>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];
	const offset = +ctx.callbackQuery.data.split('>')[4];

	const counter = +ctx.update.callback_query.message.reply_markup.inline_keyboard[0][2].text;

	if (amount >= counter + offset && counter + offset >= 1) {
		const keyboard = Markup.inlineKeyboard([
			[
				Markup.callbackButton('➖ 10', `increase>${type}>${id}>${amount}>-10`),
				Markup.callbackButton('➖', `increase>${type}>${id}>${amount}>-1`),
				Markup.callbackButton(counter + offset, `itemAmount>${type}>${id}>${amount}`),
				Markup.callbackButton('➕', `increase>${type}>${id}>${amount}>1`),
				Markup.callbackButton('➕ 10', `increase>${type}>${id}>${amount}>10`)
			],
			[
				Markup.callbackButton('⏪ Назад', 'back'),
				Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + offset}`)
			]
		]);
		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`Недопустимое значение`, false);
	}
});

// Подтверждение выбора позиции
requestGetting.action(/^accept>/, async (ctx: any) => {
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

	await ctx.scene.enter('worker/requestMoreItems');
});

requestGetting.action(/^itemAmount>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];

	ctx.session.selectedItem = {type, id, itemAmount: amount};

	await ctx.answerCbQuery();
	await ctx.scene.enter('getItemCount');
});

requestGetting.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'f')],
											[Markup.switchToCurrentChatButton('Расходники', 'c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestGetting;
