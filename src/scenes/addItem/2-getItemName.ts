import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemName = new Scene('addItem/getItemName');

getItemName.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
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
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemType');
});

export default getItemName;
