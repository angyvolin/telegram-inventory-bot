import Person from './Person';
import ItemType from '../enums/ItemType';
import Confirmation from '../models/confirmation';
import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';
import { ItemCells } from './Person';
import { addItem } from '../helpers/items';
import { getCell } from '../helpers/cells';

const Markup = require('telegraf/markup');

export default class Stockman extends Person {
	// Private
	private static async getCellsMessage(items: ItemCells[]) {
		let message = '';
		for (const item of items) {
			const cell = await getCell(item.type, item.id);
			if (!cell) {
				message += `🔸 ${item.name} -> вне ячейки\n`;
			} else {
				message += `🔸 ${item.name} -> ${cell}\n`;
			}
		}
		return message;
	}

	//
	public static async confirmGetting(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);
		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		const keyboard = Markup.inlineKeyboard([[Markup.callbackButton('✅ Получил', `confirmGetting>${id}`)], [Markup.callbackButton('❌ Отклонить получение', `declineGetting>${id}`)]]);
		const text = '✅ Ваша заявка на получение была подтверждена:\n\n' + confirmation.text + '\n❗️После получения подтвердите нажатием кнопки ниже:';
		const options = {
			reply_markup: keyboard
		};

		await ctx.telegram.sendMessage(confirmation.chatId, text, options);
	}

	public static async confirmSupply(ctx: any): Promise<void> {
		const id = ctx.callbackQuery.data.split('>')[1];
		const confirmation = await Confirmation.findById(id);
		const messages = confirmation.messages;

		for (const message of messages) {
			const text = confirmation.text + '\n✅ Подтверждено';
			await ctx.telegram.editMessageText(message.chatId, message.id, message.id, text);
		}

		confirmation.remove();

		const items: ItemCells[] = [];
		if (confirmation.instruments) {
			for (const [id, amount] of confirmation.instruments) {
				addItem(ItemType.INSTRUMENT, id, amount);
				const { name } = await Instrument.findById(id);
				items.push({ type: ItemType.INSTRUMENT, id, name });
			}
		}
		if (confirmation.furniture) {
			for (const [id, amount] of confirmation.furniture) {
				addItem(ItemType.FURNITURE, id, amount);
				const { name } = await Furniture.findById(id);
				items.push({ type: ItemType.FURNITURE, id, name });
			}
		}
		if (confirmation.consumables) {
			for (const [id, amount] of confirmation.consumables) {
				addItem(ItemType.CONSUMABLE, id, amount);
				const { name } = await Consumable.findById(id);
				items.push({ type: ItemType.CONSUMABLE, id, name });
			}
		}

		const text = '✅ Ваша заявка на поставку была подтверждена:\n\n' + confirmation.text;
		await ctx.telegram.sendMessage(confirmation.chatId, text);

		const message = 'Актуальное размещение позиций:\n' + await Stockman.getCellsMessage(items);
		await ctx.reply(message);
	}

	/**
	 * Confirm return
	 * @desc
	 * Смс Worker с подтверждением о возможности вернуть
	 * инструменты, а также кнопкой для подтверждения
	 * возврата
	 */
	public static confirmReturnInstrument(requestId: number): void {
		//...
	}

	public static confirmReturnFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm removing
	 * @desc Запрос на списание инструмента.
	 * Пересылается Admin на согласование
	 */
	public static confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm receipt
	 */
	public static confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
