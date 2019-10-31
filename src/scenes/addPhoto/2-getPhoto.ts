import KeyboardMessage from '../../controllers/keyboards';
import ItemType from '../../enums/ItemType';
import { addPhoto } from '../../helpers/items';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления фотографии к объекту
 */
const getPhoto = new Scene('addPhoto/getPhoto');

getPhoto.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	await KeyboardMessage.send(ctx, type);
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
