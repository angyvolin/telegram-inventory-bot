import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestRemoveConfirm = new Scene('worker/requestRemoveConfirm');

requestRemoveConfirm.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestRemoveConfirm.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Подтвердить', `approveRequestRemove>${ctx.session.gettingId}`)],
											[Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.reply(ctx.session.instrumentMessages[ctx.session.gettingId], keyboard);
});

requestRemoveConfirm.action(/^approveRequestRemove/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	// Получаем идентификатор получения
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	/*
	 * Убираем клавиатуру с кнопками у последнего сообщения
	 * для того, чтобы нельзя было повторно подтвердить
	 */
	await ctx.editMessageText(ctx.update.callback_query.message.text);
	await ctx.reply('Ваша заявка успешно отправлена! Ожидайте подтверждения админа');
	await Worker.requestRemoveInstruments(ctx, ctx.session.items, gettingId);
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

requestRemoveConfirm.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnList');
});

export default requestRemoveConfirm;