import AdminMessage from '../../controllers/admin';
import KeyboardMessage from '../../controllers/keyboards';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemName = new Scene('addItem/getItemName');

getItemName.command('start', async (ctx: any) => {
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
getItemName.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();

	await ctx.replyWithMarkdown('Введите название', keyboard);
});

getItemName.on('text', async (ctx: any) => {
	ctx.session.addItem.itemName = ctx.message.text;
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemPhoto');
});

getItemName.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemType');
});

export default getItemName;
