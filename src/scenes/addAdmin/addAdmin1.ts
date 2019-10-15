import AdminMessage from '../../controllers/admin';
import { PersonType } from '../../classes/Person';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления админа
 */
const addAdmin1 = new Scene('addAdmin1');

addAdmin1.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
addAdmin1.enter(async (ctx: any) => {
	let keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Перешлите мне сообщение от будущего админа ⏩\n*Он должен быть пользователем бота!*', keyboard);
});

addAdmin1.on('message', async (ctx: any) => {
	ctx.session.id = ctx.message.forward_from.id;
	ctx.session.username = ctx.message.forward_from.username;
	await ctx.scene.leave();
	await ctx.scene.enter('addAdmin2');
});

addAdmin1.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			await AdminMessage.send(ctx);
			break;
		}
	}
});

export default addAdmin1;
