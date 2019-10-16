import KeyboardMessage from '../../controllers/keyboards';
import { PersonType } from '../../classes/Person';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGetting = new Scene('requestGetting');

requestGetting.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestGetting.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('Инструменты', 'instrument'), Markup.callbackButton('Фурнитура', 'furniture')], [Markup.callbackButton('Расходники', 'consumable'), Markup.callbackButton('Назад', 'back')]]).extra();
	await ctx.replyWithMarkdown('Выберите тип объектов, которые вы хотите получить', keyboard);
});

requestGetting.on('callback_query', async (ctx: any) => {
	switch (ctx.callbackQuery.data) {
		case 'instrument': {
			await ctx.scene.leave();
			await ctx.scene.enter('requestGettingInstrument');
			break;
		}
		case 'furniture': {
			await ctx.scene.leave();
			await ctx.scene.enter('requestGettingFurniture');
			break;
		}
		case 'consumable': {
			await ctx.scene.leave();
			await ctx.scene.enter('requestGettingConsumable');
			break;
		}
		case 'back': {
			return KeyboardMessage.send(ctx, PersonType.WORKER);
		}
	}
});

export default requestGetting;
