import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestRemoveOrder = new Scene('worker/requestRemoveOrder');

requestRemoveOrder.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestRemoveOrder.enter(async (ctx: any) => {
	await ctx.reply('Укажите номер заказа');
});

requestRemoveOrder.on('text', async (ctx: any) => {
	const order = ctx.message.text;
	await ctx.scene.leave();
	await Worker.requestRemove(ctx, ctx.session.items, ctx.session.gettingId, `заказ №${order}`);
	return KeyboardMessage.send(
		ctx,
		PersonType.WORKER,
		'Ваша заявка успешно отправлена! Ожидайте подтверждения админа'
	);
});

requestRemoveOrder.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemoveReason');
});

export default requestRemoveOrder;
