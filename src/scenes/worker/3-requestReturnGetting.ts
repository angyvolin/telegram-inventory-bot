import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { getInstrumentsMessage } from '../../helpers/items';
import { getDateFormat, getActiveGettings } from '../../helpers/gettings';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestReturnGetting = new Scene('worker/requestReturnGetting');

requestReturnGetting.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
requestReturnGetting.enter(async (ctx: any) => {
	// ctx.session.gettingId
});

/*requestReturnGetting.action(/^returnGetting>/, async (ctx: any) => {
	await ctx.answerCbQuery();
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	ctx.session.gettingId = gettingId;
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnGetting');
});*/

requestReturnGetting.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnList');
});

export default requestReturnGetting;
