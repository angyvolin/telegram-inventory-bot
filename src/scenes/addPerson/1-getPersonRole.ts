import {PersonType} from '../../classes/Person';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления сотрудника
 */
const getPersonRole = new Scene('addPerson/getPersonRole');

getPersonRole.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
getPersonRole.enter(async (ctx: any) => {
	ctx.session.addPerson = {};
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Работник', 'worker'), Markup.callbackButton('Кладовщик', 'stockman')], [Markup.callbackButton('Начальник цеха', 'chief'), Markup.callbackButton('Снабженец', 'supplier')], [Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите роль сотрудника, которого вы хотите добавить', keyboard);
});

getPersonRole.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'worker': {
			ctx.session.addPerson.role = PersonType.WORKER;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson/getPersonName');
			break;
		}
		case 'stockman': {
			ctx.session.addPerson.role = PersonType.STOCKMAN;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson/getPersonName');
			break;
		}
		case 'chief': {
			ctx.session.addPerson.role = PersonType.CHIEF;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson/getPersonName');
			break;
		}
		case 'supplier': {
			ctx.session.addPerson.role = PersonType.SUPPLIER;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson/getPersonName');
			break;
		}
		case 'back': {
			await ctx.scene.leave();
			return AdminMessage.send(ctx);
		}
	}
});

export default getPersonRole;
