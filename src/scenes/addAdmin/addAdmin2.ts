import AdminMessage from '../../controllers/admin';
import { addAdmin } from '../../helpers/functions';
import { addPerson } from '../../helpers/persons';
import { PersonType } from '../../classes/Person';
import Logger from '../../init/logger';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления админа
 */
const addAdmin2 = new Scene('addAdmin2');

addAdmin2.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
addAdmin2.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите ФИО админа', keyboard);
});

addAdmin2.on('message', async (ctx: any) => {
	ctx.session.fullName = ctx.message.text;
	await ctx.scene.leave();
	try {
		await addAdmin(ctx.session.id); // Добавляем админа
		await addPerson(PersonType.ADMIN, ctx.session.username, ctx.session.fullName);
		await ctx.reply('Операция прошла успешно! 🎉', AdminMessage.keyboard);
		Logger.notify(`Новый админ(${ctx.session.id}) добавлен! 🎉 Админ: @${ctx.from.username}`);
	} catch (err) {
		await ctx.reply('Не удалось добавить новых админов, приносим извинения.\nВозможно, Вы ввели некорректные данные', AdminMessage.keyboard);
		Logger.error(err.message);
	}
});

addAdmin2.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			await AdminMessage.send(ctx);
			break;
		}
	}
});

export default addAdmin2;
