import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGetting = new Scene('requestGetting');

requestGetting.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestGetting.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'i'), Markup.switchToCurrentChatButton('Фурнитура', 'f')], [Markup.switchToCurrentChatButton('Расходники', 'c'), Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.action('back', async (ctx: any) => {
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

requestGetting.action(/^accept>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = ctx.callbackQuery.data.split('>')[3];

	console.log(type, id, amount);

	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default requestGetting;
