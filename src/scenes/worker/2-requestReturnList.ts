import KeyboardMessage from '../../controllers/keyboards';
import ItemType from '../../enums/ItemType';
import PersonType from '../../enums/PersonType';
import { getItemsMessage } from '../../helpers/messages';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnList = new Scene('worker/requestReturnList');

requestReturnList.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnList.enter(async (ctx: any) => {
	if (!ctx.session.date) {
		await ctx.scene.leave();
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
	// Массив получений по выбранной дате
	const gettings = ctx.session.dates[ctx.session.date];
	if (!gettings) {
		await ctx.scene.leave();
		await ctx.reply('Активные получения отсутствуют!');
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
	/*
	 * Создаем Map с сообщениями для каждого
	 * получения по выбранной дате
	 */
	ctx.session.instrumentMessages = new Map();
	// Массив с кнопками
	const buttons = [];
	// Перебираем все получения по выбранной дате
	for (const getting of gettings) {

		const gettingId = getting._id.toString();
		
		// Составляем массив определенного типа с инструментами
		let instruments = [];
		for (const [id, amount] of instruments) {
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
		buttons.push(Markup.callbackButton(instrumentMessage, `returnList>${gettingId}`));
	}
	buttons.push(Markup.callbackButton('⏪ Назад', 'back'));
	const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 }).extra();
	await ctx.replyWithMarkdown('Выберите инструменты, которые вы хотите вернуть', keyboard);
});

requestReturnList.action(/^returnList>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	// Получаем идентификатор получения
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	// Пишем его в сессию
	ctx.session.gettingId = gettingId;
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnGetting');
});

requestReturnList.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnDate');
});

export default requestReturnList;
