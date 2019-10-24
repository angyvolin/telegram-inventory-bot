import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { addToCell, getCell, getCells, removeFromCell } from '../../helpers/cells';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса товара на перемещение
 */
const getMoveDestination = new Scene('stockman/getMoveDestination');

getMoveDestination.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
getMoveDestination.enter(async (ctx: any) => {
	let buttons = [];

	const cells = await getCells();

	for (let cell of cells) {
		buttons.push(Markup.callbackButton(cell.row + cell.col, `cell>${cell._id}`));
	}
	buttons.push(Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('Вне ячеек', 'outside'));

	const keyboard = Markup.inlineKeyboard(buttons, { columns: 9 }).extra();
	await ctx.replyWithMarkdown(`Выберите, куда Вы хотите переместить ${ctx.session.move.item.name.toLowerCase()}?`, keyboard);
});

getMoveDestination.action(/^cell>/, async (ctx: any) => {
	const cellId = ctx.callbackQuery.data.split('>')[1];
	const { item, type } = ctx.session.move;

	const itemId = item._id.toString();

	const currCell = await getCell(type, itemId);

	if (currCell) {
		await removeFromCell(currCell._id, type, itemId);
	}
	await addToCell(cellId, type, itemId, item.amount);

	await ctx.answerCbQuery('Успешно перемещено!');
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

getMoveDestination.action('outside', async (ctx: any) => {
	const { item, type } = ctx.session.move;

	const itemId = item._id.toString();

	const currCell = await getCell(type, itemId);

	console.log(currCell);
	if (currCell) {
		await removeFromCell(currCell._id, type, itemId);
	}

	await ctx.answerCbQuery('Успешно перемещено!');
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

getMoveDestination.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('stockman/getMoveItem');
});

export default getMoveDestination;
