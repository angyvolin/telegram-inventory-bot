import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getItem } from '../../helpers/items';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса товара на перемещение
 */
const getMoveItem = new Scene('stockman/getMoveItem');

getMoveItem.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
getMoveItem.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.switchToCurrentChatButton('Инструменты', 'move i'), Markup.switchToCurrentChatButton('Фурнитура', 'move f')], [Markup.switchToCurrentChatButton('Расходники', 'move c'), Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Что Вы хотите переместить?', keyboard);
});

getMoveItem.action(/^selectMoveItem>/, async (ctx: any) => {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	ctx.session.move = {
		item: await getItem(type, id),
		type: type
	};
	await ctx.scene.leave();
	await ctx.scene.enter('stockman/getMoveDestination');
});

getMoveItem.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

export default getMoveItem;
