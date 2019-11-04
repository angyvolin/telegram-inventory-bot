import Chief from '../../classes/Chief';
import KeyboardMessage from '../../controllers/keyboards';
import AdminMessage from '../../controllers/admin';
import PersonType from '../../enums/PersonType';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса кол-ва дней аренды инструмента
 */
const requestGettingTerm = new Scene('chief/requestGettingTerm');

requestGettingTerm.command('start', async (ctx: any) => {
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
requestGettingTerm.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('⏪ Назад', 'back')
	]).extra();
	await ctx.replyWithMarkdown('На сколько дней Вы хотите выдать позиции?', keyboard);
});

requestGettingTerm.on('text', async (ctx) => {
	const term = ctx.message.text.match(/\d+/);
	if (!term) {
		return ctx.reply('Вы ввели неверное количество дней. Попробуйте еще раз');
	}
	const days = term[0];
	await ctx.scene.leave();
	await Chief.requestGetting(ctx, ctx.session.table, ctx.session.username, days);
	const person = await getPerson(ctx.from.username);
	if (person) {
		await KeyboardMessage.send(ctx, person.type, 'Ваша заявка успешно отправлена! Ожидайте подтверждения выдачи кладовщика');
	} else if (await isAdmin(ctx.from.id)) {
		await AdminMessage.send(ctx, 'Ваша заявка успешно отправлена! Ожидайте подтверждения выдачи кладовщика');
	}
});

requestGettingTerm.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingWorker');
});

export default requestGettingTerm;
