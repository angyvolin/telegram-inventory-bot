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
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();

	await ctx.replyWithMarkdown('Отправьте фотографию', keyboard);
});

getItemPhoto.on('message', async (ctx: any) => {
	const { photo } = ctx.message;
	const fileId = (await photo[photo.length - 1]).file_id;
	ctx.session.addItem.itemPhotoId = fileId;

	const {itemType, itemName, itemPhotoId} = ctx.session.addItem;

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

	await ctx.scene.leave();
});

getItemPhoto.action('back', async (ctx: any) => {
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemName');
});

export default getItemPhoto;
