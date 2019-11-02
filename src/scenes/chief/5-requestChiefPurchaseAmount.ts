import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestChiefPurchaseAmount = new Scene('chief/requestChiefPurchaseAmount');

requestChiefPurchaseAmount.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.CHIEF);
	ctx.session = {};
});

// Точка входа в сцену
requestChiefPurchaseAmount.enter(async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'exit')]).extra();
	await ctx.reply('Введите количество, которое вы хотите закупить', keyboard);
});

requestChiefPurchaseAmount.on('text', async (ctx: any) => {
	const nums = ctx.message.text.match(/^[0-9]*[.,]?[0-9]+$/);
	if (nums && nums.length) {
		await ctx.scene.leave();
		// Convert nums to string and save in session
		ctx.session.currentItem.amount = +nums;
		let isPresent = false;
		ctx.session.absent.forEach((item, index) => {
			if (item.name === ctx.session.currentItem.name) {
				ctx.session.absent[index].amount += ctx.session.currentItem.amount;
				isPresent = true;
			}
		});
		// Такой позиции еще не было в запросе
		if (!isPresent) {
			// Добавляем позицию в массив
			ctx.session.absent.push(ctx.session.currentItem);
		}
		// Переходим к сцене запроса следующих позиций
		await ctx.scene.enter('chief/requestChiefPurchaseMore');
	} else {
		await ctx.reply('Не удалось определить значение.\nПопробуйте снова');
	}
});

requestChiefPurchaseAmount.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	await ctx.scene.enter('chief/requestChiefPurchaseMeasure');
});

export default requestChiefPurchaseAmount;
