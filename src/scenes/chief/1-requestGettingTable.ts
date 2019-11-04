import KeyboardMessage from '../../controllers/keyboards';
import AdminMessage from '../../controllers/admin';
import PersonType from '../../enums/PersonType';
import { isAdmin } from '../../helpers/functions';
import { getPerson } from '../../helpers/persons';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestGettingTable = new Scene('chief/requestGettingTable');

requestGettingTable.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	const person = await getPerson(ctx.from.username);
	if (person) {
		await KeyboardMessage.send(ctx, person.type);
	} else if (await isAdmin(ctx.from.id)) {
		await AdminMessage.send(ctx);
	}
	ctx.session = {};
});

// Точка входа в сцену
requestGettingTable.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.reply('Отправьте таблицу Excel с позициями для выдачи', keyboard);
});

requestGettingTable.on('document', async (ctx: any) => {
	ctx.session.table = ctx.message.document.file_id;
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestGettingWorker');
});

requestGettingTable.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	const person = await getPerson(ctx.from.username);
	if (person) {
		await KeyboardMessage.send(ctx, person.type);
	} else if (await isAdmin(ctx.from.id)) {
		await AdminMessage.send(ctx);
	}
});

export default requestGettingTable;
