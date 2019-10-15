import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления сотрудника
 */
const addPerson2 = new Scene('addPerson2');

addPerson2.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
addPerson2.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите ФИО сотрудника', keyboard);
});

addPerson2.on('text', async (ctx: any) => {
	ctx.session.fullName = ctx.message.text;
	await ctx.scene.leave();
	await ctx.scene.enter('addPerson3');
});

addPerson2.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			return await AdminMessage.send(ctx);
		}
	}
});

export default addPerson2;
