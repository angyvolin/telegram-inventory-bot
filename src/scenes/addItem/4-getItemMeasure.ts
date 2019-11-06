import AdminMessage from '../../controllers/admin';
import KeyboardMessage from '../../controllers/keyboards';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemMeasure = new Scene('addItem/getItemMeasure');

getItemMeasure.command('start', async (ctx: any) => {
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
getItemMeasure.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('шт.', 'шт.'),
		Markup.callbackButton('г.', 'г.'),
		Markup.callbackButton('см.', 'см.'),
		Markup.callbackButton('м^2.', 'м^2'),
		Markup.callbackButton('м^3.', 'м^3'),
		Markup.callbackButton('л.', 'л.'),
		Markup.callbackButton('⏪ Назад', 'back')
	], { columns: 2 }).extra();

	await ctx.replyWithMarkdown(
		'Какая величина измерения?\nВведите ее с клавиатуры или выберите из списка', keyboard
	);
});

getItemMeasure.on('text', async (ctx: any) => {
	ctx.session.addItem.itemMeasure = ctx.message.text;
	await ctx.scene.leave();

	// Send user's keyboard
	/*const person = await getPerson(ctx.from.username);
	if (person) {
		await KeyboardMessage.send(ctx, person.type);
	} else if (await isAdmin(ctx.from.id)) {
		await AdminMessage.send(ctx);
	}*/

	await ctx.scene.enter('addItem/getItemDesc');
});

getItemMeasure.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemPhoto');
});

getItemMeasure.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	ctx.session.addItem.itemMeasure = ctx.callbackQuery.data;
	await ctx.scene.enter('addItem/getItemDesc');

});

export default getItemMeasure;
