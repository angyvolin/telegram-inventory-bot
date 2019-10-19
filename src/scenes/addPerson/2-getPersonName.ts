import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления сотрудника
 */
const getPersonName = new Scene('addPerson/getPersonName');

getPersonName.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
getPersonName.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите ФИО сотрудника', keyboard);
});

getPersonName.on('text', async (ctx: any) => {
	ctx.session.addPerson.fullName = ctx.message.text;
	await ctx.scene.leave();
	await ctx.scene.enter('addPerson/getPersonUsername');
});

getPersonName.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson/getPersonRole');
		}
	}
});

export default getPersonName;
