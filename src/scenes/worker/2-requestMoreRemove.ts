import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getEarliestActiveGetting } from '../../helpers/gettings';
import { isAdmin } from '../../helpers/functions';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestMoreRemove = new Scene('worker/requestMoreRemove');

requestMoreRemove.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestMoreRemove.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('Добавить еще', 'more'), Markup.callbackButton('Отправить запрос', 'finish')],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.replyWithMarkdown('Желаете добавить еще позиции в запрос?', keyboard);
});

requestMoreRemove.action('more', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemove');
});

requestMoreRemove.action('finish', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	ctx.session.gettingId = await getEarliestActiveGetting(ctx.from.id, ctx.session.items);

	if (!ctx.session.gettingId) {
		await ctx.scene.leave();
		if (await isAdmin(ctx.from.id)) {
			await ctx.reply('Активные получения с такими позициями отсутствуют!');
			return AdminMessage.send(ctx);
		} else {
			return KeyboardMessage.send(ctx, PersonType.WORKER, 'Активные получения с такими позициями отсутствуют!');
		}
	}

	await ctx.scene.enter('worker/requestRemoveReason');
});

requestMoreRemove.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemove');
});

export default requestMoreRemove;
