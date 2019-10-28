import ItemType from '../enums/ItemType';
import { getItem } from './items';
import { getCell } from './cells';

/**
 * @desc Составляет сообщение со списком позиций
 * и ихним размещением на складе (номерами ячеек)
 */
export async function getCellsMessage(items: { name: string, cellName: string }[]) {
	let message = '';
	for (const item of items) {
		if (!item.cellName) {
			message += `🔸 ${item.name} -> вне ячейки\n`;
		} else {
			message += `🔸 ${item.name} -> ${item.cellName}\n`;
		}
	}
	return message;
}

/**
 * @desc Составляет сообщение со списком позиций
 * и ихним количеством в наличии
 */
export async function getItemsMessage(items: { type: ItemType; id: string; amount: number }[]): Promise<string> {
	let message = '';
	for (let item of items) {
		const { id, type, amount } = item;
		const { name } = await getItem(type, id);

		message += `🔹 ${name} -> ${amount} шт.\n`;
	}
	return message;
}

export async function getItemsCellsMessage(items: { type: ItemType; id: string; amount: number }[]): Promise<string> {
	let message = '';
	for (let item of items) {
		const { id, type, amount } = item; // Берем поля текущей позиции
		const { name } = await getItem(type, id); // Получаем имя позиции из БД
		const cell = await getCell(type, id); // Получаем номер ячейки
		// Составляем размещение позиции на складе (номер ячейки)
		const cellName = cell ? 'ячейка ' + cell.row + cell.col : 'вне ячейки'; 
		// Добавляем позицию как строку к сообщению
		message += `🔹 ${name} -> ${amount} шт. (${cellName})\n`;
	}
	return message;
}

export async function getItemsPriceMessage(items: { type: ItemType; id: string; amount: number, price: string }[]): Promise<string> {
	let message = '';
	for (let item of items) {
		const { id, type, amount, price } = item; // Берем поля текущей позиции
		const { name } = await getItem(type, id); // Получаем имя позиции из БД
		// Добавляем позицию как строку к сообщению
		message += `🔹 ${name} -> ${amount} шт. (${price}/шт.)\n`;
	}
	return message;
}

/**
 * @desc Составляет сообщение кладовщику для
 * запроса на получение позиций работником
 */
export async function getGettingMessage(username: string,
										items: { type: ItemType, id: string, amount: number }[],
										days?: number): Promise<string> {
	let message = `*Работник* @${username} хочет получить следующие позиции:\n`;
	message += await getItemsCellsMessage(items);
	if (days) { // Есть срок получения
		message += `*Срок аренды:* ${days} дней`; // Добавляем срок к сообщению
	}
	return message;
}

/**
 * @desc Составляет сообщение кладовщику для
 * запроса на возврат позиций работником
 */
export async function getReturnMessage(username: string,
									   items: { type: ItemType, id: string, amount: number }[],
									  ): Promise<string> {
	let message = `*Работник* @${username} желает вернуть позиции на склад:\n`;
	message += await getItemsCellsMessage(items);
	return message;
}

/**
 * @desc Составляет сообщение админу для
 * запроса на списание инструментов работником
 */
export async function getRemoveMessage(username: string,
									   items: { type: ItemType, id: string, amount: number }[],
									  ): Promise<string> {
	let message = `*Работник* @${username} желает списать инструменты:\n`;
	message += await getItemsMessage(items);
	return message;
}

/**
 * @desc Составляет сообщение админу для
 * запроса на закупку позиций снабженцем
 */
export async function getPurchaseMessage(username: string,
									   items: { type: ItemType; id: string; amount: number, price: string }[]
									  ): Promise<string> {
	let message = `*Поставщик* @${username} хочет закупить следующие позиции:\n`;
	message += await getItemsPriceMessage(items);
	return message;
}

/**
 * @desc Составляет сообщение кладовщику для
 * запроса на поставку позиций снабженцем
 */
export async function getSupplyMessage(username: string,
									   items: { type: ItemType; id: string; amount: number }[]
									  ): Promise<string> {
	let message = `*Поставщик* @${username} хочет поставить следующие позиции:\n`;
	message += await getItemsCellsMessage(items);
	return message;
}