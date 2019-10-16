import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestRemoveInstrument = new Scene('requestRemoveInstrument');

requestRemoveInstrument.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestRemoveInstrument.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('Назад', 'back')]);
	await ctx.reply('Вы хотите списать инструменты!');
	await ctx.scene.leave();
});

requestRemoveInstrument.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'back': {
			await ctx.scene.leave();
			return KeyboardMessage.send(ctx, PersonType.WORKER);
		}
	}
});

export default requestRemoveInstrument;
