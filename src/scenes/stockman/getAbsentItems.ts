import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getAbsentItems } from '../../helpers/items';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса отсутствующих товаров
 */
const getAbsentItemsScene = new Scene('stockman/getAbsentItems');

getAbsentItemsScene.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
getAbsentItemsScene.enter(async (ctx: any) => {
	const absentItems = await getAbsentItems();

	for (let item of absentItems) {
		const message = `Название: *${item.name}*\nВ наличии: *${item.amount}*`;

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

	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.STOCKMAN);
});

export default getAbsentItemsScene;
