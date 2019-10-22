import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getInstrumentsMessage } from '../../helpers/items';
import { getDateFormat, getActiveGettings } from '../../helpers/gettings';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnDate = new Scene('worker/requestReturnDate');

requestReturnDate.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnDate.enter(async (ctx: any) => {
	const gettings = await getActiveGettings(ctx.from.id);
	if (!gettings) {
		await ctx.scene.leave()
		await ctx.reply('Активные получения отсутствуют!');
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
	const dates = new Map();
	const buttons = [];
	for (const getting of gettings) {
		const date = getDateFormat(getting.created);
		if (dates.has(date)) {
			const currentGettings = dates.get(date);
			currentGettings.push(getting);
			dates.set(date, currentGettings);
			continue;
		}
		const currentGettings = [getting];
		dates.set(date, currentGettings);
		buttons.push(Markup.callbackButton(date, `returnDay>${date}`));
	}
	console.dir(buttons);
	ctx.session.dates = dates;
	const keyboard = Markup.inlineKeyboard(buttons).extra();
	await ctx.replyWithMarkdown('Выберите дату получения инструментов, которые вы хотите вернуть', keyboard);
});

requestReturnDate.action(/^returnDay>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	const date = ctx.callbackQuery.data.split('>')[1];
	ctx.session.date = date;
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnList');
});

requestReturnDate.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestReturnDate;
