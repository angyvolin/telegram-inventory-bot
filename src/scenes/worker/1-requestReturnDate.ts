import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getActiveGettings, getDateFormat } from '../../helpers/gettings';
import { isAdmin } from '../../helpers/functions';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnDate = new Scene('worker/requestReturnDate');

requestReturnDate.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	ctx.session = {};
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

// Точка входа в сцену
requestReturnDate.enter(async (ctx: any) => {
	const gettings = await getActiveGettings(ctx.from.id);
	if (!gettings.length) {
		await ctx.scene.leave();
		if (await isAdmin(ctx.from.id)) {
			await ctx.reply('Активные получения отсутствуют!');
			return AdminMessage.send(ctx);
		} else {
			return KeyboardMessage.send(ctx, PersonType.WORKER, 'Активные получения отсутствуют!');
		}
	}
	/* Создаем Map с датами для того,
	 * чтобы избежать дублирования дат
	 * (дата - массив с получениями)
	 */
	const dates = new Map();
	/*
	 * Массив с callback-кнопками, будем
	 * генерировать динамически
	 */
	const buttons = [];
	for (const getting of gettings) {
		// Получаем дату в читаемом формате
		const date = getDateFormat(getting.created);
		if (dates.has(date)) {
			// Данная дата уже содержится в Map
			// Текущий массив получений по этой дате
			const currentGettings = dates.get(date);
			// Добавляем в него текущее получение
			currentGettings.push(getting);
			// Устанавливаем новый массив
			/*
			 * !!! Ненужный шаг, т.к. изменяется массив
			 * (по ссылке) !!!
			 */
			dates.set(date, currentGettings);
			continue; // Переходим к новой итерации
		}
		const currentGettings = [getting];
		dates.set(date, currentGettings);
		// Добавляем кнопку в массив
		buttons.push(Markup.callbackButton(date, `returnDay>${date}`));
	}
	// Записываем этот Map в сессию
	ctx.session.dates = dates;
	const keyboard = Markup.inlineKeyboard([buttons, [Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите дату получения позиций, которые вы хотите вернуть', keyboard);
});

requestReturnDate.action(/^returnDay>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const date = ctx.callbackQuery.data.split('>')[1]; // Получаем выбранную дату
	ctx.session.date = date; // Пишем ее в сессию
	await ctx.scene.enter('worker/requestReturnList');
});

requestReturnDate.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	if (await isAdmin(ctx.from.id)) {
		return AdminMessage.send(ctx);
	} else {
		return KeyboardMessage.send(ctx, PersonType.WORKER);
	}
});

export default requestReturnDate;
