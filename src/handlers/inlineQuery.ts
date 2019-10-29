import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import ItemType from '../enums/ItemType';
import { getItem } from '../helpers/items';
import { getPersonType } from '../helpers/persons';
import { getCell } from '../helpers/cells';

const Markup = require('telegraf/markup');

export default class InlineQueryHandlers {
	public static init(bot: any) {
		bot.inlineQuery(['i', 'move i'], async (ctx) => {
			const items = await Instrument.getAllItems();
			await sendResults(ctx, items);
		});

		bot.inlineQuery('incl_abs i', async (ctx) => {
			const items = await Instrument.getAllItems();
			await sendResults(ctx, items, true);
		});

		bot.inlineQuery(['f', 'move f'], async (ctx) => {
			const items = await Furniture.getAllItems();
			await sendResults(ctx, items);
		});

		bot.inlineQuery('incl_abs f', async (ctx) => {
			const items = await Furniture.getAllItems();
			await sendResults(ctx, items, true);
		});

		bot.inlineQuery(['c', 'move c'], async (ctx) => {
			const items = await Consumable.getAllItems();
			await sendResults(ctx, items);
		});

		bot.inlineQuery('incl_abs c', async (ctx) => {
			const items = await Consumable.getAllItems();
			await sendResults(ctx, items, true);
		});

		bot.on('chosen_inline_result', async (ctx) => {
			/*
			 * ctx.update.chosen_inline_result - { from, query, result_id }
			 * query = i / f / c -> тип выбранной позиции
			 * result_id -> id выбранной позиции
			 */
			const { query } = ctx.update.chosen_inline_result;
			const isMoving = query.includes('move');

			const personType = await getPersonType(ctx.from.username);
			let type;
			switch (query) {
				case 'i':
				case 'move i':
				case 'incl_abs i': {
					type = ItemType.INSTRUMENT;
					break;
				}
				case 'f':
				case 'move f':
				case 'incl_abs f': {
					type = ItemType.FURNITURE;
					break;
				}
				case 'c':
				case 'move c':
				case 'incl_abs c': {
					type = ItemType.CONSUMABLE;
					break;
				}
			}
			const id = ctx.update.chosen_inline_result.result_id;
			const item = await getItem(type, id);

			// Ответ на запрос
			if (!item) {
				return ctx.telegram.sendMessage(ctx.from.id, 'Ошибка на сервере! Позиция не была найдена');
			}
			let keyboard = Markup.inlineKeyboard([
				[
					Markup.callbackButton('➖ 10', `increase>${type}>${id}>${item.amount}>-10`),
					Markup.callbackButton('➖', `increase>${type}>${id}>${item.amount}>-1`),
					Markup.callbackButton('1', 'itemAmount'),
					Markup.callbackButton('➕', `increase>${type}>${id}>${item.amount}>1`),
					Markup.callbackButton('➕ 10', `increase>${type}>${id}>${item.amount}>10`)
				],
				[
					Markup.callbackButton('⏪ Назад', 'back'),
					Markup.callbackButton('✅ Подтвердить', `accept>${type}>${id}>1`)
				]
			]);
			let message = `Название: *${item.name}*\nВ наличии: *${item.amount}*\nОписание: ${item.description}`;

			if (isMoving) {
				const currCell = await getCell(type, item._id.toString());
				message += currCell ? `\nАдрес: *${currCell.row + currCell.col}*` : `\nНаходится вне ячейки`;
				keyboard = Markup.inlineKeyboard([Markup.callbackButton('⏪ Назад', 'back'), Markup.callbackButton('✅ Выбрать', `selectMoveItem>${type}>${id}`)]);
			}
			const options = {
				parse_mode: 'Markdown',
				reply_markup: keyboard,
				caption: message
			};
			if (item.photo) {
				return ctx.telegram.sendPhoto(ctx.from.id, item.photo, options);
			}
			await ctx.telegram.sendMessage(ctx.from.id, message, options);
		});

		const sendResults = async (ctx, items, returnAbsent = false) => {
			const offset = ctx.inlineQuery.offset ? ctx.inlineQuery.offset : '0';
			const portion = 15;

			items.sort((a: any, b: any) => {
				if (a.name > b.name) {
					return 1;
				}
				if (a.name < b.name) {
					return -1;
				}
				return 0;
			});

			let results = [];

			const currItems = items.slice(+offset, +offset + portion);
			const nextOffset = currItems.length === portion ? (+offset + portion).toString() : '';
			const limit = nextOffset !== '' ? +nextOffset : +offset + currItems.length;

			for (let i = +offset; i < limit; i++) {
				let item = items[i];

				if (!returnAbsent && item.amount === 0) {
					continue;
				}

				results.push({
					id: item._id,
					type: 'article',
					title: item.name,
					thumb_url: 'https://res.cloudinary.com/teepublic/image/private/s--Ctrqwzip--/t_Resized%20Artwork/c_fit,g_north_west,h_954,w_954/co_ffffff,e_outline:48/co_ffffff,e_outline:inner_fill:48/co_ffffff,e_outline:48/co_ffffff,e_outline:inner_fill:48/co_bbbbbb,e_outline:3:1000/c_mpad,g_center,h_1260,w_1260/b_rgb:eeeeee/c_limit,f_jpg,h_630,q_90,w_630/v1547854732/production/designs/4034003_0.jpg',
					description: `${item.amount} ${item.measure} в наличии\n${item.description}`,
					input_message_content: {
						message_text: `<b>${item.name} 🔨</b>\n${item.amount} ${item.measure} в наличии\n${item.description}`,
						parse_mode: 'HTML'
					}
				});
			}

			await ctx.answerInlineQuery(results, {
				cache_time: 0,
				next_offset: nextOffset
			});
		};
	}
}
