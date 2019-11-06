import Logger from '../../init/logger';
import AdminMessage from '../../controllers/admin';
import { addAdmin } from '../../helpers/functions';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления админа
 */
const addAdmins = new Scene('addAdmins');

addAdmins.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
addAdmins.enter(async (ctx: any) => {
	let keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown(
		'Перешлите мне сообщение от будущего админа ⏩\n*Он должен быть пользователем бота!*',
		keyboard
	);
});

addAdmins.on('message', async (ctx: any) => {
	try {
		// Получаем данные о пользователе из контекста
		let chatId = ctx.message.forward_from.id;
		let username = ctx.message.forward_from.username;
		let name = ctx.message.forward_from.first_name;

		// Составляем имя в зависимости от наличия фамилии
		if (ctx.message.forward_from.last_name !== undefined) {
			name = `${ctx.message.forward_from.first_name}` + `${ctx.message.forward_from.last_name}`;
		}

		await ctx.scene.leave();
		await addAdmin(chatId, username, name); // Добавляем админа
		await ctx.reply('Операция прошла успешно! 🎉', AdminMessage.keyboard1);
		Logger.notify(`Новый админ(${chatId}) добавлен! 🎉 Админ: @${ctx.message.forward_from.username}`);
	} catch (err) {
		await ctx.reply(
			'Не удалось добавить новых админов, приносим извинения.\nВозможно, Вы ввели некорректные данные',
			AdminMessage.keyboard1
		);
		Logger.error(err.message);
	}
});

addAdmins.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.answerCbQuery();
			await ctx.scene.leave();
			await AdminMessage.send(ctx);
			break;
		}
	}
});

export default addAdmins;
