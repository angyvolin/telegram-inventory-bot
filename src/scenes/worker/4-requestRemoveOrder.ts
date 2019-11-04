import Admin from '../../classes/Admin';
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
const requestRemoveOrder = new Scene('worker/requestRemoveOrder');

requestRemoveOrder.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestRemoveOrder.enter(async (ctx: any) => {
	await ctx.reply('Укажите номер заказа');
});

requestRemoveOrder.on('text', async (ctx: any) => {
	const order = ctx.message.text;
	await ctx.scene.leave();

	if (await isAdmin(ctx.from.id)) {
		await Admin.requestRemove(ctx, ctx.session.items, ctx.session.gettingId, `заказ №${order}`);
		return AdminMessage.send(ctx, 'Ваша заявка успешно отправлена! Ожидайте подтверждения админа');
	} else {
		await Worker.requestRemove(ctx, ctx.session.items, ctx.session.gettingId, `заказ №${order}`);
		return KeyboardMessage.send(
			ctx,
			PersonType.WORKER,
			'Ваша заявка успешно отправлена! Ожидайте подтверждения админа'
		);
	}
});

requestRemoveOrder.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestRemoveReason');
});

export default requestRemoveOrder;
