import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getItem, getOutsideItems } from '../../helpers/items';
import { getCells } from '../../helpers/cells';
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
	buttons.push(
		Markup.callbackButton('⏪ Назад', 'back'),
		Markup.callbackButton('Вне ячеек', 'outside')
	);

	const keyboard = Markup.inlineKeyboard(buttons, {columns: 9}).extra();
	await ctx.replyWithMarkdown(`Выберите ячейку, которую хотите просмотреть`, keyboard);
});

getAddresses.action(/^cell>/, async (ctx: any) => {
	const cellId = ctx.callbackQuery.data.split('>')[1];

	const cell = await Cell.findById(cellId);

	if (!cell.instruments && !cell.furniture && !cell.consumables) {
		return ctx.reply('Позиций в этой ячейке не найдено', KeyboardMessage.stockman);
	}

	if (cell.instruments) {
		for (let instrument of cell.instruments) {
			const item = await getItem(ItemType.INSTRUMENT, instrument[0]);

			if (item.amount > 0) {
				const message = `Название: *${item.name}*\nВ наличии: *${item.amount}*\nАдрес: *${cell.row + cell.col}*`;

				const options = {
					parse_mode: 'Markdown',
					caption: message
				};

				if (item.photo) {
					await ctx.telegram.sendPhoto(ctx.from.id, item.photo, options);
					continue;
				}
				await ctx.telegram.sendMessage(ctx.from.id, message, options);
			}
		}
	}

	if (cell.furniture) {
		for (let furniture of cell.furniture) {
			console.log(furniture);
		}
	}

	if (cell.consumables) {
		for (let consumable of cell.consumables) {
			console.log(consumable);
		}
	}

	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

getAddresses.action('outside', async (ctx: any) => {
	const outsideItems = await getOutsideItems();

	for (let item of outsideItems) {
		const message = `Название: *${item.name}*\nВ наличии: *${item.amount}*\nНаходится вне ячейки`;

		const options = {
			parse_mode: 'Markdown',
			caption: message
		};

		if (item.photo) {
			await ctx.telegram.sendPhoto(ctx.from.id, item.photo, options);
			continue;
		}
		await ctx.telegram.sendMessage(ctx.from.id, message, options);
	}

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
