import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { isAdmin } from '../../helpers/functions';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса кол-ва дней аренды инструмента
 */
const requestGettingDate = new Scene('worker/requestGettingDate');

requestGettingDate.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestGettingDate.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('На сколько дней Вы хотите арендовать позиции?', keyboard);
});

requestGettingDate.on('text', async (ctx) => {
	const term = ctx.message.text.match(/\d+/);
	if (!term) {
		return ctx.reply('Вы ввели неверное количество дней. Попробуйте еще раз');
	}
	const days = term[0];
	await ctx.scene.leave();
	await Worker.requestGetting(ctx, ctx.session.items, days);

	if (await isAdmin(ctx.from.id))
		return AdminMessage.send(ctx, 'Ваша заявка успешно отправлена! Отправляйтесь на получение');
	else
		return KeyboardMessage.send(
			ctx,
			PersonType.WORKER,
			'Ваша заявка успешно отправлена! Отправляйтесь на получение'
		);
});

requestGettingDate.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestMoreItems');
});

export default requestGettingDate;
