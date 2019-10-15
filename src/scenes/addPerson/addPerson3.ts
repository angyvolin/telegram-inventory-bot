import AdminMessage from '../../controllers/admin';
import { addPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления сотрудника
 */
const addPerson3 = new Scene('addPerson3');

addPerson3.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
addPerson3.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите юзернейм сотрудника', keyboard);
});

addPerson3.on('text', async (ctx: any) => {
	ctx.session.username = ctx.message.text;
	await ctx.scene.leave();
	await addPerson(ctx.session.role, ctx.session.fullName, ctx.session.username);
	await ctx.reply('Сотрудник был успешно добавлен!');
});

addPerson3.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			return await AdminMessage.send(ctx);
		}
	}
});

export default addPerson3;
