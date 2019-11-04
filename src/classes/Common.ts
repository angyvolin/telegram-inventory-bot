import Cell from '../models/cell';
import AdminMessage from '../controllers/admin';
import KeyboardMessage from '../controllers/keyboards';
import ItemType from '../enums/ItemType';
import PersonType from '../enums/PersonType';
import { isAdmin } from '../helpers/functions';
import { getPerson } from '../helpers/persons';
import { getItem, getOutsideConsumables, getOutsideFurniture, getOutsideInstruments } from '../helpers/items';

export default class Common {
	public static async viewCell(ctx: any): Promise<void> {
		const cellId = ctx.callbackQuery.data.split('>')[1];
		const cell = await Cell.findById(cellId);

		if (!cell.instruments && !cell.furniture && !cell.consumables) {
			await ctx.answerCbQuery();
			await ctx.scene.leave();
			const person = await getPerson(ctx.from.username);
			if (person) {
				return KeyboardMessage.send(ctx, person.type, 'Позиций в этой ячейке не найдено');
			} else if (await isAdmin(ctx.from.id)) {
				return AdminMessage.send(ctx, 'Позиций в этой ячейке не найдено');
			}
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
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
			message += '\n';
		}

		if (cell.furniture) {
			message += '*Фурнитура*\n';

			for (let furniture of cell.furniture) {
				const item = await getItem(ItemType.FURNITURE, furniture[0]);
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}

			message += '\n';
		}

		if (cell.consumables) {
			message += '*Расходники*\n';

			for (let consumable of cell.consumables) {
				const item = await getItem(ItemType.CONSUMABLE, consumable[0]);
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
		}

		// await ctx.telegram.sendMessage(ctx.from.id, message, { parse_mode: 'Markdown' });

		await ctx.answerCbQuery();
		await ctx.scene.leave();
		const person = await getPerson(ctx.from.username);
		if (person) {
			await KeyboardMessage.send(ctx, person.type, message);
		} else if (await isAdmin(ctx.from.id)) {
			await AdminMessage.send(ctx, message);
		}
	}

	public static async viewOutside(ctx: any): Promise<void> {
		const instruments = await getOutsideInstruments();
		const furniture = await getOutsideFurniture();
		const consumables = await getOutsideConsumables();

		if (!instruments && !furniture && !consumables) {
			await ctx.answerCbQuery();
			await ctx.scene.leave();
			const person = await getPerson(ctx.from.username);
			if (person) {
				await KeyboardMessage.send(ctx, person.type, 'Позиций вне ячеек не найдено');
			} else if (await isAdmin(ctx.from.id)) {
				await AdminMessage.send(ctx, 'Позиций вне ячеек не найдено');
			}
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

			for (let item of instruments) {
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
			message += '\n';
		}

		if (furniture.length) {
			message += '*Фурнитура*\n';

			for (let item of furniture) {
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}

			message += '\n';
		}

		if (consumables.length) {
			message += '*Расходники*\n';

			for (let item of consumables) {
				const desc = item.description ? `${item.description}\n` : '';
				message += `🔹 Название: *${item.name}* (${item.amount} шт.)\n` + desc;
			}
		}

		// await ctx.telegram.sendMessage(ctx.from.id, message, { parse_mode: 'Markdown' });

		await ctx.answerCbQuery();
		await ctx.scene.leave();
		const person = await getPerson(ctx.from.username);
		if (person) {
			await KeyboardMessage.send(ctx, person.type, message);
		} else if (await isAdmin(ctx.from.id)) {
			await AdminMessage.send(ctx, message);
		}
	}
}
