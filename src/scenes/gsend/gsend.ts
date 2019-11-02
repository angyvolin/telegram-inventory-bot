import AdminMessage from '../../controllers/admin';
import Logger from '../../init/logger';
import { sendGlobal } from '../../helpers/functions';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена рассылки
 */
const gsend = new Scene('gsend');

gsend.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
gsend.enter(async (ctx: any) => {
	let keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]).extra();

	await ctx.replyWithMarkdown(
		'Введите сообщение для рассылки\n\nПри форматировании используйте *два знака разметки* вместо одного',
		keyboard
	);
});

gsend.on('text', async (ctx: any) => {
	try {
		await sendGlobal(ctx);
		await ctx.reply('Рассылка успешно проведена! 🎉', AdminMessage.keyboard);
		Logger.notify(`Рассылка успешно проведена! 🎉 Админ: @${ctx.from.username}; Сообщение: "${ctx.message.text}"`);
	} catch (err) {
		await ctx.reply('Не удалось выполнить рассылку, приносим извинения', AdminMessage.keyboard);
		Logger.error(err.message);
	}
	await ctx.scene.leave();
});

gsend.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			await AdminMessage.send(ctx);
			break;
		}
	}
});

export default gsend;
