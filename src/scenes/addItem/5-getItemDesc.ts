import AdminMessage from '../../controllers/admin';
import ItemType from '../../enums/ItemType';
import Admin from '../../classes/Admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemDesc = new Scene('addItem/getItemDesc');

getItemDesc.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
getItemDesc.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		Markup.callbackButton('⏪ Назад', 'back'),
		Markup.callbackButton('Пропустить ⏩', 'skip')
	]).extra();

	await ctx.replyWithMarkdown('Введите описание позиции', keyboard);
});

getItemDesc.on('text', async (ctx: any) => {
	ctx.session.addItem.itemDesc = ctx.message.text;

	await addItem(ctx);
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
});

getItemDesc.action('skip', async (ctx: any) => {
	ctx.session.addItem.itemDesc = null;

	await addItem(ctx);
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
});

getItemDesc.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemMeasure');
});

const addItem = async (ctx: any) => {
	const {itemType, itemName, itemPhotoId, itemMeasure, itemDesc} = ctx.session.addItem;

	switch (itemType) {
		case ItemType.INSTRUMENT:
			await Admin.addInstrument(itemName, itemMeasure, itemPhotoId, itemDesc);
			await ctx.reply('Инструмент успешно добавлен');
			break;
		case ItemType.FURNITURE:
			await Admin.addFurniture(itemName, itemMeasure, itemPhotoId, itemDesc);
			await ctx.reply('Фурнитура успешно добавлена');
			break;
		case ItemType.CONSUMABLE:
			await Admin.addConsumable(itemName, itemMeasure, itemPhotoId, itemDesc);
			await ctx.reply('Расходники успешно добавлены');
			break;
	}
};

export default getItemDesc;
