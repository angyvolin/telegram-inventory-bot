import Worker from '../../classes/Worker';
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
	const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Подтвердить', `approveRequestReturn>${ctx.session.gettingId}`)], [Markup.callbackButton('⏪ Назад', 'back')]]).extra();
	await ctx.reply(ctx.session.instrumentMessages[ctx.session.gettingId], keyboard);
});

requestReturnGetting.action(/^approveRequestReturn/, async (ctx: any) => {
	await ctx.answerCbQuery();
	const gettingId = ctx.callbackQuery.data.split('>')[1];
	await ctx.scene.leave();
	await ctx.editMessageText(ctx.update.callback_query.message.text);
	await ctx.reply('Ваша заявка успешно отправлена! Отправляйтесь на возврат');
	await Worker.requestReturn(ctx, gettingId);
});

requestReturnGetting.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('worker/requestReturnList');
});

export default requestReturnGetting;
