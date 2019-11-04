import KeyboardMessage from '../../controllers/keyboards';
import ItemType from '../../enums/ItemType';
import PersonType from '../../enums/PersonType';
import { getItemsMessage } from '../../helpers/messages';
import { isAdmin } from '../../helpers/functions';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnList = new Scene('worker/requestReturnList');

requestReturnList.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestReturnList.enter(async (ctx: any) => {
	if (!ctx.session.date) {
		await ctx.scene.leave();
		if (await isAdmin(ctx.from.id)) {
			return AdminMessage.send(ctx);
		} else {
			return KeyboardMessage.send(ctx, PersonType.WORKER);
		}
	}
	// Массив получений по выбранной дате
	const gettings = ctx.session.dates[ctx.session.date];

	if (!gettings) {
		await ctx.scene.leave();
		if (await isAdmin(ctx.from.id)) {
			await ctx.reply('Активные получения отсутствуют!');
			return AdminMessage.send(ctx);
		} else {
			return KeyboardMessage.send(ctx, PersonType.WORKER, 'Активные получения отсутствуют!');
		}
	}
	/*
	 * Создаем Map с сообщениями для каждого
	 * получения по выбранной дате
	 */
	ctx.session.itemsMessages = new Map();
	// Массив с кнопками
	const buttons = [];
	// Перебираем все получения по выбранной дате
	for (const getting of gettings) {
		const gettingId = getting._id.toString();

		// Составляем массив определенного типа с инструментами
		let items = [];
		if (getting.instruments) {
			for (const [id, amount] of Object.entries(getting.instruments)) {
				items.push({
					type: ItemType.INSTRUMENT,
					id: id,
					amount: amount
				});
			}
		}
		if (getting.furniture) {
			for (const [id, amount] of Object.entries(getting.furniture)) {
				items.push({
					type: ItemType.FURNITURE,
					id: id,
					amount: amount
				});
			}
		}
		if (getting.consumables) {
			for (const [id, amount] of Object.entries(getting.consumables)) {
				items.push({
					type: ItemType.CONSUMABLE,
					id: id,
					amount: amount
				});
			}
		}

		// Получаем сообщение со списком инструментов
		const itemsMessage = await getItemsMessage(items);
		// Пишем в Map
		ctx.session.itemsMessages.set(gettingId, itemsMessage);
		// Добавляем кнопку
		buttons.push(Markup.callbackButton(itemsMessage, `returnList>${gettingId}`));
	}
	buttons.push(Markup.callbackButton('⏪ Назад', 'back'));
	const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 }).extra();
	await ctx.replyWithMarkdown('Выберите позиции, которые вы хотите вернуть', keyboard);
});

requestReturnList.action(/^returnList>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	// Получаем идентификатор получения
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	// Пишем его в сессию
	ctx.session.gettingId = gettingId;
	await ctx.scene.enter('worker/requestReturnGetting');
});

requestReturnList.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnDate');
});

export default requestReturnList;
