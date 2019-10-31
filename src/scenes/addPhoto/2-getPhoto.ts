import AdminMessage from '../../controllers/admin';
import KeyboardMessage from '../../controllers/keyboards';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';
import { addPhoto } from '../../helpers/items';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления фотографии к объекту
 */
const getPhoto = new Scene('addPhoto/getPhoto');

getPhoto.command('start', async (ctx: any) => {
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
getPhoto.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();

	await ctx.replyWithMarkdown('Отправьте фотографию', keyboard);
});

getPhoto.on('document', async (ctx: any) => {
	await ctx.reply('Пожалуйста, отправьте вложение фотографией (Вы отправили файлом)');
});

getPhoto.on('photo', async (ctx: any) => {
	const { photo } = ctx.message;
	const fileId = (await photo[photo.length - 1]).file_id;
	
	await ctx.scene.leave();
	await addPhoto(ctx.session.item.type, ctx.session.item.id, fileId);
	await ctx.reply('Фотография была успешно добавлена');
});

getPhoto.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addPhoto/getItem');
})

export default getPhoto;
