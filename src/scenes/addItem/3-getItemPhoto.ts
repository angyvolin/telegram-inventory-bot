import AdminMessage from '../../controllers/admin';
import KeyboardMessage from '../../controllers/keyboards';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemPhoto = new Scene('addItem/getItemPhoto');

getItemPhoto.command('start', async (ctx: any) => {
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
getItemPhoto.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('⏪ Назад', 'back'),
		Markup.callbackButton('Пропустить', 'skip')
	]).extra();

	await ctx.replyWithMarkdown('Отправьте фотографию', keyboard);
});

getItemPhoto.on('document', async (ctx: any) => {
	await ctx.reply('Пожалуйста, отправьте вложение фотографией (Вы отправили файлом)');
});

getItemPhoto.on('photo', async (ctx: any) => {
	const { photo } = ctx.message;
	const fileId = (await photo[photo.length - 1]).file_id;
	ctx.session.addItem.itemPhotoId = fileId;

	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemMeasure');
});

getItemPhoto.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemName');
});

getItemPhoto.action('skip', async (ctx: any) => {
	ctx.session.itemPhotoId = null;

	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemMeasure');
});

export default getItemPhoto;
