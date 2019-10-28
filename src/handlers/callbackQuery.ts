import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import { dismissAdmin, isAdmin } from '../helpers/functions';
import Logger from '../init/logger';
import Cell from '../models/cell';
import KeyboardMessage from '../controllers/keyboards';
import { getItem, getOutsideConsumables, getOutsideFurniture, getOutsideInstruments } from '../helpers/items';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';

const Markup = require('telegraf/markup');

export default class CallbackQueryHandlers {
	public static init(bot) {
		// Обработчик callback запроса на устранение админа
		bot.action(/^dismiss>[0-9]+$/, async (ctx: api.ContextMessageUpdate) => {
			if (await isAdmin(ctx.from.id)) {
				try {
					await dismissAdmin(+ctx.callbackQuery.data.split('>')[1]);
					await ctx.answerCbQuery();
					await ctx.reply('Админ успешно отстранён ✔️', AdminMessage.keyboard);
				} catch (err) {
					Logger.error(err);
					await ctx.answerCbQuery();
					await ctx.reply('Не удалось отстранить админа, приносим извинения', AdminMessage.keyboard);
				}
			}
		});

		bot.action('itemAmount', async (ctx) => {
			await ctx.answerCbQuery();
		});

		bot.action(/^viewCell>/, async (ctx: any) => {
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

			let message = `В ячейке *${cell.row + cell.col}* находится ${itemsCount} позици${ending}\n\n`;

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

			await ctx.telegram.sendMessage(ctx.from.id, message, {parse_mode: 'Markdown'});

			await ctx.answerCbQuery();
			await ctx.scene.leave();
			await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
		});

		bot.action('viewOutside', async (ctx: any) => {
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

			await ctx.telegram.sendMessage(ctx.from.id, message, {parse_mode: 'Markdown'});

			await ctx.answerCbQuery();
			await ctx.scene.leave();
			await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
		});
	}
}
