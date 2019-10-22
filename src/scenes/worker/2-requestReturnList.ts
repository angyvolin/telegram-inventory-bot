import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getInstrumentsMessage } from '../../helpers/items';
import { getDateFormat, getActiveGettings } from '../../helpers/gettings';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnList = new Scene('worker/requestReturnList');

requestReturnList.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnList.enter(async (ctx: any) => {
	if (!ctx.session.date) {
		await ctx.scene.leave();
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
	const gettings = ctx.session.dates[ctx.session.date];
	if (!gettings) {
		await ctx.scene.leave();
		await ctx.reply('Активные получения отсутствуют!');
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
	const buttons = [];
	for (const getting of gettings) {
		const gettingId = getting._id;
		const instruments = new Map(Object.entries(getting.instruments));
		const instrumentMessage = await getInstrumentsMessage(instruments);
		buttons.push(Markup.callbackButton(instrumentMessage, `returnList>${gettingId}`));
	}
	const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 }).extra();
	await ctx.replyWithMarkdown('Выберите инструменты, которые вы хотите вернуть', keyboard);
});

requestReturnList.action(/^returnList>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	ctx.session.gettingId = gettingId;
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnGetting');
});

requestReturnList.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnDate');
});

export default requestReturnList;
