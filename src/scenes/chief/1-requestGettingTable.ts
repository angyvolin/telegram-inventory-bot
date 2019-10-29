import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import { downloadTable, generateTable } from '../../helpers/excel';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGettingTable = new Scene('chief/requestGettingTable');

requestGettingTable.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestGettingTable.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]);
	const table = await generateTable();
	await ctx.reply('Отправьте таблицу Excel с позициями для выдачи', keyboard);
});

requestGettingTable.on('document', async (ctx: any) => {
	ctx.session.table = ctx.message.document.file_id;

	/*const fileId = ctx.message.document.file_id;
	const fileLink = await ctx.telegram.getFileLink(fileId);*/
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingWorker');
});

requestGettingTable.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.CHIEF);
});

export default requestGettingTable;
