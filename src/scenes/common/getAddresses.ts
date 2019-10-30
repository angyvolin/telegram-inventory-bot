import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getPerson } from '../../helpers/persons';
import { getCells } from '../../helpers/cells';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена инспеции склада
 */
const getAddresses = new Scene('getAddresses');

getAddresses.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	await KeyboardMessage.send(ctx, type);
	ctx.session = {};
});

// Точка входа в сцену
getAddresses.enter(async (ctx: any) => {
	let buttons = [];

	const cells = await getCells();

	for (let cell of cells) {
		buttons.push(Markup.callbackButton(cell.row + cell.col, `viewCell>${cell._id}`));
	}
	buttons.push(Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('Вне ячеек', 'viewOutside'));

	const keyboard = Markup.inlineKeyboard(buttons, {columns: 4}).extra();
	await ctx.replyWithMarkdown(`Выберите ячейку, которую хотите просмотреть`, keyboard);
});

getAddresses.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const { type } = await getPerson(ctx.from.username);
	return KeyboardMessage.send(ctx, type);
});

export default getAddresses;
