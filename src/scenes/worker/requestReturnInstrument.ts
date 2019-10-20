import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnInstrument = new Scene('worker/requestReturnInstrument');

requestReturnInstrument.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnInstrument.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]);
	await ctx.reply('Вы хотите вернуть инструменты!');
	await ctx.scene.leave();
});

requestReturnInstrument.on('callback_query', async (ctx: any) => {
	await ctx.answerCbQuery();
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			return KeyboardMessage.send(ctx, PersonType.WORKER);
		}
	}
});

export default requestReturnInstrument;
