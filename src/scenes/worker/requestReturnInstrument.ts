import KeyboardMessage from '../../controllers/keyboards';
import { PersonType } from '../../classes/Person';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnInstrument = new Scene('requestReturnInstrument');

requestReturnInstrument.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnInstrument.enter(async (ctx: any) => {
	/*const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Работник', 'worker'), Markup.callbackButton('Кладовщик', 'stockman')], [Markup.callbackButton('Начальник цеха', 'chief'), Markup.callbackButton('Снабженец', 'supplier')], [Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите роль сотрудника, которого вы хотите добавить', keyboard);*/
});

requestReturnInstrument.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			await KeyboardMessage.send(ctx, PersonType.WORKER);
			break;
		}
	}
});

export default requestReturnInstrument;
