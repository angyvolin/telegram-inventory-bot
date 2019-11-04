import AdminMessage from '../../controllers/admin';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';
import { getAbsentConsumables, getAbsentFurniture, getAbsentInstruments } from '../../helpers/items';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса отсутствующих товаров
 */
const getAbsentItemsScene = new Scene('getAbsentItems');

getAbsentItemsScene.command('start', async (ctx: any) => {
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
getAbsentItemsScene.enter(async (ctx: any) => {
	const instruments = await getAbsentInstruments();
	const furniture = await getAbsentFurniture();
	const consumables = await getAbsentConsumables();

	if (instruments.length && furniture.length && consumables.length) {
		await ctx.answerCbQuery();
		await ctx.scene.leave();
		const person = await getPerson(ctx.from.username);
		if (person) {
			return KeyboardMessage.send(ctx, person.type, 'Отсутствующих позиций не найдено');
		} else if (await isAdmin(ctx.from.id)) {
			return AdminMessage.send(ctx, 'Отсутствующих позиций не найдено');
		}
	}

	let itemsCount = 0;
	if (instruments.length) itemsCount += instruments.length;
	if (furniture.length) itemsCount += furniture.length;
	if (consumables.length) itemsCount += consumables.length;

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

	let message = `На складе отсутствует ${itemsCount} позици${ending}\n\n`;

	if (instruments.length) {
		message += '*Инструменты*\n';

		for (let instrument of instruments) {
			message += `🔹 Название: *${instrument.name}*\n`;
		}
		message += '\n';
	}

	if (furniture.length) {
		message += '*Фурнитура*\n';

		for (let f of furniture) {
			message += `🔹 Название: *${f.name}*\n`;
		}

		message += '\n';
	}

	if (consumables.length) {
		message += '*Расходники*\n';

		for (let consumable of consumables) {
			message += `🔹 Название: *${consumable.name}*\n`;
		}
	}

	await ctx.scene.leave();
	const person = await getPerson(ctx.from.username);
	if (person) {
		return KeyboardMessage.send(ctx, person.type, message);
	} else if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx, message);
	}
});

export default getAbsentItemsScene;
