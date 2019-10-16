import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemPhoto = new Scene('addItem/getItemPhoto');

getItemPhoto.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
getItemPhoto.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('⏪ Назад', 'back')
	]).extra();

	await ctx.replyWithMarkdown('Отправьте фотографию', keyboard);
});

getItemPhoto.on('message', async (ctx: any) => {
	const {photo} = ctx.message;
	const fileId = (await photo[photo.length - 1]).file_id;

	ctx.session.addItem.photoId = fileId;
	await ctx.scene.leave();
});

getItemPhoto.action('back', async (ctx: any) => {
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemName');
});

export default getItemPhoto;
