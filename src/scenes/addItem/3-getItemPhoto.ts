import AdminMessage from '../../controllers/admin';
import ItemType from '../../enums/ItemType';
import Admin from '../../classes/Admin';

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
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back'),
											Markup.callbackButton('Пропустить', 'skip')]).extra();

	await ctx.replyWithMarkdown('Отправьте фотографию', keyboard);
});

getItemPhoto.on('document', async (ctx: any) => {
	await ctx.reply('Пожалуйста, отправьте вложение фотографией (вы отправили файлом)');
});

getItemPhoto.on('photo', async (ctx: any) => {
	await ctx.scene.leave();

	const { photo } = ctx.message;
	const fileId = (await photo[photo.length - 1]).file_id;
	ctx.session.addItem.itemPhotoId = fileId;

	const { itemType, itemName, itemPhotoId } = ctx.session.addItem;

	switch (itemType) {
		case ItemType.INSTRUMENT:
			await Admin.addInstrument(itemName, itemPhotoId);
			await ctx.reply('Инструмент успешно добавлен');
			break;
		case ItemType.FURNITURE:
			await Admin.addFurniture(itemName, itemPhotoId);
			await ctx.reply('Фурнитура успешно добавлена');
			break;
		case ItemType.CONSUMABLE:
			await Admin.addConsumable(itemName, itemPhotoId);
			await ctx.reply('Расходники успешно добавлены');
			break;
	}
});

getItemPhoto.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemName');
});

getItemPhoto.action('skip', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();

	const { itemType, itemName } = ctx.session.addItem;

	switch (itemType) {
		case ItemType.INSTRUMENT:
			await Admin.addInstrument(itemName);
			await ctx.reply('Инструмент успешно добавлен');
			break;
		case ItemType.FURNITURE:
			await Admin.addFurniture(itemName);
			await ctx.reply('Фурнитура успешно добавлена');
			break;
		case ItemType.CONSUMABLE:
			await Admin.addConsumable(itemName);
			await ctx.reply('Расходники успешно добавлены');
			break;
	}
});

export default getItemPhoto;
