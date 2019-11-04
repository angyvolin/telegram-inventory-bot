import KeyboardMessage from '../../controllers/keyboards';
import AdminMessage from '../../controllers/admin';
import PersonType from '../../enums/PersonType';
import { isAdmin } from '../../helpers/functions';
import { getPerson, isWorker } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGettingWorker = new Scene('chief/requestGettingWorker');

requestGettingWorker.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	const person = await getPerson(ctx.from.username);
	if (person) {
		await KeyboardMessage.send(ctx, person.type);
	} else if (await isAdmin(ctx.from.id)) {
		await AdminMessage.send(ctx);
	}
	ctx.session = {};
});

// Точка входа в сцену
requestGettingWorker.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.reply('Введите юзернейм работника, которому нужно выдать позиции', keyboard);
});

requestGettingWorker.on('text', async (ctx: any) => {
	ctx.session.username = ctx.message.text.replace('@', '');

	if (!(await isWorker(ctx.session.username))) {
		return ctx.reply('Неверный юзернейм работника.\nПопробуйте снова');
	}

	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingTerm');
});

requestGettingWorker.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingTable');
});

export default requestGettingWorker;
