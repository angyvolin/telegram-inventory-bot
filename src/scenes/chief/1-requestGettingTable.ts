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
	await ctx.replyWithDocument({
		source: table,
		filename: 'Шаблон.csv'
	});
	await ctx.reply('Заполните данную таблицу с позициями для выдачи работнику, а потом отправьте ее сюда', keyboard);
});

requestGettingTable.on('document', async (ctx: any) => {
	const fileId = ctx.message.document.file_id;
	const fileLink = await ctx.telegram.getFileLink(fileId);

	ctx.session.table = await downloadTable(fileLink);

	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingWorker');
});

requestGettingTable.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.CHIEF);
});

export default requestGettingTable;