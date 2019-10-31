import KeyboardMessage from '../../controllers/keyboards';
import ItemType from '../../enums/ItemType';
import Admin from '../../classes/Admin';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemDesc = new Scene('addItem/getItemDesc');

getItemDesc.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	await KeyboardMessage.send(ctx, type);
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
	const { type } = await getPerson(ctx.from.username);
	await KeyboardMessage.send(ctx, type);
});

getItemDesc.action('skip', async (ctx: any) => {
	ctx.session.addItem.itemDesc = null;
	
	const message = await addItem(ctx);
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	await KeyboardMessage.send(ctx, type);
});

getItemDesc.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemMeasure');
});

const addItem = async (ctx: any): Promise<string> => {
	const {itemType, itemName, itemPhotoId, itemMeasure, itemDesc} = ctx.session.addItem;

	switch (itemType) {
		case ItemType.INSTRUMENT:
			await Admin.addInstrument(itemName, itemMeasure, itemPhotoId, itemDesc);
			return 'Инструмент успешно добавлен';
			break;
		case ItemType.FURNITURE:
			await Admin.addFurniture(itemName, itemMeasure, itemPhotoId, itemDesc);
			return 'Фурнитура успешно добавлена';
			break;
		case ItemType.CONSUMABLE:
			await Admin.addConsumable(itemName, itemMeasure, itemPhotoId, itemDesc);
			return 'Расходники успешно добавлены';
			break;
	}
};

export default getItemDesc;
