import { PersonType } from '../../classes/Person';
import AdminMessage from '../../controllers/admin';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена добавления сотрудника
 */
const addPerson1 = new Scene('addPerson1');

addPerson1.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await AdminMessage.send(ctx);
	ctx.session = {};
});

// Точка входа в сцену
addPerson1.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Работник', 'worker'), Markup.callbackButton('Кладовщик', 'stockman')], [Markup.callbackButton('Начальник цеха', 'chief'), Markup.callbackButton('Снабженец', 'supplier')], [Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите роль сотрудника, которого вы хотите добавить', keyboard);
});

addPerson1.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'worker': {
			ctx.session.role = PersonType.WORKER;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson2');
			break;
		}
		case 'stockman': {
			ctx.session.role = PersonType.STOCKMAN;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson2');
			break;
		}
		case 'chief': {
			ctx.session.role = PersonType.CHIEF;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson2');
			break;
		}
		case 'supplier': {
			ctx.session.role = PersonType.SUPPLIER;
			await ctx.scene.leave();
			await ctx.scene.enter('addPerson2');
			break;
		}
		case 'back': {
			await ctx.scene.leave();
			return AdminMessage.send(ctx);
		}
	}
});

export default addPerson1;
