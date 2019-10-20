import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturn = new Scene('worker/requestReturn');

requestReturn.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturn.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Инструменты', 'instrument'), Markup.callbackButton('Фурнитура', 'furniture')], [Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите вернуть', keyboard);
});

requestReturn.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	switch (ctx.callbackQuery.data) {
		case 'instrument': {
			await ctx.scene.leave();
			await ctx.scene.enter('requestReturnInstrument');
			break;
		}
		case 'furniture': {
			await ctx.scene.leave();
			await ctx.scene.enter('requestReturnFurniture');
			break;
		}
		case 'back': {
			await ctx.scene.leave();
			return KeyboardMessage.send(ctx, PersonType.WORKER);
		}
	}
});

export default requestReturn;
