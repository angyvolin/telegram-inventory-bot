import Stockman from '../../classes/Stockman';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса кол-ва дней аренды инструмента
 */
const requestGettingWorkerDate = new Scene('stockman/requestGettingWorkerDate');

requestGettingWorkerDate.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingWorkerDate.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('На сколько дней Вы хотите выдать инструмент(ы)?', keyboard);
});

requestGettingWorkerDate.on('text', async (ctx) => {
	const term = ctx.message.text.match(/\d+/);
	if (!term) {
		return ctx.reply('Вы ввели неверное количество дней. Попробуйте еще раз');
	}
	const days = term[0];
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN, 'Получение успешно создано! Ожидайте работника');
	return Stockman.requestGetting(ctx, ctx.session.items, ctx.session.username, days);
});

requestGettingWorkerDate.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('stockman/requestGettingWorkerMore');
});

export default requestGettingWorkerDate;
