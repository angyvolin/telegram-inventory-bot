const Markup = require('telegraf/markup');

/**)
 * @desc Отсылает сообщение с позицией и кнопками
 * для изменения количества
 */
export async function sendItem(ctx: any): Promise<void> {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];
	const offset = +ctx.callbackQuery.data.split('>')[4];

	const counter = +ctx.update.callback_query.message.reply_markup.inline_keyboard[0][2].text;

	if (counter + offset >= 1) {
		const keyboard = Markup.inlineKeyboard([
			[
				Markup.callbackButton('➖ 10', `increase>${type}>${id}>${amount}>-10`),
				Markup.callbackButton('➖', `increase>${type}>${id}>${amount}>-1`),
				Markup.callbackButton(counter + offset, `itemAmount>${type}>${id}>${amount}`),
				Markup.callbackButton('➕', `increase>${type}>${id}>${amount}>1`),
				Markup.callbackButton('➕ 10', `increase>${type}>${id}>${amount}>10`)
			],
			[Markup.callbackButton('⌨️ Ввести с клавиатуры', `manualCount>${type}>${id}>${amount}`)],
			[
				Markup.callbackButton('⏪ Назад', 'back'),
				Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + offset}`)
			]
		]);
		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		await ctx.answerCbQuery(`Недопустимое значение`, false);
	}
}

export async function sendItemWithLimits(ctx: any): Promise<void> {
	const type = +ctx.callbackQuery.data.split('>')[1];
	const id = ctx.callbackQuery.data.split('>')[2];
	const amount = +ctx.callbackQuery.data.split('>')[3];
	const offset = +ctx.callbackQuery.data.split('>')[4];

	const counter = +ctx.update.callback_query.message.reply_markup.inline_keyboard[0][2].text;

	if (amount >= counter + offset && counter + offset >= 1) {
		const keyboard = Markup.inlineKeyboard([
			[
				Markup.callbackButton('➖ 10', `increase>${type}>${id}>${amount}>-10`),
				Markup.callbackButton('➖', `increase>${type}>${id}>${amount}>-1`),
				Markup.callbackButton(counter + offset, `itemAmount>${type}>${id}>${amount}`),
				Markup.callbackButton('➕', `increase>${type}>${id}>${amount}>1`),
				Markup.callbackButton('➕ 10', `increase>${type}>${id}>${amount}>10`)
			],
			[Markup.callbackButton('⌨️ Ввести с клавиатуры', `manualCount>${type}>${id}>${amount}`)],
			[
				Markup.callbackButton('⏪ Назад', 'back'),
				Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${counter + offset}`)
			]
		]);
		await ctx.editMessageReplyMarkup(keyboard);
		await ctx.answerCbQuery();
	} else {
		const keyboard = Markup.inlineKeyboard([
			[
				Markup.callbackButton('➖ 10', `increase>${type}>${id}>${amount}>-10`),
				Markup.callbackButton('➖', `increase>${type}>${id}>${amount}>-1`),
				Markup.callbackButton(amount, `itemAmount>${type}>${id}>${amount}`),
				Markup.callbackButton('➕', `increase>${type}>${id}>${amount}>1`),
				Markup.callbackButton('➕ 10', `increase>${type}>${id}>${amount}>10`)
			],
			[
				Markup.callbackButton('⌨️ Ввести с клавиатуры', `manualCount>${type}>${id}>${amount}`)
			],
			[
				Markup.callbackButton('⏪ Назад', 'back'),
				Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>${amount}`)
			]
		]);
		try {
			await ctx.editMessageReplyMarkup(keyboard);
		} catch {
		}
		await ctx.answerCbQuery(`Недопустимое значение`, false);
	}
}
