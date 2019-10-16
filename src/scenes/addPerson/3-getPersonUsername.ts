import AdminMessage from '../../controllers/admin';
import {addPerson} from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления сотрудника
 */
const getPersonUsername = new Scene('addPerson/getPersonUsername');

getPersonUsername.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
getPersonUsername.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите юзернейм сотрудника', keyboard);
});

getPersonUsername.on('text', async (ctx: any) => {
	ctx.session.addPerson.username = ctx.message.text;
	await ctx.scene.leave();
	await addPerson(ctx.session.addPerson.role, ctx.session.addPerson.username, ctx.session.addPerson.fullName);
	await ctx.reply('Сотрудник был успешно добавлен!');
});

getPersonUsername.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson/getPersonName');
		}
	}
});

export default getPersonUsername;
