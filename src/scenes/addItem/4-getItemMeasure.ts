import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemMeasure = new Scene('addItem/getItemMeasure');

getItemMeasure.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
getItemMeasure.enter(async (ctx: any) => {
	const keyboard = Markup.keyboard([
		Markup.button('шт.'),
		Markup.button('г.'),
		Markup.button('см.'),
		Markup.button('м^2.'),
		Markup.button('м^3.'),
		Markup.button('л.'),
		Markup.button('⏪ Назад')
	], {columns: 2}).extra();

	await ctx.replyWithMarkdown('Какая величина измерения?\nЕсли нужной единицы нет в списке, введите сокращение 👇', keyboard);
});

getItemMeasure.on('text', async (ctx: any) => {
	ctx.session.addItem.itemMeasure = ctx.message.text;
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemDesc');
});

getItemMeasure.hears('⏪ Назад', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemPhoto');
});

export default getItemMeasure;
