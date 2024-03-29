import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { isAdmin } from '../../helpers/functions';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnGetting = new Scene('worker/requestReturnGetting');

requestReturnGetting.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestReturnGetting.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('✅ Подтвердить', `approveRequestReturn>${ctx.session.gettingId}`)],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.reply(ctx.session.itemsMessages[ctx.session.gettingId], keyboard);
});

requestReturnGetting.action(/^approveRequestReturn/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	// Получаем идентификатор получения
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	/*
	 * Убираем клавиатуру с кнопками у последнего сообщения
	 * для того, чтобы нельзя было повторно подтвердить
	 */
	await ctx.editMessageText(ctx.update.callback_query.message.text, { parse_mode: 'Markdown' });
	await Worker.requestReturn(ctx, gettingId);
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx, 'Ваша заявка успешно отправлена! Отправляйтесь на возврат');
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER, 'Ваша заявка успешно отправлена! Отправляйтесь на возврат');
	}
});

requestReturnGetting.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnList');
});

export default requestReturnGetting;
