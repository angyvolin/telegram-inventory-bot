import AdminMessage from '../../controllers/admin';
import KeyboardMessage from '../../controllers/keyboards';
import ItemType from '../../enums/ItemType';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления объекта
 */
const getItemType = new Scene('addItem/getItemType');

getItemType.command('start', async (ctx: any) => {
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
getItemType.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([
		[Markup.callbackButton('Инструмент', 'instrument'), Markup.callbackButton('Фурнитура', 'furniture')],
		[Markup.callbackButton('Расходники', 'consumables')],
		[Markup.callbackButton('⏪ Назад', 'back')]
	]).extra();

	ctx.session.addItem = {};

	await ctx.replyWithMarkdown('Что Вы хотите добавить?', keyboard);
});

getItemType.action('instrument', async (ctx: any) => {
	await ctx.answerCbQuery();
	ctx.session.addItem.itemType = ItemType.INSTRUMENT;
	await nextStep(ctx);
});

getItemType.action('furniture', async (ctx: any) => {
	await ctx.answerCbQuery();
	ctx.session.addItem.itemType = ItemType.FURNITURE;
	await nextStep(ctx);
});

getItemType.action('consumables', async (ctx: any) => {
	await ctx.answerCbQuery();
	ctx.session.addItem.itemType = ItemType.CONSUMABLE;
	await nextStep(ctx);
});

getItemType.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const person = await getPerson(ctx.from.username);
	if (person) {
		await KeyboardMessage.send(ctx, person.type);
	} else if (await isAdmin(ctx.from.id)) {
		await AdminMessage.send(ctx);
	}
});

const nextStep = async (ctx: any) => {
	await ctx.scene.leave();
	await ctx.scene.enter('addItem/getItemName');
};

export default getItemType;
