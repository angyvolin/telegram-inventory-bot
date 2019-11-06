import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';

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
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	await ctx.replyWithMarkdown('Введите необходимое значение (просто число)', keyboard);
});

getItemCount.on('text', async (ctx: any) => {
	const keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back')]).extra();
	const nums = ctx.message.text.match(/^[0-9]*[.,]?[0-9]+$/);
	if (nums && nums.length) {
		const amount = +nums[0].replace(',', '.');
		const { type, id, itemAmount } = ctx.session.selectedItem;

		if (amount > 0 && (amount <= itemAmount || !ctx.session.hasLimits)) {
			let isPresent = false;
			let isExceed = false;
			ctx.session.items.forEach((item, index) => {
				if (item.type === type && item.id === id) {
					if (item.amount + amount > itemAmount && ctx.session.hasLimits) {
						isExceed = true;
						return;
					}
					ctx.session.items[index].amount += amount;
					isPresent = true;
				}
			});

			if (isExceed) {
				return ctx.reply(
					'Недопустимое значение (превышение кол-ва в наличии либо отрицательное число).\nПопробуйте снова',
					keyboard
				);
			}

			if (!isPresent) {
				const item = {
					type,
					id,
					amount
				};
				if (ctx.session.dontPush) {
					ctx.session.currentItem = item;
					ctx.session.dontPush = false;
				} else {
					ctx.session.items.push(item);
				}
			}
			/*
			 * Добавить переход на следующую сцену в зависимости от контекста и роли
			 */
			await ctx.scene.enter(ctx.session.nextScene);
		} else {
			await ctx.reply(
				'Недопустимое значение (превышение кол-ва в наличии либо отрицательное число).\nПопробуйте снова',
				keyboard
			);
			// await ctx.scene.reenter();
		}
	} else {
		await ctx.reply('Не удалось определить значение.\nПопробуйте снова', keyboard);
		// await ctx.scene.reenter();
	}
});

getItemCount.action('back', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.enter(ctx.session.baseScene);
});

getItemCount.action('exit', async (ctx: any) => {
	await ctx.answerCbQuery();
	await ctx.scene.leave();
	return KeyboardMessage.send(ctx, PersonType.WORKER);
});

export default getItemCount;
