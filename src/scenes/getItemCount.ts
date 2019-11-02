import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const getItemCount = new Scene('getItemCount');

getItemCount.command('start', async (ctx: any) => {
	await ctx.scene.leave();
	await KeyboardMessage.send(ctx, PersonType.WORKER);
	ctx.session = {};
});

// Точка входа в сцену
getItemCount.enter(async (ctx: any) => {
	await ctx.replyWithMarkdown('Введите необходимое значение (просто число)');
});

getItemCount.on('text', async (ctx: any) => {
	const nums = ctx.message.text.match(/^[0-9]*[.,]?[0-9]+$/);
	if (nums && nums.length) {
		const amount = nums[0].replace(',', '.');
		const {type, id, itemAmount} = ctx.session.selectedItem;

		if (amount > 0 && amount <= itemAmount) {
			let isPresent = false;
			ctx.session.items.forEach((item, index) => {
				if (item.type === type && item.id === id) {
					ctx.session.items[index].amount += amount;
					isPresent = true;
				}
			});

			if (!isPresent) {
				const item = {
					type,
					id,
					amount
				};
				ctx.session.items.push(item);
			}
			/*
			* Добавить переход на следующую сцену в зависимости от контекста и роли
			* */
			await ctx.scene.enter('worker/requestMoreItems');
		} else {
			await ctx.reply('Недопустимое значение.\nПопробуйте снова');
			await ctx.scene.reenter();
		}
	} else {
		await ctx.reply('Не удалось определить значение.\nПопробуйте снова');
		await ctx.scene.reenter();
	}
});

getItemCount.action('back', async (ctx: any) => {
	await ctx.scene.reenter();
});

getItemCount.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default getItemCount;
