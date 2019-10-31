import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { isWorker } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGettingUsername = new Scene('stockman/requestGettingUsername');

requestGettingUsername.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingUsername.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.reply('Введите юзернейм работника, которому нужно выдать позиции', keyboard);
});

requestGettingUsername.on('text', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session.username = ctx.message.text.replace('@', '');

	if (!(await isWorker(ctx.session.username))) {
		return ctx.reply('Неверный юзернейм работника.\nПопробуйте снова');
	}

	await ctx.scene.enter('stockman/requestGettingWorkerItems');
});

requestGettingUsername.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

export default requestGettingUsername;
