import Worker from '../../classes/Worker';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';
import { getItemsMessage } from '../../helpers/messages';
import { getActiveGettingsByInstruments } from '../../helpers/gettings';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса добавления ещё item'ов
 */
const requestRemoveList = new Scene('worker/requestRemoveList');

requestRemoveList.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestRemoveList.enter(async (ctx: any) => {
	const { items } = ctx.session;
	const gettings = await getActiveGettingsByInstruments(ctx.from.id, items);

	if (!gettings.length) {
		await ctx.scene.leave();
		await ctx.reply('Активные получения с такими инструментами отсутствуют!');
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
	/*
	 * Создаем Map с сообщениями для каждого
	 * получения по выбранным инструментам
	 */
	ctx.session.instrumentMessages = new Map();
	// Массив с кнопками
	const buttons = [];
	// Перебираем все получения по выбранной дате
	for (const getting of gettings) {
		const gettingId = getting._id.toString();

		// Составляем массив определенного типа с инструментами
		let instruments = [];
		for (const [id, amount] of getting.instruments.entries()) {
			instruments.push({
				type: ItemType.INSTRUMENT,
				id: id,
				amount: amount
			});
		}

		// Получаем сообщение со списком инструментов
		const instrumentMessage = await getItemsMessage(instruments);
		// Пишем в Map
		ctx.session.instrumentMessages.set(gettingId, instrumentMessage);
		// Добавляем кнопку
		buttons.push(Markup.callbackButton(instrumentMessage, `removeList>${gettingId}`));
	}
	buttons.push(Markup.callbackButton('⏪ Назад', 'back'));
	const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 }).extra();
	await ctx.replyWithMarkdown('Выберите инструменты, которые вы хотите вернуть', keyboard);
});

requestRemoveList.action(/^removeList>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	// Получаем идентификатор получения
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	// Пишем его в сессию
	ctx.session.gettingId = gettingId;
	await ctx.scene.enter('worker/requestRemoveConfirm');
});

requestRemoveList.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestMoreRemove');
});

export default requestRemoveList;
