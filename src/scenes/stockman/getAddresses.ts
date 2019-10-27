import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import {
	getItem,
	getOutsideConsumables,
	getOutsideFurniture,
	getOutsideInstruments,
	getOutsideItems
} from '../../helpers/items';
import {getCells} from '../../helpers/cells';
import Cell from '../../models/cell';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена инспеции склада
 */
const getAddresses = new Scene('stockman/getAddresses');

getAddresses.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
getAddresses.enter(async (ctx: any) => {
	let buttons = [];

	const cells = await getCells();

	for (let cell of cells) {
		buttons.push(Markup.callbackButton(cell.row + cell.col, `cell>${cell._id}`));
	}
	buttons.push(Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('Вне ячеек', 'outside'));

	const keyboard = Markup.inlineKeyboard(buttons, {columns: 9}).extra();
	await ctx.replyWithMarkdown(`Выберите ячейку, которую хотите просмотреть`, keyboard);
});

getAddresses.action(/^cell>/, async (ctx: any) => {
	const cellId = ctx.callbackQuery.data.split('>')[1];

	const cell = await Cell.findById(cellId);

	if (!cell.instruments && !cell.furniture && !cell.consumables) {
		await ctx.answerCbQuery();
		await ctx.scene.leave();
		return ctx.reply('Позиций в этой ячейке не найдено', KeyboardMessage.stockman);
	}

	let itemsCount = 0;
	if (cell.instruments) itemsCount += cell.instruments.size;
	if (cell.furniture) itemsCount += cell.furniture.size;
	if (cell.consumables) itemsCount += cell.consumables.size;

	let ending = 'й';
	const lastDigit = itemsCount % 10;

	switch (lastDigit) {
		case 1:
			ending = 'я';
			break;
		case 2:
		case 3:
		case 4:
			ending = 'и';
			break;
	}

	let message = `В ячейке *${cell.row + cell.col}* находится ${itemsCount} позиций${lastDigit}\n\n`;

	if (cell.instruments) {
		message += '*Инструменты*\n';

		for (let instrument of cell.instruments) {
			const item = await getItem(ItemType.INSTRUMENT, instrument[0]);
			message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n`;
		}
		message += '\n';
	}

	if (cell.furniture) {
		message += '*Фурнитура*\n';

		for (let furniture of cell.furniture) {
			const item = await getItem(ItemType.FURNITURE, furniture[0]);
			message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n`;
		}

		message += '\n';
	}

	if (cell.consumables) {
		message += '*Расходники*\n';

		for (let consumable of cell.consumables) {
			const item = await getItem(ItemType.CONSUMABLE, consumable[0]);
			message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n`;
		}
	}

	await ctx.telegram.sendMessage(ctx.from.id, message, { parse_mode: 'Markdown' });

	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

getAddresses.action('outside', async (ctx: any) => {
	const instruments = await getOutsideInstruments();
	const furniture = await getOutsideFurniture();
	const consumables = await getOutsideConsumables();

	if (!instruments && !furniture && !consumables) {
		await ctx.answerCbQuery();
		await ctx.scene.leave();
		return ctx.reply('Позиций вне ячеек не найдено', KeyboardMessage.stockman);
	}

	let itemsCount = 0;
	if (instruments) itemsCount += instruments.length;
	if (furniture) itemsCount += furniture.length;
	if (consumables) itemsCount += consumables.length;

	let ending = 'й';
	const lastDigit = itemsCount % 10;

	switch (lastDigit) {
		case 1:
			ending = 'я';
			break;
		case 2:
		case 3:
		case 4:
			ending = 'и';
			break;
	}

	let message = `Вне ячеек находится ${itemsCount} позици${ending}\n\n`;

	if (instruments.length) {
		message += '*Инструменты*\n';

		for (let instrument of instruments) {
			message += `🔹 Название: *${instrument.name}* (${instrument.amount} шт.)\n`;
		}
		message += '\n';
	}

	if (furniture.length) {
		message += '*Фурнитура*\n';

		for (let f of furniture) {
			message += `🔹 Название: *${f.name}* (${f.amount} шт.)\n`;
		}

		message += '\n';
	}

	if (consumables.length) {
		message += '*Расходники*\n';

		for (let consumable of consumables) {
			message += `🔹 Название: *${consumable.name}* (${consumable.amount} шт.)\n`;
		}
	}

	await ctx.telegram.sendMessage(ctx.from.id, message, { parse_mode: 'Markdown' });

	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

getAddresses.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

export default getAddresses;
