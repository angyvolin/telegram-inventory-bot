import KeyboardMessage from '../../controllers/keyboards';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления фотографии к объекту
 */
const getItem = new Scene('addPhoto/getItem');

getItem.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	await KeyboardMessage.send(ctx, type);
	ctx.session = {};
});

// Точка входа в сцену
getItem.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'look i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'look f')],
											[Markup.switchToCurrentChatButton('Расходники', 'look c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите позицию, фото которой хотите изменить', keyboard);
});

// Подтверждение выбора позиции
getItem.action(/^accept>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();

	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];

	ctx.session.item = { type, id };

	await ctx.scene.enter('addPhoto/getPhoto');
});

getItem.action('back', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'look i'),
											 Markup.switchToCurrentChatButton('Фурнитура', 'look f')],
											[Markup.switchToCurrentChatButton('Расходники', 'look c'),
											 Markup.callbackButton('⏪ Назад', 'exit')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

getItem.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	return KeyboardMessage.send(ctx, type);
});

export default getItem;
