import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestRemoveReason = new Scene('worker/requestRemoveReason');

requestRemoveReason.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestRemoveReason.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('🛠 Поломка', `reasonCrash`), Markup.callbackButton('📋 Заказ', `reasonOrder`)],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();
	await ctx.reply('Укажите причину списания', keyboard);
});

requestRemoveReason.action('reasonCrash', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await Worker.requestRemove(ctx, ctx.session.items, ctx.session.gettingId, 'поломка');
	return KeyboardMessage.send(
		ctx,
		PersonType.WORKER,
		'Ваша заявка успешно отправлена! Ожидайте подтверждения админа'
	);
});

requestRemoveReason.action('reasonOrder', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemoveOrder');
});

requestRemoveReason.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestMoreRemove');
});

export default requestRemoveReason;
