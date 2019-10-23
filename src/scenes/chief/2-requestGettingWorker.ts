import Chief from '../../classes/Chief';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGettingWorker = new Scene('chief/requestGettingWorker');

requestGettingWorker.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingWorker.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.reply('Введите юзернейм работника, которому нужно выдать позиции', keyboard);
});

requestGettingWorker.action('accept', async (ctx: any) => {
	await ctx.answerCbQuery();
	const username = ctx.message.text.replace('@', '');
	await ctx.scene.leave();
	//...
});

requestGettingWorker.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingTable');
});

export default requestGettingWorker;
